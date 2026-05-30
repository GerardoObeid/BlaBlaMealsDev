import express from 'express';
import { getDb } from '../db/db.js';
import { authMiddleware } from '../middleware.js';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const userId = req.userId;

        // 1. Fetch user's basic info
        const userStmt = db.prepare(`SELECT first_name, last_name, bio, dietary_prefs, rating FROM users WHERE id = ?`);
        const userData = userStmt.get(userId);

        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Count the number of meals attended (bookings where the user is a guest)
        const mealsStmt = db.prepare(`SELECT COUNT(*) as count FROM bookings as b JOIN events e ON e.id = b.event_id WHERE b.guest_id = ? AND b.status = 'confirmed' AND e.datetime < datetime('now') `);
        const mealsAttended = mealsStmt.get(userId).count;

        // 3. Count the number of meals hosted 
        const hostedEventsStmt = db.prepare(`SELECT COUNT(DISTINCT e.id) as count FROM events e JOIN meals m ON e.meal_id = m.id JOIN bookings b ON b.event_id = e.id WHERE m.host_id = ? AND b.status = 'confirmed' AND e.datetime < datetime('now')`);
        const hostedEventsCount = hostedEventsStmt.get(userId).count;


        // 4. Count the number of attended meals
        const attendedMealsStmt = db.prepare(`
            SELECT 
                u.first_name as hostFirstName, 
                u.last_name as hostLastName,
                e.datetime as eventDate,
                e.location_address as eventAddress,
                m.title as mealTitle
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            JOIN meals m ON e.meal_id = m.id
            JOIN users u ON m.host_id = u.id
            WHERE b.guest_id = ? AND b.status = 'confirmed' AND e.datetime < datetime('now')
            ORDER BY e.datetime DESC
        `);
        const attendedMealsList = attendedMealsStmt.all(userId);

        // 5. Retrieve user's reviews on their meals
        const receivedReviewsStmt = db.prepare(`
            SELECT 
                r.rating, 
                r.comment, 
                u.first_name as reviewerFirstName, 
                u.last_name as reviewerLastName, 
                e.datetime as eventDate
            FROM ratings r
            JOIN bookings b ON r.booking_id = b.id
            JOIN events e ON b.event_id = e.id
            JOIN meals m ON e.meal_id = m.id
            JOIN users u ON r.reviewer_id = u.id
            WHERE m.host_id = ?
            ORDER BY e.datetime DESC
        `);
        const receivedReviewsList = receivedReviewsStmt.all(userId);
        

        // 6. Automate user's rating
        let averageRating = 0;
        if (receivedReviewsList.length > 0) {
            // Sum all ratings from the receivedReviewsList
            const totalRating = receivedReviewsList.reduce((sum, review) => sum + review.rating, 0);
            
            // Calculate average and round to 1 decimal place (e.g., 4.5)
            averageRating = Math.round((totalRating / receivedReviewsList.length) * 10) / 10;
            
            // Keep the users table synchronized with this new average
            const updateRatingStmt = db.prepare(`UPDATE users SET rating = ? WHERE id = ?`);
            updateRatingStmt.run(averageRating, userId);
        }

        // Set the freshly computed rating to be returned to the frontend
        userData.rating = averageRating;


        return res.status(200).json({
            user: userData,
            stats: {
                mealsAttended: mealsAttended,
                hostedEvents: hostedEventsCount
            },
            attendedMeals : attendedMealsList,
            receivedReviews : receivedReviewsList
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ message: 'Internal server error while fetching profile' });
    }
});

// PUT /api/users/profile (NEW: Updates the user's bio)
router.put('/profile', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const userId = req.userId;
        const { bio } = req.body; // Extract the new bio from the frontend request

        const updateStmt = db.prepare(`UPDATE users SET bio = ? WHERE id = ?`);
        updateStmt.run(bio, userId);

        return res.status(200).json({ message: 'Bio updated successfully', bio });
    } catch (error) {
        console.error('Error updating bio:', error);
        return res.status(500).json({ message: 'Internal server error while updating bio' });
    }
});

// GET /api/users/dashboard
// Fetches all necessary data for the host dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const userId = req.userId;

        

        // 3. PLANNED MEALS (Upcoming events the user is hosting)
        const plannedMealsStmt = db.prepare(`
            SELECT 
                e.id as eventId,
                e.datetime,
                m.title as mealTitle,
                m.image_url as mealImage
            FROM events e
            JOIN meals m ON e.meal_id = m.id
            WHERE m.host_id = ? AND e.datetime >= datetime('now')
            ORDER BY e.datetime ASC
            LIMIT 4
        `);
        const plannedMeals = plannedMealsStmt.all(userId);

        
        // 4. NOTIFICATIONS (Unread notifications from the notifications table)
        const notificationsStmt = db.prepare(`
            SELECT id, title, message, created_at, related_entity_type 
            FROM notifications 
            WHERE user_id = ? AND is_read = 0 
            ORDER BY created_at DESC 
            LIMIT 15
        `);
        const notifications = notificationsStmt.all(userId);

        return res.status(200).json({
            plannedMeals: plannedMeals,
            notifications: notifications
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return res.status(500).json({ message: 'Internal server error while fetching dashboard' });
    }
});


// PUT /api/users/notifications/:id/read
// Marks a specific notification as read so it disappears from the dashboard
router.put('/notifications/:id/read', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const userId = req.userId;
        const notificationId = req.params.id;

        const updateStmt = db.prepare(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`);
        const result = updateStmt.run(notificationId, userId);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Notification not found or unauthorized' });
        }

        return res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json({ message: 'Internal server error while updating notification' });
    }
});

export default router;
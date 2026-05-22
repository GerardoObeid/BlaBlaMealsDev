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

export default router;
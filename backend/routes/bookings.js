import express from 'express';
import { getDb } from '../db/db.js';
import { authMiddleware } from '../middleware.js';

const router = express.Router();

// GET /api/bookings
// Fetch all bookings for the currently authenticated guest
router.get('/', authMiddleware, (req, res) => {
    try {
        const db = getDb();
        const userId = req.userId;

        // Join bookings, events, meals, and host details
        const stmt = db.prepare(`
            SELECT 
                b.id as bookingId,
                b.status,
                b.guest_count as guestCount,
                e.datetime as eventDate,
                e.location_address as location,
                m.title as mealTitle,
                m.description as mealDescription,
                m.ingredients,
                u.first_name as hostFirstName,
                u.last_name as hostLastName,
                u.profile_pic_url as hostProfilePic
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            JOIN meals m ON e.meal_id = m.id
            JOIN users u ON m.host_id = u.id
            WHERE b.guest_id = ?
            ORDER BY e.datetime DESC
        `);
        
        const bookings = stmt.all(userId);
        return res.status(200).json(bookings);

    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ message: 'Internal server error while fetching bookings' });
    }
});

export default router;
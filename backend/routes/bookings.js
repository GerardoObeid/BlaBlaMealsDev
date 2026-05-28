import express from 'express';
import { getDb } from '../db/db.js';
import { authMiddleware } from '../middleware.js';
import { authenticateToken } from './auth.js';

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

// POST /api/bookings
// Create a new booking for the authenticated user
router.post('/', authenticateToken, (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;
        const db = getDb();

        if (!eventId) {
            return res.status(400).json({ message: 'eventId is required' });
        }

        // 1. Validate event exists and has available seats
        const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (event.available_seats < 1) {
            return res.status(400).json({ message: 'No seats available for this event' });
        }

        // 2. Prevent self-booking (user is the host of the meal)
        const meal = db.prepare('SELECT host_id FROM meals WHERE id = ?').get(event.meal_id);
        if (meal && meal.host_id === userId) {
            return res.status(403).json({ message: 'You cannot book your own event' });
        }

        // 3. Atomic transaction: insert booking + decrement available seats
        const bookTransaction = db.transaction(() => {
            db.prepare(
                'INSERT INTO bookings (event_id, guest_id, guest_count, status) VALUES (?, ?, 1, ?)'
            ).run(eventId, userId, 'confirmed');

            db.prepare(
                'UPDATE events SET available_seats = available_seats - 1 WHERE id = ?'
            ).run(eventId);
        });

        bookTransaction();

        // Fetch the created booking to return
        const booking = db.prepare(
            'SELECT * FROM bookings WHERE event_id = ? AND guest_id = ?'
        ).get(eventId, userId);

        return res.status(201).json({ booking });

    } catch (error) {
        // Handle UNIQUE constraint violation (duplicate booking)
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ message: 'You have already booked this event' });
        }
        console.error('Error creating booking:', error);
        return res.status(500).json({ message: 'Internal server error while creating booking' });
    }
});

// DELETE /api/bookings/:id
// Cancel a booking and restore the available seat
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id;
        const db = getDb();

        // Verify the booking exists and belongs to the user
        const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND guest_id = ?').get(bookingId, userId);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        // Atomic transaction: delete booking + increment available seats
        const cancelTransaction = db.transaction(() => {
            db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
            db.prepare('UPDATE events SET available_seats = available_seats + 1 WHERE id = ?').run(booking.event_id);
        });

        cancelTransaction();

        return res.status(200).json({ message: 'Booking cancelled successfully' });

    } catch (error) {
        console.error('Error cancelling booking:', error);
        return res.status(500).json({ message: 'Internal server error while cancelling booking' });
    }
});

export default router;
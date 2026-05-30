import express from "express";
import jwt from "jsonwebtoken";
import { getDb } from "../db/db.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// PUBLIC search endpoint — no authentication required (discovery feature)
// If a valid token is present, exclude events the user has already booked.
router.get("/search", (req, res) => {
  try {
    const { date, time, people, cuisine } = req.query;
    const db = getDb();

    // Optional auth: try to extract userId from token (no 401 on failure)
    let userId = null;
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
          userId = decoded.sub;
        } catch {
          // Invalid/expired token — silently ignore, treat as public
        }
      }
    }

    let sql = `
      SELECT
        e.id AS event_id,
        e.datetime,
        e.location_address,
        e.latitude,
        e.longitude,
        e.max_guests,
        e.available_seats,
        e.price,
        m.id AS meal_id,
        m.title AS meal_title,
        m.cuisine,
        m.description,
        m.image_url,
        u.first_name AS host_first_name,
        u.last_name AS host_last_name
      FROM events e
      JOIN meals m ON e.meal_id = m.id
      JOIN users u ON m.host_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // If authenticated, exclude events the user has already booked or created
    if (userId) {
      sql += ` AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.event_id = e.id AND b.guest_id = ? AND b.status = 'confirmed'
      ) AND u.id != ?`;
      params.push(userId, userId);
    }

    // Date filter: match events on this specific day
    if (date) {
      sql += ` AND date(e.datetime) = ?`;
      params.push(date);
    }

    // Time filter: show events starting from selected hour up to +4 hours forward
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = Math.min(startMinutes + 4 * 60, 23 * 60 + 59); // Cap at 23:59

      const startTime = `${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:${String(startMinutes % 60).padStart(2, "0")}`;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

      sql += ` AND strftime('%H:%M', e.datetime) >= ? AND strftime('%H:%M', e.datetime) <= ?`;
      params.push(startTime, endTime);
    }

    // People filter: require enough available seats
    if (people) {
      const peopleCount = parseInt(people, 10);
      if (!isNaN(peopleCount) && peopleCount > 0) {
        sql += ` AND e.available_seats >= ?`;
        params.push(peopleCount);
      }
    }

    // Cuisine filter: only applied when a specific cuisine is selected
    if (cuisine && cuisine.trim() !== "") {
      sql += ` AND m.cuisine = ?`;
      params.push(cuisine);
    }

    sql += ` ORDER BY e.datetime ASC`;

    const events = db.prepare(sql).all(...params);
    return res.status(200).json({ events });
  } catch (error) {
    console.error("Error searching events:", error);
    return res.status(500).json({ message: "Error searching events" });
  }
});

router.post("/", authenticateToken, (req, res) => {
  const {
    mealId,
    datetime,
    locationAddress,
    maxGuests,
    availableSeats,
    price,
    latitude,
    longitude,
  } = req.body;

  try {
    if (
      !mealId ||
      !datetime ||
      !locationAddress ||
      maxGuests === undefined ||
      price === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const db = getDb();

    const meal = db.prepare("SELECT * FROM meals WHERE id = ?").get(mealId);
    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    const stmt = db.prepare(`
      INSERT INTO events (meal_id, datetime, location_address, max_guests, available_seats, price, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      mealId,
      datetime,
      locationAddress,
      maxGuests,
      availableSeats || maxGuests,
      price,
      latitude || null,
      longitude || null,
    );

    return res.status(201).json({
      event: {
        id: result.lastInsertRowid,
        mealId,
        datetime,
        locationAddress,
        maxGuests,
        availableSeats: availableSeats || maxGuests,
        price,
        latitude,
        longitude,
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Error creating event" });
  }
});

router.get("/user/events", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const events = db
      .prepare(
        `
      SELECT e.*, m.title as meal_title
      FROM events e
      JOIN meals m ON e.meal_id = m.id
      WHERE m.host_id = ?
    `,
      )
      .all(req.user.id);

    return res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching user events:", error);
    return res.status(500).json({ message: "Error fetching events" });
  }
});

router.put("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { max_guests, price, location_address, datetime } = req.body;

  try {
    const db = getDb();

    const event = db
      .prepare(
        "SELECT e.*, m.host_id FROM events e JOIN meals m ON e.meal_id = m.id WHERE e.id = ?",
      )
      .get(id);
    if (!event || event.host_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (price !== undefined && price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    // Validation: Prevent lowering max_guests below the number of currently booked seats
    if (
      max_guests !== undefined &&
      max_guests < event.max_guests - event.available_seats
    ) {
      return res.status(400).json({
        message:
          "Cannot reduce max guests below the number of currently booked seats",
      });
    }

    // DB Trigger automatically adjusts available_seats based on the max_guests difference
    const stmt = db.prepare(`
      UPDATE events
      SET max_guests = COALESCE(?, max_guests), 
          price = COALESCE(?, price), 
          location_address = COALESCE(?, location_address), 
          datetime = COALESCE(?, datetime)
      WHERE id = ?
    `);

    stmt.run(max_guests, price, location_address, datetime, id);

    return res.status(200).json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Error updating event" });
  }
});

router.delete("/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const db = getDb();

    const event = db
      .prepare(
        "SELECT e.*, m.host_id FROM events e JOIN meals m ON e.meal_id = m.id WHERE e.id = ?",
      )
      .get(id);
    if (!event || event.host_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    db.prepare("DELETE FROM events WHERE id = ?").run(id);

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Error deleting event" });
  }
});

// GET /api/events/:id/guests - Get all guests for a specific event
router.get("/:id/guests", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const eventId = req.params.id;

    // Verify user is the host
    const event = db
      .prepare(
        "SELECT m.host_id FROM events e JOIN meals m ON e.meal_id = m.id WHERE e.id = ?",
      )
      .get(eventId);
    if (!event || event.host_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Includes b.guest_count for frontend
    const guests = db
      .prepare(
        `
      SELECT b.id as booking_id, b.guest_count, u.id as user_id, u.first_name, u.last_name
      FROM bookings b
      JOIN users u ON b.guest_id = u.id
      WHERE b.event_id = ? AND b.status = 'confirmed'
    `,
      )
      .all(eventId);

    return res.status(200).json({ guests });
  } catch (error) {
    console.error("Error fetching guests:", error);
    return res.status(500).json({ message: "Error fetching guests" });
  }
});

// DELETE /api/events/:eventId/guests/:bookingId - Host removes a guest
router.delete("/:eventId/guests/:bookingId", authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { eventId, bookingId } = req.params;

    // Verify user is the host
    const event = db
      .prepare(
        "SELECT m.host_id FROM events e JOIN meals m ON e.meal_id = m.id WHERE e.id = ?",
      )
      .get(eventId);
    if (!event || event.host_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete booking and trigger notification (DB trigger automatically adds the seat back)
    const cancelTransaction = db.transaction(() => {
      const booking = db
        .prepare("SELECT * FROM bookings WHERE id = ? AND event_id = ?")
        .get(bookingId, eventId);
      if (booking) {
        db.prepare("DELETE FROM bookings WHERE id = ?").run(bookingId);

        // Notification for the Guest (Host cancelled the booking)
        db.prepare(
          `INSERT INTO notifications (user_id, notification_type, title, message, related_entity_id, related_entity_type) 
             VALUES (?, 'booking_cancelled_by_host', 'Booking Cancelled', 'The host has cancelled your booking.', ?, 'event')`,
        ).run(booking.guest_id, eventId);
      }
    });

    cancelTransaction();

    return res.status(200).json({ message: "Guest removed successfully" });
  } catch (error) {
    console.error("Error removing guest:", error);
    return res.status(500).json({ message: "Error removing guest" });
  }
});

export default router;

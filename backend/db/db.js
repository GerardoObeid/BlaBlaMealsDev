import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, 'mealshare.db');

let dbInstance = null;

export function initDb() {
    const db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id integer PRIMARY KEY AUTOINCREMENT,
            first_name text NOT NULL,
            last_name text NOT NULL,
            email text UNIQUE NOT NULL,
            password_hash text NOT NULL,
            profile_pic_url text DEFAULT 'uploads/default.png',
            bio text,
            dietary_prefs text,
            rating real DEFAULT 0.0
        );

        CREATE TABLE IF NOT EXISTS meals (
            id integer PRIMARY KEY AUTOINCREMENT,
            host_id integer NOT NULL,
            title text NOT NULL,
            description text NOT NULL,
            ingredients text NOT NULL,
            allergies_info text,
            image_url text,
            dietary_info text,
            FOREIGN KEY (host_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS events (
            id integer PRIMARY KEY AUTOINCREMENT,
            meal_id integer NOT NULL,
            datetime text NOT NULL,
            location_address text NOT NULL,
            latitude real,
            longitude real,
            max_guests integer DEFAULT 1,
            available_seats integer NOT NULL,
            price real NOT NULL,
            FOREIGN KEY (meal_id) REFERENCES meals(id)
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id integer PRIMARY KEY AUTOINCREMENT,
            event_id integer NOT NULL,
            guest_id integer NOT NULL,
            guest_count integer DEFAULT 1,
            status text CHECK(status in ('confirmed', 'cancelled')) NOT NULL,
            UNIQUE(event_id, guest_id),
            FOREIGN KEY (event_id) REFERENCES events(id),
            FOREIGN KEY (guest_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS ratings (
            id integer PRIMARY KEY AUTOINCREMENT,
            booking_id integer NOT NULL,
            reviewer_id integer NOT NULL,
            rating integer CHECK(rating >= 1 AND rating <= 5) NOT NULL,
            comment text,
            FOREIGN KEY (booking_id) REFERENCES bookings(id),
            FOREIGN KEY (reviewer_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id integer PRIMARY KEY AUTOINCREMENT,
            user_id integer NOT NULL,
            notification_type TEXT NOT NULL,
            title text,
            message text,
            related_entity_id integer,
            related_entity_type text,
            is_read boolean DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        `);

    console.log('✓ Database schema initialized successfully');
    db.close();
}

export function seedTestData() {
    const db = getDb();
    try {
        // Clear existing data safely (in correct dependency order)
        const tables = ['notifications', 'ratings', 'bookings', 'events', 'meals', 'users'];
        for (const table of tables) {
            db.exec(`DELETE FROM ${table}`);
        }
        db.exec("DELETE FROM sqlite_sequence");

        // Hash a default password for the demo
        const passwordHash = bcrypt.hashSync('password', 10);

        // 1. Insert Users
        const insertUser = db.prepare('INSERT INTO users (first_name, last_name, email, password_hash, bio, dietary_prefs) VALUES (?, ?, ?, ?, ?, ?)');
        const insertUserTx = db.transaction((users) => {
            for (const u of users) insertUser.run(u);
        });
        insertUserTx([
            ['Bob', 'Dylan', 'bob@example.com', passwordHash, 'Loves cooking Italian food!', 'None'],
            ['John', 'Lennon', 'john@example.com', passwordHash, 'Asian cuisine enthusiast.', 'Vegetarian'],
            ['Tyrell', 'Wellik', 'tyrell@example.com', passwordHash, 'Always looking for great dinners and new friends.', 'Gluten-Free']
        ]);

        // 2. Insert Meals
        const insertMeal = db.prepare('INSERT INTO meals (host_id, title, description, ingredients) VALUES (?, ?, ?, ?)');
        const insertMealTx = db.transaction((meals) => {
            for (const m of meals) insertMeal.run(m);
        });
        insertMealTx([
            [1, 'Authentic Carbonara', 'A traditional Roman pasta dish made with eggs, pecorino, guanciale, and black pepper. No cream!', 'Pasta, Eggs, Pecorino Romano, Guanciale, Black Pepper'],
            [2, 'Spicy Vegan Pad Thai', 'Classic street food from Thailand with a spicy kick, completely plant-based.', 'Rice Noodles, Tofu, Peanuts, Bean Sprouts, Chili, Tamarind']
        ]);

        // 3. Insert Events
        const insertEvent = db.prepare('INSERT INTO events (meal_id, datetime, location_address, max_guests, available_seats, price) VALUES (?, ?, ?, ?, ?, ?)');
        const insertEventTx = db.transaction((events) => {
            for (const e of events) insertEvent.run(e);
        });
        insertEventTx([
            [1, '2026-06-01 20:00:00', '123 Pasta Street', 4, 1, 15.50],
            [2, '2026-06-05 19:30:00', '456 Noodle Ave', 6, 6, 12.00]
        ]);

        // 4. Insert Bookings
        const insertBooking = db.prepare('INSERT INTO bookings (event_id, guest_id, guest_count, status) VALUES (?, ?, ?, ?)');
        const insertBookingTx = db.transaction((bookings) => {
            for (const b of bookings) insertBooking.run(b);
        });
        insertBookingTx([
            [1, 2, 2, 'confirmed'], // John books 2 seats for Bob's event
            [1, 3, 1, 'confirmed']  // Tyrell books 1 seat for Bob's event
        ]);

        // 5. Insert Ratings
        const insertRating = db.prepare('INSERT INTO ratings (booking_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)');
        const insertRatingTx = db.transaction((ratings) => {
            for (const r of ratings) insertRating.run(r);
        });
        insertRatingTx([
            [1, 2, 5, 'Absolutely delicious! Best carbonara I have ever had.'] // John rating Bob
        ]);

        console.log('✓ Database seeded with demo data successfully');
    } catch (error) {
        console.error('Error seeding test data:', error);
    }
}

export function getDb() {
    if (!dbInstance) {
        dbInstance = new Database(DB_PATH);
        dbInstance.pragma('foreign_keys = ON');
    }
    return dbInstance;
}

export function closeDb() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
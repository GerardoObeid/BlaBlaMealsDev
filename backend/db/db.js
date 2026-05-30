import fs from "fs";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH =
  process.env.DB_PATH || path.join(__dirname, "mealshare.db");

let dbInstance = null;

export function initDb() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Created database directory at: ${dbDir}`);
  }
  const db = new Database(DB_PATH);
  db.pragma("foreign_keys = ON");
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
            cuisine text,
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

        -- Trigger 1: Decrease seats when a new booking is inserted
        CREATE TRIGGER IF NOT EXISTS decrease_seats_on_booking
        AFTER INSERT ON bookings
        WHEN NEW.status = 'confirmed'
        BEGIN
            UPDATE events 
            SET available_seats = available_seats - NEW.guest_count
            WHERE id = NEW.event_id;
        END;

        -- Trigger 2: Increase seats when a booking is deleted/cancelled
        CREATE TRIGGER IF NOT EXISTS increase_seats_on_cancel
        AFTER DELETE ON bookings
        WHEN OLD.status = 'confirmed'
        BEGIN
            UPDATE events 
            SET available_seats = available_seats + OLD.guest_count
            WHERE id = OLD.event_id;
        END;

        -- Trigger 3: Adjust seats when a host updates max_guests
        CREATE TRIGGER IF NOT EXISTS adjust_seats_on_max_guests_update
        AFTER UPDATE OF max_guests ON events
        WHEN NEW.max_guests != OLD.max_guests
        BEGIN
            UPDATE events 
            SET available_seats = available_seats + (NEW.max_guests - OLD.max_guests)
            WHERE id = NEW.id;
        END;
        `);

  console.log("✓ Database schema and triggers initialized successfully");
  db.close();
}

export function seedTestData() {
  const db = getDb();
  try {
    const tables = [
      "notifications",
      "ratings",
      "bookings",
      "events",
      "meals",
      "users",
    ];
    for (const table of tables) {
      db.exec(`DELETE FROM ${table}`);
    }
    db.exec("DELETE FROM sqlite_sequence");

    const passwordHash = bcrypt.hashSync("password", 10);

    // 1. Insert Users
    const insertUser = db.prepare(
      "INSERT INTO users (first_name, last_name, email, password_hash, bio, dietary_prefs) VALUES (?, ?, ?, ?, ?, ?)",
    );
    const insertUserTx = db.transaction((users) => {
      for (const u of users) insertUser.run(u);
    });
    insertUserTx([
      [
        "Bob",
        "Dylan",
        "bob@example.com",
        passwordHash,
        "Loves cooking Italian food!",
        "None",
      ],
      [
        "John",
        "Lennon",
        "john@example.com",
        passwordHash,
        "Asian cuisine enthusiast.",
        "Vegetarian",
      ],
      [
        "Tyrell",
        "Wellik",
        "tyrell@example.com",
        passwordHash,
        "Always looking for great dinners and new friends.",
        "Gluten-Free",
      ],
      [
        "Gerardo",
        "Obeid",
        "gerardo@example.com",
        passwordHash,
        "Passionate about local Mediterranean ingredients and full-stack development.",
        "None",
      ],
    ]);

    // 2. Insert Meals
    const insertMeal = db.prepare(
      "INSERT INTO meals (host_id, title, cuisine, description, ingredients) VALUES (?, ?, ?, ?, ?)",
    );
    const insertMealTx = db.transaction((meals) => {
      for (const m of meals) insertMeal.run(m);
    });
    insertMealTx([
      [
        1,
        "Authentic Carbonara",
        "Italian",
        "A traditional Roman pasta dish made with eggs, pecorino, guanciale, and black pepper. No cream!",
        "Pasta, Eggs, Pecorino Romano, Guanciale, Black Pepper",
      ],
      [
        2,
        "Spicy Vegan Pad Thai",
        "Asian",
        "Classic street food from Thailand with a spicy kick, completely plant-based.",
        "Rice Noodles, Tofu, Peanuts, Bean Sprouts, Chili, Tamarind",
      ],
      [
        3,
        "Classic French Ratatouille",
        "French",
        "A hearty Provencal stew of summer vegetables. Served with crusty baguette.",
        "Eggplant, Zucchini, Bell Peppers, Tomatoes, Herbs de Provence",
      ],
      [
        1,
        "Homemade Margherita Pizza",
        "Italian",
        "Wood-fired style pizza with fresh mozzarella, San Marzano tomatoes, and basil.",
        "Flour, Yeast, San Marzano Tomatoes, Mozzarella, Fresh Basil",
      ],
      [
        2,
        "Sushi Platter Experience",
        "Asian",
        "A variety of fresh nigiri and maki rolls made with locally sourced fish.",
        "Sushi Rice, Nori, Salmon, Tuna, Avocado, Soy Sauce",
      ],
      [
        3,
        "Traditional Coq au Vin",
        "French",
        "Chicken braised with wine, lardons, mushrooms, and garlic. A classic!",
        "Chicken, Red Wine, Mushrooms, Bacon, Pearl Onions",
      ],
      [
        4,
        "Traditional Salade Niçoise",
        "French",
        "A classic, refreshing Mediterranean summer salad featuring fresh tuna, hard-boiled eggs, olives, and anchovies.",
        "Tuna, Eggs, Niçoise Olives, Anchovies, Green Beans, Tomatoes, Olive Oil",
      ],
    ]);

    // 3. Insert Events
    const insertEvent = db.prepare(
      "INSERT INTO events (meal_id, datetime, location_address, max_guests, available_seats, price, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const insertEventTx = db.transaction((events) => {
      for (const e of events) insertEvent.run(e);
    });
    insertEventTx([
      [
        1,
        "2026-06-10 20:00:00",
        "15 Rue de la République, Antibes",
        4,
        4,
        15.5,
        43.5807,
        7.1218,
      ],
      [
        2,
        "2026-06-12 19:30:00",
        "8 Boulevard d'Aguillon, Antibes",
        6,
        6,
        12.0,
        43.5812,
        7.1261,
      ],
      [
        3,
        "2026-06-10 19:00:00",
        "Place De Gaulle, Antibes",
        5,
        5,
        18.0,
        43.5822,
        7.1225,
      ],
      [
        4,
        "2026-06-10 19:15:00",
        "Avenue Robert Soleau, Antibes",
        4,
        4,
        14.0,
        43.5835,
        7.1248,
      ],
      [
        5,
        "2026-06-10 19:30:00",
        "Port Vauban, Antibes",
        8,
        8,
        25.0,
        43.5861,
        7.1272,
      ],
      [6, "2026-06-10 19:45:00", "Cap d'Antibes", 6, 6, 30.0, 43.5539, 7.1283],
      [
        1,
        "2026-06-10 19:00:00",
        "Boulevard Édouard Baudoin, Juan-les-Pins",
        5,
        5,
        16.0,
        43.5685,
        7.1122,
      ],
      [
        2,
        "2026-06-10 19:30:00",
        "Avenue Georges Gallice, Juan-les-Pins",
        6,
        6,
        14.0,
        43.5694,
        7.1141,
      ],
      [
        3,
        "2026-06-10 20:00:00",
        "Pinède Gould, Juan-les-Pins",
        10,
        10,
        20.0,
        43.567,
        7.1145,
      ],
      [
        2,
        "2026-06-12 19:30:00",
        "8 Boulevard d'Aguillon, Antibes",
        6,
        6,
        12.0,
        43.5812,
        7.1261,
      ],
      [
        3,
        "2026-06-14 19:00:00",
        "Place De Gaulle, Antibes",
        5,
        5,
        18.0,
        43.5822,
        7.1225,
      ],
      [
        4,
        "2026-06-28 19:15:00",
        "Avenue Robert Soleau, Antibes",
        4,
        4,
        14.0,
        43.5835,
        7.1248,
      ],
      [
        5,
        "2026-07-04 19:30:00",
        "Port Vauban, Antibes",
        8,
        8,
        25.0,
        43.5861,
        7.1272,
      ],
      [6, "2026-07-12 19:45:00", "Cap d'Antibes", 6, 6, 30.0, 43.5539, 7.1283],
      [
        7,
        "2026-07-18 12:30:00",
        "Boulevard Édouard Baudoin, Juan-les-Pins",
        6,
        6,
        16.5,
        43.5685,
        7.1122,
      ],
      [
        7,
        "2026-07-25 20:00:00",
        "Pinède Gould, Juan-les-Pins",
        8,
        8,
        19.0,
        43.567,
        7.1145,
      ],
    ]);

    // 4. Insert Bookings
    const insertBooking = db.prepare(
      "INSERT INTO bookings (event_id, guest_id, guest_count, status) VALUES (?, ?, ?, ?)",
    );
    const insertBookingTx = db.transaction((bookings) => {
      for (const b of bookings) insertBooking.run(b);
    });
    insertBookingTx([
      [1, 2, 2, "confirmed"],
      [1, 3, 1, "confirmed"],
    ]);

    // 5. Insert Ratings
    const insertRating = db.prepare(
      "INSERT INTO ratings (booking_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)",
    );
    const insertRatingTx = db.transaction((ratings) => {
      for (const r of ratings) insertRating.run(r);
    });
    insertRatingTx([
      [1, 2, 5, "Absolutely delicious! Best carbonara I have ever had."],
    ]);

    console.log("✓ Database seeded with demo data successfully");
  } catch (error) {
    console.error("Error seeding test data:", error);
  }
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma("foreign_keys = ON");
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

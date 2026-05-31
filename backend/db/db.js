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

    // 2. Insert Meals (20 meals, 5 per host)
    const insertMeal = db.prepare(
      "INSERT INTO meals (host_id, title, cuisine, description, ingredients) VALUES (?, ?, ?, ?, ?)",
    );
    const insertMealTx = db.transaction((meals) => {
      for (const m of meals) insertMeal.run(m);
    });
    insertMealTx([
      // Bob Dylan's meals (host_id: 1)
      [
        1,
        "Authentic Carbonara",
        "Italian",
        "A traditional Roman pasta dish made with eggs, pecorino, guanciale, and black pepper. No cream!",
        "Pasta, Eggs, Pecorino Romano, Guanciale, Black Pepper",
      ],
      [
        1,
        "Homemade Margherita Pizza",
        "Italian",
        "Wood-fired style pizza with fresh mozzarella, San Marzano tomatoes, and basil.",
        "Flour, Yeast, San Marzano Tomatoes, Mozzarella, Fresh Basil",
      ],
      [
        1,
        "Truffle Risotto",
        "Italian",
        "Creamy Arborio rice with fresh black truffles and aged Parmesan cheese.",
        "Arborio Rice, Black Truffles, Parmesan, White Wine, Shallots, Butter",
      ],
      [
        1,
        "Osso Buco alla Milanese",
        "Italian",
        "Slow-braised veal shanks in white wine with gremolata, served with saffron risotto.",
        "Veal Shanks, White Wine, Carrots, Celery, Saffron, Lemon Zest",
      ],
      [
        1,
        "Eggplant Parmigiana",
        "Italian",
        "Layers of fried eggplant, mozzarella, and tomato sauce baked to perfection.",
        "Eggplant, Mozzarella, San Marzano Tomatoes, Basil, Parmesan, Olive Oil",
      ],

      // John Lennon's meals (host_id: 2)
      [
        2,
        "Spicy Vegan Pad Thai",
        "Asian",
        "Classic street food from Thailand with a spicy kick, completely plant-based.",
        "Rice Noodles, Tofu, Peanuts, Bean Sprouts, Chili, Tamarind",
      ],
      [
        2,
        "Sushi Platter Experience",
        "Asian",
        "A variety of fresh nigiri and maki rolls made with locally sourced fish.",
        "Sushi Rice, Nori, Salmon, Tuna, Avocado, Soy Sauce",
      ],
      [
        2,
        "Korean Bibimbap Bowls",
        "Asian",
        "Colorful mixed rice bowls with sautéed vegetables, gochujang sauce, and a perfect fried egg.",
        "Rice, Spinach, Carrots, Zucchini, Egg, Gochujang, Sesame Oil",
      ],
      [
        2,
        "Vietnamese Pho",
        "Asian",
        "Fragrant beef noodle soup with herbs, bean sprouts, and lime. 12-hour bone broth.",
        "Rice Noodles, Beef Bones, Star Anise, Cinnamon, Thai Basil, Lime",
      ],
      [
        2,
        "Thai Green Curry",
        "Asian",
        "Aromatic coconut curry with vegetables and jasmine rice. Medium spicy.",
        "Coconut Milk, Green Curry Paste, Bamboo Shoots, Thai Basil, Jasmine Rice",
      ],

      // Tyrell Wellik's meals (host_id: 3)
      [
        3,
        "Classic French Ratatouille",
        "French",
        "A hearty Provencal stew of summer vegetables. Served with crusty baguette.",
        "Eggplant, Zucchini, Bell Peppers, Tomatoes, Herbs de Provence",
      ],
      [
        3,
        "Traditional Coq au Vin",
        "French",
        "Chicken braised with wine, lardons, mushrooms, and garlic. A classic!",
        "Chicken, Red Wine, Mushrooms, Bacon, Pearl Onions",
      ],
      [
        3,
        "Bouillabaisse Marseillaise",
        "French",
        "Traditional Provençal fish stew with saffron, rouille, and crusty bread.",
        "Fish Fillets, Mussels, Shrimp, Saffron, Fennel, Tomatoes, Garlic",
      ],
      [
        3,
        "Duck Confit",
        "French",
        "Slow-cooked duck leg with crispy skin, served with Sarladaise potatoes.",
        "Duck Leg, Duck Fat, Garlic, Thyme, Potatoes, Parsley",
      ],
      [
        3,
        "French Onion Soup",
        "French",
        "Rich beef broth with caramelized onions, topped with melted Gruyère crouton.",
        "Onions, Beef Stock, Gruyère Cheese, Baguette, White Wine, Thyme",
      ],

      // Gerardo Obeid's meals (host_id: 4)
      [
        4,
        "Traditional Salade Niçoise",
        "French",
        "A classic, refreshing Mediterranean summer salad featuring fresh tuna, hard-boiled eggs, olives, and anchovies.",
        "Tuna, Eggs, Niçoise Olives, Anchovies, Green Beans, Tomatoes, Olive Oil",
      ],
      [
        4,
        "Paella Valenciana",
        "Spanish",
        "Authentic saffron rice with seafood, chicken, and vegetables, cooked in a traditional paella pan.",
        "Bomba Rice, Saffron, Shrimp, Mussels, Chicken, Bell Peppers, Peas",
      ],
      [
        4,
        "Moroccan Tagine",
        "Mediterranean",
        "Slow-cooked lamb with apricots, almonds, and aromatic spices. Served with couscous.",
        "Lamb, Apricots, Almonds, Cinnamon, Cumin, Couscous, Honey",
      ],
      [
        4,
        "Greek Moussaka",
        "Mediterranean",
        "Layered casserole of eggplant, spiced meat, and creamy béchamel sauce.",
        "Eggplant, Ground Beef, Béchamel, Nutmeg, Tomatoes, Feta Cheese",
      ],
      [
        4,
        "Mediterranean Mezze Platter",
        "Mediterranean",
        "Assortment of hummus, baba ganoush, tabbouleh, falafel, and warm pita bread.",
        "Chickpeas, Eggplant, Bulgur, Parsley, Tahini, Pita Bread, Olive Oil",
      ],
    ]);

    // 3. Insert Events - ADDED MORE EVENTS ON JUNE 10 AT 19:00
    const insertEvent = db.prepare(
      "INSERT INTO events (meal_id, datetime, location_address, max_guests, available_seats, price, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const insertEventTx = db.transaction((events) => {
      for (const e of events) insertEvent.run(e);
    });
    insertEventTx([
      // Past events (May-Early June 2026)
      [
        1,
        "2026-05-10 20:00:00",
        "15 Rue de la République, Antibes",
        4,
        4,
        15.5,
        43.5807,
        7.1218,
      ],
      [
        6,
        "2026-05-12 19:30:00",
        "8 Boulevard d'Aguillon, Antibes",
        6,
        6,
        12.0,
        43.5812,
        7.1261,
      ],
      [
        11,
        "2026-05-15 19:00:00",
        "Place De Gaulle, Antibes",
        5,
        5,
        18.0,
        43.5822,
        7.1225,
      ],
      [
        2,
        "2026-05-17 19:15:00",
        "Avenue Robert Soleau, Antibes",
        4,
        4,
        14.0,
        43.5835,
        7.1248,
      ],
      [
        7,
        "2026-05-20 19:30:00",
        "Port Vauban, Antibes",
        8,
        8,
        25.0,
        43.5861,
        7.1272,
      ],
      [12, "2026-05-22 19:45:00", "Cap d'Antibes", 6, 6, 30.0, 43.5539, 7.1283],
      [
        13,
        "2026-05-25 19:00:00",
        "Boulevard Édouard Baudoin, Juan-les-Pins",
        5,
        5,
        16.0,
        43.5685,
        7.1122,
      ],
      [
        17,
        "2026-05-28 19:30:00",
        "Avenue Georges Gallice, Juan-les-Pins",
        6,
        6,
        14.0,
        43.5694,
        7.1141,
      ],
      [
        8,
        "2026-05-30 20:00:00",
        "Pinède Gould, Juan-les-Pins",
        10,
        10,
        20.0,
        43.567,
        7.1145,
      ],
      [
        16,
        "2026-06-01 19:00:00",
        "Place Nationale, Antibes",
        6,
        6,
        22.0,
        43.581,
        7.122,
      ],
      [
        18,
        "2026-06-03 19:30:00",
        "Rue du Revely, Antibes",
        8,
        8,
        18.5,
        43.5825,
        7.125,
      ],
      [
        9,
        "2026-06-05 19:00:00",
        "Boulevard du Cap, Antibes",
        6,
        6,
        16.0,
        43.583,
        7.119,
      ],
      [
        10,
        "2026-06-07 20:00:00",
        "Avenue de la Libération, Antibes",
        10,
        10,
        15.0,
        43.584,
        7.123,
      ],

      // June 10, 2026 - MULTIPLE EVENTS AT DIFFERENT TIMES INCLUDING 19:00
      [
        1,
        "2026-06-10 19:00:00",
        "15 Rue de la République, Antibes",
        4,
        4,
        15.5,
        43.5807,
        7.1218,
      ], // Bob's Carbonara
      [
        11,
        "2026-06-10 19:00:00",
        "Place De Gaulle, Antibes",
        5,
        5,
        18.0,
        43.5822,
        7.1225,
      ], // Tyrell's Ratatouille
      [
        6,
        "2026-06-10 19:00:00",
        "8 Boulevard d'Aguillon, Antibes",
        6,
        6,
        12.0,
        43.5812,
        7.1261,
      ], // John's Pad Thai
      [
        17,
        "2026-06-10 19:00:00",
        "Boulevard Édouard Baudoin, Juan-les-Pins",
        6,
        6,
        16.5,
        43.5685,
        7.1122,
      ], // Gerardo's Paella
      [
        2,
        "2026-06-10 20:00:00",
        "Avenue Robert Soleau, Antibes",
        4,
        4,
        14.0,
        43.5835,
        7.1248,
      ], // Bob's Pizza
      [
        7,
        "2026-06-10 20:30:00",
        "Port Vauban, Antibes",
        8,
        8,
        25.0,
        43.5861,
        7.1272,
      ], // John's Sushi

      // More future events
      [
        3,
        "2026-06-15 19:00:00",
        "Place De Gaulle, Antibes",
        5,
        5,
        18.0,
        43.5822,
        7.1225,
      ],
      [
        12,
        "2026-06-18 19:15:00",
        "Avenue Robert Soleau, Antibes",
        4,
        4,
        14.0,
        43.5835,
        7.1248,
      ],
      [
        5,
        "2026-06-20 19:30:00",
        "Port Vauban, Antibes",
        8,
        8,
        25.0,
        43.5861,
        7.1272,
      ],
      [14, "2026-06-22 19:45:00", "Cap d'Antibes", 6, 6, 30.0, 43.5539, 7.1283],
      [
        13,
        "2026-06-25 19:00:00",
        "Boulevard Édouard Baudoin, Juan-les-Pins",
        5,
        5,
        16.0,
        43.5685,
        7.1122,
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
        15,
        "2026-06-30 19:30:00",
        "Place De Gaulle, Antibes",
        5,
        5,
        18.0,
        43.5822,
        7.1225,
      ],

      [
        8,
        "2026-07-02 20:00:00",
        "15 Rue de la République, Antibes",
        6,
        6,
        28.0,
        43.5807,
        7.1218,
      ],
      [
        16,
        "2026-07-05 19:00:00",
        "8 Boulevard d'Aguillon, Antibes",
        4,
        4,
        35.0,
        43.5812,
        7.1261,
      ],
      [
        9,
        "2026-07-08 19:30:00",
        "Port Vauban, Antibes",
        8,
        8,
        25.0,
        43.5861,
        7.1272,
      ],
      [10, "2026-07-10 19:45:00", "Cap d'Antibes", 6, 6, 22.0, 43.5539, 7.1283],
      [
        17,
        "2026-07-12 12:30:00",
        "Boulevard Édouard Baudoin, Juan-les-Pins",
        6,
        6,
        16.5,
        43.5685,
        7.1122,
      ],
      [
        18,
        "2026-07-15 20:00:00",
        "Pinède Gould, Juan-les-Pins",
        8,
        8,
        19.0,
        43.567,
        7.1145,
      ],
      [
        11,
        "2026-07-18 19:00:00",
        "Rue du Revely, Antibes",
        8,
        8,
        17.0,
        43.5825,
        7.125,
      ],
      [
        19,
        "2026-07-20 20:00:00",
        "Avenue de la Libération, Antibes",
        10,
        10,
        15.0,
        43.584,
        7.123,
      ],
      [
        20,
        "2026-07-22 19:30:00",
        "Port Vauban, Antibes",
        6,
        6,
        24.0,
        43.5861,
        7.1272,
      ],
      [
        1,
        "2026-07-25 19:00:00",
        "Place Nationale, Antibes",
        8,
        8,
        20.0,
        43.581,
        7.122,
      ],
      [
        2,
        "2026-07-28 20:00:00",
        "Boulevard du Cap, Antibes",
        6,
        6,
        18.0,
        43.583,
        7.119,
      ],
    ]);

    // 4. Insert Bookings - FIXED to respect UNIQUE(event_id, guest_id)
    const insertBooking = db.prepare(
      "INSERT INTO bookings (event_id, guest_id, guest_count, status) VALUES (?, ?, ?, ?)",
    );
    const insertBookingTx = db.transaction((bookings) => {
      for (const b of bookings) insertBooking.run(b);
    });
    insertBookingTx([
      // Past event bookings (events 1-13)
      [1, 2, 2, "confirmed"], // John booked Bob's Carbonara (past)
      [1, 3, 1, "confirmed"], // Tyrell booked Bob's Carbonara (past)
      [2, 3, 2, "confirmed"], // Tyrell booked John's Pad Thai (past)
      [2, 4, 1, "confirmed"], // Gerardo booked John's Pad Thai (past)
      [3, 4, 2, "confirmed"], // Gerardo booked Tyrell's Ratatouille (past)
      [3, 1, 1, "confirmed"], // Bob booked Tyrell's Ratatouille (past)
      [4, 2, 2, "confirmed"], // John booked Bob's Pizza (past)
      [4, 3, 2, "confirmed"], // Tyrell booked Bob's Pizza (past)
      [5, 1, 3, "confirmed"], // Bob booked John's Sushi (past)
      [5, 4, 2, "confirmed"], // Gerardo booked John's Sushi (past)
      [6, 2, 2, "confirmed"], // John booked Tyrell's Coq au Vin (past)
      [7, 1, 1, "confirmed"], // Bob booked Tyrell's Bouillabaisse (past)
      [8, 3, 2, "confirmed"], // Tyrell booked Gerardo's Paella (past)
      [9, 2, 3, "confirmed"], // John booked Gerardo's Tagine (past)
      [9, 4, 2, "confirmed"], // Gerardo booked own Tagine (past)
      [10, 1, 2, "confirmed"], // Bob booked Tyrell's Duck Confit (past)
      [11, 3, 1, "confirmed"], // Tyrell booked John's Bibimbap (past)
      [12, 4, 2, "confirmed"], // Gerardo booked John's Pho (past)
      [13, 2, 3, "confirmed"], // John booked Bob's Osso Buco (past)

      // June 10 events bookings
      [14, 2, 2, "confirmed"], // John booked Bob's Carbonara (June 10 19:00)
      [15, 4, 2, "confirmed"], // Gerardo booked Tyrell's Ratatouille (June 10 19:00)
      [16, 3, 1, "confirmed"], // Tyrell booked John's Pad Thai (June 10 19:00)
      [17, 1, 2, "confirmed"], // Bob booked Gerardo's Paella (June 10 19:00)
      [18, 3, 2, "confirmed"], // Tyrell booked Bob's Pizza (June 10 20:00)
      [19, 1, 3, "confirmed"], // Bob booked John's Sushi (June 10 20:30)

      // Other future bookings
      [20, 2, 1, "confirmed"], // John booked Bob's Truffle Risotto (June 15)
      [21, 4, 2, "confirmed"], // Gerardo booked Tyrell's Coq au Vin (June 18)
      [22, 3, 2, "confirmed"], // Tyrell booked Bob's Eggplant Parmigiana (June 20)
      [23, 1, 1, "confirmed"], // Bob booked Tyrell's Duck Confit (June 22)
      [24, 4, 3, "confirmed"], // Gerardo booked Tyrell's Bouillabaisse (June 25)
      [25, 2, 2, "confirmed"], // John booked Bob's Osso Buco (June 28)
      [26, 3, 1, "confirmed"], // Tyrell booked Tyrell's French Onion Soup (June 30)

      // Pending bookings
      [27, 1, 1, "confirmed"], // Bob booked John's Korean Bibimbap (July 2)
      [28, 2, 2, "confirmed"], // John booked Gerardo's Salade Niçoise (July 5)
      [29, 4, 2, "confirmed"], // Gerardo booked John's Vietnamese Pho (July 8)
      [30, 3, 3, "confirmed"], // Tyrell booked John's Thai Green Curry (July 10)
    ]);

    // 5. Insert Ratings
    const insertRating = db.prepare(
      "INSERT INTO ratings (booking_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)",
    );
    const insertRatingTx = db.transaction((ratings) => {
      for (const r of ratings) insertRating.run(r);
    });
    insertRatingTx([
      [
        1,
        2,
        5,
        "Absolutely delicious! Best carbonara I have ever had. Bob is an incredible host!",
      ],
      [
        2,
        3,
        4,
        "Great carbonara, but the portion could have been slightly larger. Loved the authentic Italian atmosphere.",
      ],
      [
        3,
        3,
        5,
        "John's vegan Pad Thai is incredible! You wouldn't know it's plant-based. So flavorful!",
      ],
      [
        4,
        4,
        4,
        "Really enjoyed the Pad Thai. Great company and excellent cooking skills, John!",
      ],
      [
        5,
        4,
        5,
        "Tyrell's Ratatouille was a masterpiece! Perfectly seasoned vegetables. A true taste of Provence.",
      ],
      [
        6,
        1,
        4,
        "Excellent Ratatouille! The baguette was fresh and crusty. Would come again!",
      ],
      [
        7,
        2,
        5,
        "Bob's pizza is restaurant quality! The crust was perfectly charred and the toppings were fresh.",
      ],
      [
        8,
        3,
        3,
        "Good pizza, but I prefer a thinner crust. The mozzarella was excellent though.",
      ],
      [
        9,
        1,
        5,
        "The sushi platter was phenomenal! Fresh fish and beautiful presentation. John is a master!",
      ],
      [
        10,
        4,
        5,
        "Outstanding sushi experience! Each piece was crafted with care. Will definitely return.",
      ],
      [
        11,
        2,
        4,
        "Tyrell's Coq au Vin was rich and flavorful. The chicken was tender and the sauce was perfection.",
      ],
      [
        12,
        1,
        5,
        "Bouillabaisse was incredible! The rouille was perfectly garlicky. Felt like I was in Marseille!",
      ],
      [
        13,
        3,
        4,
        "Gerardo's paella was excellent! Saffron was aromatic and the socarrat was perfect.",
      ],
      [
        14,
        2,
        5,
        "The Moroccan Tagine transported me to Marrakech! Perfect balance of sweet and savory. Gerardo is amazing!",
      ],
      [
        15,
        4,
        3,
        "Good tagine, but the couscous was a bit dry. Lovely atmosphere though.",
      ],
      [
        16,
        1,
        5,
        "Tyrell's Duck Confit was absolutely divine! Crispy skin, tender meat. A culinary masterpiece!",
      ],
      [
        17,
        3,
        4,
        "Really enjoyed the Bibimbap! The gochujang sauce had just the right amount of heat.",
      ],
      [
        18,
        4,
        5,
        "Best Pho I've had outside of Vietnam! The broth was incredibly rich and aromatic.",
      ],
      [
        19,
        2,
        4,
        "Bob's Osso Buco was hearty and delicious. The gremolata was a perfect touch. Excellent dinner!",
      ],
    ]);

    // 6. Insert Notifications - FIXED column names
    const insertNotification = db.prepare(
      "INSERT INTO notifications (user_id, notification_type, title, message, related_entity_id, related_entity_type, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    const insertNotificationTx = db.transaction((notifications) => {
      for (const n of notifications) insertNotification.run(n);
    });
    insertNotificationTx([
      // Booking confirmations for hosts
      [
        1,
        "booking_confirmed",
        "New Booking",
        "John Lennon has booked your Authentic Carbonara event on June 10",
        14,
        "event",
        0,
      ],
      [
        1,
        "booking_confirmed",
        "New Booking",
        "Tyrell Wellik has booked your Eggplant Parmigiana event on June 20",
        22,
        "event",
        0,
      ],
      [
        1,
        "new_rating",
        "New Rating",
        "You received a 5-star rating from John Lennon for your Authentic Carbonara",
        1,
        "rating",
        0,
      ],
      [
        1,
        "new_rating",
        "New Rating",
        "You received a 4-star rating from Tyrell Wellik for your Authentic Carbonara",
        2,
        "rating",
        0,
      ],

      [
        2,
        "booking_confirmed",
        "New Booking",
        "Gerardo Obeid has booked your Spicy Vegan Pad Thai event on June 10",
        16,
        "event",
        0,
      ],
      [
        2,
        "new_rating",
        "New Rating",
        "You received a 5-star rating from Tyrell Wellik for your Spicy Vegan Pad Thai",
        3,
        "rating",
        0,
      ],
      [
        2,
        "new_rating",
        "New Rating",
        "You received a 4-star rating from Gerardo Obeid for your Spicy Vegan Pad Thai",
        4,
        "rating",
        0,
      ],

      [
        3,
        "booking_confirmed",
        "New Booking",
        "Gerardo Obeid has booked your Classic French Ratatouille event on June 10",
        15,
        "event",
        0,
      ],
      [
        3,
        "new_rating",
        "New Rating",
        "You received a 5-star rating from Gerardo Obeid for your Classic French Ratatouille",
        5,
        "rating",
        0,
      ],
      [
        3,
        "new_rating",
        "New Rating",
        "You received a 4-star rating from Bob Dylan for your Classic French Ratatouille",
        6,
        "rating",
        0,
      ],

      [
        4,
        "booking_confirmed",
        "New Booking",
        "Bob Dylan has booked your Paella Valenciana event on June 10",
        17,
        "event",
        0,
      ],
      [
        4,
        "new_rating",
        "New Rating",
        "You received a 4-star rating from Tyrell Wellik for your Paella Valenciana",
        13,
        "rating",
        0,
      ],

      // Event reminders
      [
        1,
        "event_reminder",
        "Event Reminder",
        "Reminder: Your Authentic Carbonara event is tomorrow at 19:00",
        14,
        "event",
        0,
      ],
      [
        2,
        "event_reminder",
        "Event Reminder",
        "Reminder: You have a booking at Bob's Authentic Carbonara tomorrow",
        14,
        "event",
        0,
      ],
      [
        3,
        "event_reminder",
        "Event Reminder",
        "Reminder: Your Spicy Vegan Pad Thai event is today at 19:00",
        16,
        "event",
        0,
      ],

      // System notifications
      [
        3,
        "system",
        "Welcome!",
        "Welcome to the platform, Tyrell! Start exploring events near you.",
        null,
        null,
        1,
      ],
      [
        4,
        "system",
        "Welcome!",
        "Welcome to the platform, Gerardo! Start exploring events near you.",
        null,
        null,
        1,
      ],
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

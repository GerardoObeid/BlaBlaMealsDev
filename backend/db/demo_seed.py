"""
This script will be used to populate the database with synthetic data that can be used in the demo
"""
import sqlite3

conn = sqlite3.connect("backend/db/mealshare.db")
c = conn.cursor()

# Enable foreign keys so our DELETE CASCADE and constraints work
c.execute("PRAGMA foreign_keys = ON")

# 1. Clear out old data so the script can be run multiple times safely
tables = ['ratings', 'bookings', 'events', 'meals', 'users']
for table in tables:
    c.execute(f"DELETE FROM {table}")

# Reset the auto-increment counters so IDs start at 1 again
c.execute("DELETE FROM sqlite_sequence")

# 2. Insert Users
users_data = [
    ('Bob Dylan', 'bob@example.com', 'password', 'Loves cooking Italian food!', 'None'),
    ('John Lennon', 'john@example.com', 'password', 'Asian cuisine enthusiast.', 'Vegetarian'),
    ('Tyrell Wellik', 'tyrell@example.com', 'password', 'Always looking for great dinners and new friends.', 'Gluten-Free')
]
c.executemany("""
    INSERT INTO users (name, email, password_hash, bio, dietary_prefs) 
    VALUES (?, ?, ?, ?, ?)
""", users_data)

# 3. Insert Meals (Bob=1, John=2, Tyrell=3)
meals_data = [
    (1, 'Authentic Carbonara', 'A traditional Roman pasta dish made with eggs, pecorino, guanciale, and black pepper. No cream!', 'Pasta, Eggs, Pecorino Romano, Guanciale, Black Pepper'),
    (2, 'Spicy Vegan Pad Thai', 'Classic street food from Thailand with a spicy kick, completely plant-based.', 'Rice Noodles, Tofu, Peanuts, Bean Sprouts, Chili, Tamarind')
]
c.executemany("""
    INSERT INTO meals (host_id, title, description, ingredients) 
    VALUES (?, ?, ?, ?)
""", meals_data)

# 4. Insert Events
events_data = [
    (1, '2026-06-01 20:00:00', 4, 15.50), # Event 1: Bob's Carbonara
    (2, '2026-06-05 19:30:00', 6, 12.00)  # Event 2: John's Pad Thai
]
c.executemany("""
    INSERT INTO events (meal_id, datetime, max_guests, price) 
    VALUES (?, ?, ?, ?)
""", events_data)

# 5. Insert Bookings
bookings_data = [
    (1, 2, 2, 'confirmed'), # Booking 1: John books 2 seats for Bob's event
    (1, 3, 1, 'confirmed')  # Booking 2: Tyrell books 1 seat for Bob's event
]
c.executemany("""
    INSERT INTO bookings (event_id, guest_id, guest_count, status) 
    VALUES (?, ?, ?, ?)
""", bookings_data)

# 6. Insert Ratings
ratings_data = [
    (1, 2, 5, 'Absolutely delicious! Best carbonara I have ever had.') # John rating Bob
]
c.executemany("""
    INSERT INTO ratings (booking_id, reviewer_id, rating, comment) 
    VALUES (?, ?, ?, ?)
""", ratings_data)

# Save and close
conn.commit()
print("✅ Database successfully populated with demo data!")
conn.close()
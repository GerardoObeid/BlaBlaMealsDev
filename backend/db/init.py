import sqlite3

conn = sqlite3.connect("backend/db/mealshare.db")

c = conn.cursor()

# Enable foreign key support
c.execute("""PRAGMA foreign_keys = ON""")

# Users table
c.execute("""CREATE TABLE users (
    id integer PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    profile_pic_url text DEFAULT 'uploads/default.png',
    bio text,
    dietary_prefs text
)""")

# Meals table
c.execute("""CREATE TABLE meals (
    id integer PRIMARY KEY AUTOINCREMENT,
    host_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    ingredients text NOT NULL,
    FOREIGN KEY (host_id) REFERENCES users(id)
)""")

# Events table
c.execute("""CREATE TABLE events (
    id integer PRIMARY KEY AUTOINCREMENT,
    meal_id integer NOT NULL,
    datetime text NOT NULL,
    max_guests integer DEFAULT 1,
    price real NOT NULL,
    FOREIGN KEY (meal_id) REFERENCES meals(id)
)""")

# Bookings table
c.execute("""CREATE TABLE bookings (
    id integer PRIMARY KEY AUTOINCREMENT,
    event_id integer NOT NULL,
    guest_id integer NOT NULL,
    guest_count integer DEFAULT 1,
    status text CHECK(status in ('confirmed', 'cancelled')) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (guest_id) REFERENCES users(id)
)""")

# Ratings table
c.execute("""CREATE TABLE ratings (
    id integer PRIMARY KEY AUTOINCREMENT,
    booking_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    rating integer CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    comment text,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
)""")


conn.commit()
conn.close()
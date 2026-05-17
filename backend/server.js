import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDb, DB_PATH, seedTestData } from './db/db.js';


// ROUTER IMPORTS
import authRoutes from './routes/auth.js';
import mealsRoutes from './routes/meals.js';
import eventsRoutes from './routes/events.js';
import usersRoutes from './routes/users.js';
import bookingsRoutes from './routes/bookings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// LOGGER MIDDLEWARE
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
})

// HEALTH CHECK
app.get('/health', (req, res) => {
    return res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/bookings', bookingsRoutes);

// ERROR HANDLING
app.use((req, res) => {
    return res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
});

try {
    // DB init
    const dbDir = path.join(__dirname, 'db');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(DB_PATH)) {
        initDb();
        seedTestData();
    }

    // App launch
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`
╔════════════════════════════════════════╗
║       MEALSHARE BACKEND RUNNING        ║
╚════════════════════════════════════════╝
🚀 Server: http://localhost:${PORT}
📊 Database: SQLite3 (${DB_PATH})
✅ CORS enabled for frontend on localhost:8000
📝 API Documentation:
   - Auth:     POST /api/auth/signup
               POST /api/auth/login
   - Meals:    GET /api/meals
               POST /api/meals
   - Events:   GET /api/events
               POST /api/events
   - Bookings: POST /api/bookings
   - Users:    GET /api/users/profile
               GET /api/users/dashboard
        `);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
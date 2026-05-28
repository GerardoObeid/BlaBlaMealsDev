import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { initDb, DB_PATH, seedTestData } from "./db/db.js";
import "dotenv/config"; // Loads the .env file automatically

// ROUTER IMPORTS
import authRoutes from "./routes/auth.js";
import mealsRoutes from "./routes/meals.js";
import eventsRoutes from "./routes/events.js";
import usersRoutes from "./routes/users.js";
import bookingsRoutes from "./routes/bookings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// 1. DYNAMIC PORT: Azure assigns process.env.PORT, otherwise use 3000
const PORT = process.env.PORT || 3000;

// 2. DYNAMIC CORS: Allow only the frontend URL specified in the environment
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// LOGGER MIDDLEWARE
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  return res.status(200).send("API Online");
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  return res
    .status(200)
    .json({ status: "OK", timestamp: new Date().toISOString() });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/bookings", bookingsRoutes);

// ERROR HANDLING
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Error:", error);
  return res.status(500).json({ message: "Internal server error" });
});

try {
  // DB init
  const dbDir = path.join(__dirname, "db");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    initDb();
    seedTestData();
  }

  // App launch
  // App launch
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
╔════════════════════════════════════════╗
║       BLABLAMEALS BACKEND RUNNING      ║
╚════════════════════════════════════════╝
 Server Port: ${PORT}
 Database:    SQLite3 (${DB_PATH})
 CORS Origin: ${process.env.FRONTEND_URL || "Any (Warning: Open to all)"}
 API Documentation:
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
  console.error("Failed to start server:", error);
  process.exit(1);
}

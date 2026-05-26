import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { getDb } from "../db/db.js";

dotenv.config();

const router = express.Router();

function generateToken(userId, email, role) {
  return jwt.sign(
    {
      sub: userId,
      email: email,
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "24h" },
  );
}

function validateEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = { id: user.sub, email: user.email };
    next();
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const errors = [];
    if (!email || !validateEmail(email)) {
      errors.push("Invalid email format");
    }
    if (!password || !validatePassword(password)) {
      errors.push("Password must be at least 8 characters");
    }
    if (!firstName || !firstName.trim()) {
      errors.push("First name is required");
    }
    if (!lastName || !lastName.trim()) {
      errors.push("Last name is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const db = getDb();

    try {
      const insertStmt = db.prepare(
        `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES (?, ?, ?, ?)`,
      );
      const result = insertStmt.run(
        email.toLowerCase(),
        passwordHash,
        firstName.trim(),
        lastName.trim(),
      );

      const userId = result.lastInsertRowid;
      const token = generateToken(userId, email, "user");

      return res.status(201).json({
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          role: "user",
        },
        token,
        refreshToken: token,
      });
    } catch (error) {
      if (error.message.includes("UNIQUE")) {
        return res.status(409).json({ message: "Email already exists" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Error creating user" });
  }
});
// Endpoint for user login,
// validates credentials, and returns a JWT token if successful
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = [];
    if (!email || !validateEmail(email)) {
      errors.push("Invalid email format");
    }
    if (!password) {
      errors.push("Password is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const db = getDb();
    const selectStmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
    const user = selectStmt.get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordHash =
      typeof user.password_hash === "string"
        ? user.password_hash
        : user.password_hash.toString();

    const passwordMatch = await bcrypt.compare(password, passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.email, user.role);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token,
      refreshToken: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Database error" });
  }
});

router.post("/logout", (req, res) => {
  return res.status(200).json({ message: "Logout successful" });
});

router.post("/refresh", (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || "secret",
    );
    const token = generateToken(decoded.sub, decoded.email, decoded.role);

    return res.status(200).json({ token, expiresIn: 3600 });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

export default router;

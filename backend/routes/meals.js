import express from "express";
import { getDb } from "../db/db.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

router.post("/", authenticateToken, (req, res) => {
  const {
    title,
    cuisine,
    description,
    ingredients,
    allergiesInfo,
    dietaryInfo,
    imageUrl,
  } = req.body;
  const hostId = req.user.id;

  try {
    if (!title || !cuisine || !description || !ingredients) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO meals (host_id, title, cuisine, description, ingredients, allergies_info, dietary_info, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      hostId,
      title,
      cuisine,
      description,
      ingredients,
      allergiesInfo || null,
      dietaryInfo || null,
      imageUrl || null,
    );

    return res.status(201).json({
      meal: {
        id: result.lastInsertRowid,
        title,
        cuisine,
        description,
        ingredients,
        allergiesInfo,
        dietaryInfo,
        imageUrl,
        hostId,
      },
    });
  } catch (error) {
    console.error("Error creating meal:", error);
    return res.status(500).json({ message: "Error creating meal" });
  }
});

router.get("/user/meals", authenticateToken, (req, res) => {
  const userId = req.user.id;

  try {
    const db = getDb();
    const meals = db
      .prepare("SELECT * FROM meals WHERE host_id = ?")
      .all(userId);

    return res.status(200).json({ meals });
  } catch (error) {
    console.error("Error fetching user meals:", error);
    return res.status(500).json({ message: "Error fetching meals" });
  }
});

router.get("/", (req, res) => {
  try {
    const db = getDb();
    const meals = db.prepare("SELECT * FROM meals").all();

    return res.status(200).json({ meals });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return res.status(500).json({ message: "Error fetching meals" });
  }
});

export default router;

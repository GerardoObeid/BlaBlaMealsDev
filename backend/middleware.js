import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = token.split(" ");
    if (parts.length !== 2) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const decoded = jwt.verify(parts[1], process.env.JWT_SECRET || "secret");
    req.userId = decoded.sub;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

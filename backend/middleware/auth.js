import jwt from "jsonwebtoken";
import { redis } from "../redisClient.js";

const JWT_SECRET = process.env.JWT_SECRET || "todo-secret";

export const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or malformed." });
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload !== "object" || !payload.username) {
      throw new Error("Invalid token payload");
    }

    const username = payload.username;
    const userKey = `user:${username}`;
    const exists = await redis.exists(userKey);
    if (!exists) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = { username };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

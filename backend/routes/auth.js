import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../redisClient.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "todo-secret";
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24; // 24 hours

const buildUserPayload = (username) => ({ username });

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userKey = `user:${username}`;
  const exists = await redis.exists(userKey);
  if (exists) {
    return res.status(409).json({ message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await redis.hSet(userKey, {
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  });
  await redis.sAdd("users", username);

  const token = jwt.sign(buildUserPayload(username), JWT_SECRET, {
    expiresIn: TOKEN_LIFETIME_SECONDS,
  });

  return res.status(201).json({ username, token });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userKey = `user:${username}`;
  const storedPassword = await redis.hGet(userKey, "password");
  if (!storedPassword) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const passwordMatch = await bcrypt.compare(password, storedPassword);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  const token = jwt.sign(buildUserPayload(username), JWT_SECRET, {
    expiresIn: TOKEN_LIFETIME_SECONDS,
  });

  return res.json({ username, token });
});

router.get("/me", async (req, res) => {
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
    return res.json({ username: payload.username });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
});

export default router;

import express from "express";
import { redis } from "../redisClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const username = req.user?.username;
  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const tasksKey = `tasks:${username}`;
  const tasksJson = await redis.get(tasksKey);
  const tasks = tasksJson ? JSON.parse(tasksJson) : [];
  return res.json({ tasks });
});

router.post("/", async (req, res) => {
  const username = req.user?.username;
  const tasks = req.body.tasks;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!Array.isArray(tasks)) {
    return res.status(400).json({ message: "Tasks payload must be an array." });
  }

  const tasksKey = `tasks:${username}`;
  await redis.set(tasksKey, JSON.stringify(tasks));

  return res.json({ tasks });
});

export default router;

import { redis } from "../redisClient.js";

const TASK_RATE_LIMIT = 2;
const TASK_RATE_WINDOW_SECONDS = 30;

export const taskRateLimiter = async (req, res, next) => {
  const username = req.user?.username;
  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const key = `rate:tasks:${username}`;
  const now = Date.now();
  const windowStart = now - TASK_RATE_WINDOW_SECONDS * 1000;

  try {
    await redis.zRemRangeByScore(key, 0, windowStart);
    const requests = await redis.zCard(key);

    if (requests >= TASK_RATE_LIMIT) {
      return res.status(429).json({
        message: `Too many task creations. Please wait ${TASK_RATE_WINDOW_SECONDS} seconds before adding more tasks.`,
      });
    }

    await redis.zAdd(key, {
      score: now,
      member: `${now}:${Math.random().toString(36).slice(2)}`,
    });
    await redis.expire(key, TASK_RATE_WINDOW_SECONDS);

    next();
  } catch (error) {
    console.error("Task rate limiter error", error);
    return res.status(500).json({ message: "Unable to validate rate limit." });
  }
};

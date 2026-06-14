import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Todo backend running on http://localhost:${port}`);
});

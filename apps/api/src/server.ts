import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const __filename = fileURLToPath(import.meta.url);
const __rootDir = resolve(dirname(__filename), "../../..");
dotenv.config({ path: resolve(__rootDir, ".env") });
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import { uploadRouter } from "./routes/upload.js";
import { analyzeRouter } from "./routes/analyze.js";
import { historyRouter } from "./routes/history.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
// Health check (public) — must be before clerkMiddleware
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Must come before any route that calls requireAuth()
app.use(clerkMiddleware());

// Routes
app.use("/api", uploadRouter);
app.use("/api", analyzeRouter);
app.use("/api", historyRouter);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

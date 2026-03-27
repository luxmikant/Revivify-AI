// Environment is loaded by --env-file at the Node CLI level (see package.json scripts)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { uploadRouter } from "./routes/upload.js";
import { analyzeRouter } from "./routes/analyze.js";
import { historyRouter } from "./routes/history.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));

// Health check — public
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes (each route uses extractUserId middleware for auth)
app.use("/api", uploadRouter);
app.use("/api", analyzeRouter);
app.use("/api", historyRouter);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

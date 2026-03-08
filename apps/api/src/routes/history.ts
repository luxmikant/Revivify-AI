import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { pool } from "../lib/supabase.js";

export const historyRouter = Router();

historyRouter.get("/history", requireAuth(), async (req, res) => {
  try {
    const auth = (req as any).auth;
    const clerkUserId = auth?.userId;
    if (!clerkUserId) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    const { rows } = await pool.query(
      `SELECT id, created_at, jd_title, result->>'ats_score' AS ats_score
       FROM analyses
       WHERE clerk_user_id = $1
       ORDER BY created_at DESC`,
      [clerkUserId]
    );

    const analyses = rows.map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      jd_title: row.jd_title,
      ats_score: Number(row.ats_score),
    }));

    res.json({ analyses });
  } catch (err: any) {
    console.error("History error:", err);
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

historyRouter.get("/history/:id", requireAuth(), async (req, res) => {
  try {
    const auth = (req as any).auth;
    const clerkUserId = auth?.userId;
    if (!clerkUserId) {
      res.status(401).json({ error: "UNAUTHORIZED" });
      return;
    }

    const { rows } = await pool.query(
      `SELECT * FROM analyses WHERE id = $1 AND clerk_user_id = $2`,
      [req.params.id, clerkUserId]
    );

    if (!rows[0]) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }

    const data = rows[0];
    res.json({
      id: data.id,
      created_at: data.created_at,
      jd_title: data.jd_title,
      resume_text: data.resume_text,
      jd_text: data.jd_text,
      ...data.result,
    });
  } catch (err: any) {
    console.error("History detail error:", err);
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

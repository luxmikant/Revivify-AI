import { Router } from "express";
import { extractUserId } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

export const historyRouter = Router();

historyRouter.get("/history", extractUserId, async (req, res) => {
  try {
    const clerkUserId = (req as any).clerkUserId as string;

    const { data, error } = await supabase
      .from("analyses")
      .select("id, created_at, jd_title, result")
      .eq("clerk_user_id", clerkUserId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const analyses = (data || []).map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      jd_title: row.jd_title,
      ats_score: Number(row.result?.ats_score ?? 0),
    }));

    res.json({ analyses });
  } catch (err: any) {
    console.error("History error:", err);
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

historyRouter.get("/history/:id", extractUserId, async (req, res) => {
  try {
    const clerkUserId = (req as any).clerkUserId as string;

    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", req.params.id)
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }

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

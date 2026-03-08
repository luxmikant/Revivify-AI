import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { analysisGraph } from "../agents/graph.js";
import { pool } from "../lib/supabase.js";
import { analyzeRequestSchema } from "../../../../packages/shared/src/schemas.js";

export const analyzeRouter = Router();

analyzeRouter.post("/analyze", requireAuth(), async (req, res) => {
  try {
    const auth = (req as any).auth;
    const clerkUserId = auth?.userId;
    if (!clerkUserId) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Authentication required" });
      return;
    }

    // Validate input
    const parsed = analyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        error: "INVALID_INPUT",
        message: "resumeText and jdText are required",
      });
      return;
    }

    const { resumeText, jdText } = parsed.data;

    // Run the LangGraph multi-agent pipeline
    const result = await analysisGraph.invoke({
      resumeText,
      jdText,
    });

    // Build the response
    const analysisResult = {
      ats_score: result.atsScore,
      missing_keywords: result.missingKeywords,
      gap_analysis: result.gapAnalysis,
      hidden_strengths_summary: result.hiddenStrengthsSummary,
      bridge_plan: result.bridgePlan,
    };

    // Extract JD title from the parsed JD
    const jdTitle = result.parsedJD?.title || "Untitled Position";

    // Save to Postgres
    let analysisId = crypto.randomUUID();
    try {
      const { rows } = await pool.query(
        `INSERT INTO analyses (clerk_user_id, resume_text, jd_text, jd_title, result)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [clerkUserId, resumeText, jdText, jdTitle, JSON.stringify(analysisResult)]
      );
      if (rows[0]) analysisId = rows[0].id;
    } catch (dbErr) {
      console.error("DB insert error (non-fatal):", dbErr);
    }

    res.json({
      analysis_id: analysisId,
      ...analysisResult,
    });
  } catch (err: any) {
    console.error("Analysis error:", err);
    res.status(500).json({ error: "ANALYSIS_FAILED", message: "Failed to analyze resume" });
  }
});

import { Router } from "express";
import { extractUserId } from "../middleware/auth.js";
import { analysisGraph } from "../agents/graph.js";
import { supabase } from "../lib/supabase.js";
import { analyzeRequestSchema } from "../../../../packages/shared/src/schemas.js";

export const analyzeRouter = Router();

analyzeRouter.post("/analyze", extractUserId, async (req, res) => {
  try {
    const clerkUserId = (req as any).clerkUserId as string;

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

    // Save to Supabase
    let analysisId = crypto.randomUUID();
    try {
      const { data, error } = await supabase
        .from("analyses")
        .insert({
          clerk_user_id: clerkUserId,
          resume_text: resumeText,
          jd_text: jdText,
          jd_title: jdTitle,
          result: analysisResult,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (data) analysisId = data.id;
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

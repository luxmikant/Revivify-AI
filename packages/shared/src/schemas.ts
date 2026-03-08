import { z } from "zod";

// ── API Request Schemas ──

export const analyzeRequestSchema = z.object({
  resumeText: z.string().min(1, "resumeText is required"),
  jdText: z.string().min(1, "jdText is required"),
});

// ── Gemini Response Schemas (for structured output validation) ──

export const roleSchema = z.object({
  title: z.string(),
  company: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  description: z.string(),
});

export const careerGapSchema = z.object({
  from: z.string(),
  to: z.string(),
  duration_months: z.number(),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
});

export const resumeDataSchema = z.object({
  roles: z.array(roleSchema),
  skills: z.array(z.string()),
  career_gaps: z.array(careerGapSchema),
  education: z.array(educationSchema),
});

export const jdDataSchema = z.object({
  title: z.string(),
  keywords: z.array(z.string()),
  requirements: z.array(z.string()),
  seniority: z.enum(["Junior", "Mid", "Senior", "Lead", "Director"]),
});

export const gapAnalysisItemSchema = z.object({
  gap_period: z.string(),
  activity: z.string(),
  hidden_strength: z.string(),
  mapped_skill: z.string(),
});

export const bridgePlanItemSchema = z.object({
  action: z.string(),
  resource: z.string(),
  time_estimate: z.string(),
});

export const analysisResultSchema = z.object({
  ats_score: z.number().min(0).max(100),
  missing_keywords: z.array(z.string()),
  gap_analysis: z.array(gapAnalysisItemSchema),
  hidden_strengths_summary: z.string(),
  bridge_plan: z.array(bridgePlanItemSchema),
});

export const semanticBonusSchema = z.object({
  semantic_bonus: z.number().min(0).max(15),
});

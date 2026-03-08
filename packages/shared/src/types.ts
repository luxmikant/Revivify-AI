// ── Resume Data (transient, parsed by resumeParserNode) ──

export interface Role {
  title: string;
  company: string;
  start_date: string; // "YYYY-MM" or "YYYY"
  end_date: string;   // "YYYY-MM" | "YYYY" | "present"
  description: string;
}

export interface CareerGap {
  from: string;
  to: string;
  duration_months: number;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeData {
  roles: Role[];
  skills: string[];
  career_gaps: CareerGap[];
  education: Education[];
}

// ── JD Data (transient, parsed by jdAnalyzerNode) ──

export type Seniority = "Junior" | "Mid" | "Senior" | "Lead" | "Director";

export interface JDData {
  title: string;
  keywords: string[];
  requirements: string[];
  seniority: Seniority;
}

// ── Gap Analysis Item ──

export interface GapAnalysisItem {
  gap_period: string;
  activity: string;
  hidden_strength: string;
  mapped_skill: string;
}

// ── Bridge Plan Item ──

export interface BridgePlanItem {
  action: string;
  resource: string;
  time_estimate: string;
}

// ── Analysis Result (persisted in analyses.result JSONB) ──

export interface AnalysisResult {
  ats_score: number;
  missing_keywords: string[];
  gap_analysis: GapAnalysisItem[];
  hidden_strengths_summary: string;
  bridge_plan: BridgePlanItem[];
}

// ── API Request / Response shapes ──

export interface AnalyzeRequest {
  resumeText: string;
  jdText: string;
}

export interface AnalyzeResponse extends AnalysisResult {
  analysis_id: string;
}

export interface HistoryItem {
  id: string;
  created_at: string;
  jd_title: string;
  ats_score: number;
}

export interface HistoryListResponse {
  analyses: HistoryItem[];
}

export interface UploadResponse {
  text: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

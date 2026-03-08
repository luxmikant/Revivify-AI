const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function apiFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}`);
  }
  return res.json();
}

export async function uploadFile(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<{ text: string }>("/api/upload", token, {
    method: "POST",
    body: form,
  });
}

export interface AnalysisResult {
  ats_score: number;
  missing_keywords: string[];
  gap_analysis: {
    gap_period: string;
    activity: string;
    hidden_strength: string;
    mapped_skill: string;
  }[];
  hidden_strengths_summary: string;
  bridge_plan: {
    action: string;
    resource: string;
    time_estimate: string;
  }[];
}

export async function analyzeResume(
  token: string,
  resumeText: string,
  jdText: string
) {
  return apiFetch<{
    analysis_id: string;
  } & AnalysisResult>("/api/analyze", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jdText }),
  });
}

export async function getHistory(token: string) {
  return apiFetch<{
    analyses: Array<{
      id: string;
      ats_score: number;
      jd_title: string;
      created_at: string;
    }>;
  }>("/api/history", token);
}

export async function getAnalysis(token: string, id: string) {
  return apiFetch<{
    id: string;
    created_at: string;
    jd_title: string;
  } & AnalysisResult>(`/api/history/${encodeURIComponent(id)}`, token);
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

export async function analyzeResume(
  token: string,
  resumeText: string,
  jdText: string
) {
  return apiFetch<{
    analysisId: string;
    result: import("../../../../packages/shared/src/types").AnalysisResult;
  }>("/api/analyze", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jdText }),
  });
}

export async function getHistory(token: string) {
  return apiFetch<{
    analyses: Array<{
      id: string;
      result: import("../../../../packages/shared/src/types").AnalysisResult;
      created_at: string;
    }>;
  }>("/api/history", token);
}

export async function getAnalysis(token: string, id: string) {
  return apiFetch<{
    id: string;
    result: import("../../../../packages/shared/src/types").AnalysisResult;
    created_at: string;
  }>(`/api/history/${encodeURIComponent(id)}`, token);
}

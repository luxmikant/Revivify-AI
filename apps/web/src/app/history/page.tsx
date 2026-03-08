"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import ResultsDashboard from "@/components/ResultsDashboard";
import { getHistory, getAnalysis, type AnalysisResult } from "@/lib/api";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

interface HistoryEntry {
  id: string;
  ats_score: number;
  jd_title: string;
  created_at: string;
}

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedResult, setExpandedResult] = useState<AnalysisResult | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getHistory(token);
        if (!cancelled) setEntries(data.analyses);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedResult(null);
      return;
    }
    setExpandedId(id);
    setExpandedResult(null);
    setLoadingDetail(true);
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getAnalysis(token, id);
      setExpandedResult(data);
    } catch {
      setExpandedResult(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <p className="text-center text-slate-400 py-16">Loading history…</p>
        )}

        {error && (
          <p className="text-center text-red-400 py-16">{error}</p>
        )}

        {!loading && !error && !entries.length && (
          <div className="text-center py-16 space-y-2">
            <Clock size={32} className="mx-auto text-slate-600" />
            <p className="text-slate-400">
              No analyses yet. Go analyze a resume!
            </p>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Analysis History</h2>

            {entries.map((entry) => {
              const isOpen = expandedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        ATS Score: {entry.ats_score}
                        {entry.jd_title && ` · ${entry.jd_title}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString(
                          undefined,
                          { dateStyle: "medium" }
                        )}{" "}
                        ·{" "}
                        {new Date(entry.created_at).toLocaleTimeString(
                          undefined,
                          { timeStyle: "short" }
                        )}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-slate-500" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-500" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      {loadingDetail ? (
                        <p className="text-sm text-slate-400">Loading…</p>
                      ) : expandedResult ? (
                        <ResultsDashboard result={expandedResult} />
                      ) : (
                        <p className="text-sm text-red-400">
                          Failed to load details
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

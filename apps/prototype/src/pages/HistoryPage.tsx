import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getHistory } from "../lib/api";
import ResultsDashboard from "../components/ResultsDashboard";
import type { AnalysisResult } from "../../../../packages/shared/src/types";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";

interface HistoryEntry {
  id: string;
  result: AnalysisResult;
  created_at: string;
}

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  if (loading)
    return (
      <p className="text-center text-slate-400 py-16">Loading history…</p>
    );

  if (error)
    return <p className="text-center text-red-400 py-16">{error}</p>;

  if (!entries.length)
    return (
      <div className="text-center py-16 space-y-2">
        <Clock size={32} className="mx-auto text-slate-600" />
        <p className="text-slate-400">No analyses yet. Go analyze a resume!</p>
      </div>
    );

  return (
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
              onClick={() => setExpandedId(isOpen ? null : entry.id)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition"
            >
              <div>
                <p className="text-sm font-medium text-slate-200">
                  ATS Score: {entry.result.ats_score}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(entry.created_at).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}{" "}
                  ·{" "}
                  {new Date(entry.created_at).toLocaleTimeString(undefined, {
                    timeStyle: "short",
                  })}
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
                <ResultsDashboard result={entry.result} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

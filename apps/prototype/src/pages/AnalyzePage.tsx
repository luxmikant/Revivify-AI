import { useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import ResumeInput from "../components/ResumeInput";
import JDInput from "../components/JDInput";
import ScanAnimation from "../components/ScanAnimation";
import ResultsDashboard from "../components/ResultsDashboard";
import { uploadFile, analyzeResume } from "../lib/api";
import type { AnalysisResult } from "../../../../packages/shared/src/types";
import { Send, RotateCcw } from "lucide-react";

type Stage = "input" | "scanning" | "results";

export default function AnalyzePage() {
  const { getToken } = useAuth();

  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) throw new Error("Not signed in");

      let finalResume = resumeText;

      // If user uploaded a file, extract text first
      if (resumeFile && !resumeText.trim()) {
        setUploading(true);
        const uploaded = await uploadFile(token, resumeFile);
        finalResume = uploaded.text;
        setUploading(false);
      }

      if (!finalResume.trim()) {
        setError("Please provide your resume text or upload a file.");
        return;
      }
      if (!jdText.trim()) {
        setError("Please paste the job description.");
        return;
      }

      setStage("scanning");
      const data = await analyzeResume(token, finalResume, jdText);
      setResult(data.result);
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStage("input");
      setUploading(false);
    }
  }, [getToken, resumeText, resumeFile, jdText]);

  const reset = () => {
    setStage("input");
    setResult(null);
    setResumeText("");
    setResumeFile(null);
    setJdText("");
    setError(null);
  };

  if (stage === "scanning") return <ScanAnimation />;

  if (stage === "results" && result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Analysis Results</h2>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition"
          >
            <RotateCcw size={14} /> Start Over
          </button>
        </div>
        <ResultsDashboard result={result} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">
          Discover Your Hidden Strengths
        </h2>
        <p className="text-sm text-slate-400">
          Paste or upload your resume and a job description. Our 5-agent AI
          pipeline will score ATS compatibility, uncover hidden strengths in your
          career gaps, and build a personalized bridge plan.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ResumeInput
          text={resumeText}
          onTextChange={setResumeText}
          file={resumeFile}
          onFileChange={setResumeFile}
          uploading={uploading}
        />
        <JDInput text={jdText} onTextChange={setJdText} />
      </div>

      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={stage !== "input"}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} /> Analyze My Resume
        </button>
      </div>
    </div>
  );
}

import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import AnalyzePage from "./pages/AnalyzePage";
import HistoryPage from "./pages/HistoryPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-rose-950 to-slate-950 text-white">
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
              Career Returnship AI
            </h1>
            <p className="text-lg text-slate-300 mb-2">
              Your career gap is not a red flag — it&apos;s your superpower.
            </p>
            <p className="text-sm text-slate-400">
              Upload your resume and a job description. Our AI finds the hidden
              strengths in your career break.
            </p>
          </div>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<AnalyzePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </SignedIn>
    </div>
  );
}

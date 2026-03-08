import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { Sparkles, Target, Brain, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/analyze");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-rose-950 to-gray-950 text-white">
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
          Career Returnship AI
        </h1>
      </header>

      <main className="flex flex-col items-center px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mb-16">
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Your Career Break is a{" "}
            <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
              Superpower
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            AI-powered resume analysis that uncovers hidden strengths from career gaps 
            and builds a personalized bridge plan to your next role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mb-16">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <Target className="w-8 h-8 text-rose-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">ATS Score Analysis</h3>
            <p className="text-gray-400 text-sm">
              See how your resume scores against job descriptions with actionable keyword insights.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <Brain className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Hidden Strengths</h3>
            <p className="text-gray-400 text-sm">
              Discover transferable skills gained during career breaks that employers value.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
            <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Bridge Plan</h3>
            <p className="text-gray-400 text-sm">
              Get a personalized action plan with courses, projects, and timeline to close skill gaps.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 w-full max-w-md">
          <h3 className="text-xl font-semibold text-center mb-6">
            Sign in to get started
          </h3>
          <div className="flex justify-center">
            <SignIn routing="hash" />
          </div>
        </div>

        <p className="mt-8 text-gray-500 text-sm flex items-center gap-2">
          Built for Women&apos;s Day 2026 <ArrowRight className="w-4 h-4" /> Celebrating career comebacks
        </p>
      </main>
    </div>
  );
}

import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  BarChart3,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  History,
  Layers3,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import TemporalBridgeHero from "@/components/TemporalBridgeHero";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
            CareerSpring Platform
          </h1>

          <nav className="flex items-center gap-2 md:gap-3">
            {userId ? (
              <>
                <Link
                  href="/analyze"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition"
                >
                  Analyze
                </Link>
                <Link
                  href="/job-portal"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 transition"
                >
                  Job Portal
                </Link>
                <div className="ml-1">
                  <UserButton />
                </div>
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 transition">
                  Sign In
                </button>
              </SignInButton>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-20 space-y-10">
        <TemporalBridgeHero isSignedIn={Boolean(userId)} />

        <section>
          <div className="mb-4">
            <h3 className="text-xl md:text-2xl font-bold">Project Overview</h3>
            <p className="text-sm text-slate-300 mt-1">
              A multi-page career development application for candidates, recruiters, and admins.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <Layers3 className="w-8 h-8 text-rose-400 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Unified Career Workspace</h4>
              <p className="text-gray-300 text-sm">
                Centralized workflows for resume analysis, job applications, and credential checks.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <ShieldCheck className="w-8 h-8 text-amber-400 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Reliable and Secure</h4>
              <p className="text-gray-300 text-sm">
                Authenticated access, controlled views, and trusted data handling for users.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
              <TrendingUp className="w-8 h-8 text-amber-400 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Outcome Focused</h4>
              <p className="text-gray-300 text-sm">
                Designed to improve placement readiness and accelerate professional growth.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h3 className="text-xl md:text-2xl font-bold">Key Features</h3>
            <p className="text-sm text-slate-300 mt-1">
              Production-ready modules built for practical hiring and training workflows.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-slate-100 mb-2">AI Resume Analysis</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  ATS scoring against job descriptions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Missing keyword and role-gap insights
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Action-oriented bridge recommendations
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-slate-100 mb-2">Job Listing Portal</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Job publishing and application tracking
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Search filters by role, location, and type
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Dedicated user and employer dashboards
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-slate-100 mb-2">Certificate Verification</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Certificate lookup with unique ID verification
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Admin data upload and generation workflows
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Printable certificate preview and download flow
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold text-slate-100 mb-2">Insights and Reporting</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Historical analysis records and comparisons
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Progress visibility for users and stakeholders
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-amber-400 mt-0.5" />
                  Better decisions using measurable profile quality
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h3 className="text-xl md:text-2xl font-bold">Portal Modules</h3>
            <p className="text-sm text-slate-300 mt-1">
              Access all major product features directly from the homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/analyze"
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <Search className="text-rose-400 mb-3" size={20} />
              <h4 className="font-semibold">Resume Analyze</h4>
              <p className="text-sm text-slate-300 mt-2">Run AI scoring and improvement insights.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs text-amber-300 opacity-80 group-hover:opacity-100">
                Open <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/history"
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <History className="text-rose-400 mb-3" size={20} />
              <h4 className="font-semibold">Analysis History</h4>
              <p className="text-sm text-slate-300 mt-2">Review previous reports and progress.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs text-amber-300 opacity-80 group-hover:opacity-100">
                Open <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/job-portal"
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <Briefcase className="text-rose-400 mb-3" size={20} />
              <h4 className="font-semibold">Job Listing Portal</h4>
              <p className="text-sm text-slate-300 mt-2">Search openings and manage applications.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs text-amber-300 opacity-80 group-hover:opacity-100">
                Open <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/certificate-verification"
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <BadgeCheck className="text-rose-400 mb-3" size={20} />
              <h4 className="font-semibold">Certificate Verification</h4>
              <p className="text-sm text-slate-300 mt-2">Verify and print internship certificates.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs text-amber-300 opacity-80 group-hover:opacity-100">
                Open <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-400" /> Project Impact
          </h3>
          <div className="grid md:grid-cols-3 gap-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              Improves profile quality by identifying role-fit gaps and targeted improvements.
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              Reduces hiring friction through searchable job listings and structured applications.
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              Increases trust with verifiable, downloadable internship credentials.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

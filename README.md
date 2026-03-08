# Revivify AI — Career Returnship AI

> **Women's Day MVP** · Built for International Women's Day, March 8, 2026

An AI-powered web application that helps women re-enter the workforce after a career break by turning resume gaps into demonstrated strengths — and giving them a concrete plan to close any remaining skill gap.

---

## The Problem

> *"More than 43% of women who take a career break of 2+ years report that ATS software rejected them before a human ever reviewed their application."*
> — *cited in [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)*

Applicant Tracking Systems (ATS) automatically filter out candidates with unconventional resume gaps — caregiving, community work, freelance projects, or postgraduate study — not because the candidates lack skill, but because those experiences don't map cleanly to a job title.

**Revivify AI flips that bias.** Instead of penalising gaps, the AI identifies the transferable leadership, project management, and cross-functional skills hidden inside them and turns them into resume assets.

---

## What It Does

Paste (or upload) a resume and a job description, and receive:

| Output | Description |
|--------|-------------|
| 🎯 **ATS Score** | 0–100 compatibility score using keyword overlap + Google Gemini semantic analysis |
| 💡 **Hidden Strengths** | Each career gap reframed as a transferable skill aligned to the JD |
| 🗺️ **Bridge Plan** | 3 specific, time-boxed actions to close any remaining skill gap |
| 🔑 **Missing Keywords** | Exact keywords from the JD absent from the resume |
| 📋 **Analysis History** | Every past analysis saved and accessible at any time |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Frontend  (Next.js 16 or Vite / React)         │
│   Clerk auth · Tailwind CSS · Framer Motion animations   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────────────┐
│            Express Backend  (apps/api/)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │          LangGraph Multi-Agent Pipeline          │   │
│  │  1. Resume Parser  →  ResumeData                 │   │
│  │  2. JD Analyzer    →  JDData          (parallel) │   │
│  │  3. ATS Scorer     →  score + missing keywords   │   │
│  │  4. Gap Analyzer   →  hidden strengths narrative │   │
│  │  5. Bridge Planner →  3-step action plan         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────┬──────────────┬──────────────┬─────────────┘
              │              │              │
           Clerk          Gemini API    Supabase
          (JWT)          (AI agents)  (PostgreSQL)
```

---

## Tech Stack

### Backend (`apps/api/`)
- **Runtime**: Node.js + TypeScript
- **Framework**: Express 4
- **AI Orchestration**: LangGraph (`@langchain/langgraph`) with 5-node multi-agent pipeline
- **AI Model**: Google Gemini (`@google/generative-ai`, `@langchain/google-genai`)
- **Authentication**: Clerk (`@clerk/express`)
- **Database**: Supabase PostgreSQL
- **File Parsing**: `multer` (upload), `pdf-parse` (PDF), `mammoth` (DOCX)
- **Security**: `helmet`, `cors`, `morgan`

### Frontend — Prototype (`apps/prototype/`)
- **Framework**: React 19 + Vite 7
- **CSS**: Tailwind CSS 4
- **Auth**: `@clerk/clerk-react`
- **Animation**: Framer Motion
- **UI**: `lucide-react`, `react-dropzone`, React Router DOM

### Frontend — Production (`apps/web/`)
- **Framework**: Next.js 16 (App Router, React 19)
- **CSS**: Tailwind CSS 4
- **Auth**: `@clerk/nextjs`
- **Animation**: Framer Motion (SSR-safe via `next/dynamic`)
- **Compiler**: Babel React Compiler

### Shared (`packages/shared/`)
- TypeScript type definitions (`ResumeData`, `JDData`, `AnalysisResult`)
- Zod validation schemas for API request/response contracts

### Package Manager
- **pnpm** workspaces (monorepo)

---

## Repository Structure

```
Revivify-AI/
├── apps/
│   ├── api/            # Express + LangGraph backend
│   ├── prototype/      # Vite + React rapid prototype
│   └── web/            # Next.js production app
├── packages/
│   └── shared/         # Shared TypeScript types & Zod schemas
├── docs/
│   ├── REQUIREMENTS.md # Functional & non-functional requirements
│   ├── DESIGN.md       # API contracts, data flow, deep dives
│   └── TASKS.md        # Phase-by-phase implementation roadmap
├── TESTING_PLAN.md     # Integration & E2E test guide
├── .env.example        # Environment variable template
├── package.json
└── tsconfig.base.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (`npm install -g pnpm`)
- A [Clerk](https://clerk.com) account (authentication)
- A [Google Cloud](https://console.cloud.google.com) project with Gemini API enabled
- A [Supabase](https://supabase.com) project (PostgreSQL + JWT)

### 1 — Clone & Install

```bash
git clone https://github.com/luxmikant/Revivify-AI.git
cd Revivify-AI
pnpm install
```

### 2 — Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Where to get it |
|----------|----------------|
| `GOOGLE_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `DATABASE_URL` | Supabase → Settings → Database → Connection string |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` (local) |
| `VITE_API_URL` | `http://localhost:3001` (local) |

### 3 — Database Migration

Run the following SQL in your Supabase SQL editor to create the analyses table with Row-Level Security:

```sql
CREATE TABLE analyses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  resume_text   text NOT NULL,
  jd_text       text NOT NULL,
  jd_title      text,
  result        jsonb NOT NULL
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own rows" ON analyses FOR ALL
  USING (clerk_user_id = current_setting('app.clerk_user_id', true));
```

### 4 — Run Locally

**Backend + React Prototype (recommended for local development)**

```bash
# Terminal 1 — Express API
pnpm --filter api dev
# → http://localhost:3001

# Terminal 2 — React prototype
pnpm --filter prototype dev
# → http://localhost:5173
```

**Full production stack (Next.js)**

```bash
# Terminal 1 — Express API
pnpm --filter api dev

# Terminal 2 — Next.js app
pnpm --filter web dev
# → http://localhost:3000
```

---

## API Reference

Base URL: `http://localhost:3001` (dev) · `https://api.returnship.ai` (prod)

All authenticated routes require:
```
Authorization: Bearer <clerk_jwt>
```

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/health` | No | Uptime healthcheck |
| `POST` | `/api/upload` | Yes | Upload PDF/DOCX → extract plain text |
| `POST` | `/api/analyze` | Yes | Run full LangGraph pipeline; returns `AnalysisResult` |
| `GET` | `/api/history` | Yes | List past analyses (date, score, JD title) |
| `GET` | `/api/history/:id` | Yes | Fetch a single analysis result |

### `POST /api/analyze` — Request

```json
{
  "resumeText": "Jane Doe\nSoftware Engineer 2018–2021...",
  "jdText": "We are looking for a Senior Product Manager..."
}
```

### `POST /api/analyze` — Response `200`

```json
{
  "analysis_id": "uuid-v4",
  "ats_score": 74,
  "missing_keywords": ["OKR", "roadmap", "stakeholder management"],
  "gap_analysis": [
    {
      "gap_period": "Jan 2019 – Mar 2021",
      "activity": "Primary caregiver for two children",
      "hidden_strength": "Managed competing priorities, schedules, and budgets",
      "mapped_skill": "Project Management"
    }
  ],
  "hidden_strengths_summary": "Your 2-year career break demonstrates...",
  "bridge_plan": [
    {
      "action": "Complete the Google Project Management Certificate",
      "resource": "Coursera — 6 hrs/week",
      "time_estimate": "6 weeks"
    }
  ]
}
```

---

## How the AI Pipeline Works

The backend runs a **LangGraph** directed graph with 5 nodes:

```
START
  ├──► resumeParserNode  (Gemini: extract roles, skills, gaps, education)
  └──► jdAnalyzerNode    (Gemini: extract title, keywords, seniority)   ← parallel
         └──► atsScorerNode
                │  Step 1: keyword overlap score (0–85, deterministic)
                │  Step 2: Gemini semantic bonus  (0–15)
                └──► gapAnalyzerNode   (Gemini "Empathetic Recruiter" persona)
                           └──► bridgePlannerNode  (Gemini: 3 time-boxed actions)
                                      └──► END
```

### ATS Score Formula

```
overlap_score  = (matched_keywords / total_jd_keywords) × 85
semantic_bonus = Gemini(0–15)  ← transferable language not caught by keywords
ats_score      = min(100, overlap_score + semantic_bonus)
```

Score colours: 🟢 75+ · 🟡 50–74 · 🔴 < 50

---

## Using the Application

1. **Sign In** — Clerk modal (email or Google OAuth)
2. **Upload Resume** — Drag-and-drop a PDF/DOCX file, or paste text directly
3. **Paste Job Description** — Full JD text in the right panel
4. **Click "Analyze My Returnship"** — A scan animation plays while the 5-node pipeline runs (~15–30 s)
5. **View Results**:
   - Animated ATS score gauge
   - Missing keyword pills
   - Hidden Strengths cards (one per career gap)
   - 3-step Bridge Plan checklist
6. **History** — Click the History tab to revisit any past analysis

---

## Build & Deploy

### Build

```bash
# Build all packages from root
pnpm -r build

# Type-check all packages
pnpm -r typecheck

# Build a single app
pnpm --filter web build
```

### Deploy

| Service | Platform | Notes |
|---------|----------|-------|
| Backend (`apps/api`) | [Railway](https://railway.app) | Set env vars in Railway dashboard |
| Frontend (`apps/web`) | [Vercel](https://vercel.com) | Set `NEXT_PUBLIC_*` vars in Vercel dashboard |
| Database | [Supabase](https://supabase.com) | Hosted PostgreSQL; RLS enabled |

---

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Analysis completes in < 15 seconds (p95) |
| NFR-02 | API uptime ≥ 99.5% |
| NFR-03 | All API routes served over HTTPS; Clerk JWT required for write operations |
| NFR-04 | Resume text is never logged or stored in unencrypted form |
| NFR-05 | WCAG 2.1 AA accessibility for the production Next.js app |
| NFR-06 | LangGraph pipeline is stateless per request — horizontally scalable |

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Full functional & non-functional requirements, entity model |
| [`docs/DESIGN.md`](docs/DESIGN.md) | API contracts, data flow diagrams, LangGraph deep dives |
| [`docs/TASKS.md`](docs/TASKS.md) | Phase-by-phase implementation roadmap |
| [`TESTING_PLAN.md`](TESTING_PLAN.md) | Integration & E2E test scenarios |

---

## Out of Scope (MVP)

- Real-time streaming of partial agent results to the frontend
- One-click "rewrite my resume" feature
- Job board integration (LinkedIn, Indeed)
- Mobile native app
- Multi-language support (English only for MVP)

---

## License

ISC

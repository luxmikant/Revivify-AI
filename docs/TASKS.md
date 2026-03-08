# Career Returnship AI — Tasks

> Design Sequence: 1 Requirements → 2 Core Entities → 3 API/Interface → 4 Data Flow → 5 High-level Design → 6 Deep Dives

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Phase 0 — Monorepo Scaffold
*Goal: runnable Hello World from root. ETA: ~15 min*

```
[ ] 0.1  Init pnpm workspace
         mkdir womenDay && cd womenDay
         pnpm init
         Create pnpm-workspace.yaml   → apps/*, packages/*

[ ] 0.2  Create root tsconfig.base.json
         Shared compiler options (strict, ESNext, bundler moduleResolution)

[ ] 0.3  Create packages/shared
         pnpm --filter shared init
         Add src/types.ts  → AnalysisResult, ResumeData, JDData interfaces
         Add src/schemas.ts → Zod validators for API Request/Response
         Add src/index.ts  → barrel export

[ ] 0.4  Create .env.example at repo root
         All 9 env vars documented with placeholders

[ ] 0.5  Create .gitignore (covers node_modules, .env*, dist, .next, build)

[ ] 0.6  Verify: pnpm install runs from root without errors
```

---

## Phase 1 — Backend: `apps/api/`
*Goal: POST /api/analyze returns valid AnalysisResult JSON. ETA: ~45 min*

### 1A — Express Server Setup
```
[ ] 1.1  Scaffold apps/api
         pnpm --filter api init
         Install: express @types/express typescript ts-node-dev
         Install: helmet cors morgan dotenv
         Install: @clerk/express

[ ] 1.2  Create src/server.ts
         - dotenv config
         - helmet(), cors(), morgan()
         - JSON body parser
         - Health route: GET /api/health → { status: "ok" }
         - Mount routes (upload, analyze, history)
         - Listen on PORT env var (default 3001)

[ ] 1.3  Add Clerk middleware factory
         Create src/middleware/auth.ts
         - requireAuth() wrapper using @clerk/express
         - Extracts clerk_user_id from auth().userId and attaches to req.auth

[ ] 1.4  Verify: curl http://localhost:3001/api/health → 200
```

### 1B — File Upload Route
```
[ ] 1.5  Install: multer @types/multer pdf-parse @types/pdf-parse mammoth

[ ] 1.6  Create src/routes/upload.ts
         - multer memoryStorage, 5 MB limit, MIME type filter
         - POST /api/upload (requireAuth)
         - Branch on mimetype:
           pdf  → pdf-parse(buffer)   → text
           docx → mammoth.extractRawText({ buffer }) → text
         - Return { text: string }

[ ] 1.7  Verify: POST a sample PDF → get back text string
[ ] 1.8  Verify: POST oversized file → 400 FILE_TOO_LARGE
[ ] 1.9  Verify: POST without JWT → 401
```

### 1C — LangGraph Multi-Agent Graph
```
[ ] 1.10 Install:
         @langchain/langgraph @langchain/core @langchain/google-genai

[ ] 1.11 Create src/agents/state.ts
         Define GraphState with Annotation.Root:
         { resumeText, jdText, parsedResume, parsedJD,
           atsScore, missingKeywords, gapAnalysis,
           hiddenStrengthsSummary, bridgePlan, errors }
         Add reducer for parallel write fields (parsedResume, parsedJD)

[ ] 1.12 Create src/agents/nodes/resumeParser.ts
         - Gemini call with structured output schema
         - Prompt: "Extract roles[], skills[], career_gaps[], education[] as JSON"
         - Returns Partial<GraphState> with parsedResume

[ ] 1.13 Create src/agents/nodes/jdAnalyzer.ts
         - Gemini call with structured output schema
         - Prompt: "Extract title, keywords[], requirements[], seniority as JSON"
         - Returns Partial<GraphState> with parsedJD

[ ] 1.14 Create src/agents/nodes/atsScorer.ts
         - Step 1: keyword overlap (deterministic JS)
           matched = keywords ∩ resumeText words
           overlap_score = (matched / total) * 85
         - Step 2: Gemini semantic bonus (0–15)
           Prompt: "Given [JD requirements] and [resume skills], 
                    return JSON { semantic_bonus: number } 0–15"
         - final_score = Math.min(100, overlap_score + semantic_bonus)
         - Returns { atsScore, missingKeywords }

[ ] 1.15 Create src/agents/nodes/gapAnalyzer.ts
         - Gemini call as "Empathetic Recruiter" persona
         - Prompt: "You are an empathetic recruiter specializing in returnship.
                    For each career gap, identify the hidden transferable skill
                    aligned to the JD. Return JSON array:
                    [{ gap_period, activity, hidden_strength, mapped_skill }]"
         - Returns { gapAnalysis, hiddenStrengthsSummary }

[ ] 1.16 Create src/agents/nodes/bridgePlanner.ts
         - Gemini call
         - Prompt: "Given missing keywords [X,Y,Z] and career gaps,
                    give exactly 3 specific, time-boxed actions to close the gap.
                    Return JSON: [{ action, resource, time_estimate }]
                    Bridge plan must feel encouraging, not critical."
         - Returns { bridgePlan }

[ ] 1.17 Create src/agents/graph.ts
         - Instantiate StateGraph(GraphState)
         - Add all 5 nodes
         - addEdge(START, ["resumeParserNode", "jdAnalyzerNode"])
         - addEdge("resumeParserNode", "atsScorerNode")
         - addEdge("jdAnalyzerNode", "atsScorerNode")
         - addEdge("atsScorerNode", "gapAnalyzerNode")
         - addEdge("gapAnalyzerNode", "bridgePlannerNode")
         - addEdge("bridgePlannerNode", END)
         - export compiled graph

[ ] 1.18 Verify graph standalone:
         npx ts-node src/agents/graph.ts
         (hardcoded sample resume + JD, print final state)
```

### 1D — Supabase Setup & History Routes
```
[ ] 1.19 Install: @supabase/supabase-js

[ ] 1.20 Create src/lib/supabase.ts
         - createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
         - helper: setUserContext(clerk_user_id) for RLS

[ ] 1.21 Run SQL migration in Supabase dashboard:
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

[ ] 1.22 Create src/routes/analyze.ts
         - POST /api/analyze (requireAuth)
         - Validate body (resumeText, jdText non-empty)
         - Invoke compiled LangGraph graph
         - Insert result row in Supabase
         - Return full AnalysisResult + analysis_id

[ ] 1.23 Create src/routes/history.ts
         - GET /api/history (requireAuth)
           SELECT id, created_at, jd_title, result->>'ats_score'
           WHERE clerk_user_id = req.auth.userId ORDER BY created_at DESC
         - GET /api/history/:id (requireAuth)
           SELECT * WHERE id = $1 AND clerk_user_id = req.auth.userId

[ ] 1.24 Verify end-to-end:
         POST /api/analyze with sample data → 200 + full AnalysisResult JSON
         GET /api/history → array with the new row
         GET /api/history/:id → full result
         GET /api/history without JWT → 401
```

---

## Phase 2 — React Prototype: `apps/prototype/`
*Goal: working full-stack local demo. ETA: ~35 min*

```
[ ] 2.1  Scaffold: pnpm create vite@latest prototype --template react-ts
         Install: tailwindcss postcss autoprefixer
         Install: @clerk/react framer-motion lucide-react react-dropzone axios

[ ] 2.2  Configure Tailwind (tailwind.config, postcss.config, globals.css)

[ ] 2.3  Wrap App in <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>

[ ] 2.4  Create src/components/AuthGate.tsx
         <SignedIn>  → renders children
         <SignedOut> → renders <SignIn routing="hash" />

[ ] 2.5  Create src/components/Navbar.tsx
         Logo | History link | <UserButton />

[ ] 2.6  Create src/components/ResumeInput.tsx
         - react-dropzone: accepts .pdf, .docx
         - On drop: POST to VITE_API_URL/api/upload → set resumeText state
         - Fallback textarea for paste
         - Show filename badge when file loaded

[ ] 2.7  Create src/components/JDInput.tsx
         - Textarea, min 4 rows, placeholder text

[ ] 2.8  Create src/components/ScanAnimation.tsx
         - Framer Motion vertical scanner overlay
         - Shown only when isAnalyzing === true

[ ] 2.9  Create src/components/ATSGauge.tsx
         - SVG circle ring (stroke-dashoffset animated)
         - Animated count-up number (useMotionValue)
         - Color: green > 75, amber 50–75, red < 50

[ ] 2.10 Create src/components/HiddenStrengths.tsx
         - Cards: gap_period heading + hidden_strength body + mapped_skill chip

[ ] 2.11 Create src/components/BridgePlan.tsx
         - Checklist of 3 items with action, resource, time_estimate

[ ] 2.12 Create src/components/MissingKeywords.tsx
         - Pill/badge list of missing_keywords[]

[ ] 2.13 Create src/components/ResultsDashboard.tsx
         - Composes ATSGauge + HiddenStrengths + BridgePlan + MissingKeywords
         - Framer Motion stagger-in for each section

[ ] 2.14 Create src/pages/AnalyzePage.tsx
         - Side-by-side grid (md:grid-cols-2)
         - ResumeInput (left) + JDInput (right)
         - "Analyze My Returnship" button
         - On click: POST /api/analyze, toggle ScanAnimation, render ResultsDashboard

[ ] 2.15 Create src/pages/HistoryPage.tsx
         - GET /api/history on mount
         - Table: Date | JD Title | ATS Score | [View]
         - Click [View] → GET /api/history/:id → open ResultsDashboard in modal

[ ] 2.16 Wire React Router: / → AnalyzePage, /history → HistoryPage

[ ] 2.17 Verify:
         - Upload PDF → text extracted
         - Paste JD → click Analyze → scan animation plays
         - Results render with score, strengths, bridge plan
         - History tab shows saved analysis
```

---

## Phase 3 — Next.js Production: `apps/production/`
*Goal: production-grade app deployable to Vercel. ETA: ~40 min*

```
[ ] 3.1  Scaffold:
         pnpm create next-app@latest production --ts --tailwind --app --no-src-dir
         Install: @clerk/nextjs framer-motion lucide-react react-dropzone

[ ] 3.2  Create apps/production/middleware.ts
         import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
         Protect /dashboard and /history routes
         Public: /, /sign-in, /sign-up

[ ] 3.3  Create app/layout.tsx
         Wrap with <ClerkProvider>
         Import globals.css

[ ] 3.4  Create app/page.tsx (Landing — Server Component)
         Hero section: headline, sub-copy, CTA button → /dashboard
         <SignedIn> CTA → /dashboard
         <SignedOut> CTA → /sign-in

[ ] 3.5  Create app/sign-in/[[...sign-in]]/page.tsx
         <SignIn routing="path" path="/sign-in" />

[ ] 3.6  Create app/sign-up/[[...sign-up]]/page.tsx
         <SignUp routing="path" path="/sign-up" />

[ ] 3.7  Port shared UI components from prototype into
         app/components/ui/:
         - ATSGauge.tsx    (Client Component, "use client")
         - HiddenStrengths.tsx
         - BridgePlan.tsx
         - MissingKeywords.tsx
         - ResultsDashboard.tsx
         - ScanAnimation.tsx
         - ResumeInput.tsx
         - JDInput.tsx
         Wrap Framer Motion components with next/dynamic { ssr: false }

[ ] 3.8  Create app/dashboard/page.tsx (Client Component)
         - Side-by-side layout (same as prototype)
         - Calls NEXT_PUBLIC_API_URL/api/analyze with Clerk getToken()
         - Renders ResultsDashboard on success

[ ] 3.9  Create app/history/page.tsx (Server Component)
         - Fetch analyses from Supabase directly (service role key, safe server-side)
         - Render table with Suspense boundary

[ ] 3.10 Create app/history/[id]/page.tsx (Server Component)
         - Fetch single analysis by id
         - Render full ResultsDashboard (static, no animation needed for history view)

[ ] 3.11 Create app/components/Navbar.tsx (Client Component)
         <UserButton /> + nav links

[ ] 3.12 Add vercel.json
         {
           "buildCommand": "pnpm --filter production build",
           "outputDirectory": "apps/production/.next",
           "installCommand": "pnpm install --frozen-lockfile"
         }

[ ] 3.13 Verify locally: pnpm --filter production dev → http://localhost:3000
[ ] 3.14 Deploy to Vercel:
         - Connect GitHub repo
         - Set root directory to apps/production (or use vercel.json)
         - Add all NEXT_PUBLIC_* env vars in Vercel dashboard
[ ] 3.15 Verify production:
         - Clerk sign-in works on live URL
         - Analyze flow completes end-to-end
         - History page shows previous analyses
```

---

## Phase 4 — Deploy Backend
*Goal: Express API live on Railway. ETA: ~10 min*

```
[ ] 4.1  Add Procfile or railway.json
         startCommand: node dist/server.js
         Add build: tsc -p tsconfig.json

[ ] 4.2  Push to GitHub

[ ] 4.3  Create Railway project → connect GitHub repo
         Set root to apps/api

[ ] 4.4  Add Railway environment variables:
         GOOGLE_API_KEY
         CLERK_SECRET_KEY
         SUPABASE_URL
         SUPABASE_SERVICE_ROLE_KEY
         PORT=3001

[ ] 4.5  Verify: Railway deploy succeeds, health URL returns 200

[ ] 4.6  Update NEXT_PUBLIC_API_URL in Vercel to Railway live URL

[ ] 4.7  Run full E2E smoke test on production URLs
```

---

## Phase 5 — Hardening & Polish
*Post-MVP improvements, lower priority*

```
[ ] 5.1  Add rate limiting to Express (express-rate-limit: 10 req/min per user)
[ ] 5.2  Add Zod validation middleware on POST /api/analyze (from packages/shared)
[ ] 5.3  Add error boundary in Next.js (app/error.tsx)
[ ] 5.4  Add loading.tsx for dashboard and history routes
[ ] 5.5  Add WCAG focus-visible styles (keyboard nav for all interactive elements)
[ ] 5.6  Write smoke test script (curl-based) to run after each deploy
[ ] 5.7  Add GitHub Actions CI: install + typecheck on PR
[ ] 5.8  Add favicon and Open Graph image for social sharing
```

---

## Dependency Map

```
Phase 0 ──► Phase 1A ──► Phase 1B
                │
                ▼
            Phase 1C ──► Phase 1D ──► Phase 4
                │
                ├──► Phase 2 (can start after 1D)
                │
                └──► Phase 3 (can start after 1D, parallel with Phase 2)
```

Phase 2 and Phase 3 can be built **in parallel** once Phase 1D (analyze + history routes) is complete.

---

## Key Commands Reference

```bash
# Install all workspaces
pnpm install

# Run API in dev
pnpm --filter api dev

# Run prototype in dev
pnpm --filter prototype dev

# Run production Next.js in dev
pnpm --filter production dev

# Type-check all packages
pnpm -r typecheck

# Build all
pnpm -r build
```

---

*← Back: [DESIGN.md](./DESIGN.md) | Requirements: [REQUIREMENTS.md](./REQUIREMENTS.md)*

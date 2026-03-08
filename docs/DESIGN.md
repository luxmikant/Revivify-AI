# Career Returnship AI — Design

> Design Sequence: 1 Requirements → 2 Core Entities → **3 → API/Interface** → **4 → Data Flow** → **5 → High-level Design** → **6 → Deep Dives**

---

## 3. API / Interface

> Stage **3**: What contracts does the system expose? What does each surface look like?

### 3.1 REST API Contract (Express Backend)

Base URL: `http://localhost:3001` (dev) / `https://api.returnship.ai` (prod)

All authenticated routes require the header:
```
Authorization: Bearer <clerk_jwt>
```

---

#### `GET /api/health`
Public. Healthcheck for Railway/Render uptime monitors.

**Response `200`**
```json
{ "status": "ok", "timestamp": "2026-03-08T00:00:00Z" }
```

---

#### `POST /api/upload`
Authenticated. Accepts `multipart/form-data` with a single `file` field (`.pdf` or `.docx`).
Extracts plain text in-memory.

**Request**
```
Content-Type: multipart/form-data
file: <binary>
```

**Response `200`**
```json
{
  "text": "Jane Doe\nSoftware Engineer at Acme Corp 2018–2021\n..."
}
```

**Response `400`** — invalid type, oversized file
```json
{ "error": "FILE_TYPE_UNSUPPORTED | FILE_TOO_LARGE", "message": "..." }
```

---

#### `POST /api/analyze`
Authenticated. Runs the LangGraph multi-agent pipeline.

**Request Body**
```json
{
  "resumeText": "Jane Doe\nSoftware Engineer...",
  "jdText": "We are looking for a Senior Product Manager..."
}
```

**Response `200`**
```json
{
  "analysis_id": "uuid-v4",
  "ats_score": 74,
  "missing_keywords": ["OKR", "roadmap", "stakeholder management"],
  "gap_analysis": [
    {
      "gap_period": "Jan 2019 – Mar 2021",
      "activity": "Primary caregiver for two children",
      "hidden_strength": "Managed competing priorities, schedules, and budgets for a household",
      "mapped_skill": "Project Management"
    }
  ],
  "hidden_strengths_summary": "Your 2-year career break demonstrates...",
  "bridge_plan": [
    {
      "action": "Complete the Google Project Management Certificate",
      "resource": "Coursera — 6 hrs/week",
      "time_estimate": "6 weeks"
    },
    {
      "action": "Add a 'Career Break' entry to your LinkedIn with key activities",
      "resource": "LinkedIn Career Break feature",
      "time_estimate": "1 hour"
    },
    {
      "action": "Rewrite resume summary to lead with transferable leadership narrative",
      "resource": "Our AI-suggested rewrite (coming soon)",
      "time_estimate": "2 hours"
    }
  ]
}
```

**Response `422`** — empty input
```json
{ "error": "INVALID_INPUT", "message": "resumeText and jdText are required" }
```

---

#### `GET /api/history`
Authenticated. Returns the calling user's past analyses, newest first.

**Response `200`**
```json
{
  "analyses": [
    {
      "id": "uuid-v4",
      "created_at": "2026-03-08T10:22:00Z",
      "jd_title": "Senior Product Manager",
      "ats_score": 74
    }
  ]
}
```

#### `GET /api/history/:id`
Authenticated. Returns the full `AnalysisResult` for one past analysis.

---

### 3.2 Frontend UI Interface (React Prototype + Next.js Production)

#### Landing / Hero
- Headline: *"Your career gap is not a red flag. It's your superpower."*
- CTA: "Analyze My Resume" → opens upload interface (requires sign-in)

#### Main Analysis View (Side-by-Side)
```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR: logo  |  [History]  |  [Sign Out]  |  <UserButton>  │
├─────────────────────────┬────────────────────────────────────┤
│  📄 YOUR RESUME         │  💼 JOB DESCRIPTION                │
│                         │                                    │
│  [Drop PDF/DOCX here]   │  [ Paste JD text here...       ]   │
│  or paste below         │                                    │
│  [ resume textarea  ]   │                                    │
│                         │                                    │
├─────────────────────────┴────────────────────────────────────┤
│                  [ ▶ ANALYZE MY RETURNSHIP ]                  │
└──────────────────────────────────────────────────────────────┘
         ↓↓ after analysis ↓↓
┌──────────────────────────────────────────────────────────────┐
│  ATS SCORE                                                   │
│  ╔══════╗  74%  ← animated gauge                            │
│  ║  74  ║  "Strong foundation — 3 gaps to close"            │
│  ╚══════╝                                                    │
│                                                              │
│  HIDDEN STRENGTHS                                            │
│  ┌───────────────────────────────────────────┐              │
│  │ 2019–2021 gap → 🏠 Project Management     │              │
│  │ "Managed competing priorities and budgets" │              │
│  └───────────────────────────────────────────┘              │
│                                                              │
│  BRIDGE PLAN                                                 │
│  ☐ Complete Google PM Certificate (6 weeks)                  │
│  ☐ Add Career Break to LinkedIn (1 hour)                     │
│  ☐ Rewrite resume summary (2 hours)                          │
│                                                              │
│  MISSING KEYWORDS   [OKR] [roadmap] [stakeholder mgmt]      │
└──────────────────────────────────────────────────────────────┘
```

#### History View
- Table: Date | JD Title | ATS Score | [View]

---

## 4. Data Flow

> Stage **4**: How does data move from input to output through the system?

### 4.1 Analysis Request — Complete Flow

```
USER BROWSER
│
│  1. User drops PDF file
│  ──── POST /api/upload (multipart, JWT) ────────────────────►
│                                                            API
│                                                             │
│                                                    multer (memory)
│                                                             │
│                              ┌──────────────────┐          │
│                              │  pdf-parse        │ ◄────────┤
│                              │  mammoth (docx)   │          │
│                              └────────┬─────────┘          │
│                                       │ { text: string }    │
│  ◄──────────────────────────────────── response 200 ────────┘
│
│  2. User clicks ANALYZE
│  ──── POST /api/analyze ({ resumeText, jdText }, JWT) ──────►
│                                                            API
│                                                             │
│                                               Clerk JWT verified
│                                                             │
│                                         ┌───────────────────┴──────┐
│                                         │  LangGraph Graph START   │
│                                         └───────────────────┬──────┘
│                                                             │
│                          ┌──────────────┤  parallel fork   ├──────────────┐
│                          │              │                   │              │
│                          ▼              │                   │              ▼
│               ┌──────────────────┐     │                   │  ┌──────────────────┐
│               │ resumeParserNode │     │                   │  │  jdAnalyzerNode  │
│               │ Gemini → JSON    │     │                   │  │  Gemini → JSON   │
│               │ { roles, skills, │     │                   │  │  { title,        │
│               │   gaps, edu }    │     │                   │  │    keywords,     │
│               └────────┬─────────┘     │                   │  │    requirements} │
│                        │               │                   │  └─────────┬────────┘
│                        └───────────────┴──── parallel join ─────────────┘
│                                                             │
│                                                             ▼
│                                               ┌──────────────────────┐
│                                               │   atsScorerNode      │
│                                               │   keyword overlap +  │
│                                               │   Gemini semantic    │
│                                               │   bonus → ats_score  │
│                                               └──────────┬───────────┘
│                                                          │
│                                                          ▼
│                                               ┌──────────────────────┐
│                                               │   gapAnalyzerNode    │
│                                               │   gaps → hidden      │
│                                               │   strengths mapping  │
│                                               └──────────┬───────────┘
│                                                          │
│                                                          ▼
│                                               ┌──────────────────────┐
│                                               │  bridgePlannerNode   │
│                                               │  3 action bullets    │
│                                               └──────────┬───────────┘
│                                                          │
│                                                GRAPH END │
│                                                          │
│                                               ┌──────────▼───────────┐
│                                               │  Supabase INSERT     │
│                                               │  analyses table      │
│                                               └──────────────────────┘
│                                                          │
│  ◄─────────── response 200 (AnalysisResult JSON) ────────┘
│
│  3. Frontend renders results with Framer Motion animations
```

### 4.2 Authentication Flow

```
Browser                  Clerk                   Express API          Supabase
   │                       │                          │                   │
   │── sign in form ───────►│                          │                   │
   │   (email / Google)    │                          │                   │
   │◄── JWT (access token) ─┤                          │                   │
   │                       │                          │                   │
   │── POST /api/analyze ──────────────────────────────►                   │
   │   Authorization: Bearer <jwt>                    │                   │
   │                       │◄── verifyToken() ────────┤                   │
   │                       │─── { sub: clerk_uid } ──►│                   │
   │                                                   │── INSERT row ────►│
   │                                                   │   clerk_user_id   │
   │◄──────────────────────────────────────────────── 200                  │
```

### 4.3 Data Persistence Scope

| Data | Where | How long |
|---|---|---|
| Uploaded file binary | Memory (multer `memoryStorage`) | Duration of request only |
| Extracted resume text | API response + `analyses.resume_text` | Indefinitely (user-owned) |
| JD text | API response + `analyses.jd_text` | Indefinitely (user-owned) |
| AnalysisResult JSON | `analyses.result` JSONB | Indefinitely (user-owned) |
| LangGraph agent state | In-process memory | Duration of graph execution |
| Gemini API request/response | Not logged or stored | Ephemeral |

---

## 5. High-Level Design

> Stage **5**: System architecture — how do the components connect?

### 5.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MONOREPO                                 │
│  ┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐  │
│  │  apps/        │   │  apps/          │   │  apps/          │  │
│  │  prototype/   │   │  api/           │   │  production/    │  │
│  │  Vite React   │   │  Express        │   │  Next.js        │  │
│  │  + Clerk SDK  │   │  + LangGraph    │   │  App Router     │  │
│  │  Tailwind CSS │   │  + Gemini SDK   │   │  + Clerk SDK    │  │
│  └───────┬───────┘   └────────┬────────┘   └────────┬────────┘  │
│          │                    │                     │             │
│          └──────────┬─────────┘◄────────────────────┘            │
│                     │  shared types                               │
│             ┌───────┴────────┐                                   │
│             │  packages/     │                                   │
│             │  shared/       │                                   │
│             │  TypeScript    │                                   │
│             │  types + Zod   │                                   │
│             └────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘

External Services:
  ┌──────────┐   ┌──────────┐   ┌──────────────────┐   ┌────────────┐
  │  Clerk   │   │ Supabase │   │   Google Gemini   │   │  Vercel /  │
  │  Auth    │   │ Postgres │   │   API (Flash 2.0) │   │  Railway   │
  └──────────┘   └──────────┘   └──────────────────┘   └────────────┘
```

### 5.2 Tech Stack Summary

| Layer | Prototype | Production |
|---|---|---|
| Frontend framework | Vite + React 18 | Next.js 15 (App Router) |
| Styling | Tailwind CSS | Tailwind CSS |
| Icons | Lucide React | Lucide React |
| Animation | Framer Motion | Framer Motion (dynamic import) |
| Auth client | `@clerk/react` | `@clerk/nextjs` |
| File upload | `react-dropzone` | `react-dropzone` |
| HTTP client | `fetch` / `axios` | `fetch` (Server Components) |
| **Backend** | | |
| Runtime | Node.js 20 | Node.js 20 |
| Framework | Express 5 | Express 5 (separate process) |
| Auth middleware | `@clerk/express` | `@clerk/express` |
| AI orchestration | `@langchain/langgraph` | `@langchain/langgraph` |
| AI model | `@langchain/google-genai` → `gemini-2.0-flash` | same |
| File parsing | `multer` + `pdf-parse` + `mammoth` | same |
| **Data** | | |
| Database | Supabase Postgres | Supabase Postgres |
| ORM / client | `@supabase/supabase-js` | `@supabase/supabase-js` |
| **Infrastructure** | | |
| Backend hosting | Railway (free tier) | Railway |
| Frontend hosting | local / Vercel preview | Vercel |
| Environment secrets | `.env.local` | Vercel env vars + Railway env vars |

### 5.3 LangGraph Agent Graph Architecture

```
                    ┌──────────────┐
          start ──► │  Supervisor  │ (validates input, routes)
                    └──────┬───────┘
                           │
              ┌────────────┴─────────────┐
              ▼                          ▼
  ┌───────────────────┐      ┌───────────────────────┐
  │  resumeParserNode │      │    jdAnalyzerNode      │
  │                   │      │                       │
  │  IN:  resumeText  │      │  IN:  jdText          │
  │  OUT: ResumeData  │      │  OUT: JDData          │
  │                   │      │                       │
  │  Gemini prompt:   │      │  Gemini prompt:       │
  │  "Extract roles,  │      │  "Extract keywords,   │
  │   skills, gaps,   │      │   requirements, and   │
  │   edu as JSON"    │      │   seniority as JSON"  │
  └────────┬──────────┘      └───────────┬───────────┘
           └──────────┬──────────────────┘
                      │  (both complete before proceeding)
                      ▼
          ┌───────────────────────┐
          │     atsScorerNode     │
          │                       │
          │  IN:  ResumeData +    │
          │       JDData          │
          │  OUT: ats_score (int) │
          │       missing_kw []   │
          │                       │
          │  Algorithm:           │
          │  overlap = matched_kw │
          │          / total_kw   │
          │  ask Gemini for       │
          │  semantic_bonus 0-15  │
          │  final = overlap*85 + │
          │          semantic_b   │
          └────────────┬──────────┘
                       │
                       ▼
          ┌───────────────────────┐
          │    gapAnalyzerNode    │
          │                       │
          │  IN:  ResumeData.gaps │
          │       JDData.keywords │
          │  OUT: gap_analysis[]  │
          │       hidden_stren[]  │
          │                       │
          │  Gemini prompt:       │
          │  "Empathetic Recruiter│
          │   specializing in     │
          │   re-entry. For each  │
          │   gap, identify the   │
          │   transferable skill" │
          └────────────┬──────────┘
                       │
                       ▼
          ┌───────────────────────┐
          │   bridgePlannerNode   │
          │                       │
          │  IN:  missing_kw[]    │
          │       gap_analysis[]  │
          │  OUT: bridge_plan[]   │
          │       (exactly 3)     │
          │                       │
          │  Gemini prompt:       │
          │  "Give 3 specific,    │
          │   time-boxed actions  │
          │   to close this gap"  │
          └────────────┬──────────┘
                       │
                      END
```

---

## 6. Deep Dives

> Stage **6**: Tricky decisions, implementation details, and engineering choices worth explaining.

### 6.1 The ATS Scoring Algorithm

**Why not just ask Gemini "give me an ATS score"?**
A raw prompt would produce inconsistent numbers. The hybrid algorithm is reproducible:

```
Step 1 — Keyword Extraction (via jdAnalyzerNode)
  keywords = ["Python", "OKR", "roadmap", "stakeholder management", "Agile"]

Step 2 — Surface Match
  matched = keywords.filter(kw => resumeText.toLowerCase().includes(kw.toLowerCase()))
  overlap_score = (matched.length / keywords.length) * 85   // max 85 points

Step 3 — Semantic Bonus (via atsScorerNode, Gemini call)
  Prompt: "The JD requires [Team Lead]. The resume mentions [Managed 4-person household].
           On a scale of 0–15, what semantic bonus is appropriate for transferable leadership?
           Return JSON: { semantic_bonus: number }"
  bonus = gemini_response.semantic_bonus                     // 0–15 points

Step 4 — Final Score
  final_score = Math.min(100, Math.round(overlap_score + bonus))
```

---

### 6.2 Clerk + Supabase Integration (No Supabase Auth)

Supabase's own Auth is bypassed. Clerk is the single identity provider.
Supabase Row-Level Security (RLS) uses `clerk_user_id` as a plain `text` column:

```sql
-- RLS Policy on analyses table
CREATE POLICY "Users can only access their own analyses"
ON analyses
FOR ALL
USING (clerk_user_id = current_setting('app.clerk_user_id', true));
```

The Express API sets this session variable before each Supabase query:
```ts
await supabase.rpc('set_config', {
  setting: 'app.clerk_user_id',
  value: clerkUserId
});
```

This avoids the complexity of Supabase Auth JWTs while still enforcing row-level security.

---

### 6.3 LangGraph Parallel Node Execution

`@langchain/langgraph` supports parallel branches using a list of edges from one node:

```ts
graph.addEdge(START, ["resumeParserNode", "jdAnalyzerNode"])
graph.addEdge("resumeParserNode", "atsScorerNode")
graph.addEdge("jdAnalyzerNode", "atsScorerNode")
// atsScorerNode waits for BOTH to complete (fan-in automatic)
```

The state annotation uses a **reducer** for parallel writes:
```ts
const GraphState = Annotation.Root({
  parsedResume: Annotation<ResumeData>({ reducer: (_, b) => b }),
  parsedJD:     Annotation<JDData>    ({ reducer: (_, b) => b }),
  // ...
})
```

---

### 6.4 File Parsing Strategy

| File Type | Library | Approach |
|---|---|---|
| `.pdf` | `pdf-parse` | In-memory buffer → text string |
| `.docx` | `mammoth` | In-memory buffer → `.extractRawText()` |
| Plain text | — | Direct use of POST body string |

Files are never written to disk. `multer` is configured with `memoryStorage()`:
```ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    cb(null, allowed.includes(file.mimetype))
  }
})
```

---

### 6.5 Framer Motion "Scan" Animation

During the API call, the UI renders a horizontal scanner bar over the resume textarea:
```tsx
<motion.div
  className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-400/30 to-transparent"
  animate={{ y: ["0%", "100%", "0%"] }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
/>
```
This runs for the duration of the `fetch`, then unmounts when the result arrives.
It creates the perception of active processing and elevates the MVP's perceived quality.

---

### 6.6 Environment Variables Reference

```bash
# All apps
GOOGLE_API_KEY=                    # Gemini API key

# Clerk (Backend)
CLERK_SECRET_KEY=sk_live_...       # Express JWT verification

# Clerk (Frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...           # For RLS-protected reads
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # For admin writes from API

# API URL (consumed by frontends)
NEXT_PUBLIC_API_URL=https://api.returnship.ai
VITE_API_URL=http://localhost:3001
```

---

*← Back: [REQUIREMENTS.md](./REQUIREMENTS.md) | Next → [TASKS.md](./TASKS.md)*

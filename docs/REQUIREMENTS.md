# Career Returnship AI — Requirements

> Design Sequence: **1 → Requirements** → 2 Core Entities → 3 API/Interface → 4 Data Flow → 5 High-level Design → 6 Deep Dives

---

## Background & Problem Statement

### The Problem

Women returning to the workforce after a career break face a structurally biased hiring process.
Applicant Tracking Systems (ATS) filter them out automatically — not because they lack skill,
but because their resumes carry **unconventional gaps**: caregiving, community work, freelance
projects, or postgraduate study that doesn't map cleanly to a job title.

**Today is March 8, 2026 — International Women's Day.**

> "More than 43% of women who take a career break of 2+ years report that ATS software
> rejected them before a human ever reviewed their application."

This product exists to **flip that bias**. Instead of penalizing gaps, the AI finds the
**transferable leadership, project management, and cross-functional skills** hidden inside them —
and turns them into resume assets.

---

## WHAT: Product in One Line

> A web application where a returning professional pastes (or uploads) her resume and a job
> description, and receives an ATS compatibility score, a reframed narrative of her career gaps
> as "Hidden Strengths," and a concrete 3-step Bridge Plan to close the gap.

---

## 1. Requirements

### 1.1 Functional Requirements

#### FR-01 — Resume Ingestion
| ID | Requirement | Priority |
|---|---|---|
| FR-01-A | User can upload a `.pdf` resume file | P0 |
| FR-01-B | User can upload a `.docx` resume file | P0 |
| FR-01-C | User can paste raw resume text into a textarea | P0 |
| FR-01-D | System extracts plain text from uploaded file server-side | P0 |

#### FR-02 — Job Description Ingestion
| ID | Requirement | Priority |
|---|---|---|
| FR-02-A | User can paste a Job Description (JD) into a textarea | P0 |
| FR-02-B | System splits JD into: title, keywords, required skills, seniority level | P0 |

#### FR-03 — ATS Scoring
| ID | Requirement | Priority |
|---|---|---|
| FR-03-A | System calculates a keyword-overlap score (0–100) | P0 |
| FR-03-B | System applies a Gemini semantic bonus (+0–15 pts) for transferable language | P0 |
| FR-03-C | Score is displayed as a visual gauge with animated count-up | P0 |
| FR-03-D | Missing keywords are surfaced as chips/badges | P0 |

#### FR-04 — Gap Analysis (Hidden Strengths)
| ID | Requirement | Priority |
|---|---|---|
| FR-04-A | System detects date-range gaps in resume work history | P0 |
| FR-04-B | For each gap, AI reframes the period as a transferable skill | P0 |
| FR-04-C | Output: list of `{ gap_period, hidden_strength, mapped_skill }` | P0 |

#### FR-05 — Bridge Plan
| ID | Requirement | Priority |
|---|---|---|
| FR-05-A | System generates exactly 3 actionable bullet points to fix the skill gap | P0 |
| FR-05-B | Each bullet includes: action verb, specific resource/path, time estimate | P0 |

#### FR-06 — Authentication
| ID | Requirement | Priority |
|---|---|---|
| FR-06-A | User can sign up / sign in via Clerk (email + Google OAuth) | P0 |
| FR-06-B | Unauthenticated users can reach the landing page but not analyze | P0 |
| FR-06-C | JWT from Clerk is verified by the Express API on every protected call | P0 |

#### FR-07 — Analysis History
| ID | Requirement | Priority |
|---|---|---|
| FR-07-A | Each completed analysis is saved to Supabase against the user's Clerk ID | P1 |
| FR-07-B | User can view a list of past analyses with date, score, and JD title | P1 |
| FR-07-C | User can re-open a past analysis result | P1 |

#### FR-08 — File Handling Security
| ID | Requirement | Priority |
|---|---|---|
| FR-08-A | Uploaded file type is validated server-side (not just extension) | P0 |
| FR-08-B | File size is capped at 5 MB | P0 |
| FR-08-C | Files are not persisted to disk — processed in memory only | P0 |

---

### 1.2 Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Analysis complete in < 15 seconds (p95) |
| NFR-02 | Availability | API uptime ≥ 99.5% (Railway/Render) |
| NFR-03 | Security | All API routes use HTTPS; Clerk JWT required for write operations |
| NFR-04 | Privacy | Resume text is never logged to stdout or stored in unencrypted form |
| NFR-05 | Accessibility | WCAG 2.1 AA for the production Next.js app |
| NFR-06 | Scalability | LangGraph graph is stateless per request — horizontally scalable |

---

### 1.3 Out of Scope (MVP)

- Real-time streaming of partial agent results to the frontend
- Resume rewriting / one-click "fix my resume"
- Job board integration (LinkedIn, Indeed)
- Mobile native app
- Multi-language support (English only for MVP)

---

## 2. Core Entities

> This is stage **2** in the design sequence. Entities are the nouns of the system.

### Entity Map

```
┌─────────────┐     uploads      ┌──────────────┐
│    User     │ ───────────────► │    Resume    │
│  (Clerk ID) │                  │  (raw text)  │
└─────────────┘                  └──────┬───────┘
       │                                │
       │ submits                        │ parsed into
       ▼                                ▼
┌─────────────┐     triggers    ┌──────────────────┐
│  Analysis   │ ◄────────────── │  ResumeData      │
│  Request    │                 │  { roles, skills,│
└──────┬──────┘                 │   gaps, edu }    │
       │                        └──────────────────┘
       │ paired with
       ▼
┌─────────────┐     parsed into  ┌──────────────────┐
│    Job      │ ───────────────► │    JDData        │
│ Description │                  │ { title,keywords,│
│  (raw text) │                  │   reqs, level }  │
└─────────────┘                  └──────────────────┘
       │
       └──────────────────────────┐
                                  ▼
                        ┌──────────────────┐
                        │  AnalysisResult  │
                        │  { ats_score,    │
                        │    hidden_stren, │
                        │    bridge_plan,  │
                        │    missing_kw }  │
                        └──────────────────┘
                                  │
                                  │ saved to
                                  ▼
                        ┌──────────────────┐
                        │ analyses (table) │
                        │ Supabase Postgres│
                        └──────────────────┘
```

### Entity Definitions

#### `User`
```ts
{
  clerk_user_id: string          // Primary key (from Clerk JWT sub claim)
  email: string
  created_at: Date
}
```

#### `ResumeData` *(transient — not persisted independently)*
```ts
{
  roles: Array<{
    title: string
    company: string
    start_date: string           // "YYYY-MM" or "YYYY"
    end_date: string | "present"
    description: string
  }>
  skills: string[]
  career_gaps: Array<{
    from: string
    to: string
    duration_months: number
  }>
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
}
```

#### `JDData` *(transient — not persisted independently)*
```ts
{
  title: string
  keywords: string[]
  requirements: string[]
  seniority: "Junior" | "Mid" | "Senior" | "Lead" | "Director"
}
```

#### `AnalysisResult` *(persisted in `analyses.result` JSONB column)*
```ts
{
  ats_score: number              // 0–100
  missing_keywords: string[]
  gap_analysis: Array<{
    gap_period: string           // e.g. "Jan 2019 – Mar 2021"
    activity: string             // what was done during gap
    hidden_strength: string      // the transferable reframe
    mapped_skill: string         // JD-aligned skill name
  }>
  hidden_strengths_summary: string  // 1-paragraph narrative
  bridge_plan: Array<{
    action: string               // e.g. "Complete AWS Solutions Architect course"
    resource: string             // e.g. "A Cloud Guru — 30 hrs"
    time_estimate: string        // e.g. "3 weeks"
  }>
}
```

#### `analyses` *(Supabase Postgres table — persisted)*
```ts
{
  id: uuid                       // Primary key
  clerk_user_id: string          // FK → User
  created_at: timestamptz
  resume_text: text              // Raw extracted resume text
  jd_text: text                  // Raw JD text
  jd_title: string               // Extracted title for display in history
  result: JSONB                  // AnalysisResult shape above
}
```

---

### Entity Relationships

| From | Relationship | To | Cardinality |
|---|---|---|---|
| User | submits | Analysis Request | 1 : many |
| Analysis Request | produces | AnalysisResult | 1 : 1 |
| Analysis Request | contains | ResumeData | 1 : 1 |
| Analysis Request | contains | JDData | 1 : 1 |
| AnalysisResult | saved as | `analyses` row | 1 : 1 |

---

*Next → [DESIGN.md](./DESIGN.md) for API/Interface, Data Flow, High-level Design, and Deep Dives.*

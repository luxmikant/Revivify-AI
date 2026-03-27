# Career Returnship AI — Local Testing Plan

> Use this step-by-step guide to verify every feature of the MVP on your local machine.

---

## Prerequisites

Before testing, ensure all three services can start:

```
# Terminal 1 — API (port 3001)
cd apps/api
npm run dev

# Terminal 2 — Next.js Production App (port 3000)
cd apps/web
npm run dev

# Terminal 3 — (Optional) Vite Prototype (port 5173)
cd apps/prototype
npm run dev
```

Confirm `.env` in the project root has all keys populated:

| Variable | How to verify |
|---|---|
| `GOOGLE_API_KEY` | Non-empty, starts with `AIza` |
| `CLERK_SECRET_KEY` | Starts with `sk_test_` |
| `CLERK_PUBLISHABLE_KEY` | Starts with `pk_test_` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same as above |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same as above |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Long JWT string (eyJ...) |
| `SUPABASE_SERVICE_ROLE_KEY` | Long JWT string (eyJ...), must contain `"role":"service_role"` |

---

## Test 1 — API Health Check (no auth)

**What it tests:** Server is running, health route is public.

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/health -UseBasicParsing |
  Select-Object -ExpandProperty Content
```

**Expected:** `{"status":"ok","timestamp":"..."}` with status 200.

---

## Test 2 — Protected Route Without Auth (should reject)

**What it tests:** Clerk middleware blocks unauthenticated requests.

```powershell
try {
  Invoke-WebRequest -Uri http://localhost:3001/api/history -UseBasicParsing
} catch {
  $_.Exception.Response.StatusCode  # Should be 401 or 403
}
```

**Expected:** HTTP 401 or 403 with JSON error body.

---

## Test 3 — Landing Page (Next.js)

**What it tests:** Next.js app renders, Clerk loads, unauthenticated user sees landing page.

1. Open **http://localhost:3000** in a browser.
2. You should see the landing page with:
   - "Career Returnship AI" header (rose-to-amber gradient text)
   - "Your Career Break is a Superpower" hero text
   - Three feature cards: ATS Score Analysis, Hidden Strengths, Bridge Plan
   - A "Get Started" / "Sign In" button
3. You should **not** be redirected to `/analyze` (that requires auth).

**Pass criteria:** Page loads with no console errors, rose/amber color theme visible.

---

## Test 4 — Sign Up / Sign In (Clerk)

**What it tests:** FR-06-A — Clerk auth flow works.

1. From the landing page, click **Get Started** or **Sign In**.
2. Clerk modal should appear.
3. Sign up with email or Google OAuth.
4. After sign-in, you should be redirected to `/analyze`.
5. The Navbar should show the **UserButton** avatar (top-right).

**Pass criteria:** User is authenticated and sees the Analyze page.

---

## Test 5 — Resume Paste + JD Paste → Analyze (Core Flow)

**What it tests:** FR-01-C, FR-02-A, FR-03, FR-04, FR-05 — the entire AI pipeline.

1. Navigate to **http://localhost:3000/analyze** (must be signed in).
2. In the **Resume** textarea, paste a sample resume (see below).
3. In the **Job Description** textarea, paste a sample JD (see below).
4. Click **"Analyze My Resume"**.
5. The scanning animation should play (pulsing rose/amber circles + phase text).
6. After 5–15 seconds, results should appear:

| Section | What to check |
|---|---|
| **ATS Score Gauge** | A number 0–100 with animated count-up |
| **Missing Keywords** | Colored chips showing keywords the resume is missing |
| **Hidden Strengths** | Cards with `gap_period`, `hidden_strength`, `mapped_skill` |
| **Bridge Plan** | Exactly 3 action items with resource/time estimate |

**Pass criteria:** All 4 result sections render with non-empty data.

### Sample Resume Text
```
Jane Doe
Email: jane@example.com | Phone: (555) 123-4567

WORK EXPERIENCE

Product Manager, TechCorp Inc. — 2015 to 2019
- Led cross-functional team of 8 for SaaS product launch
- Increased user retention by 22% via data-driven feature prioritization
- Managed $1.2M annual product budget

Career Break — 2019 to 2024
- Full-time caregiver for two children
- Volunteered as PTA treasurer managing $50K annual budget
- Organized community fundraiser raising $15K for local school
- Completed Google Project Management Certificate (2023)

Freelance Consultant — 2024 to Present
- Advised 3 startups on go-to-market strategy
- Created investor pitch decks and competitive analysis reports

EDUCATION
B.S. Computer Science, State University — 2015

SKILLS
Project management, Agile/Scrum, SQL, Jira, stakeholder management,
budgeting, data analysis, Google Analytics, Figma, Slack
```

### Sample Job Description Text
```
Senior Product Manager — FinTech Startup

We're looking for a Senior Product Manager to own our payments platform.

Requirements:
- 5+ years of product management experience
- Experience with payment systems (Stripe, Plaid)
- Strong SQL and data analysis skills
- Agile/Scrum methodology
- Experience with A/B testing and experimentation frameworks
- Excellent stakeholder management and executive communication
- Familiarity with Figma and design sprints
- Experience scaling B2B SaaS products

Nice to have:
- FinTech or financial services background
- MBA or equivalent
- Experience managing remote teams
```

---

## Test 6 — Resume File Upload (PDF)

**What it tests:** FR-01-A, FR-08-A, FR-08-B, FR-08-C — upload flow.

1. On the Analyze page, click the **drop zone** or drag a `.pdf` file onto it.
2. The file name should appear in the drop zone.
3. The resume text should be extracted and populate the textarea (or used directly).
4. Proceed to analyze as in Test 5.

**Pass criteria:** PDF text is extracted without errors. Analysis runs on uploaded content.

> Repeat with a `.docx` file for FR-01-B.

---

## Test 7 — File Validation (Error Cases)

**What it tests:** FR-08-A, FR-08-B — server-side file guards.

| Action | Expected Result |
|---|---|
| Upload a `.txt` file | Error: "Only PDF and DOCX files are supported" |
| Upload a `.jpg` renamed to `.pdf` | Error (pdf-parse fails gracefully) |
| Upload a file > 5 MB | Error: "File too large" |

---

## Test 8 — Analysis History (List)

**What it tests:** FR-07-A, FR-07-B — saved analyses appear in history.

1. After completing Test 5 (at least one analysis), navigate to **http://localhost:3000/history**.
2. You should see a list of past analyses with:
   - Date/time
   - JD title (e.g., "Senior Product Manager")
   - ATS score
3. The most recent analysis should be at the top.

**Pass criteria:** At least 1 row appears matching the analysis you just ran.

---

## Test 9 — Analysis History (Detail View)

**What it tests:** FR-07-C — re-opening a past analysis.

1. On the History page, click a past analysis row.
2. The full result should load again:
   - ATS score, missing keywords, hidden strengths, bridge plan
   - Resume text and JD text should be available

**Pass criteria:** Full analysis result renders correctly from saved data.

---

## Test 10 — Sign Out and Route Protection

**What it tests:** FR-06-B — auth gating.

1. Click the **UserButton** → **Sign Out**.
2. You should be redirected to `/` (landing page).
3. Try navigating directly to **http://localhost:3000/analyze**.
4. You should be redirected to sign-in (not see the analyze page).
5. Try **http://localhost:3000/history**.
6. Same — redirect to sign-in.

**Pass criteria:** Unauthenticated users cannot access `/analyze` or `/history`.

---

## Test 11 — API Direct Calls (for debugging)

Use these PowerShell commands if you need to test the API in isolation. You'll need a valid Clerk session token — get it from your browser's DevTools → Application → Cookies → `__session`.

```powershell
$token = "YOUR_CLERK_SESSION_TOKEN"
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type"  = "application/json"
}

# Upload a file
# Use Invoke-RestMethod with a form-data body

# Analyze
$body = @{
  resumeText = "Jane Doe, Product Manager at TechCorp 2015-2019, Career break 2019-2024"
  jdText     = "Senior PM role, 5+ years experience, SQL, Agile required"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/analyze `
  -Method POST -Headers $headers -Body $body

# History list
Invoke-RestMethod -Uri http://localhost:3001/api/history `
  -Method GET -Headers $headers

# History detail (use an ID from the list)
Invoke-RestMethod -Uri http://localhost:3001/api/history/<ID> `
  -Method GET -Headers $headers
```

---

## Test 12 — Prototype App (Optional)

If you also want to verify the Vite prototype:

1. Start it: `cd apps/prototype && npm run dev`
2. Open **http://localhost:5173**.
3. Sign in via Clerk.
4. Run the same analyze/history tests as above.
5. Verify the rose/amber color scheme.

---

## Test 13 — Edge Cases

| Scenario | Expected Behavior |
|---|---|
| Empty resume text, click Analyze | 422 error with "resumeText and jdText are required" message |
| Empty JD text, click Analyze | Same 422 error |
| Very short resume ("Hi") | Analysis runs but scores low |
| Very long resume (>10,000 words) | Should work (1 MB JSON limit) |
| Network disconnected mid-analysis | Error message shown, no crash |
| Supabase down during analyze | Analysis still returns results (DB save is non-fatal) |

---

## Verification Checklist

After running all tests, tick off:

- [ ] API health returns 200
- [ ] Unauthenticated API calls are rejected
- [ ] Landing page loads with rose/amber theme
- [ ] Clerk sign-up/sign-in works
- [ ] Resume paste + JD paste → full analysis results
- [ ] PDF upload extracts text correctly
- [ ] DOCX upload extracts text correctly
- [ ] Invalid file types are rejected
- [ ] Analysis saved to Supabase
- [ ] History list shows past analyses
- [ ] History detail loads full result
- [ ] Sign out redirects to landing
- [ ] Protected routes redirect to sign-in when not auth'd
- [ ] ATS score gauge animates
- [ ] Missing keywords display as chips
- [ ] Hidden strengths show gap_period + mapped_skill
- [ ] Bridge plan has exactly 3 items
- [ ] Color scheme is rose/amber (no violet/purple)

---

## Startup Commands (Quick Reference)

```powershell
# From project root (e:\womenDay)

# 1. API
cd apps/api; npm run dev

# 2. Next.js (separate terminal)
cd apps/web; npm run dev

# 3. Prototype (separate terminal, optional)
cd apps/prototype; npm run dev
```

All three read `.env` from the project root automatically.

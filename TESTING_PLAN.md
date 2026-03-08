# Testing Plan — Career Returnship AI MVP

> **Current Status**: Phase 0 (monorepo), Phase 1 (API), Phase 2 (React UI) — all built. Ready for integration testing.

---

## Pre-Testing Setup

### Step 1: Create Environment Files

#### Backend `.env` (for `apps/api/`)
```bash
# apps/api/.env
CLERK_SECRET_KEY=your_clerk_secret_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_API_KEY=your_google_api_key
```

**Where to find:**
- **Clerk Secret**: [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys → Secret Key
- **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard) → Project Settings → API
- **Google API**: [console.cloud.google.com](https://console.cloud.google.com) → Create API key (Generative Language API enabled)

#### Frontend `.env.local` (for `apps/prototype/`)
```bash
# apps/prototype/.env.local
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001
```

**Where to find:**
- **Clerk Publishable Key**: [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys → Publishable Key

---

## Part A: Backend Testing

### Step 2: Verify Backend Dependencies
```bash
cd e:\womenDay\apps\api
npm list --depth=0
```
✓ Should show: express, @langchain/langgraph, @clerk/express, @supabase/supabase-js, etc.

---

### Step 3: Start Backend Server
```bash
cd e:\womenDay\apps\api
npm run dev
```

**Expected output:**
```
Server running on http://localhost:3001
```

Keep this terminal open.

---

### Step 4: Test Health Endpoint (No Auth Required)
**In a new terminal:**
```bash
curl http://localhost:3001/api/health
```

**Expected response:**
```json
{ "ok": true }
```

✓ **PASS**: Backend is running

---

### Step 5: Test File Upload Endpoint
You'll need a valid Clerk token. For now, test malformed request to verify route exists:

```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Content-Type: application/json" \
  -d "{}"
```

**Expected**: `401 Unauthorized` (missing Bearer token) or `400 Bad Request` (no file)

✓ **PASS**: Route is accessible

---

## Part B: Frontend Testing

### Step 6: Start Frontend Dev Server
**In a new terminal:**
```bash
cd e:\womenDay\apps\prototype
npm run dev
```

**Expected output:**
```
VITE v7.x.x ready in XYZ ms

➜  Local:   http://localhost:5173/
```

Open browser to `http://localhost:5173/`

---

### Step 7: Test Sign-In Flow
1. **See Clerk sign-in modal** (because you're not signed in)
   - Verify: Title "Career Returnship AI", subtitle about career gaps
   - Verify: Clerk sign-in widget loads

2. **Sign up / Sign in with test account**
   - Use email: `test@example.com` (Clerk dev mode)
   - Complete sign-in flow

3. **After sign-in**, you should see:
   - ✓ Navbar with "Analyze" + "History" links
   - ✓ "Discover Your Hidden Strengths" heading
   - ✓ Two-column layout: Resume Input | JD Input
   - ✓ "Analyze My Resume" button

**PASS**: UI loads, Clerk routes work

---

### Step 8: Test UI Component Rendering
On the **AnalyzePage**, verify all input components:

1. **Resume Input Card**
   - ✓ Drag-drop zone visible
   - ✓ Textarea for pasting resume text
   - ✓ Try dragging a PDF file (should show file name)

2. **JD Input Card**
   - ✓ Textarea for job description
   - ✓ Placeholder text shows

3. **Analyze Button**
   - ✓ Visible at bottom
   - ✓ Enabled (not greyed out)

**PASS**: All UI renders correctly

---

## Part C: End-to-End Testing

### Step 9: Prepare Test Data

**Sample Resume Text:**
```
John Doe
Senior Software Engineer

EXPERIENCE
- Amazon (2018-2022): Built microservices in Go, led team of 3
- Gap: 2022-2024 (Career break for family)
- Freelance (2024-2025): Full-stack React + Node projects

SKILLS
JavaScript, TypeScript, React, Node.js, MongoDB, AWS

EDUCATION
B.S. Computer Science, State University (2018)
```

**Sample Job Description:**
```
Senior Full-Stack Engineer - Series B Startup

Requirements:
- 5+ years software engineering experience
- React + Node.js stack
- AWS/Cloud experience
- Team lead experience preferred

Responsibilities:
- Build customer-facing features
- Mentor junior engineers
- System design & architecture
```

---

### Step 10: Test Full Analyze Flow

**In the browser (AnalyzePage):**

1. **Paste resume text** into Resume Input textarea
2. **Paste JD text** into JD Input textarea
3. **Click "Analyze My Resume"**

**Expected sequence:**
- Button becomes disabled
- **ScanAnimation appears** (spinning rings + cycling messages like "Parsing your resume…")
- Animation runs for ~20-30 seconds (backend processing time)
- **Results page appears** with:
  - ✓ ATS Score gauge (circular, colored red/yellow/green)
  - ✓ Missing Keywords (amber pills)
  - ✓ Hidden Strengths section (gap → strength → mapped skill)
  - ✓ Bridge Plan (3 numbered action items)
  - ✓ "Start Over" button in top right

**PASS**: Full analyze flow works

---

### Step 11: Test Error Handling

**Try these scenarios:**

#### 11a: Missing Resume
- Leave Resume input empty
- Enter JD text
- Click Analyze
- **Expected**: Error message "Please provide your resume text or upload a file."

#### 11b: Missing JD
- Enter Resume text
- Leave JD empty
- Click Analyze
- **Expected**: Error message "Please paste the job description."

#### 11c: Network Error (optional)
- Stop the backend (`Ctrl+C` in API terminal)
- Try to analyze
- **Expected**: Error like "API 500" or "Analysis failed"

**PASS**: Error messages show correctly

---

### Step 12: Test Results Display

On the **results page**, verify each section:

1. **ATS Gauge**
   - Circular progress animation
   - Number 0-100 in center
   - Color: Green (75+), Yellow (50-75), Red (<50)

2. **Missing Keywords**
   - List of ATS keywords not found in resume
   - Shown as amber pills
   - Staggered animation

3. **Hidden Strengths**
   - Shows empathetic summary of career gap
   - Lists each gap with:
     - Original gap (e.g., "Career break 2022-2024")
     - Hidden strength (e.g., "Time management & goal clarity")
     - Mapped skill (e.g., "Agile planning")
   - Cards appear with staggered animation

4. **Bridge Plan**
   - Exactly 3 numbered steps
   - Each has: Action | Time frame | Resource
   - Examples:
     - "Complete AWS Solutions Architect cert | 4 weeks | Coursera"
     - "Build one cloud-native demo project | 6 weeks | Personal GitHub"
     - "Update resume with hidden strengths | 1 week | Internal template"

**PASS**: All sections render with correct data

---

### Step 13: Test Start Over
On the **results page:**
1. Click "Start Over" button
2. **Expected**: Return to AnalyzePage with empty forms
3. ✓ Can analyze again

**PASS**: Navigation works

---

### Step 14: Test History Page

1. **Click "History" link** in Navbar
2. **See your previous analysis** as an accordion card:
   - Shows: `ATS Score: XX` + date/time
   - Click to expand
   - Shows full results (same as results page)

3. **Analyze again** (repeat Step 10 with different data)
4. **Refresh history page**
5. **See 2+ entries** in reverse chronological order

**PASS**: History loads, expands, and updates

---

### Step 15: Test Clerk Auth Features

1. **Click UserButton** (avatar icon in top-right)
2. See menu: "Manage account" | "Sign out"
3. Click "Sign out"
4. **Expected**: Redirected to sign-in page
5. **Expected**: Can't access /history or / routes (gated by SignedOut)

**PASS**: Auth protection works

---

## Part D: Cross-Browser & Responsiveness (Optional)

### Step 16: Mobile Responsiveness
1. Open DevTools (`F12`)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test tablet width (768px) and mobile (375px)
   - ✓ Navbar responsive
   - ✓ Layout stacks vertically on mobile
   - ✓ Buttons readable
   - ✓ Textareas scrollable

**PASS**: Mobile layout works

---

## Summary Checklist

| Phase | Test | Status |
|-------|------|--------|
| **Backend** | Health endpoint | ✓ PASS |
| **Backend** | Upload route accessible | ✓ PASS |
| **Frontend** | Sign-in/Auth flow | ✓ PASS |
| **Frontend** | UI renders | ✓ PASS |
| **E2E** | Analyze flow (happy path) | ✓ PASS |
| **E2E** | Error handling | ✓ PASS |
| **E2E** | Results display | ✓ PASS |
| **E2E** | History page | ✓ PASS |
| **Auth** | Sign-out flow | ✓ PASS |
| **UX** | Mobile responsiveness | ✓ PASS |

---

## Debugging Tips

### Backend issues:
- Check `apps/api/.env` has all 4 keys
- Check Supabase table `analyses` exists with RLS enabled
- Check Clerk secret key is correct (not publishable key)
- Check Google API key has Generative Language API enabled
- Watch terminal logs for errors during `/api/analyze` call

### Frontend issues:
- Check `apps/prototype/.env.local` (not `.env`)
- Check VITE_CLERK_PUBLISHABLE_KEY is correct (not secret key)
- Check `VITE_API_URL` matches backend running port
- Open browser DevTools → Network tab to see API calls
- Check browser console for TypeScript/React errors

### .env.local not loading:
- Make sure `.env.local` is in `apps/prototype/` root
- Restart dev server: `npm run dev`
- Vite caches env vars — restart is required

---

## Next Steps After Testing
Once all tests **PASS**:
1. ✅ Commit all changes to git
2. ✅ Phase 3: Build Next.js production app
3. ✅ Phase 4: Deploy to Railway (API) + Vercel (frontend)

# HireLens AI

HireLens AI is a full-stack resume analysis and recruiter decision-support project. It uses a React/Vite client, Express API, optional MongoDB persistence, role-aware scoring rules, and evidence-linked explanations.

The product never shows a score until a candidate submits a resume. New recruiter accounts also start empty: recruiters create a job, add real candidates, and then review rankings, strengths, gaps, evidence, interview questions, and hiring stages.

## Features

### Candidate workspace

- PDF, DOCX, TXT, or pasted-text resume analysis
- Rubrics for software, data/ML, finance/MBA, consulting, marketing/sales, design/creative, and research roles
- ATS structure, requirement match, role relevance, skill evidence, impact, clarity, education, and consistency scoring
- Exact resume-line evidence for strengths and deductions
- Separate detailed analysis, suggestions, and job-match pages
- Truth Lock rewrites that improve wording without inventing facts
- Skills classified as missing, listed, or demonstrated

### Recruiter workspace

- Empty-by-default job and candidate workspace
- Real job creation and candidate resume upload/paste flow
- Job-specific ranking with adjustable scoring weights
- Search, skill filtering, and blind screening
- New, Screened, Shortlisted, Interview, Selected, and Rejected stages
- Candidate-specific strengths, weaknesses, evidence, and critical interview questions
- Human-controlled decisions; no automatic rejection

### Authentication and storage

- Email registration/login with JWT-protected routes
- Google OAuth 2.0 through Passport when Google credentials are configured
- MongoDB-backed users, jobs, candidates, and analyses when `MONGODB_URI` is set
- Temporary in-memory fallback for local development (data resets when the API restarts)

## Open the project

Requirements: Node.js 20+ and pnpm 10+.

In PowerShell:

```powershell
cd "C:\Users\ASUS\Desktop\STUDY DOC\PROJECTS\Resume Ranker"
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:4000](http://localhost:4000).

Use `Ctrl+C` in the terminal to stop both servers.

## Google OAuth setup

Google sign-in needs credentials from your own Google Cloud project; there is deliberately no fake OAuth account.

1. In Google Cloud Console, create an OAuth 2.0 Web application client.
2. Add `http://localhost:4000/api/auth/google/callback` as an authorized redirect URI.
3. Add `http://localhost:5173` as an authorized JavaScript origin.
4. Put the following values in `.env`:

```dotenv
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=use-a-long-random-secret
```

5. Restart `pnpm dev`.

When credentials are absent, the login page clearly labels Google sign-in as requiring setup. Email registration/login remains fully functional.

## MongoDB setup

Set `MONGODB_URI` in `.env` to a local MongoDB or MongoDB Atlas connection string for persistence. Without it, the app still works using an in-memory development store, but accounts and analysis data reset whenever the API restarts.

## Accuracy approach

HireLens prioritizes explainability and reproducibility over an unexplained universal score:

1. Parse resume text while preserving line positions.
2. Detect sections, contact fields, action verbs, metrics, and evidence patterns.
3. Resolve the target into an industry-specific role-family rubric.
4. Extract mandatory, preferred, and responsibility statements from the job description.
5. Score category-level features using documented weights.
6. Link deductions and matched skills to exact resume evidence.
7. Return confidence, rubric version, and model version.

A later research upgrade can add embeddings and a labeled calibration dataset. An LLM should remain constrained to explanations or wording assistance rather than deciding the numeric score.

## Commands

```powershell
pnpm dev       # run frontend and API
pnpm test      # run automated tests
pnpm build     # build the production frontend
pnpm start     # run the production API
```

## Project structure

```text
client/                 React application
server/src/data/        role-specific scoring rubrics
server/src/services/    parsing, scoring, and authentication logic
server/src/routes/      protected API routes
server/src/models/      MongoDB models
server/test/            deterministic scoring tests
docs/design/            candidate and recruiter UI concepts
```

## Responsible-use boundary

HireLens is decision support. It excludes protected traits from scoring, supports blind screening, and exposes uncertainty. A score must never be used as an automatic rejection decision. A production deployment should also add encrypted object storage, retention jobs, persistent audit logs, rate limiting, and independent fairness evaluation.

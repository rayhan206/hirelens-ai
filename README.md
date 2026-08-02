# HireLens AI

HireLens AI is a dual-mode resume intelligence project for candidates and recruiters. It combines role-specific rubrics, deterministic NLP-style rules, evidence linking and optional cloud services in a MERN architecture that is realistic for a B.Tech project.

The important design choice is that HireLens does **not** produce a mysterious universal ATS score. Every analysis is tied to a target role, seniority and optional job description. Major deductions link to a resume line or a missing requirement, and recruiters retain control over every hiring decision.

## What works

### Candidate workspace

- PDF, DOCX, TXT or pasted-text analysis
- Role-specific rubrics for software, data/ML, finance/MBA, consulting, marketing/sales, design/creative and research roles
- ATS structure, requirement match, role relevance, skill evidence, impact, clarity, education and consistency scoring
- Evidence-linked strengths and “Why you lost marks” explanations
- Skills classified as missing, listed or demonstrated
- Truth Lock rewrites that preserve facts and ask for missing metrics
- Potential-score simulator clearly labelled as a simulation
- Job-description requirement extraction

### Recruiter workspace

- Job-specific ranking table with configurable weights
- Skill filters, search and blind-screening mode
- Candidate comparison selection and hiring stages
- Evidence, strengths, gaps, uncertainty and private notes
- Resume-grounded interview questions
- Explicit human-control notice; no automated rejection

### Authentication and data

- Shared JWT authentication with role-based Express middleware and protected React routes
- Google OAuth 2.0 through Passport when credentials are configured
- Email registration/login and one-click demo accounts
- MongoDB-backed users and analyses when `MONGODB_URI` is present
- Safe in-memory fallback for an immediate local demo

## Architecture

```text
React + Vite
   │ secure cookie / JSON / multipart
Express API ───── MongoDB (optional locally)
   ├─ auth + role middleware
   ├─ PDF/DOCX parsing
   ├─ role/JD scoring engine
   └─ recruiter reranking
```

This intentionally starts with one frontend, one API and one database. A small FastAPI embedding service and BullMQ worker are documented upgrades after the deterministic baseline has a labelled evaluation set; they are not required to run this version.

## Quick start

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and choose either demo account. The API runs on [http://localhost:4000](http://localhost:4000).

The app runs without MongoDB, Google or OpenAI credentials. That is intentional: reviewers can demo the full interaction flow immediately.

## Google OAuth setup

1. Create a Web OAuth client in Google Cloud Console.
2. Add `http://localhost:4000/api/auth/google/callback` as an authorised redirect URI.
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `JWT_SECRET` in `.env`.
4. Restart `pnpm dev`.

Without credentials, the Google button explains that OAuth is not configured and the demo login remains available.

## MongoDB setup

Set `MONGODB_URI` to a local MongoDB or Atlas connection string. When present, registered users and completed candidate analyses are persisted. Without it, the server uses an in-memory store that resets on restart.

## Accuracy approach

The first release favours precision and explainability over an impressive-sounding custom model:

1. Parse document text and preserve line positions.
2. Detect sections, contact fields, action verbs, metrics and common evidence patterns.
3. Resolve the target into a role-family rubric.
4. Extract mandatory, preferred and responsibility statements from a pasted job description.
5. Score category-level features with documented weights.
6. Link matched skills and deductions to exact evidence lines.
7. Return confidence, rubric version and model version for reproducibility.

The next accuracy upgrade should add sentence-transformer embeddings and a labelled calibration set. Learning-to-rank should only be added after recruiter pairwise feedback exists. Multiple LLMs are deliberately avoided: they add cost and disagreement without improving the transparent baseline. An LLM can later be used only for constrained wording and explanation, never as the source of the numeric score.

## Commands

```bash
pnpm dev       # frontend + API
pnpm test      # scoring tests + frontend test runner
pnpm build     # production frontend build
pnpm start     # production API
```

## Project structure

```text
client/                 React product UI
server/src/data/        role rubrics and recruiter demo evidence
server/src/services/    parsing, scoring and auth logic
server/src/routes/      protected API routes
server/src/models/      MongoDB models
server/test/            deterministic scoring tests
docs/design/            accepted candidate/recruiter UI concepts
```

## Responsible-use boundary

HireLens is decision support. It excludes protected traits from scoring, supports blind screening and presents uncertainty. A score must never be used as an automatic rejection decision. Production deployment should also add encrypted object storage, retention jobs, audit-log persistence, rate limiting and independent fairness evaluation.

# HireLens AI Interview and Viva Preparation

This guide contains easy-to-medium questions that can be asked directly about HireLens AI or about the technologies used in it. The model answers are deliberately concise so they can be spoken naturally. Do not memorise every sentence; understand the idea and connect it to a real file or feature.

## How to answer project questions

Use this four-part structure:

1. **Problem:** what user problem exists?
2. **Decision:** what technology or algorithm did you choose?
3. **Implementation:** where and how is it implemented?
4. **Trade-off:** what limitation remains and what would you do next?

Example:

> Resume keyword matching can reward a skill that appears only in the Skills section. I therefore classify evidence as missing, listed or demonstrated. The scoring engine searches all occurrences and keeps the strongest one, but demonstration requires an experience-style section plus an action, outcome or metric. This is explainable, although a semantic model could later improve synonym coverage.

## Part A: Project-specific questions

### Easy

### 1. What is HireLens AI?

HireLens AI is a full-stack resume analyser and recruiter decision-support application. Candidates receive role-specific evidence, suggested improvements, job matching and a learning roadmap. Recruiters create jobs, rank real candidates, inspect evidence, generate interview questions and update hiring stages.

### 2. What problem does the project solve?

It solves the lack of transparent, role-specific resume feedback. Many tools return generic scores or reward keywords. HireLens links feedback to exact resume lines, distinguishes a listed skill from demonstrated use and gives complete truth-safe improvements.

### 3. Who are the two main users?

Candidates and employers/recruiters. Their pages and API permissions are separated by the `role` field in the authenticated user.

### 4. Why does a new account show no score or candidates?

The system is empty by default to avoid misleading dummy data. A candidate receives a score only after uploading or pasting a resume. A recruiter receives rankings only after creating a job and adding real candidate resumes.

### 5. What resume formats are supported?

PDF, DOCX and TXT files, plus pasted resume text. Multer accepts the upload in memory, `pdf-parse` extracts PDF text, Mammoth extracts DOCX text and TXT is decoded as UTF-8.

### 6. What is the maximum upload size?

Eight megabytes. The limit is set in the Multer configuration for both candidate and recruiter resume endpoints.

### 7. Which role families are supported?

Software Engineering, Data & ML, Finance & MBA, Consulting, Marketing & Sales, Design & Creative and Research & Academic.

### 8. What is the difference between score and confidence?

The score represents resume/job evidence quality according to the rubric. Confidence represents how much trustworthy input the parser found, such as sections, lines, bullets and an optional job description. A resume can have a low score but high confidence.

### 9. What are the nine scoring categories?

ATS structure, mandatory match, role relevance, skill evidence, impact, clarity, education fit, consistency and role presentation.

### 10. What is a truth-safe rewrite?

It is a better sentence structure that does not invent facts. Missing details are shown in square brackets, such as `[verified outcome]`, and the candidate must replace them with something real.

### 11. What does Roadmap mode do?

It turns detected skill gaps into an ordered plan: learn high-priority foundations, build portfolio proof and practise role-specific interview topics. Every step includes a reason, estimated time, learning task and deliverable.

### 12. Where is roadmap progress stored?

In browser `localStorage` under `hirelens_roadmap_progress`. This keeps the implementation simple and survives reloads, but it does not currently sync between devices.

### 13. What recruiter stages are supported?

New, Screened, Shortlisted, Interview, Selected and Rejected.

### 14. What is blind screening?

It hides the displayed candidate name and initials and replaces them with a rank-based alias such as Candidate 01. The current version can still reveal identity through filenames or excerpts, so complete production blind screening would redact those too.

### 15. Does the system automatically reject candidates?

No. It is explicitly decision support. The recruiter controls stage changes and final decisions.

### Medium

### 16. Explain the complete resume-analysis data flow.

The React form sends multipart data to `POST /api/analysis/resume`. The backend verifies the JWT and candidate role, parses the file when needed, runs `analyzeResume`, stores the result in MongoDB or memory and returns structured JSON. React context stores the result and the pages display its score, evidence, suggestions, match groups and roadmap.

### 17. How is a target role converted into a rubric?

`resolveRole` checks the target-role text with patterns. For example, “data”, “machine learning”, “analytics” or “AI” maps to the data rubric, while “UX”, “UI” or “design” maps to design. Unknown titles fall back to software.

### 18. How does the project avoid simple keyword stuffing?

A skill in the Skills section is only `listed`. It becomes `demonstrated` when a matching line appears in an evidence section such as Experience or Projects and also contains an action, metric or outcome. Ranking and guidance favour demonstrated evidence.

### 19. Why does the engine keep the strongest occurrence of a skill?

A resume may mention React in Skills first and later show a strong React project. If the engine stopped at the first match, it would incorrectly classify React as only listed. Each occurrence is ranked and the strongest one wins.

### 20. How is the overall score calculated?

Every category is bounded from 0 to 100. The engine multiplies each category by its documented percentage weight, adds the contributions and clamps the result to 0–100.

### 21. How are mandatory and preferred job requirements detected?

The job description is split into sentences. Sentences containing words such as `must`, `required` or `essential` are mandatory. Terms such as `preferred`, `bonus` or `nice to have` are preferred. Other sentences are treated as responsibilities.

### 22. How are requirement sentences matched to the resume?

The engine extracts signals from known role skills and meaningful non-stopword phrases. It then checks how many signals appear in the cleaned resume. A requirement is matched only when a sufficient proportion of signals is present.

### 23. How does HireLens detect impact?

It detects measurable scale such as percentages, money, users, records or time, plus outcome words such as increased, reduced, improved, accuracy, revenue or latency. The ratio of metric and outcome bullets contributes to the Impact category.

### 24. How does it detect weak writing?

Regular expressions identify weak openings such as “worked on”, “worked with” and “responsible for”, bullets without action verbs, long bullets, vague personality claims, first-person wording, duplicates and selected spelling mistakes.

### 25. How was the bad “Contributed to worked...” bug fixed?

Weak openings are now parsed before rewriting. “Worked with tools...” gets a role-specific `Analyzed ... using ... producing ...` structure for data roles. Tests assert that the result is grammatical and can never contain “Contributed to worked”.

### 26. How are recruiter fit scores different from the candidate score?

The candidate score uses nine fixed categories. Recruiter fit groups those categories into five features—skills, experience, evidence, impact and education—and applies recruiter-selected weights normalised by their total.

### 27. Does changing recruiter weights rerun resume parsing?

No. It reuses stored category scores and recomputes the aggregate fit. This is faster and preserves the underlying evidence.

### 28. How are profile-based interview questions created?

The endpoint reads the candidate's stored analysis and builds questions from the strongest evidence, top gap, one demonstrated skill and the target role. The current version uses controlled templates, so it works without an LLM.

### 29. Where is machine learning used?

The current core is not a trained ML model. It is an explainable rule-based NLP baseline using feature engineering, curated rubrics and weighted scoring. The OpenAI SDK is present for future constrained explanations, but it is not used to calculate scores. A future evaluation could compare this baseline with TF-IDF, embeddings or learning-to-rank models.

### 30. Why did you not use an LLM for the numeric score?

Deterministic scoring is reproducible, testable and easier to audit. LLM outputs can vary and may invent unsupported claims. An LLM is better considered later for grounded explanations, with structured evidence, schema validation and no authority over hiring decisions.

### 31. What happens when MongoDB is unavailable?

The project uses in-memory Maps so a local demo still runs. Data is lost on API restart, so the fallback is explicitly development-only.

### 32. What important recruiter controls are not fully completed?

The stage filter checkboxes, stage tabs, Compare and Edit rubric controls are visible scaffolds. Search, reranking, blind name/initial masking, stage updates and candidate-question generation are implemented.

### 33. How would you improve scoring accuracy?

Create a labelled multi-role dataset, measure extraction precision/recall and ranking NDCG, extend aliases, compare keyword and embedding baselines, calibrate score bands and audit errors separately for each role and seniority.

### 34. How would you deploy the project safely?

Build the React client, run Express behind HTTPS, use MongoDB, set a strong JWT secret, configure production OAuth callbacks, add rate limiting and CSRF protection, use encrypted object storage, define retention/deletion policies, add monitoring and never use the memory fallback.

### 35. What is the most important ethical limitation?

A resume score cannot represent a person's full capability and can reproduce labour-market bias. The system must remain decision support, show evidence and uncertainty, support corrections and never auto-reject candidates.

## Part B: React questions

### Easy

### 36. What is a React component?

A reusable function that returns UI. HireLens separates pages, shells, modals, providers and shared elements into components.

### 37. What is state in React?

State is data that changes over time and causes a component to rerender. Examples are the selected deduction, modal visibility, recruiter weights and roadmap completion.

### 38. What is the purpose of `useEffect`?

It runs side effects after rendering. HireLens uses it to load the authenticated user, fetch the latest analysis/jobs, trigger reranking and persist roadmap progress.

### 39. What is the purpose of `useMemo`?

It memoises a derived value until its dependencies change. The recruiter candidate search and flattened roadmap steps use derived data rather than storing duplicate state.

### 40. Why use React Context?

Context shares data across distant components without passing props through every layer. `AuthProvider` shares the current user and auth actions, while `CandidateProvider` shares the latest analysis.

### 41. What is a controlled input?

Its value comes from React state and changes through an event handler. The recruiter search box and weight sliders are controlled inputs.

### 42. Why are `key` props needed in lists?

They give list items stable identities so React can efficiently update the correct elements. HireLens uses candidate IDs, rewrite line numbers and skill names as keys.

### Medium

### 43. Why use a protected route component?

Client-side protection improves navigation and redirects users away from the wrong workspace. It is not the security boundary; backend JWT and role middleware enforce real access.

### 44. What is a stale closure in React?

A function can capture old state from the render in which it was created. Functional updates such as `setDecisions(current => ...)` avoid depending on stale captured values.

### 45. Why does the reranking effect use a timeout and cleanup?

The timeout debounces rapid slider changes. Cleanup cancels the previous request timer when a new value arrives, reducing API calls and race conditions.

### 46. Why should derived data usually not be stored separately?

Duplicate state can become inconsistent. The visible candidate list is derived from `candidates` and `search`; it does not need its own independent state.

### 47. What is the benefit of a shared API helper?

It centralises cookie credentials, content types, response parsing and error handling. Components focus on user interaction rather than repeating networking boilerplate.

## Part C: Node.js and Express questions

### Easy

### 48. What is Node.js?

Node.js is a JavaScript runtime outside the browser. It runs the HireLens Express API and scoring logic.

### 49. What is Express middleware?

A function in the request-response chain that can inspect or modify the request, return a response or call `next`. HireLens uses middleware for Helmet, CORS, JSON parsing, cookies, logging and authentication.

### 50. What is a REST API?

An HTTP interface organised around resources and operations. HireLens uses routes for auth, analyses, jobs, candidates, rankings and stages.

### 51. What is the difference between GET, POST, PATCH and DELETE?

- GET reads data.
- POST creates data or starts an operation.
- PATCH partially updates a resource.
- DELETE removes data.

### 52. Why use `multer.memoryStorage()`?

It exposes the uploaded resume as a Buffer for immediate parsing without writing temporary files to disk. The trade-off is memory usage, so the file size is limited.

### 53. Why use environment variables?

They keep deployment-specific configuration and secrets out of source code, including MongoDB, JWT, OAuth and optional OpenAI credentials.

### Medium

### 54. How does Express error handling work here?

Routes either return validation-specific responses or pass/throw errors. A final error middleware returns a JSON message and status. A larger production app would use a shared async wrapper and typed domain errors.

### 55. Why is input validation important?

Client validation can be bypassed. Backend validation protects the database and business rules. HireLens validates auth input with Zod, stage values with an allow-list and job titles manually.

### 56. What is the purpose of CORS?

CORS tells the browser which origin may call the API. HireLens allows the configured React client origin and credentials so the browser can send the auth cookie.

### 57. Why is the Vite proxy useful?

The browser calls `/api` on the frontend origin, and Vite forwards it to port 4000. Components avoid environment-specific API URLs, and local CORS behaviour is simpler.

### 58. What HTTP status codes are used?

Typical examples are 201 for created users/jobs/candidates, 400 for invalid input, 401 for missing/invalid login, 403 for wrong role, 404 for missing job/candidate and 200 for normal success.

## Part D: MongoDB and database questions

### Easy

### 59. Why use MongoDB?

Analysis results are nested documents containing categories, evidence, skills, rewrites and roadmaps. MongoDB stores this shape naturally, and it fits a MERN project.

### 60. What is Mongoose?

An object modelling library for MongoDB. It defines schemas, validation, indexes and model methods for User, Job, Candidate and Analysis.

### 61. What is a schema?

A definition of expected document fields and constraints. For example, the User schema requires a unique email and restricts role to candidate or employer.

### 62. What is an index?

A data structure that speeds queries at the cost of storage and write overhead. HireLens indexes fields such as user email, owner ID, job ID and analysis user ID.

### Medium

### 63. Why store an analysis snapshot in Candidate?

A recruiter's candidate must preserve the evidence calculated for that job. Keeping the complete result makes rendering and reranking fast, though schema versioning is necessary when the result format changes.

### 64. What is the disadvantage of `Schema.Types.Mixed`?

It is flexible but provides limited schema validation for nested analysis data. A mature version could define sub-schemas or store versioned analysis documents separately.

### 65. What is the difference between MongoDB and the in-memory fallback?

MongoDB persists data across restarts and supports database queries. A Map exists only inside one Node process and loses all data when the process ends.

### 66. What is `lean()` in Mongoose?

It returns plain JavaScript objects instead of full Mongoose documents, reducing overhead for read-only responses. The latest-analysis route uses it.

## Part E: Authentication, OAuth and security questions

### Easy

### 67. Why hash passwords?

Passwords must not be stored in plain text. bcrypt creates a slow salted hash, so even the database does not contain the original password.

### 68. What is a JWT?

A signed token containing claims. HireLens stores user ID, role, email and name, signs it with the server secret and sets a seven-day expiry.

### 69. Why use an HTTP-only cookie?

Browser JavaScript cannot read an HTTP-only cookie, which reduces token theft through many XSS attacks. The browser still sends it automatically to the API.

### 70. What is OAuth 2.0?

OAuth allows a user to authorise an application through a provider such as Google without giving the application their Google password.

### 71. Is OAuth the same as authorisation inside HireLens?

No. Google authenticates identity. HireLens still creates a local user role and uses its own JWT and role middleware to authorise candidate or employer actions.

### Medium

### 72. What are `SameSite` and `Secure` cookie attributes?

`SameSite=Lax` limits when browsers send cookies during cross-site navigation, reducing CSRF risk. `Secure` restricts transmission to HTTPS and is enabled in production.

### 73. What is CSRF, and is SameSite enough?

CSRF tricks a logged-in browser into sending an unwanted request. SameSite helps but is not a complete production strategy. Sensitive deployments should add CSRF tokens or strict origin checks.

### 74. What does Helmet do?

Helmet sets several HTTP security headers. It reduces common browser-side risks, but it does not replace input validation, authentication or secure deployment.

### 75. Why enforce roles on the server if the UI hides pages?

Attackers can call endpoints directly. Server middleware is the actual security boundary; client routing is only a usability layer.

### 76. What is the risk of a fallback JWT secret?

A known development secret lets an attacker forge tokens. Production must require a long random `JWT_SECRET` and fail to start if it is missing.

## Part F: NLP, scoring and ML questions

### Easy

### 77. What is tokenisation?

Splitting text into smaller units such as words or phrases. HireLens normalises text and tokenises meaningful job-description signals.

### 78. What is a regular expression?

A pattern for finding text. HireLens uses regex for section headings, bullet markers, contacts, actions, metrics, outcomes, weak openings and typos.

### 79. What is feature engineering?

Converting raw data into measurable signals for an algorithm. Examples are contact count, section coverage, action-bullet ratio, demonstrated-skill count and metric-bullet ratio.

### 80. Why clamp scores?

Rules can produce values below 0 or above 100. Clamping guarantees a valid score range and simplifies UI display.

### 81. What are precision and recall?

- Precision: of all evidence the system detected, how much was correct?
- Recall: of all correct evidence in the resumes, how much did the system find?

### Medium

### 82. What is TF-IDF?

TF-IDF weighs terms by frequency in one document and rarity across documents. It can be used as a simple resume/JD similarity baseline but does not prove that a candidate actually used a skill.

### 83. What is cosine similarity?

It measures the angle between two vectors. It is often used to compare TF-IDF or embedding representations of a resume and job description.

### 84. What are embeddings?

Dense numeric vectors that capture semantic similarity. They could match synonyms such as “Postgres” and “relational database”, but evidence linking and calibration would still be required.

### 85. What is a learning-to-rank model?

A model trained to order items using labelled preferences or relevance judgments. A future HireLens version could learn rankings from reviewer-labelled resume/job pairs while keeping evidence visible.

### 86. What is NDCG@K?

Normalised Discounted Cumulative Gain measures ranking quality, rewarding relevant candidates near the top and accounting for graded relevance. NDCG@5 would evaluate the first five ranked candidates.

### 87. What is calibration?

A calibrated score has a consistent real-world interpretation. For example, items in an 80–90 score band should have similar reviewer-assessed quality. The current score needs a labelled study before such claims can be made.

### 88. Why are false-positive skill detections dangerous?

They can incorrectly claim a candidate has evidence they do not have. HireLens therefore distinguishes listed from demonstrated skills and recommends manual review.

### 89. How could an LLM be added safely?

Send only structured evidence and an allowed schema, require citations to resume lines, use low-variance settings, validate the JSON response, reject unsupported facts, store audit metadata and keep it outside numeric scoring and final decisions.

## Part G: Testing and Git questions

### Easy

### 90. What is a unit test?

A test of a small function or behaviour in isolation. HireLens scoring tests call `analyzeResume` with controlled text and assert the expected result.

### 91. What is a regression test?

A test that prevents a fixed bug from returning. The “Contributed to worked” test is a regression test.

### 92. Why should tests be deterministic?

The same inputs should produce the same result so failures indicate a real code change. The rule engine is easier to test than unconstrained generated output.

### 93. What is Git?

A distributed version-control system that records code history, supports branches and allows safe collaboration.

### 94. What makes a good commit?

It is focused, has a clear message, passes relevant tests and does not mix unrelated changes.

### Medium

### 95. What additional test layers would you add?

API integration tests with MongoDB, authentication and role tests, parser fixtures, React component tests, accessibility tests and full browser flows for candidate and recruiter journeys.

### 96. Why test behaviour instead of internal variables?

Behaviour tests survive refactoring. For example, asserting that a listed-only skill is not demonstrated is more valuable than asserting an internal temporary array length.

### 97. What is a mock?

A controlled replacement for a dependency. Tests could mock Google OAuth, file parsing or database access so they do not call external services.

### 98. What is continuous integration?

An automated system that installs dependencies, builds and runs tests on every push or pull request. HireLens could add GitHub Actions to run `pnpm test` and `pnpm build`.

## Part H: Short practical questions

### 99. How would you add a new role family?

Add its terms, evidence verbs and preferred sections in `roleRubrics.js`; update `resolveRole`; add role-specific outcome templates and roadmap/interview guides; then add tests proving role resolution and skill classification.

### 100. How would you add a new hiring stage?

Update the stage allow-list in the recruiter route, the Candidate Mongoose enum and the client stages array. Add a test to ensure the endpoint accepts the new value and rejects invalid values.

### 101. How would you persist roadmap progress?

Add a user-owned RoadmapProgress model or embed progress in Analysis, expose GET/PATCH endpoints and replace localStorage updates with authenticated API calls. Keep a version field for future step-ID changes.

### 102. How would you support scanned PDFs?

Detect when PDF extraction returns too little text, render or extract page images, run OCR, preserve page/line references and return a lower confidence when OCR quality is uncertain.

### 103. How would you complete stage filtering?

Store selected stages in React state, update the visible-candidate `useMemo` to check both search and stage, make tabs update that state and ensure counts still come from the full candidate list.

### 104. How would you complete candidate comparison?

Use the existing selected-ID set, derive selected candidate records and create a comparison view showing the same feature scores, mandatory gaps, evidence excerpts and uncertainty side by side.

### 105. How would you prevent repeated rerank requests from arriving out of order?

Use an `AbortController`, request sequence ID or server-side version so a slower old response cannot overwrite a newer slider result.

## Final revision checklist

Before an interview, be able to explain without notes:

- The candidate and recruiter workflows.
- The nine scoring categories and five recruiter features.
- Listed versus demonstrated skill evidence.
- Why the core is a rule-based NLP baseline rather than trained ML.
- The resume-analysis API sequence.
- JWT cookie authentication and server role checks.
- MongoDB versus memory fallback.
- The truth-safe rewrite design.
- One regression test you added.
- Three limitations and three next improvements.

## Strong closing answer

If asked “What did you learn from this project?”, a useful answer is:

> I learned that a resume-ranking system is not only a UI or keyword-matching problem. The difficult part is defining evidence, uncertainty and safe boundaries. I used a simple MERN stack, separated authentication and roles, created reproducible scoring features, linked deductions to source lines and added tests for misleading rewrites. I also learned to state limitations honestly: the current system is an explainable baseline, and a real hiring deployment would require labelled evaluation, fairness testing, stronger security and human review.

# HireLens explainable scoring model

The current scoring engine is version `rules-2.1`. It is a deterministic, explainable NLP/rule baseline. It does not call an LLM and it is not a trained machine-learning model.

## Overall formula

Each category score is clamped to the range 0–100. The overall score is:

```text
overall = clamp(sum(category_score × category_weight / 100), 0, 100)
```

| Category | Default weight | Main evidence |
|---|---:|---|
| ATS structure | 10% | Contact signals, expected sections and readable length |
| Mandatory match | 20% | Mandatory and preferred JD signals, or role coverage when no JD is supplied |
| Role relevance | 20% | Demonstrated and listed role-rubric terms |
| Skill evidence | 15% | Demonstrated role skills and action-bullet coverage |
| Impact | 15% | Metrics, scale and explicit outcome language |
| Clarity | 8% | Action-led bullets minus weak, long, vague or error-prone writing |
| Education fit | 5% | Presence of a parsed Education section |
| Consistency | 4% | Duplicate, spelling and suspicious-date checks |
| Role presentation | 3% | Expected sections, resume length and bullet structure |

The weights total 100%. Scores are deterministic for the same resume, target role, job description and rubric version.

## Feature definitions

### ATS structure

Starts from a base value and gains points for:

- Email, phone and professional-link contact signals.
- Expected role sections.
- A reasonable word-count range.

It loses points when a resume is excessively long. The current parser checks textual structure, not the visual quality of columns, colours or typography.

### Mandatory match

When a job description is supplied:

```text
mandatory_match = 85% of mandatory-requirement coverage
                + 15% of preferred-requirement coverage
```

When no job description is supplied, it falls back to coverage of the role-family vocabulary, giving demonstrated skills more credit than listed-only skills.

### Role relevance

Role relevance measures how much of the selected role vocabulary appears with evidence. Demonstrated occurrences count fully; listed-only occurrences receive limited partial credit.

### Skill evidence

A skill can be:

- `demonstrated`: found in an evidence section with an action, metric or outcome;
- `listed`: found but not demonstrated in context;
- `missing`: not found.

The score combines the demonstrated-skill ratio and the share of bullets containing clear action verbs.

### Impact

Impact uses two independent signal types:

- Metrics or scale: percentages, currency, users, records, projects, time, `x` improvements and similar counts.
- Outcomes: increased, reduced, improved, saved, delivered, accuracy, revenue, latency, adoption and similar terms.

This does not verify that a number is true. It only recognises that measurable evidence was written, so the UI reminds users to include only verifiable facts.

### Clarity

Clarity rewards action-led bullets and subtracts for:

- Weak openings such as “worked on” or “responsible for”.
- Bullets without a recognised action verb.
- Bullets over 34 words.
- Generic claims such as “hard-working” or “team player”.
- First-person wording outside the header.
- Selected common spelling mistakes.

### Education fit

The current baseline checks for a parsed Education section. It does not rank universities or infer candidate value from protected or socioeconomic proxies.

### Consistency

Consistency starts high and loses points for duplicate lines, selected spelling mistakes and clearly suspicious future-year patterns.

### Role presentation

Presentation rewards the expected sections, a usable word count and at least three bullets. It is a text-structure signal, not a screenshot-based visual-design score.

## Confidence

Confidence is separate from the score. It increases with:

- More parsed lines, up to a limit.
- A supplied job description.
- Expected sections.
- Bullet evidence.

| Confidence value | Label |
|---:|---|
| 78–100 | High |
| 58–77 | Medium |
| 0–57 | Low |

A high-confidence low score means the engine believes it parsed enough evidence to support its criticism. A low-confidence score should be reviewed carefully.

## Role rubrics

The selected target title is resolved to one of seven families:

1. Software Engineering
2. Data & ML
3. Finance & MBA
4. Consulting
5. Marketing & Sales
6. Design & Creative
7. Research & Academic

Each family supplies a finite set of role terms, evidence verbs and expected sections. The target title is preserved in the output while the family controls the rubric.

## Job-description requirements

The job description is split into sentence-like statements:

- Mandatory patterns: `must`, `required`, `need`, `minimum`, `essential`.
- Preferred patterns: `preferred`, `nice to have`, `bonus`, `desirable`, `plus`.
- Remaining statements: responsibilities.

The engine extracts known rubric skills and meaningful non-stopword signals. A sentence is matched only when at least 75% of its extracted signals, rounded upward, are found. Human review is still necessary for complex language and synonyms.

## Evidence-linked deductions

Possible deductions include:

- Mandatory requirements lack proof.
- Outcomes are under-evidenced.
- Skills are listed more often than demonstrated.
- Role-family evidence is missing.
- Resume structure needs attention.
- Bullets hide the candidate's contribution.
- Generic claims are not evidence.
- Spelling errors reduce credibility.
- Bullets are too long.
- Statements are duplicated.

Every returned deduction contains a suggested change. When a factual value is unknown, the change uses brackets rather than inventing it.

## Recruiter reranking

Recruiter ranking reuses the stored category scores and derives five features:

```text
skills     = average(Mandatory match, Role relevance, Skill evidence)
experience = average(Role relevance, Impact)
evidence   = average(Skill evidence, Consistency)
impact     = average(Impact, Clarity)
education  = Education fit
```

For selected recruiter weights `r_i`, candidate fit is:

```text
fit = round(sum(feature_i × r_i / sum(all r_i)))
```

The default recruiter weights are skills 35, experience 25, evidence 20, impact 15 and education 5.

## Example interpretation

Suppose a data analyst resume:

- lists Python and SQL;
- demonstrates SQL in a project;
- has no Python project evidence;
- contains one measured outcome;
- is missing a mandatory visualisation requirement.

Expected behaviour:

- SQL becomes demonstrated.
- Python becomes listed only.
- Visualisation appears as a critical missing requirement.
- The Impact score receives some credit for the measured outcome.
- The roadmap puts visualisation in Foundations and Python proof in a later phase.
- The rewrite suggestions request verified dataset, scope and result details without inventing numbers.

## Automated regression coverage

The current suite verifies score ordering, role resolution, JD grouping, truth-safe rewrites, skill evidence levels, strongest-occurrence selection, mandatory gaps, concrete suggested changes, vague-claim replacement, grammar-safe data rewrites and roadmap generation.

Run:

```powershell
pnpm test
```

## Evaluation plan

Automated rules tests do not prove real-market ranking accuracy. A defensible empirical study should:

1. Create at least 100 anonymised or synthetic resume/job pairs across all role families.
2. Use two or more reviewers to label requirement relevance and skill evidence.
3. Record pairwise candidate-ranking preferences.
4. Report reviewer agreement.
5. Measure evidence extraction precision, recall and F1.
6. Measure ranking NDCG@5 and pairwise accuracy.
7. Measure score calibration error.
8. Compare against keyword-only and TF-IDF/cosine baselines.
9. Audit false-positive skill evidence before false negatives.
10. Report results separately by role family and seniority.

## Responsible-use boundary

- Protected traits are not score inputs.
- The score must not be used for automatic rejection.
- Confidence and evidence must be reviewed with the score.
- A curated rubric may contain omissions or market bias.
- Real deployment requires independent fairness, accessibility, privacy and legal review.

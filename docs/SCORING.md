# Explainable scoring model

The default score is a weighted sum of nine bounded category scores.

| Category | Default weight | Main evidence |
|---|---:|---|
| ATS structure | 10% | Contact signals, standard sections, readable length |
| Mandatory match | 20% | Job-description or role-rubric coverage |
| Role relevance | 20% | Role-family terms with resume evidence |
| Skill evidence | 15% | Skills demonstrated in action/outcome statements |
| Impact | 15% | Verified metrics, scale and outcomes |
| Clarity | 8% | Action-led bullets and concise framing |
| Education fit | 5% | Clearly parsed education evidence |
| Consistency | 4% | Duplicate and suspicious-date checks |
| Role presentation | 3% | Role-appropriate sections and length |

Scores are deterministic for the same resume, target, job description and rubric version. The UI exposes the rubric version and separates confidence from fit.

## Evaluation plan

- Create at least 100 synthetic/anonymised resume-job pairs across the seven role families.
- Have two reviewers label requirement relevance, skill evidence and pairwise candidate preference.
- Report extraction precision/recall/F1, ranking NDCG@5, pairwise accuracy and score calibration error.
- Compare with keyword-only and general cosine-similarity baselines.
- Review false-positive skill evidence first; claiming an unsupported skill is more harmful than missing a weak signal.

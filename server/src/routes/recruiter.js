import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { rerankCandidates } from "../data/recruiterDemo.js";

const router = Router();
router.use(requireAuth, requireRole("employer"));
router.get("/rankings", (req, res) => res.json({ candidates: rerankCandidates(), decisionSupportOnly: true }));
router.post("/rerank", (req, res) => res.json({ candidates: rerankCandidates(req.body.weights), decisionSupportOnly: true }));
router.post("/interview-questions", (req, res) => {
  const candidate = rerankCandidates().find((item) => item.id === req.body.candidateId) || rerankCandidates()[0];
  res.json({ questions: [
    `Walk me through your contribution to: “${candidate.excerpts[0]}”`,
    `What trade-offs did you make when using ${candidate.skills.slice(0, 2).join(" and ")}?`,
    `How would you close this evidence gap: ${candidate.gaps[0]}?`,
    "Describe a difficult cross-functional disagreement and how you reached a decision."
  ] });
});
export default router;

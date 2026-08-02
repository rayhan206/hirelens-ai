import test from "node:test";
import assert from "node:assert/strict";
import { analyzeResume, extractJobRequirements } from "../src/services/scoringEngine.js";

const strongResume = `Maya Rao\nmaya@example.com | +91 9876543210 | github.com/mayarao\nSKILLS\nReact, TypeScript, Node.js, testing, Git, cloud\nEXPERIENCE\n- Built a React design system used by 4 product teams.\n- Optimized rendering performance by 32% for 20,000 monthly users.\nPROJECTS\n- Deployed a Node API with automated testing and monitoring.\nEDUCATION\nB.Tech Computer Science`;

test("strong relevant evidence scores above a weak resume", () => {
  const strong = analyzeResume({ resumeText: strongResume, targetRole: "Software Engineer" });
  const weak = analyzeResume({ resumeText: "Maya Rao\nOBJECTIVE\nLooking for a challenging job.\nEDUCATION\nB.Tech", targetRole: "Software Engineer" });
  assert.ok(strong.score > weak.score);
  assert.equal(strong.role.key, "software");
  assert.ok(strong.skillEvidence.some((item) => item.level === "demonstrated"));
});

test("role resolution changes the rubric", () => {
  assert.equal(analyzeResume({ resumeText: strongResume, targetRole: "UX Designer" }).role.key, "design");
  assert.equal(analyzeResume({ resumeText: strongResume, targetRole: "MBA Finance Analyst" }).role.key, "finance");
});

test("job description extraction separates requirement classes", () => {
  const parsed = extractJobRequirements("Must know React. TypeScript is preferred. You will build accessible interfaces.");
  assert.equal(parsed.mandatory.length, 1);
  assert.equal(parsed.preferred.length, 1);
  assert.equal(parsed.responsibilities.length, 1);
});

test("truth-safe rewrites do not invent numbers", () => {
  const result = analyzeResume({ resumeText: `${strongResume}\n- Worked on a customer dashboard.`, targetRole: "Software Engineer" });
  const rewrite = result.rewrites.find((item) => item.original.includes("customer dashboard"));
  assert.ok(rewrite);
  assert.equal(/\d/.test(rewrite.suggested), false);
  assert.ok(rewrite.missingInformation);
});

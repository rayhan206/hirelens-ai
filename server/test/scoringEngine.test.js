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
  assert.match(rewrite.suggested, /\[verified/);
});

test("a skill-list keyword is not treated as demonstrated evidence", () => {
  const result = analyzeResume({
    resumeText: `Riya Shah\nriya@example.com\nSKILLS\nReact, TypeScript, Git\nEXPERIENCE\n- Worked on internal tasks.\nEDUCATION\nB.Tech`,
    targetRole: "Frontend Engineer"
  });
  assert.equal(result.skillEvidence.find((item) => item.skill === "react").level, "listed");
  assert.ok(result.skillDevelopment.some((item) => item.skill === "react" && item.status === "Listed, not proven"));
});

test("the strongest occurrence of a skill wins over an earlier list mention", () => {
  const result = analyzeResume({
    resumeText: `Riya Shah\nriya@example.com | github.com/riya\nSKILLS\nReact, TypeScript\nEXPERIENCE\n- Built a React checkout used by 3 product teams and reduced errors by 20%.\nEDUCATION\nB.Tech`,
    targetRole: "Frontend Engineer"
  });
  const react = result.skillEvidence.find((item) => item.skill === "react");
  assert.equal(react.level, "demonstrated");
  assert.match(react.evidence.text, /Built a React checkout/);
});

test("mandatory job requirements are checked independently and receive a concrete fix", () => {
  const result = analyzeResume({
    resumeText: strongResume,
    targetRole: "Frontend Engineer",
    jobDescription: "Must have React. Accessibility experience is required. TypeScript is preferred."
  });
  const loss = result.losses.find((item) => item.title === "Mandatory job requirements lack proof");
  assert.ok(loss);
  assert.match(loss.detail, /Accessibility/i);
  assert.match(loss.suggestedChange, /Applied accessibility/);
});

test("every reported loss includes a proposed change", () => {
  const result = analyzeResume({
    resumeText: `Sam\nOBJECTIVE\nI am a hard working fast learner with developement experiance.\n- Worked on various projects.\nEDUCATION\nB.Tech`,
    targetRole: "Software Engineer"
  });
  assert.ok(result.losses.length >= 3);
  assert.ok(result.losses.every((item) => item.suggestedChange?.trim()));
  assert.ok(result.losses.some((item) => /development experience/i.test(item.suggestedChange)));
});

test("generic personality claims receive evidence-based replacements", () => {
  const result = analyzeResume({
    resumeText: `${strongResume}\n- Team player with excellent communication.`,
    targetRole: "Software Engineer"
  });
  const rewrite = result.rewrites.find((item) => item.original.includes("Team player"));
  assert.ok(rewrite);
  assert.match(rewrite.suggested, /Collaborated with \[specific team\/stakeholder\]/);
  assert.doesNotMatch(rewrite.suggested, /Contributed to team player/i);
});

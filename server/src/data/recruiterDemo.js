export const demoCandidates = [
  { id: "c1", name: "Nikhil Verma", initials: "NV", location: "Bengaluru", years: 6.2, fit: 92, confidence: 86, mandatory: 5, evidence: 14, stage: "Screened", skills: ["React", "TypeScript", "Next.js", "Testing"], education: "B.Tech", strengths: ["Production React ownership", "Strong accessibility evidence", "Led frontend performance work"], gaps: ["No direct fintech domain evidence"], excerpts: ["Led migration to Next.js, reducing bundle size by 28%.", "Built a reusable React component library used by 4 product teams."] },
  { id: "c2", name: "Sneha Menon", initials: "SM", location: "Bengaluru", years: 5.4, fit: 88, confidence: 78, mandatory: 5, evidence: 13, stage: "Screened", skills: ["React", "TypeScript", "Next.js", "Design systems"], education: "B.E.", strengths: ["Reusable component systems", "Accessible UI patterns", "Measured performance work"], gaps: ["Limited evidence of design systems at scale", "No backend/API design ownership"], excerpts: ["Architected a reusable component library in React and TypeScript.", "Improved rendering performance through code splitting and lazy loading."] },
  { id: "c3", name: "Arjun Reddy", initials: "AR", location: "Hyderabad", years: 7.1, fit: 84, confidence: 74, mandatory: 4, evidence: 12, stage: "Shortlisted", skills: ["React", "JavaScript", "Node.js", "AWS"], education: "M.Tech", strengths: ["Full-stack collaboration", "Strong delivery ownership"], gaps: ["TypeScript evidence is missing"], excerpts: ["Delivered customer dashboard workflows used by 30K monthly users."] },
  { id: "c4", name: "Pooja Singh", initials: "PS", location: "Delhi", years: 4.8, fit: 79, confidence: 63, mandatory: 4, evidence: 10, stage: "Applied", skills: ["React", "TypeScript", "Redux"], education: "B.Tech", strengths: ["Relevant core stack"], gaps: ["Impact statements need verification"], excerpts: ["Developed reusable forms and validation flows in React."] },
  { id: "c5", name: "Karthik Tiwari", initials: "KT", location: "Bengaluru", years: 3.6, fit: 72, confidence: 57, mandatory: 5, evidence: 9, stage: "Screened", skills: ["React", "TypeScript", "Tailwind"], education: "BCA", strengths: ["All mandatory skills listed"], gaps: ["Skills are mostly listed without evidence"], excerpts: ["Worked on React applications for internal teams."] },
  { id: "c6", name: "Aditi Deshpande", initials: "AD", location: "Pune", years: 8.3, fit: 69, confidence: 55, mandatory: 3, evidence: 8, stage: "Applied", skills: ["JavaScript", "Angular", "Leadership"], education: "B.E.", strengths: ["Team leadership"], gaps: ["React and Next.js evidence missing"], excerpts: ["Managed a team of 6 frontend engineers across two products."] },
  { id: "c7", name: "Rohit Kapoor", initials: "RK", location: "Gurugram", years: 6, fit: 65, confidence: 52, mandatory: 4, evidence: 7, stage: "Applied", skills: ["React", "JavaScript", "CSS"], education: "B.Tech", strengths: ["Relevant UI delivery"], gaps: ["Limited test automation evidence"], excerpts: ["Built responsive customer account experiences."] },
  { id: "c8", name: "Megha Joshi", initials: "MJ", location: "Bengaluru", years: 2.9, fit: 58, confidence: 43, mandatory: 4, evidence: 6, stage: "Applied", skills: ["React", "JavaScript"], education: "B.Sc.", strengths: ["Relevant internship experience"], gaps: ["Seniority gap", "TypeScript evidence missing"], excerpts: ["Implemented frontend features during a six-month internship."] }
];

export function rerankCandidates(weights = {}) {
  const normalized = {
    skills: Number(weights.skills ?? 35), experience: Number(weights.experience ?? 25), evidence: Number(weights.evidence ?? 20), impact: Number(weights.impact ?? 15), education: Number(weights.education ?? 5)
  };
  const total = Object.values(normalized).reduce((sum, value) => sum + value, 0) || 100;
  return demoCandidates.map((candidate) => {
    const features = {
      skills: candidate.mandatory / 5 * 100,
      experience: Math.min(100, candidate.years / 7 * 100),
      evidence: Math.min(100, candidate.evidence / 14 * 100),
      impact: candidate.fit,
      education: /Tech|E\./.test(candidate.education) ? 90 : 72
    };
    const fit = Math.round(Object.entries(normalized).reduce((sum, [key, weight]) => sum + features[key] * weight / total, 0));
    return { ...candidate, fit, features };
  }).sort((a, b) => b.fit - a.fit).map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}

import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  jobId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  fileName: String,
  stage: { type: String, enum: ["New", "Screened", "Shortlisted", "Interview", "Selected", "Rejected"], default: "New" },
  analysis: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);

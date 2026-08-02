import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetRole: String,
  seniority: String,
  score: Number,
  confidence: String,
  modelVersion: String,
  rubricVersion: String,
  result: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

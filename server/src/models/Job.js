import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  location: String,
  description: String,
  weights: { skills: Number, experience: Number, evidence: Number, impact: Number, education: Number }
}, { timestamps: true });

export default mongoose.models.Job || mongoose.model("Job", jobSchema);

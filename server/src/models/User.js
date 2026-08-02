import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: String,
  role: { type: String, enum: ["candidate", "employer"], required: true },
  organisation: String,
  provider: { type: String, enum: ["password", "google"], default: "password" },
  avatar: String
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);

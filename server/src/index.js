import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import analysisRoutes from "./routes/analysis.js";
import recruiterRoutes from "./routes/recruiter.js";
import { upsertOAuthUser } from "./services/authService.js";

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(passport.initialize());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({ clientID: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${port}/api/auth/google/callback`, passReqToCallback: true }, async (_req, _accessToken, _refreshToken, profile, done) => {
    try { done(null, await upsertOAuthUser(profile, _req.query.state)); } catch (error) { done(error); }
  }));
}

app.get("/api/health", (_req, res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? "mongodb" : "memory", oauth: Boolean(process.env.GOOGLE_CLIENT_ID), scoring: "role-aware-rules-1.0" }));
app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ message: error.message || "Unexpected server error." }));

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected")).catch((error) => console.warn("MongoDB unavailable; using the demo in-memory store:", error.message));
}

app.listen(port, () => console.log(`HireLens API listening on http://localhost:${port}`));

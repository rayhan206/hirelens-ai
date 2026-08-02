import { Router } from "express";
import passport from "passport";
import { z } from "zod";
import { authenticateUser, getDemoUser, registerUser, signToken } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 };

router.post("/register", async (req, res) => {
  try {
    const input = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), role: z.enum(["candidate", "employer"]), organisation: z.string().optional() }).parse(req.body);
    const user = await registerUser(input);
    res.cookie("hirelens_token", signToken(user), cookieOptions).status(201).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.issues?.[0]?.message || error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const input = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const user = await authenticateUser(input.email, input.password);
    res.cookie("hirelens_token", signToken(user), cookieOptions).json({ user });
  } catch (error) {
    res.status(401).json({ message: error.issues?.[0]?.message || error.message });
  }
});

router.post("/demo", (req, res) => {
  const role = req.body.role === "employer" ? "employer" : "candidate";
  const user = getDemoUser(role);
  res.cookie("hirelens_token", signToken(user), cookieOptions).json({ user });
});

router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?oauth=not-configured`);
  passport.authenticate("google", { scope: ["profile", "email"], state: req.query.role === "employer" ? "employer" : "candidate" })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?oauth=failed` }, (error, user) => {
    if (error || !user) return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?oauth=failed`);
    res.cookie("hirelens_token", signToken(user), cookieOptions).redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/auth/callback`);
  })(req, res, next);
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
router.post("/logout", (_req, res) => res.clearCookie("hirelens_token", cookieOptions).json({ ok: true }));

export default router;

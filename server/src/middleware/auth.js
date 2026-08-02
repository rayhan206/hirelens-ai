import { verifyToken } from "../services/authService.js";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.hirelens_token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ message: "Please sign in to continue." });
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Your session is invalid or expired." });
  }
}

export function requireRole(role) {
  return (req, res, next) => req.user?.role === role ? next() : res.status(403).json({ message: `This area is only available to ${role} accounts.` });
}

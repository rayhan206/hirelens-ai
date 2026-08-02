import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const users = new Map();
const secret = () => process.env.JWT_SECRET || "hirelens-local-development-secret-change-me";

function publicUser(user) {
  const source = typeof user.toObject === "function" ? user.toObject() : user;
  const { passwordHash, _id, __v, ...safe } = source;
  if (_id) safe.id = String(_id);
  return safe;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email, name: user.name }, secret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}

export async function registerUser({ name, email, password, role, organisation }) {
  const key = email.toLowerCase();
  if (mongoose.connection.readyState === 1) {
    if (await User.exists({ email: key })) throw new Error("An account with this email already exists.");
    const user = await User.create({ name, email: key, role, organisation: role === "employer" ? organisation || "Independent recruiter" : null, passwordHash: await bcrypt.hash(password, 10), provider: "password" });
    return publicUser(user);
  }
  if (users.has(key)) throw new Error("An account with this email already exists.");
  const user = { id: crypto.randomUUID(), name, email: key, role, organisation: role === "employer" ? organisation || "Independent recruiter" : null, passwordHash: await bcrypt.hash(password, 10), provider: "password" };
  users.set(key, user);
  return publicUser(user);
}

export async function authenticateUser(email, password) {
  const user = mongoose.connection.readyState === 1 ? await User.findOne({ email: email.toLowerCase() }) : users.get(email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new Error("Email or password is incorrect.");
  return publicUser(user);
}

export async function upsertOAuthUser(profile, role = "candidate") {
  const email = profile.emails?.[0]?.value?.toLowerCase();
  if (!email) throw new Error("Google did not provide an email address.");
  const existing = mongoose.connection.readyState === 1 ? await User.findOne({ email }) : users.get(email);
  if (existing) return publicUser(existing);
  const user = { id: crypto.randomUUID(), name: profile.displayName, email, role, organisation: role === "employer" ? "Google workspace" : null, provider: "google", avatar: profile.photos?.[0]?.value };
  if (mongoose.connection.readyState === 1) return publicUser(await User.create({ name: user.name, email, role, organisation: user.organisation, provider: "google", avatar: user.avatar }));
  users.set(email, user);
  return publicUser(user);
}

export function getDemoUser(role = "candidate") {
  return { id: `demo-${role}`, name: role === "employer" ? "Arjun Recruiter" : "Maya Candidate", email: `${role}@demo.hirelens.ai`, role, organisation: role === "employer" ? "HireLens Demo Co." : null, provider: "demo" };
}

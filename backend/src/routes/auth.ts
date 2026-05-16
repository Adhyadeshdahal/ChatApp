import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

function publicUser(user: { _id: unknown; username: string; email: string; createdAt?: Date }) {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function validationMessage(err: unknown): string | null {
  if (err instanceof mongoose.Error.ValidationError) {
    return Object.values(err.errors)[0]?.message || "Please check your account details";
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    return "Username or email already in use";
  }

  return null;
}

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!username || !email || !password) {
    res.status(400).json({ message: "All fields required" });
    return;
  }
  if (username.length < 3 || username.length > 20) {
    res.status(400).json({ message: "Username must be 3-20 characters" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(409).json({ message: "Username or email already in use" });
      return;
    }
    const user = await User.create({ username, email, password });
    const token = signToken(user._id.toString());
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Register failed:", err);
    res.status(validationMessage(err) ? 400 : 500).json({ message: validationMessage(err) || "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    res.status(400).json({ message: "Email and password required" });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const token = signToken(user._id.toString());
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user: publicUser(user) });
});

export default router;

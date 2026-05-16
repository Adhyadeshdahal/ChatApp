import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ message: "All fields required" });
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
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
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
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt } });
});

export default router;

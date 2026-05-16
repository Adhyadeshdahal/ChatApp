import { Router, Response } from "express";
import { User } from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users, total: users.length });
});

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user });
});

router.patch("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.params.id !== req.userId) {
    res.status(403).json({ message: "Can only update your own profile" });
    return;
  }
  const { username, email } = req.body;
  const update: Record<string, string> = {};
  if (username) update.username = username;
  if (email) update.email = email;

  try {
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user });
  } catch {
    res.status(400).json({ message: "Update failed — username or email may be taken" });
  }
});

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.params.id !== req.userId) {
    res.status(403).json({ message: "Can only delete your own account" });
    return;
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Account deleted" });
});

export default router;

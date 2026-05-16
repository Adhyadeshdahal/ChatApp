import { Router, Response } from "express";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/history", authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
  res.json({ messages });
});

router.get("/stats", authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalMessages, totalUsers] = await Promise.all([
    Message.countDocuments(),
    User.countDocuments(),
  ]);
  res.json({ totalMessages, totalUsers });
});

export default router;

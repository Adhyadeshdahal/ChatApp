import { Router, Response } from "express";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/history", authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  const req = _req;
  const { recipientId } = req.query;

  if (typeof recipientId === "string" && recipientId) {
    const recipient = await User.findById(recipientId).select("_id");
    if (!recipient) {
      res.status(404).json({ message: "Recipient not found" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: recipientId },
        { sender: recipientId, recipient: req.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages });
    return;
  }

  const messages = await Message.find({
    $or: [{ recipient: null }, { recipient: { $exists: false } }],
  })
    .sort({ createdAt: 1 })
    .limit(100);
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

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.userId = user._id.toString();
    req.username = user.username;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

import { Server } from "socket.io";
import mongoose from "mongoose";
import { verifyToken } from "./utils/jwt";
import { User } from "./models/User";
import { Message } from "./models/Message";

const onlineUsers = new Set<string>();

type SendMessagePayload = string | {
  content?: string;
  recipientId?: string | null;
};

export function initSocket(io: Server): void {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = verifyToken(token);
      const user = await User.findById(payload.id).select("-password");
      if (!user) return next(new Error("User not found"));
      socket.data.userId = user._id.toString();
      socket.data.username = user.username;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const { userId, username } = socket.data as { userId: string; username: string };

    console.log("new connection", socket.id, username);

    socket.onAny((event, ...args) => {
      console.log("event:", event, args);
    });

    const wasAlreadyOnline = onlineUsers.has(userId);
    onlineUsers.add(userId);
    socket.join(userId);

    if (!wasAlreadyOnline) {
      socket.broadcast.emit("user:join", { username, onlineCount: onlineUsers.size });
    }
    io.emit("stats:online", { onlineCount: onlineUsers.size });

    socket.on("message:send", async (payload: SendMessagePayload) => {
      const content = typeof payload === "string" ? payload : payload?.content;
      const recipientId = typeof payload === "string" ? null : payload?.recipientId;
      console.log("received message", content);
      if (!content?.trim()) return;
      try {
        let recipient: { _id: mongoose.Types.ObjectId; username: string } | null = null;

        if (recipientId) {
          if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            socket.emit("error", { message: "Invalid recipient" });
            return;
          }

          recipient = await User.findById(recipientId)
            .select("username")
            .lean<{ _id: mongoose.Types.ObjectId; username: string }>();
          if (!recipient) {
            socket.emit("error", { message: "Recipient not found" });
            return;
          }
        }

        const msg = await Message.create({
          sender: new mongoose.Types.ObjectId(userId),
          senderName: username,
          recipient: recipient?._id ?? null,
          recipientName: recipient?.username ?? null,
          content: content.trim(),
        });
        console.log("message saved", msg._id);
        const totalMessages = await Message.countDocuments();
        const outgoing = {
          _id: msg._id,
          sender: userId,
          senderName: username,
          recipient: recipient?._id.toString() ?? null,
          recipientName: recipient?.username ?? null,
          content: msg.content,
          createdAt: msg.createdAt,
        };

        if (recipient) {
          io.to(userId).to(recipient._id.toString()).emit("message:new", outgoing);
        } else {
          io.emit("message:new", outgoing);
        }

        io.emit("stats:messages", { totalMessages });
        console.log("message:new emitted");
      } catch (err) {
        console.log("error saving message", (err as Error).message, err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      const stillOnline = [...io.sockets.sockets.values()].some(
        (s) => s.data.userId === userId && s.id !== socket.id
      );
      if (!stillOnline) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("user:leave", { username, onlineCount: onlineUsers.size });
      }
      io.emit("stats:online", { onlineCount: onlineUsers.size });
    });
  });
}

import { Server } from "socket.io";
import mongoose from "mongoose";
import { verifyToken } from "./utils/jwt";
import { User } from "./models/User";
import { Message } from "./models/Message";

const onlineUsers = new Set<string>();

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

    if (!wasAlreadyOnline) {
      socket.broadcast.emit("user:join", { username, onlineCount: onlineUsers.size });
    }
    io.emit("stats:online", { onlineCount: onlineUsers.size });

    socket.on("message:send", async (content: string) => {
      console.log("received message", content);
      if (!content?.trim()) return;
      try {
        const msg = await Message.create({
          sender: new mongoose.Types.ObjectId(userId),
          senderName: username,
          content: content.trim(),
        });
        console.log("message saved", msg._id);
        const totalMessages = await Message.countDocuments();
        io.emit("message:new", {
          _id: msg._id,
          sender: userId,
          senderName: username,
          content: msg.content,
          createdAt: msg.createdAt,
        });
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
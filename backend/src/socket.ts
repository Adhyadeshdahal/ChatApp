import { Server } from "socket.io";
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

    const wasAlreadyOnline = onlineUsers.has(userId);
    onlineUsers.add(userId);

    if (!wasAlreadyOnline) {
      socket.broadcast.emit("user:join", { username, onlineCount: onlineUsers.size });
    }
    io.emit("stats:online", { onlineCount: onlineUsers.size });

    // ...message:send stays the same...

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
    console.log("new connection", socket.id, socket.data.username);
    socket.onAny((event, ...args) => {
      console.log("event:", event, args);
    });
  });
}

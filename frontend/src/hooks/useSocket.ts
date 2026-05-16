import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Message, Stats, SystemEvent } from "../types";

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMessages: 0, totalUsers: 0, onlineCount: 0 });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    // const socket = io("/", { auth: { token }, transports: ["websocket"] });
    const socket = io("http://localhost:5000", { auth: { token }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("message:new", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user:join", ({ username, onlineCount }: { username: string; onlineCount: number }) => {
      setEvents((prev) => [...prev.slice(-20), { type: "join", username }]);
      setStats((prev) => ({ ...prev, onlineCount }));
    });

    socket.on("user:leave", ({ username, onlineCount }: { username: string; onlineCount: number }) => {
      setEvents((prev) => [...prev.slice(-20), { type: "leave", username }]);
      setStats((prev) => ({ ...prev, onlineCount }));
    });

    socket.on("stats:online", ({ onlineCount }: { onlineCount: number }) => {
      setStats((prev) => ({ ...prev, onlineCount }));
    });

    socket.on("stats:messages", ({ totalMessages }: { totalMessages: number }) => {
      setStats((prev) => ({ ...prev, totalMessages }));
    });

    return () => { socket.disconnect(); };
  }, [token]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit("message:send", content);
  };

  const loadHistory = (msgs: Message[], initialStats: { totalMessages: number; totalUsers: number }) => {
    setMessages(msgs);
    setStats((prev) => ({ ...prev, ...initialStats }));
  };

  return { messages, events, stats, connected, sendMessage, loadHistory };
}

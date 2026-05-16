import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Message, Stats, SystemEvent } from "../types";

export function useSocket(token: string | null, activeRecipientId: string | null, currentUserId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const activeRecipientRef = useRef<string | null>(activeRecipientId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [stats, setStats] = useState<Stats>({ totalMessages: 0, totalUsers: 0, onlineCount: 0 });
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    activeRecipientRef.current = activeRecipientId;
  }, [activeRecipientId]);

  const isActiveConversationMessage = (msg: Message) => {
    const activeRecipient = activeRecipientRef.current;
    if (!activeRecipient) return !msg.recipient;
    return (
      msg.recipient === activeRecipient ||
      (msg.sender === activeRecipient && msg.recipient === currentUserId)
    );
  };
  
  useEffect(() => {
    if (!token) return;

    // const socket = io("/", { auth: { token }, transports: ["websocket"] });
    const socket = io(import.meta.env.VITE_API_URL ||"http://localhost:5000", { auth: { token }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("message:new", (msg: Message) => {
      if (isActiveConversationMessage(msg)) {
        setMessages((prev) => [...prev, msg]);
      }
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

    socket.on("connect_error", (err) => console.log("connect_error", err.message, err));


    return () => { socket.disconnect(); };

  }, [token, currentUserId]);

  const sendMessage = (content: string, recipientId?: string | null) => {
    socketRef.current?.emit("message:send", { content, recipientId: recipientId ?? null });
  };

  const loadHistory = (msgs: Message[], initialStats?: { totalMessages: number; totalUsers: number }) => {
    setMessages(msgs);
    if (initialStats) {
      setStats((prev) => ({ ...prev, ...initialStats }));
    }
  };

  return { messages, events, stats, connected, sendMessage, loadHistory };
}

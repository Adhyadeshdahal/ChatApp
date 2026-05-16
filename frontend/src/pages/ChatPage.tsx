import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useAuth } from "../store/AuthContext";
import { useSocket } from "../hooks/useSocket";
import api from "../lib/api";
import MessageBubble from "../components/MessageBubble";
import StatsBar from "../components/StatsBar";
import SettingsPanel from "../components/SettingsPanel";
import { SystemEvent } from "../types";

export default function ChatPage() {
  const { user, token } = useAuth();
  const { messages, events, stats, connected, sendMessage, loadHistory } = useSocket(token);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/chat/history").then((r) => {
      api.get("/chat/stats").then((s) => {
        loadHistory(r.data.messages, s.data);
      });
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-none">Palm Mind Chat</p>
            <p className="text-xs text-gray-400 mt-0.5">{stats.onlineCount} online</p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-semibold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-700">{user?.username}</span>
        </button>
      </div>

      <StatsBar stats={stats} connected={connected} />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {events.slice(-5).map((ev: SystemEvent, i) => (
          <div key={i} className="flex justify-center my-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {ev.username} {ev.type === "join" ? "joined the chat" : "left the chat"}
            </span>
          </div>
        ))}

        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} isOwn={msg.sender === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition max-h-32"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || !connected}
            className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:opacity-40 rounded-full transition-colors flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5 ml-1">Enter to send · Shift+Enter for new line</p>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
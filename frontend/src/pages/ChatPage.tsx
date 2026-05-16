import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useAuth } from "../store/AuthContext";
import { useSocket } from "../hooks/useSocket";
import api from "../lib/api";
import MessageBubble from "../components/MessageBubble";
import StatsBar from "../components/StatsBar";
import SettingsPanel from "../components/SettingsPanel";
import { SystemEvent, User } from "../types";

export default function ChatPage() {
  const { user, token } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { messages, events, stats, connected, sendMessage, loadHistory } = useSocket(token, selectedUser?.id ?? null, user?.id);
  const [users, setUsers] = useState<User[]>([]);
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([api.get("/users"), api.get("/chat/stats")]).then(([usersRes, statsRes]) => {
      setUsers(
        usersRes.data.users
          .map((u: User & { _id?: string }) => ({ ...u, id: u.id ?? u._id }))
          .filter((u: User) => u.id !== user?.id)
      );
      api.get("/chat/history").then((historyRes) => {
        loadHistory(historyRes.data.messages, statsRes.data);
      });
    });
  }, [user?.id]);

  useEffect(() => {
    const params = selectedUser ? { recipientId: selectedUser.id } : undefined;
    api.get("/chat/history", { params }).then((r) => {
      loadHistory(r.data.messages);
    });
  }, [selectedUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed, selectedUser?.id ?? null);
    setInput("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const selectConversation = (chatUser: User | null) => {
    setSelectedUser(chatUser);
    setShowMobileMenu(false);
  };

  const conversationRow = (chatUser: User | null) => {
    const isGroup = !chatUser;
    const isActive = isGroup ? !selectedUser : selectedUser?.id === chatUser.id;
    const title = isGroup ? "Group chat" : chatUser.username;
    const subtitle = isGroup ? "Everyone in the workspace" : "Direct message";
    const initial = isGroup ? "#" : chatUser.username[0]?.toUpperCase();

    return (
      <button
        key={chatUser?.id ?? "group"}
        onClick={() => selectConversation(chatUser)}
        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
          isActive ? "bg-blue-50" : ""
        }`}
      >
        <span
          className={`w-10 h-10 rounded-full text-sm flex items-center justify-center font-semibold flex-shrink-0 ${
            isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-gray-800 truncate">{title}</span>
          <span className="block text-xs text-gray-400 truncate">{subtitle}</span>
        </span>
      </button>
    );
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

      <div className="flex-1 min-h-0 flex">
        <aside className="w-64 border-r border-gray-200 bg-white hidden sm:flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Messages</p>
          </div>
          {conversationRow(null)}
          <div className="overflow-y-auto">
            {users.map((chatUser) => conversationRow(chatUser))}
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-100 bg-white sm:hidden flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              aria-label="Open conversations"
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {selectedUser ? selectedUser.username : "Group chat"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {selectedUser ? "Private conversation" : "Messages visible to everyone"}
              </p>
            </div>
          </div>

          <div className="hidden sm:block px-4 py-2 border-b border-gray-100 bg-white">
            <p className="text-sm font-semibold text-gray-800">
              {selectedUser ? selectedUser.username : "Group chat"}
            </p>
            <p className="text-xs text-gray-400">
              {selectedUser ? "Private conversation" : "Messages visible to everyone"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {!selectedUser && events.slice(-5).map((ev: SystemEvent, i) => (
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
                placeholder={selectedUser ? `Message ${selectedUser.username}...` : "Type a message..."}
                rows={1}
                className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-2.5 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 transition max-h-32"
              />
              <button
                onClick={submit}
                disabled={!input.trim() || !connected}
                aria-label="Send message"
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
        </main>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {showMobileMenu && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            aria-label="Close conversations"
            onClick={() => setShowMobileMenu(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-[84vw] max-w-xs bg-white shadow-2xl flex flex-col">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-gray-900">Chats</p>
                <p className="text-xs text-gray-400">{users.length + 1} conversations</p>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                aria-label="Close conversations"
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto py-2">
              {conversationRow(null)}
              {users.map((chatUser) => conversationRow(chatUser))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

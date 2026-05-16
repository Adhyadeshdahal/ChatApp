import { useState } from "react";
import { useAuth } from "../store/AuthContext";

interface Props {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: Props) {
  const { user, updateUser, deleteAccount, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    if (!user) return;
    setStatus("saving");
    try {
      await updateUser(user.id, { username, email });
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text font-medium">Profile</h2>
          <button onClick={onClose} className="text-subtle hover:text-text transition-colors text-lg leading-none">×</button>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs font-mono text-subtle mb-1.5 block">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-subtle mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={status === "saving"}
          className="w-full bg-accent hover:bg-accent/90 text-white text-sm py-2.5 rounded-lg mb-3 transition-colors"
        >
          {status === "saving" ? "Saving..." : status === "done" ? "Saved ✓" : "Save changes"}
        </button>

        <button onClick={logout} className="w-full border border-border text-subtle hover:text-text text-sm py-2.5 rounded-lg mb-3 transition-colors">
          Sign out
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="w-full text-red-400/60 hover:text-red-400 text-sm py-1.5 transition-colors">
            Delete account
          </button>
        ) : (
          <div className="text-center">
            <p className="text-xs text-subtle mb-2">This is irreversible. Sure?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 border border-border text-subtle text-sm py-2 rounded-lg">Cancel</button>
              <button onClick={() => user && deleteAccount(user.id)} className="flex-1 bg-red-500/20 text-red-400 text-sm py-2 rounded-lg">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

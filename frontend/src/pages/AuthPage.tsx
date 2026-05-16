import { useState, FormEvent } from "react";
import { useAuth } from "../store/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse2" />
            <span className="font-mono text-xs text-subtle tracking-widest uppercase">Nexus</span>
          </div>
          <h1 className="text-3xl font-light text-text tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={set("username")}
              required
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder-subtle focus:outline-none focus:border-accent transition-colors font-sans"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set("email")}
            required
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder-subtle focus:outline-none focus:border-accent transition-colors font-sans"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set("password")}
            required
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder-subtle focus:outline-none focus:border-accent transition-colors font-sans"
          />

          {error && (
            <p className="text-red-400 text-sm font-mono px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-subtle text-sm">
          {mode === "login" ? "No account?" : "Have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-accent hover:underline"
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

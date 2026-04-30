import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password, "admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card card-premium p-10 bg-surface border-2 border-primary/5 shadow-2xl rounded-[2rem]">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white text-3xl font-black mb-6 shadow-xl shadow-primary/20">
          A
        </div>
        <h1 className="text-3xl font-black text-primary tracking-tight">Admin Login</h1>
        <p className="text-secondary mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">Restricted Access Area</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Admin Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-14 rounded-2xl border-2 border-border bg-background px-6 focus:border-primary outline-none transition-all font-bold"
            placeholder="admin@home4stay.com"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Security Key</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-14 rounded-2xl border-2 border-border bg-background px-6 focus:border-primary outline-none transition-all font-bold"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={submitting}
          className={`w-full h-14 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "AUTHENTICATING..." : "AUTHENTICATE"}
        </button>
      </form>

      <p className="mt-10 text-center text-[10px] font-bold text-secondary uppercase tracking-widest leading-relaxed">
        Authorized personnel only. <br/> All access is logged and monitored.
      </p>
    </div>
  );
}

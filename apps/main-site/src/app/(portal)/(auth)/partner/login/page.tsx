import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PartnerLoginPage() {
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
      await login(email, password, "partner");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card card-premium p-10 bg-surface border border-border shadow-2xl rounded-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-primary">Partner Login</h1>
        <p className="text-secondary mt-2">Manage your property bookings</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Partner Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-xl border border-border bg-background px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="partner@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 rounded-xl border border-border bg-background px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
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
          className={`w-full btn btn-primary py-4 rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Authenticating..." : "Enter Dashboard"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-secondary">
        Don&apos;t have a partner account?{" "}
        <Link href="/partner/contact" className="text-primary font-bold hover:underline">
          Get Started
        </Link>
      </div>
    </div>
  );
}

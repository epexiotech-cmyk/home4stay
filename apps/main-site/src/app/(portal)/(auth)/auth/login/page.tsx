"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(formData.email, formData.password, "customer");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-10 shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Customer Login</h1>
        <p className="mt-2 text-secondary">Access your Home4Stay account</p>
      </div>

      <form onSubmit={handleLogin} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-primary">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm focus:border-primary focus:outline-none"
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
          className={`w-full rounded-xl bg-primary py-4 font-bold text-white transition hover:opacity-90 ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm">
        <p className="text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-bold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

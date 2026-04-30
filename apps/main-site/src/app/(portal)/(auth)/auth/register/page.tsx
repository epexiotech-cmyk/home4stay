"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { validatePassword } from "@/lib/utils/password";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const passwordValidation = useMemo(() => validatePassword(formData.password), [formData.password]);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";
  const canSubmit = formData.name && formData.email && passwordValidation.isValid && passwordsMatch;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-10 shadow-xl text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-primary">Account Created!</h1>
        <p className="mt-4 text-secondary">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface p-10 shadow-xl max-w-md w-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Create Account</h1>
        <p className="mt-2 text-secondary">Join Home4Stay today</p>
      </div>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-12 rounded-xl border border-border bg-background px-4 focus:border-primary outline-none transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-12 rounded-xl border border-border bg-background px-4 focus:border-primary outline-none transition-all"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full h-12 rounded-xl border border-border bg-background px-4 focus:border-primary outline-none transition-all"
            placeholder="••••••••"
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <div>
          <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2">Confirm Password</label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full h-12 rounded-xl border bg-background px-4 outline-none transition-all ${
              formData.confirmPassword && !passwordsMatch ? "border-red-300 focus:border-red-500" : "border-border focus:border-primary"
            }`}
            placeholder="••••••••"
          />
          {formData.confirmPassword && !passwordsMatch && (
            <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest">Passwords do not match</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={`w-full h-14 bg-primary text-white rounded-xl font-black shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] mt-4 ${
            (!canSubmit || submitting) ? "opacity-50 cursor-not-allowed grayscale" : ""
          }`}
        >
          {submitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
        </button>

        <p className="text-center text-xs text-secondary mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

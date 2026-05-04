"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { validatePassword } from "@/lib/client/password";
import { isValidPhoneNumber } from "react-phone-number-input";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [showPasswords, setShowPasswords] = useState(false);

  const passwordValidation = useMemo(() => validatePassword(formData.password), [formData.password]);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";
  
  const isPhoneValid = formData.phone ? isValidPhoneNumber(formData.phone) : false; 
  const canSubmit = formData.name && formData.email && isPhoneValid && passwordValidation.isValid && passwordsMatch;

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
          phone: formData.phone,
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

        <PhoneInput
          label="Mobile Number"
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}
        />

        <PasswordInput
          label="Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
          show={showPasswords}
          onToggle={() => setShowPasswords(!showPasswords)}
          success={passwordsMatch}
        />
        <PasswordStrengthIndicator password={formData.password} />

        <PasswordInput
          label="Confirm Password"
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={formData.confirmPassword && !passwordsMatch ? "Passwords do not match" : ""}
          placeholder="••••••••"
          show={showPasswords}
          onToggle={() => setShowPasswords(!showPasswords)}
          success={passwordsMatch}
        />

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

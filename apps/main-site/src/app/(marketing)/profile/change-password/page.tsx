"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Auth Protection
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.newPassword !== "";
  const canSubmit = formData.currentPassword && formData.newPassword.length >= 8 && passwordsMatch && !saving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from your current password");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess(true);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Navigate back after a delay
      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Profile</span>
        </Link>

        <div className="mb-10 text-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Change Password</h1>
          <p className="text-gray-500 mt-2">Secure your account with a strong password</p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 p-8 md:p-10 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <PasswordInput
              label="Current Password"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              show={showPasswords}
              onToggle={() => setShowPasswords(!showPasswords)}
            />

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <PasswordInput
                label="New Password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                success={passwordsMatch}
                show={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
              />

              <PasswordStrengthIndicator password={formData.newPassword} />

              <PasswordInput
                label="Confirm New Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                success={passwordsMatch}
                error={formData.confirmPassword && !passwordsMatch ? "Passwords do not match" : ""}
                show={showPasswords}
                onToggle={() => setShowPasswords(!showPasswords)}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50/50 border border-green-100 text-green-700 rounded-xl text-sm font-bold animate-fade-in flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>Password updated! Redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-13 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mt-4"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <KeyRound size={20} />}
              <span>{saving ? "Updating..." : "Update Password"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

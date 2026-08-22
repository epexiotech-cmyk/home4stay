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
      router.replace("/login");
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
    <div className="min-h-screen bg-transparent pt-72 pb-20 px-6 relative overflow-hidden">
      {/* Atmospheric Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#159665]/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-3 text-[#0E5A75]/60 dark:text-[#0983B0]/60 hover:text-[#0E5A75] dark:hover:text-white transition-all mb-10 group uppercase text-[10px] font-black tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Return to Profile</span>
        </Link>

        <div className="mb-12 text-center">
          <div className="h-20 w-20 bg-[#0E5A75]/10 dark:bg-[#0983B0]/10 text-[#0E5A75] dark:text-[#0983B0] rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-luxury ring-8 ring-[#0E5A75]/5 dark:ring-white/5">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#053344] dark:text-white leading-none mb-4">Change Password</h1>
          <p className="text-sm font-bold text-[#0E5A75]/60 dark:text-[#0983B0]/60 uppercase tracking-widest italic">Security Vault Management</p>
        </div>

        {/* Glass Card */}
        <div className="glass-premium dark:bg-white/[0.03] rounded-[48px] shadow-luxury border border-white/20 dark:border-white/10 p-10 md:p-12 transition-all duration-700 hover:shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <PasswordInput
              label="Current Password"
              placeholder="••••••••"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              show={showPasswords}
              onToggle={() => setShowPasswords(!showPasswords)}
            />

            <hr className="border-[#0E5A75]/5 dark:border-white/5" />

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
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[20px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-[#159665]/10 border border-[#159665]/20 text-[#159665] rounded-[20px] text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
                <CheckCircle2 size={18} />
                <span>Security updated. Redirecting...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-16 bg-[#0E5A75] dark:bg-[#0983B0] text-white rounded-[24px] text-xs font-black uppercase tracking-[0.3em] shadow-luxury hover:scale-[1.02] hover:shadow-2xl active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all duration-500 flex items-center justify-center gap-4 mt-6"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <KeyRound size={20} />}
              <span>{saving ? "Authenticating..." : "Commit Changes"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

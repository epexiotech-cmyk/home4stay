"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Lock } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(!!token);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);

  // 1. Verify token and fetch user data on load
  React.useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setIsExpired(true);
          return;
        }

        setUserData(data.user);
      } catch (err) {
        console.error("Token verification failed:", err);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const [showPasswords, setShowPasswords] = useState(false);

  const passwordsMatch = password === confirmPassword && password !== "";
  const canSubmit = password.length >= 8 && passwordsMatch && !loading && token && !verifying;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.toLowerCase().includes("expired") || data.error?.toLowerCase().includes("invalid")) {
          setIsExpired(true);
        }
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if ((!token || isExpired) && !success) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/40 p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <Lock size={40} className="opacity-80" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-dark mb-4">Link expired</h1>
        <p className="text-gray-500 leading-relaxed mb-10">This reset link is no longer valid. For your security, reset links expire after 15 minutes or after a single use.</p>
        <Link 
          href="/auth/forgot-password" 
          className="inline-flex items-center justify-center w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/40 p-8 md:p-12 relative overflow-hidden">
      {/* Subtle Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      
      <div className="text-center mb-10">
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Lock size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-dark">Reset Password</h1>
        
        {verifying ? (
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm font-medium">Verifying your account...</span>
          </div>
        ) : userData ? (
          <div className="mt-4 inline-flex flex-col items-center px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-500">
            <span className="text-sm font-bold text-primary-dark">{userData.name}</span>
            <span className="text-xs text-gray-400 font-medium">{userData.email}</span>
          </div>
        ) : (
          <p className="text-gray-500 mt-3 leading-relaxed">Create a new, strong password for your account</p>
        )}
      </div>

      {success ? (
        <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-primary-dark mb-3">Success!</h2>
          <p className="text-gray-500 mb-10">Your password has been reset successfully. Redirecting you to login...</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-progress origin-left"></div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <PasswordInput
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 bg-white/50 border-gray-100 rounded-2xl"
              show={showPasswords}
              onToggle={() => setShowPasswords(!showPasswords)}
              success={passwordsMatch}
            />

            <PasswordStrengthIndicator password={password} />

            <PasswordInput
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              error={confirmPassword && !passwordsMatch ? "Passwords do not match" : ""}
              className="h-14 bg-white/50 border-gray-100 rounded-2xl"
              show={showPasswords}
              onToggle={() => setShowPasswords(!showPasswords)}
              success={passwordsMatch}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            <span>{loading ? "Resetting..." : "Reset Password"}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF6F1] to-[#FFFFFF] p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Login</span>
        </Link>

        <Suspense fallback={<div className="text-center py-20"><Loader2 className="animate-spin text-primary mx-auto" size={32} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Mail, CheckCircle2, RefreshCw } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [user, domain] = email.split("@");
    if (!user || !domain) return email;
    if (user.length <= 1) return `*@${domain}`;
    return `${user[0]}***@${domain}`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email) return;

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      // Only show error if it's a server crash or critical failure
      // (status 500 or network failure)
      if (!res.ok && res.status >= 500) {
        throw new Error(data.error || "Server error occurred. Please try again later.");
      }

      setSubmittedEmail(email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setSuccess(false);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDF6F1] to-[#FFFFFF] p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Login</span>
        </Link>

        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/40 p-8 md:p-12 text-center relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>

          {success ? (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
              <div className="h-20 w-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                <CheckCircle2 size={40} />
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight text-primary-dark mb-4">Check your email</h1>
              <p className="text-gray-500 leading-relaxed mb-6">
                If an account exists for <span className="font-semibold text-primary-dark">{maskEmail(submittedEmail)}</span>, 
                you will receive a password reset link shortly.
              </p>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-8"></div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 font-medium">Didn&apos;t receive the email?</p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors px-6 py-2 rounded-xl hover:bg-primary/5"
                >
                  <RefreshCw size={18} />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Mail size={32} />
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight text-primary-dark mb-3">Forgot Password?</h1>
              <p className="text-gray-500 mb-10 leading-relaxed">Enter your email address and we&apos;ll send you a link to reset your password.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 bg-white/50 border border-gray-100 rounded-2xl pl-12 pr-4 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium text-primary-dark"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold animate-shake">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-[0_15px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                  <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-10 text-gray-400 text-sm font-medium">
          Remembered your password?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline ml-1">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { validatePassword } from "@/lib/client/password";
import { isValidPhoneNumber } from "react-phone-number-input";

export function CustomerRegisterForm() {
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
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="relative glass-premium rounded-[48px] p-12 shadow-luxury text-center animate-in fade-in zoom-in duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#159665]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="w-24 h-24 bg-[#159665]/10 text-[#159665] rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#159665]/10 rotate-12">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight">Account Created</h1>
        <p className="mt-4 text-[#0E5A75]/60 dark:text-white/40 font-bold uppercase tracking-widest text-[10px]">Your luxury journey begins. Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div className="relative glass-premium rounded-[48px] p-10 md:p-14 shadow-luxury max-w-lg w-full animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FCBC43]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#0983B0]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative text-center z-10 mb-12">
        <div className="w-16 h-16 bg-[#0E5A75] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-6">
          <Sparkles size={32} className="text-[#FCBC43]" />
        </div>
        <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight">Create Account</h1>
        <p className="mt-2 text-[#0E5A75]/40 dark:text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">Join Home4Stay today</p>
      </div>

      <form onSubmit={handleRegister} className="relative z-10 space-y-6">
        <div>
          <label className="block text-[10px] font-black text-[#0E5A75]/60 dark:text-white/40 uppercase tracking-[0.3em] mb-3 ml-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-14 rounded-2xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-6 focus:border-[#0E5A75] dark:focus:border-[#0983B0] focus:ring-4 focus:ring-[#0E5A75]/5 outline-none transition-all duration-300 font-medium text-[#053344] dark:text-white placeholder:text-[#0E5A75]/20 dark:placeholder:text-white/10"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-[#0E5A75]/60 dark:text-white/40 uppercase tracking-[0.3em] mb-3 ml-1">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-14 rounded-2xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-6 focus:border-[#0E5A75] dark:focus:border-[#0983B0] focus:ring-4 focus:ring-[#0E5A75]/5 outline-none transition-all duration-300 font-medium text-[#053344] dark:text-white placeholder:text-[#0E5A75]/20 dark:placeholder:text-white/10"
            placeholder="john@example.com"
          />
        </div>

        <PhoneInput
          label="Mobile Number"
          value={formData.phone}
          onChange={(val) => setFormData({ ...formData, phone: val })}
        />

        <div className="space-y-4">
          <PasswordInput
            label="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            show={showPasswords}
            onToggle={() => setShowPasswords(!showPasswords)}
            success={passwordValidation.isValid}
          />
          <PasswordStrengthIndicator password={formData.password} />
        </div>

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
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#F24633]/10 p-5 text-[10px] font-black text-[#F24633] border border-[#F24633]/20 uppercase tracking-widest text-center"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className={`w-full h-16 rounded-[24px] font-black shadow-2xl transition-all duration-500 active:scale-[0.98] mt-4 flex items-center justify-center gap-3 relative overflow-hidden group ${
            (!canSubmit || submitting) 
              ? "bg-[#0E5A75]/20 text-[#0E5A75]/40 cursor-not-allowed" 
              : "bg-[#0E5A75] dark:bg-[#0983B0] text-white shadow-[#0E5A75]/30 hover:shadow-[#0E5A75]/50 hover:-translate-y-1"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span>{submitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
          {!submitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>

        <p className="text-center text-[10px] font-black text-[#0E5A75]/40 dark:text-white/30 uppercase tracking-[0.4em] mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-[#0E5A75] dark:text-[#FCBC43] font-black hover:underline transition-all">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

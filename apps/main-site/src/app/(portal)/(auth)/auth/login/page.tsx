"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/auth/PasswordInput";

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
    <div className="relative glass-premium rounded-[48px] p-10 md:p-14 shadow-luxury max-w-lg w-full animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FCBC43]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#0983B0]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative text-center z-10 mb-12">
        <div className="w-16 h-16 bg-[#0E5A75] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl -rotate-6">
          <LogIn size={32} className="text-[#FCBC43]" />
        </div>
        <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight">Welcome Back</h1>
        <p className="mt-2 text-[#0E5A75]/40 dark:text-white/30 font-black uppercase tracking-[0.3em] text-[10px]">Access your Home4Stay account</p>
      </div>

      <form onSubmit={handleLogin} className="relative z-10 space-y-8">
        <div>
          <label className="block text-[10px] font-black text-[#0E5A75]/60 dark:text-white/40 uppercase tracking-[0.3em] mb-3 ml-1">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-14 rounded-2xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-6 focus:border-[#0E5A75] dark:focus:border-[#0983B0] focus:ring-4 focus:ring-[#0E5A75]/5 outline-none transition-all duration-300 font-medium text-[#053344] dark:text-white placeholder:text-[#0E5A75]/20 dark:placeholder:text-white/10"
            placeholder="e.g. vikram@example.com"
          />
        </div>

        <div className="space-y-4">
          <PasswordInput
            label="Security Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="h-14"
          />
          <div className="flex justify-end pr-1">
            <Link 
              href="/auth/forgot-password" 
              className="text-[10px] font-black text-[#0983B0] dark:text-[#FCBC43] uppercase tracking-widest hover:underline transition-all"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

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
          disabled={submitting}
          className={`w-full h-16 rounded-[24px] font-black shadow-2xl transition-all duration-500 active:scale-[0.98] mt-4 flex items-center justify-center gap-3 relative overflow-hidden group ${
            submitting 
              ? "bg-[#0E5A75]/20 text-[#0E5A75]/40 cursor-not-allowed" 
              : "bg-[#0E5A75] dark:bg-[#0983B0] text-white shadow-[#0E5A75]/30 hover:shadow-[#0E5A75]/50 hover:-translate-y-1"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span>{submitting ? "AUTHENTICATING..." : "SIGN IN TO ACCOUNT"}</span>
          {!submitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>

        <p className="text-center text-[10px] font-black text-[#0E5A75]/40 dark:text-white/30 uppercase tracking-[0.4em] mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#0E5A75] dark:text-[#FCBC43] font-black hover:underline transition-all">
            Join the Club
          </Link>
        </p>
      </form>

      {/* Trust Indicator */}
      <div className="mt-12 pt-8 border-t border-[#0E5A75]/5 dark:border-white/5 flex items-center justify-center gap-3 opacity-30">
         <div className="w-2 h-2 rounded-full bg-[#159665] animate-pulse" />
         <span className="text-[8px] font-black text-[#053344] dark:text-white uppercase tracking-[0.3em]">AES-256 Bit Encryption Active</span>
      </div>
    </div>
  );
}

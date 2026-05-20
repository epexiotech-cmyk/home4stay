"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PasswordInput } from "@/components/auth/PasswordInput";

type LoginFormData = {
  email: string;
  password: string;
};

export default function PartnerLoginPage() {
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
      await login(formData.email, formData.password, "partner");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-premium p-10 bg-white/5 dark:bg-[#0E5A75]/40 backdrop-blur-2xl border border-[#0E5A75]/10 dark:border-white/10 shadow-2xl rounded-[32px] animate-in fade-in zoom-in duration-700">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-[#0E5A75] dark:text-white tracking-tight">Partner Login</h1>
        <p className="text-[#29655C] dark:text-[#0983B0] font-black uppercase tracking-[0.25em] text-[10px] mt-2 opacity-90">Manage your property bookings</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-[11px] font-black uppercase tracking-widest text-[#0E5A75] dark:text-[#0983B0] mb-2 ml-1">Partner Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-14 rounded-2xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-6 focus:ring-4 focus:ring-[#0E5A75]/5 dark:focus:ring-[#0983B0]/5 outline-none transition-all text-[#0E5A75] dark:text-white font-medium placeholder:text-[#0E5A75]/30 dark:placeholder:text-white/20"
            placeholder="owner@home4stay.com"
          />
        </div>
        
        <div className="space-y-2">
          <PasswordInput
            label="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-2xl bg-[#F24633]/10 p-4 text-[11px] font-black uppercase tracking-widest text-[#F24633] border border-[#F24633]/20 animate-in shake duration-300">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={submitting}
          className={`w-full h-14 bg-[#0E5A75] hover:bg-[#0983B0] text-white py-4 rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-xl shadow-[#0E5A75]/20 transition-all active:scale-[0.98] mt-2 group relative overflow-hidden ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative z-10">{submitting ? "Authenticating..." : "Enter Dashboard"}</span>
        </button>
      </form>

      <div className="mt-10 text-center text-[11px] font-black uppercase tracking-[0.15em] text-[#29655C] dark:text-[#0983B0]">
        Don&apos;t have a partner account?{" "}
        <Link href="/partner/register" className="text-[#0E5A75] dark:text-white hover:underline ml-1 decoration-2 underline-offset-4 transition-all">
          Get Started
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Sparkles, ArrowRight } from "lucide-react";

type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  propertyName: string;
  password: string;
  confirmPassword: string;
};

export default function PartnerRegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    propertyName: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [activeVersions, setActiveVersions] = useState({
    TERMS_AND_CONDITIONS: "1.0.0",
    PRIVACY_POLICY: "1.0.0",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/legal/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.versions) {
          setActiveVersions({
            TERMS_AND_CONDITIONS: data.versions.TERMS_AND_CONDITIONS || "1.0.0",
            PRIVACY_POLICY: data.versions.PRIVACY_POLICY || "1.0.0",
          });
        }
      })
      .catch((err) => console.error("Error fetching legal versions:", err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setSubmitting(false);
      return;
    }

    if (!acceptedPolicies) {
      setError("You must accept the Terms & Conditions and Privacy Policy to continue");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          propertyName: formData.propertyName,
          password: formData.password,
          acceptedTermsVersion: activeVersions.TERMS_AND_CONDITIONS,
          acceptedPrivacyVersion: activeVersions.PRIVACY_POLICY,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create partner account");
      }

      setSuccess(true);
      
      // Delay redirection for a premium feel to show success state
      setTimeout(() => {
        // Trigger page refresh so AuthContext picks up the new cookies
        window.location.href = "/partner/onboarding/welcome";
      }, 1500);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-premium p-10 bg-white/5 dark:bg-[#0E5A75]/40 backdrop-blur-2xl border border-[#0E5A75]/10 dark:border-white/10 shadow-2xl rounded-[32px] animate-in fade-in zoom-in duration-700 select-none">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 mb-4 scale-95">
          <Sparkles size={12} className="text-[#FCBC43]" />
          <span className="text-[9px] font-black uppercase tracking-wider">Host Direct Setup Suite</span>
        </div>
        <h1 className="text-3xl font-black text-[#0E5A75] dark:text-white tracking-tight">Create Partner Account</h1>
        <p className="text-[#29655C] dark:text-[#0983B0] font-black uppercase tracking-[0.2em] text-[9px] mt-2 opacity-95">Establish your luxury direct-booking ecosystem</p>
      </div>

      {success ? (
        <div className="text-center py-10 space-y-4 animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 border border-success/20">
            <Sparkles size={28} className="animate-pulse text-success" />
          </div>
          <h3 className="text-lg font-black text-primary uppercase tracking-widest">Registration Successful!</h3>
          <p className="text-xs text-secondary/60 max-w-xs mx-auto leading-relaxed">
            Initializing your premium direct-booking host environment. Preparing workspace...
          </p>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75] dark:text-[#0983B0] mb-2 ml-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 rounded-xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-5 focus:ring-4 focus:ring-[#0E5A75]/5 dark:focus:ring-[#0983B0]/5 outline-none transition-all text-[#0E5A75] dark:text-white font-medium text-xs placeholder:text-[#0E5A75]/30"
              placeholder="Your Name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75] dark:text-[#0983B0] mb-2 ml-1">Partner Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 rounded-xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-5 focus:ring-4 focus:ring-[#0E5A75]/5 dark:focus:ring-[#0983B0]/5 outline-none transition-all text-[#0E5A75] dark:text-white font-medium text-xs placeholder:text-[#0E5A75]/30"
                placeholder="owner@hotel.com"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75] dark:text-[#0983B0] mb-2 ml-1">Mobile Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-12 rounded-xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-5 focus:ring-4 focus:ring-[#0E5A75]/5 dark:focus:ring-[#0983B0]/5 outline-none transition-all text-[#0E5A75] dark:text-white font-medium text-xs placeholder:text-[#0E5A75]/30"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75] dark:text-[#0983B0] mb-2 ml-1">Primary Property / Villa Name</label>
            <input
              type="text"
              required
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              className="w-full h-12 rounded-xl border border-[#0E5A75]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 px-5 focus:ring-4 focus:ring-[#0E5A75]/5 dark:focus:ring-[#0983B0]/5 outline-none transition-all text-[#0E5A75] dark:text-white font-medium text-xs placeholder:text-[#0E5A75]/30"
              placeholder="e.g. Royal Shivay Retreat"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <PasswordInput
                label="Password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-1">
              <PasswordInput
                label="Confirm Password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 mt-4 ml-1 select-none">
            <input
              type="checkbox"
              id="acceptedPolicies"
              checked={acceptedPolicies}
              onChange={(e) => setAcceptedPolicies(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#0E5A75]/20 bg-white/20 text-[#0E5A75] focus:ring-[#0E5A75]/30 cursor-pointer"
            />
            <label htmlFor="acceptedPolicies" className="text-[10px] font-medium leading-relaxed text-[#29655C] dark:text-[#0983B0] cursor-pointer">
              I read and agree to the{" "}
              <Link href="/terms" target="_blank" className="text-[#0E5A75] dark:text-white underline decoration-1 decoration-[#0E5A75]/30 underline-offset-2 hover:text-[#0983B0] transition-colors">
                Terms &amp; Conditions (v{activeVersions.TERMS_AND_CONDITIONS})
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-[#0E5A75] dark:text-white underline decoration-1 decoration-[#0E5A75]/30 underline-offset-2 hover:text-[#0983B0] transition-colors">
                Privacy Policy (v{activeVersions.PRIVACY_POLICY})
              </Link>.
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-[#F24633]/10 p-4 text-[10px] font-black uppercase tracking-widest text-[#F24633] border border-[#F24633]/20 animate-in shake duration-300">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={submitting}
            className={`w-full h-12 bg-[#0E5A75] hover:bg-[#0983B0] text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#0E5A75]/20 transition-all active:scale-[0.98] mt-3 group relative overflow-hidden ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <span>{submitting ? "Establishing Workspace..." : "Establish Workspace"}</span>
              {!submitting && <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />}
            </span>
          </button>
        </form>
      )}

      <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.15em] text-[#29655C] dark:text-[#0983B0]">
        Already have a partner account?{" "}
        <Link href="/partner/login" className="text-[#0E5A75] dark:text-white hover:underline ml-1 decoration-2 underline-offset-4 transition-all">
          Sign In
        </Link>
      </div>

    </div>
  );
}

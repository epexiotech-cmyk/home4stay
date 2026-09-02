"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  Check, 
  AlertTriangle, 
  XCircle,
  Eye,
  Rocket,
  Award,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";

import { LaunchReadinessReport } from "@/lib/onboarding/readiness";

export default function LaunchStepPage() {
  const router = useRouter();
  const { draftData, saveStepDraft } = useOnboarding();
  const { fetchUser } = useAuth();
  
  // UI states
  const [report, setReport] = useState<LaunchReadinessReport | null>(null);
  const [draftToken, setDraftToken] = useState("");
  const [slug, setSlug] = useState("");
  const [loadingReport, setLoadingReport] = useState(true);
  const [launched, setLaunched] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Activation State
  const [activationData, setActivationData] = useState<{
    activationKey: string;
    activationUrl: string;
    status: string;
    activatedAt: string | null;
  } | null>(null);
  const [fetchingActivation, setFetchingActivation] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);




  // 1. Fetch live launch readiness metrics on mount
  const fetchReadiness = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoadingReport(true);
      }
      const res = await fetch("/api/partner/onboarding/launch");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setReport(json.report);
          setDraftToken(json.draftToken);
          setSlug(json.slug);
        }
      }
    } catch (err) {
      console.error("Failed to load readiness metrics:", err);
    } finally {
      setLoadingReport(false);
      fetchActivation();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReadiness(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  
  const fetchActivation = async () => {
    try {
      const res = await fetch("/api/partner/activation");
      const json = await res.json();
      if (res.ok && json.success) {
        setActivationData(json.data);
        if (json.data.status === "ACTIVE") setLaunched(true);
      }
    } catch (err) {
      console.error("Failed to load activation data:", err);
    } finally {
      setFetchingActivation(false);
    }
  };



  // 3. Trigger Core Activation workflow
  const handleLaunch = async () => {
    setError(null);
    setActivating(true);

    try {

      const res = await fetch("/api/partner/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchUser();
        setLaunched(true);
        fetchActivation();
      } else {

        setError(json.error || "Launch failed. Please verify that all blocking issues are resolved.");
      }
    } catch {
      setError("An unexpected network error occurred during property activation.");
    } finally {
      setActivating(false);
    }
  };

  if (loadingReport) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-[#0E5A75] animate-spin stroke-[1.5]" />
        <p className="text-xs font-semibold text-secondary/60 tracking-widest uppercase">Analyzing Brand Readiness...</p>
      </div>
    );
  }

  // --- 🌟 RENDER CELEBRATION EXPERIENCE SCREEN ---
  if (launched) {
    const publicUrl = `/property/${slug}`;

    return (
      <div className="space-y-12 animate-in zoom-in-95 duration-700 max-w-4xl mx-auto py-6">
        
        {/* Cinematic Backdrop Banner */}
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#053344] via-[#0E5A75] to-[#159665] text-white p-12 lg:p-16 text-center space-y-8 shadow-2xl border border-white/10">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 text-amber-200 border border-white/20 animate-pulse">
            <Sparkles size={16} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Brand Website Active</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none">
              Your Sanctuary <br/>is Now <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-emerald-200">Publicly Live</span>
            </h1>
            <p className="text-sm font-medium text-white/80 leading-relaxed max-w-lg mx-auto">
              Your bespoke luxury hospitality site is officially online. You are ready to welcome global guests, showcase local experiences, and accept bookings.
            </p>
          </div>

          {/* Premium Celebration Badges */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 max-w-xl mx-auto">
            <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <Award className="text-amber-200" size={24} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">SaaS Domain</span>
              <span className="text-[10px] font-extrabold">Active</span>
            </div>
            <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <Smartphone className="text-emerald-200" size={24} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Mobile UX</span>
              <span className="text-[10px] font-extrabold">Responsive</span>
            </div>
            <div className="col-span-2 md:col-span-1 flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <ShieldCheck className="text-white" size={24} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Bookings</span>
              <span className="text-[10px] font-extrabold">Enabled</span>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Public Destination link */}
          <div className="bg-white border border-border rounded-[32px] p-8 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-lg font-black text-primary">Public Portal Gateway</h3>
              <p className="text-xs text-secondary/60 leading-relaxed">
                This is the official storefront where customers explore accommodations, customize itineraries, and place bookings.
              </p>
            </div>
            <div className="pt-4">
              <a 
                href={publicUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#0E5A75] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0E5A75]/10 hover:bg-[#0983B0] transition-all"
              >
                <span>Visit Public Site</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Card 2: Interactive Sandbox simulation */}
          <div className="bg-slate-50 border border-border rounded-[32px] p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-lg font-black text-primary">Host Partner Dashboard</h3>
              <p className="text-xs text-secondary/60 leading-relaxed">
                Coordinate reservation requests, update room rates, curate experiences, and customize styling configurations instantly.
              </p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => router.push("/partner/dashboard")}
                className="w-full py-4 px-6 rounded-2xl bg-white border-2 border-primary/10 text-primary text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Admin Console</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // --- 🛠️ RENDER LAUNCH CHECKLIST AUDIT DASHBOARD ---
  const launchScore = report?.launchScore || 0;
  const isReady = report?.isReady || false;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 select-none">
      
      {/* Page Title */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <Globe size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Step 10: Property Activation Center</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Direct Booking Launchpad</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Review your checklist metrics below. Once all blocking criteria are green, publish your luxury brand.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-error/5 border border-error/10 text-error text-xs font-bold rounded-2xl flex items-center gap-2">
          <XCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main launch interface layout */}
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* PROPERTY ACTIVATION CARD */}
          <div className="bg-white border border-border rounded-[32px] p-8 space-y-6 shadow-sm">
            <h3 className="text-xs font-black text-secondary uppercase tracking-widest text-center">Property Activation</h3>
            
            {fetchingActivation ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : activationData ? (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">Status</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    activationData.status === "ACTIVE" ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"
                  }`}>
                    {activationData.status === "ACTIVE" ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                    <span>{activationData.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">Activation Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-xs font-mono font-bold text-primary">
                      {activationData.activationKey}
                    </code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(activationData.activationKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-border rounded-xl text-secondary transition-colors"
                      title="Copy Activation Key"
                    >
                      {copiedKey ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border space-y-4">
                  <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">Dynamic QR Code</span>
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-border">
                    <QRCodeSVG value={typeof window !== 'undefined' ? `${window.location.origin}${activationData.activationUrl}` : activationData.activationUrl} size={140} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">Activation URL</label>
                  <div className="flex items-center gap-2">
                    <input 
                      readOnly 
                      value={typeof window !== 'undefined' ? `${window.location.origin}${activationData.activationUrl}` : activationData.activationUrl} 
                      className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-[10px] font-mono text-secondary truncate" 
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(typeof window !== 'undefined' ? `${window.location.origin}${activationData.activationUrl}` : activationData.activationUrl);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-border rounded-xl text-secondary transition-colors"
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {!isReady && (
                  <div className="p-4 bg-amber-50 text-amber-700 text-xs font-medium rounded-xl border border-amber-100 flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>Property cannot be activated yet. Please resolve all blocking checklist issues first.</p>
                  </div>
                )}
                
                <button
                  type="button"
                  disabled={!isReady || activating}
                  onClick={handleLaunch}
                  className="w-full py-4 rounded-2xl bg-[#0E5A75] text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-[#0E5A75]/10 hover:bg-[#0983B0] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {activating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Publishing Brand...</span>
                    </>
                  ) : (
                    <>
                      <Rocket size={14} />
                      <span>Activate Guest Site</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        
        {/* Secure Preview Button */}
              {slug && (
                <a
                  href={`/property/${slug}?draft=${draftToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 rounded-2xl bg-slate-50 border border-primary/10 text-primary text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={14} />
                  <span>Preview Guest Portal</span>
                </a>
              )}
        
      </div>

      {/* Return options */}
      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-success" />
          <span>Setup compliance locks loaded</span>
        </span>
        <button
          onClick={() => router.push("/partner/dashboard")}
          className="btn btn-secondary px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 group"
        >
          <span>Return to Dashboard</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}

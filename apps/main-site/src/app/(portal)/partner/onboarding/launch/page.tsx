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
import { TextField, TextArea } from "@/components/onboarding/FormComponents";
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

  // AI states
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAiEventId, setLastAiEventId] = useState<string | null>(null);
  const [generatedSeo, setGeneratedSeo] = useState<{ metaTitle: string; metaDescription: string; ogCopy: string } | null>(null);

  const launchDraft = draftData.launch || { domain: "", metaTitle: "", metaDescription: "", ogCopy: "" };

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
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReadiness(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    saveStepDraft("launch", {
      ...launchDraft,
      [field]: value
    });
  };

  // 2. AI SEO Composer trigger
  const triggerSeoComposer = async () => {
    setAiGenerating(true);
    setAiSuccess(false);
    setAiError(null);

    try {
      const property = draftData.property || { title: "", location: "", description: "", tagline: "", slug: "" };
      const res = await fetch("/api/partner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_SEO",
          context: {
            propertyName: property.title || "My Luxury Sanctuary",
            location: property.location || "our luxury coordinates",
            description: property.description || "A luxury hospitality retreat."
          }
        })
      });

      const json = await res.json();
      if (json.success) {
        saveStepDraft("launch", {
          ...launchDraft,
          metaTitle: json.metaTitle,
          metaDescription: json.metaDescription,
          ogCopy: json.ogCopy
        });
        setLastAiEventId(json.eventId);
        setGeneratedSeo({
          metaTitle: json.metaTitle,
          metaDescription: json.metaDescription,
          ogCopy: json.ogCopy
        });
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 3000);
        // Refresh checklist report
        setTimeout(fetchReadiness, 500);
      } else {
        setAiError(json.error || "Composer timed out. Please input metadata manually.");
      }
    } catch {
      setAiError("Composer offline. Please write search tags manually.");
    } finally {
      setAiGenerating(false);
    }
  };

  // 3. Trigger Core Activation workflow
  const handleLaunch = async () => {
    setError(null);
    setActivating(true);

    try {
      // Record any AI feedback telemetry
      if (lastAiEventId && generatedSeo) {
        const wasEdited = generatedSeo.metaTitle !== launchDraft.metaTitle ||
                          generatedSeo.metaDescription !== launchDraft.metaDescription ||
                          generatedSeo.ogCopy !== launchDraft.ogCopy;

        fetch("/api/partner/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "RECORD_FEEDBACK",
            context: {
              eventId: lastAiEventId,
              feedbackAction: wasEdited ? "edit" : "accept",
              savedOutput: {
                metaTitle: launchDraft.metaTitle,
                metaDescription: launchDraft.metaDescription,
                ogCopy: launchDraft.ogCopy
              }
            }
          })
        }).catch(err => console.error("Feedback tracking error:", err));
      }

      const res = await fetch("/api/partner/onboarding/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchUser();
        setLaunched(true);
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
        <span className="text-[10px] font-black uppercase tracking-[0.25em]">Step 10: Launch Readiness Center</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Launch completeness score & actions */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-border rounded-[32px] p-8 space-y-8 shadow-sm text-center">
            <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Readiness Score</h3>
            
            {/* Dynamic circular-styled audit score progress */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="88" 
                  cy="88" 
                  r="76" 
                  className="stroke-slate-100 fill-none" 
                  strokeWidth="12" 
                />
                <circle 
                  cx="88" 
                  cy="88" 
                  r="76" 
                  className={`fill-none transition-all duration-1000 ${
                    launchScore >= 80 ? "stroke-[#159665]" : "stroke-amber-500"
                  }`} 
                  strokeWidth="12" 
                  strokeDasharray={2 * Math.PI * 76}
                  strokeDashoffset={2 * Math.PI * 76 * (1 - launchScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center space-y-1">
                <p className="text-5xl font-black tracking-tighter text-primary">{launchScore}%</p>
                <p className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">Complete</p>
              </div>
            </div>

            <div className="space-y-4">
              {isReady ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-wider">
                  <CheckCircle2 size={12} />
                  <span>Ready to Launch</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black uppercase tracking-wider">
                  <AlertTriangle size={12} />
                  <span>Setup Gaps Pending</span>
                </div>
              )}

              <p className="text-xs text-secondary/60 leading-relaxed px-4">
                {isReady 
                  ? "All blocking issues resolved! Your luxury hospitality experience is ready for launch."
                  : "Please resolve outstanding blocking issues (marked in red) before activating your portal."
                }
              </p>
            </div>

            <div className="space-y-3 pt-2">
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

          </div>

        </div>

        {/* RIGHT COLUMN: Checklist evaluation */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Brand Customization and AI Assist */}
          <div className="bg-white border border-border rounded-[32px] p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-primary animate-pulse" />
                <span>AI Direct-Booking SEO Assistant</span>
              </h3>

              <button
                type="button"
                disabled={aiGenerating}
                onClick={triggerSeoComposer}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1 transition-all disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 size={10} className="animate-spin" />
                    <span>Writing tags...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={10} />
                    <span>Auto-Write SEO Meta</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3 bg-error/5 border border-error/15 text-error text-[10px] font-bold rounded-xl">
                {aiError}
              </div>
            )}

            {aiSuccess && (
              <div className="p-3 bg-success/5 border border-success/15 text-success text-[10px] font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in duration-300">
                <Check size={12} className="stroke-[3px]" />
                <span>AI search coordinates updated. Review meta settings below:</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 rounded-2xl border border-border">
              <TextField
                label="Search Engine Title (Meta Title)"
                placeholder="e.g. Grand Shivay | Direct Booking Luxury Sanctuary"
                value={launchDraft.metaTitle || ""}
                onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
              />

              <TextArea
                label="Search Snippet Copy (Meta Description)"
                placeholder="e.g. Wake up to majestic pine mountains and organic five-star boutique hospitality..."
                value={launchDraft.metaDescription || ""}
                onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
              />

              <TextArea
                label="Social Sharing Headline (OpenGraph Copy)"
                placeholder="e.g. Book direct with 0% extra booking charges..."
                value={launchDraft.ogCopy || ""}
                onChange={(e) => handleFieldChange("ogCopy", e.target.value)}
              />
            </div>
          </div>

          {/* Audit Details */}
          <div className="bg-white border border-border rounded-[32px] p-8 space-y-6 shadow-sm">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider">Onboarding Checklist Audit</h3>
            
            {report && (
              <div className="divide-y divide-slate-100">
                
                {/* 1. Property Identity */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-primary">Property Brand Identity</p>
                    <p className="text-[10px] font-bold text-secondary/50">Brand Name, tagline, and narrative description.</p>
                  </div>
                  {report.criteria.propertyIdentity ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      <Check size={10} strokeWidth={3} />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-extrabold">
                      <XCircle size={10} />
                      <span>Missing</span>
                    </span>
                  )}
                </div>

                {/* 2. Theme Selection */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-primary">Property Theme</p>
                    <p className="text-[10px] font-bold text-secondary/50">Aesthetic theme presets selected.</p>
                  </div>
                  {report.criteria.themeSelected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      <Check size={10} strokeWidth={3} />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold">
                      <AlertTriangle size={10} />
                      <span>Default Preset</span>
                    </span>
                  )}
                </div>

                {/* 3. Hero Image */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-primary">Hero Backdrop Image</p>
                    <p className="text-[10px] font-bold text-secondary/50">Cover photo showing stay details.</p>
                  </div>
                  {report.criteria.heroUploaded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      <Check size={10} strokeWidth={3} />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-extrabold">
                      <XCircle size={10} />
                      <span>Missing</span>
                    </span>
                  )}
                </div>

                {/* 4. Rooms Inventory */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-primary">Suites & Inventory</p>
                    <p className="text-[10px] font-bold text-secondary/50">List of rooms with active pricing.</p>
                  </div>
                  {report.criteria.roomsConfigured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      <Check size={10} strokeWidth={3} />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-extrabold">
                      <XCircle size={10} />
                      <span>0 suites listed</span>
                    </span>
                  )}
                </div>

                {/* 5. Policies Configured */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-primary">Arrival/Departure Policies</p>
                    <p className="text-[10px] font-bold text-secondary/50">Standard check-in schedules.</p>
                  </div>
                  {report.criteria.policiesConfigured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      <Check size={10} strokeWidth={3} />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold">
                      <AlertTriangle size={10} />
                      <span>Warning</span>
                    </span>
                  )}
                </div>

                {/* 6. Contact Information */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-primary">Host Coordinates</p>
                    <p className="text-[10px] font-bold text-secondary/50">Guest coordinate coordinates.</p>
                  </div>
                  {report.criteria.contactConfigured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      <Check size={10} strokeWidth={3} />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-extrabold">
                      <XCircle size={10} />
                      <span>Missing</span>
                    </span>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

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

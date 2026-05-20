"use client";

import React, { useState } from "react";
import { ArrowRight, Palette, Waves, Mountain, ShieldCheck, Sparkles, Check, Loader2 } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";
import { ValidationMessage } from "@/components/onboarding/FormComponents";

export default function ThemeStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{ themeId: string; reason: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAiEventId, setLastAiEventId] = useState<string | null>(null);

  const themeDraft = draftData.theme || { themeId: "coastal" };
  const activeThemeId = themeDraft.themeId || "coastal";
  const errors = stepErrors.theme || {};

  const handleSelectTheme = (themeId: string) => {
    saveStepDraft("theme", { themeId });
  };

  const triggerThemeAdvisor = async () => {
    setAiAnalyzing(true);
    setAiRecommendation(null);
    setAiError(null);

    try {
      const property = draftData.property || { title: "", location: "", description: "", tagline: "", slug: "" };
      const res = await fetch("/api/partner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECOMMEND_THEME",
          context: {
            propertyType: property.title || "",
            location: property.location || "",
            vibeKeywords: property.description || ""
          }
        })
      });

      const json = await res.json();
      if (json.success && json.themeId) {
        setAiRecommendation({
          themeId: json.themeId,
          reason: json.reason
        });
        setLastAiEventId(json.eventId);
      } else {
        setAiError(json.error || "Advisor timed out. Please select an aesthetic manual preset.");
      }
    } catch {
      setAiError("Advisor offline. Please pick your atmospheric preset manually.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleContinue = async () => {
    if (lastAiEventId && aiRecommendation) {
      const isAccepted = activeThemeId === aiRecommendation.themeId;
      fetch("/api/partner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_FEEDBACK",
          context: {
            eventId: lastAiEventId,
            feedbackAction: isAccepted ? "accept" : "edit",
            savedOutput: { themeId: activeThemeId }
          }
        })
      }).catch(err => console.error("Feedback tracking error:", err));
    }
    await completeStep("theme");
  };

  const themes = [
    { 
      id: "coastal", 
      title: "Coastal Sands", 
      colors: ["#0983B0", "#0E5A75"], 
      desc: "Designed for beachside villas, coastal cabins, and island resorts.",
      icon: Waves 
    },
    { 
      id: "heritage", 
      title: "Heritage Luxury", 
      colors: ["#FCBC43", "#F24633"], 
      desc: "Designed for royal palaces, heritage havelis, and colonial manors.",
      icon: Sparkles 
    },
    { 
      id: "alpine", 
      title: "Alpine Snow", 
      colors: ["#E5E4E2", "#0983B0"], 
      desc: "Designed for mountain slopes, snow chalets, and organic pine lodges.",
      icon: Mountain 
    },
    { 
      id: "jungle", 
      title: "Jungle Escape", 
      colors: ["#159665", "#29655C"], 
      desc: "Designed for jungle hideaways, treehouse resorts, and eco-farmstays.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 select-none">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <Palette size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 3: Styling Theme Atmosphere</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Atmosphere Engine Presets</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Instantly set the visual tone for your guest portal website. Choose a premium layout template that best fits your hospitality experience.
        </p>
      </div>

      {errors.themeId && <ValidationMessage error={errors.themeId} />}

      {/* ✨ AI THEME ADVISOR CARD */}
      <div className="card-premium p-6 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-primary/20 rounded-[24px] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">
              AI Atmosphere Selector Advisor
            </h4>
          </div>

          <button
            type="button"
            disabled={aiAnalyzing}
            onClick={triggerThemeAdvisor}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1 transition-all disabled:opacity-50"
          >
            {aiAnalyzing ? (
              <>
                <Loader2 size={10} className="animate-spin" />
                <span>Analyzing narrative...</span>
              </>
            ) : (
              <>
                <Palette size={10} />
                <span>Ask AI Advisor</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="p-3 bg-error/5 border border-error/15 text-error text-[10px] font-bold rounded-xl">
            {aiError}
          </div>
        )}

        {aiRecommendation && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border space-y-3 animate-in zoom-in duration-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                  Recommended Theme
                </span>
                <h5 className="font-extrabold text-primary text-xs mt-1">
                  {themes.find(t => t.id === aiRecommendation.themeId)?.title || "Premium Custom Theme"}
                </h5>
              </div>

              {activeThemeId !== aiRecommendation.themeId ? (
                <button
                  type="button"
                  onClick={() => handleSelectTheme(aiRecommendation.themeId)}
                  className="px-3 py-1.5 bg-success text-white text-[8px] font-black uppercase tracking-wider rounded-md hover:bg-success-light transition-colors"
                >
                  Apply Advisor Layout
                </button>
              ) : (
                <span className="text-success text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5">
                  <Check size={10} className="stroke-[3px]" /> Active Theme
                </span>
              )}
            </div>

            <p className="text-[9px] font-medium text-secondary/60 leading-relaxed">
              {aiRecommendation.reason}
            </p>
          </div>
        )}
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isActive = theme.id === activeThemeId;
          const ThemeIcon = theme.icon;

          return (
            <div 
              key={theme.id} 
              onClick={() => handleSelectTheme(theme.id)}
              className={cn(
                "card-premium p-6 bg-white border rounded-[24px] hover-lift cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[160px] group transition-all duration-300 select-none",
                isActive 
                  ? "border-primary ring-2 ring-primary/20 bg-primary/[0.01]" 
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="flex justify-between items-center">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                  isActive ? "bg-primary text-white" : "bg-primary/5 text-primary"
                )}>
                  <ThemeIcon size={18} />
                </div>
                
                {/* Active check indicator or color preview dots */}
                {isActive ? (
                  <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center animate-in zoom-in duration-300">
                    <Check size={10} className="stroke-[3px]" />
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    {theme.colors.map((c, i) => (
                      <span 
                        key={i} 
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-extrabold text-primary text-sm tracking-tight">{theme.title}</h3>
                <p className="text-[10px] font-medium text-secondary/50 leading-relaxed mt-1">{theme.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <Palette size={14} className="text-[#FCBC43]" />
          <span>Themes adjust direct CSS variables</span>
        </span>
        <button
          onClick={handleContinue}
          className="btn btn-primary px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary-hover flex items-center gap-2 group shadow-md"
        >
          <span>Continue Setup</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}

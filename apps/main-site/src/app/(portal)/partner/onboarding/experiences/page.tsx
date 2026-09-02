"use client";

import React, { useState } from "react";
import { ArrowRight, Compass, Star, Sparkles, Loader2, Check } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { MultiSelect } from "@/components/onboarding/FormComponents";

interface ExperienceItem {
  title: string;
  timing: string;
}

export default function ExperiencesStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<ExperienceItem[]>([]);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAiEventId, setLastAiEventId] = useState<string | null>(null);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);

  const selectedExperiences = draftData.experiences || [];
  const errors = stepErrors.experiences || {};

  const handleExperiencesChange = (updated: string[]) => {
    saveStepDraft("experiences", updated);
  };

  // Centralized AI Experience suggester trigger
  const triggerExperienceCurator = async () => {
    setAiGenerating(true);
    setAiSuggestions([]);
    setAiSuccess(false);
    setAiError(null);

    try {
      const activeThemeId = draftData.theme?.themeId || "coastal";
      const res = await fetch("/api/partner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECOMMEND_EXPERIENCES",
          context: { themeId: activeThemeId }
        })
      });

      const json = await res.json();
      if (json.success && json.experiences) {
        setAiSuggestions(json.experiences);
        setSuggestedTitles(json.experiences.map((e: ExperienceItem) => e.title));
        setLastAiEventId(json.eventId);
      } else {
        setAiError(json.error || "Curator timed out. Please select from signature items below.");
      }
    } catch {
      setAiError("Curator offline. Please pick your premium stay experiences manually.");
    } finally {
      setAiGenerating(false);
    }
  };

  const applyAiSuggestions = () => {
    const titles = aiSuggestions.map(e => e.title);
    const combined = Array.from(new Set([...selectedExperiences, ...titles]));
    handleExperiencesChange(combined);
    setAiSuccess(true);
    setAiSuggestions([]);
    setTimeout(() => setAiSuccess(false), 3000);
  };

  const handleContinue = async () => {
    if (lastAiEventId && suggestedTitles.length > 0) {
      const savedSuggestions = suggestedTitles.filter(item => selectedExperiences.includes(item));
      const isAccepted = savedSuggestions.length === suggestedTitles.length;
      const wasEdited = savedSuggestions.length > 0 && !isAccepted;
      const feedbackAction = isAccepted ? "accept" : (wasEdited ? "edit" : "reject");

      fetch("/api/partner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_FEEDBACK",
          context: {
            eventId: lastAiEventId,
            feedbackAction,
            savedOutput: selectedExperiences
          }
        })
      }).catch(err => console.error("Feedback tracking error:", err));
    }
    await completeStep("experiences");
  };

  const experiencesList = [
    { title: "Pine Forest Yoga & Meditation", timing: "Morning Session" },
    { title: "Sunset Mountain Ridge Trek", timing: "Late Afternoon" },
    { title: "Heritage Cooking Masterclass", timing: "Lunch Hours" },
    { title: "Organic Wine & Cheese Tasting", timing: "Evening Session" },
    
    // Whitelist simulated AI output titles for complete dropdown parsing compatibility
    { title: "Sunset Catamaran Sailing & Champagne", timing: "Late Afternoon" },
    { title: "Private Beachside Seafood Barbecue", timing: "Lunch Hours" },
    { title: "Pine Forest Stargazing & Campfire Lodge", timing: "Evening Session" },
    { title: "Sunrise Mountain Ridge Guided Photography Trek", timing: "Morning Session" },
    { title: "Canopy Yoga & Sacred Sound Meditation", timing: "Morning Session" },
    { title: "Organic Estate-Grown Harvest Chef's Table Dinner", timing: "Evening Session" },
    { title: "Imperial Classical Music & Courtyard Dance Recital", timing: "Evening Session" },
    { title: "Sandstone Palace Heritage Cooking Masterclass", timing: "Lunch Hours" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 select-none">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <Compass size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 6: Guest Experiences</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Curated Local Experiences</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Showcase unique local expeditions, nature treks, heritage tours, or private classes that guests can request during their stay.
        </p>
      </div>

      {/* ✨ AI CURATED EXPERIENCE SUGGESTER CARD */}
      <div className="card-premium p-6 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-primary/20 rounded-[24px] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">
              AI Local Experience Curator
            </h4>
          </div>

          <button
            type="button"
            disabled={aiGenerating}
            onClick={triggerExperienceCurator}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1 transition-all disabled:opacity-50"
          >
            {aiGenerating ? (
              <>
                <Loader2 size={10} className="animate-spin" />
                <span>Curating local activities...</span>
              </>
            ) : (
              <>
                <Sparkles size={10} />
                <span>Recommend Experiences</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="p-3 bg-error/5 border border-error/15 text-error text-[10px] font-bold rounded-xl">
            {aiError}
          </div>
        )}

        {aiSuggestions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border space-y-3 animate-in zoom-in duration-300">
            <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-md">
              Custom Luxury Local Curation Suggestions
            </span>
            
            <div className="space-y-2 pt-1 text-[10px] font-bold text-secondary">
              {aiSuggestions.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-border">
                  <span>✨ {item.title}</span>
                  <span className="text-[8px] font-bold text-secondary/40 uppercase tracking-widest shrink-0">
                    {item.timing}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={applyAiSuggestions}
                className="px-4 py-2 bg-success hover:bg-success-light text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-[0.98]"
              >
                Auto-Select AI Experiences
              </button>
            </div>
          </div>
        )}

        {aiSuccess && (
          <div className="p-3 bg-success/5 border border-success/15 text-success text-[10px] font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in duration-300">
            <Check size={12} className="stroke-[3px]" />
            <span>AI curated local experiences automatically added and selected below!</span>
          </div>
        )}
      </div>

      {/* Standardized MultiSelect form component */}
      <MultiSelect
        label="Select Curated Experiences"
        selected={selectedExperiences}
        onChange={handleExperiencesChange}
        options={experiencesList.map(e => ({
          value: e.title,
          label: e.title,
          description: e.timing
        }))}
        error={errors.general}
      />

      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <Star size={14} className="text-[#FCBC43]" />
          <span>Curated experiences create deep guest loyalty</span>
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

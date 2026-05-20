"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, Heart, Loader2, Check } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { MultiSelect } from "@/components/onboarding/FormComponents";

export default function AmenitiesStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAiEventId, setLastAiEventId] = useState<string | null>(null);
  const [suggestedAmenities, setSuggestedAmenities] = useState<string[]>([]);

  const selectedAmenities = draftData.amenities || [];
  const errors = stepErrors.amenities || {};

  const handleAmenitiesChange = (updated: string[]) => {
    saveStepDraft("amenities", updated);
  };

  // Centralized AI Amenities suggestion trigger
  const triggerAmenitySuggester = async () => {
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
          action: "SUGGEST_AMENITIES",
          context: { themeId: activeThemeId }
        })
      });

      const json = await res.json();
      if (json.success && json.amenities) {
        setAiSuggestions(json.amenities);
        setSuggestedAmenities(json.amenities);
        setLastAiEventId(json.eventId);
      } else {
        setAiError(json.error || "Advisor timed out. Please select from signature amenities below.");
      }
    } catch {
      setAiError("Advisor offline. Please select your premium amenities manually.");
    } finally {
      setAiGenerating(false);
    }
  };

  const applyAiSuggestions = () => {
    const combined = Array.from(new Set([...selectedAmenities, ...aiSuggestions]));
    handleAmenitiesChange(combined);
    setAiSuccess(true);
    setAiSuggestions([]);
    setTimeout(() => setAiSuccess(false), 3000);
  };

  const handleContinue = async () => {
    if (lastAiEventId && suggestedAmenities.length > 0) {
      const savedSuggestions = suggestedAmenities.filter(item => selectedAmenities.includes(item));
      const isAccepted = savedSuggestions.length === suggestedAmenities.length;
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
            savedOutput: selectedAmenities
          }
        })
      }).catch(err => console.error("Feedback tracking error:", err));
    }
    await completeStep("amenities");
  };

  const amenitiesList = [
    { name: "Infinity Pool & Sun Deck", category: "Wellness" },
    { name: "Spa & Ayurvedic Massage Therapy", category: "Wellness" },
    { name: "Private Chef & Dining Experience", category: "Food & Beverage" },
    { name: "High-Speed Fiber Wi-Fi", category: "Connectivity" },
    { name: "Organic Farm-to-Table Breakfast", category: "Food & Beverage" },
    { name: "Dedicated 24/7 Butler Service", category: "Luxury Service" },
    
    // Add possible AI outputs to checklist list for complete rendering compatibility
    { name: "Cozy Wood-Burning Fireplace", category: "Warmth" },
    { name: "Heated Outdoor Sunrise Deck", category: "Wellness" },
    { name: "Wellness Sauna & Hot Tub", category: "Wellness" },
    { name: "Bespoke Mountain Trek Gear", category: "Adventure" },
    { name: "Canopy Yoga & Meditation Shala", category: "Wellness" },
    { name: "Natural Rock Rainfall Bath", category: "Luxury Bath" },
    { name: "Guided Wilderness Trek Guides", category: "Adventure" },
    { name: "Authentic Palace Courtyard Banqueting", category: "Heritage F&B" },
    { name: "Bespoke Royal Chariot Tours", category: "Luxury Tour" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 select-none">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <Sparkles size={14} className="text-[#FCBC43]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 5: Signature Amenities</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Luxury Guest Amenities</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Check off the unique features and luxury items available at your stay. These are highlighted on your website to drive guest bookings.
        </p>
      </div>

      {/* ✨ AI SIGNATURE AMENITY SUGGESTER CARD */}
      <div className="card-premium p-6 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-primary/20 rounded-[24px] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">
              AI Signature Amenity Suggester
            </h4>
          </div>

          <button
            type="button"
            disabled={aiGenerating}
            onClick={triggerAmenitySuggester}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1 transition-all disabled:opacity-50"
          >
            {aiGenerating ? (
              <>
                <Loader2 size={10} className="animate-spin" />
                <span>Curating services...</span>
              </>
            ) : (
              <>
                <Sparkles size={10} />
                <span>Suggest Amenities</span>
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
              Custom Luxury Curator Recommendations
            </span>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {aiSuggestions.map((amenity, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-full text-[9px] font-bold uppercase tracking-wider"
                >
                  ✨ {amenity}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={applyAiSuggestions}
                className="px-4 py-2 bg-success hover:bg-success-light text-white font-black text-[9px] uppercase tracking-wider rounded-lg shadow-md transition-all active:scale-[0.98]"
              >
                Auto-Select AI Amenities
              </button>
            </div>
          </div>
        )}

        {aiSuccess && (
          <div className="p-3 bg-success/5 border border-success/15 text-success text-[10px] font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in duration-300">
            <Check size={12} className="stroke-[3px]" />
            <span>AI curated amenities automatically selected and added below!</span>
          </div>
        )}
      </div>

      {/* Standardized MultiSelect form toolkit element */}
      <MultiSelect
        label="Select Signature Amenities"
        selected={selectedAmenities}
        onChange={handleAmenitiesChange}
        options={amenitiesList.map(a => ({
          value: a.name,
          label: a.name,
          description: a.category
        }))}
        error={errors.general}
      />

      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <Heart size={14} className="text-[#FCBC43]" />
          <span>Signature services increase average bookings by 30%</span>
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

"use client";

import React, { useState } from "react";
import { ArrowRight, Building2, MapPin, ShieldCheck, Sparkles, Loader2, Check, X } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { TextField, TextArea, StepCard } from "@/components/onboarding/FormComponents";

export default function PropertyStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();
  const [vibeType, setVibeType] = useState("alpine");
  const [vibeKeywords, setVibeKeywords] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAiEventId, setLastAiEventId] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<{ description: string; tagline: string } | null>(null);

  const propertyDraft = draftData.property || { title: "", location: "", description: "", slug: "", tagline: "" };
  const errors = stepErrors.property || {};

  const handleFieldChange = (field: string, value: string) => {
    const updated = {
      ...propertyDraft,
      [field]: value
    };

    if (field === "title") {
      updated.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    saveStepDraft("property", updated);
  };

  // Centralized AI Narrative Generator trigger
  const handleAiGenerate = async () => {
    setAiGenerating(true);
    setAiSuccess(false);
    setAiError(null);

    try {
      const res = await fetch("/api/partner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GENERATE_DESCRIPTION",
          context: {
            propertyType: vibeType,
            location: propertyDraft.location || "our luxury coordinates",
            vibeKeywords
          }
        })
      });

      const json = await res.json();
      if (json.success && json.description) {
        // Automatically populate description and tagline in draft state
        const updated = {
          ...propertyDraft,
          description: json.description,
          tagline: json.tagline
        };
        saveStepDraft("property", updated);
        setLastAiEventId(json.eventId);
        setGeneratedText({ description: json.description, tagline: json.tagline });
        setAiSuccess(true);
        // Fade success indicator after 3 seconds
        setTimeout(() => setAiSuccess(false), 3000);
      } else {
        setAiError(json.error || "Consultant timed out. Please try again.");
      }
    } catch {
      setAiError("Connection interrupted. AI Hospitality Consultant is offline.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleContinue = async () => {
    if (lastAiEventId && generatedText) {
      const wasEdited = generatedText.description !== propertyDraft.description || generatedText.tagline !== propertyDraft.tagline;
      fetch("/api/partner/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_FEEDBACK",
          context: {
            eventId: lastAiEventId,
            feedbackAction: wasEdited ? "edit" : "accept",
            savedOutput: {
              description: propertyDraft.description,
              tagline: propertyDraft.tagline
            }
          }
        })
      }).catch(err => console.error("Feedback tracking error:", err));
    }
    await completeStep("property");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 select-none">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <Building2 size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 2: Property Identity Blueprint</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Name &amp; Location Blueprint</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Give your hospitality website a premium name and coordinates. This identity forms the primary metadata for search indexing (SEO).
        </p>
      </div>

      {/* Premium Standardized Form Card */}
      <StepCard>
        
        {/* Name input */}
        <TextField
          label="Property Name"
          required
          placeholder="e.g. Grand Shivay Resort & Spa"
          value={propertyDraft.title || ""}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          error={errors.title}
          icon={<Building2 size={16} />}
        />

        {/* Location input */}
        <TextField
          label="Geographic Coordinates"
          required
          placeholder="e.g. Udaipur, Rajasthan, India"
          value={propertyDraft.location || ""}
          onChange={(e) => handleFieldChange("location", e.target.value)}
          error={errors.location}
          icon={<MapPin size={16} />}
        />

        {/* Tagline input (Newly added for direct branding display) */}
        <TextField
          label="Hospitality Tagline"
          placeholder="e.g. Where mountain serenity meets luxury hospitality (Or let AI compose one...)"
          value={propertyDraft.tagline || ""}
          onChange={(e) => handleFieldChange("tagline", e.target.value)}
          error={errors.tagline}
          icon={<Sparkles size={16} className="text-primary/50" />}
        />

        {/* Description input */}
        <TextArea
          label="Aspirational Narrative"
          required
          placeholder="Describe your boutique hotel, villa, or retreat. Excite your future guests..."
          value={propertyDraft.description || ""}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          error={errors.description}
        />

      </StepCard>

      {/* ✨ AI LUXURY BRANDING CONSULTANT DRAWER */}
      <div className="card-premium p-6 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-primary/20 rounded-[24px] space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">
            AI Luxury Branding Consultant
          </h4>
        </div>
        
        <p className="text-[10px] font-medium text-secondary/60 leading-relaxed max-w-md">
          Not sure what to write? Our hospitality assistant will compose an emotionally engaging, luxury description and brand tagline instantly!
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 text-[10px] font-bold text-secondary">
            <span>Atmospheric Vibe Preset</span>
            <select
              value={vibeType}
              onChange={(e) => setVibeType(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-white dark:bg-slate-900 focus:outline-none focus:border-primary text-[10px] font-medium"
            >
              <option value="alpine">Alpine Mountain Cabin / Lodge</option>
              <option value="coastal">Coastal Beachfront Villa / Resort</option>
              <option value="jungle">Eco-Lodge Jungle / Forest Retreat</option>
              <option value="heritage"> Sandstone Royal Palace / Haveli</option>
              <option value="generic">Modern Contemporary Stay</option>
            </select>
          </div>

          <div className="space-y-1.5 text-[10px] font-bold text-secondary">
            <span>Signature Keywords (Optional)</span>
            <input
              type="text"
              placeholder="e.g. infinity pool, private butler"
              value={vibeKeywords}
              onChange={(e) => setVibeKeywords(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-white dark:bg-slate-900 focus:outline-none focus:border-primary text-[10px] font-medium placeholder:text-slate-300"
            />
          </div>
        </div>

        {aiError && (
          <div className="p-3 bg-error/5 border border-error/15 text-error text-[10px] font-bold rounded-xl flex items-center justify-between">
            <span>{aiError}</span>
            <button onClick={() => setAiError(null)} className="hover:text-error-hover">
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            disabled={aiGenerating}
            onClick={handleAiGenerate}
            className="px-6 py-3.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider hover:bg-primary-hover flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {aiGenerating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Consultant writing...</span>
              </>
            ) : (
              <>
                <Sparkles size={12} />
                <span>Compose Narrative</span>
              </>
            )}
          </button>

          {aiSuccess && (
            <span className="text-success text-[10px] font-bold flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <Check size={12} className="stroke-[3px]" />
              <span>Copy updated successfully!</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-secondary/40 uppercase tracking-widest">
          <ShieldCheck size={14} className="text-success" />
          <span>Inputs map dynamically to Live Preview</span>
        </div>
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

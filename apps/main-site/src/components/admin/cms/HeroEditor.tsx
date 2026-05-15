"use client";

import React from "react";
import { CmsHeroState } from "./types";
import { AlignLeft, AlignCenter, AlignRight, Sparkles } from "lucide-react";

interface HeroEditorProps {
  data: CmsHeroState;
  onChange: (updated: CmsHeroState) => void;
}

export default function HeroEditor({ data, onChange }: HeroEditorProps) {
  const handleChange = (field: keyof CmsHeroState, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const handleAIGenerate = () => {
    // Scaffold beautiful simulated AI content mapping
    onChange({
      ...data,
      title: "Shivay Alpine Crest",
      subtitle: "Bespoke ambient silences crafted above pristine cloud corridors.",
    });
  };

  // Preset default images if user clicks replace placeholders
  const sampleImages = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Background Image Setup */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
          Primary Background Asset
        </label>
        <div className="flex gap-4 items-center">
          <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.backgroundImage} alt="Hero Backdrop" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={data.backgroundImage}
              onChange={(e) => handleChange("backgroundImage", e.target.value)}
              placeholder="Paste custom image URL..."
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
            />
            <div className="flex gap-2">
              {sampleImages.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleChange("backgroundImage", imgUrl)}
                  className="text-[9px] font-bold px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-[#0E5A75] dark:text-white/80 hover:bg-[#0983B0] hover:text-white transition-colors"
                >
                  Preset #{i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Headline & Taglines */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gradient-to-r from-[#0983B0]/10 to-[#159665]/10 p-3 rounded-xl border border-[#0983B0]/10">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#0983B0]" />
            <span className="text-xs font-bold text-[#053344] dark:text-white">AI Content Generation Engine</span>
          </div>
          <button
            type="button"
            onClick={handleAIGenerate}
            className="px-3 py-1.5 rounded-lg bg-[#0983B0] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#0E5A75] transition-colors shadow-sm"
          >
            ✨ Generate Luxury Copy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
              Main Title Text
            </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-sm font-black text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
            Atmospheric Tagline
          </label>
          <input
            type="text"
            value={data.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-sm text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          />
        </div>
      </div>
      </div>

      {/* CTA Button Tuning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
            CTA Button Label
          </label>
          <input
            type="text"
            value={data.ctaText}
            onChange={(e) => handleChange("ctaText", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs font-bold uppercase tracking-wider text-[#053344] dark:text-white outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
            Text Alignment
          </label>
          <div className="flex gap-2 bg-white/50 dark:bg-black/20 p-1 rounded-xl border border-black/10 dark:border-white/10">
            {(["left", "center", "right"] as const).map((alignment) => (
              <button
                key={alignment}
                type="button"
                onClick={() => handleChange("textAlign", alignment)}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all ${
                  data.textAlign === alignment
                    ? "bg-[#0E5A75] text-white shadow-md"
                    : "text-[#0E5A75]/60 dark:text-white/60 hover:text-[#0E5A75]"
                }`}
              >
                {alignment === "left" && <AlignLeft size={16} />}
                {alignment === "center" && <AlignCenter size={16} />}
                {alignment === "right" && <AlignRight size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shading slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60">
            Cinematic Backdrop Shading (Opacity)
          </label>
          <span className="text-xs font-black text-[#0983B0]">{Math.round(data.overlayOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="0.9"
          step="0.05"
          value={data.overlayOpacity}
          onChange={(e) => handleChange("overlayOpacity", parseFloat(e.target.value))}
          className="w-full accent-[#0983B0] cursor-pointer"
        />
      </div>
    </div>
  );
}

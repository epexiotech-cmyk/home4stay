"use client";

import React from "react";
import { CmsSeoState } from "./types";
import { Globe } from "lucide-react";

interface SeoEditorProps {
  data: CmsSeoState;
  onChange: (updated: CmsSeoState) => void;
}

export default function SeoEditor({ data, onChange }: SeoEditorProps) {
  const handleChange = (field: keyof CmsSeoState, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search Simulator Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
          <Globe size={10} /> Live Google Simulator Preview
        </div>
        <p className="text-xs text-[#1a0dab] dark:text-[#8ab4f8] font-normal truncate">
          {data.metaTitle || "Property Portal Name — Cinematic Premium Ecosystem"}
        </p>
        <p className="text-[11px] text-[#006621] dark:text-[#248a3d] truncate">
          https://home4stay.homes/property/custom-slug
        </p>
        <p className="text-[11px] text-[#545454] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
          {data.metaDescription || "Official concierge listing highlighting curated suites, immersive raw environment paths, and ambient bespoke service integration."}
        </p>
      </div>

      {/* Editor Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-1">
            Meta Title Tag
          </label>
          <input
            type="text"
            value={data.metaTitle}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
            placeholder="e.g. Shivay Resort — Mountain Sanctuary"
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs font-bold text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          />
          <p className="text-[10px] text-gray-400 mt-1">Recommended length: 50-60 characters for pristine indexing coverage.</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-1">
            Meta Description Summary
          </label>
          <textarea
            rows={2}
            value={data.metaDescription}
            onChange={(e) => handleChange("metaDescription", e.target.value)}
            placeholder="Engaging multi-sentence summary visible directly under search engine result headers..."
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-1">
              Social Sharing Target Image (OG:Image)
            </label>
            <input
              type="text"
              value={data.ogImage}
              onChange={(e) => handleChange("ogImage", e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-1">
              Focus Search Keywords
            </label>
            <input
              type="text"
              value={data.keywords}
              onChange={(e) => handleChange("keywords", e.target.value)}
              placeholder="luxury hospitality, mountain lodge, private resort"
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

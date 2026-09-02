"use client";

import React from "react";
import { CmsNarrativeState, CmsStatItem } from "./types";
import { Plus, Trash2, Sparkles } from "lucide-react";

interface NarrativeEditorProps {
  data: CmsNarrativeState;
  onChange: (updated: CmsNarrativeState) => void;
}

export default function NarrativeEditor({ data, onChange }: NarrativeEditorProps) {
  const handleChange = (field: keyof CmsNarrativeState, value: string | CmsStatItem[]) => {
    onChange({ ...data, [field]: value });
  };

  const handleAIGenerate = () => {
    onChange({
      ...data,
      smallLabel: "HERITAGE SANCTUARY",
      mainHeading: "An immersion into",
      highlightText: "pure raw absolute nature.",
      description: "Wrapped in ancient alpine pine pathways, our custom high-end estate balances bespoke high-touch concierge hospitality with undisturbed silent architectural elegance.",
    });
  };

  const handleStatChange = (id: string, updatedFields: Partial<CmsStatItem>) => {
    const updatedStats = data.stats.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
    handleChange("stats", updatedStats);
  };

  const handleAddStat = () => {
    const newStat: CmsStatItem = {
      id: Date.now().toString(),
      value: "100%",
      label: "Custom Metric",
    };
    handleChange("stats", [...data.stats, newStat]);
  };

  const handleDeleteStat = (id: string) => {
    handleChange("stats", data.stats.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* AI Tool Assist */}
      <div className="flex justify-between items-center bg-gradient-to-r from-[#159665]/10 to-[#0983B0]/10 p-3 rounded-xl border border-[#159665]/10">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#159665]" />
          <span className="text-xs font-bold text-[#053344] dark:text-white">AI Content Generation Assist</span>
        </div>
        <button
          type="button"
          onClick={handleAIGenerate}
          className="px-3 py-1.5 rounded-lg bg-[#159665] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#0E5A75] transition-colors shadow-sm"
        >
          ✨ Generate Luxury Copy
        </button>
      </div>

      {/* Headings & Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
            Top Overline Tag
          </label>
          <input
            type="text"
            value={data.smallLabel}
            onChange={(e) => handleChange("smallLabel", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs font-bold uppercase tracking-widest text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
            Primary Statement
          </label>
          <input
            type="text"
            value={data.mainHeading}
            onChange={(e) => handleChange("mainHeading", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs font-black text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
            Accent Colored Text
          </label>
          <input
            type="text"
            value={data.highlightText}
            onChange={(e) => handleChange("highlightText", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs font-black text-[#0983B0] outline-none focus:border-[#0983B0]"
          />
        </div>
      </div>

      {/* Narrative Paragraph */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60 mb-2">
          Concierge Narrative Bio (Paragraph)
        </label>
        <textarea
          rows={3}
          value={data.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-xs leading-relaxed text-[#053344] dark:text-white outline-none focus:border-[#0983B0] resize-none"
        />
      </div>

      {/* Stats Dynamic Repeater */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-xs font-bold uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60">
            Property Accolades / Metas ({data.stats.length})
          </label>
          <button
            type="button"
            onClick={handleAddStat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E5A75]/10 dark:bg-white/10 text-[#0E5A75] dark:text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#0E5A75] hover:text-white transition-all"
          >
            <Plus size={12} /> Add Metric
          </button>
        </div>

        <div className="space-y-3">
          {data.stats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-black/10 border border-black/5 dark:border-white/5"
            >
              <input
                type="text"
                value={stat.value}
                onChange={(e) => handleStatChange(stat.id, { value: e.target.value })}
                placeholder="e.g. 12+"
                className="w-20 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 text-xs font-black text-[#0E5A75] dark:text-white outline-none text-center"
              />
              <span className="text-xs text-[#0E5A75]/40 font-bold">→</span>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => handleStatChange(stat.id, { label: e.target.value })}
                placeholder="e.g. Luxury Experiences"
                className="flex-1 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 text-xs font-bold text-[#053344] dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={() => handleDeleteStat(stat.id)}
                className="p-2 text-red-500/60 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Quote } from "lucide-react";
import { CmsTestimonialsState } from "./types";

interface TestimonialsEditorProps {
  data: CmsTestimonialsState;
  onChange: (updated: CmsTestimonialsState) => void;
}

export default function TestimonialsEditor({ data, onChange }: TestimonialsEditorProps) {
  const handleChange = (field: keyof CmsTestimonialsState, val: string) => {
    onChange({ ...(data || {} as CmsTestimonialsState), [field]: val });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E5A75] dark:text-white mb-2">
        <Quote size={14} className="text-[#FCBC43]" /> Customer Review Mapping
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 mb-1">
          Review Quote Statement
        </label>
        <textarea
          rows={2}
          value={data?.quote || ""}
          onChange={(e) => handleChange("quote", e.target.value)}
          placeholder="The private mountain access tracks provide absolute escape..."
          className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white/60 dark:bg-black/30 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 mb-1">
            Author / Patron Name
          </label>
          <input
            type="text"
            value={data?.author || ""}
            onChange={(e) => handleChange("author", e.target.value)}
            placeholder="Generational Elite Patron"
            className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white/60 dark:bg-black/30 text-xs font-bold text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 mb-1">
            Role Attribute Context
          </label>
          <input
            type="text"
            value={data?.role || ""}
            onChange={(e) => handleChange("role", e.target.value)}
            placeholder="Concierge Guestbook"
            className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white/60 dark:bg-black/30 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { DynamicPropertyPagePayload } from "./types";
import { Sparkles } from "lucide-react";
import SectionRenderer from "./SectionRenderer";
import UniversalSectionToolbar from "./UniversalSectionToolbar";

interface LivePreviewProps {
  data: DynamicPropertyPagePayload;
}

export default function LivePreview({ data }: LivePreviewProps) {
  // Synchronized section maps ordered continuously by sortOrder metrics
  const sortedSections = [...data.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="w-full bg-black/95 text-white rounded-[32px] overflow-hidden border border-white/10 shadow-2xl font-sans select-none relative flex flex-col h-[700px]">
      {/* Fake Browser Titlebar */}
      <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="text-[10px] font-mono text-white/40 truncate max-w-[150px]">
          {data.seo.metaTitle || "home4stay.homes/preview"}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/70">
            {data.themePreset.split(" ")[0]}
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#159665] bg-[#159665]/10 px-2 py-0.5 rounded">
            REGISTRY LOOP
          </span>
        </div>
      </div>

      {/* Internal scrollable dynamic Section Registry execution viewport */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col divide-y divide-white/5">
        {sortedSections.length > 0 ? (
          sortedSections.map((block) => (
            <UniversalSectionToolbar
              key={block.id}
              section={block}
              onToggleVisibility={() => {
                // Readonly mirror preview notification simulation
                console.log(`Preview node state requested toggle visibility check: ${block.id}`);
              }}
            >
              <SectionRenderer section={block} globalPayload={data} />
            </UniversalSectionToolbar>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-white/40">
            All visual section nodes disabled. Enable specific block instances to project responsive output.
          </div>
        )}
      </div>

      {/* Footer status notice */}
      <div className="p-2 bg-white/5 border-t border-white/5 text-[9px] text-center text-white/40 flex items-center justify-center gap-1 flex-shrink-0">
        <Sparkles size={10} className="text-[#159665]" /> Fully Decoupled Registry Architecture mapping modules on-demand
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { RenderSectionBlock, SectionType } from "./types";
import { 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff,
  Sliders,
  FileText,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Coffee
} from "lucide-react";

interface PageStructureEditorProps {
  sections: RenderSectionBlock[];
  onChange: (updated: RenderSectionBlock[]) => void;
}

export default function PageStructureEditor({ sections, onChange }: PageStructureEditorProps) {
  const [selectedType, setSelectedType] = useState<SectionType>("testimonials");

  // Icon maps mapped dynamically
  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case "hero": return <Sliders size={14} className="text-[#0983B0]" />;
      case "narrative": return <FileText size={14} className="text-[#159665]" />;
      case "carousel": return <Layers size={14} className="text-[#FCBC43]" />;
      case "gallery": return <ImageIcon size={14} className="text-[#E74C3C]" />;
      case "testimonials": return <MessageSquare size={14} className="text-[#9B59B6]" />;
      case "faq": return <HelpCircle size={14} className="text-[#34495E]" />;
      case "amenities": return <Coffee size={14} className="text-[#1ABC9C]" />;
      default: return <Sliders size={14} />;
    }
  };

  const handleToggleEnable = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    // re-sync sequential sort orders
    const synchronized = copy.map((item, idx) => ({ ...item, sortOrder: idx }));
    onChange(synchronized);
  };

  const handleDuplicate = (block: RenderSectionBlock, index: number) => {
    const duplicated: RenderSectionBlock = {
      ...block,
      id: `${block.type}-${Date.now()}`,
      sortOrder: index + 1,
    };

    const copy = [...sections];
    copy.splice(index + 1, 0, duplicated);

    // re-sync sort orders
    const synchronized = copy.map((item, idx) => ({ ...item, sortOrder: idx }));
    onChange(synchronized);
  };

  const handleDelete = (id: string) => {
    const filtered = sections.filter((s) => s.id !== id);
    const synchronized = filtered.map((item, idx) => ({ ...item, sortOrder: idx }));
    onChange(synchronized);
  };

  const handleAddSection = () => {
    // Scaffold minimal payload data sets mapping to default type parameters
    let defaultPayload = {};
    if (selectedType === "testimonials") {
      defaultPayload = { items: [{ author: "VIP Guest", quote: "Stunning concierge framework execution." }] };
    } else if (selectedType === "faq") {
      defaultPayload = { items: [{ q: "Check-in parameters?", a: "Standard access maps available directly at arrival." }] };
    }

    const newBlock: RenderSectionBlock = {
      id: `${selectedType}-${Date.now()}`,
      type: selectedType,
      enabled: true,
      sortOrder: sections.length,
      data: defaultPayload,
    };

    onChange([...sections, newBlock]);
  };

  const sectionTypesList: { type: SectionType; label: string }[] = [
    { type: "hero", label: "Cinematic Hero Backdrop" },
    { type: "narrative", label: "Concierge Bio Storytelling" },
    { type: "carousel", label: "Shuffling Poker Card Stack" },
    { type: "gallery", label: "Curated Image Maps" },
    { type: "testimonials", label: "VIP Customer Quotes" },
    { type: "faq", label: "Common Inquiries (FAQ)" },
    { type: "amenities", label: "Bespoke Facility Setup" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Summary */}
      <div className="p-4 rounded-xl bg-[#0983B0]/5 border border-[#0983B0]/10 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-bold text-[#0E5A75] dark:text-white">
            Render-Block Array Manager
          </p>
          <p className="text-[11px] text-[#0E5A75]/60 dark:text-white/60">
            Rearrange visual positioning hierarchy, duplicate blocks, or append future modules onto the page layout tree instantly.
          </p>
        </div>
        <div className="text-xs font-mono font-bold bg-white/80 dark:bg-black/40 px-2.5 py-1 rounded-md text-[#0983B0]">
          {sections.length} blocks active
        </div>
      </div>

      {/* Array List Canvas */}
      <div className="space-y-3">
        {sections.map((block, index) => (
          <div
            key={block.id}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              block.enabled
                ? "bg-white/60 dark:bg-black/30 border-black/10 dark:border-white/10 shadow-sm"
                : "bg-black/5 dark:bg-white/5 border-dashed border-black/10 dark:border-white/10 opacity-50"
            }`}
          >
            {/* Left handle & type summary */}
            <div className="flex items-center gap-3">
              <div className="cursor-grab text-gray-400 hover:text-black dark:hover:text-white py-1">
                <GripVertical size={14} />
              </div>

              {/* Up / Down positional controllers */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, "up")}
                  className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-20"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  disabled={index === sections.length - 1}
                  onClick={() => handleMove(index, "down")}
                  className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-20"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Graphic icon mapped dynamically */}
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center flex-shrink-0">
                {getSectionIcon(block.type)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#053344] dark:text-white">
                    {block.type} block
                  </span>
                  <span className="text-[9px] font-mono text-gray-400">#{block.sortOrder + 1}</span>
                </div>
                <p className="text-[10px] text-[#0E5A75]/60 dark:text-white/60 truncate max-w-[160px]">
                  ID: {block.id}
                </p>
              </div>
            </div>

            {/* Quick module action controller tools */}
            <div className="flex items-center gap-1">
              {/* Visibility boolean check */}
              <button
                type="button"
                onClick={() => handleToggleEnable(block.id)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                  block.enabled
                    ? "text-[#159665] hover:bg-[#159665]/10"
                    : "text-gray-400 hover:bg-gray-400/10"
                }`}
                title={block.enabled ? "Disable visibility" : "Enable layout rendering"}
              >
                {block.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>

              {/* Duplicate row block */}
              <button
                type="button"
                onClick={() => handleDuplicate(block, index)}
                className="p-2 text-[#0983B0] hover:bg-[#0983B0]/10 rounded-lg transition-colors"
                title="Duplicate exact segment payload"
              >
                <Copy size={13} />
              </button>

              {/* Delete row block */}
              <button
                type="button"
                disabled={sections.length <= 1}
                onClick={() => handleDelete(block.id)}
                className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-20"
                title="Remove section layout"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Append New Segment Block tool */}
      <div className="p-4 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3 pt-3">
        <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/70 dark:text-white/60">
          Append Future Segment Module
        </label>
        <div className="flex gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as SectionType)}
            className="flex-1 px-3 py-2 rounded-lg border border-black/10 bg-white dark:bg-black/40 text-xs font-bold text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
          >
            {sectionTypesList.map((st) => (
              <option key={st.type} value={st.type}>
                {st.label} ({st.type})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddSection}
            className="px-4 py-2 rounded-lg bg-[#0E5A75] text-white text-xs font-black uppercase tracking-wider hover:bg-[#0983B0] transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-md"
          >
            <Plus size={14} /> Append Segment
          </button>
        </div>
      </div>
    </div>
  );
}

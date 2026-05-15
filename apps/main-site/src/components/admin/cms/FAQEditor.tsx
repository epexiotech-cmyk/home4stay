"use client";

import React from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQEditorProps {
  data?: { questions?: FAQItem[] };
  onChange: (updatedData: { questions: FAQItem[] }) => void;
}

export default function FAQEditor({ data, onChange }: FAQEditorProps) {
  const questions: FAQItem[] = Array.isArray(data?.questions) ? data.questions : [
    { q: "Are the private helicopter access modules exclusive?", a: "Yes, fully pre-cleared specific perimeter intervals." }
  ];

  const handleUpdate = (idx: number, field: string, val: string) => {
    const copy = [...questions];
    copy[idx] = { ...copy[idx], [field]: val };
    onChange({ ...(data || {}), questions: copy });
  };

  const handleAdd = () => {
    onChange({
      ...(data || {}),
      questions: [...questions, { q: "New Inquiry?", a: "Simulated response placeholder." }]
    });
  };

  const handleDelete = (idx: number) => {
    onChange({
      ...(data || {}),
      questions: questions.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E5A75] dark:text-white">
          <HelpCircle size={14} className="text-[#0983B0]" /> Inquiry Accordion Engine
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] font-bold text-[#0983B0] bg-[#0983B0]/10 px-2 py-1 rounded hover:bg-[#0983B0] hover:text-white transition-colors"
        >
          <Plus size={10} className="inline mr-1" /> Add Inquiry
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-white/60 dark:bg-black/30 border border-black/5 space-y-2 relative group">
            <input
              type="text"
              value={item.q}
              onChange={(e) => handleUpdate(idx, "q", e.target.value)}
              placeholder="Question label..."
              className="w-full px-2 py-1 rounded border border-black/10 text-xs font-bold text-[#053344] dark:text-white outline-none bg-transparent"
            />
            <textarea
              rows={1}
              value={item.a}
              onChange={(e) => handleUpdate(idx, "a", e.target.value)}
              placeholder="Answer response..."
              className="w-full px-2 py-1 rounded border border-black/10 text-xs text-[#053344] dark:text-white outline-none bg-transparent resize-none"
            />
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSectionViewProps {
  questions?: FAQItem[];
}

export default function FAQSectionView({ questions: propQuestions }: FAQSectionViewProps) {
  const questions: FAQItem[] = Array.isArray(propQuestions) ? propQuestions : [
    { q: "Are access trails exclusive?", a: "Yes, fully monitored via silent perimeter check-ins." }
  ];

  return (
    <div className="p-6 bg-white/5 space-y-2 flex-shrink-0 select-none">
      <div className="flex items-center gap-1 text-[#0983B0]">
        <HelpCircle size={12} />
        <span className="text-[9px] font-black uppercase tracking-wider text-[#0983B0]">Simulated Inquiries Registry</span>
      </div>
      <div className="space-y-1.5 pt-1">
        {questions.map((item: FAQItem, idx: number) => (
          <div key={idx} className="p-2.5 rounded bg-black/40 border border-white/5">
            <p className="text-[10px] font-bold text-white">Q: {item.q}</p>
            <p className="text-[9px] text-white/70 mt-0.5">A: {item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

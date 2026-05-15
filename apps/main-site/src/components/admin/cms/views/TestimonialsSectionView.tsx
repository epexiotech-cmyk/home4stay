import React from "react";
import { Quote } from "lucide-react";

interface TestimonialsSectionViewProps {
  quote?: string;
  author?: string;
  role?: string;
}

export default function TestimonialsSectionView({
  quote = "An extraordinary alpine experience perfectly tailored down to every customized layout detail.",
  author = "Generational Elite Patron",
  role = "Concierge Guestbook"
}: TestimonialsSectionViewProps) {

  return (
    <div className="p-6 bg-[#0983B0]/10 space-y-2 flex-shrink-0 select-none">
      <div className="flex items-center gap-1 text-[#FCBC43]">
        <Quote size={12} />
        <span className="text-[9px] font-black uppercase tracking-wider text-[#FCBC43]">VIP Testimonial Module</span>
      </div>
      <p className="text-xs text-white italic leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="text-[9px] font-bold text-white/60 text-right">— {author}, <span className="opacity-70">{role}</span></p>
    </div>
  );
}

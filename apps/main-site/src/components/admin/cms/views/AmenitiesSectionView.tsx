import React from "react";
import { Coffee } from "lucide-react";

interface AmenitiesSectionViewProps {
  facilities?: string[];
}

export default function AmenitiesSectionView({ facilities: propFacilities }: AmenitiesSectionViewProps) {
  const facilities = Array.isArray(propFacilities) ? propFacilities : ["Infinity Vista", "Raw Timber Sauna", "Concierge Butler", "Private Heliport"];

  return (
    <div className="p-6 bg-[#159665]/10 space-y-2 flex-shrink-0 select-none">
      <div className="flex items-center gap-1 text-[#159665]">
        <Coffee size={12} />
        <span className="text-[9px] font-black uppercase tracking-wider text-[#159665]">Bespoke Facility Setup</span>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {facilities.map((fac: string, i: number) => (
          <span key={i} className="text-[8px] font-bold px-2.5 py-1 bg-black/40 rounded text-[#159665] border border-[#159665]/20 shadow-inner">
            {fac}
          </span>
        ))}
      </div>
    </div>
  );
}

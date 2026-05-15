import React from "react";

interface NarrativeStat {
  id?: string;
  value: string;
  label: string;
}

interface NarrativeSectionViewProps {
  smallLabel?: string;
  mainHeading?: string;
  highlightText?: string;
  description?: string;
  stats?: NarrativeStat[];
}

export default function NarrativeSectionView({
  smallLabel = "THE NARRATIVE",
  mainHeading = "A sanctuary of",
  highlightText = "timeless luxury.",
  description = "Beautiful setting providing curated raw environment pathways accompanied by premium custom suite options.",
  stats: propStats
}: NarrativeSectionViewProps) {
  const stats: NarrativeStat[] = Array.isArray(propStats) ? propStats : [{ id: "1", value: "100%", label: "Verified Architecture" }];

  return (
    <div className="p-6 bg-[#051E28] space-y-6 flex-shrink-0 select-none">
      <div className="space-y-2">
        <span className="text-[9px] font-black text-[#FCBC43] uppercase tracking-[0.3em] block">
          {smallLabel}
        </span>
        <h3 className="text-xl font-black text-white leading-tight">
          {mainHeading} <span className="text-[#0983B0]">{highlightText}</span>
        </h3>
        <p className="text-[11px] text-white/70 leading-relaxed italic">
          {description}
        </p>

        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {stats.map((st: NarrativeStat, idx: number) => (
              <div key={st.id || idx} className="bg-white/5 p-2 rounded-lg border border-white/5">
                <p className="text-base font-black text-[#0983B0]">{st.value}</p>
                <p className="text-[8px] font-bold text-white/50 uppercase tracking-wider truncate">{st.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

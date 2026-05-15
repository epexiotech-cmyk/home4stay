import React from "react";
import { BedDouble, Plus } from "lucide-react";

export default function PartnerRoomsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 select-none pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-premium rounded-[32px] border-white/20 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0983B0] bg-[#0983B0]/10 px-2.5 py-0.5 rounded-full">
            Inventory Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0E5A75] dark:text-white mt-1">
            Property Rooms & Suites
          </h1>
          <p className="text-xs text-[#0E5A75]/70 dark:text-white/70 mt-0.5 max-w-lg leading-relaxed">
            Configure private suite designations, coordinate physical access paths, and define seasonal spatial limits.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2.5 rounded-xl bg-[#0E5A75] text-white text-xs font-black uppercase tracking-widest shadow-xl hover:bg-[#0983B0] transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Append Suite
        </button>
      </div>

      {/* Empty / Readiness State */}
      <div className="p-12 glass-matte rounded-3xl border-white/10 text-center max-w-2xl mx-auto space-y-4 mt-8">
        <div className="w-16 h-16 rounded-full bg-[#0983B0]/10 text-[#0983B0] flex items-center justify-center mx-auto">
          <BedDouble size={28} />
        </div>
        <div className="space-y-1">
          <p className="text-base font-black text-[#0E5A75] dark:text-white">
            No Specific Room Layouts Configured
          </p>
          <p className="text-xs text-[#0E5A75]/60 dark:text-white/50 max-w-md mx-auto leading-relaxed">
            All primary accommodation nodes are currently managed via the root master property inventory hub. Switch to the Universal Section Registry CMS to calibrate visual layout sets directly.
          </p>
        </div>
      </div>
    </div>
  );
}

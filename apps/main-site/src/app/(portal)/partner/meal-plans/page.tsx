import React from "react";
import { Utensils, Plus } from "lucide-react";

export default function PartnerMealPlansPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 select-none pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-premium rounded-[32px] border-white/20 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#159665] bg-[#159665]/10 px-2.5 py-0.5 rounded-full">
            Concierge Dining
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0E5A75] dark:text-white mt-1">
            Curated Meal Plans
          </h1>
          <p className="text-xs text-[#0E5A75]/70 dark:text-white/70 mt-0.5 max-w-lg leading-relaxed">
            Configure premium dining packages, tailored breakfast inclusion rules, and private seasonal chef options.
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2.5 rounded-xl bg-[#0E5A75] text-white text-xs font-black uppercase tracking-widest shadow-xl hover:bg-[#0983B0] transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Add Dining Package
        </button>
      </div>

      {/* Empty State Shell */}
      <div className="p-12 glass-matte rounded-3xl border-white/10 text-center max-w-2xl mx-auto space-y-4 mt-8">
        <div className="w-16 h-16 rounded-full bg-[#159665]/10 text-[#159665] flex items-center justify-center mx-auto">
          <Utensils size={28} />
        </div>
        <div className="space-y-1">
          <p className="text-base font-black text-[#0E5A75] dark:text-white">
            No Custom Meal Plans Defined
          </p>
          <p className="text-xs text-[#0E5A75]/60 dark:text-white/50 max-w-md mx-auto leading-relaxed">
            Standard accommodation booking options currently inherit baseline culinary properties directly. To override specific catering parameters, define independent regional culinary structures here.
          </p>
        </div>
      </div>
    </div>
  );
}

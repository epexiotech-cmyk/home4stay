"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2,
  Plus,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";
import { ICON_MAP, Experience } from "@/lib/experiences-config";

const HeritageDivider = () => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
    <div className="w-1.5 h-1.5 rotate-45 border border-[#D4AF37]" />
  </div>
);

const IndianPattern = () => (
  <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l5 15 15 5-15 5-5 15-5-15-15-5 15-5z' fill='%23D4AF37' fill-opacity='0.4'/%3E%3C/svg%3E")`,
      backgroundSize: '40px 40px'
    }}
  />
);

export default function CustomizeStaySection({ propertyId }: { propertyId?: string }) {
  const { state, toggleExperience } = useBooking();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      if (!propertyId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/property/experiences?propertyId=${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const activeOnly = data.filter((e: Experience) => e.isActive);
            if (activeOnly.length > 0) {
              setExperiences(activeOnly);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch dynamic experiences:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExperiences();
  }, [propertyId]);

  // Display nothing or a very subtle fallback if loading or no experiences
  if (!isLoading && experiences.length === 0) return null;

  return (
    <section className="py-32 border-b border-black/5 dark:border-white/5 relative overflow-hidden" id="customize">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <HeritageDivider />
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Curated Indian Experiences</span>
          <h2 className="text-5xl font-black text-[#053344] dark:text-white tracking-tighter leading-none mt-4 font-serif">
            Craft Your <span className="italic text-[#D4AF37]">Mehmaan</span> Experience
          </h2>
          <p className="text-lg text-[#0E5A75]/60 font-medium mt-6 italic max-w-2xl leading-relaxed">
            &quot;Thoughtfully curated experiences inspired by Indian hospitality, wellness, celebration, and local culture.&quot;
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-[56px] bg-[#0E5A75]/5 animate-pulse" />
          ))
        ) : (
          experiences.map((exp, idx) => {
            const isSelected = !!state.selectedExperiences[exp.id];
            const Icon = ICON_MAP[exp.icon] || Sparkles;

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleExperience({ id: exp.id, title: exp.title, price: exp.price })}
                className={cn(
                  "group relative p-10 rounded-[56px] glass-premium transition-all duration-700 cursor-pointer overflow-hidden border",
                  isSelected 
                    ? "bg-white/90 dark:bg-[#053344]/60 border-[#D4AF37] shadow-[0_20px_60px_-15px_rgba(212,175,55,0.2)]" 
                    : "border-white/40 dark:border-white/5 hover:border-[#D4AF37]/40 bg-[#FDF6F1]/30 dark:bg-transparent"
                )}
              >
                <IndianPattern />
                
                <div className="relative z-10 flex flex-col h-full gap-8">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-700 relative",
                      isSelected 
                        ? "bg-[#D4AF37] text-white shadow-[0_10px_25px_-5px_rgba(212,175,55,0.4)] rotate-6" 
                        : "bg-[#D4AF37]/10 text-[#D4AF37]"
                    )}>
                      <Icon size={26} strokeWidth={1.5} />
                      {isSelected && (
                        <div className="absolute inset-0 rounded-[24px] animate-ping bg-[#D4AF37]/20 -z-10" />
                      )}
                    </div>
                    
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500",
                      isSelected 
                        ? "border-[#D4AF37] bg-[#D4AF37] text-white" 
                        : "border-[#D4AF37]/20 text-[#D4AF37] group-hover:border-[#D4AF37]/50"
                    )}>
                      {isSelected ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center flex-wrap gap-3 mb-3">
                      <h4 className={cn(
                        "text-xl font-black tracking-tight font-serif transition-colors duration-500", 
                        isSelected ? "text-[#053344] dark:text-white" : "text-[#053344] dark:text-white"
                      )}>
                        {exp.title}
                      </h4>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border transition-all duration-500", 
                        isSelected 
                          ? "bg-[#D4AF37] border-[#D4AF37] text-white shadow-md" 
                          : "border-[#D4AF37]/20 text-[#D4AF37]"
                      )}>
                        {exp.category || 'EXPERIENCE'}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[11px] font-bold leading-relaxed opacity-80 uppercase tracking-widest italic transition-colors duration-500", 
                      isSelected ? "text-[#0E5A75]" : "text-[#0E5A75]/60 dark:text-white/40"
                    )}>
                      &quot;{exp.description}&quot;
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-[#D4AF37]/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[#D4AF37]/40 uppercase tracking-widest mb-0.5">Premium Experience</span>
                      <span className={cn(
                        "text-base font-black transition-colors duration-500", 
                        isSelected ? "text-[#159665]" : "text-[#0E5A75] dark:text-white"
                      )}>
                        ₹{exp.price.toLocaleString()}
                      </span>
                    </div>
                    <button className={cn(
                      "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                      isSelected 
                        ? "bg-[#159665] text-white shadow-[#159665]/20" 
                        : "text-[#D4AF37] border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-white"
                    )}>
                      {isSelected ? "Confirmed" : "Curate this"}
                    </button>
                  </div>
                </div>

                {/* Selection Background Glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent pointer-events-none" />
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}

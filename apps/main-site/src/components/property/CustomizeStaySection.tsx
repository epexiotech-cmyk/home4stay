"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  PlaneTakeoff, 
  Sparkles, 
  Utensils, 
  Navigation, 
  CheckCircle2,
  Plus,
  Flame,
  Wind
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";

export type Experience = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  price: number;
  tag: string;
};

const EXPERIENCES: Experience[] = [
  { id: "pickup", name: "Airport Pickup", icon: PlaneTakeoff, description: "Luxury sedan with a professional chauffeur.", price: 1500, tag: "Essential" },
  { id: "dinner", name: "Candlelight Dinner", icon: Utensils, description: "Private setup with a curated four-course menu.", price: 4500, tag: "Romantic" },
  { id: "bonfire", name: "Bonfire Evening", icon: Flame, description: "Private bonfire with marshmallows & music.", price: 2000, tag: "Social" },
  { id: "decoration", name: "Occasion Setup", icon: Sparkles, description: "Bespoke balloon & floral room decorations.", price: 3000, tag: "Celebration" },
  { id: "trekking", name: "Guided Trek", icon: Navigation, description: "Explore hidden mountain trails with an expert.", price: 1200, tag: "Adventure" },
  { id: "wellness", name: "Wellness Session", icon: Wind, description: "90-min private yoga & sound healing.", price: 3500, tag: "Relaxation" },
];

export default function CustomizeStaySection() {
  const { state, toggleExperience } = useBooking();

  return (
    <section className="py-32 border-b border-black/5 dark:border-white/5" id="customize">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-px bg-[#0E5A75]" />
            <span className="text-[10px] font-black text-[#0E5A75] uppercase tracking-[0.3em]">Hospitality Plus</span>
          </div>
          <h2 className="text-5xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Customize your Stay</h2>
          <p className="text-lg text-[#0E5A75]/60 font-medium mt-6 italic">&quot;Luxury concierge services curated to enhance your mountain experience.&quot;</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXPERIENCES.map((exp) => {
          const isSelected = !!state.selectedExperiences[exp.id];
          return (
            <motion.div
              key={exp.id}
              whileHover={{ y: -8 }}
              onClick={() => toggleExperience(exp.id, exp.price)}
              className={cn(
                "group relative p-8 rounded-[48px] glass-premium transition-all duration-700 cursor-pointer overflow-hidden border",
                isSelected 
                  ? "bg-[#0E5A75] border-[#0E5A75] shadow-luxury" 
                  : "border-white/40 dark:border-white/5 hover:border-[#0E5A75]/40"
              )}
            >
              <div className="relative z-10 flex flex-col h-full gap-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                    isSelected ? "bg-white text-[#0E5A75] shadow-xl" : "bg-[#0E5A75]/5 text-[#0E5A75] dark:text-[#FCBC43]"
                  )}>
                    <exp.icon size={24} />
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                    isSelected ? "border-white bg-white text-[#159665]" : "border-[#0E5A75]/20 dark:border-white/10"
                  )}>
                    {isSelected ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={cn("text-base font-black uppercase tracking-widest", isSelected ? "text-white" : "text-[#053344] dark:text-white")}>
                      {exp.name}
                    </h4>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", isSelected ? "border-white/20 text-white/60" : "border-[#0E5A75]/20 text-[#0E5A75]/40")}>
                      {exp.tag}
                    </span>
                  </div>
                  <p className={cn("text-[10px] font-bold leading-relaxed opacity-60 uppercase tracking-widest italic", isSelected ? "text-white" : "text-[#0E5A75]/60 dark:text-white/40")}>
                    {exp.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-white" : "text-[#0983B0]")}>
                    ₹{exp.price.toLocaleString()}
                  </span>
                  <span className={cn("text-[8px] font-bold uppercase tracking-widest", isSelected ? "text-white/60" : "text-[#0E5A75]/30")}>
                    Add to Stay
                  </span>
                </div>
              </div>

              {/* Selection Background Glow */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0983B0]/20 to-transparent pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

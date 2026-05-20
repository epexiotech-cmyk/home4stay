"use client";

import React from "react";
import { Utensils, CheckCircle2, Moon, Sun, Sunrise, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";

interface MealPlan {
  id: string;
  name: string;
  label: string;
  description: string;
  priceTag: string;
  inclusions: string[];
  recommendation?: string;
}

const MEAL_PLANS: MealPlan[] = [
  {
    id: "EP",
    name: "Sukoon Stay",
    label: "ROOM ONLY",
    description: "Freedom to explore local flavours at your own pace.",
    priceTag: "Included",
    inclusions: ["Luxury Heritage Room", "Traditional Welcome Drink", "Complimentary High-Speed Wi-Fi", "Access to Wellness Sanctuary"]
  },
  {
    id: "CP",
    name: "Subah Savera",
    label: "BREAKFAST INCLUDED",
    description: "Wake up to handcrafted Indian breakfast experiences.",
    priceTag: "+ ₹1,200",
    inclusions: ["All Sukoon Stay Inclusions", "Traditional & Global Breakfast Spread", "Fresh Seasonal Nectar", "Morning Raga Ambience"],
    recommendation: "Most Popular"
  },
  {
    id: "MAP",
    name: "Riwaaz Dining",
    label: "HALF BOARD",
    description: "Curated dining inspired by regional Indian flavours.",
    priceTag: "+ ₹2,800",
    inclusions: ["All Subah Savera Inclusions", "Curated Regional Dining (Dinner)", "Chef's Signature Amuse-bouche", "Live Instrumental Evening"]
  },
  {
    id: "AP",
    name: "Maharaja Experience",
    label: "FULL EXPERIENCE",
    description: "A complete hospitality journey rooted in Indian tradition.",
    priceTag: "+ ₹4,200",
    inclusions: ["All Riwaaz Dining Inclusions", "Gourmet Regional Lunch", "Royal Afternoon High Tea", "Butler Concierge Assistance"],
    recommendation: "Best Value"
  }
];

const HeritageDivider = () => (
  <div className="flex items-center justify-center gap-4 my-8 opacity-20">
    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
    <div className="w-2 h-2 rotate-45 border border-[#D4AF37]" />
    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
  </div>
);

const IndianPattern = () => (
  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
    style={{ 
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%23D4AF37' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      backgroundSize: '30px 30px'
    }} 
  />
);

export default function MealPlans() {
  const { state, setMealPlan } = useBooking();
  const selectedPlanId = state.selectedMealPlanId || "EP";

  const handleSelect = (id: string) => {
    const plan = MEAL_PLANS.find(p => p.id === id);
    const priceStr = plan?.priceTag.replace(/[^0-9]/g, "") || "0";
    setMealPlan(id, parseInt(priceStr));
  };

  const getIcon = (id: string, isSelected: boolean) => {
    const size = 24;
    const className = cn("transition-all duration-500", isSelected ? "text-white" : "text-[#D4AF37]");
    switch (id) {
      case "EP": return <Moon size={size} className={className} />;
      case "CP": return <Sunrise size={size} className={className} />;
      case "MAP": return <Sun size={size} className={className} />;
      case "AP": return <Crown size={size} className={className} />;
      default: return <Utensils size={size} className={className} />;
    }
  };

  return (
    <section className="py-24 relative overflow-hidden" id="meal-plans">
      <div className="mb-16 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em]">Indian Hospitality Experience</span>
          <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37] md:hidden" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-[#053344] dark:text-white tracking-tighter leading-tight">
          Savour the <span className="italic font-serif text-[#D4AF37]">Art of Living</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {MEAL_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div 
              key={plan.id}
              onClick={() => handleSelect(plan.id)}
              className={cn(
                "relative group p-8 rounded-[48px] glass-premium border transition-all duration-700 cursor-pointer flex flex-col justify-between overflow-hidden hover-lift-premium",
                isSelected 
                  ? "bg-white/80 dark:bg-[#053344]/40 border-[#D4AF37] shadow-[0_20px_50px_-12px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/20" 
                  : "border-white/40 dark:border-white/5 hover:border-[#D4AF37]/30"
              )}
            >
              <IndianPattern />

              {plan.recommendation && (
                <div className="absolute top-0 right-10">
                  <div className={cn(
                    "px-4 py-2 rounded-b-2xl text-[8px] font-black uppercase tracking-[0.2em] shadow-lg transition-colors duration-500",
                    isSelected ? "bg-[#D4AF37] text-white" : "bg-[#F4C430]/10 text-[#D4AF37]"
                  )}>
                    {plan.recommendation}
                  </div>
                </div>
              )}

              <div>
                <div className={cn(
                  "w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 transition-all duration-700 relative",
                  isSelected ? "bg-[#D4AF37] shadow-[0_10px_25px_-5px_rgba(212,175,55,0.4)] rotate-6" : "bg-[#D4AF37]/5 border border-[#D4AF37]/10"
                )}>
                  {getIcon(plan.id, isSelected)}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-[24px] animate-ping bg-[#D4AF37]/20 -z-10" />
                  )}
                </div>
                
                <h3 className="text-2xl font-black text-[#053344] dark:text-white mb-1 group-hover:text-[#D4AF37] transition-colors duration-500 font-serif">
                  {plan.name}
                </h3>
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-[#D4AF37]/30" />
                  {plan.label}
                </p>
                
                <p className="text-sm font-medium text-[#0E5A75]/70 dark:text-white/60 mb-8 leading-relaxed italic">
                  &quot;{plan.description}&quot;
                </p>

                <div className="space-y-4 mb-8">
                  {plan.inclusions.map((inc, i) => (
                    <div key={inc} className="flex items-start gap-3 animate-in fade-in slide-in-from-left duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                      <div className={cn(
                        "mt-1 w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-[#D4AF37]" : "bg-[#0E5A75]/20"
                      )} />
                      <span className="text-[11px] font-bold text-[#0E5A75]/80 dark:text-white/70 leading-snug">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-0.5">Investment</p>
                  <p className={cn(
                    "text-lg font-black transition-colors duration-500",
                    isSelected ? "text-[#159665]" : "text-[#053344] dark:text-white"
                  )}>{plan.priceTag}</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-2xl border flex items-center justify-center transition-all duration-500",
                  isSelected ? "border-[#D4AF37] bg-[#D4AF37] text-white shadow-lg" : "border-[#0E5A75]/10 text-transparent"
                )}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <HeritageDivider />
    </section>
  );
}

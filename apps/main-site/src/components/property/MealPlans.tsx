"use client";

import React from "react";
import { Coffee, Utensils, Sparkles, CheckCircle2 } from "lucide-react";
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
    name: "European Plan",
    label: "Room Only",
    description: "Best for travelers who prefer to explore local dining options.",
    priceTag: "Included",
    inclusions: ["Luxury Accommodation", "Complimentary Wi-Fi", "Access to Pool \u0026 Gym"]
  },
  {
    id: "CP",
    name: "Continental Plan",
    label: "Bed \u0026 Breakfast",
    description: "A delightful start to your day with our signature breakfast spread.",
    priceTag: "+ ₹1,200",
    inclusions: ["All EP Inclusions", "Buffet Breakfast at Heritage Hall", "Fresh Pressed Juices"],
    recommendation: "Most Popular"
  },
  {
    id: "MAP",
    name: "Modified American Plan",
    label: "Half Board",
    description: "Ideal for couples seeking a balanced mix of exploration and comfort.",
    priceTag: "+ ₹2,800",
    inclusions: ["All CP Inclusions", "Curated Dinner Menu", "Seasonal Appetizers"]
  },
  {
    id: "AP",
    name: "American Plan",
    label: "Full Board",
    description: "The complete luxury experience. No need to worry about anything.",
    priceTag: "+ ₹4,200",
    inclusions: ["All MAP Inclusions", "Gourmet Lunch Menu", "Evening High Tea"],
    recommendation: "Best Value"
  }
];

export default function MealPlans() {
  const { state, setMealPlan } = useBooking();
  const selectedPlanId = state.selectedMealPlanId || "EP";

  const handleSelect = (id: string) => {
    const plan = MEAL_PLANS.find(p => p.id === id);
    const priceStr = plan?.priceTag.replace(/[^0-9]/g, "") || "0";
    setMealPlan(id, parseInt(priceStr));
  };

  return (
    <section className="py-24" id="meal-plans">
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-px bg-[#FCBC43]" />
          <span className="text-[10px] font-black text-[#FCBC43] uppercase tracking-[0.3em]">Gastronomy Experience</span>
        </div>
        <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight">Choose your Meal Plan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MEAL_PLANS.map((plan) => (
          <div 
            key={plan.id}
            onClick={() => handleSelect(plan.id)}
            className={cn(
              "relative group p-8 rounded-[40px] glass-premium border transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-hidden",
              selectedPlanId === plan.id 
                ? "bg-white/60 dark:bg-white/10 border-[#FCBC43]/40 shadow-2xl ring-4 ring-[#FCBC43]/5" 
                : "border-black/5 dark:border-white/5 hover:border-[#FCBC43]/20"
            )}
          >
            {plan.recommendation && (
              <div className="absolute top-0 right-10 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-[#FCBC43] text-white text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-b-xl shadow-lg">
                  {plan.recommendation}
                </div>
              </div>
            )}

            <div>
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500",
                selectedPlanId === plan.id ? "bg-[#FCBC43] text-white shadow-xl rotate-12" : "bg-[#FCBC43]/10 text-[#FCBC43]"
              )}>
                {plan.id === "EP" ? <Sparkles size={24} /> : plan.id === "CP" ? <Coffee size={24} /> : <Utensils size={24} />}
              </div>
              <h3 className="text-xl font-black text-[#053344] dark:text-white mb-1">{plan.name}</h3>
              <p className="text-[10px] font-black text-[#FCBC43] uppercase tracking-widest mb-4">{plan.label}</p>
              <p className="text-xs font-bold text-[#0E5A75]/60 mb-8 leading-relaxed">
                {plan.description}
              </p>

              <div className="space-y-3 mb-8">
                {plan.inclusions.map(inc => (
                  <div key={inc} className="flex items-start gap-2">
                    <CheckCircle2 size={12} className={cn("mt-0.5", selectedPlanId === plan.id ? "text-[#159665]" : "text-[#0E5A75]/30")} />
                    <span className="text-[10px] font-bold text-[#0E5A75]/70">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-black/5 dark:border-white/5">
              <p className="text-sm font-black text-[#159665] uppercase tracking-widest">{plan.priceTag}</p>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                selectedPlanId === plan.id ? "border-[#FCBC43] bg-[#FCBC43]" : "border-[#0E5A75]/10"
              )}>
                {selectedPlanId === plan.id && <CheckCircle2 size={12} className="text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

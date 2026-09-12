"use client";

import React from "react";
import { Utensils, CheckCircle2, Moon, Sun, Sunrise, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";

interface MealPlan {
  id: string;
  name: string;
  mealType?: string;
  label?: string;
  description?: string;
  price?: number;
  inclusions?: string[];
  recommendation?: string;
  isActive?: boolean;
}

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

export default function MealPlans({ plans }: { plans?: MealPlan[] }) {
  const { state, setMealPlan } = useBooking();
  const selectedPlanId = state.selectedMealPlanId;

  const activePlans = (plans || []).filter(p => p.isActive !== false);

  if (activePlans.length === 0) {
    return null;
  }

  const handleSelect = (id: string) => {
    const plan = activePlans.find(p => p.id === id);
    if (!plan) return;
    
    // Strictly use plan.price, defaulting to 0 if missing (but it shouldn't be for active plans)
    const actualPrice = plan.price !== undefined ? plan.price : 0;
    
    if (selectedPlanId === id) {
      setMealPlan("", 0);
    } else {
      setMealPlan(id, actualPrice);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const getIcon = (id: string, isSelected: boolean) => {
    const size = 24;
    const className = cn("transition-all duration-500", isSelected ? "text-white" : "text-[#D4AF37]");
    // We try to match standard codes, but fallback gracefully
    const upperId = id.toUpperCase();
    if (upperId.includes("BREAKFAST") && !upperId.includes("DINNER") && !upperId.includes("LUNCH")) return <Sunrise size={size} className={className} />;
    if (upperId.includes("DINNER") && !upperId.includes("BREAKFAST")) return <Moon size={size} className={className} />;
    if (upperId.includes("LUNCH")) return <Sun size={size} className={className} />;
    if (upperId.includes("NOT INCLUDED")) return <Utensils size={size} className={className} />;
    if (upperId.includes("ALL") || upperId.includes("FULL")) return <Crown size={size} className={className} />;
    return <Utensils size={size} className={className} />;
  };

  const renderCard = (plan: MealPlan) => {
    const isSelected = selectedPlanId === plan.id;
    const displayPrice = plan.price !== undefined ? formatPrice(plan.price) : "₹0";

    return (
      <div 
        key={plan.id}
        onClick={() => handleSelect(plan.id)}
        className={cn(
          "relative group p-8 rounded-[48px] glass-premium border transition-all duration-700 cursor-pointer flex flex-col justify-between overflow-hidden hover-lift-premium",
          isSelected 
            ? "bg-white/80 dark:bg-[#053344]/40 border-[#D4AF37] shadow-[0_20px_50px_-12px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/20" 
            : "border-black/5 dark:border-white/5 hover:border-[#D4AF37]/30"
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
          {(plan.label || plan.mealType) && (
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#D4AF37]/30" />
              {plan.label || plan.mealType}
            </p>
          )}
          
          {plan.description && (
            <p className="text-sm font-medium text-[#0E5A75]/70 dark:text-white/60 mb-8 leading-relaxed italic">
              &quot;{plan.description}&quot;
            </p>
          )}

          {plan.inclusions && plan.inclusions.length > 0 && (
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
          )}
        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-0.5">Investment</p>
            <p className={cn(
              "text-lg font-black transition-colors duration-500",
              isSelected ? "text-[#159665]" : "text-[#053344] dark:text-white"
            )}>
              {displayPrice} <span className="text-[10px] font-normal uppercase tracking-widest text-[#0E5A75]/40 ml-1">/ guest</span>
            </p>
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
  };

  // Group by meal type
  const vegPlans = activePlans.filter(p => p.mealType === "VEG" || p.label === "VEG" || p.name.toUpperCase().includes("VEG") && !p.name.toUpperCase().includes("NON"));
  const nonVegPlans = activePlans.filter(p => p.mealType === "NON_VEG" || p.label === "NON_VEG" || p.name.toUpperCase().includes("NON-VEG") || p.name.toUpperCase().includes("NON VEG"));
  const otherPlans = activePlans.filter(p => !vegPlans.includes(p) && !nonVegPlans.includes(p));

  const hasGroups = vegPlans.length > 0 || nonVegPlans.length > 0;

  const renderGroup = (title: string, groupPlans: MealPlan[]) => {
    if (groupPlans.length === 0) return null;
    return (
      <div className="mb-16 last:mb-0">
        <div className="flex items-center gap-4 mb-8">
          <h3 className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-[0.3em]">
            {title}
          </h3>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {groupPlans.map(renderCard)}
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 relative overflow-hidden" id="meal-plans">
      <div className="max-w-7xl mx-auto px-6">
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

        {hasGroups ? (
          <>
            {renderGroup("Vegetarian Options", vegPlans)}
            {renderGroup("Non-Vegetarian Options", nonVegPlans)}
            {renderGroup("Other Options", otherPlans)}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activePlans.map(renderCard)}
          </div>
        )}

        <HeritageDivider />
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PlaneTakeoff, 
  Clock, 
  Sparkles, 
  Utensils, 
  ShieldAlert, 
  Navigation, 
  CheckCircle2,
  X,
  Plus,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ConciergeService = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  price?: number;
  availability: string;
  color: string;
  configFields: ConfigField[];
};

type ConfigField = {
  id: string;
  label: string;
  type: "text" | "time" | "select" | "number";
  placeholder: string;
  options?: string[];
};

export const CONCIERGE_SERVICES: ConciergeService[] = [
  {
    id: "pickup",
    name: "Airport Pickup",
    icon: PlaneTakeoff,
    description: "Luxury sedan transfer with professional chauffeur.",
    price: 1500,
    availability: "Available 24/7",
    color: "#0983B0",
    configFields: [
      { id: "flight", label: "Flight Number", type: "text", placeholder: "e.g. AI-101" },
      { id: "time", label: "Arrival Time", type: "time", placeholder: "" },
      { id: "passengers", label: "Passengers", type: "number", placeholder: "1-4" }
    ]
  },
  {
    id: "decoration",
    name: "Occasion Decoration",
    icon: Sparkles,
    description: "Bespoke room setup with flowers, candles & balloons.",
    price: 3000,
    availability: "Needs 24h Notice",
    color: "#FCBC43",
    configFields: [
      { id: "occasion", label: "Occasion", type: "select", placeholder: "Select Occasion", options: ["Birthday", "Anniversary", "Honeymoon", "Proposal"] },
      { id: "theme", label: "Preferred Theme", type: "text", placeholder: "e.g. Red & Gold" }
    ]
  },
  {
    id: "dinner",
    name: "Candlelight Dinner",
    icon: Utensils,
    description: "Private four-course dinner setup at a scenic spot.",
    price: 4500,
    availability: "Limited Slots",
    color: "#F24633",
    configFields: [
      { id: "dietary", label: "Dietary Preference", type: "select", placeholder: "Select Preference", options: ["Vegetarian", "Non-Vegetarian", "Vegan"] },
      { id: "time", label: "Dinner Timing", type: "time", placeholder: "" },
      { id: "requests", label: "Special Requests", type: "text", placeholder: "e.g. No seafood" }
    ]
  },
  {
    id: "trekking",
    name: "Guided Trekking",
    icon: Navigation,
    description: "Explore hidden trails with an expert local guide.",
    price: 1200,
    availability: "Morning Slots",
    color: "#159665",
    configFields: [
      { id: "level", label: "Difficulty Level", type: "select", placeholder: "Select Level", options: ["Beginner", "Moderate", "Expert"] },
      { id: "participants", label: "Participants", type: "number", placeholder: "1-6" }
    ]
  },
  {
    id: "early-checkin",
    name: "Early Check-In",
    icon: Clock,
    description: "Arrive early and settle in. Subject to availability.",
    price: 2000,
    availability: "Check 12h before",
    color: "#0E5A75",
    configFields: [
      { id: "arrival", label: "Expected Arrival", type: "time", placeholder: "" }
    ]
  }
];

interface ConciergeUpsellProps {
  onServiceToggle: (serviceId: string, config: unknown) => void;
  selectedServices: Record<string, unknown>;
}

export function ConciergeUpsell({ onServiceToggle, selectedServices }: ConciergeUpsellProps) {
  const [activeConfig, setActiveConfig] = useState<ConciergeService | null>(null);
  const [configData, setConfigData] = useState<Record<string, unknown>>({});

  const handleOpenConfig = (service: ConciergeService) => {
    if (selectedServices[service.id]) {
      // If already selected, remove it
      onServiceToggle(service.id, null);
    } else {
      setActiveConfig(service);
      setConfigData({});
    }
  };

  const handleSaveConfig = () => {
    if (activeConfig) {
      onServiceToggle(activeConfig.id, configData);
      setActiveConfig(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-[#053344] dark:text-white tracking-tighter">Enhance Your Stay</h3>
          <p className="text-[10px] md:text-xs font-bold text-[#0E5A75]/60 dark:text-[#FCBC43]/80 uppercase tracking-widest mt-2">Luxury concierge services curated for your experience</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-2 rounded-full glass-matte border-black/5 dark:border-white/5">
           <ShieldAlert size={14} className="text-[#FCBC43]" />
           <span className="text-[9px] font-black uppercase tracking-widest text-[#053344] dark:text-white">VIP Priority Handling Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CONCIERGE_SERVICES.map((service) => {
          const isSelected = !!selectedServices[service.id];
          return (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenConfig(service)}
              className={cn(
                "group relative p-8 rounded-[48px] border transition-all duration-500 cursor-pointer overflow-hidden",
                isSelected 
                  ? "glass-premium bg-[#0E5A75] dark:bg-[#FCBC43]/10 border-[#0E5A75] dark:border-[#FCBC43]/40 shadow-2xl" 
                  : "glass-matte dark:bg-white/[0.02] border-white/10 dark:border-white/5 hover:border-[#0983B0] shadow-premium"
              )}
            >
              <div className="relative z-10 flex flex-col h-full gap-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500",
                    isSelected ? "bg-white text-[#0E5A75] shadow-xl" : "bg-[#0E5A75]/5 dark:bg-white/5 text-[#0E5A75] dark:text-[#FCBC43]"
                  )}>
                    <service.icon size={28} />
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isSelected ? "border-white bg-white text-[#159665]" : "border-[#0E5A75]/20 dark:border-white/10"
                  )}>
                    {isSelected ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={cn("text-base font-black uppercase tracking-widest", isSelected ? "text-white" : "text-[#053344] dark:text-white")}>
                      {service.name}
                    </h4>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#159665] animate-pulse" />}
                  </div>
                  <p className={cn("text-[10px] font-bold leading-relaxed opacity-60 uppercase tracking-widest italic", isSelected ? "text-white" : "text-[#0E5A75]/60 dark:text-white/40")}>
                    {service.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                  <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", isSelected ? "text-white" : "text-[#0983B0]")}>
                    ₹{service.price?.toLocaleString()}
                  </span>
                  <span className={cn("text-[8px] font-bold uppercase tracking-widest", isSelected ? "text-white/60" : "text-[#0E5A75]/30")}>
                    {service.availability}
                  </span>
                </div>
              </div>

              {/* Selection Glow */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0983B0]/20 to-transparent pointer-events-none" />
              )}
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#0983B0]/10 transition-all" />
            </motion.div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {activeConfig && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#053344]/90 backdrop-blur-2xl"
              onClick={() => setActiveConfig(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg glass-premium dark:bg-[#0A0F1D] shadow-luxury rounded-[64px] border border-white/20 dark:border-white/10 overflow-hidden"
            >
              <div className="p-10 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: activeConfig.color }}>
                    <activeConfig.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#053344] dark:text-white tracking-tighter leading-none mb-2">{activeConfig.name}</h3>
                    <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest italic">Personalize Experience</p>
                  </div>
                </div>
                <button onClick={() => setActiveConfig(null)} className="p-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#0E5A75] dark:text-white"><X size={24} /></button>
              </div>

              <div className="p-12 space-y-8">
                {activeConfig.configFields.map((field) => (
                  <div key={field.id} className="space-y-4">
                    <label className="text-[10px] font-black text-[#0E5A75] dark:text-[#FCBC43] uppercase tracking-[0.3em] ml-2">{field.label}</label>
                    {field.type === "select" ? (
                      <select 
                        onChange={(e) => setConfigData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        className="w-full px-8 py-5 rounded-[24px] glass-matte dark:bg-white/5 border border-white/10 dark:border-white/5 outline-none text-sm font-black text-[#053344] dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input 
                        type={field.type}
                        placeholder={field.placeholder}
                        onChange={(e) => setConfigData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        className="w-full px-8 py-5 rounded-[24px] glass-matte dark:bg-white/5 border border-white/10 dark:border-white/5 outline-none text-sm font-black text-[#053344] dark:text-white placeholder:text-[#0E5A75]/30"
                      />
                    )}
                  </div>
                ))}

                <div className="pt-6">
                  <button 
                    onClick={handleSaveConfig}
                    className="w-full py-6 rounded-[32px] bg-[#0E5A75] dark:bg-[#0983B0] text-white text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    Confirm Experience <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

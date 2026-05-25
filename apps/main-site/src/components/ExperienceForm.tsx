"use client";

import React, { useState } from "react";
import { 
  X, 
  Check, 
  ChevronRight, 
  Sparkles, 
  IndianRupee, 
  Users, 
  Clock,
  LayoutGrid,
  Tag,
  Star,
  Zap,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EXPERIENCE_CATEGORIES, ICON_MAP, Experience } from "@/lib/experiences-config";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ExperienceFormProps {
  initialData?: Partial<Experience> | null;
  onSubmit: (data: Partial<Experience>) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ExperienceForm({ initialData, onSubmit, onClose, isLoading }: ExperienceFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialData?.category || "Premium",
    price: initialData?.price || 0,
    isComplimentary: initialData?.isComplimentary || false,
    isFeatured: initialData?.isFeatured || false,
    icon: initialData?.icon || "Sparkles",
    duration: initialData?.duration || "2 Hours",
    maxGuests: initialData?.maxGuests || 4,
    requiresScheduling: initialData?.requiresScheduling || false,
    availabilityType: initialData?.availabilityType || "always",
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder || 0,
  });

  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val,
      // Auto-slug if title changes and no slug exists
      ...(name === "title" && !initialData ? { slug: value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "") } : {})
    }));
  };

  const handleStepNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleStepPrev = () => setStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { id: 1, name: "Basic Info", icon: LayoutGrid },
    { id: 2, name: "Pricing & Settings", icon: Tag },
    { id: 3, name: "Availability", icon: Calendar },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#053344]/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] rounded-[48px] shadow-luxury overflow-hidden border border-white/10"
      >
        {/* Header */}
        <div className="p-8 border-b border-black/5 flex justify-between items-center bg-[#FDF6F1]/50 dark:bg-white/5">
          <div>
            <h2 className="text-2xl font-black text-[#053344] dark:text-white leading-none">
              {initialData ? "Edit Experience" : "Create Experience"}
            </h2>
            <p className="text-xs font-bold text-[#0E5A75]/60 mt-2 uppercase tracking-widest italic">
              Crafting Memorable Mehmaan Moments
            </p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-8 py-4 bg-white/50 dark:bg-transparent flex items-center justify-between border-b border-black/5">
          <div className="flex items-center gap-6">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                  step >= s.id ? "bg-[#0E5A75] text-white" : "bg-[#0E5A75]/10 text-[#0E5A75]/40"
                )}>
                  {step > s.id ? <Check size={14} /> : <s.icon size={14} />}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest hidden sm:block",
                  step >= s.id ? "text-[#0E5A75]" : "text-[#0E5A75]/30"
                )}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (step === 3) onSubmit(formData); else handleStepNext(); }} className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-2">Experience Title</label>
                    <input 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Royal Arrival"
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border-none focus:ring-2 focus:ring-[#0E5A75] text-sm font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-2">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border-none focus:ring-2 focus:ring-[#0E5A75] text-sm font-bold"
                    >
                      {EXPERIENCE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-2">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the hospitality experience..."
                    rows={4}
                    className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border-none focus:ring-2 focus:ring-[#0E5A75] text-sm font-bold resize-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-2">Visual Identity (Icon)</label>
                  <div className="grid grid-cols-8 gap-2 p-4 bg-[#0E5A75]/5 rounded-3xl">
                    {Object.keys(ICON_MAP).map(iconName => {
                      const IconComp = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                            formData.icon === iconName ? "bg-[#0E5A75] text-white shadow-lg" : "hover:bg-[#0E5A75]/10 text-[#0E5A75]/40"
                          )}
                        >
                          <IconComp size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-2">Price (₹)</label>
                    <div className="relative">
                      <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" />
                      <input 
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border-none focus:ring-2 focus:ring-[#0E5A75] text-sm font-bold"
                        disabled={formData.isComplimentary}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-2">Duration</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" />
                      <input 
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="e.g. 90 Mins"
                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border-none focus:ring-2 focus:ring-[#0E5A75] text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ToggleOption 
                    icon={Sparkles}
                    label="Complimentary"
                    checked={formData.isComplimentary}
                    onChange={(val) => setFormData(p => ({ ...p, isComplimentary: val, price: val ? 0 : p.price }))}
                  />
                  <ToggleOption 
                    icon={Star}
                    label="Featured Experience"
                    checked={formData.isFeatured}
                    onChange={(val) => setFormData(p => ({ ...p, isFeatured: val }))}
                  />
                  <ToggleOption 
                    icon={Zap}
                    label="Active Status"
                    checked={formData.isActive}
                    onChange={(val) => setFormData(p => ({ ...p, isActive: val }))}
                  />
                  <ToggleOption 
                    icon={Users}
                    label="Group Support"
                    checked={formData.maxGuests > 1}
                    onChange={(val) => setFormData(p => ({ ...p, maxGuests: val ? 4 : 1 }))}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-2">Availability Policy</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["always", "seasonal", "weekend", "custom"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, availabilityType: type }))}
                        className={cn(
                          "px-5 py-4 rounded-2xl border-2 text-xs font-black uppercase tracking-widest transition-all",
                          formData.availabilityType === type 
                            ? "bg-[#0E5A75] border-[#0E5A75] text-white shadow-lg" 
                            : "bg-[#0E5A75]/5 border-transparent text-[#0E5A75]/60 hover:bg-[#0E5A75]/10"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <ToggleOption 
                  icon={Clock}
                  label="Advance Scheduling Required"
                  checked={formData.requiresScheduling}
                  onChange={(val) => setFormData(p => ({ ...p, requiresScheduling: val }))}
                />

                <div className="p-6 rounded-[32px] bg-[#159665]/5 border border-[#159665]/10 flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#159665]/10 text-[#159665] flex items-center justify-center shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#159665] leading-tight">Ready to Curate</h4>
                    <p className="text-xs text-[#159665]/60 mt-1">This experience will be instantly available for guest selection once published.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-black/5">
            <button
              type="button"
              onClick={step === 1 ? onClose : handleStepPrev}
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 hover:bg-[#0E5A75]/5 transition-all"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 rounded-2xl bg-[#0E5A75] text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-luxury hover:bg-[#0983B0] transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === 3 ? (
                <>Save Experience <Check size={14} /></>
              ) : (
                <>Continue <ChevronRight size={14} /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ToggleOption({ icon: Icon, label, checked, onChange }: { icon: LucideIcon, label: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
        checked 
          ? "bg-white dark:bg-white/5 border-[#0E5A75] shadow-md" 
          : "bg-[#0E5A75]/5 border-transparent opacity-60 hover:opacity-100"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
        checked ? "bg-[#0E5A75] text-white" : "bg-[#0E5A75]/10 text-[#0E5A75]"
      )}>
        <Icon size={18} />
      </div>
      <div>
        <p className={cn("text-[10px] font-black uppercase tracking-widest", checked ? "text-[#0E5A75]" : "text-[#0E5A75]/60")}>{label}</p>
        <p className="text-[8px] font-bold text-[#0E5A75]/40 uppercase mt-0.5">{checked ? "Enabled" : "Disabled"}</p>
      </div>
    </button>
  );
}

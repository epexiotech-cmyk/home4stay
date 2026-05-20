"use client";

import React from "react";
import { ArrowRight, Bed, Hotel, Key } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { TextField, StepCard } from "@/components/onboarding/FormComponents";

export default function RoomsStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();

  const roomsDraft = draftData.rooms || { roomName: "Royal Heritage Suite", price: "12500" };
  const errors = stepErrors.rooms || {};

  const handleFieldChange = (field: string, value: string) => {
    saveStepDraft("rooms", {
      ...roomsDraft,
      [field]: value
    });
  };

  const handleContinue = async () => {
    await completeStep("rooms");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <Hotel size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 4: Rooms &amp; Inventory</span>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Unified Room Categories</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Set up the different room options, villas, or cabin categories that you will sell. Each category maintains its own pricing index.
        </p>
      </div>

      {/* Form and Preview Card */}
      <div className="space-y-6">
        
        {/* Standardized Form Card */}
        <StepCard>
          
          <TextField
            label="Primary Room/Suite Name"
            required
            placeholder="e.g. Royal Heritage Suite"
            value={roomsDraft.roomName || ""}
            onChange={(e) => handleFieldChange("roomName", e.target.value)}
            error={errors.roomName}
            icon={<Bed size={16} />}
          />

          <TextField
            label="Starting Rate Per Night (INR)"
            required
            type="number"
            placeholder="e.g. 12500"
            value={roomsDraft.price || ""}
            onChange={(e) => handleFieldChange("price", e.target.value)}
            error={errors.price}
            icon={<span className="font-bold text-sm">₹</span>}
          />

        </StepCard>

        {/* Real-time List Preview */}
        <div className="card-premium p-6 bg-white border border-border rounded-2xl flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Bed size={20} className="stroke-[2px]" />
            </div>
            <div>
              <h4 className="font-extrabold text-primary text-sm leading-tight">
                {roomsDraft.roomName || "Royal Heritage Suite"}
              </h4>
              <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-1">Primary category</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-[#159665]">
              ₹{roomsDraft.price ? Number(roomsDraft.price).toLocaleString() : "12,500"}
            </span>
            <p className="text-[8px] font-bold text-secondary/40 uppercase tracking-widest leading-none mt-1">Starting Rate</p>
          </div>
        </div>

      </div>

      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <Key size={14} className="text-[#FCBC43]" />
          <span>Rates feed directly into PMS calendars</span>
        </span>
        <button
          onClick={handleContinue}
          className="btn btn-primary px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary-hover flex items-center gap-2 group shadow-md"
        >
          <span>Continue Setup</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}

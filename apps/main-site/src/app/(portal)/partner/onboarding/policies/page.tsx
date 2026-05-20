"use client";

import React from "react";
import { ArrowRight, ShieldAlert, Clock, ShieldCheck } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { TextField, SelectField, StepCard } from "@/components/onboarding/FormComponents";

export default function PoliciesStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();

  const policiesDraft = draftData.policies || { checkIn: "02:00 PM", checkOut: "11:00 AM", cancellation: "flexible" as const };
  const errors = stepErrors.policies || {};

  const handleFieldChange = (field: string, value: string) => {
    saveStepDraft("policies", {
      ...policiesDraft,
      [field]: value
    });
  };

  const handleContinue = async () => {
    await completeStep("policies");
  };

  const cancellationOptions = [
    { value: "flexible", label: "Flexible (100% refund up to 48 hours before check-in)" },
    { value: "moderate", label: "Moderate (100% refund up to 5 days before check-in)" },
    { value: "strict", label: "Strict (50% refund up to 7 days before check-in, 0% after)" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <ShieldAlert size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 8: Global Policies</span>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Stay Policies &amp; House Guidelines</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Set clear, professional parameters around check-in logistics, guest limits, pet permissions, and cancellation terms.
        </p>
      </div>

      {/* Standardized Form Card */}
      <StepCard>
        
        {/* Timing policies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TextField
            label="Check-In Time"
            required
            placeholder="e.g. 02:00 PM"
            value={policiesDraft.checkIn || ""}
            onChange={(e) => handleFieldChange("checkIn", e.target.value)}
            error={errors.checkIn}
            icon={<Clock size={16} />}
          />
          
          <TextField
            label="Check-Out Time"
            required
            placeholder="e.g. 11:00 AM"
            value={policiesDraft.checkOut || ""}
            onChange={(e) => handleFieldChange("checkOut", e.target.value)}
            error={errors.checkOut}
            icon={<Clock size={16} />}
          />
        </div>

        {/* Cancellation dropdown selection */}
        <SelectField
          label="Cancellation Policy Type"
          required
          options={cancellationOptions}
          value={policiesDraft.cancellation || "flexible"}
          onChange={(e) => handleFieldChange("cancellation", e.target.value)}
          error={errors.cancellation}
        />

      </StepCard>

      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-success" />
          <span>Policies help manage customer disputes securely</span>
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

"use client";

import React from "react";
import { ArrowRight, Tag, Check, Lock, Sparkles, Receipt } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";
import { ValidationMessage } from "@/components/onboarding/FormComponents";
import { INDIAN_STATES_MAPPING } from "@/lib/financial/taxValidator";
import { PricingConfigDraft } from "@/lib/onboarding/validation";

export default function PricingStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();

  const pricingDraft = draftData.pricing || ({ plan: "pro", enableBusinessBilling: false } as PricingConfigDraft);
  const selectedPlan = pricingDraft.plan || "pro";
  const enableBusinessBilling = pricingDraft.enableBusinessBilling || false;
  const errors = stepErrors.pricing || {};

  const handleSelectPlan = (planId: string) => {
    saveStepDraft("pricing", { ...pricingDraft, plan: planId });
  };

  const handleToggleB2B = (e: React.ChangeEvent<HTMLInputElement>) => {
    saveStepDraft("pricing", {
      ...pricingDraft,
      enableBusinessBilling: e.target.checked
    });
  };

  const handleFieldChange = (name: string, value: string) => {
    saveStepDraft("pricing", {
      ...pricingDraft,
      [name]: value
    });
  };

  const handleContinue = async () => {
    await completeStep("pricing");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <Tag size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 9: Choose Plan Subscription</span>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Flexible SaaS Subscriptions</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Pick a flat-rate plan that corresponds to your hospitality footprint. Remember, Home4Stay takes exactly 0% of your guest booking values.
        </p>
      </div>

      {errors.plan && <ValidationMessage error={errors.plan} />}

      {/* Luxury Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Core Plan */}
        <div 
          onClick={() => handleSelectPlan("core")}
          className={cn(
            "card-premium p-6 bg-white border rounded-[28px] hover-lift flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-300",
            selectedPlan === "core" 
              ? "border-primary ring-2 ring-primary/20 bg-primary/[0.01]" 
              : "border-border hover:border-primary/20"
          )}
        >
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-secondary/40">Boutique</span>
              {selectedPlan === "core" && (
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center animate-in zoom-in duration-300">
                  <Check size={10} className="stroke-[3px]" />
                </div>
              )}
            </div>
            <h4 className="font-extrabold text-primary text-lg mt-1">Direct Core Plan</h4>
            <p className="text-2xl font-black text-primary mt-2">₹999<span className="text-xs font-normal text-secondary/60"> / mo</span></p>
            <p className="text-[10px] font-medium text-secondary/50 leading-relaxed mt-4">For single-villas and private homestays searching for basic direct-booking presence.</p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-[8px] font-black text-[#159665] uppercase">
            <Check size={12} className="stroke-[3px]" />
            <span>0% Booking Share</span>
          </div>
        </div>

        {/* Premium Plan */}
        <div 
          onClick={() => handleSelectPlan("pro")}
          className={cn(
            "card-premium p-6 rounded-[28px] hover-lift flex flex-col justify-between min-h-[220px] relative overflow-hidden group cursor-pointer transition-all duration-300",
            selectedPlan === "pro" 
              ? "bg-primary text-white ring-4 ring-primary/20" 
              : "bg-surface-alt border border-border text-primary hover:border-primary/20"
          )}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center">
              <span className={cn("text-[9px] font-black uppercase tracking-wider", selectedPlan === "pro" ? "text-[#FCBC43]" : "text-primary/60")}>Signature</span>
              <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", selectedPlan === "pro" ? "bg-white/10 text-white" : "bg-primary/5 text-primary")}>POPULAR</span>
            </div>
            <h4 className={cn("font-extrabold text-lg mt-1", selectedPlan === "pro" ? "text-white" : "text-primary")}>Hospitality Pro OS</h4>
            <p className={cn("text-2xl font-black mt-2", selectedPlan === "pro" ? "text-white" : "text-primary")}>₹1,999<span className={cn("text-xs font-normal", selectedPlan === "pro" ? "text-white/60" : "text-secondary/60")}> / mo</span></p>
            <p className={cn("text-[10px] font-medium leading-relaxed mt-4", selectedPlan === "pro" ? "text-white/80" : "text-secondary/60")}>For small boutique resorts, villas collections, and PMS integrations.</p>
          </div>
          <div className={cn("mt-6 flex items-center gap-1.5 text-[8px] font-black uppercase", selectedPlan === "pro" ? "text-[#FCBC43]" : "text-primary")}>
            <Sparkles size={12} className={cn("shrink-0", selectedPlan === "pro" ? "text-[#FCBC43]" : "text-primary")} />
            <span>Premium Domain Included</span>
          </div>
        </div>

      </div>

      {/* Corporate B2B Tax Invoicing (India GST) Glassmorphic Panel */}
      <div className="bg-white/60 backdrop-blur-md rounded-[28px] border border-border/85 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/5 rounded-xl text-primary border border-primary/10">
            <Receipt size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-primary text-base">B2B Tax Invoicing & Compliance</h4>
            <p className="text-[10px] font-semibold text-secondary/50 mt-0.5">Generate compliance-safe GST tax invoices to claim input tax credits (ITC).</p>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-border/50 pt-4">
          <input
            type="checkbox"
            id="enableBusinessBilling"
            checked={enableBusinessBilling}
            onChange={handleToggleB2B}
            className="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer mt-0.5"
          />
          <div className="grid gap-1.5">
            <label htmlFor="enableBusinessBilling" className="text-xs font-black uppercase tracking-wider text-primary cursor-pointer select-none">
              I require B2B corporate billing details on my invoices
            </label>
            <p className="text-[9px] font-medium text-secondary/60 max-w-xl leading-relaxed">
              If enabled, you must provide your legal business name, valid Indian GSTIN registration code, and verified matching state details before launch setup is locked.
            </p>
          </div>
        </div>

        {enableBusinessBilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-border/50 pt-5 animate-in fade-in slide-in-from-top-3 duration-300">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-secondary/60 mb-2">Legal Business Name</label>
              <input
                type="text"
                value={pricingDraft.legalBusinessName || ""}
                onChange={(e) => handleFieldChange("legalBusinessName", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold"
                placeholder="e.g. Acme Resorts Private Limited"
              />
              {errors.legalBusinessName && (
                <p className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">{errors.legalBusinessName}</p>
              )}
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-secondary/60 mb-2">Business GSTIN (15 characters)</label>
              <input
                type="text"
                value={pricingDraft.gstin || ""}
                onChange={(e) => handleFieldChange("gstin", e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-border rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono uppercase font-bold"
                placeholder="e.g. 24ABCDE1234F1Z5"
                maxLength={15}
              />
              {errors.gstin && (
                <p className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">{errors.gstin}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[9px] font-black uppercase tracking-wider text-secondary/60 mb-2">Registered Billing Address</label>
              <textarea
                value={pricingDraft.billingAddress || ""}
                onChange={(e) => handleFieldChange("billingAddress", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-border rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold"
                placeholder="Official address listed on your GST registration certificate..."
              />
              {errors.billingAddress && (
                <p className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">{errors.billingAddress}</p>
              )}
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-secondary/60 mb-2">Billing State</label>
              <select
                value={pricingDraft.billingState || ""}
                onChange={(e) => handleFieldChange("billingState", e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold"
              >
                <option value="">-- Choose State --</option>
                {INDIAN_STATES_MAPPING.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
              {errors.billingState && (
                <p className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">{errors.billingState}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-secondary/60 mb-2">Billing Pincode</label>
                <input
                  type="text"
                  value={pricingDraft.billingPincode || ""}
                  onChange={(e) => handleFieldChange("billingPincode", e.target.value)}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-border rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold"
                  placeholder="e.g. 380001"
                />
                {errors.billingPincode && (
                  <p className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">{errors.billingPincode}</p>
                )}
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-wider text-secondary/60 mb-2">Finance Contact Phone</label>
                <input
                  type="text"
                  value={pricingDraft.billingContact || ""}
                  onChange={(e) => handleFieldChange("billingContact", e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-semibold"
                  placeholder="e.g. 9876543210"
                />
                {errors.billingContact && (
                  <p className="text-[9px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">{errors.billingContact}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <Lock size={14} className="text-[#FCBC43]" />
          <span>All payments are encrypted and secured with Stripe / Razorpay</span>
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

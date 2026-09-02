"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ShieldAlert, Clock, ShieldCheck, FileText, Upload, CheckCircle2, Trash2, Loader2, X } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { TextField, SelectField, StepCard } from "@/components/onboarding/FormComponents";

const STATIC_AGREEMENT = `HOME4STAY - PROPERTY PARTNER AGREEMENT

This Property Partner Agreement ("Agreement") is entered into between Home4Stay ("Home4Stay") and the property owner / authorized representative ("Partner") for the listing, management, promotion and booking of the Partner's property through the Home4Stay platform.

1. Partner & Property
The Partner confirms that the information, photographs, amenities, pricing, availability, policies and other details provided for the property are accurate and up to date.

2. Authority & Ownership
The Partner confirms that they are the property owner or are duly authorized to represent and manage the property and to provide the property for listing and booking through Home4Stay.

3. Property Information
The Partner is responsible for maintaining accurate property information, including:
- Property name and address
- Room and accommodation details
- Amenities and facilities
- Pricing and availability
- Check-in / check-out policies
- House rules and applicable restrictions

4. Bookings & Guest Services
Home4Stay may display the property on its platform and facilitate guest discovery, booking and related communication in accordance with the applicable Home4Stay policies and commercial terms.

The Partner remains responsible for providing the accommodation and services represented in the property listing.

5. Accuracy & Compliance
The Partner agrees that the property and its operation will comply with applicable laws, regulations, licenses, permissions and safety requirements.

The Partner is responsible for obtaining and maintaining any permissions, registrations or licenses required for operating the property.

6. Property Standards
The Partner agrees to maintain the property in a reasonably clean, safe and usable condition and to provide guests with the services and facilities represented in the listing.

7. Content & Media
The Partner authorizes Home4Stay to use property information, photographs, videos, descriptions and other materials supplied by the Partner for the purpose of listing, promoting and operating the property on the Home4Stay platform.

8. Partner Responsibility
The Partner is responsible for:
- Accuracy of submitted information
- Guest-ready condition of the property
- Compliance with applicable requirements
- Availability provided to Home4Stay
- Fulfilment of confirmed bookings
- Any representations made regarding the property

9. Changes & Updates
The Partner must promptly update Home4Stay regarding material changes to the property, availability, pricing, amenities, policies or operating conditions.

10. Termination
Either party may terminate the partnership subject to applicable commercial terms, pending bookings and any other obligations that survive termination.

Home4Stay may suspend or remove a property where information is materially inaccurate, the property presents a significant risk, or the Partner fails to comply with applicable platform requirements.

11. Electronic Record & Acceptance
The Partner confirms that they have read and understood this Agreement and that the information provided during onboarding is accurate.

The Partner's acceptance and uploaded signature will be stored with the Agreement record together with the Partner's name, designation, property information and acceptance date.`;

export default function PoliciesStepPage() {
  const { draftData, saveStepDraft, completeStep, stepErrors } = useOnboarding();

  const policiesDraft = draftData.policies || { checkIn: "02:00 PM", checkOut: "11:00 AM", cancellation: "flexible" as const };
  const errors = stepErrors.policies || {};

  // Agreement State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  
  const [savedAgreement, setSavedAgreement] = useState<any>(null);
  const [savingAgreement, setSavingAgreement] = useState(false);
  const [agreementError, setAgreementError] = useState<string | null>(null);
  const [fetchingAgreement, setFetchingAgreement] = useState(true);

  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLatestAgreement();
  }, []);

  const fetchLatestAgreement = async () => {
    try {
      setFetchingAgreement(true);
      const res = await fetch("/api/partner/agreement");
      const data = await res.json();
      if (res.ok && data.success && data.data?.agreement) {
        setSavedAgreement(data.data.agreement);
      }
    } catch (err) {
      console.error("Failed to fetch agreement", err);
    } finally {
      setFetchingAgreement(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    saveStepDraft("policies", {
      ...policiesDraft,
      [field]: value
    });
  };

  const handleSaveAgreement = async () => {
    if (!signatureFile || !isAuthorized) {
      setAgreementError("Please upload a signature and check the acceptance box.");
      return;
    }
    
    // File validation
    if (!signatureFile.type.match(/^image\/(png|jpeg|jpg)$/)) {
      setAgreementError("Only PNG, JPG, or JPEG files are allowed for the signature.");
      return;
    }

    setSavingAgreement(true);
    setAgreementError(null);
    try {
      const formData = new FormData();
      formData.append("signatureFile", signatureFile);

      const res = await fetch("/api/partner/agreement", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || "Failed to save agreement");

      setSavedAgreement(data.data.agreement);
      setSignatureFile(null);
      setIsAuthorized(false);
    } catch (err: any) {
      setAgreementError(err.message);
    } finally {
      setSavingAgreement(false);
    }
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
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

      {/* PROPERTY POLICIES & TERMS */}
      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-extrabold text-primary tracking-tight uppercase flex items-center gap-2">
          <FileText size={20} />
          HOME4STAY - PROPERTY PARTNER AGREEMENT
        </h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Review the agreement terms and provide authorized signatory information for this property.
        </p>
      </div>

      <StepCard>
        {fetchingAgreement ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : savedAgreement ? (
          <div className="space-y-5">
            <div className="bg-success/5 border border-success/20 rounded-xl p-6 flex flex-col gap-4 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 text-success">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{savedAgreement.status}</span>
              </div>
              
              <h3 className="text-sm font-black text-secondary uppercase tracking-wider">{savedAgreement.agreementType}</h3>
              
              <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-5 max-h-64 overflow-y-auto">
                <pre className="text-xs text-secondary/80 font-medium leading-relaxed whitespace-pre-wrap font-sans">
                  {savedAgreement.agreementContent}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-secondary/70 pt-4 border-t border-border mt-2">
                <div>
                  <span className="block text-[10px] text-secondary/40 font-bold uppercase tracking-widest mb-1">Signed Date</span>
                  {new Date(savedAgreement.signedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                {savedAgreement.signatureUrl && (
                  <a href={savedAgreement.signatureUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                    <FileText size={12} /> View Signature Record
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {agreementError && (
              <div className="p-4 bg-error/5 border border-error/15 text-error text-[11px] font-bold rounded-xl flex items-center justify-between">
                <span>{agreementError}</span>
                <button onClick={() => setAgreementError(null)} className="hover:text-error-hover"><X size={14} /></button>
              </div>
            )}

            <div className="space-y-2">
              <div className="w-full bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-6 text-xs leading-relaxed font-medium text-secondary/80 overflow-y-auto max-h-96 shadow-inner">
                <pre className="whitespace-pre-wrap font-sans">{STATIC_AGREEMENT}</pre>
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-8">
              <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest mb-4">PARTNER SIGNATURE</h4>
              
              
              <div className="mt-6 space-y-2">
                
                <div className="flex items-center gap-3">
                  <input type="file" ref={signatureInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
                  <button 
                    onClick={() => signatureInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-secondary rounded-lg transition-colors"
                  >
                    <Upload size={14} /> {signatureFile ? "Change Signature" : "Upload Signature"}
                  </button>
                  {signatureFile && <span className="text-xs text-secondary/60 truncate max-w-xs">{signatureFile.name}</span>}
                  {signatureFile && <button onClick={() => setSignatureFile(null)} className="text-error/60 hover:text-error"><Trash2 size={14}/></button>}
                </div>
              </div>

              <div className="mt-6 space-y-1 text-xs font-bold text-secondary/80">
                <span className="block text-[11px] text-secondary uppercase tracking-widest mb-1">Date:</span>
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-secondary/60">
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border">
                <input 
                  type="checkbox" 
                  id="authConfirm"
                  checked={isAuthorized}
                  onChange={(e) => setIsAuthorized(e.target.checked)}
                  className="mt-0.5 accent-primary w-4 h-4 rounded border-border"
                />
                <label htmlFor="authConfirm" className="text-[10px] font-bold text-secondary cursor-pointer leading-relaxed uppercase tracking-wider">
                  I have read and understood the Home4Stay Property Partner Agreement.
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveAgreement}
                  disabled={savingAgreement || !isAuthorized || !signatureFile}
                  className="btn btn-secondary bg-slate-800 hover:bg-slate-900 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {savingAgreement ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>{savingAgreement ? "Saving..." : "ACCEPT & SIGN AGREEMENT"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
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

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { 
  ArrowRight, 
  ArrowLeft, 
  X,
  Check, 
  Cloud,
  Laptop,
  Smartphone,
  Tablet,
  Maximize2,
  Minimize2,
  Info,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingProvider, useOnboarding } from "@/context/OnboardingContext";
import PreviewRenderer from "@/components/onboarding/PreviewRenderer";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <OnboardingInnerLayout>{children}</OnboardingInnerLayout>
    </OnboardingProvider>
  );
}

function OnboardingInnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const {
    steps,
    activeStep,
    activeStepIndex,
    completedSteps,
    draftData,
    progressPercentage,
    loading,
    isSaving,
    completeStep,
    goToStep
  } = useOnboarding();

  // Navigation handlers
  const handleNext = async () => {
    if (activeStep.id === "launch") {
      try {
        const res = await fetch("/api/partner/activation", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        
        let finalPropertyUrl = `/property/${(draftData?.property?.slug || "not-found")}`;
        
        if (res.ok) {
           const json = await res.json();
           if (json.data && json.data.propertyUrl) {
             finalPropertyUrl = json.data.propertyUrl;
           }
           await completeStep(activeStep.id);
           window.location.href = finalPropertyUrl; // use window.location.href for external subdomain
        } else {
           const json = await res.json();
           if (json.data && json.data.propertyUrl) {
             finalPropertyUrl = json.data.propertyUrl;
           } else if (json.propertyUrl) {
             finalPropertyUrl = json.propertyUrl;
           }
           
           if (json.error?.message?.includes("already active") || json.status === "ACTIVE") {
              await completeStep(activeStep.id);
              window.location.href = finalPropertyUrl;
           } else {
              alert(json.error?.message || json.message || "Failed to activate property. Check readiness.");
           }
        }
      } catch (err) {
        console.error("Launch failed:", err);
      }
    } else {
      await completeStep(activeStep.id);
    }
  };

  const handleBack = () => {
    if (activeStepIndex > 0) {
      router.push(steps[activeStepIndex - 1].route);
    }
  };

  // Graceful loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center select-none">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/50">Establish luxury booking blueprint...</p>
        </div>
      </div>
    );
  }

  // Live draft attributes for dynamic mockup preview
  const currentPropertyDraft = draftData.property || { title: "", location: "", description: "", slug: "" };

  return (
    <div className="h-[calc(100dvh-128px)] md:h-[calc(100dvh-144px)] bg-background text-text flex flex-col font-sans selection:bg-primary/10 select-none contain-paint overflow-hidden rounded-[24px] md:rounded-[32px] border border-border/40 shadow-xl">
      
      {/* 1. TOP NAV / DISTRACTION-FREE HEADER */}
      <header className="h-20 bg-white/80 dark:bg-black/20 backdrop-blur-xl border-b border-border px-6 md:px-12 flex items-center justify-between shrink-0 z-20 relative">
        <div className="flex items-center gap-6">
          <Logo variant="full" size="sm" link={false} className="opacity-95" />
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>Hospitality Setup Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Auto-Save Indicator */}
          <div 
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-secondary text-xs font-black uppercase tracking-wider transition-all duration-300",
              isSaving ? "border-primary/30 text-primary shadow-sm" : ""
            )}
          >
            <Cloud size={14} className={cn("shrink-0", isSaving ? "animate-bounce text-primary" : "")} />
            <span className="hidden sm:inline">
              {isSaving ? "Syncing Draft..." : "Cloud Connected"}
            </span>
          </div>

          {/* Exit Onboarding Setup */}
          <Link 
            href="/partner"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent/5 hover:bg-accent/10 text-accent transition-all text-xs font-black uppercase tracking-wider"
          >
            <X size={14} />
            <span>Exit Setup</span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN LAYOUT SCAFFOLDING */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT SIDEBAR: PROGRESS TIMELINE RAIL (DESKTOP) */}
        <aside className={cn(
          "hidden lg:flex w-80 bg-white/40 dark:bg-black/10 border-r border-border flex-col p-8 overflow-y-auto shrink-0 scrollbar-hide",
          isFullScreen && "lg:hidden"
        )}>
          <div className="mb-6">
            <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em]">Hospitality Blueprint</p>
            <h4 className="text-sm font-black text-primary uppercase tracking-widest mt-1">Wizard Checklist</h4>
          </div>

          <nav className="space-y-1 relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[2px] before:bg-border">
            {steps.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = step.id === activeStep.id;
              const isPending = !isCompleted && !isActive;

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={isPending}
                  className={cn(
                    "w-full flex items-center gap-4 py-3 text-left relative z-10 group transition-all",
                    isPending ? "cursor-not-allowed opacity-50" : "hover:opacity-100"
                  )}
                >
                  {/* Step status indicator circle */}
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 font-bold text-xs shrink-0 shadow-sm",
                    isCompleted ? "bg-success border-success text-white" : "",
                    isActive ? "bg-white border-primary text-primary ring-4 ring-primary/5 dark:ring-primary/20 scale-105" : "",
                    isPending ? "bg-white border-border text-secondary/40" : ""
                  )}>
                    {isCompleted ? (
                      <Check size={14} className="stroke-[3px]" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  <span className={cn(
                    "text-xs font-black uppercase tracking-widest transition-colors duration-300",
                    isCompleted ? "text-secondary/60" : "",
                    isActive ? "text-primary" : "",
                    isPending ? "text-secondary/40" : "group-hover:text-primary/70"
                  )}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* CENTER CONTAINER: SCROLLABLE ONBOARDING FOCUS AREA */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          <div className={cn(
            "flex-1 overflow-y-auto px-6 py-12 md:p-16 scrollbar-hide flex flex-col justify-between",
            isFullScreen && "hidden"
          )}>
            {/* Inner focus element */}
            <div className="max-w-4xl w-full mx-auto pb-20">
              
              {/* Dynamic step name pill (Mobile helper) */}
              <div className="lg:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/10 mb-6">
                <span>Step {activeStepIndex + 1} of 10</span>
                <span className="text-primary/30">&bull;</span>
                <span>{activeStep.title}</span>
              </div>

              {children}
            </div>
          </div>

          {/* RIGHT SIDEBAR: HIGH-FIDELITY LIVE PROPERTY PREVIEW (DESKTOP / INTERACTIVE CANVAS) */}
          <div className={cn(
            "hidden xl:flex w-[480px] border-l border-border bg-slate-50 flex-col p-8 overflow-y-auto shrink-0 scrollbar-hide relative",
            isFullScreen && "flex flex-1 w-full border-l-0"
          )}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              
              {/* Preview header control bar */}
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div>
                  <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em]">Direct-Booking Preview</p>
                  <h4 className="text-sm font-black text-primary uppercase tracking-widest mt-1">Live Guest Portal</h4>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Device viewport selectors */}
                  <div className="flex bg-white rounded-xl p-1 border border-border shadow-sm">
                    <button 
                      onClick={() => setDevicePreview("desktop")}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        devicePreview === "desktop" ? "bg-primary text-white" : "text-secondary/50 hover:text-primary"
                      )}
                      title="Desktop Viewport"
                    >
                      <Laptop size={14} />
                    </button>
                    <button 
                      onClick={() => setDevicePreview("tablet")}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        devicePreview === "tablet" ? "bg-primary text-white" : "text-secondary/50 hover:text-primary"
                      )}
                      title="Tablet Viewport"
                    >
                      <Tablet size={14} />
                    </button>
                    <button 
                      onClick={() => setDevicePreview("mobile")}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        devicePreview === "mobile" ? "bg-primary text-white" : "text-secondary/50 hover:text-primary"
                      )}
                      title="Mobile Viewport"
                    >
                      <Smartphone size={14} />
                    </button>
                  </div>

                  {/* Expand Full Screen Preview Toggle Button */}
                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className={cn(
                      "p-2.5 rounded-xl border border-border bg-white text-secondary/50 hover:text-primary hover:bg-slate-50 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-sm",
                      isFullScreen && "border-primary/20 text-primary bg-primary/5"
                    )}
                  >
                    {isFullScreen ? (
                      <>
                        <Minimize2 size={12} />
                        <span>Exit Screen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 size={12} />
                        <span>Expand Preview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulated browser window with device wrapper */}
              <div className="flex-1 flex items-center justify-center pb-8 shrink-0">
                <div className={cn(
                  "bg-white border border-border rounded-[24px] shadow-premium overflow-hidden flex flex-col transition-all duration-500",
                  devicePreview === "desktop" ? "w-full h-full min-h-[360px] aspect-[16/10]" : "",
                  devicePreview === "tablet" ? "w-[640px] h-[95%] aspect-[4/3] rounded-[32px] max-w-full" : "",
                  devicePreview === "mobile" ? "w-[320px] h-[90%] aspect-[9/16] rounded-[40px] max-w-full" : ""
                )}>
                  {/* Browser toolbar */}
                  <div className="flex items-center gap-1.5 border-b border-border bg-slate-50 px-4 py-2.5 shrink-0">
                    <div className="flex gap-1 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    </div>
                    <div className="mx-auto rounded bg-white border border-border px-3 py-0.5 text-[8px] font-bold text-secondary/35 tracking-wider truncate max-w-[180px]">
                      {(draftData?.property?.slug || "not-found") ? `${(draftData?.property?.slug || "not-found")}.home4stay.in` : "luxuryvilla.home4stay.in"}
                    </div>
                  </div>

                  {/* High-Fidelity Central Preview Renderer */}
                  <div className="flex-1 overflow-hidden relative bg-white">
                    <PreviewRenderer viewport={devicePreview} isFullScreen={isFullScreen} />
                  </div>
                </div>
              </div>

              {/* Informative tips box */}
              {!isFullScreen && (
                <div className="bg-[#FCBC43]/10 border border-[#FCBC43]/20 rounded-2xl p-4 flex gap-3 shrink-0">
                  <Info className="text-warning shrink-0" size={16} />
                  <p className="text-[10px] font-bold text-warning italic leading-relaxed">
                    Real-time preview refreshes instantly as you complete step parameters on the left content panel.
                  </p>
                </div>
              )}

            </div>
          </div>

        </main>
      </div>

      {/* 3. STICKY BOTTOM NAVIGATION PANEL */}
      <footer className="h-20 bg-white border-t border-border px-6 md:px-12 flex items-center justify-between shrink-0 z-20 relative">
        <button
          onClick={handleBack}
          disabled={activeStepIndex === 0}
          className={cn(
            "flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border text-secondary text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98]",
            activeStepIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-surface-alt hover:text-primary"
          )}
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Mobile Viewport Toggle Button (only on responsive viewports) */}
        <button
          onClick={() => {
            setIsFullScreen(!isFullScreen);
            setDevicePreview("mobile");
          }}
          className={cn(
            "xl:hidden flex items-center gap-2 px-5 py-3.5 rounded-xl border transition-all text-xs font-black uppercase tracking-wider active:scale-[0.98]",
            isFullScreen 
              ? "border-primary/20 bg-primary/5 text-primary" 
              : "border-warning/20 bg-warning/5 text-[#D97706] hover:bg-warning/10"
          )}
        >
          <Smartphone size={14} />
          <span>{isFullScreen ? "Onboarding Form" : "Live Preview"}</span>
        </button>

        {/* Dynamic progress bar (Tablet/Mobile helper) */}
        <div className="hidden md:flex flex-col items-center gap-1.5 w-1/3">
          <div className="flex justify-between items-center w-full text-[9px] font-bold text-secondary/50 uppercase tracking-widest">
            <span>Setup Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          

          <button
            onClick={handleNext}
            className={cn(
              "flex items-center gap-2 px-8 py-3.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shrink-0 whitespace-nowrap",
              activeStepIndex === steps.length - 1 
                ? "bg-success shadow-success/20 hover:bg-success-light" 
                : "bg-primary shadow-primary/20 hover:bg-primary-hover"
            )}
          >
            <span>{activeStepIndex === steps.length - 1 ? "Launch Booking Site" : "Continue Setup"}</span>
            <ArrowRight size={14} className="shrink-0" />
          </button>
        </div>
      </footer>

    </div>
  );
}

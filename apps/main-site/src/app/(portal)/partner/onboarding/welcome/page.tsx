"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";
import { Sparkles, Star, ArrowRight, Zap, Shield, Globe } from "lucide-react";

export default function WelcomeStepPage() {
  const router = useRouter();
  const { completeStep } = useOnboarding();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Upper Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 mb-2">
        <Sparkles size={14} className="text-[#FCBC43]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 1: Emotional Welcome Entrance</span>
      </div>

      {/* Main Copywriting */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight leading-none">
          Let’s launch your<br />
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">hospitality brand.</span>
        </h1>
        <p className="text-3xl font-light text-[#29655C] tracking-tight leading-tight">
          Your guests are waiting.
        </p>
        <p className="text-sm font-medium text-secondary/70 leading-relaxed max-w-xl">
          Establish an ultra-premium direct-booking website in under 5 minutes. No technical code, no development delays, and exactly 0% commissions.
        </p>
      </div>

      {/* Aspirational Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        {[
          { 
            icon: Zap, 
            title: "5 Min Setup", 
            desc: "Answer simple prompts about your villas and launch instantly." 
          },
          { 
            icon: Shield, 
            title: "Full Sovereignty", 
            desc: "Keep 100% of your earnings. Direct payouts to your bank." 
          },
          { 
            icon: Globe, 
            title: "Global Presence", 
            desc: "Optimized for global booking pipelines, mobile devices, and SEO." 
          }
        ].map((feature, idx) => (
          <div key={idx} className="card-premium p-6 bg-white border border-border rounded-2xl flex flex-col justify-between hover-lift">
            <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-4 shrink-0">
              <feature.icon size={18} className="stroke-[2px]" />
            </div>
            <div>
              <h4 className="font-extrabold text-primary text-xs uppercase tracking-wider mb-2">{feature.title}</h4>
              <p className="text-[10px] font-medium text-secondary/50 leading-normal">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Initialize / Navigation trigger */}
      <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={() => completeStep("welcome")}
          className="btn btn-primary px-10 py-4.5 rounded-2xl text-xs font-black uppercase tracking-[0.25em] shadow-lg shadow-primary/20 hover:bg-primary-hover flex items-center gap-2 group w-full sm:w-auto text-center justify-center"
        >
          <span>Begin Architecture Setup</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Setup takes less than 5 minutes</span>
      </div>

      {/* Bottom decorative quote block */}
      <div className="pt-16 border-t border-border/50 flex gap-4">
        <Star className="text-warning fill-warning shrink-0" size={20} />
        <p className="text-xs font-bold text-secondary/60 italic leading-relaxed">
          &ldquo;Build your luxury booking experience in minutes. Home4Stay puts hospitality business owners in the driver&apos;s seat of their own financial freedom.&rdquo;
        </p>
      </div>

    </div>
  );
}

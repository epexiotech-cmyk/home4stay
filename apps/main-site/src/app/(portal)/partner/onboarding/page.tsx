"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/ui/Logo";
import { Lock, ArrowRight, ArrowUpRight } from "lucide-react";

export default function OnboardingBasePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect handling
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Authenticated: seamlessly move to welcome step inside the layout
        router.replace("/partner/onboarding/welcome");
      } else {
        // Unauthenticated: redirect to login after a brief visual gate delay
        const timer = setTimeout(() => {
          router.push("/partner/login?redirect=/partner/onboarding");
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, router]);

  // Loading or Redirecting skeleton state
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-6xl mx-auto px-6 py-20 animate-in fade-in duration-500">
      <Logo variant="icon" size="md" link={false} className="justify-center mb-8 opacity-45 animate-pulse" />
      
      {!loading && !user ? (
        // Unauthenticated Gate Screen
        <div className="card-premium p-10 bg-white border border-border shadow-premium rounded-[32px] text-center w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="w-16 h-16 bg-primary/5 text-primary rounded-[22px] flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Lock size={28} className="stroke-[2px]" />
          </div>

          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Security Gateway</h1>
          <p className="mt-4 text-xs font-bold text-secondary/50 uppercase tracking-[0.2em]">Partner Account Required</p>
          
          <p className="mt-6 text-sm text-secondary/70 leading-relaxed font-medium">
            To customize your direct-booking site and access the Home4Stay setup wizard, please sign in or register first.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button 
              onClick={() => router.push("/partner/login?redirect=/partner/onboarding")}
              className="btn btn-primary w-full py-4.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider"
            >
              <span>Sign In to Account</span>
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => router.push("/partner/contact")}
              className="btn btn-secondary w-full py-4.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider"
            >
              <span>Request Access</span>
              <ArrowUpRight size={16} className="text-secondary/60" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-secondary/40 uppercase tracking-widest bg-surface-alt py-3 px-4 rounded-xl border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-warning animate-ping" />
            <span>Redirecting to Login Screen...</span>
          </div>
        </div>
      ) : (
        // Loading / Redirecting to welcome step skeleton
        <div className="w-full max-w-2xl space-y-6 text-center">
          <div className="h-8 bg-primary/10 rounded-2xl w-3/4 mx-auto skeleton-luxury" />
          <div className="h-4 bg-primary/10 rounded-xl w-1/2 mx-auto skeleton-luxury" />
          <div className="h-40 bg-primary/5 rounded-[32px] w-full mt-10 skeleton-luxury" />
          <p className="text-[10px] font-bold text-secondary/35 uppercase tracking-widest animate-pulse mt-4">
            Loading Premium Setup Experience...
          </p>
        </div>
      )}

    </div>
  );
}

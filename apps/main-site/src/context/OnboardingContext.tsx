"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ZodIssue } from "zod";
import { 
  stepSchemas, 
  STEP_TO_DRAFT_MAP, 
  OnboardingDrafts,
  OnboardingStepDrafts
} from "@/lib/onboarding/validation";

export interface OnboardingStep {
  id: string;
  slug: string;
  title: string;
  order: number;
  route: string;
  previousStep?: string;
  nextStep?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: "welcome", slug: "welcome", title: "Welcome", order: 1, route: "/partner/onboarding/welcome", nextStep: "property" },
  { id: "property", slug: "property", title: "Property Identity", order: 2, route: "/partner/onboarding/property", previousStep: "welcome", nextStep: "theme" },
  { id: "theme", slug: "theme", title: "Property Theme", order: 3, route: "/partner/onboarding/theme", previousStep: "property", nextStep: "rooms" },
  { id: "rooms", slug: "rooms", title: "Rooms & Inventory", order: 4, route: "/partner/onboarding/rooms", previousStep: "theme", nextStep: "amenities" },
  { id: "amenities", slug: "amenities", title: "Amenities", order: 5, route: "/partner/onboarding/amenities", previousStep: "rooms", nextStep: "experiences" },
  { id: "experiences", slug: "experiences", title: "Experiences", order: 6, route: "/partner/onboarding/experiences", previousStep: "amenities", nextStep: "gallery" },
  { id: "gallery", slug: "gallery", title: "Media Gallery", order: 7, route: "/partner/onboarding/gallery", previousStep: "experiences", nextStep: "policies" },
  { id: "policies", slug: "policies", title: "Policies & Terms", order: 8, route: "/partner/onboarding/policies", previousStep: "gallery", nextStep: "pricing" },
  { id: "pricing", slug: "pricing", title: "Pricing Engine", order: 9, route: "/partner/onboarding/pricing", previousStep: "policies", nextStep: "launch" },
  { id: "launch", slug: "launch", title: "Launch Readiness", order: 10, route: "/partner/onboarding/launch", previousStep: "pricing" }
];

export type OnboardingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "LIVE";

interface OnboardingContextType {
  steps: OnboardingStep[];
  activeStep: OnboardingStep;
  activeStepIndex: number;
  completedSteps: string[];
  skippedSteps: string[];
  onboardingStatus: OnboardingStatus;
  draftData: OnboardingStepDrafts;
  progressPercentage: number;
  loading: boolean;
  isSaving: boolean;
  isOffline: boolean;
  stepErrors: Record<string, Record<string, string>>;
  
  saveStepDraft: (stepId: string, data: unknown) => Promise<void>;
  completeStep: (stepId: string) => Promise<boolean>;
  skipStep: (stepId: string) => Promise<void>;
  goToStep: (stepId: string) => void;
  syncCurrentStep: (stepId: string) => Promise<void>;
  clearStepErrors: (stepId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Initial empty drafts to prevent runtime corruption errors
const INITIAL_DRAFTS: OnboardingDrafts = {
  propertyIdentity: { title: "", location: "", description: "", slug: "", tagline: "" },
  themeConfig: { themeId: "coastal" },
  roomDrafts: { roomName: "Royal Heritage Suite", price: 12500 },
  amenitySelections: [],
  experienceSelections: [],
  galleryDrafts: [],
  policyConfig: { checkIn: "02:00 PM", checkOut: "11:00 AM", cancellation: "flexible" },
  pricingConfig: { plan: "pro", enableBusinessBilling: false },
  launchConfig: { domain: "" },
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof window !== "undefined" ? !window.navigator.onLine : false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<string[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>("NOT_STARTED");
  const [draftData, setDraftData] = useState<OnboardingDrafts>(INITIAL_DRAFTS);
  const [stepErrors, setStepErrors] = useState<Record<string, Record<string, string>>>({});

  // Derive activeStepId directly from current route path
  const activeStepId = ONBOARDING_STEPS.find(s => s.route === pathname)?.id || "welcome";

  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Stale Save write prevention tokens
  const saveSequence = useRef(0);
  const lastSavedSequence = useRef(0);

  // Flush Offline Local Storage Caches
  const flushOfflineCache = async () => {
    if (typeof window === "undefined") return;
    const cached = localStorage.getItem("home4stay_onboarding_offline_cache");
    if (!cached) return;

    try {
      const { stepId, data } = JSON.parse(cached);
      setIsSaving(true);
      const res = await fetch("/api/partner/onboarding/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, data, currentStep: stepId })
      });
      if (res.ok) {
        localStorage.removeItem("home4stay_onboarding_offline_cache");
      }
    } catch (err) {
      console.error("Failed to flush offline cache back to database:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Sync active step indexes
  const activeStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === activeStepId) !== -1
    ? ONBOARDING_STEPS.findIndex(s => s.id === activeStepId)
    : 0;
  const activeStep = ONBOARDING_STEPS[activeStepIndex];

  // Helper: check if a step's draft is valid based on Zod
  const evaluateStepValidity = (stepId: string, currentDrafts: OnboardingDrafts): boolean => {
    if (stepId === "welcome") return true;
    const schema = stepSchemas[stepId];
    const mappedKey = STEP_TO_DRAFT_MAP[stepId];
    if (!schema || !mappedKey) return true;

    const data = currentDrafts[mappedKey as keyof OnboardingDrafts];
    if (!data) return false;

    return schema.safeParse(data).success;
  };

  // Dynamically calculate completion checklist
  const dynamicCompletedSteps = ONBOARDING_STEPS.filter(step => {
    if (step.id === "welcome") return true;
    return evaluateStepValidity(step.id, draftData) || completedSteps.includes(step.id);
  }).map(s => s.id);

  // Dynamic progress percentage tracking
  const progressPercentage = Math.round(
    ((dynamicCompletedSteps.length + skippedSteps.filter(id => !dynamicCompletedSteps.includes(id)).length) / ONBOARDING_STEPS.length) * 100
  );

  // Enqueue saves to prevent parallel race conditions
  const enqueueSave = (saveAction: () => Promise<unknown>) => {
    saveQueue.current = saveQueue.current.then(saveAction).catch(err => {
      console.error("[SAVE_QUEUE] Error running serialized save:", err);
    });
  };

  // Sync network state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOffline(false);
      flushOfflineCache();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 1. Initial State Hydration on Mount
  useEffect(() => {
    if (authLoading) return;
    
    if (user && user.role !== "owner") {
      router.replace("/partner");
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch("/api/partner/onboarding/session");
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && payload.session) {
            const { status, progress, drafts } = payload.session;
            setOnboardingStatus(status);
            
            const completed: string[] = [];
            const skipped: string[] = [];
            progress.forEach((p: { stepId: string; status: string }) => {
              if (p.status === "COMPLETED") completed.push(p.stepId);
              if (p.status === "SKIPPED") skipped.push(p.stepId);
            });

            setCompletedSteps(completed);
            setSkippedSteps(skipped);

            // Reconstruct normalized draft shape from DB keys
            const normalized: Record<string, unknown> = {};
            Object.keys(STEP_TO_DRAFT_MAP).forEach(sId => {
              const draftKey = STEP_TO_DRAFT_MAP[sId];
              const rawData = drafts[sId];
              if (rawData) {
                const schema = stepSchemas[sId];
                if (schema) {
                  const check = schema.safeParse(rawData);
                  if (check.success) {
                    normalized[draftKey] = check.data;
                  } else {
                    console.warn(`[CORRUPT_RECOVERY] Step ${sId} schema mismatch. Falling back to default.`);
                    normalized[draftKey] = INITIAL_DRAFTS[draftKey as keyof OnboardingDrafts];
                  }
                } else {
                  normalized[draftKey] = rawData;
                }
              } else {
                normalized[draftKey] = INITIAL_DRAFTS[draftKey as keyof OnboardingDrafts];
              }
            });

            // LocalStorage recovery merge
            const localCache = localStorage.getItem("home4stay_onboarding_draft");
            if (localCache) {
              try {
                const parsed = JSON.parse(localCache) as Record<string, unknown>;
                Object.keys(parsed).forEach(k => {
                  const val = parsed[k];
                  if (val && typeof val === "object") {
                    normalized[k] = val;
                  }
                });
              } catch (e) {
                console.error("Failed to parse local draft cache recovery:", e);
              }
            }

            setDraftData(normalized as OnboardingDrafts);
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding session data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [authLoading, user, router]);

  // 2. Route Navigation Guard & Synchronization
  useEffect(() => {
    if (loading || authLoading || !user) return;

    const currentStepConfig = ONBOARDING_STEPS.find(s => s.route === pathname);
    if (currentStepConfig) {
      /*
      // Guard: Ensure preceding steps are completed
      const precedingSteps = ONBOARDING_STEPS.filter(s => s.order < currentStepConfig.order);
      const isAuthorized = precedingSteps.every(
        s => dynamicCompletedSteps.includes(s.id) || skippedSteps.includes(s.id)
      );

      console.log("[OnboardingContext Guard] Path:", pathname, "Preceding:", precedingSteps.map(s => s.id), "dynamicCompletedSteps:", dynamicCompletedSteps, "isAuthorized:", isAuthorized);

      if (!isAuthorized) {
        const firstIncomplete = ONBOARDING_STEPS.find(
          s => !dynamicCompletedSteps.includes(s.id) && !skippedSteps.includes(s.id)
        ) || ONBOARDING_STEPS[0];
        
        console.warn("[OnboardingContext Guard] Redirecting from", pathname, "to first incomplete:", firstIncomplete.route);
        router.replace(firstIncomplete.route);
      }
      */
    }
  }, [pathname, loading, authLoading, user, dynamicCompletedSteps, skippedSteps, router]);
  const saveDraftToDb = async (stepId: string, data: unknown, sequence: number) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/partner/onboarding/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          data,
          currentStep: stepId
        })
      });

      if (res.ok) {
        // Discard stale out-of-order writes
        if (sequence > lastSavedSequence.current) {
          lastSavedSequence.current = sequence;
        }
      } else {
        console.error(`Failed to sync draft for step ${stepId}`);
      }
    } catch (err) {
      console.warn("DB offline. Caching changes locally under offline recovery.", err);
      localStorage.setItem(
        "home4stay_onboarding_offline_cache",
        JSON.stringify({ stepId, data, timestamp: Date.now() })
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to clear error state on typing
  const clearStepErrors = (stepId: string) => {
    setStepErrors(prev => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
  };

  // 4. Debounced Draft Caching & Save Dispatcher
  const saveStepDraft = async (stepId: string, rawStepData: unknown) => {
    const mappedKey = STEP_TO_DRAFT_MAP[stepId];
    if (!mappedKey) return;

    // Local state optimistic update
    const updatedDrafts = {
      ...draftData,
      [mappedKey]: rawStepData
    };
    setDraftData(updatedDrafts);

    // Sync backup locally instantly
    localStorage.setItem("home4stay_onboarding_draft", JSON.stringify(updatedDrafts));

    // Clear runtime typing errors for this field
    clearStepErrors(stepId);

    // Debouncer
    if (debounceTimers.current[stepId]) {
      clearTimeout(debounceTimers.current[stepId]);
    }

    if (isOffline) {
      localStorage.setItem(
        "home4stay_onboarding_offline_cache",
        JSON.stringify({ stepId, data: rawStepData, timestamp: Date.now() })
      );
      return;
    }

    saveSequence.current += 1;
    const currentSeq = saveSequence.current;

    debounceTimers.current[stepId] = setTimeout(() => {
      enqueueSave(() => saveDraftToDb(stepId, rawStepData, currentSeq));
    }, 1500);
  };

  // 5. Complete Step with Validation Guard
  const completeStep = async (stepId: string): Promise<boolean> => {
    console.log("[OnboardingContext] completeStep triggered for:", stepId);
    const mappedKey = STEP_TO_DRAFT_MAP[stepId];
    const dataToValidate = draftData[mappedKey as keyof OnboardingDrafts];
    console.log("[OnboardingContext] dataToValidate:", dataToValidate);
    const schema = stepSchemas[stepId];

    if (schema) {
      const validation = schema.safeParse(dataToValidate);
      if (!validation.success) {
        console.warn("[OnboardingContext] Validation failed for step:", stepId, validation.error.format());
        const errors: Record<string, string> = {};
        validation.error.issues.forEach((issue: ZodIssue) => {
          const path = (issue.path[0] as string) || "general";
          errors[path] = issue.message;
        });
        setStepErrors(prev => ({ ...prev, [stepId]: errors }));
        return false; // BLOCK NAVIGATION
      }
    }

    console.log("[OnboardingContext] Validation passed for step:", stepId);

    if (debounceTimers.current[stepId]) {
      clearTimeout(debounceTimers.current[stepId]);
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/partner/onboarding/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          data: dataToValidate || {},
          status: "COMPLETED",
          currentStep: stepId
        })
      });

      if (res.ok) {
        if (!completedSteps.includes(stepId)) {
          setCompletedSteps(prev => [...prev, stepId]);
        }
        setSkippedSteps(prev => prev.filter(id => id !== stepId));

        // Advance to next step
        const config = ONBOARDING_STEPS.find(s => s.id === stepId);
        if (config && config.nextStep) {
          const nextConfig = ONBOARDING_STEPS.find(s => s.id === config.nextStep);
          if (nextConfig) {
            // Execute second fetch asynchronously without await to avoid blocking transition
            fetch("/api/partner/onboarding/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ currentStep: nextConfig.id })
            }).catch(err => console.error("Failed to sync next step:", err));

            setTimeout(() => {
              router.push(nextConfig.route);
            }, 100);
          }
        }
        return true;
      }
    } catch (err) {
      console.error("Step completion failure:", err);
    } finally {
      setIsSaving(false);
    }
    return false;
  };

  // 6. Skip Step
  const skipStep = async (stepId: string) => {
    const mappedKey = STEP_TO_DRAFT_MAP[stepId];
    const currentData = draftData[mappedKey as keyof OnboardingDrafts] || {};

    if (debounceTimers.current[stepId]) {
      clearTimeout(debounceTimers.current[stepId]);
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/partner/onboarding/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          data: currentData,
          status: "SKIPPED",
          currentStep: stepId
        })
      });

      if (res.ok) {
        if (!skippedSteps.includes(stepId)) {
          setSkippedSteps(prev => [...prev, stepId]);
        }
        setCompletedSteps(prev => prev.filter(id => id !== stepId));

        const config = ONBOARDING_STEPS.find(s => s.id === stepId);
        if (config && config.nextStep) {
          const nextConfig = ONBOARDING_STEPS.find(s => s.id === config.nextStep);
          if (nextConfig) {
            await fetch("/api/partner/onboarding/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ currentStep: nextConfig.id })
            });
            setTimeout(() => {
              router.push(nextConfig.route);
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error("Step skip failure:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // 7. Dynamic Navigation Guard Switcher
  const goToStep = (stepId: string) => {
    const targetStep = ONBOARDING_STEPS.find(s => s.id === stepId);
    if (!targetStep) return;

    const precedingSteps = ONBOARDING_STEPS.filter(s => s.order < targetStep.order);
    const isAccessible = precedingSteps.every(
      s => dynamicCompletedSteps.includes(s.id) || skippedSteps.includes(s.id)
    );

    if (isAccessible) {
      router.push(targetStep.route);
    }
  };

  // 8. Synchronize Current Step State with DB
  const syncCurrentStep = async (stepId: string) => {
    try {
      await fetch("/api/partner/onboarding/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStep: stepId })
      });
    } catch (err) {
      console.error("Failed to sync current step index:", err);
    }
  };

  // Expose normalized data adapter keys mapping backwards
  const backwardCompatibleDraftData: Record<string, unknown> = {};
  Object.keys(STEP_TO_DRAFT_MAP).forEach(sId => {
    const draftKey = STEP_TO_DRAFT_MAP[sId];
    backwardCompatibleDraftData[sId] = draftData[draftKey as keyof OnboardingDrafts] || {};
  });

  // Map the interface keys to the actual draftData keys so the UI bindings work correctly
  const draftDataWithAliases = new Proxy(draftData as unknown as Record<string, unknown>, {
    get(target, prop: string) {
      if (prop === 'property') return target.propertyIdentity;
      if (prop === 'theme') return target.themeConfig;
      if (prop === 'rooms') return target.roomDrafts;
      if (prop === 'amenities') return target.amenitySelections;
      if (prop === 'experiences') return target.experienceSelections;
      if (prop === 'gallery') return target.galleryDrafts;
      if (prop === 'policies') return target.policyConfig;
      if (prop === 'pricing') return target.pricingConfig;
      if (prop === 'launch') return target.launchConfig;
      return target[prop];
    }
  }) as unknown as OnboardingStepDrafts;

  return (
    <OnboardingContext.Provider
      value={{
        steps: ONBOARDING_STEPS,
        activeStep,
        activeStepIndex,
        completedSteps: dynamicCompletedSteps,
        skippedSteps,
        onboardingStatus,
        draftData: draftDataWithAliases,
        progressPercentage,
        loading,
        isSaving,
        isOffline,
        stepErrors,
        saveStepDraft,
        completeStep,
        skipStep,
        goToStep,
        syncCurrentStep,
        clearStepErrors
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

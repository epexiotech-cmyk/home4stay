import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

/**
 * Calculates the Levenshtein edit distance between two strings as a percentage (0% - 100%)
 */
export function calculateEditDistancePercent(original: string, final: string): number {
  if (!original && !final) return 0;
  const origTrim = (original || "").trim();
  const finTrim = (final || "").trim();
  
  if (origTrim === finTrim) return 0;
  if (!origTrim || !finTrim) return 100;

  const m = origTrim.length;
  const n = finTrim.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = origTrim[i - 1] === finTrim[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = d[m][n];
  const maxLength = Math.max(m, n);
  return Number(((distance / maxLength) * 100).toFixed(2));
}

/**
 * Centralized AI Intelligence Service for logging, scoring, and adaptive preferences
 */
export class AiIntelligenceService {
  /**
   * Log an AI Generation request event asynchronously
   */
  static async logGeneration(params: {
    propertyId: string;
    generationType: "PROPERTY_DESCRIPTION" | "TAGLINE" | "SEO_METADATA" | "AMENITIES" | "EXPERIENCES" | "THEME_RECOMMENDATION";
    inputContext: Prisma.InputJsonValue;
    generatedOutput: Prisma.InputJsonValue;
    selectedTheme?: string;
    stepContext?: string;
    durationMs?: number;
  }) {
    try {
      // Async trigger to not block host thread
      const event = await prisma.aiGenerationEvent.create({
        data: {
          propertyId: params.propertyId,
          generationType: params.generationType,
          inputContext: params.inputContext ?? Prisma.JsonNull,
          generatedOutput: params.generatedOutput ?? Prisma.JsonNull,
          selectedTheme: params.selectedTheme || null,
          stepContext: params.stepContext || null,
          generationDuration: params.durationMs || 0,
          accepted: false,
          edited: false,
          regenerated: false,
          editDistance: 0.0
        }
      });

      // Track immediate implicit theme/keyword preferences
      await this.harvestPreferenceSignals(params.propertyId, params.generationType, params.inputContext);

      return event.id;
    } catch (err) {
      console.error("[AI_INTELLIGENCE_SERVICE] Failed to log generation event:", err);
      return null;
    }
  }

  /**
   * Records specific behavioral feedback (accept / edit / reject / regenerate)
   */
  static async recordFeedback(params: {
    propertyId: string;
    eventId?: string;
    generationType?: string;
    action: "accept" | "edit" | "reject" | "regenerate" | "discard";
    savedOutput?: Prisma.InputJsonValue;
  }) {
    try {
      if (params.eventId) {
        // Retrieve original generation parameters
        const event = await prisma.aiGenerationEvent.findFirst({
          where: { id: params.eventId, propertyId: params.propertyId }
        });

        if (!event) return false;

        const isAccepted = params.action === "accept";
        let isEdited = params.action === "edit";
        let distance = 0.0;

        if (params.savedOutput && event.generatedOutput) {
          const originalStr = typeof event.generatedOutput === "string" 
            ? event.generatedOutput 
            : JSON.stringify(event.generatedOutput);
          
          const finalStr = typeof params.savedOutput === "string"
            ? params.savedOutput
            : JSON.stringify(params.savedOutput);

          distance = calculateEditDistancePercent(originalStr, finalStr);
          if (distance > 0) {
            isEdited = true;
          }
        }

        await prisma.aiGenerationEvent.update({
          where: { id: event.id },
          data: {
            accepted: isAccepted || (distance === 0 && params.action !== "reject"),
            edited: isEdited,
            regenerated: params.action === "regenerate",
            finalSavedOutput: params.savedOutput ?? Prisma.DbNull,
            editDistance: distance
          }
        });

        return true;
      }

      return false;
    } catch (err) {
      console.error("[AI_INTELLIGENCE_SERVICE] Failed to record feedback signal:", err);
      return false;
    }
  }

  /**
   * Tracks and increments key preference signals for personalized branding templates
   */
  private static async harvestPreferenceSignals(propertyId: string, type: string, context: Prisma.InputJsonValue) {
    try {
      const signals: { category: string; key: string }[] = [];

      // Derive signals based on property vibe keyword or type context if context is an object
      if (context && typeof context === "object" && !Array.isArray(context)) {
        const obj = context as Record<string, unknown>;
        const vibe = typeof obj.vibeKeywords === "string" ? obj.vibeKeywords.toLowerCase() : "";
        const typeLower = typeof obj.propertyType === "string" ? obj.propertyType.toLowerCase() : "";

        if (vibe.includes("mountain") || typeLower.includes("alpine") || typeLower.includes("cabin")) {
          signals.push({ category: "tone", key: "mountain_wellness_sunrise" });
        }
        if (vibe.includes("beach") || typeLower.includes("coastal") || vibe.includes("sunset")) {
          signals.push({ category: "tone", key: "beach_romantic_sunset" });
        }
        if (typeof obj.themeId === "string" && obj.themeId) {
          signals.push({ category: "theme", key: `theme_${obj.themeId}` });
        }
      }

      // Upsert preference scores transactionally
      await Promise.all(
        signals.map(async (sig) => {
          await prisma.aiPreferenceSignal.upsert({
            where: {
              propertyId_category_signalKey: {
                propertyId,
                category: sig.category,
                signalKey: sig.key
              }
            },
            create: {
              propertyId,
              category: sig.category,
              signalKey: sig.key,
              score: 1.0
            },
            update: {
              score: { increment: 1.0 }
            }
          });
        })
      );
    } catch (err) {
      console.error("[AI_INTELLIGENCE_SERVICE] Preference signal harvesting failed:", err);
    }
  }
}

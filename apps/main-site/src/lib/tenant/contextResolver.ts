import { getProperty } from "@/properties-data";
// import { getPropertyBySlug } from "@/lib/tenant/tenantUtils";
import { prisma } from "@/lib/database/prisma";
import { getSubdomain } from "@/lib/utils/domains";
import { Property as BaselineProperty } from "@/properties-data/types";
import { getPropertyBySlug } from "./tenantUtils";

export interface Section {
  type: string;
  enabled: boolean;
  data?: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    mainHeading?: string;
    highlightText?: string;
    smallLabel?: string;
    [key: string]: unknown;
  };
}

export interface ExtendedProperty extends Partial<BaselineProperty> {
  id?: string;
  status?: string;
  pageContent?: {
    sections?: Section[];
  };
  amenities?: Array<{ icon: string, label: string }>;
  faqs?: Array<{ question: string, answer: string }>;
  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
    petPolicy?: string;
  };
  mealPlans?: any[];
  rating?: number;
  contact?: { phone: string; whatsapp: string };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  offers?: Record<string, unknown>[];
}

/**
 * Resolves the final property configuration by merging baseline static definitions 
 * with the latest persistent CMS data.
 */
export async function resolvePropertyContext(identifier: string): Promise<(ExtendedProperty & { name: string }) | null> {
  if (!identifier) return null;

  const baselineProperty = getProperty(identifier);

  let persistentDbRecord: Record<string, unknown> | null = null;
  try {
    persistentDbRecord = await getPropertyBySlug(identifier) as Record<string, unknown> | null;

    if (!persistentDbRecord) {
      persistentDbRecord = await prisma.property.findUnique({
        where: { id: identifier },
      });
    }
  } catch (err) {
    console.warn("Live DB lookup adapter query mapping fault (falling back to mock):", err instanceof Error ? err.message : "Unknown error");
  }

  const merged = { ...(baselineProperty || {}), ...(persistentDbRecord || {}) } as ExtendedProperty;

  if (!merged || !merged.name) {
    return null;
  }

  if (!merged.name) {
    return null;
  }

  if (!merged.name) {
    return null;
  }
  (baselineProperty as ExtendedProperty | null)?.name ||
    "";

  if (!merged.name) {
    return null;
  }

  return merged as ExtendedProperty & { name: string };
}

/**
 * Derives the strict property identifier from either the Host header subdomain or the URL slug.
 */
export function getPropertyIdentifierFromRequest(host: string, fallbackSlug?: string): string {
  const subdomain = getSubdomain(host);
  if (subdomain && subdomain !== "www") {
    return subdomain;
  }
  return fallbackSlug || "";
}

/**
 * Extracts and sanitizes the property's branding definitions
 */
export function getPropertyBranding(property: ExtendedProperty) {
  const sectionsArray: Section[] = property.pageContent?.sections || [];
  const heroBlock = sectionsArray.find((s: Section) => s.type === "hero" && s.enabled);
  const narrativeBlock = sectionsArray.find((s: Section) => s.type === "narrative" && s.enabled);

  return {
    heroTitle: heroBlock?.data?.title || property.name,
    heroTagline: heroBlock?.data?.subtitle || property.tagline,
    heroBackground: heroBlock?.data?.backgroundImage || (property.images && property.images[0]) || "",
    narrativeHeading: narrativeBlock?.data?.mainHeading || "A sanctuary of",
    narrativeHighlight: narrativeBlock?.data?.highlightText || "timeless luxury.",
    narrativeLabel: narrativeBlock?.data?.smallLabel || "The Narrative",
    themeColor: property.themeColor || "#0E5A75",
    theme: property.theme || {
      primary: property.themeColor || "#0E5A75",
      secondary: "#0983B0",
      accent: "#159665"
    },
    contact: property.contact || { phone: "", whatsapp: "" },
    owner: property.owner || null,
    offers: property.offers || [],
    seo: property.seo || {
      title: property.name,
      description: property.tagline,
      keywords: [],
      ogImage: (property.images && property.images[0]) || ""
    }
  };
}

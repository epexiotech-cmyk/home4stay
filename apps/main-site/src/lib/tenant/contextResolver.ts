import { getProperty } from "@/properties-data";
// import { getPropertyBySlug } from "@/lib/tenant/tenantUtils";
import { prisma } from "@/lib/database/prisma";
import { getSubdomain } from "@/lib/utils/domains";
import { Property as BaselineProperty } from "@/properties-data/types";
import { getPropertyBySlug } from "./tenantUtils";
import { PropertyPolicy, PropertySection, PropertyPageContent } from "@prisma/client";

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
  experiences?: any[];
}

/**
 * Resolves the final property configuration by merging baseline static definitions 
 * with the latest persistent CMS data.
 */
import { verifyToken } from "@/lib/auth/jwt";

export async function resolvePropertyContext(identifier: string, draftToken?: string): Promise<(ExtendedProperty & { name: string }) | null> {
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
  
  // Phase 2C Override: Ensure rooms and amenities are strictly DB-driven
  if (persistentDbRecord) {
    // Phase 2E Override: Ensure gallery and images are strictly DB-driven
    if (persistentDbRecord.mediaAssets && Array.isArray(persistentDbRecord.mediaAssets)) {
      merged.images = persistentDbRecord.mediaAssets.map((m: any) => m.url);
      merged.gallery = persistentDbRecord.mediaAssets.map((m: any) => ({
        url: m.url,
        category: m.tags || "Exterior",
        description: m.fileName || "Property Image"
      }));
    } else {
      merged.images = [];
      merged.gallery = [];
    }
    if (persistentDbRecord.amenities && Array.isArray(persistentDbRecord.amenities)) {
      merged.amenities = persistentDbRecord.amenities.map((a: any) => ({
        icon: a.category || "Sparkles",
        label: a.name || a.label || "",
        detail: "Included Feature"
      }));
    } else {
      merged.amenities = [];
    }
    

    if (persistentDbRecord.experiences && Array.isArray(persistentDbRecord.experiences)) {
      merged.experiences = persistentDbRecord.experiences.filter((e: any) => e.isActive);
    } else {
      merged.experiences = [];
    }

    // The public site expects 'rooms' array? We'll leave persistentDbRecord.rooms intact.
    if (persistentDbRecord.rooms && Array.isArray(persistentDbRecord.rooms)) {
      merged.rooms = persistentDbRecord.rooms;
    } else {
      merged.rooms = [];
    }


    if (persistentDbRecord.policies) {
      const p = persistentDbRecord.policies as PropertyPolicy;
      merged.policies = {
        checkIn: p.checkInTime || "",
        checkOut: p.checkOutTime || "",
        cancellation: p.cancellationPolicy || "",
        petPolicy: p.houseRules || (p.petsAllowed ? "Pets Allowed" : "Pets Not Allowed")
      };
    } else {
      merged.policies = undefined;
    }


    let isAuthorizedPreview = false;
    if (draftToken && persistentDbRecord && persistentDbRecord.id) {
      const payload = await verifyToken(draftToken);
      if (payload && payload.preview === true && payload.propertyId === persistentDbRecord.id) {
        isAuthorizedPreview = true;
      }
    }

    let activePageContent: (PropertyPageContent & { sections: PropertySection[] }) | undefined = undefined;

    if (persistentDbRecord.pageContent) {
      if (isAuthorizedPreview) {
        activePageContent = persistentDbRecord.pageContent as PropertyPageContent & { sections: PropertySection[] };
      } else {
        const pc = persistentDbRecord.pageContent as PropertyPageContent;
        if (pc.publishedVersionId) {
          const publishedVersion = await prisma.cmsVersion.findUnique({
            where: { id: pc.publishedVersionId }
          });
          if (publishedVersion && publishedVersion.snapshot) {
            // Validate and cast snapshot safely without 'any' or 'unknown'
            const snap = publishedVersion.snapshot as { sections?: PropertySection[], themeVariant?: string };
            activePageContent = {
               ...pc,
               themeVariant: snap.themeVariant || pc.themeVariant,
               sections: Array.isArray(snap.sections) ? snap.sections : []
            } as PropertyPageContent & { sections: PropertySection[] };
          }
        }
      }
    }

    if (activePageContent) {
      const pageContent = activePageContent;

      if (pageContent.sections) {
        const sections = pageContent.sections;
        const faqSection = sections.find((s) => s.type === "faq" && s.enabled);
        if (faqSection && faqSection.data && typeof faqSection.data === 'object' && !Array.isArray(faqSection.data)) {
          const faqData = faqSection.data as { faqs?: { question: string; answer: string }[] };
          if (faqData && Array.isArray(faqData.faqs)) {
            merged.faqs = faqData.faqs;
          } else {
            merged.faqs = [];
          }
        } else {
          merged.faqs = [];
        }
      } else {
        merged.faqs = [];
      }
    } else {
      merged.faqs = [];
    }
  }

  if (merged && !merged.name && (merged as any).title) { merged.name = (merged as any).title; }

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

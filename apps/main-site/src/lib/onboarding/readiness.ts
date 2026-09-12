import { prisma } from "../database/prisma";

export interface LaunchReadinessReport {
  isReady: boolean;
  launchScore: number; // 0 - 100
  blockingIssues: string[];
  warnings: string[];
  improvements: string[];
  criteria: {
    propertyIdentity: boolean;
    themeSelected: boolean;
    heroUploaded: boolean;
    roomsConfigured: boolean;
    pricingConfigured: boolean;
    policiesConfigured: boolean;
    amenitiesSelected: boolean;
    contactConfigured: boolean;
    seoConfigured: boolean;
    galleryUploaded: boolean;
  };
}

export class LaunchReadinessService {
  /**
   * Assesses setup completeness, compiles issues, and computes the launch readiness report
   */
  static async evaluateReadiness(propertyId: string): Promise<LaunchReadinessReport> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: true,
        rooms: true,
        mediaAssets: { where: { NOT: { tags: { contains: "room_id:" } } } },
        experiences: true,
        onboardingSession: {
          include: {
            drafts: true
          }
        }
      }
    });

    if (!property) {
      throw new Error(`Property with ID ${propertyId} not found`);
    }

    const drafts = property.onboardingSession?.drafts || [];
    
    // 1. Resolve draft steps
    const propertyDraft = drafts.find(d => d.stepId === "property")?.data as any || {};
    const themeDraft = drafts.find(d => d.stepId === "theme")?.data as any || {};
    const amenitiesDraft = drafts.find(d => d.stepId === "amenities")?.data as any || [];
    const policiesDraft = drafts.find(d => d.stepId === "policies")?.data as any || {};
    const pricingDraft = drafts.find(d => d.stepId === "pricing")?.data as any || {};
    const launchDraft = drafts.find(d => d.stepId === "launch")?.data as any || {};
    const roomsDraftRaw = drafts.find(d => d.stepId === "rooms")?.data;
    const roomsDraft = (roomsDraftRaw && typeof roomsDraftRaw === "object") ? roomsDraftRaw as { roomName?: string, price?: string | number } : {};

    // 2. Validate individual criteria
    const propertyIdentity = !!(propertyDraft.title?.trim() && propertyDraft.description?.trim());
    const themeSelected = !!themeDraft.themeId;
    
    // Hero image check: assetType === "HERO" or tags include "Hero" or simply the first asset
    const heroUploaded = property.mediaAssets.some(m => m.assetType === "HERO" || m.tags?.toLowerCase().includes("hero")) || property.mediaAssets.length > 0;
    
    // Rooms check: at least 1 active room in the DB or in drafts
    const hasValidRoomDraft = 
      typeof roomsDraft.roomName === "string" && roomsDraft.roomName.trim() !== "" &&
      !isNaN(Number(roomsDraft.price)) && Number(roomsDraft.price) > 0;
    const roomsConfigured = property.rooms.length > 0 || hasValidRoomDraft;
    
    // Pricing check: pricing plan or active rules configured
    const pricingConfigured = !!(pricingDraft.plan || pricingDraft.price || property.rooms.some(r => r.price > 0));
    
    // Policies check: checkIn, checkOut, and cancellation exist
    const policiesConfigured = !!(policiesDraft.checkIn && policiesDraft.checkOut && policiesDraft.cancellation);
    
    // Amenities check: at least 1 checked amenity
    const amenitiesSelected = amenitiesDraft.length > 0;
    
    // Contact information check
    const contactConfigured = !!(propertyDraft.phone || property.owner?.phone || propertyDraft.whatsapp || property.owner?.email);
    
    // SEO check: title & description
    const seoConfigured = !!(launchDraft.metaTitle?.trim() && launchDraft.metaDescription?.trim());
    
    // Gallery check: minimum 3 media files
    const galleryUploaded = property.mediaAssets.length >= 3;

    // 3. Compute dynamic weighted readiness score
    let score = 0;
    if (propertyIdentity) score += 10;
    if (themeSelected) score += 10;
    if (heroUploaded) score += 10;
    if (roomsConfigured) score += 15;
    if (pricingConfigured) score += 10;
    if (policiesConfigured) score += 10;
    if (amenitiesSelected) score += 10;
    if (contactConfigured) score += 10;
    if (seoConfigured) score += 10;
    if (galleryUploaded) score += 5;

    // 4. Compile issues and warnings
    const blockingIssues: string[] = [];
    const warnings: string[] = [];
    const improvements: string[] = [];

    // Blocking issues prevent launching public pages
    if (!propertyDraft.title?.trim()) {
      blockingIssues.push("Property Brand Name is missing. Please define a name for your hospitality site.");
    }
    if (!propertyDraft.description?.trim()) {
      blockingIssues.push("Property Narrative Description is missing. Write or generate a narrative to share your stay experience.");
    }
    if (!roomsConfigured) {
      blockingIssues.push("No Active Rooms configured. You must list at least one suite/room with pricing to accept bookings.");
    }
    if (!heroUploaded) {
      blockingIssues.push("Hero Background Image is missing. Upload at least one cover photo to elevate your guest's first impression.");
    }
    if (!pricingConfigured) {
      blockingIssues.push("Base pricing rates have not been defined for your suites.");
    }
    if (!contactConfigured) {
      blockingIssues.push("Contact Phone or Email is missing. Guests must have a way to coordinate arrival details.");
    }

    // Warnings are non-blocking recommendations
    if (!themeSelected) {
      warnings.push("No aesthetic preset applied. Defaulting to Coastal Sands.");
    }
    if (!policiesConfigured) {
      warnings.push("Standard arrival/departure rules are not fully filled. Defaulting to Check-in 02:00 PM, Check-out 11:00 AM.");
    }
    if (!amenitiesSelected) {
      warnings.push("No Signature Amenities checked. Highlight premium offerings (like Wi-Fi, pool) to attract luxury bookings.");
    }
    if (!seoConfigured) {
      warnings.push("SEO Search Engine tags are missing. Standard meta tags will be dynamically generated, but custom tags are recommended.");
    }
    if (!galleryUploaded) {
      warnings.push(`Your media gallery has only ${property.mediaAssets.length} image(s). Upload at least 3 high-res photos for premium visual layout.`);
    }

    // Improvements represent optional premium recommendations
    if (property.experiences.length === 0) {
      improvements.push("Incorporate Curated Local Experiences (e.g. sunrise ridge trek) to upsell guest concierge offerings.");
    }
    if (!propertyDraft.tagline?.trim()) {
      improvements.push("Add a curated AI tagline banner to make your home page banner float and stand out.");
    }

    const isReady = blockingIssues.length === 0;

    return {
      isReady,
      launchScore: score,
      blockingIssues,
      warnings,
      improvements,
      criteria: {
        propertyIdentity,
        themeSelected,
        heroUploaded,
        roomsConfigured,
        pricingConfigured,
        policiesConfigured,
        amenitiesSelected,
        contactConfigured,
        seoConfigured,
        galleryUploaded
      }
    };
  }
}

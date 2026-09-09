import { propertyCmsRepository } from '../repositories/propertyCmsRepository';
import { PartnerRepository } from "@/lib/repositories/partnerRepository";
import { AppError } from "@/lib/errors/handler";
import { LaunchReadinessService } from "@/lib/onboarding/readiness";
import { prisma } from "@/lib/database/prisma";
import { AiIntelligenceService } from "@/lib/ai/intelligence";

const VALID_STEPS = [
  "welcome", "property", "theme", "rooms", "amenities",
  "experiences", "gallery", "policies", "pricing", "launch"
];

export class PartnerService {
  static async getOnboardingSession(propertyId: string) {
    if (!propertyId) {
      throw new AppError("Conflict: No active property profile mapped to account", 409, "CONFLICT");
    }

    let session = await PartnerRepository.getOnboardingSessionByPropertyId(propertyId);

    if (!session) {
      session = await PartnerRepository.createOnboardingSession({
        propertyId,
        status: "NOT_STARTED",
        currentStep: "welcome"
      });
    }

    const draftsMap: Record<string, unknown> = {};
    session.drafts.forEach((draft: any) => {
      draftsMap[draft.stepId] = draft.data;
    });

    // --- INTEGRATE CANONICAL DB RECORDS AS SOURCE OF TRUTH OVER DRAFTS ---
    const canonicalProperty = await prisma.property.findUnique({ where: { id: propertyId } });
    const canonicalPolicy = await prisma.propertyPolicy.findUnique({ where: { id: propertyId } });
    const canonicalAmenities = await prisma.propertyAmenity.findMany({ where: { propertyId } });
    const pageContent = await propertyCmsRepository.getPageContentWithSections(propertyId);
    
    // 1. Identity & Narrative
    if (canonicalProperty && canonicalProperty.title) {
       const existingIdentity = (draftsMap["property"] as any) || {};
       draftsMap["property"] = {
         ...existingIdentity,
         title: canonicalProperty.title
       };
    }
    
    // 2. Theme
    if (pageContent?.pageContent?.themeVariant) {
       draftsMap["theme"] = { themeId: pageContent.pageContent.themeVariant };
    }
    
    // 3. Amenities
    if (canonicalAmenities && canonicalAmenities.length > 0) {
       draftsMap["amenities"] = canonicalAmenities.map(a => a.name);
    }
    
    // 4. Policies
    if (canonicalPolicy) {
       const existingPolicy = (draftsMap["policies"] as any) || {};
       draftsMap["policies"] = {
         ...existingPolicy,
         checkIn: canonicalPolicy.checkInTime || existingPolicy.checkIn,
         checkOut: canonicalPolicy.checkOutTime || existingPolicy.checkOut,
         cancellation: canonicalPolicy.cancellationPolicy || existingPolicy.cancellation,
         petPolicy: canonicalPolicy.houseRules || (canonicalPolicy.petsAllowed ? "Pets Allowed" : "Pets Not Allowed")
       };
    }
    // -----------------------------------------------------------------


    return {
      id: session.id,
      propertyId: session.propertyId,
      status: session.status,
      currentStep: session.currentStep,
      progress: session.progress.map((p: any) => ({
        stepId: p.stepId,
        status: p.status,
        completedAt: p.completedAt
      })),
      drafts: draftsMap
    };
  }

  static async updateOnboardingSession(propertyId: string, payload: { stepId?: string; data?: any; status?: string; currentStep?: string }) {
    if (!propertyId) {
      throw new AppError("Conflict: No active property profile mapped to account", 409, "CONFLICT");
    }

    const { stepId, data, status, currentStep } = payload;

    if (stepId && !VALID_STEPS.includes(stepId)) {
      throw new AppError(`Invalid stepId: ${stepId} is outside wizard scope`, 400, "BAD_REQUEST");
    }

    let session = await PartnerRepository.getOnboardingSessionByPropertyId(propertyId);

    if (!session) {
      session = await PartnerRepository.createOnboardingSession({
        propertyId,
        status: "IN_PROGRESS",
        currentStep: currentStep || stepId || "welcome"
      });
    }

    if (stepId && data !== undefined) {
      await PartnerRepository.upsertWizardDraft(session.id, stepId, data);
    }

    if (stepId && status) {
      await PartnerRepository.upsertPropertySetupProgress(session.id, stepId, status);
    }

    const nextStatus = status === "COMPLETED" ? (stepId === "launch" ? "COMPLETED" : (session.status === "NOT_STARTED" ? "IN_PROGRESS" : undefined)) : undefined;
    
    if (nextStatus || currentStep) {
      await PartnerRepository.updateOnboardingSessionStatus(
        propertyId, 
        nextStatus || session.status, 
        currentStep || session.currentStep
      );
    }

    return { success: true };
  }

  static async getLaunchReadiness(propertyId: string) {
    if (!propertyId) {
      throw new AppError("Conflict: No active property profile mapped to account", 409, "CONFLICT");
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      throw new AppError("Property not found", 404, "NOT_FOUND");
    }

    const report = await LaunchReadinessService.evaluateReadiness(propertyId);
    
    return {
      report,
      slug: property.slug
    };
  }

  static async launchProperty(propertyId: string, userId: string) {
    if (!propertyId) {
      throw new AppError("Conflict: No active property profile mapped to account", 409, "CONFLICT");
    }

    const report = await LaunchReadinessService.evaluateReadiness(propertyId);
    if (!report.isReady) {
      throw new AppError(`Launch blocked: Your property setup has outstanding blocking issues. ${report.blockingIssues.join(", ")}`, 400, "BAD_REQUEST");
    }

    const session = await PartnerRepository.getOnboardingSessionByPropertyId(propertyId);

    if (!session) {
      throw new AppError("No active onboarding session found", 404, "NOT_FOUND");
    }

    const propertyDraft = (session.drafts.find((d: any) => d.stepId === "property")?.data as { title?: string } | null) || {};
    const pricingDraft = (session.drafts.find((d: any) => d.stepId === "pricing")?.data as {
      enableBusinessBilling?: boolean;
      legalBusinessName?: string;
      gstin?: string;
      billingAddress?: string;
      billingState?: string;
      billingPincode?: string;
      billingContact?: string;
    } | null) || {};

    await PartnerRepository.launchPropertyTransaction(propertyId, session.id, userId, propertyDraft, pricingDraft);

    return { success: true };
  }

  static async getCalendar(propertyId: string) {
    if (!propertyId) throw new AppError("Missing propertyId parameter", 400, "BAD_REQUEST");

    const dbRooms = await prisma.room.findMany({
      where: { propertyId, isActive: true }
    });

    const roomGroups = dbRooms.map((r: any, index: number) => ({
      name: r.name,
      rooms: Array.from({ length: r.roomCount || 1 }).map((_, i) => ({
        id: `${r.id}-unit-${i + 1}`,
        name: `${r.name} Unit ${i + 1}`,
        type: r.view,
        status: "clean"
      }))
    }));

    const dbBookings = await prisma.booking.findMany({
      where: { 
        propertyId,
        status: { notIn: ['CANCELLED', 'REJECTED', 'EXPIRED'] }
      },
      include: {
        guests: {
          where: { isPrimaryGuest: true },
          include: { guest: true }
        }
      }
    });

    const unitAssignments: Record<string, any[]> = {};
    const dbReservations = dbBookings.map((b: any) => {
      const primaryGuestNode = b.guests[0]?.guest;
      
      if (!unitAssignments[b.roomId]) unitAssignments[b.roomId] = [];
      const room = dbRooms.find((r: any) => r.id === b.roomId);
      const roomCount = room?.roomCount || 1;
      
      let assignedUnitId = `${b.roomId}-unit-1`;
      for (let i = 1; i <= roomCount; i++) {
        const candidateUnitId = `${b.roomId}-unit-${i}`;
        const overlapping = unitAssignments[b.roomId].some(res => {
          if (res.unitId !== candidateUnitId) return false;
          return (b.startDate < res.endDate && b.endDate > res.startDate);
        });
        if (!overlapping) {
          assignedUnitId = candidateUnitId;
          break;
        }
      }
      unitAssignments[b.roomId].push({ unitId: assignedUnitId, startDate: b.startDate, endDate: b.endDate });

      return {
        id: b.id,
        guestName: primaryGuestNode?.fullName || "Database Guest",
        roomId: assignedUnitId,
        originalRoomId: b.roomId,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status.toLowerCase(),
        kycStatus: primaryGuestNode?.kycStatus || "PENDING",
        source: b.source,
        mealPlan: b.mealPlan,
        paymentStatus: b.paymentStatus.toLowerCase(),
        occupancy: { adults: 2, children: 0 },
        amount: b.amount,
        primaryGuest: primaryGuestNode ? {
          id: primaryGuestNode.id,
          fullName: primaryGuestNode.fullName,
          mobile: primaryGuestNode.mobile,
          email: primaryGuestNode.email || undefined,
          nationality: primaryGuestNode.nationality,
          kycStatus: primaryGuestNode.kycStatus,
          aadhaarVerified: primaryGuestNode.aadhaarVerified,
          address: {
            line1: primaryGuestNode.addressLine1 || "",
            city: primaryGuestNode.city || "",
            state: primaryGuestNode.state || "",
            pincode: primaryGuestNode.pincode || "",
            country: primaryGuestNode.country || ""
          }
        } : undefined
      };
    });

    return { roomGroups, reservations: dbReservations };
  }

  static async getRooms(propertyId: string) {
    if (!propertyId) throw new AppError("Missing propertyId parameter", 400, "BAD_REQUEST");

    const dbRooms = await prisma.room.findMany({
      where: { propertyId, isActive: true },
      orderBy: { createdAt: "asc" }
    });

    return dbRooms;
  }

  static async getReferrals(userId: string) {
    const { ReferralService } = await import("@/lib/referral/referralService");
    const profile = await ReferralService.getOrCreateProfile(userId);

    const referralEvents = await prisma.referralEvent.findMany({
      where: { referrerUserId: userId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const ledgerEntries = await prisma.referralCreditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const redemptions = await prisma.referralRewardRedemption.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      profile: {
        referralCode: profile.referralCode,
        totalCredits: profile.totalCredits,
        lifetimeCredits: profile.lifetimeCredits,
        pendingCredits: profile.pendingCredits,
        redeemedCredits: profile.redeemedCredits,
        createdAt: profile.createdAt,
      },
      events: referralEvents.map((evt: any) => ({
        id: evt.id,
        referredUser: {
          name: evt.referred.name || "Registered Partner",
          email: evt.referred.email,
        },
        status: evt.status,
        creditsAwarded: evt.creditsAwarded,
        awardedAt: evt.awardedAt,
        createdAt: evt.createdAt,
      })),
      ledger: ledgerEntries.map((l: any) => ({
        id: l.id,
        eventType: l.eventType,
        credits: l.credits,
        balanceAfter: l.balanceAfter,
        notes: l.notes,
        createdAt: l.createdAt,
      })),
      redemptions: redemptions.map((r: any) => ({
        id: r.id,
        creditsUsed: r.creditsUsed,
        rewardType: r.rewardType,
        discountAmount: r.discountAmount,
        billingCycle: r.billingCycle,
        createdAt: r.createdAt,
      })),
    };
  }

  static async handleAiAction(propertyId: string, action: string, context: any) {
    if (!action) throw new AppError("Missing action parameter", 400, "BAD_REQUEST");

    if (action === "RECORD_FEEDBACK") {
      const { eventId, feedbackAction, savedOutput } = context;
      if (!eventId || !feedbackAction) {
        throw new AppError("Missing required feedback parameters", 400, "BAD_REQUEST");
      }

      await AiIntelligenceService.recordFeedback({
        propertyId,
        eventId,
        action: feedbackAction,
        savedOutput
      });

      return { success: true, message: "Feedback logged securely" };
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    const typeLower = (context.propertyType || "").toLowerCase();
    const vibeLower = (context.vibeKeywords || "").toLowerCase();
    const location = context.location || "Scenic Location";

    let category: "alpine" | "coastal" | "jungle" | "heritage" | "generic" = "generic";

    if (typeLower.includes("alpine") || typeLower.includes("cabin") || typeLower.includes("lodge") || typeLower.includes("mountain") || vibeLower.includes("mountain") || vibeLower.includes("snow")) {
      category = "alpine";
    } else if (typeLower.includes("beach") || typeLower.includes("coastal") || typeLower.includes("sea") || typeLower.includes("island") || typeLower.includes("ocean") || vibeLower.includes("beach") || vibeLower.includes("ocean")) {
      category = "coastal";
    } else if (typeLower.includes("jungle") || typeLower.includes("forest") || typeLower.includes("treehouse") || typeLower.includes("eco") || vibeLower.includes("jungle") || vibeLower.includes("nature")) {
      category = "jungle";
    } else if (typeLower.includes("heritage") || typeLower.includes("palace") || typeLower.includes("haveli") || typeLower.includes("castle") || typeLower.includes("royal") || vibeLower.includes("heritage") || vibeLower.includes("royal")) {
      category = "heritage";
    }

    if (action === "GENERATE_DESCRIPTION") {
      let tagline = "Refined luxury for the conscious traveler.";
      let description = "Designed for premium modern living, this luxury boutique sanctuary represents the absolute pinnacle of high-end stay experiences. Fusing natural stone elements with minimalist contemporary design, it hosts curated amenities, custom interior lounges, and scenic sun decks to guarantee an unforgettable booking-focused Direct Stay.";

      if (category === "alpine") {
        tagline = "Where mountain serenity meets luxury hospitality.";
        description = `Perched above the pine tree line in ${location} where organic serenity meets contemporary design, this alpine sanctuary is a private architectural masterpiece. Crafted with raw local timbers and massive glass expanses, the lodge opens to breathtaking peak panoramas. Featuring cozy wood-burning fireplaces, a private heated sun deck, and bespoke butler service, it represents the absolute pinnacle of luxury mountain living.`;
      } else if (category === "coastal") {
        tagline = "Wake up above the azure tide.";
        description = `Designed in fluid harmony with the surrounding sea breeze and golden sands of ${location}, this premium coastal sanctuary offers an unparalleled oceanside escape. High ceiling glass sliders merge organic light wood interiors with sprawling panoramic terrace views. Equipped with a private sunset infinity pool, a curated farm-to-table dining workspace, and private beach access, it delivers a state-of-the-art beach resort experience.`;
      } else if (category === "jungle") {
        tagline = "Eco-luxury under the green canopy.";
        description = `Tucked inside a pristine wilderness reserve in ${location}, this treehouse retreat represents the absolute state-of-the-art in sustainable luxury. Constructed with sustainable local hardwoods, it floats elegant residences above the forest canopy. Complete with outdoor natural rock hot tubs, guided morning yoga decks, and organic estate-grown chef service, it invites you to completely reconnect in five-star wilderness seclusion.`;
      } else if (category === "heritage") {
        tagline = "Timeless grandeur, imperial hospitality.";
        description = `Welcome to an imperial palace sanctuary in ${location} where historical colonial design and grand royal legacies merge. Featuring massive hand-carved pillars, ornate sandstone arches, and majestic courtyard fountains, the property has been preserved with modern five-star boutique comforts. Serving signature royal banquets and 24/7 personalized butler hospitality, it provides a royal retreat for discerning luxury travellers.`;
      }

      return {
        success: true,
        tagline,
        description
      };
    }

    if (action === "RECOMMEND_THEME") {
      let recommendedThemeId = "coastal";
      let reason = "The Coastal Sands preset uses deep oceanic blues (#0983B0, #0E5A75) and breezy typography perfectly suited for spacious layouts.";

      if (category === "alpine") {
        recommendedThemeId = "alpine";
        reason = "The Alpine Snow preset integrates cool, crisp pine accents and bold slate headings, reflecting the raw organic stone elements and mountain textures of your retreat.";
      } else if (category === "jungle") {
        recommendedThemeId = "jungle";
        reason = "The Forest Canopy preset leverages rich earthy tones and subtle olive highlights to echo the sustainable wilderness luxury of your estate.";
      } else if (category === "heritage") {
        recommendedThemeId = "heritage";
        reason = "The Royal Palace preset employs elegant serif fonts and warm sandstone golds to mirror the majestic imperial architecture of your property.";
      }

      return {
        success: true,
        recommendedThemeId,
        reason,
        vibeAnalysis: `Identified dominant category: ${category}`
      };
    }
    
    if (action === "SUGGEST_AMENITIES") {
      let amenities = ["High-Speed WiFi", "Air Conditioning", "Ensuite Bathroom", "Smart TV", "Mini Fridge"];

      if (category === "alpine") {
        amenities = ["Wood-burning Fireplace", "Heated Floors", "Ski Storage", "Outdoor Hot Tub", "Espresso Machine"];
      } else if (category === "coastal") {
        amenities = ["Infinity Pool", "Private Beach Access", "Outdoor Shower", "Sun Loungers", "Surfboard Storage"];
      } else if (category === "jungle") {
        amenities = ["Organic Mosquito Nets", "Hammock Deck", "Rain Shower", "Binoculars & Wildlife Guide", "Eco-friendly Toiletries"];
      } else if (category === "heritage") {
        amenities = ["Antique Four-Poster Bed", "Clawfoot Bathtub", "Courtyard Access", "Butler Service", "Heritage Welcome Kit"];
      }

      return { success: true, amenities };
    }

    if (action === "SUGGEST_EXPERIENCES") {
      let experiences = [
        { title: "Local Culinary Tour", timing: "Afternoon" },
        { title: "Wellness & Spa Day", timing: "Morning" }
      ];

      if (category === "alpine") {
        experiences = [
          { title: "Guided Snowshoeing Trail", timing: "Morning" },
          { title: "Fireside Wine Tasting", timing: "Evening" }
        ];
      } else if (category === "coastal") {
        experiences = [
          { title: "Sunrise Paddleboarding", timing: "Morning" },
          { title: "Private Beach Dinner", timing: "Evening" }
        ];
      } else if (category === "jungle") {
        experiences = [
          { title: "Canopy Bird Watching", timing: "Early Morning" },
          { title: "Night Safari Walk", timing: "Night" }
        ];
      } else if (category === "heritage") {
        experiences = [
          { title: "Royal Architecture Tour", timing: "Morning" },
          { title: "Classical Music & Cultural Dinner", timing: "Evening" }
        ];
      }

      return { success: true, experiences };
    }


    throw new AppError("Unsupported action requested", 400, "BAD_REQUEST");
  }
}

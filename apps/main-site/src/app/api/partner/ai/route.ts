import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { AiIntelligenceService } from "@/lib/ai/intelligence";

/**
 * POST /api/partner/ai
 * Centralized hospitality assistant dispatcher & intelligence logger
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId || !auth.propertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, context = {} } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    // 1. Handle Behavioral Feedback Logging Action
    if (action === "RECORD_FEEDBACK") {
      const { eventId, feedbackAction, savedOutput } = context;
      if (!eventId || !feedbackAction) {
        return NextResponse.json({ error: "Missing required feedback parameters" }, { status: 400 });
      }

      await AiIntelligenceService.recordFeedback({
        propertyId: auth.propertyId,
        eventId,
        action: feedbackAction,
        savedOutput
      });

      return NextResponse.json({ success: true, message: "Feedback logged securely" });
    }

    // Measure duration of simulated branding consultant thinking loop
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Resolve Property Type Vibe Category
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

    let responseJson: Record<string, string | boolean | string[] | { timing: string; title: string; }[]> = { success: true };
    let generationType: "PROPERTY_DESCRIPTION" | "TAGLINE" | "SEO_METADATA" | "AMENITIES" | "EXPERIENCES" | "THEME_RECOMMENDATION" = "PROPERTY_DESCRIPTION";

    switch (action) {
      case "GENERATE_DESCRIPTION": {
        generationType = "PROPERTY_DESCRIPTION";
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

        responseJson = {
          success: true,
          tagline,
          description
        };
        break;
      }

      case "RECOMMEND_THEME": {
        generationType = "THEME_RECOMMENDATION";
        let recommendedThemeId = "coastal";
        let reason = "The Coastal Sands preset uses deep oceanic blues (#0983B0, #0E5A75) and breezy typography perfectly suited for spacious layouts.";

        if (category === "alpine") {
          recommendedThemeId = "alpine";
          reason = "The Alpine Snow preset integrates cool, crisp pine accents and bold slate headings, reflecting the raw organic stone elements and mountain textures of your retreat.";
        } else if (category === "jungle") {
          recommendedThemeId = "jungle";
          reason = "The Jungle Escape preset hosts vibrant organic greens (#159665) and soft earth tones, mirroring the canopy vibe and natural sanctuary aesthetics of your retreat.";
        } else if (category === "heritage") {
          recommendedThemeId = "heritage";
          reason = "The Heritage Luxury preset incorporates warm imperial golds (#FCBC43) and regal vermilions, amplifying the sandstone arches, antique grandeur, and royal story of your palace.";
        }

        responseJson = {
          success: true,
          themeId: recommendedThemeId,
          reason
        };
        break;
      }

      case "SUGGEST_AMENITIES": {
        generationType = "AMENITIES";
        const themeId = context.themeId || "coastal";
        let amenities = [
          "Private Sunset Infinity Pool",
          "Dedicated 24/7 Butler Service",
          "High-Speed Fiber Wi-Fi",
          "Organic Farm-to-Table Breakfast"
        ];

        if (themeId === "alpine") {
          amenities = [
            "Cozy Wood-Burning Fireplace",
            "Heated Outdoor Sunrise Deck",
            "Wellness Sauna & Hot Tub",
            "Bespoke Mountain Trek Gear"
          ];
        } else if (themeId === "jungle") {
          amenities = [
            "Canopy Yoga & Meditation Shala",
            "Natural Rock Rainfall Bath",
            "Organic Farm-to-Table Breakfast",
            "Guided Wilderness Trek Guides"
          ];
        } else if (themeId === "heritage") {
          amenities = [
            "Authentic Palace Courtyard Banqueting",
            "Bespoke Royal Chariot Tours",
            "Ayurvedic Spa & Massage Salon",
            "Personalized 24/7 Butler Service"
          ];
        }

        responseJson = {
          success: true,
          amenities
        };
        break;
      }

      case "RECOMMEND_EXPERIENCES": {
        generationType = "EXPERIENCES";
        const themeId = context.themeId || "coastal";
        let experiences = [
          { timing: "Late Afternoon", title: "Sunset Catamaran Sailing & Champagne" },
          { timing: "Lunch Hours", title: "Private Beachside Seafood Barbecue" }
        ];

        if (themeId === "alpine") {
          experiences = [
            { timing: "Evening Session", title: "Pine Forest Stargazing & Campfire Lodge" },
            { timing: "Morning Session", title: "Sunrise Mountain Ridge Guided Photography Trek" }
          ];
        } else if (themeId === "jungle") {
          experiences = [
            { timing: "Morning Session", title: "Canopy Yoga & Sacred Sound Meditation" },
            { timing: "Evening Session", title: "Organic Estate-Grown Harvest Chef's Table Dinner" }
          ];
        } else if (themeId === "heritage") {
          experiences = [
            { timing: "Evening Session", title: "Imperial Classical Music & Courtyard Dance Recital" },
            { timing: "Lunch Hours", title: "Sandstone Palace Heritage Cooking Masterclass" }
          ];
        }

        responseJson = {
          success: true,
          experiences
        };
        break;
      }

      case "GENERATE_SEO": {
        generationType = "SEO_METADATA";
        const propertyName = context.propertyName || "Luxury Stay";
        const descPreview = (context.description || "").slice(0, 140) || "A luxury hospitality retreat.";
        
        responseJson = {
          success: true,
          metaTitle: `${propertyName} | Premium Direct Booking Portal`,
          metaDescription: `${descPreview}... Experience ultimate hospitality, curated experiences, and five-star luxury amenities. Book direct with 0% extra fee.`,
          ogCopy: `Discover ${propertyName} — where boutique luxury meets five-star hospitality coordinates. Explore our suites, curated activities, and secure your direct stay.`
        };
        break;
      }

      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    // 2. Asynchronously Log Event to DB
    const durationMs = Date.now() - startTime;
    const eventId = await AiIntelligenceService.logGeneration({
      propertyId: auth.propertyId,
      generationType,
      inputContext: context,
      generatedOutput: responseJson,
      selectedTheme: context.themeId || null,
      stepContext: action,
      durationMs
    });

    // Return the response together with the tracking eventId
    return NextResponse.json({
      ...responseJson,
      eventId
    });
  } catch (error) {
    console.error("[PARTNER_AI_ERROR] Consultant Failure:", error);
    return NextResponse.json({ error: "Hospitality Consultant is currently busy. Please try again." }, { status: 500 });
  }
}

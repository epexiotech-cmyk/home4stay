import { PartnerRepository } from '../repositories/partnerRepository';
import { propertyRepository } from '../repositories/propertyRepository';
import { propertyCmsRepository } from '../repositories/propertyCmsRepository';
import { prisma } from "@/lib/database/prisma";

export class PropertyCmsService {
  
  async getCmsData(propertyId: string) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) return null;
    
    // Fetch onboarding drafts as fallback
    const session = await PartnerRepository.getOnboardingSessionByPropertyId(propertyId);
    const drafts: Record<string, any> = {};
    if (session && session.drafts) {
      session.drafts.forEach((d: any) => {
        drafts[d.stepId] = d.data;
      });
    }

    
    const pageContent = await propertyCmsRepository.getPageContentWithSections(propertyId);
    const sections = pageContent?.pageContent?.sections || [];
    
    const heroSection = sections.find(s => s.type === "hero");
    const narrativeSection = sections.find(s => s.type === "narrative");
    const seoSection = sections.find(s => s.type === "seo");
    const faqSection = sections.find(s => s.type === "faq");
    
    const dbPolicy = await prisma.propertyPolicy.findUnique({
      where: { propertyId }
    });
    
    const dbAmenities = await prisma.propertyAmenity.findMany({
      where: { propertyId }
    });
    const formattedAmenities = dbAmenities.map(a => ({
      icon: a.category,
      label: a.name,
      detail: ""
    }));
    const dbMediaAssets = await prisma.mediaAsset.findMany({
      where: { propertyId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
    const formattedImages = dbMediaAssets.map(a => ({ id: a.id, url: a.url, type: a.assetType || 'IMAGE' }));
    
    // Process fallbacks
    const fallbackIdentity = drafts.property || {};
    const fallbackTheme = drafts.theme || {};
    const fallbackAmenities = drafts.amenities || [];
    const fallbackPolicy = drafts.policies || {};

    const finalAmenities = formattedAmenities.length > 0 
      ? formattedAmenities 
      : fallbackAmenities.map((a: string) => ({ icon: "Sparkles", label: a, detail: "" }));

    const finalTheme = pageContent?.pageContent?.themeVariant || fallbackTheme.themeId || "Mountain Luxury";
    const finalHeroTitle = (heroSection?.data as any)?.title || fallbackIdentity.title || "";
    const finalHeroTagline = (heroSection?.data as any)?.subtitle || fallbackIdentity.tagline || "";
    const finalNarrativeLabel = (narrativeSection?.data as any)?.smallLabel || fallbackIdentity.location || "";
    const finalNarrativeHeading = (narrativeSection?.data as any)?.mainHeading || fallbackIdentity.title || "";
    const finalNarrativeHighlight = (narrativeSection?.data as any)?.highlightText || fallbackIdentity.description || "";

    const finalPolicies = dbPolicy ? {
       checkIn: dbPolicy.checkInTime,
       checkOut: dbPolicy.checkOutTime,
       cancellation: dbPolicy.cancellationPolicy,
       petPolicy: dbPolicy.houseRules || (dbPolicy.petsAllowed ? "Pets Allowed" : "Pets Not Allowed")
    } : {
       checkIn: fallbackPolicy.checkIn || "",
       checkOut: fallbackPolicy.checkOut || "",
       cancellation: fallbackPolicy.cancellation || "",
       petPolicy: fallbackPolicy.petPolicy || ""
    };

    return {
      propertyId,
      name: (property as any).name || property.title || fallbackIdentity.title || "",
      branding: {
        theme: {
          primary: finalTheme
        },
        heroTitle: finalHeroTitle,
        heroTagline: finalHeroTagline,
        narrativeLabel: finalNarrativeLabel,
        narrativeHeading: finalNarrativeHeading,
        narrativeHighlight: finalNarrativeHighlight,
      },
      amenities: finalAmenities,
      images: formattedImages,
      seo: {
         title: (seoSection?.data as any)?.title || "",
         description: (seoSection?.data as any)?.description || "",
         keywords: (seoSection?.data as any)?.keywords || [],
      },
      policies: finalPolicies,
      faqs: (faqSection?.data as { faqs?: { question: string; answer: string }[] })?.faqs || []
    };
  }

  async updateCmsData(propertyId: string, data: any) {
    if (data.name) {
       await propertyRepository.update(propertyId, { title: data.name });
    }
    
    const themePrimary = data.branding?.theme?.primary || "Mountain Luxury";
    const content = await propertyCmsRepository.upsertPageContent(propertyId, themePrimary);
    
    await propertyCmsRepository.upsertSection({
       id: `hero-${content.id}`,
       propertyPageContentId: content.id,
       type: "hero",
       sortOrder: 0,
       enabled: true,
       data: {
         title: data.branding?.heroTitle,
         subtitle: data.branding?.heroTagline
       }
    });

    await propertyCmsRepository.upsertSection({
       id: `narr-${content.id}`,
       propertyPageContentId: content.id,
       type: "narrative",
       sortOrder: 1,
       enabled: true,
       data: {
         smallLabel: data.branding?.narrativeLabel,
         mainHeading: data.branding?.narrativeHeading,
         highlightText: data.branding?.narrativeHighlight
       }
    });
    
    if (data.amenities && Array.isArray(data.amenities)) {
      await prisma.propertyAmenity.deleteMany({ where: { propertyId } });
      if (data.amenities.length > 0) {
        await prisma.propertyAmenity.createMany({
          data: data.amenities.map((a: any) => ({
            propertyId,
            category: a.icon || "Sparkles",
            name: a.label || "Amenity",
            isAvailable: true
          }))
        });
      }
    }
    
    if (data.seo) {
      await propertyCmsRepository.upsertSection({
         id: `seo-${content.id}`,
         propertyPageContentId: content.id,
         type: "seo",
         sortOrder: 4,
         enabled: true,
         data: {
           title: data.seo.title,
           description: data.seo.description,
           keywords: data.seo.keywords
         }
      });
    }

    if (data.policies) {
      const existingPolicy = await prisma.propertyPolicy.findUnique({ where: { propertyId } });
      const p = data.policies;
      
      const checkPets = (text: string) => {
        if (!text) return false;
        const t = text.toLowerCase();
        if (t.includes("not allow") || t.includes("no pet") || t.includes("not permit")) return false;
        return t.includes("allow") || t.includes("welcome") || t.includes("yes") || t.includes("pet friendly");
      };
      
      await prisma.propertyPolicy.upsert({
        where: { propertyId },
        update: {
          checkInTime: p.checkIn ?? existingPolicy?.checkInTime ?? "14:00",
          checkOutTime: p.checkOut ?? existingPolicy?.checkOutTime ?? "11:00",
          cancellationPolicy: p.cancellation ?? existingPolicy?.cancellationPolicy ?? "",
          houseRules: p.petPolicy ?? existingPolicy?.houseRules ?? "",
          petsAllowed: p.petPolicy !== undefined ? checkPets(p.petPolicy) : (existingPolicy?.petsAllowed ?? false)
        },
        create: {
          propertyId,
          checkInTime: p.checkIn || "14:00",
          checkOutTime: p.checkOut || "11:00",
          cancellationPolicy: p.cancellation || "",
          houseRules: p.petPolicy || "",
          petsAllowed: checkPets(p.petPolicy)
        }
      });
    }

    if (data.faqs) {
      await propertyCmsRepository.upsertSection({
         id: `faq-${content.id}`,
         propertyPageContentId: content.id,
         type: "faq",
         sortOrder: 5,
         enabled: true,
         data: {
           faqs: data.faqs
         }
      });
    }

    return await this.getCmsData(propertyId);
  }

  async getCmsPageContent(propertyId: string) {
    const targetProperty = await propertyCmsRepository.getPageContentWithSections(propertyId);
    return targetProperty?.pageContent || {
      propertyId,
      themeVariant: "Mountain Luxury",
      spacingPreset: "relaxed-luxury",
      animationPreset: "cinematic-fade-physics",
      sections: [
        { id: "sec-hero-1", type: "hero", enabled: true, sortOrder: 0, data: {} },
        { id: "sec-narrative-1", type: "narrative", enabled: true, sortOrder: 1, data: {} },
        { id: "sec-carousel-1", type: "carousel", enabled: true, sortOrder: 2, data: {} },
        { id: "sec-gallery-1", type: "gallery", enabled: true, sortOrder: 3, data: {} },
        { id: "sec-seo-1", type: "seo", enabled: true, sortOrder: 4, data: {} },
      ],
    };
  }

  async upsertCmsContent(propertyId: string, themePreset: string, sections: any[]) {
    const updatedContent = await propertyCmsRepository.upsertPageContent(propertyId, themePreset || "Mountain Luxury");
    
    if (Array.isArray(sections)) {
      for (const item of sections) {
        await propertyCmsRepository.upsertSection({
          id: item.id,
          propertyPageContentId: updatedContent.id,
          type: item.type,
          sortOrder: item.sortOrder,
          enabled: item.enabled ?? true,
          data: item.data || {},
        });
      }
    }
    return updatedContent;
  }

  async publishCmsVersion(propertyId: string, versionName: string, snapshotPayload: any, createdBy: string) {
    const targetProperty = await propertyCmsRepository.getPageContentWithSections(propertyId);
    const payloadArchive = snapshotPayload || targetProperty?.pageContent || { status: "fallback_snapshot" };

    const targetRelease = await propertyCmsRepository.createCmsVersion({
      propertyId,
      versionName: versionName || `Release Build — ${new Date().toLocaleDateString()}`,
      snapshot: payloadArchive,
      published: true,
      createdBy,
    });

    if (targetProperty?.pageContent?.id) {
      await propertyCmsRepository.updatePublishedVersionId(targetProperty.pageContent.id, targetRelease.id);
    }

    return targetRelease;
  }

  async getCmsVersions(propertyId: string) {
    return await propertyCmsRepository.getCmsVersions(propertyId, 20);
  }
  
  async createCmsSection(propertyId: string, type: string, initialData: any) {
    const targetProperty = await propertyCmsRepository.getPageContentMinimal(propertyId);
    if (!targetProperty) throw new Error("Property not found");
    let contentId = targetProperty.pageContent?.id;
    if (!contentId) {
      const newContent = await propertyCmsRepository.upsertPageContent(propertyId, "Mountain Luxury");
      contentId = newContent.id;
    }
    const existingCount = await propertyCmsRepository.countSections(contentId);
    return await propertyCmsRepository.createSection({
      propertyPageContentId: contentId,
      type: type || "narrative",
      sortOrder: existingCount,
      enabled: true,
      data: initialData || {},
    });
  }
  
  async deleteCmsSection(sectionId: string) {
    return await propertyCmsRepository.deleteSection(sectionId);
  }
}

export const propertyCmsService = new PropertyCmsService();

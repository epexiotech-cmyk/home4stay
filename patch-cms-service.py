import os
import re

path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/services/propertyCmsService.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to inject PartnerRepository to fetch the onboarding session
import_statement = "import { PartnerRepository } from '../repositories/partnerRepository';\n"
if "PartnerRepository" not in content:
    content = import_statement + content

# In getCmsData, fetch the onboarding session
old_get_cms_data_start = """  async getCmsData(propertyId: string) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) return null;"""

new_get_cms_data_start = """  async getCmsData(propertyId: string) {
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
"""

content = content.replace(old_get_cms_data_start, new_get_cms_data_start)

# Update formatting of Hero/Narrative/Amenities/Policies to fallback
# Find the return object
old_return = """    return {
      propertyId,
      name: (property as any).name || property.title,
      branding: {
        theme: {
          primary: pageContent?.pageContent?.themeVariant || "#0E5A75"
        },
        heroTitle: (heroSection?.data as any)?.title || "",
        heroTagline: (heroSection?.data as any)?.subtitle || "",
        narrativeLabel: (narrativeSection?.data as any)?.smallLabel || "",
        narrativeHeading: (narrativeSection?.data as any)?.mainHeading || "",
        narrativeHighlight: (narrativeSection?.data as any)?.highlightText || "",
      },
      amenities: formattedAmenities,
      images: formattedImages,
      seo: {
         title: (seoSection?.data as any)?.title || "",
         description: (seoSection?.data as any)?.description || "",
         keywords: (seoSection?.data as any)?.keywords || [],
      },
      policies: dbPolicy ? {
         checkIn: dbPolicy.checkInTime,
         checkOut: dbPolicy.checkOutTime,
         cancellation: dbPolicy.cancellationPolicy,
         petPolicy: dbPolicy.houseRules || (dbPolicy.petsAllowed ? "Pets Allowed" : "Pets Not Allowed")
      } : null,
      faqs: (faqSection?.data as { faqs?: { question: string; answer: string }[] })?.faqs || []
    };"""

new_return = """    // Process fallbacks
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
    };"""

content = content.replace(old_return, new_return)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("PropertyCmsService getCmsData successfully updated.")

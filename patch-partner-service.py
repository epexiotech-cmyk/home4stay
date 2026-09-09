import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/services/partnerService.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to inject propertyCmsRepository to fetch canonical CMS data in PartnerService
if "propertyCmsRepository" not in content:
    content = "import { propertyCmsRepository } from '../repositories/propertyCmsRepository';\n" + content

# Update getOnboardingSession
old_get_session = """    const draftsMap: Record<string, unknown> = {};
    session.drafts.forEach((draft: any) => {
      draftsMap[draft.stepId] = draft.data;
    });"""

new_get_session = """    const draftsMap: Record<string, unknown> = {};
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
"""

content = content.replace(old_get_session, new_get_session)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("PartnerService getOnboardingSession successfully updated.")

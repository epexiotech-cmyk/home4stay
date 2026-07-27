import { propertyRepository } from '../repositories/propertyRepository';
import { propertyCmsRepository } from '../repositories/propertyCmsRepository';

export class PropertyCmsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateCmsData(propertyId: string, data: any) {
    return await propertyRepository.updateCmsData(propertyId, data);
  }
  
  async getCmsData(propertyId: string) {
    return await propertyRepository.getCmsData(propertyId);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

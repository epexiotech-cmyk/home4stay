import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class PropertyCmsRepository {
  async getPageContentWithSections(propertyId: string) {
    return await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        pageContent: {
          include: {
            sections: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  }

  async getPageContentMinimal(propertyId: string) {
    return await prisma.property.findUnique({
      where: { id: propertyId },
      include: { pageContent: true },
    });
  }

  async upsertPageContent(propertyId: string, themeVariant: string) {
    return await prisma.propertyPageContent.upsert({
      where: { propertyId },
      update: {
        themeVariant,
        updatedAt: new Date(),
      },
      create: {
        propertyId,
        themeVariant,
      },
    });
  }

  async countSections(propertyPageContentId: string) {
    return await prisma.propertySection.count({
      where: { propertyPageContentId },
    });
  }

  async createSection(data: Prisma.PropertySectionUncheckedCreateInput) {
    return await prisma.propertySection.create({
      data,
    });
  }

  async upsertSection(data: Prisma.PropertySectionUncheckedCreateInput) {
    return await prisma.propertySection.upsert({
      where: { id: data.id },
      update: {
        sortOrder: data.sortOrder,
        enabled: data.enabled,
        data: data.data || {},
        updatedAt: new Date(),
      },
      create: {
        id: data.id,
        propertyPageContentId: data.propertyPageContentId,
        type: data.type,
        sortOrder: data.sortOrder,
        enabled: data.enabled ?? true,
        data: data.data || {},
      },
    });
  }

  async deleteSection(sectionId: string) {
    return await prisma.propertySection.delete({
      where: { id: sectionId },
    });
  }

  async createCmsVersion(data: Prisma.CmsVersionUncheckedCreateInput) {
    return await prisma.cmsVersion.create({
      data,
    });
  }

  async updatePublishedVersionId(pageContentId: string, versionId: string) {
    return await prisma.propertyPageContent.update({
      where: { id: pageContentId },
      data: { publishedVersionId: versionId },
    });
  }

  async getCmsVersions(propertyId: string, limit: number = 20) {
    return await prisma.cmsVersion.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const propertyCmsRepository = new PropertyCmsRepository();

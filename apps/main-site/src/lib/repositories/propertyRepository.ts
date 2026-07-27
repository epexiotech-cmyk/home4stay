import { prisma } from '../database/prisma';
import { CreateFullPropertyDto, UpdatePropertyDto } from '../types/property.dto';
import { Prisma } from '@prisma/client';

export class PropertyRepository {
  async create(data: CreateFullPropertyDto & { slug: string }) {
    return await prisma.property.create({
      data: {
        title: data.title,
        slug: data.slug,
        propertyType: data.propertyType,
        shortDescription: data.shortDescription,
        status: data.status,
        ownerId: data.ownerId,
        amenities: {
          create: data.amenities?.map((amenity) => ({
            category: amenity.category,
            name: amenity.name,
            isAvailable: amenity.isAvailable,
          })),
        },
        policies: data.policies
          ? {
              create: {
                checkInTime: data.policies.checkInTime,
                checkOutTime: data.policies.checkOutTime,
                petsAllowed: data.policies.petsAllowed,
                smokingAllowed: data.policies.smokingAllowed,
                cancellationPolicy: data.policies.cancellationPolicy,
              },
            }
          : undefined,
        pricing: data.pricing
          ? {
              create: {
                basePrice: data.pricing.basePrice,
                currency: data.pricing.currency,
                taxRate: data.pricing.taxRate,
              },
            }
          : undefined,
      },
      include: {
        amenities: true,
        policies: true,
        pricing: true,
        rooms: true,
      },
    });
  }

  async findById(id: string) {
    return await prisma.property.findUnique({
      where: { id },
      include: {
        amenities: true,
        policies: true,
        pricing: true,
        rooms: true,
        experiences: true,
        mediaAssets: true,
      },
    });
  }

  async update(id: string, data: UpdatePropertyDto) {
    const updateData: Prisma.PropertyUpdateInput = {};
    if (data.title) updateData.title = data.title;
    if (data.propertyType) updateData.propertyType = data.propertyType;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.status) updateData.status = data.status;
    if (data.onboardingStatus) updateData.onboardingStatus = data.onboardingStatus;
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;

    return await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        amenities: true,
        policies: true,
        pricing: true,
      },
    });
  }

  async delete(id: string) {
    return await prisma.property.delete({
      where: { id },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateCmsData(propertyId: string, data: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma.property as any).update({
      where: { id: propertyId },
      data: {
        pageContent: data.sections ? { sections: data.sections } : undefined,
        amenities: data.amenities,
        faqs: data.faqs,
        policies: data.policies,
        seo: data.seo,
        contact: data.contact,
        branding: data.branding
      }
    });
  }

  async getCmsData(propertyId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (prisma.property as any).findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        pageContent: true,
        amenities: true,
        faqs: true,
        policies: true,
        seo: true,
        contact: true,
        branding: true
      }
    });
  }

  // --- MEDIA ASSET METHODS ---
  async findMediaByPropertyId(propertyId: string) {
    return await prisma.mediaAsset.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });
  }

  // --- PAYMENT CONFIG METHODS ---
  async findActivePaymentConfig(propertyId: string) {
    return await prisma.propertyPaymentConfig.findFirst({
      where: {
        propertyId,
        isActive: true
      }
    });
  }

  async findPaymentConfigsByPropertyId(propertyId: string) {
    return await prisma.propertyPaymentConfig.findMany({
      where: { propertyId },
      orderBy: { provider: "asc" }
    });
  }

  async upsertPaymentConfigWithTransaction(
    propertyId: string,
    provider: string,
    encryptedGatewaySecret: string | null,
    encryptedWebhookSecret: string | null,
    isActive: boolean,
    upiId: string | null,
    merchantName: string | null,
    bankName: string | null,
    gatewayKey: string | null
  ) {
    return await prisma.$transaction(async (tx) => {
      const existingConfig = await tx.propertyPaymentConfig.findFirst({
        where: {
          propertyId,
          provider
        }
      });

      const finalGatewaySecret = encryptedGatewaySecret !== undefined ? encryptedGatewaySecret : (existingConfig?.gatewaySecret || null);
      const finalWebhookSecret = encryptedWebhookSecret !== undefined ? encryptedWebhookSecret : (existingConfig?.webhookSecret || null);

      if (isActive) {
        await tx.propertyPaymentConfig.updateMany({
          where: {
            propertyId,
            provider: { not: provider }
          },
          data: {
            isActive: false
          }
        });
      }

      if (existingConfig) {
        return await tx.propertyPaymentConfig.update({
          where: { id: existingConfig.id },
          data: {
            upiId,
            merchantName,
            bankName,
            gatewayKey,
            gatewaySecret: finalGatewaySecret,
            webhookSecret: finalWebhookSecret,
            isActive
          }
        });
      } else {
        return await tx.propertyPaymentConfig.create({
          data: {
            propertyId,
            provider,
            upiId,
            merchantName,
            bankName,
            gatewayKey,
            gatewaySecret: finalGatewaySecret,
            webhookSecret: finalWebhookSecret,
            isActive
          }
        });
      }
    });
  }
}

export const propertyRepository = new PropertyRepository();

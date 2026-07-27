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
}

export const propertyRepository = new PropertyRepository();

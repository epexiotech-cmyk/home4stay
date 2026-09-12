import { prisma } from "@/lib/database/prisma";

export class PropertyNearbyPlaceService {
  async listNearbyPlaces(propertyId: string) {
    return await prisma.propertyNearbyPlace.findMany({
      where: { propertyId },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async getNearbyPlaceById(propertyId: string, id: string) {
    return await prisma.propertyNearbyPlace.findFirst({
      where: { propertyId, id }
    });
  }

  async createNearbyPlace(propertyId: string, data: {
    name: string;
    category?: string | null;
    distance?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return await prisma.propertyNearbyPlace.create({
      data: {
        propertyId,
        ...data,
      }
    });
  }

  async updateNearbyPlace(propertyId: string, id: string, data: any) {
    const existing = await this.getNearbyPlaceById(propertyId, id);
    if (!existing) {
      throw new Error("Nearby place not found or unauthorized");
    }

    return await prisma.propertyNearbyPlace.update({
      where: { id },
      data
    });
  }

  async deleteNearbyPlace(propertyId: string, id: string) {
    const existing = await this.getNearbyPlaceById(propertyId, id);
    if (!existing) {
      throw new Error("Nearby place not found or unauthorized");
    }
    return await prisma.propertyNearbyPlace.delete({
      where: { id }
    });
  }
}

export const propertyNearbyPlaceService = new PropertyNearbyPlaceService();

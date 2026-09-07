
import { prisma } from "../database/prisma";

export class PropertyPricingRepository {
  async findByPropertyId(propertyId: string) {
    return await prisma.propertyPricing.findUnique({
      where: { propertyId }
    });
  }
}

export const propertyPricingRepository = new PropertyPricingRepository();

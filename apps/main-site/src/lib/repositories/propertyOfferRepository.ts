import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class PropertyOfferRepository {
  async findManyByPropertyId(propertyId: string, isActive?: boolean) {
    return await prisma.propertyOffer.findMany({
      where: {
        propertyId,
        isActive
      }
    });
  }

  async findById(id: string) {
    return await prisma.propertyOffer.findUnique({
      where: { id }
    });
  }

  async findActiveByCouponCode(couponCode: string, propertyId: string) {
    return await prisma.propertyOffer.findFirst({
      where: {
        couponCode: couponCode.toUpperCase(),
        propertyId,
        isActive: true
      }
    });
  }

  async create(data: Prisma.PropertyOfferUncheckedCreateInput) {
    return await prisma.propertyOffer.create({ data });
  }

  async update(id: string, data: Prisma.PropertyOfferUncheckedUpdateInput) {
    return await prisma.propertyOffer.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.propertyOffer.delete({
      where: { id }
    });
  }
}

export const propertyOfferRepository = new PropertyOfferRepository();

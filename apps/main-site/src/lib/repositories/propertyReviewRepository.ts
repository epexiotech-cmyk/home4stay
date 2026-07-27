import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class PropertyReviewRepository {
  async findManyByFilters(propertyId: string, isPublished?: boolean, isFeatured?: boolean) {
    return await prisma.propertyReview.findMany({
      where: {
        propertyId,
        isPublished,
        isFeatured
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async findById(reviewId: string) {
    return await prisma.propertyReview.findUnique({
      where: { id: reviewId }
    });
  }

  async update(reviewId: string, data: Prisma.PropertyReviewUncheckedUpdateInput) {
    return await prisma.propertyReview.update({
      where: { id: reviewId },
      data
    });
  }
}

export const propertyReviewRepository = new PropertyReviewRepository();

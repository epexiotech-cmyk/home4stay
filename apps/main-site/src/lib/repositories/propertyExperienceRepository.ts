import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class PropertyExperienceRepository {
  async findManyByPropertyId(propertyId: string) {
    return await prisma.propertyExperience.findMany({
      where: { propertyId },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async findById(id: string) {
    return await prisma.propertyExperience.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.PropertyExperienceUncheckedCreateInput) {
    return await prisma.propertyExperience.create({
      data
    });
  }

  async update(id: string, data: Prisma.PropertyExperienceUncheckedUpdateInput) {
    return await prisma.propertyExperience.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.propertyExperience.delete({
      where: { id }
    });
  }
}

export const propertyExperienceRepository = new PropertyExperienceRepository();

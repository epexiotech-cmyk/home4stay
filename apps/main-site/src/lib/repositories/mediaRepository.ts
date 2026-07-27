import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";

export class MediaRepository {
  static async createMediaAsset(data: Prisma.MediaAssetUncheckedCreateInput) {
    return prisma.mediaAsset.create({
      data
    });
  }

  static async findById(id: string) {
    return prisma.mediaAsset.findUnique({
      where: { id }
    });
  }

  static async deleteById(id: string) {
    return prisma.mediaAsset.delete({
      where: { id }
    });
  }
}

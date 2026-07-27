import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class PropertyRoomRepository {
  async findManyByPropertyId(propertyId: string, options?: { isActive?: boolean; skip?: number; take?: number }) {
    const where: Prisma.RoomWhereInput = { propertyId };
    
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    return await prisma.room.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return await prisma.room.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.RoomUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.room.create({ data });
  }

  async update(id: string, data: Prisma.RoomUncheckedUpdateInput, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.room.update({
      where: { id },
      data
    });
  }

  async delete(id: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.room.delete({
      where: { id }
    });
  }

  /**
   * Orchestrates the creation of a Room and its associated initial Inventory atomically.
   * This is a repository-level wrapper to ensure structural database integrity.
   */
  async createWithInventory(data: Prisma.RoomUncheckedCreateInput, initialInventory: number) {
    return await prisma.$transaction(async (tx) => {
      const room = await this.create(data, tx);
      await tx.roomInventory.create({
        data: {
          roomId: room.id,
          availableCount: initialInventory
        }
      });
      return room;
    });
  }
}

export const propertyRoomRepository = new PropertyRoomRepository();

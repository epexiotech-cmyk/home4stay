import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class PropertyRoomInventoryRepository {
  async findByRoomId(roomId: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.roomInventory.findUnique({
      where: { roomId }
    });
  }

  async findManyByRoomIds(roomIds: string[], tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.roomInventory.findMany({
      where: { roomId: { in: roomIds } }
    });
  }

  async create(roomId: string, availableCount: number, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.roomInventory.create({
      data: {
        roomId,
        availableCount
      }
    });
  }

  async updateAvailableCount(roomId: string, availableCount: number, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.roomInventory.update({
      where: { roomId },
      data: { availableCount }
    });
  }

  async deleteByRoomId(roomId: string, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.roomInventory.delete({
      where: { roomId }
    });
  }

  // Persistence helper for Availability Engine
  async countOverlappingBookings(roomId: string, startDate: Date, endDate: Date, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    const overlapping = await db.booking.aggregate({
      where: {
        roomId,
        OR: [
          { status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] } },
          { 
            temporaryInventoryLockedUntil: { gt: new Date() } 
          }
        ],
        startDate: { lt: endDate },
        endDate: { gt: startDate }
      },
      _count: true
    });
    
    return overlapping._count || 0;
  }
}

export const propertyRoomInventoryRepository = new PropertyRoomInventoryRepository();

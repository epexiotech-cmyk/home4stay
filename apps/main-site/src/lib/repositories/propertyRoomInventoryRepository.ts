import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class PropertyRoomInventoryRepository {
  async findByRoomId(roomId: string) {
    return await prisma.roomInventory.findUnique({
      where: { roomId }
    });
  }

  async findManyByRoomIds(roomIds: string[]) {
    return await prisma.roomInventory.findMany({
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

  async decrementInventory(roomId: string, count: number, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.roomInventory.update({
      where: { roomId },
      data: { availableCount: { decrement: count } }
    });
  }

  async incrementInventory(roomId: string, count: number, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;
    return await db.roomInventory.update({
      where: { roomId },
      data: { availableCount: { increment: count } }
    });
  }

  // Persistence helper for Availability Engine
  async countOverlappingBookings(roomId: string, startDate: Date, endDate: Date) {
    const overlapping = await prisma.booking.aggregate({
      where: {
        roomId,
        OR: [
          { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
          { 
            temporaryInventoryLockedUntil: { gt: new Date() } 
          }
        ],
        startDate: { lt: endDate },
        endDate: { gt: startDate }
      },
      _sum: {
        // Typically in hotel domains, a booking books 1 physical room.
        // If a booking model had `roomCount`, we'd sum it. We'll count records for now.
      },
      _count: true
    });
    
    return overlapping._count || 0;
  }
}

export const propertyRoomInventoryRepository = new PropertyRoomInventoryRepository();

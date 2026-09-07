import { propertyRoomInventoryRepository } from '../repositories/propertyRoomInventoryRepository';
import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors/handler";

export class PropertyInventoryService {
  async getRoomAvailability(roomId: string, startDate: Date, endDate: Date, tx?: Prisma.TransactionClient) {
    if (startDate >= endDate) {
      throw new AppError('Start date must be before end date', 400, 'BAD_REQUEST');
    }

    const db = tx || prisma;
    const room = await db.room.findUnique({
      where: { id: roomId }
    });

    if (!room) throw new AppError('Room not found', 404, 'NOT_FOUND');

    const overlappingBookingsCount = await propertyRoomInventoryRepository.countOverlappingBookings(
      roomId, 
      startDate, 
      endDate,
      tx
    );

    const availableCount = room.roomCount - overlappingBookingsCount;
    return {
      roomId,
      totalInventory: room.roomCount,
      bookedCount: overlappingBookingsCount,
      availableCount: availableCount > 0 ? availableCount : 0,
      isAvailable: availableCount > 0
    };
  }

  // Booking Integration Helper: Fast fail validation for checkout flow
  async validateRoomAvailability(roomId: string, startDate: Date, endDate: Date, requestedCount: number = 1, tx?: Prisma.TransactionClient) {
    const availability = await this.getRoomAvailability(roomId, startDate, endDate, tx);
    if (!availability.isAvailable || availability.availableCount < requestedCount) {
      throw new AppError('Requested room quantity is not available for these dates', 409, 'CONFLICT');
    }
    return true;
  }

  async syncRoomInventory(roomId: string, newCount: number) {
    if (newCount < 0) throw new AppError('Inventory count cannot be negative', 400, 'BAD_REQUEST');
    return await propertyRoomInventoryRepository.updateAvailableCount(roomId, newCount);
  }
}

export const propertyInventoryService = new PropertyInventoryService();

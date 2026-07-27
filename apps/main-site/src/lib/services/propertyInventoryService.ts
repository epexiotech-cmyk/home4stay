import { propertyRoomInventoryRepository } from '../repositories/propertyRoomInventoryRepository';
import { AppError } from "@/lib/errors/handler";

export class PropertyInventoryService {
  async getRoomAvailability(roomId: string, startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new AppError('Start date must be before end date', 400, 'BAD_REQUEST');
    }

    const inventory = await propertyRoomInventoryRepository.findByRoomId(roomId);
    if (!inventory) throw new AppError('Inventory record not found for this room', 404, 'NOT_FOUND');

    const overlappingBookingsCount = await propertyRoomInventoryRepository.countOverlappingBookings(
      roomId, 
      startDate, 
      endDate
    );

    const availableCount = inventory.availableCount - overlappingBookingsCount;
    return {
      roomId,
      totalInventory: inventory.availableCount,
      bookedCount: overlappingBookingsCount,
      availableCount: availableCount > 0 ? availableCount : 0,
      isAvailable: availableCount > 0
    };
  }

  // Booking Integration Helper: Fast fail validation for checkout flow
  async validateRoomAvailability(roomId: string, startDate: Date, endDate: Date, requestedCount: number = 1) {
    const availability = await this.getRoomAvailability(roomId, startDate, endDate);
    if (!availability.isAvailable || availability.availableCount < requestedCount) {
      throw new AppError('Requested room quantity is not available for these dates', 409, 'CONFLICT');
    }
    return true;
  }

  async reserveRoomInventory(roomId: string, count: number) {
    if (count <= 0) throw new AppError('Reservation count must be positive', 400, 'BAD_REQUEST');

    const inventory = await propertyRoomInventoryRepository.findByRoomId(roomId);
    if (!inventory) throw new AppError('Inventory record not found', 404, 'NOT_FOUND');

    if (inventory.availableCount < count) {
      throw new AppError('Insufficient inventory available to complete this reservation', 400, 'BAD_REQUEST');
    }

    return await propertyRoomInventoryRepository.decrementInventory(roomId, count);
  }

  async releaseRoomInventory(roomId: string, count: number) {
    if (count <= 0) throw new AppError('Release count must be positive', 400, 'BAD_REQUEST');

    const inventory = await propertyRoomInventoryRepository.findByRoomId(roomId);
    if (!inventory) throw new AppError('Inventory record not found', 404, 'NOT_FOUND');

    return await propertyRoomInventoryRepository.incrementInventory(roomId, count);
  }

  async syncRoomInventory(roomId: string, newCount: number) {
    if (newCount < 0) throw new AppError('Inventory count cannot be negative', 400, 'BAD_REQUEST');
    
    const inventory = await propertyRoomInventoryRepository.findByRoomId(roomId);
    if (!inventory) throw new AppError('Inventory record not found', 404, 'NOT_FOUND');

    return await propertyRoomInventoryRepository.updateAvailableCount(roomId, newCount);
  }
}

export const propertyInventoryService = new PropertyInventoryService();

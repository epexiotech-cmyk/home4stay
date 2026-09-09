import { prisma } from "../database/prisma";
import { PartnerMediaService } from "./partnerMediaService";
import { propertyRoomRepository } from '../repositories/propertyRoomRepository';
import { CreateRoomDto, UpdateRoomDto } from '../types/room.dto';
import { AppError } from "@/lib/errors/handler";

export class PropertyRoomService {
  async getRooms(propertyId: string) {
    return await propertyRoomRepository.findManyByPropertyId(propertyId);
  }
  
  async getRoomById(id: string) {
    const room = await propertyRoomRepository.findById(id);
    if (!room) throw new AppError('Room not found', 404, 'NOT_FOUND');
    return room;
  }
  
  async createRoom(data: CreateRoomDto) {
    if (data.price <= 0) {
      throw new AppError('Room price must be greater than zero', 400, 'BAD_REQUEST');
    }
    
    // --- MEDIA ORCHESTRATION ---
    let processedImages = data.images || [];
    if (processedImages.length > 0) {
      processedImages = processedImages.filter(url => url.startsWith('http'));
    }

    // --- AMENITY ORCHESTRATION ---
    const requestedAmenities = (data as any).amenities || [];
    if (requestedAmenities.length > 20) {
      throw new AppError('Cannot assign more than 20 amenities to a single room', 400, 'BAD_REQUEST');
    }

    const persistData = {
      ...data,
      images: processedImages,
    };
    delete (persistData as any).amenities; 
    
    const initialInventory = data.roomCount || 1;
    const room = await propertyRoomRepository.createWithInventory(persistData as any, initialInventory);
    
    return room;
  }
  
  async updateRoom(id: string, data: UpdateRoomDto) {
    const room = await propertyRoomRepository.findById(id);
    if (!room) throw new AppError('Room not found', 404, 'NOT_FOUND');
    
    if (data.name && data.name.trim() === '') {
      throw new AppError('Room name cannot be empty', 400, 'BAD_REQUEST');
    }
    
    // --- MEDIA ORCHESTRATION ---
    let processedImages = data.images !== undefined ? data.images : room.images;
    if (Array.isArray(processedImages)) {
      processedImages = processedImages.filter((url: any) => typeof url === 'string' && url.startsWith('http'));
    }

    // --- AMENITY ORCHESTRATION ---
    const requestedAmenities = (data as any).amenities;
    if (requestedAmenities && requestedAmenities.length > 20) {
      throw new AppError('Cannot assign more than 20 amenities to a single room', 400, 'BAD_REQUEST');
    }

    const persistData = {
      ...data,
      images: processedImages,
    };
    delete (persistData as any).amenities;
    
    const updatedRoom = await propertyRoomRepository.update(id, persistData as any);
    
    return updatedRoom;
  }
  
  async deleteRoom(id: string) {
    const room = await propertyRoomRepository.findById(id);
    if (!room) throw new AppError('Room not found', 404, 'NOT_FOUND');
    
    // Domain rule: Prevent hard deletion of active rooms to preserve inventory integrity
    if (room.isActive) {
      throw new AppError('Cannot delete an active room. Deactivate it first.', 400, 'BAD_REQUEST');
    }

    // Safety rule: Prevent hard deletion if booking history exists
    const bookingCount = await prisma.booking.count({ where: { roomId: id } });
    if (bookingCount > 0) {
      throw new AppError('This room cannot be deleted because it has booking history. Deactivate it instead.', 400, 'BAD_REQUEST');
    }

    // Cleanup associated Cloudinary assets and MediaAsset records
    try {
      const roomImages = await PartnerMediaService.getRoomImages(room.propertyId, id);
      for (const asset of roomImages) {
        await PartnerMediaService.deleteRoomImage({
          propertyId: room.propertyId,
          roomId: id,
          mediaId: asset.id
        });
      }
    } catch (cleanupError) {
      console.error(`[deleteRoom] Failed to clean up media for room ${id}:`, cleanupError);
      // We log but still proceed with room deletion if it's safe to do so
    }
    
    return await propertyRoomRepository.delete(id);
  }
}

export const propertyRoomService = new PropertyRoomService();

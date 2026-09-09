# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/lib/services/propertyRoomService.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports_to_add = """import { prisma } from "../database/prisma";
import { PartnerMediaService } from "./partnerMediaService";
"""

if "import { prisma }" not in content:
    content = content.replace("import { propertyRoomRepository }", imports_to_add + "import { propertyRoomRepository }")

# Replace deleteRoom
old_delete_room = """  async deleteRoom(id: string) {
    const room = await propertyRoomRepository.findById(id);
    if (!room) throw new AppError('Room not found', 404, 'NOT_FOUND');
    
    // Domain rule: Prevent hard deletion of active rooms to preserve inventory integrity
    if (room.isActive) {
      throw new AppError('Cannot delete an active room. Deactivate it first.', 400, 'BAD_REQUEST');
    }
    
    return await propertyRoomRepository.delete(id);
  }"""

new_delete_room = """  async deleteRoom(id: string) {
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
  }"""

content = content.replace(old_delete_room, new_delete_room)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated propertyRoomService.ts")

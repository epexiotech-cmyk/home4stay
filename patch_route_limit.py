# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/app/api/property/room/[roomId]/images/route.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { prisma }' not in content:
    content = content.replace('import { AppError } from "@/lib/errors/handler";', 'import { AppError } from "@/lib/errors/handler";\nimport { prisma } from "@/lib/database/prisma";')

old_limit_check = """  if (files.length > 12) {
    throw new AppError("Cannot upload more than 12 images at once", 400, "BAD_REQUEST");
  }"""

new_limit_check = """  const room = await prisma.room.findFirst({ where: { id: roomId, propertyId } });
  if (!room) throw new AppError("Room not found or unauthorized", 404, "NOT_FOUND");
  
  const existingImages = Array.isArray(room.images) ? room.images : [];
  if (existingImages.length + files.length > 12) {
    throw new AppError(`Maximum of 12 images per room allowed. You can only upload ${12 - existingImages.length} more.`, 400, "BAD_REQUEST");
  }"""

content = content.replace(old_limit_check, new_limit_check)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched route.ts limit check")

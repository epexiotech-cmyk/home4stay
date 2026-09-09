# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/app/(portal)/partner/properties/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update RoomType interface
old_interface = """interface RoomType {
  id: string;
  name: string;
  roomCount: number;
  price: number;
  tags: string[];
}"""

new_interface = """interface RoomType {
  id: string;
  name: string;
  roomCount: number;
  price: number;
  tags: string[];
  isActive: boolean;
  images: string[];
  capacity: string;
  view: string;
}"""

content = content.replace(old_interface, new_interface)

# Update mappedRooms
old_mapping = """          const mappedRooms: RoomType[] = rawRooms.map((r) => ({
             id: typeof r.id === 'string' ? r.id : "unknown-id",
             name: typeof r.name === 'string' ? r.name : "Room",
             roomCount: typeof r.roomCount === 'number' ? r.roomCount : 0,
             price: typeof r.price === 'number' ? r.price : 0,
             tags: Array.isArray(r.tags) ? (r.tags as string[]) : []
          }));"""

new_mapping = """          const mappedRooms: RoomType[] = rawRooms.map((r) => ({
             id: typeof r.id === 'string' ? r.id : "unknown-id",
             name: typeof r.name === 'string' ? r.name : "Room",
             roomCount: typeof r.roomCount === 'number' ? r.roomCount : 0,
             price: typeof r.price === 'number' ? r.price : 0,
             tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
             isActive: typeof r.isActive === 'boolean' ? r.isActive : true,
             images: Array.isArray(r.images) ? (r.images as string[]) : [],
             capacity: typeof r.capacity === 'string' ? r.capacity : "2 Guests",
             view: typeof r.view === 'string' ? r.view : "Standard"
          }));"""

content = content.replace(old_mapping, new_mapping)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched PropertiesPage mapping")

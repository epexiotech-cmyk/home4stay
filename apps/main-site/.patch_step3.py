import os

# 1. Patch contextResolver.ts
file_path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'
with open(file_path, 'r') as f:
    content = f.read()

# Update mapping arrays to explicitly set empty arrays instead of undefined
target_rooms = """  // Rooms Mapping
  if (db.rooms && Array.isArray(db.rooms) && db.rooms.length > 0) {"""
replace_rooms = """  // Rooms Mapping
  extended.rooms = [];
  if (db.rooms && Array.isArray(db.rooms) && db.rooms.length > 0) {"""

target_amenities = """  // Amenities Mapping
  if (db.amenities && Array.isArray(db.amenities) && db.amenities.length > 0) {"""
replace_amenities = """  // Amenities Mapping
  extended.amenities = [];
  if (db.amenities && Array.isArray(db.amenities) && db.amenities.length > 0) {"""

content = content.replace(target_rooms, replace_rooms)
content = content.replace(target_amenities, replace_amenities)

with open(file_path, 'w') as f:
    f.write(content)

print("Patched contextResolver.ts")

# 2. Patch page.tsx
page_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx'
with open(page_path, 'r') as f:
    page_content = f.read()

target_amenities_ui = """                {(property.amenities || [
                  { icon: "Wifi", label: "High Speed Fiber Wi-Fi" },
                  { icon: "Car", label: "Private Secured Parking" },
                  { icon: "Tv", label: "Premium Entertainment" },
                  { icon: "Wind", label: "Climate Control" },
                  { icon: "Coffee", label: "Gourmet Kitchen" },
                  { icon: "Utensils", label: "Private Dining" },
                ]).map((item: { icon: string; label: string; detail?: string }, idx: number) => {"""

replace_amenities_ui = """                {((property.amenities && property.amenities.length > 0) ? property.amenities : (property.amenities ? [] : [
                  { icon: "Wifi", label: "High Speed Fiber Wi-Fi" },
                  { icon: "Car", label: "Private Secured Parking" },
                  { icon: "Tv", label: "Premium Entertainment" },
                  { icon: "Wind", label: "Climate Control" },
                  { icon: "Coffee", label: "Gourmet Kitchen" },
                  { icon: "Utensils", label: "Private Dining" },
                ])).map((item: { icon: string; label: string; detail?: string }, idx: number) => {"""

page_content = page_content.replace(target_amenities_ui, replace_amenities_ui)
with open(page_path, 'w') as f:
    f.write(page_content)

print("Patched page.tsx")

# 3. Patch RoomSelection.tsx
room_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx'
with open(room_path, 'r') as f:
    room_content = f.read()

target_rooms_ui = """  const displayRooms = (rooms && rooms.length > 0) ? rooms.map((room: Room, idx: number) => ({
    id: room.id || `room-${idx}-${room.name.toLowerCase().replace(/\\s+/g, '-')}`,
    name: room.name,
    image: room.image || ROOM_IMAGES[idx % ROOM_IMAGES.length],
    description: room.description || "Experience the pinnacle of mountain luxury in our signature accommodation.",
    price: room.price,
    size: room.size || "450 sq ft",
    occupancy: room.capacity || room.occupancy || "2 Adults",
    bedType: room.bedType || "King Sized",
    view: room.view || "Mountain View",
    tags: room.tags || ["Premium", "Featured"],
    amenities: room.amenities || ["Wi-Fi", "Room Service", "Coffee Maker", "Mountain View"]
  })) : ROOMS;"""

replace_rooms_ui = """  // If rooms is empty array, it means DB explicitly has 0 rooms. If undefined, fallback to mock.
  const sourceRooms = rooms !== undefined ? rooms : ROOMS;
  
  const displayRooms = sourceRooms.map((room: Room, idx: number) => ({
    id: room.id || `room-${idx}-${room.name.toLowerCase().replace(/\\s+/g, '-')}`,
    name: room.name,
    image: room.image || ROOM_IMAGES[idx % ROOM_IMAGES.length],
    description: room.description || "Experience the pinnacle of mountain luxury in our signature accommodation.",
    price: room.price,
    size: room.size || "450 sq ft",
    occupancy: room.capacity || room.occupancy || "2 Adults",
    bedType: room.bedType || "King Sized",
    view: room.view || "Mountain View",
    tags: room.tags || ["Premium", "Featured"],
    amenities: room.amenities || ["Wi-Fi", "Room Service", "Coffee Maker", "Mountain View"]
  }));"""

room_content = room_content.replace(target_rooms_ui, replace_rooms_ui)
with open(room_path, 'w') as f:
    f.write(room_content)

print("Patched RoomSelection.tsx")

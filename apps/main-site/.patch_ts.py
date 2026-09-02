import os

room_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx'
with open(room_path, 'r') as f:
    room_content = f.read()

target = """  const displayRooms = sourceRooms.map((room: Room, idx: number) => ({"""
replacement = """  const displayRooms = sourceRooms.map((room: any, idx: number) => ({"""

room_content = room_content.replace(target, replacement)
with open(room_path, 'w') as f:
    f.write(room_content)

print("Patched RoomSelection.tsx TS error")

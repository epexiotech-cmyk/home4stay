# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/components/RoomForm.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """      const createdRoom = isEditing ? initialData : result.data;

      // 2. Upload Images if any
      if (selectedFiles.length > 0 && createdRoom?.id) {
        const imageFormData = new FormData();
        selectedFiles.forEach(file => {
          imageFormData.append("images", file);
        });

        const imageRes = await fetch(`/api/property/room/${activeRoomId}/images`, {"""

new_block = """      const activeRoomId = effectiveRoomId || result.data?.id;
      if (!activeRoomId) {
        alert("Room was created, but no room ID was returned by the server.");
        setLoading(false);
        return;
      }

      if (!createdRoomId && !initialData?.id) {
        setCreatedRoomId(activeRoomId);
      }

      // 2. Upload Images if any
      if (selectedFiles.length > 0 && activeRoomId) {
        const imageFormData = new FormData();
        selectedFiles.forEach(file => {
          imageFormData.append("images", file);
        });

        const imageRes = await fetch(`/api/property/room/${activeRoomId}/images`, {"""

content = content.replace(old_block, new_block)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched RoomForm activeRoomId")

# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/components/RoomImageManager.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('if (!res.ok) throw new Error(data.message || "Failed to upload");', 'if (!res.ok) throw new Error(data.error?.message || data.message || "Failed to upload");')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched RoomImageManager")

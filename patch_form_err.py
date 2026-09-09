# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/components/RoomForm.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the error message extraction
old_err_alert = 'alert((isEditing ? "Room updated, but image upload failed: " : "Room created, but image upload failed: ") + (imageResult.message || "Unknown error"));'
new_err_alert = 'alert((isEditing ? "Room updated, but image upload failed: " : "Room created, but image upload failed: ") + (imageResult.error?.message || imageResult.message || "Unknown error"));'

content = content.replace(old_err_alert, new_err_alert)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched RoomForm")

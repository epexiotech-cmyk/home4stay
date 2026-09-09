# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/lib/tenant/contextResolver.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_rooms = """    // The public site expects 'rooms' array? We'll leave persistentDbRecord.rooms intact.
    if (persistentDbRecord.rooms && Array.isArray(persistentDbRecord.rooms)) {
      merged.rooms = persistentDbRecord.rooms;
    } else {"""

new_rooms = """    // The public site expects 'rooms' array? We'll leave persistentDbRecord.rooms intact, but ONLY include active rooms.
    if (persistentDbRecord.rooms && Array.isArray(persistentDbRecord.rooms)) {
      merged.rooms = persistentDbRecord.rooms.filter((r: any) => r.isActive !== false);
    } else {"""

content = content.replace(old_rooms, new_rooms)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched contextResolver.ts rooms")

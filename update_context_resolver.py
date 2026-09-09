# -*- coding: utf-8 -*-
filepath = 'apps/main-site/src/lib/tenant/contextResolver.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    if (persistentDbRecord.rooms && Array.isArray(persistentDbRecord.rooms)) {
      merged.rooms = persistentDbRecord.rooms.filter((r: any) => r.isActive !== false);
    } else {
      merged.rooms = [];
    }"""

replacement = """    if (persistentDbRecord.rooms && Array.isArray(persistentDbRecord.rooms)) {
      merged.rooms = persistentDbRecord.rooms.filter((r: any) => r.isActive !== false);
    } else {
      merged.rooms = [];
    }

    if (persistentDbRecord.mealPlans && Array.isArray(persistentDbRecord.mealPlans)) {
      merged.mealPlans = persistentDbRecord.mealPlans.filter((m: any) => m.isActive !== false);
    } else {
      merged.mealPlans = [];
    }"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced contextResolver.ts")
else:
    print("Could not find target content")

# -*- coding: utf-8 -*-
filepath = 'apps/main-site/src/app/(portal)/partner/properties/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function RoomTypeCard" in line:
        start = i
        break

print(f"Total lines: {len(lines)}")
for i in range(len(lines) - 10, len(lines)):
    print(f"Line {i+1}: {lines[i].strip()}")

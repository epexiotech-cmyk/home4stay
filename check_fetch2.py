# -*- coding: utf-8 -*-
filepath = 'apps/main-site/src/app/(portal)/partner/properties/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "const fetchProperty = async () => {" in line:
        start = i
        break

for i in range(start + 30, start + 50):
    if i < len(lines):
        print(f"Line {i+1}: {lines[i].strip()}")

# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/app/api/property/[slug]/route.ts'
if os.path.exists(filepath):
    print("Found API")
    with open(filepath, 'r') as f:
        print(f.read()[:500])
else:
    print("Not found")

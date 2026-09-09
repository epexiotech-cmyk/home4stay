# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/lib/services/partnerMediaService.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    print("Missing roomId" in f.read())

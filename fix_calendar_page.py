# -*- coding: utf-8 -*-
filepath = 'apps/main-site/src/app/(portal)/partner/calendar/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { useAuth } from "@/context/AuthContext";\n"use client";', '"use client";\nimport { useAuth } from "@/context/AuthContext";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

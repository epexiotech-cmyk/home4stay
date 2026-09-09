# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/components/RoomForm.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

interface_def = """interface RoomFormInitialData {
  id: string;
  name: string;
  price: number;
  roomCount: number;
  capacity?: string;
  view?: string;
  images?: string[];
}
interface RoomFormProps {"""

content = content.replace('interface RoomFormProps {', interface_def)
content = content.replace('initialData?: Record<string, unknown> | null;', 'initialData?: RoomFormInitialData | null;')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed any typing")

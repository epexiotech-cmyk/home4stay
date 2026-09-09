# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/components/RoomForm.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 'any' violations introduced
content = content.replace('initialData?: any;', 'initialData?: Record<string, unknown> | null;')
content = content.replace('const asset = assets?.find((a: any) => a.url === imageUrl);', 'const asset = assets?.find((a: {url: string; id: string}) => a.url === imageUrl);')
content = content.replace('} catch (err: any) {', '} catch (err: unknown) {\n      const errorMessage = err instanceof Error ? err.message : "Failed to delete image";')
content = content.replace('alert(err.message || "Failed to delete image");', 'alert(errorMessage);')
content = content.replace('const payload: any = {', 'const payload: Record<string, unknown> = {')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed any")

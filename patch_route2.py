import os

filepath = 'apps/main-site/src/app/api/property/room/route.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure AppError is imported
if 'import { AppError }' not in content and 'AppError,' not in content and ', AppError' not in content:
    content = content.replace('import { withErrorHandler } from "@/lib/errors/handler";', 'import { withErrorHandler, AppError } from "@/lib/errors/handler";')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched route.ts")

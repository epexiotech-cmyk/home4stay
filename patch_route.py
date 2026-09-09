from pathlib import Path

p = Path('/home/apurv_patel/home4stay/apps/main-site/src/app/api/property/experiences/route.ts')
content = p.read_text(encoding='utf-8')

# 1. Add export const dynamic = 'force-dynamic';
if 'force-dynamic' not in content:
    content = 'export const dynamic = "force-dynamic";\n' + content

# 2. Add "partner" to requireRole
content = content.replace(
    '["admin", "super_admin", "owner", "manager"]',
    '["admin", "super_admin", "owner", "manager", "partner"]'
)

p.write_text(content, encoding='utf-8')
print("Patched route.ts successfully")

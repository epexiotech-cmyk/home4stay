import os

db_path = 'apps/main-site/src/app/(portal)/admin/database/page.tsx'
with open(db_path, 'r') as f:
    db_content = f.read()

db_content = db_content.replace(
    'import { useRouter } from " next/navigation\;\\nimport

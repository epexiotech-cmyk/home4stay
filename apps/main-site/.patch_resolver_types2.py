import re

path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'

with open(path, 'r') as f:
    content = f.read()

target = """  contact?: {
    phone?: string;
    whatsapp?: string;
  };"""

replace = """  contact?: {
    phone: string;
    whatsapp: string;
  };"""

if "phone: string" not in content:
    content = content.replace(target, replace)

with open(path, 'w') as f:
    f.write(content)

print("contextResolver types patched again")

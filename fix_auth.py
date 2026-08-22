import re

file_path = '/home/apurv_patel/home4stay/apps/main-site/src/context/AuthContext.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_logout = '''  const logout = async () => {
    try {
      await fetch(" /api/auth/logout\,

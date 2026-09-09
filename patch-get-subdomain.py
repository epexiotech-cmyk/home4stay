import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/getSubdomain.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """    // Default fallback for simple localhost:3000
    return "shivay"; """

new_code = """    // Return null if no subdomain is present in localhost
    return null; """

content = content.replace(old_code, new_code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("getSubdomain.ts patched.")

import os
import glob
import re

# 1. Find all API routes using successResponse
api_base = '/home/apurv_patel/home4stay/apps/main-site/src/app/api'
api_routes = glob.glob(os.path.join(api_base, '**', 'route.ts'), recursive=True)

success_apis = []
for route in api_routes:
    with open(route, 'r', encoding='utf-8') as f:
        content = f.read()
        if 'successResponse' in content:
            # normalize route path
            rel_path = os.path.relpath(os.path.dirname(route), api_base)
            success_apis.append('/api/' + rel_path.replace('\\', '/'))

print("APIs using successResponse:")
for api in success_apis:
    print(api)

print("\n--- Analysing tsx files ---\n")

# 2. Analyze partner TSX files
partner_base = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner'
tsx_files = glob.glob(os.path.join(partner_base, '**', '*.tsx'), recursive=True)

for file in tsx_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        if 'fetch(' in content and 'res.json()' in content:
            print(f"File: {os.path.relpath(file, partner_base)}")
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'fetch(' in line:
                    api_call = re.search(r'fetch\([`"\'](.*?)[`"\?\']', line)
                    if api_call:
                        api_path = api_call.group(1).split('?')[0]
                        print(f"  -> Calls: {api_path}")
                        # Look ahead for res.json() and handling
                        for j in range(i, min(i+15, len(lines))):
                            if 'res.json()' in lines[j]:
                                # Print a few lines after res.json()
                                for k in range(j, min(j+5, len(lines))):
                                    print(f"    {lines[k].strip()}")
                                break
            print("")

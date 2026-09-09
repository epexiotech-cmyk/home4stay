import os
import glob
import re

base_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner'
tsx_files = glob.glob(os.path.join(base_path, '**', '*.tsx'), recursive=True)

results = []

for file in tsx_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'res.json()' in content or 'fetch(' in content:
                # find all fetch blocks
                # To be simple, we just print the lines around 'fetch(' and 'res.json()'
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if 'fetch(' in line or 'res.json(' in line:
                        start = max(0, i - 2)
                        end = min(len(lines), i + 4)
                        block = '\n'.join(lines[start:end])
                        if file not in results:
                            results.append(f"\n--- {file} ---")
                        results.append(block)
                        results.append("...")
    except Exception as e:
        pass

with open('/home/apurv_patel/home4stay/fetch_audit.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
print("Audit script done.")

# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/app/(portal)/partner/properties/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix fetchProperty
if "const fetchProperty = async () => {" not in content:
    print("WARNING: fetchProperty not found in expected format")
else:
    # Let's extract fetchProperty from useEffect if it's there
    pass

# We can just manually rewrite the file with correct component logic to avoid complex regex
# Let's create a new page.tsx based on the existing one, but correctly formatted.

import os

base_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner'

# 1. Referrals
path = os.path.join(base_path, 'dashboard/referrals/page.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'const data = await res.json();\n      if (data.success) {\n        setProfile(data.profile);\n        setEvents(data.events || []);\n        setLedger(data.ledger || []);',
    'const json = await res.json();\n      const data = json.success && json.data ? json.data : json;\n      if (json.success) {\n        setProfile(data.profile);\n        setEvents(data.events || []);\n        setLedger(data.ledger || []);'
)
content = content.replace(
    'const data = await res.json();\n        if (data.success && isMounted) {\n          setProfile(data.profile);\n          setEvents(data.events || []);\n          setLedger(data.ledger || []);',
    'const json = await res.json();\n        const data = json.success && json.data ? json.data : json;\n        if (json.success && isMounted) {\n          setProfile(data.profile);\n          setEvents(data.events || []);\n          setLedger(data.ledger || []);'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Reviews
path = os.path.join(base_path, 'reviews/page.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'const data = await res.json();\n        setReviews(data.reviews);\n        setStats(data.stats);',
    'const json = await res.json();\n        const data = json.success && json.data ? json.data : json;\n        setReviews(data.reviews);\n        setStats(data.stats);'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 3. Calendar
path = os.path.join(base_path, 'calendar/page.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'const data = await res.json();\n          setRoomGroups(data.roomGroups || []);\n          setReservations(\n            (data.reservations || []).map(',
    'const json = await res.json();\n          const data = json.success && json.data ? json.data : json;\n          setRoomGroups(data.roomGroups || []);\n          setReservations(\n            (data.reservations || []).map('
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. Financials
path = os.path.join(base_path, 'financials/page.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'const data = await res.json();\n          setTransactions(data.transactions || []);\n          setInvoices(data.invoices || []);\n          setStats(data.stats || null);',
    'const json = await res.json();\n          const data = json.success && json.data ? json.data : json;\n          setTransactions(data.transactions || []);\n          setInvoices(data.invoices || []);\n          setStats(data.stats || null);'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 5. Bookings
path = os.path.join(base_path, 'bookings/page.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'const data = await response.json();\n        // Map DB schema to UI interface',
    'const json = await response.json();\n        const data = json.success && json.data ? json.data : json;\n        // Map DB schema to UI interface'
)
# Approvals / actions return successResponse({success: true, deleted: ...}) 
# The UI does `const data = await res.json(); if(res.ok && data.success)`. Since the data object is wrapped, data.success is actually true in the wrapper! It doesn't use the inner data, it only relies on res.ok and data.success.
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 6. Promotions
path = os.path.join(base_path, 'promotions/page.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'const data = await res.json();\n        setOffers(data);',
    'const json = await res.json();\n        const data = json.success && json.data ? json.data : json;\n        setOffers(data);'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# 7. Rooms
path = os.path.join(base_path, 'rooms/page.tsx')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'const data = await res.json();\n        setPropertySlug(data.propertySlug || "");\n        \n        // Map from API\n        const rawRooms: Array<Record<string, unknown>> = data.rooms || [];',
    'const json = await res.json();\n        const data = json.success && json.data ? json.data : json;\n        setPropertySlug(data.propertySlug || "");\n        \n        // Map from API\n        const rawRooms: Array<Record<string, unknown>> = data.rooms || [];'
)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patching complete.")

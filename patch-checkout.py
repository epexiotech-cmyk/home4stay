import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/app/booking/checkout/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_prop = 'propertyId: bookingState.propertyId || "shivay-resort-id",'
new_prop = 'propertyId: bookingState.propertyId,'

content = content.replace(old_prop, new_prop)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("checkout/page.tsx patched.")

import os

routes = {
    'referrals': 'apps/main-site/src/app/api/partner/referrals/route.ts',
    'meal-plans': 'apps/main-site/src/app/api/property/meal-plans/route.ts',
    'reviews': 'apps/main-site/src/app/api/property/reviews/route.ts',
    'calendar': 'apps/main-site/src/app/api/partner/calendar/route.ts',
    'financials': 'apps/main-site/src/app/api/partner/financials/route.ts',
    'bookings': 'apps/main-site/src/app/api/bookings/route.ts',
    'promotions': 'apps/main-site/src/app/api/property/promotions/route.ts',
    'rooms': 'apps/main-site/src/app/api/partner/rooms/route.ts',
    'billing': 'apps/main-site/src/app/api/partner/billing/dashboard/route.ts'
}

for name, path in routes.items():
    full_path = os.path.join('/home/apurv_patel/home4stay', path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'successResponse' in content:
                print(f"[{name}] uses successResponse")
            else:
                print(f"[{name}] does NOT use successResponse")
    else:
        print(f"[{name}] file not found at {path}")

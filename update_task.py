# -*- coding: utf-8 -*-
filepath = 'C:\\Users\\Apurv Patel\\.gemini\\antigravity-ide\\brain\\403f19b7-7881-4d57-b77a-a47526ab6748\\task.md'

with open(filepath, 'w', encoding='utf-8') as f:
    f.write("""- [x] Update `schema.prisma` with new `PropertyMealPlan` fields.
- [x] Run `npx prisma generate` and `npx prisma db push`.
- [x] Create `propertyMealPlanService.ts`.
- [x] Create `api/property/meal-plans/route.ts`.
- [x] Create `api/property/meal-plans/[id]/route.ts`.
- [x] Implement `apps/main-site/src/app/(portal)/partner/meal-plans/page.tsx`.
- [x] Update `contextResolver.ts` to filter active meal plans.
- [x] Verify functionality (tsc, build, manual check).""")

import re

path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/tenantUtils.ts'

with open(path, 'r') as f:
    content = f.read()

target = """export const PROPERTY_INCLUDES = {
  pageContent: { include: { sections: true } },
  mediaAssets: true,
  rooms: true,
  amenities: true,
  experiences: true,
  policies: true,
  pricing: true,
  owner: true,
  offers: true,
  reviews: { where: { isPublished: true } }
};"""

replace = """export const PROPERTY_INCLUDES = {
  pageContent: { include: { sections: true } },
  mediaAssets: true,
  rooms: true,
  amenities: true,
  experiences: true,
  policies: true,
  pricing: true,
  owner: { include: { hostProfile: true } },
  mealPlans: true,
  offers: true,
  reviews: { where: { isPublished: true } }
};"""

if "mealPlans: true" not in content:
    content = content.replace(target, replace)

with open(path, 'w') as f:
    f.write(content)

print("tenantUtils.ts updated.")

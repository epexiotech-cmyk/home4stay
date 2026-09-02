import re

schema_path = '/home/apurv_patel/home4stay/apps/main-site/prisma/schema.prisma'

with open(schema_path, 'r') as f:
    content = f.read()

target = """  onboardingStatus String            @default("NOT_STARTED") @map("onboarding_status")"""
replace = """  onboardingStatus String            @default("NOT_STARTED") @map("onboarding_status")
  location           String?
  contactPhone       String?           @map("contact_phone")
  contactWhatsapp    String?           @map("contact_whatsapp")
  aggregateRating    Float?            @map("aggregate_rating")"""

if "location           String?" not in content:
    content = content.replace(target, replace)

with open(schema_path, 'w') as f:
    f.write(content)

print("Schema fixed successfully.")

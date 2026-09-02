import re

schema_path = '/home/apurv_patel/home4stay/apps/main-site/prisma/schema.prisma'

with open(schema_path, 'r') as f:
    content = f.read()

# 1. Update Property model
property_target = """  shortDescription   String?   @map("short_description") @db.Text"""
property_replace = """  shortDescription   String?   @map("short_description") @db.Text
  location           String?
  contactPhone       String?   @map("contact_phone")
  contactWhatsapp    String?   @map("contact_whatsapp")
  aggregateRating    Float?    @map("aggregate_rating")"""

if "location           String?" not in content:
    content = content.replace(property_target, property_replace)

property_relation_target = """  drafts            OnboardingDraft[]"""
property_relation_replace = """  drafts            OnboardingDraft[]
  mealPlans         PropertyMealPlan[]"""

if "mealPlans         PropertyMealPlan[]" not in content:
    content = content.replace(property_relation_target, property_relation_replace)

# 2. Update PropertyPolicy model
policy_target = """  cancellationPolicy String   @map("cancellation_policy") @db.Text"""
policy_replace = """  cancellationPolicy String   @map("cancellation_policy") @db.Text
  houseRules         String?  @map("house_rules") @db.Text"""

if "houseRules         String?" not in content:
    content = content.replace(policy_target, policy_replace)


# 3. Update Room model
room_target = """  roomType   String?  @map("room_type")"""
room_replace = """  roomType   String?  @map("room_type")
  sizeSqFt   Int?     @map("size_sq_ft")
  bedType    String?  @map("bed_type")
  tags       Json     @default("[]")"""

if "sizeSqFt   Int?" not in content:
    content = content.replace(room_target, room_replace)


# 4. Add UserHostProfile model
host_profile_model = """
model UserHostProfile {
  id           String   @id @default(uuid())
  userId       String   @unique @map("user_id")
  bio          String?  @db.Text
  isSuperhost  Boolean  @default(false) @map("is_superhost")
  rating       Float?
  reviewsCount Int      @default(0) @map("reviews_count")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_host_profiles")
}
"""

if "model UserHostProfile" not in content:
    content = content + host_profile_model

# 5. Link User to UserHostProfile
user_target = """  guestProfileId String?    @unique @map("guest_profile_id")"""
user_replace = """  guestProfileId String?    @unique @map("guest_profile_id")
  hostProfile    UserHostProfile?"""

if "hostProfile    UserHostProfile?" not in content:
    content = content.replace(user_target, user_replace)


# 6. Add PropertyMealPlan model
meal_plan_model = """
model PropertyMealPlan {
  id          String   @id @default(uuid())
  propertyId  String   @map("property_id")
  name        String
  label       String
  description String?  @db.Text
  price       Float    @default(0.0)
  inclusions  Json     @default("[]")
  isPopular   Boolean  @default(false) @map("is_popular")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@map("property_meal_plans")
}
"""

if "model PropertyMealPlan" not in content:
    content = content + meal_plan_model

with open(schema_path, 'w') as f:
    f.write(content)

print("Schema updated successfully.")

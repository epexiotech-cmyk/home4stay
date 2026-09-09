# -*- coding: utf-8 -*-
filepath = 'apps/main-site/prisma/schema.prisma'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """model PropertyMealPlan {
  id          String   @id @default(uuid())
  propertyId  String   @map("property_id")
  name        String
  label       String
  description String?
  price       Float    @default(0.0)
  inclusions  Json     @default("[]")
  isPopular   Boolean  @default(false) @map("is_popular")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@map("property_meal_plans")
}"""

replacement = """model PropertyMealPlan {
  id          String   @id @default(uuid())
  propertyId  String   @map("property_id")
  name        String
  label       String
  description String?
  price       Float    @default(0.0)
  inclusions  Json     @default("[]")
  isPopular   Boolean  @default(false) @map("is_popular")
  mealType    String   @default("VEG") @map("meal_type")
  packageCode String?  @map("package_code")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@map("property_meal_plans")
}"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced PropertyMealPlan")
else:
    print("Could not find target content")


import { prisma } from "@/lib/database/prisma";

export const PREDEFINED_PACKAGES = [
  { code: "BREAKFAST_ONLY", name: "Breakfast Only", description: "Breakfast included" },
  { code: "LUNCH_ONLY", name: "Lunch Only", description: "Lunch included" },
  { code: "DINNER_ONLY", name: "Dinner Only", description: "Dinner included" },
  { code: "BREAKFAST_DINNER", name: "Breakfast & Dinner", description: "Breakfast + Dinner included" },
  { code: "BREAKFAST_LUNCH_DINNER", name: "Breakfast, Lunch & Dinner", description: "All meals included" },
  { code: "MEAL_NOT_INCLUDED", name: "Meal Not Included", description: "No meals included" },
];

export const PropertyMealPlanService = {
  /**
   * Fetch all meal plans for a specific property.
   */
  async getMealPlans(propertyId: string) {
    return prisma.propertyMealPlan.findMany({
      where: { propertyId },
      orderBy: { createdAt: "asc" },
    });
  },

  /**
   * Upsert a predefined package.
   */
  async upsertPredefinedPackage({
    propertyId,
    mealType,
    packageCode,
    price,
    isActive,
  }: {
    propertyId: string;
    mealType: string;
    packageCode: string;
    price?: number;
    isActive: boolean;
  }) {
    const predefined = PREDEFINED_PACKAGES.find((p) => p.code === packageCode);
    if (!predefined) throw new Error("Invalid predefined package code");

    if (isActive && (price === undefined || price < 0)) throw new Error("Valid price is required for active packages");
    if (mealType !== "VEG" && mealType !== "NON_VEG") throw new Error("Invalid meal type");

    // Find if it already exists
    const existing = await prisma.propertyMealPlan.findFirst({
      where: {
        propertyId,
        mealType,
        packageCode,
      },
    });

    if (existing) {
      const dataToUpdate: any = { isActive };
      if (price !== undefined) dataToUpdate.price = price;
      return prisma.propertyMealPlan.update({
        where: { id: existing.id },
        data: dataToUpdate,
      });
    }

    // Create if not exists
    return prisma.propertyMealPlan.create({
      data: {
        propertyId,
        name: predefined.name,
        label: predefined.name,
        description: predefined.description,
        mealType,
        packageCode,
        price: price ?? 0,
        isActive,
      },
    });
  },

  /**
   * Create a custom package.
   */
  async createCustomPackage({
    propertyId,
    name,
    mealType,
    price,
    description,
    inclusions,
    isActive,
  }: {
    propertyId: string;
    name: string;
    mealType: string;
    price: number;
    description: string;
    inclusions: any;
    isActive: boolean;
  }) {
    // Validate uniqueness
    const existing = await prisma.propertyMealPlan.findFirst({
      where: {
        propertyId,
        name,
        mealType,
      },
    });

    if (existing) {
      throw new Error(`A ${mealType} package named "${name}" already exists for this property.`);
    }

    return prisma.propertyMealPlan.create({
      data: {
        propertyId,
        name,
        label: name,
        description,
        mealType,
        price,
        inclusions,
        isActive,
        packageCode: null, // null for custom
      },
    });
  },

  /**
   * Update an existing package (custom or predefined price/status).
   */
  async updatePackage(id: string, propertyId: string, data: Partial<{ isActive: boolean; price: number; description: string }>) {
    const existing = await prisma.propertyMealPlan.findUnique({ where: { id } });
    if (!existing || existing.propertyId !== propertyId) {
      throw new Error("Meal plan not found or access denied.");
    }

    return prisma.propertyMealPlan.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete a custom package. Predefined packages should only be deactivated.
   */
  async deletePackage(id: string, propertyId: string) {
    const existing = await prisma.propertyMealPlan.findUnique({ where: { id } });
    if (!existing || existing.propertyId !== propertyId) {
      throw new Error("Meal plan not found or access denied.");
    }

    if (existing.packageCode) {
      throw new Error("Cannot delete a predefined package. Deactivate it instead.");
    }

    return prisma.propertyMealPlan.delete({
      where: { id },
    });
  },
};



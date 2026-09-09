const fs = require('fs');

function patchService() {
    const path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/services/propertyMealPlanService.ts';
    let content = fs.readFileSync(path, 'utf-8');

    const target = \  /**
   * Upsert a predefined package.
   */
  async upsertPredefinedPackage({
    propertyId,
    mealType,
    packageCode,
    isActive,
  }: {
    propertyId: string;
    mealType: string;
    packageCode: string;
    isActive: boolean;
  }) {
    const predefined = PREDEFINED_PACKAGES.find((p) => p.code === packageCode);
    if (!predefined) throw new Error("Invalid predefined package code");

    // Find if it already exists
    const existing = await prisma.propertyMealPlan.findFirst({
      where: {
        propertyId,
        mealType,
        packageCode,
      },
    });

    if (existing) {
      return prisma.propertyMealPlan.update({
        where: { id: existing.id },
        data: { isActive },
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
        isActive,
      },
    });
  }\;

    const replacement = \  /**
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
    price: number;
    isActive: boolean;
  }) {
    const predefined = PREDEFINED_PACKAGES.find((p) => p.code === packageCode);
    if (!predefined) throw new Error("Invalid predefined package code");

    if (price < 0) throw new Error("Price cannot be negative");
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
      return prisma.propertyMealPlan.update({
        where: { id: existing.id },
        data: { isActive, price },
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
        price,
        isActive,
      },
    });
  }\;

    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Patched service successfully');
}

function patchRoute() {
    const path = '/home/apurv_patel/home4stay/apps/main-site/src/app/api/property/meal-plans/route.ts';
    let content = fs.readFileSync(path, 'utf-8');

    const target = \    // Determine if it's predefined upsert or custom create
    if (body.packageCode) {
      // Upsert predefined
      const result = await PropertyMealPlanService.upsertPredefinedPackage({
        propertyId,
        mealType: body.mealType,
        packageCode: body.packageCode,
        isActive: body.isActive ?? true,
      });
      return NextResponse.json(result);
    } else {\;

    const replacement = \    // Determine if it's predefined upsert or custom create
    if (body.packageCode) {
      // Upsert predefined
      if (typeof body.price !== "number" || body.price < 0) {
        return NextResponse.json({ error: "Valid price is required for package" }, { status: 400 });
      }
      if (body.mealType !== "VEG" && body.mealType !== "NON_VEG") {
        return NextResponse.json({ error: "Invalid meal type" }, { status: 400 });
      }

      const result = await PropertyMealPlanService.upsertPredefinedPackage({
        propertyId,
        mealType: body.mealType,
        packageCode: body.packageCode,
        price: body.price,
        isActive: body.isActive ?? true,
      });
      return NextResponse.json(result);
    } else {\;

    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log('Patched route successfully');
}

patchService();
patchRoute();

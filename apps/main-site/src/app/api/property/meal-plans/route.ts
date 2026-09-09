import { NextRequest, NextResponse } from "next/server";
import { PropertyMealPlanService } from "@/lib/services/propertyMealPlanService";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access-token")?.value || req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.propertyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const propertyId = payload.propertyId as string;
    const plans = await PropertyMealPlanService.getMealPlans(propertyId);

    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET meal plans error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access-token")?.value || req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.propertyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const propertyId = payload.propertyId as string;
    const body = await req.json();
    
    // Determine if it's predefined upsert or custom create
    if (body.packageCode) {
      // Upsert predefined
      const isActive = body.isActive ?? true;
      if (isActive && (typeof body.price !== "number" || body.price < 0)) {
        return NextResponse.json({ error: "Valid price is required for active package" }, { status: 400 });
      }
      if (body.mealType !== "VEG" && body.mealType !== "NON_VEG") {
        return NextResponse.json({ error: "Invalid meal type" }, { status: 400 });
      }

      const result = await PropertyMealPlanService.upsertPredefinedPackage({
        propertyId,
        mealType: body.mealType,
        packageCode: body.packageCode,
        price: body.price,
        isActive: isActive,
      });
      return NextResponse.json(result);
    } else {
      // Create custom
      const { name, mealType, price, description, inclusions, isActive } = body;
      
      if (!name || price === undefined || !mealType) {
        return NextResponse.json({ error: "Missing required fields for custom package" }, { status: 400 });
      }

      const result = await PropertyMealPlanService.createCustomPackage({
        propertyId,
        name,
        mealType,
        price,
        description,
        inclusions: inclusions || [],
        isActive: isActive ?? true,
      });
      return NextResponse.json(result);
    }
  } catch (error: any) {
    console.error("POST meal plans error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}



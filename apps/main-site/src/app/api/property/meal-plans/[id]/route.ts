import { NextRequest, NextResponse } from "next/server";
import { PropertyMealPlanService } from "@/lib/services/propertyMealPlanService";
import { verifyToken } from "@/lib/auth/jwt";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("access-token")?.value || req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.propertyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const propertyId = payload.propertyId as string;
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const result = await PropertyMealPlanService.updatePackage(id, propertyId, body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("PATCH meal plan error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("access-token")?.value || req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload?.propertyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const propertyId = payload.propertyId as string;
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const result = await PropertyMealPlanService.deletePackage(id, propertyId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DELETE meal plan error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

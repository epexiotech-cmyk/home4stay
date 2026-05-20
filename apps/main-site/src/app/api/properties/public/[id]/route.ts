import { NextRequest, NextResponse } from "next/server";
import { resolvePropertyContext, getPropertyBranding } from "@/lib/tenant/contextResolver";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await resolvePropertyContext(id);

    if (!property) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    const branding = getPropertyBranding(property);

    return NextResponse.json({
      id: property.id || id,
      name: property.name,
      location: property.location,
      branding,
    });
  } catch (error) {
    console.error("Error fetching public property data:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

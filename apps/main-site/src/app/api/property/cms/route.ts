import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma as db } from "@/lib/database/prisma";
import { z } from "zod";

const CmsUpdateSchema = z.object({
  propertyId: z.string(),
  sections: z.array(z.any()).optional(),
  amenities: z.array(z.any()).optional(),
  faqs: z.array(z.any()).optional(),
  policies: z.any().optional(),
  seo: z.any().optional(),
  contact: z.any().optional(),
  branding: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { authorized, role, propertyId: sessionPropertyId, response } = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
    
    if (!authorized) {
      return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = CmsUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    // RBAC: Owners can only edit their own property
    if (role !== "admin" && role !== "super_admin") {
      if (data.propertyId !== sessionPropertyId) {
        return NextResponse.json({ error: "Forbidden: You can only manage CMS for your assigned property" }, { status: 403 });
      }
    }

    // Update the property in the database
    // Note: In our hybrid mock system, this will update the persistent mock state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedProperty = await (db.property as any).update({
      where: { id: data.propertyId },
      data: {
        pageContent: data.sections ? { sections: data.sections } : undefined,
        amenities: data.amenities,
        faqs: data.faqs,
        policies: data.policies,
        seo: data.seo,
        contact: data.contact,
        branding: data.branding
      }
    });

    return NextResponse.json({
      success: true,
      message: "CMS content published successfully",
      property: updatedProperty
    });

  } catch (error) {
    console.error("CMS Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const property = await (db.property as any).findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        pageContent: true,
        amenities: true,
        faqs: true,
        policies: true,
        seo: true,
        contact: true,
        branding: true
      }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);

  } catch (error) {
    console.error("CMS Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

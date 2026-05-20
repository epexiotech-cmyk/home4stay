import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma as db } from "@/lib/database/prisma";
import { z } from "zod";

const OfferSchema = z.object({
  propertyId: z.string(),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  offerType: z.enum(["discount", "package", "seasonal", "early_bird"]),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number(),
  couponCode: z.string().min(3),
  minimumBookingAmount: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  applicableRooms: z.array(z.string()),
  applicableExperiences: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const isActive = searchParams.get("isActive") === "true" ? true : undefined;

    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
    }

    const offers = await db.propertyOffer.findMany({
      where: {
        propertyId,
        isActive
      }
    });

    return NextResponse.json(offers);

  } catch (error) {
    console.error("Offers Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role, propertyId: sessionPropertyId, response } = await requireRole(request, ["admin", "owner", "partner", "manager"]);
    
    if (!authorized) {
      return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = OfferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    if (role !== "admin" && data.propertyId !== sessionPropertyId) {
      return NextResponse.json({ error: "Forbidden: Cross-tenant promotion creation" }, { status: 403 });
    }

    const newOffer = await db.propertyOffer.create({ data });
    return NextResponse.json(newOffer);

  } catch (error) {
    console.error("Offer Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { authorized, role, propertyId: sessionPropertyId, response } = await requireRole(request, ["admin", "owner", "partner", "manager"]);
    
    if (!authorized) {
      return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "Missing offer ID" }, { status: 400 });

    // OWNERSHIP VALIDATION
    const offer = await db.propertyOffer.findUnique({ where: { id } });
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    if (role !== "admin" && role !== "super_admin" && offer.propertyId !== sessionPropertyId) {
      return NextResponse.json({ error: "Forbidden: Cross-tenant promotion update denied" }, { status: 403 });
    }

    const updatedOffer = await db.propertyOffer.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedOffer);

  } catch (error) {
    console.error("Offer Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized } = await requireRole(request, ["admin", "owner", "partner"]);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing offer ID" }, { status: 400 });

    // OWNERSHIP VALIDATION
    const { role, propertyId: sessionPropertyId } = await requireRole(request, ["admin", "owner", "partner"]);
    const offer = await db.propertyOffer.findUnique({ where: { id } });
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    if (role !== "admin" && role !== "super_admin" && offer.propertyId !== sessionPropertyId) {
      return NextResponse.json({ error: "Forbidden: Cross-tenant promotion deletion denied" }, { status: 403 });
    }

    await db.propertyOffer.delete({ where: { id } });
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Offer Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

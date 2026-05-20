import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma as db } from "@/lib/database/prisma";
import { z } from "zod";

const RoomSchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  capacity: z.string().min(1),
  view: z.string().min(1),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    const { role, propertyId: sessionPropertyId } = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager", "customer"]);
    
    if (role !== "admin" && role !== "super_admin" && role !== "customer") {
      if (propertyId !== sessionPropertyId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const rooms = await db.room.findMany({
      where: { propertyId }
    });

    return NextResponse.json(rooms);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, role, propertyId: sessionPropertyId, response } = await requireRole(request, ["admin", "super_admin", "owner", "partner"]);
    if (!authorized) return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = RoomSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;

    if (role !== "admin" && role !== "super_admin" && data.propertyId !== sessionPropertyId) {
      return NextResponse.json({ error: "Forbidden: Cross-tenant room creation" }, { status: 403 });
    }

    const room = await db.room.create({ data });
    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { authorized, role, propertyId: sessionPropertyId, response } = await requireRole(request, ["admin", "super_admin", "owner", "partner"]);
    if (!authorized) return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const room = await db.room.findUnique({ where: { id } });
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (role !== "admin" && role !== "super_admin" && room.propertyId !== sessionPropertyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.room.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, role, propertyId: sessionPropertyId, response } = await requireRole(request, ["admin", "super_admin", "owner", "partner"]);
    if (!authorized) return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const room = await db.room.findUnique({ where: { id } });
    if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (role !== "admin" && role !== "super_admin" && room.propertyId !== sessionPropertyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.room.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const propertyId = request.nextUrl.searchParams.get("propertyId");
    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
    }

    // 1. STRICT TENANT ISOLATION CHECK
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) return auth.response!;

    // 2. QUERY PHYSICAL DATABASE FOR ROOMS
    const dbRooms = await prisma.room.findMany({
      where: { propertyId, isActive: true },
      orderBy: { createdAt: "asc" }
    });

    // 3. MAP DATABASE ROOMS DYNAMICALLY TO THE REQUIRED FRONTEND RoomGroup CONTRACT
    const roomGroups = dbRooms.map((r, index) => {
      // Map to separate sub-rooms based on database entries
      return {
        name: r.name,
        rooms: [
          { id: r.id, name: `${r.name} Room ${101 + index}`, type: r.view, status: "clean" as const }
        ]
      };
    });

    return NextResponse.json({ success: true, roomGroups, propertySlug: auth.propertySlug });
  } catch (error) {
    console.error("Rooms fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms data" }, { status: 500 });
  }
}

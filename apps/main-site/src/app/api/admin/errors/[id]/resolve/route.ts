import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("access-token")?.value || req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const { id } = await params;

    const errorRecord = await prisma.systemError.findUnique({
      where: { id }
    });

    if (!errorRecord) {
      return NextResponse.json({ error: "Error not found" }, { status: 404 });
    }

    await prisma.systemError.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to resolve error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

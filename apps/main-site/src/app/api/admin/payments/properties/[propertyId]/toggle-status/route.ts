import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;

    // 1. Authenticate caller (Admin/Super Admin only)
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status || !["LIVE", "SUSPENDED", "INACTIVE"].includes(status)) {
      return NextResponse.json({ error: "Invalid property status requested" }, { status: 400 });
    }

    // 2. Fetch property record
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // 3. Process Status Toggle
    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: { status }
      });

      // Fetch the last transaction for this property to write audit records
      const lastTx = await tx.paymentTransaction.findFirst({
        where: { propertyId },
        orderBy: { createdAt: "desc" }
      });

      if (lastTx) {
        await tx.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "PROPERTY_VISIBILITY_OVERRIDE",
            oldStatus: property.status,
            newStatus: status,
            performedBy: auth.userId,
            metadata: {
              toggledAt: new Date(),
              propertyTitle: property.title
            }
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Property visibility successfully modified to ${status}`
    });

  } catch (error) {
    console.error("[ADMIN_PROPERTY_TOGGLE_STATUS] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

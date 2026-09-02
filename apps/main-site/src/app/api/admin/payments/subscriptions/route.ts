import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller (Admin/Super Admin only)
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statusParam = request.nextUrl.searchParams.get("status") || "ALL";

    // 2. Build where filter clauses
    const whereClause: Prisma.PropertySubscriptionWhereInput = {};
    if (statusParam !== "ALL") {
      whereClause.status = statusParam as SubscriptionStatus;
    }

    // 3. Query all subscriptions
    const subscriptions = await prisma.propertySubscription.findMany({
      where: whereClause,
      include: {
        property: true
      },
      orderBy: { createdAt: "desc" }
    });

    // Helper: Safe double-lookup to fetch the owner for a property
    const resolveOwnerDetails = async (propertyId: string) => {
      const ownerAccess = await prisma.propertyUserAccess.findFirst({
        where: {
          propertyId,
          role: "owner"
        },
        include: {
          user: true
        }
      });
      if (ownerAccess?.user) {
        return {
          name: ownerAccess.user.name,
          email: ownerAccess.user.email
        };
      }

      // Fallback
      const property = await prisma.property.findUnique({
        where: { id: propertyId }
      });
      if (property && property.ownerId) {
        const user = await prisma.user.findUnique({
          where: { id: property.ownerId }
        });
        if (user) {
          return {
            name: user.name,
            email: user.email
          };
        }
      }
      return {
        name: "Platform Owner",
        email: "owner@home4stay.com"
      };
    };

    const payload = await Promise.all(subscriptions.map(async (sub) => {
      const owner = await resolveOwnerDetails(sub.propertyId);
      return {
        id: sub.id,
        propertyId: sub.propertyId,
        propertyName: sub.property.title,
        propertyStatus: sub.property.status,
        ownerName: owner.name,
        ownerEmail: owner.email,
        selectedPlanId: sub.selectedPlanId,
        status: sub.status,
        billingCycle: sub.billingCycle,
        amount: sub.amount,
        startsAt: sub.startsAt,
        expiresAt: sub.expiresAt,
        activatedAt: sub.activatedAt,
        suspendedAt: sub.suspendedAt,
        createdAt: sub.createdAt
      };
    }));

    return NextResponse.json({
      success: true,
      subscriptions: payload
    });

  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTIONS_LIST_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

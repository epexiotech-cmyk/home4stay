import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/database/prisma";
import { SubscriptionLifecycleService } from "@/modules/payments/services/subscriptionLifecycle";
import { SubscriptionStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access-token")?.value || cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== "super_admin" && payload.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { renew } = await request.json();
    if (typeof renew !== "boolean") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const latestSub = property.subscriptions[0];
    if (!latestSub) {
      return NextResponse.json({ error: "No subscription found for property" }, { status: 400 });
    }

    const isCurrentlyRenewed = 
      latestSub.status === SubscriptionStatus.ACTIVE || 
      latestSub.status === SubscriptionStatus.RENEWED;

    if (renew && isCurrentlyRenewed) {
       return NextResponse.json({ success: true, status: "LIVE" });
    }
    
    if (!renew && (latestSub.status === SubscriptionStatus.SUSPENDED || latestSub.status === SubscriptionStatus.SUSPENDED_OVERDUE)) {
       return NextResponse.json({ success: true, status: "SUSPENDED" });
    }

    if (renew) {
      await SubscriptionLifecycleService.activateSubscription(latestSub.id, payload.id as string);
    } else {
      await SubscriptionLifecycleService.suspendSubscription(latestSub.id, payload.id as string);
    }
    
    return NextResponse.json({ success: true, status: renew ? "LIVE" : "SUSPENDED" });
  } catch (error: any) {
    console.error("Failed to update renewal status", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

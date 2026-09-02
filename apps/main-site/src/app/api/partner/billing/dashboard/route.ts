import { NextRequest, NextResponse } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { getAvailablePlans, getPropertyEntitlements } from "@/modules/payments/services/entitlements";
import { getActivePaymentProvider } from "@/modules/payments/services/resolver";

export async function GET(request: NextRequest) {
  try {
    const propertyId = request.nextUrl.searchParams.get("propertyId") || "";
    if (!propertyId) {
      return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
    }

    // 1. Authenticate caller (Multi-tenant secure boundary check)
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch current subscription history
    const subscription = await prisma.propertySubscription.findFirst({
      where: { propertyId },
      orderBy: { createdAt: "desc" }
    });

    // 3. Resolve active entitlements based on the plan and subscription state
    const entitlements = await getPropertyEntitlements(propertyId);

    // 4. Calculate actual usages for live limit progress bars
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      propertiesCount,
      roomsCount,
      imagesCount,
      videosCount,
      bookingsCount
    ] = await Promise.all([
      prisma.property.count({
        where: { ownerId: auth.userId }
      }),
      prisma.room.count({
        where: { propertyId }
      }),
      prisma.mediaAsset.count({
        where: { propertyId, assetType: { not: "VIDEO" } }
      }),
      prisma.mediaAsset.count({
        where: { propertyId, assetType: "VIDEO" }
      }),
      prisma.booking.count({
        where: {
          propertyId,
          status: { in: ["CONFIRMED", "confirmed", "CHECKED_IN", "checked_in"] },
          createdAt: { gte: startOfMonth }
        }
      })
    ]);

    // 5. Fetch available global plans
    const availablePlans = await getAvailablePlans();

    // 6. Resolve current platform payment channels securely
    let activeProvider = null;
    try {
      activeProvider = await getActivePaymentProvider();
    } catch (providerError) {
      // Gracefully swallow if no default provider is active yet
      console.warn("[BILLING_DASHBOARD_API] Active provider not resolved:", providerError);
    }

    // 7. Get transaction logs
    const transactions = await prisma.paymentTransaction.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    // 7b. Get invoice logs linked to current owner
    const invoices = await prisma.invoice.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json({
      success: true,
      subscription: subscription ? {
        id: subscription.id,
        selectedPlanId: subscription.selectedPlanId,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        amount: subscription.amount,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        activatedAt: subscription.activatedAt
      } : null,
      entitlements,
      usages: {
        properties: { current: propertiesCount, limit: entitlements.maxProperties },
        rooms: { current: roomsCount, limit: entitlements.maxRoomListings },
        images: { current: imagesCount, limit: entitlements.maxImagesPerProperty },
        videos: { current: videosCount, limit: entitlements.maxVideosPerProperty },
        bookings: { current: bookingsCount, limit: entitlements.maxBookingsPerMonth }
      },
      plans: availablePlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        shortDescription: plan.shortDescription,
        monthlyPrice: plan.monthlyPrice,
        quarterlyPrice: plan.quarterlyPrice,
        yearlyPrice: plan.yearlyPrice,
        lifetimePrice: plan.lifetimePrice,
        maxProperties: plan.maxProperties,
        maxRoomListings: plan.maxRoomListings,
        maxImagesPerProperty: plan.maxImagesPerProperty,
        maxVideosPerProperty: plan.maxVideosPerProperty,
        maxBookingsPerMonth: plan.maxBookingsPerMonth,
        supportPriority: plan.supportPriority,
        customBadge: plan.customBadge,
        featureFlags: typeof plan.featureFlags === "string" ? JSON.parse(plan.featureFlags) : plan.featureFlags
      })),
      activeProvider: activeProvider ? {
        id: activeProvider.id,
        providerType: activeProvider.providerType,
        displayName: activeProvider.displayName,
        instructions: activeProvider.instructions,
        upiId: activeProvider.upiId,
        merchantName: activeProvider.merchantName,
        qrImageUrl: activeProvider.qrImageUrl,
        supportNumber: activeProvider.supportNumber,
        supportEmail: activeProvider.supportEmail
      } : null,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        paymentStatus: t.paymentStatus,
        utrNumber: t.utrNumber,
        createdAt: t.createdAt,
        paidAt: t.paidAt
      })),
      invoices: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceType: inv.invoiceType,
        status: inv.status,
        subtotal: inv.subtotal,
        gstPercent: inv.gstPercent,
        gstAmount: inv.gstAmount,
        totalAmount: inv.totalAmount,
        invoicePdfUrl: inv.invoicePdfUrl,
        issuedAt: inv.issuedAt,
        createdAt: inv.createdAt
      }))
    });

  } catch (error) {
    console.error("[BILLING_DASHBOARD_GET] Error loading details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


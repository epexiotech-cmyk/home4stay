import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { ReferralService } from "@/lib/referral/referralService";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller (Must be admin or super_admin)
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all referral events (highlighting PENDING and FRAUD_FLAGGED first)
    const events = await prisma.referralEvent.findMany({
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            gstin: true,
          },
        },
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            gstin: true,
          },
        },
      },
      orderBy: [
        { status: "desc" }, // Orders roughly so FRAUD_FLAGGED/PENDING are grouped
        { createdAt: "desc" },
      ],
    });

    // 3. Fetch top referrers
    const topReferrers = await prisma.referralProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { lifetimeCredits: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        status: e.status,
        creditsAwarded: e.creditsAwarded,
        awardedAt: e.awardedAt,
        metadata: e.metadata,
        createdAt: e.createdAt,
        referrer: {
          id: e.referrer.id,
          name: e.referrer.name || "Registered Partner",
          email: e.referrer.email,
          phone: e.referrer.phone || "N/A",
          gstin: e.referrer.gstin || "N/A",
        },
        referred: {
          id: e.referred.id,
          name: e.referred.name || "Registered Partner",
          email: e.referred.email,
          phone: e.referred.phone || "N/A",
          gstin: e.referred.gstin || "N/A",
        },
      })),
      topReferrers: topReferrers.map((r) => ({
        id: r.id,
        referralCode: r.referralCode,
        totalCredits: r.totalCredits,
        lifetimeCredits: r.lifetimeCredits,
        pendingCredits: r.pendingCredits,
        redeemedCredits: r.redeemedCredits,
        userName: r.user.name || "Owner",
        userEmail: r.user.email,
      })),
    });
  } catch (error) {
    console.error("[ADMIN_REFERRALS_GET] Error fetching administrative referrals:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch administrative referrals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate caller (Must be admin or super_admin)
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUserId = auth.userId;
    const body = await request.json();

    const { eventId, action, notes } = body;

    if (!eventId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters. Require eventId and action ('APPROVE'|'REJECT')" }, { status: 400 });
    }

    // 2. Perform administrative override
    const updatedEvent = await ReferralService.reviewFraudFlag({
      eventId,
      action,
      adminUserId,
      notes: notes || `Admin reviewed via Super Admin Panel.`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully resolved fraud flagged referral event. Status set to: ${updatedEvent.status}`,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("[ADMIN_REFERRALS_POST] Error resolving fraud flag:", error);
    const message = error instanceof Error ? error.message : "Failed to resolve fraud flag";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

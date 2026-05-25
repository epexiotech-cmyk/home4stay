import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { ReferralService } from "@/lib/referral/referralService";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate caller (Must be owner or manager)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.userId;

    // 2. Fetch or bootstrap the referral profile
    const profile = await ReferralService.getOrCreateProfile(userId);

    // 3. Query related referral histories
    const referralEvents = await prisma.referralEvent.findMany({
      where: { referrerUserId: userId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const ledgerEntries = await prisma.referralCreditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const redemptions = await prisma.referralRewardRedemption.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 4. Return complete referral dataset
    return NextResponse.json({
      success: true,
      profile: {
        referralCode: profile.referralCode,
        totalCredits: profile.totalCredits,
        lifetimeCredits: profile.lifetimeCredits,
        pendingCredits: profile.pendingCredits,
        redeemedCredits: profile.redeemedCredits,
        createdAt: profile.createdAt,
      },
      events: referralEvents.map((evt) => ({
        id: evt.id,
        referredUser: {
          name: evt.referred.name || "Registered Partner",
          email: evt.referred.email,
        },
        status: evt.status,
        creditsAwarded: evt.creditsAwarded,
        awardedAt: evt.awardedAt,
        createdAt: evt.createdAt,
      })),
      ledger: ledgerEntries.map((l) => ({
        id: l.id,
        eventType: l.eventType,
        credits: l.credits,
        balanceAfter: l.balanceAfter,
        notes: l.notes,
        createdAt: l.createdAt,
      })),
      redemptions: redemptions.map((r) => ({
        id: r.id,
        creditsUsed: r.creditsUsed,
        rewardType: r.rewardType,
        discountAmount: r.discountAmount,
        billingCycle: r.billingCycle,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("[PARTNER_REFERRALS_GET] Error fetching referral details:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch referral details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

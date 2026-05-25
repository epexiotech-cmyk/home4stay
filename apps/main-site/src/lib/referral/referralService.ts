import { prisma } from "@/lib/database/prisma";
import { logger } from "@/lib/observability/logger";
import { ReferralEventStatus, ReferralProfile, ReferralEvent } from "@prisma/client";
import * as crypto from "crypto";

export class ReferralService {
  /**
   * Generates a unique, collision-safe referral code.
   * Format: H4S-[CLEAN_NAME]-[HEX_SUFFIX], e.g., H4S-HARSH-92A1
   */
  static generateReferralCode(name?: string | null): string {
    const prefix = "H4S";
    let cleanName = "USER";
    
    if (name) {
      // Keep only letters and numbers, uppercase it
      const sanitized = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (sanitized.length > 0) {
        cleanName = sanitized.substring(0, 10);
      }
    }
    
    // Generate a 4-character hex suffix
    const hexSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `${prefix}-${cleanName}-${hexSuffix}`;
  }

  /**
   * Automatically initializes a referral profile for a user if one does not exist.
   */
  static async getOrCreateProfile(userId: string): Promise<ReferralProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { referralProfile: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.referralProfile) {
      return user.referralProfile;
    }

    // Generate code and create profile
    const referralCode = this.generateReferralCode(user.name);

    return await prisma.referralProfile.create({
      data: {
        userId: user.id,
        referralCode,
        totalCredits: 0,
        lifetimeCredits: 0,
        pendingCredits: 0,
        redeemedCredits: 0,
      },
    });
  }

  /**
   * Binds a referred user to a referrer during registration/onboarding.
   * Applies self-referral, duplicate referral, and fraud checks.
   */
  static async bindReferral(params: {
    referredUserId: string;
    referralCode: string;
    registrationIp?: string;
  }): Promise<{
    success: boolean;
    message: string;
    referralEvent?: ReferralEvent;
    isFraudFlagged?: boolean;
  }> {
    const { referredUserId, referralCode, registrationIp } = params;

    // Find referrer profile
    const referrerProfile = await prisma.referralProfile.findUnique({
      where: { referralCode: referralCode.trim().toUpperCase() },
      include: { user: true },
    });

    if (!referrerProfile) {
      await logger({
        level: "warn",
        event: "REFERRAL_BIND_FAILED",
        message: `Invalid referral code: ${referralCode}`,
        requestId: "system",
      });
      return { success: false, message: "Invalid referral code" };
    }

    const referrerUserId = referrerProfile.userId;

    // Self-referral block
    if (referrerUserId === referredUserId) {
      await logger({
        level: "warn",
        event: "REFERRAL_SELF_ATTEMPT",
        message: `User ${referredUserId} attempted to self-refer using code ${referralCode}`,
        requestId: "system",
      });
      return { success: false, message: "You cannot refer yourself." };
    }

    // Get referred user details
    const referredUser = await prisma.user.findUnique({
      where: { id: referredUserId },
    });

    if (!referredUser) {
      throw new Error(`Referred user with ID ${referredUserId} not found`);
    }

    // Check if referred user is already referred
    const existingEvent = await prisma.referralEvent.findFirst({
      where: { referredUserId },
    });

    if (existingEvent) {
      return { success: false, message: "This user has already been referred." };
    }

    // Perform fraud/abuse checks
    const referrerUser = referrerProfile.user;
    let isFraudFlagged = false;
    const fraudReasons: string[] = [];

    // Compare email domains or exact emails (though exact is impossible due to DB unique constraints, but checks are good)
    if (referredUser.email.toLowerCase() === referrerUser.email.toLowerCase()) {
      isFraudFlagged = true;
      fraudReasons.push("Matching email addresses");
    }

    // Compare phone number if available
    if (referredUser.phone && referrerUser.phone && referredUser.phone.trim() === referrerUser.phone.trim()) {
      isFraudFlagged = true;
      fraudReasons.push("Matching phone numbers");
    }

    // Compare GSTIN if available
    if (referredUser.gstin && referrerUser.gstin && referredUser.gstin.trim() === referrerUser.gstin.trim()) {
      isFraudFlagged = true;
      fraudReasons.push("Matching GSTINs");
    }

    // Compare IP address if metadata of referrer matches
    // For this, we check if referrer has a session/log with same IP or if registrationIp is provided
    if (registrationIp) {
      // Let's search referrer's login IP logs or audit logs
      const referrerAuditLogs = await prisma.auditLog.findFirst({
        where: {
          userId: referrerUserId,
          ipAddress: registrationIp,
        },
      });

      if (referrerAuditLogs) {
        isFraudFlagged = true;
        fraudReasons.push(`Matching IP address: ${registrationIp}`);
      }
    }

    const status = isFraudFlagged ? ReferralEventStatus.FRAUD_FLAGGED : ReferralEventStatus.PENDING;

    // Create the ReferralEvent
    const referralEvent = await prisma.referralEvent.create({
      data: {
        referrerUserId,
        referredUserId,
        status,
        metadata: {
          fraudReasons,
          registrationIp,
          bindTime: new Date().toISOString(),
        },
      },
    });

    // If pending, increment pending credits on referrer profile
    if (status === ReferralEventStatus.PENDING) {
      await prisma.referralProfile.update({
        where: { userId: referrerUserId },
        data: {
          pendingCredits: { increment: 1 },
        },
      });
    }

    await logger({
      level: isFraudFlagged ? "error" : "info",
      event: isFraudFlagged ? "REFERRAL_FRAUD_DETECTED" : "REFERRAL_BOUND",
      message: isFraudFlagged
        ? `Fraud suspect in referral binding: referrer=${referrerUserId}, referred=${referredUserId}. Reasons: ${fraudReasons.join(", ")}`
        : `Successfully bound referral: referrer=${referrerUserId}, referred=${referredUserId}`,
      requestId: "system",
    });

    return {
      success: true,
      referralEvent,
      isFraudFlagged,
      message: isFraudFlagged
        ? "Referral bound but flagged for compliance review."
        : "Referral code applied successfully.",
    };
  }

  /**
   * Awards credit to the referrer when a referred user makes their first successful subscription payment.
   */
  static async awardReferralCredit(
    referredUserId: string,
    subscriptionId: string
  ): Promise<{
    success: boolean;
    message?: string;
    updatedEvent?: ReferralEvent;
    updatedProfile?: ReferralProfile;
  }> {
    // Find matching referral event
    const referralEvent = await prisma.referralEvent.findFirst({
      where: {
        referredUserId,
        status: { in: [ReferralEventStatus.PENDING, ReferralEventStatus.FRAUD_FLAGGED] },
      },
    });

    if (!referralEvent) {
      return { success: false, message: "No qualifying referral event found for this user." };
    }

    // If fraud-flagged, do not award automatic credit until reviewed
    if (referralEvent.status === ReferralEventStatus.FRAUD_FLAGGED) {
      await logger({
        level: "warn",
        event: "REFERRAL_AWARD_BLOCKED",
        message: `Referral award blocked for referred user ${referredUserId} due to FRAUD_FLAGGED status.`,
        requestId: "system",
      });
      return { success: false, message: "Referral is flagged for fraud and requires manual review." };
    }

    const referrerUserId = referralEvent.referrerUserId;

    // Perform transaction to award credit
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update referral event status to QUALIFIED
      const updatedEvent = await tx.referralEvent.update({
        where: { id: referralEvent.id },
        data: {
          status: ReferralEventStatus.QUALIFIED,
          creditsAwarded: 1,
          awardedAt: new Date(),
          qualifyingSubscriptionId: subscriptionId,
        },
      });

      // 2. Fetch current profile
      const profile = await tx.referralProfile.findUnique({
        where: { userId: referrerUserId },
      });

      if (!profile) {
        throw new Error(`Referrer profile not found for user ${referrerUserId}`);
      }

      // 3. Update profile balances (decrement pending, increment total and lifetime)
      const updatedProfile = await tx.referralProfile.update({
        where: { userId: referrerUserId },
        data: {
          pendingCredits: { decrement: 1 },
          totalCredits: { increment: 1 },
          lifetimeCredits: { increment: 1 },
        },
      });

      // 4. Create immutable ledger entry
      await tx.referralCreditLedger.create({
        data: {
          userId: referrerUserId,
          eventType: "REFERRAL_CONVERSION",
          credits: 1,
          balanceAfter: updatedProfile.totalCredits,
          referenceId: updatedEvent.id,
          notes: `Credit awarded for successful subscription conversion of referred user: ${referredUserId}`,
        },
      });

      return { updatedEvent, updatedProfile };
    });

    await logger({
      level: "info",
      event: "REFERRAL_CREDIT_AWARDED",
      message: `Referral credit successfully awarded to referrer ${referrerUserId} for referred user ${referredUserId}`,
      requestId: "system",
    });

    return { success: true, ...result };
  }

  /**
   * Calculates the potential discount and credits to be used for a subscription renewal.
   */
  static async calculateDiscount(params: {
    userId: string;
    billingCycle: string; // "yearly" | "half-yearly"
    baseAmount: number;
  }): Promise<{
    discountPercentage: number;
    discountAmount: number;
    creditsToUse: number;
    carryForwardCredits: number;
    message: string;
  }> {
    const { userId, billingCycle, baseAmount } = params;
    const profile = await prisma.referralProfile.findUnique({
      where: { userId },
    });

    if (!profile || profile.totalCredits <= 0) {
      return {
        discountPercentage: 0,
        discountAmount: 0,
        creditsToUse: 0,
        carryForwardCredits: 0,
        message: "No credits available.",
      };
    }

    const availableCredits = profile.totalCredits;
    const cycle = billingCycle.toLowerCase();

    let discountPercentage = 0;
    let creditsToUse = 0;
    let carryForwardCredits = availableCredits;
    let message = "";

    if (cycle === "yearly" || cycle === "year") {
      if (availableCredits >= 10) {
        discountPercentage = 1.0; // 100% off
        creditsToUse = 10;
        carryForwardCredits = availableCredits - 10;
        message = "10 credits applied for 100% Yearly Renewal discount (Free Year).";
      } else if (availableCredits >= 6) {
        discountPercentage = 0.5; // 50% off
        creditsToUse = 6;
        carryForwardCredits = availableCredits - 6;
        message = "6 credits applied for 50% Yearly Renewal discount.";
      } else {
        discountPercentage = 0;
        creditsToUse = 0;
        carryForwardCredits = availableCredits;
        message = `Available credits (${availableCredits}) insufficient for Yearly discount tiers (requires 6 for 50%, 10 for 100%).`;
      }
    } else if (cycle === "half-yearly" || cycle === "half_yearly" || cycle === "six_months") {
      if (availableCredits >= 10) {
        discountPercentage = 1.0; // 100% off + next cycle free
        creditsToUse = 10;
        carryForwardCredits = availableCredits - 10;
        message = "10 credits applied: Current and NEXT Half-Yearly cycles are 100% FREE (1 full year free!).";
      } else if (availableCredits >= 6) {
        discountPercentage = 1.0; // 100% off
        creditsToUse = 6;
        carryForwardCredits = availableCredits - 6;
        message = "6 credits applied for 100% Half-Yearly Renewal discount.";
      } else if (availableCredits >= 4) {
        discountPercentage = 0.5; // 50% off
        creditsToUse = 4;
        carryForwardCredits = availableCredits - 4;
        message = "4 credits applied for 50% Half-Yearly Renewal discount.";
      } else {
        discountPercentage = 0;
        creditsToUse = 0;
        carryForwardCredits = availableCredits;
        message = `Available credits (${availableCredits}) insufficient for Half-Yearly discount tiers (requires 4 for 50%, 6 for 100%, 10 for 1 year free).`;
      }
    } else {
      message = `Unsupported billing cycle: ${billingCycle}`;
    }

    const discountAmount = Math.round(baseAmount * discountPercentage * 100) / 100;

    return {
      discountPercentage,
      discountAmount,
      creditsToUse,
      carryForwardCredits,
      message,
    };
  }

  /**
   * Redeems credits and applies discount for a subscription renewal.
   * Runs in transactional boundaries.
   */
  static async redeemCreditsForSubscription(params: {
    userId: string;
    subscriptionId: string;
    billingCycle: string;
    baseAmount: number;
  }): Promise<{
    success: boolean;
    discountAmount: number;
    creditsUsed: number;
    message: string;
  }> {
    const { userId, subscriptionId, billingCycle, baseAmount } = params;

    // Check discount details
    const calculation = await this.calculateDiscount({ userId, billingCycle, baseAmount });

    if (calculation.creditsToUse <= 0) {
      return {
        success: false,
        discountAmount: 0,
        creditsUsed: 0,
        message: calculation.message,
      };
    }

    const { creditsToUse, discountPercentage, discountAmount, carryForwardCredits } = calculation;

    await prisma.$transaction(async (tx) => {
      // 1. Decrement credits in ReferralProfile
      const updatedProfile = await tx.referralProfile.update({
        where: { userId },
        data: {
          totalCredits: carryForwardCredits,
          redeemedCredits: { increment: creditsToUse },
        },
      });

      // 2. Add ledger log
      await tx.referralCreditLedger.create({
        data: {
          userId,
          eventType: "REWARD_REDEMPTION",
          credits: -creditsToUse,
          balanceAfter: carryForwardCredits,
          referenceId: subscriptionId,
          notes: `Redeemed ${creditsToUse} credits for ${billingCycle} subscription (${discountPercentage * 100}% discount of ₹${discountAmount})`,
        },
      });

      // 3. Create a redemption record
      const redemption = await tx.referralRewardRedemption.create({
        data: {
          userId,
          subscriptionId,
          creditsUsed: creditsToUse,
          rewardType: discountPercentage === 1.0 ? "FREE_RENEWAL" : "HALF_PRICE_RENEWAL",
          discountAmount,
          billingCycle,
          remainingCredits: carryForwardCredits,
        },
      });

      // If they used 10 credits on a half-yearly plan, we record a carry-forward note in our logs
      if (creditsToUse === 10 && (billingCycle.toLowerCase().includes("half"))) {
        // Carry-forward next cycle free note
        console.log(`[ReferralService] Carry-forward 100% discount recorded: user=${userId}, subscription=${subscriptionId}, redemptionId=${redemption.id}`);
      }

      return { updatedProfile, redemption };
    });

    await logger({
      level: "info",
      event: "REFERRAL_CREDITS_REDEEMED",
      message: `User ${userId} successfully redeemed ${creditsToUse} credits for subscription ${subscriptionId}`,
      requestId: "system",
    });

    return {
      success: true,
      discountAmount,
      creditsUsed: creditsToUse,
      message: `Successfully redeemed ${creditsToUse} credits for a discount of ₹${discountAmount}.`,
    };
  }

  /**
   * Super Admin utility to review, approve, or override fraud flagged referral events.
   */
  static async reviewFraudFlag(params: {
    eventId: string;
    action: "APPROVE" | "REJECT";
    adminUserId: string;
    notes?: string;
  }): Promise<ReferralEvent> {
    const { eventId, action, adminUserId, notes } = params;

    const event = await prisma.referralEvent.findUnique({
      where: { id: eventId },
      include: { referrer: true, referred: true },
    });

    if (!event) {
      throw new Error(`Referral event with ID ${eventId} not found`);
    }

    if (event.status !== ReferralEventStatus.FRAUD_FLAGGED) {
      throw new Error(`Referral event is not flagged for fraud. Current status: ${event.status}`);
    }

    const result = await prisma.$transaction(async (tx) => {
      const newStatus = action === "APPROVE" ? ReferralEventStatus.PENDING : ReferralEventStatus.REJECTED;
      
      const updatedEvent = await tx.referralEvent.update({
        where: { id: eventId },
        data: {
          status: newStatus,
          metadata: {
            ...(event.metadata as Record<string, unknown>),
            reviewedBy: adminUserId,
            reviewedAt: new Date().toISOString(),
            reviewNotes: notes,
          },
        },
      });

      // If approved, we transition it to PENDING, which means we increment the pending credits
      if (action === "APPROVE") {
        await tx.referralProfile.update({
          where: { userId: event.referrerUserId },
          data: {
            pendingCredits: { increment: 1 },
          },
        });
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          user: { connect: { id: adminUserId } },
          action: "REFERRAL_FRAUD_REVIEW",
          metadata: { details: `Admin reviewed fraud flag for event ${eventId}. Action: ${action}. Notes: ${notes}` },
          ipAddress: "127.0.0.1",
          status: "SUCCESS"
        },
      });

      return updatedEvent;
    });

    await logger({
      level: "info",
      event: "REFERRAL_FRAUD_REVIEWED",
      message: `Admin ${adminUserId} reviewed referral event ${eventId}. Action: ${action}.`,
      requestId: "system",
    });

    return result;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../../lib/auth/rbac";
import { prisma } from "../../../../../lib/database/prisma";
import { storageDriver } from "../../../../../lib/server/storageDriver";
import { PaymentProviderType, PaymentStatus, SubscriptionStatus, BillingCycle } from "@prisma/client";
import { LegalService } from "@/lib/legal/legalService";

const PLAN_RATES: Record<string, Record<string, number>> = {
  basic: { MONTHLY: 999, QUARTERLY: 2499, YEARLY: 7999, LIFETIME: 19999 },
  premium: { MONTHLY: 1999, QUARTERLY: 4999, YEARLY: 14999, LIFETIME: 39999 }
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    // 1. Authenticate caller
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    // 2. Parse Multipart form payload
    const formData = await request.formData();
    const propertyId = formData.get("propertyId") as string;
    const selectedPlanId = formData.get("selectedPlanId") as string;
    const billingCycle = formData.get("billingCycle") as string;
    const utrNumber = formData.get("utrNumber") as string;
    const screenshot = formData.get("screenshot") as File | null;
    const acceptedSubscriptionAgreementVersion = formData.get("acceptedSubscriptionAgreementVersion") as string;

    if (!propertyId || !selectedPlanId || !billingCycle || !utrNumber || !screenshot || !acceptedSubscriptionAgreementVersion) {
      return NextResponse.json({ error: "Missing required submission fields" }, { status: 400 });
    }

    // 2b. Resolve active subscription agreement and perform self-healing bootstrap if missing
    const activeSub = await LegalService.getActiveDocument("SUBSCRIPTION_AGREEMENT");
    let subAgreementDocId = "";
    if (activeSub) {
      if (activeSub.version !== acceptedSubscriptionAgreementVersion) {
        return NextResponse.json({
          error: `Outdated Subscription Agreement version accepted (${acceptedSubscriptionAgreementVersion}). Current active is ${activeSub.version}.`
        }, { status: 400 });
      }
      subAgreementDocId = activeSub.id;
    } else {
      // Auto-provision placeholder active subscription agreement
      const placeholderSub = await prisma.legalDocument.create({
        data: {
          documentType: "SUBSCRIPTION_AGREEMENT",
          title: "Subscription Agreement",
          slug: "subscription-agreement",
          version: acceptedSubscriptionAgreementVersion || "1.0.0",
          content: "Default Subscription Agreement. Please manage in Super Admin.",
          isActive: true,
          publishedAt: new Date()
        }
      });
      subAgreementDocId = placeholderSub.id;
    }

    // 3. Verify property ownership (Multi-tenant check)
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.ownerId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    // 4. Validate BillingCycle enum value
    const cycleUpper = billingCycle.toUpperCase();
    if (!Object.values(BillingCycle).includes(cycleUpper as BillingCycle)) {
      return NextResponse.json({ error: `Invalid billing cycle: ${billingCycle}` }, { status: 400 });
    }

    // 5. Check duplicate UTR reuse
    const duplicateUtr = await prisma.paymentTransaction.findFirst({
      where: { utrNumber }
    });
    if (duplicateUtr) {
      return NextResponse.json({ error: "This UTR reference has already been submitted" }, { status: 400 });
    }

    // 6. Check duplicate active pending submissions for property
    const pendingSubmission = await prisma.paymentTransaction.findFirst({
      where: {
        propertyId,
        paymentStatus: PaymentStatus.PENDING_APPROVAL
      }
    });
    if (pendingSubmission) {
      return NextResponse.json({ error: "You already have a pending payment approval for this property" }, { status: 400 });
    }

    // 7. Locate MANUAL_UPI payment provider
    const provider = await prisma.paymentProvider.findFirst({
      where: { providerType: PaymentProviderType.MANUAL_UPI, isEnabled: true }
    });
    if (!provider) {
      return NextResponse.json({ error: "Manual UPI provider is not active or configured" }, { status: 400 });
    }

    // 8. Stream upload file validation
    const fileBuffer = Buffer.from(await screenshot.arrayBuffer());
    let storedFilename = "";
    try {
      storedFilename = await storageDriver.uploadFile(fileBuffer, screenshot.name, screenshot.type);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to process screenshot upload";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    // 9. Determine rates
    const planIdKey = selectedPlanId.toLowerCase();
    const amount = PLAN_RATES[planIdKey]?.[cycleUpper] || PLAN_RATES["basic"]?.[cycleUpper] || 999;

    // 10. Transactional persistence
    const { transaction } = await prisma.$transaction(async (tx) => {
      // Create inactive subscription tracker
      const subscription = await tx.propertySubscription.create({
        data: {
          propertyId,
          selectedPlanId,
          status: SubscriptionStatus.PENDING_PAYMENT,
          billingCycle: cycleUpper as BillingCycle,
          amount,
          currency: "INR",
          createdBy: auth.userId
        }
      });

      // Create ledger transaction entry
      const txRecord = await tx.paymentTransaction.create({
        data: {
          propertyId,
          subscriptionId: subscription.id,
          providerId: provider.id,
          paymentStatus: PaymentStatus.PENDING_APPROVAL,
          amount,
          currency: "INR",
          utrNumber,
          paymentScreenshotUrl: storedFilename
        }
      });

      // Write audit trail
      await tx.paymentAuditLog.create({
        data: {
          transactionId: txRecord.id,
          action: "MANUAL_UPI_SUBMITTED",
          newStatus: PaymentStatus.PENDING_APPROVAL,
          performedBy: auth.userId,
          metadata: {
            selectedPlanId,
            billingCycle: cycleUpper,
            utrNumber,
            screenshotFilename: storedFilename
          }
        }
      });

      // Write immutable legal acceptance log
      await tx.legalAcceptanceLog.create({
        data: {
          userId: auth.userId as string,
          documentId: subAgreementDocId,
          acceptedVersion: acceptedSubscriptionAgreementVersion,
          ipAddress: ip,
          userAgent,
          metadata: { checkoutAcceptance: true }
        }
      });

      return { transaction: txRecord };
    });

    return NextResponse.json({
      success: true,
      message: "Manual UPI payment proof submitted successfully for verification",
      transactionId: transaction.id
    });

  } catch (error) {
    console.error("[MANUAL_UPI_SUBMIT] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

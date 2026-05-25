import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { LaunchReadinessService } from "@/lib/onboarding/readiness";

/**
 * GET /api/partner/onboarding/launch
 * Evaluates and returns the live launch readiness report for the active property.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Only property owners can check launch status" }, { status: 403 });
    }

    const propertyId = auth.propertyId;
    if (!propertyId) {
      return NextResponse.json({ error: "Conflict: No active property profile mapped to account" }, { status: 409 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const report = await LaunchReadinessService.evaluateReadiness(propertyId);
    
    // Generate secure preview token
    const crypto = await import("crypto");
    const draftToken = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "secret")
      .update(property.slug)
      .digest("hex")
      .slice(0, 16);

    return NextResponse.json({ 
      success: true, 
      report,
      draftToken,
      slug: property.slug
    });

  } catch (error) {
    console.error("[LAUNCH_READINESS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/partner/onboarding/launch
 * Transactionally completes onboarding and activates the property to LIVE status.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Only property owners can activate a property" }, { status: 403 });
    }

    const propertyId = auth.propertyId;
    if (!propertyId) {
      return NextResponse.json({ error: "Conflict: No active property profile mapped to account" }, { status: 409 });
    }

    // 1. Evaluate readiness report
    const report = await LaunchReadinessService.evaluateReadiness(propertyId);
    if (!report.isReady) {
      return NextResponse.json({
        success: false,
        error: "Launch blocked: Your property setup has outstanding blocking issues.",
        blockingIssues: report.blockingIssues
      }, { status: 400 });
    }

    // 2. Fetch the onboarding session and final property identity draft
    const session = await prisma.onboardingSession.findUnique({
      where: { propertyId },
      include: { drafts: true }
    });

    if (!session) {
      return NextResponse.json({ error: "No active onboarding session found" }, { status: 404 });
    }

    const propertyDraft = (session.drafts.find(d => d.stepId === "property")?.data as { title?: string } | null) || {};
    const pricingDraft = (session.drafts.find(d => d.stepId === "pricing")?.data as {
      enableBusinessBilling?: boolean;
      legalBusinessName?: string;
      gstin?: string;
      billingAddress?: string;
      billingState?: string;
      billingPincode?: string;
      billingContact?: string;
    } | null) || {};

    // 3. Transactionally activate property in the database
    await prisma.$transaction([
      // Update property details and mark as LIVE
      prisma.property.update({
        where: { id: propertyId },
        data: {
          status: "LIVE",
          publishedAt: new Date(),
          title: propertyDraft.title || undefined
        }
      }),

      // Update owner User with compliance B2B business billing details if active
      prisma.user.update({
        where: { id: auth.userId },
        data: {
          legalBusinessName: pricingDraft.enableBusinessBilling ? pricingDraft.legalBusinessName : null,
          gstin: pricingDraft.enableBusinessBilling ? pricingDraft.gstin : null,
          billingAddress: pricingDraft.enableBusinessBilling ? pricingDraft.billingAddress : null,
          billingState: pricingDraft.enableBusinessBilling ? pricingDraft.billingState : null,
          billingPincode: pricingDraft.enableBusinessBilling ? pricingDraft.billingPincode : null,
          billingContact: pricingDraft.enableBusinessBilling ? pricingDraft.billingContact : null,
        }
      }),

      // Mark onboarding session as completed
      prisma.onboardingSession.update({
        where: { propertyId },
        data: {
          status: "LIVE",
          currentStep: "launch"
        }
      }),

      // Log successful launch progress checklist state
      prisma.propertySetupProgress.upsert({
        where: {
          onboardingSessionId_stepId: {
            onboardingSessionId: session.id,
            stepId: "launch"
          }
        },
        create: {
          onboardingSessionId: session.id,
          stepId: "launch",
          status: "COMPLETED",
          completedAt: new Date()
        },
        update: {
          status: "COMPLETED",
          completedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: "Congratulations! Your property has been activated and published successfully.",
      activatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("[LAUNCH_ACTIVATION_POST] Error activating property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

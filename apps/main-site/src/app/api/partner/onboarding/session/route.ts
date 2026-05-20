import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";

// Allowed steps configuration whitelist
const VALID_STEPS = [
  "welcome",
  "property",
  "theme",
  "rooms",
  "amenities",
  "experiences",
  "gallery",
  "policies",
  "pricing",
  "launch"
];

/**
 * GET /api/partner/onboarding/session
 * Retrieves or initializes the property-scoped onboarding session including step progress lists
 * and step-specific draft values. Bound entirely to the session JWT.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Only property owners can access onboarding" }, { status: 403 });
    }

    const propertyId = auth.propertyId;
    if (!propertyId) {
      return NextResponse.json({ error: "Conflict: No active property profile mapped to account" }, { status: 409 });
    }

    // Retrieve onboarding session with associated nested entities
    let session = await prisma.onboardingSession.findUnique({
      where: { propertyId },
      include: {
        progress: true,
        drafts: true
      }
    });

    // Initialize session automatically if it does not exist yet (resumable seed)
    if (!session) {
      session = await prisma.onboardingSession.create({
        data: {
          propertyId,
          status: "NOT_STARTED",
          currentStep: "welcome"
        },
        include: {
          progress: true,
          drafts: true
        }
      });
    }

    // Transform raw drafts array into a mapped key-value dictionary for frontend ease
    const draftsMap: Record<string, unknown> = {};
    session.drafts.forEach(draft => {
      draftsMap[draft.stepId] = draft.data;
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        propertyId: session.propertyId,
        status: session.status,
        currentStep: session.currentStep,
        progress: session.progress.map(p => ({
          stepId: p.stepId,
          status: p.status,
          completedAt: p.completedAt
        })),
        drafts: draftsMap
      }
    });

  } catch (error) {
    console.error("[ONBOARDING_SESSION_GET] Error resolving context:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/partner/onboarding/session
 * Mutates draft values and tracks checklist progress metrics. Enforces complete property-scoped locks.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "owner") {
      return NextResponse.json({ error: "Forbidden: Only property owners can save onboarding states" }, { status: 403 });
    }

    const propertyId = auth.propertyId;
    if (!propertyId) {
      return NextResponse.json({ error: "Conflict: No active property profile mapped to account" }, { status: 409 });
    }

    const body = await request.json();
    const { stepId, data, status, currentStep } = body;

    // Check step whitelist integrity
    if (stepId && !VALID_STEPS.includes(stepId)) {
      return NextResponse.json({ error: `Invalid stepId: ${stepId} is outside wizard scope` }, { status: 400 });
    }

    // Retrieve or establish the session under active propertyId
    let session = await prisma.onboardingSession.findUnique({
      where: { propertyId }
    });

    if (!session) {
      session = await prisma.onboardingSession.create({
        data: {
          propertyId,
          status: "IN_PROGRESS",
          currentStep: currentStep || stepId || "welcome"
        }
      });
    }

    // 1. Transactionally write draft payload if supplied
    if (stepId && data !== undefined) {
      await prisma.wizardDraft.upsert({
        where: {
          onboardingSessionId_stepId: {
            onboardingSessionId: session.id,
            stepId
          }
        },
        create: {
          onboardingSessionId: session.id,
          stepId,
          data: data || {}
        },
        update: {
          data: data || {}
        }
      });
    }

    // 2. Transactionally write progress checklist status if supplied
    if (stepId && status) {
      await prisma.propertySetupProgress.upsert({
        where: {
          onboardingSessionId_stepId: {
            onboardingSessionId: session.id,
            stepId
          }
        },
        create: {
          onboardingSessionId: session.id,
          stepId,
          status,
          completedAt: status === "COMPLETED" ? new Date() : null
        },
        update: {
          status,
          completedAt: status === "COMPLETED" ? new Date() : null
        }
      });
    }

    // 3. Conditionally transition onboarding session details (e.g. active step, overall status)
    const updateData: Record<string, string> = {};
    if (currentStep && VALID_STEPS.includes(currentStep)) {
      updateData.currentStep = currentStep;
    }

    // If stepId is 'launch' and status is 'COMPLETED', mark onboarding status as 'COMPLETED' or 'LIVE'
    if (stepId === "launch" && status === "COMPLETED") {
      updateData.status = "COMPLETED";
    } else if (session.status === "NOT_STARTED" && (stepId || currentStep)) {
      updateData.status = "IN_PROGRESS";
    }

    if (Object.keys(updateData).length > 0) {
      session = await prisma.onboardingSession.update({
        where: { id: session.id },
        data: updateData
      });
    }

    // Retrieve fresh snapshot with all changes mapped
    const refreshedSession = await prisma.onboardingSession.findUnique({
      where: { id: session.id },
      include: {
        progress: true,
        drafts: true
      }
    });

    if (!refreshedSession) {
      return NextResponse.json({ error: "Failed to reload updated session" }, { status: 500 });
    }

    const draftsMap: Record<string, unknown> = {};
    refreshedSession.drafts.forEach(draft => {
      draftsMap[draft.stepId] = draft.data;
    });

    return NextResponse.json({
      success: true,
      session: {
        id: refreshedSession.id,
        propertyId: refreshedSession.propertyId,
        status: refreshedSession.status,
        currentStep: refreshedSession.currentStep,
        progress: refreshedSession.progress.map(p => ({
          stepId: p.stepId,
          status: p.status,
          completedAt: p.completedAt
        })),
        drafts: draftsMap
      }
    });

  } catch (error) {
    console.error("[ONBOARDING_SESSION_POST] Error updating wizard transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

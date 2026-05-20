import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { SubscriptionLifecycleService } from "@/modules/payments/services/subscriptionLifecycle";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subscriptionId } = await params;

    // 1. Authenticate caller (Admin/Super Admin only)
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (!auth.authorized || !auth.userId) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Manual operational suspension.";

    // 2. Process Suspension Lifecycle
    await SubscriptionLifecycleService.suspendSubscription(subscriptionId, auth.userId);

    return NextResponse.json({
      success: true,
      message: "Subscription suspended and property visibility restricted successfully"
    });

  } catch (error: any) {
    console.error("[ADMIN_SUBSCRIPTION_SUSPEND] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

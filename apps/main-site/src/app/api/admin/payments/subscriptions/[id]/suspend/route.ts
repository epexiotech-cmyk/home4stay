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

    // 2. Process Suspension Lifecycle
    await SubscriptionLifecycleService.suspendSubscription(subscriptionId, auth.userId);

    return NextResponse.json({
      success: true,
      message: "Subscription suspended and property visibility restricted successfully"
    });

  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_SUSPEND] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

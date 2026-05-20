import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { bookingEngine } from "@/modules/payments/services/bookingEngine";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await props.params;

    // 1. Authenticate and authorize the user
    const { authorized, userId, response } = await requireRole(request, [
      "admin", "super_admin", "owner", "partner", "manager", "receptionist", "billing"
    ]);
    if (!authorized || !userId) {
      return response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Delegate state transition and capacity release to central booking engine
    const result = await bookingEngine.rejectBooking(bookingId, userId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      bookingId
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Booking reject-payment API failure:", message);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

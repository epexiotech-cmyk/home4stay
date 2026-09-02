import { NextResponse } from "next/server";
import { InventoryLockService } from "@/modules/payments/services/inventoryLock";

// Ensure this route is never statically cached
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const releasedCount = await InventoryLockService.releaseExpiredLocks();
    return NextResponse.json({
      success: true,
      message: "Expired locks cleanup successfully completed.",
      releasedCount,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Cron cleanup-locks failure:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}

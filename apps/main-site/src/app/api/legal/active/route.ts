import { NextResponse } from "next/server";
import { LegalService } from "@/lib/legal/legalService";

export async function GET() {
  try {
    const activeTerms = await LegalService.getActiveDocument("TERMS_AND_CONDITIONS");
    const activePrivacy = await LegalService.getActiveDocument("PRIVACY_POLICY");
    const activeRefund = await LegalService.getActiveDocument("REFUND_POLICY");
    const activeSub = await LegalService.getActiveDocument("SUBSCRIPTION_AGREEMENT");

    return NextResponse.json({
      success: true,
      versions: {
        TERMS_AND_CONDITIONS: activeTerms?.version || "1.0.0",
        PRIVACY_POLICY: activePrivacy?.version || "1.0.0",
        REFUND_POLICY: activeRefund?.version || "1.0.0",
        SUBSCRIPTION_AGREEMENT: activeSub?.version || "1.0.0",
      },
    });
  } catch (error) {
    console.error("[LEGAL_ACTIVE_GET] Error:", error);
    return NextResponse.json({ error: "Failed to load active versions" }, { status: 500 });
  }
}

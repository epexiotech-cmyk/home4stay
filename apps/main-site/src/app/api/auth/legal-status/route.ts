import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { LegalService } from "@/lib/legal/legalService";

export async function GET(request: NextRequest) {
  try {
    console.log(`\n[API legal-status] Header 'cookie':`, request.headers.get("cookie"));
    console.log(`[API legal-status] request.cookies.getAll():`, JSON.stringify(request.cookies.getAll()));

    console.log(
      "[LEGAL] cookie header =",
      request.headers.get("cookie"),
    );

    console.log(
      "[LEGAL] cookies =",
      request.cookies.getAll(),
    );

    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pending = await LegalService.getPendingReacceptances(auth.userId);

    // Normalize and return pending documents requiring re-acceptance
    return NextResponse.json({
      success: true,
      pending: pending.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        title: doc.title,
        slug: doc.slug,
        version: doc.version,
        content: doc.content,
        publishedAt: doc.publishedAt,
      })),
    });
  } catch (error) {
    console.error("[LEGAL_STATUS_GET] Error:", error);
    return NextResponse.json({ error: "Failed to resolve compliance status" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { LegalService } from "@/lib/legal/legalService";
import { z } from "zod";

const acceptSchema = z.object({
  documentId: z.string().min(1, "documentId is required"),
  version: z.string().min(1, "version is required"),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = acceptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { documentId, version } = validation.data;

    // Log mutable/immutable acceptance trace in DB
    await LegalService.logAcceptance(
      auth.userId,
      documentId,
      version,
      ip,
      userAgent,
      { wallAcceptance: true }
    );

    return NextResponse.json({
      success: true,
      message: "Compliance document acceptance logged successfully",
    });
  } catch (error) {
    console.error("[LEGAL_ACCEPT_POST] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to record policy signature";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

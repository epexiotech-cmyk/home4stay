import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { storageDriver } from "@/lib/server/storageDriver";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename) {
      return NextResponse.json({ error: "Missing filename parameter" }, { status: 400 });
    }

    // 1. Authenticate caller session
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    // 2. Query transaction referencing this screenshot proof
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { paymentScreenshotUrl: filename },
      include: { property: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: "Proof document not found" }, { status: 404 });
    }

    // 3. SECURE MULTI-TENANT ISOLATION CHECK
    // Allow access only if caller is the owner of the property
    if (transaction.property.ownerId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden: You do not own the associated property" }, { status: 403 });
    }

    // 4. Fetch and stream from private storage
    try {
      const { stream, mimeType } = await storageDriver.getFileStream(filename);
      
      const webStream = new ReadableStream({
        start(controller) {
          stream.on("data", (chunk: string | Buffer) => controller.enqueue(chunk));
          stream.on("end", () => controller.close());
          stream.on("error", (err: Error) => controller.error(err));
        }
      });

      return new Response(webStream, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "private, max-age=3600"
        }
      });

    } catch {
      return NextResponse.json({ error: "Screenshot proof not found in storage" }, { status: 404 });
    }

  } catch (error) {
    console.error("[PARTNER_BILLING_PROOF_STREAM] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

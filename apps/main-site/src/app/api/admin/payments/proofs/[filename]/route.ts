import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../../../lib/auth/rbac";
import { storageDriver } from "../../../../../../lib/server/storageDriver";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // 1. Authenticate caller (Must be platform Admin or Super Admin only)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Administrative access required" }, { status: 403 });
    }

    // 2. Fetch stream from secure non-public storage
    try {
      const { stream, mimeType } = await storageDriver.getFileStream(filename);
      
      // Convert Node ReadStream to Web ReadableStream for standard Next Response piping
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
      return NextResponse.json({ error: "Proof screenshot file not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("[ADMIN_PAYMENT_PROOF_STREAM] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

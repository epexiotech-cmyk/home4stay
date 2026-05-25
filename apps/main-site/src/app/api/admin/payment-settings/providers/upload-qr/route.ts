import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { LocalStorageDriver } from "@/lib/server/storageDriver";
import path from "path";

// Initialize dedicated assets upload driver under isolated /storage/payments/assets
const assetsStorage = new LocalStorageDriver(
  path.join(process.cwd(), "storage", "payments", "assets")
);

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate caller (Super Admin only)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    // 2. Parse payload file parameters
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
    }

    // 3. Process secure validation upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let savedFilename = "";
    try {
      savedFilename = await assetsStorage.uploadFile(fileBuffer, file.name, file.type);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to process QR image upload";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "QR code image uploaded successfully",
      filename: savedFilename,
      url: `/api/admin/payment-settings/providers/qr-assets/${savedFilename}`
    });

  } catch (error) {
    console.error("[ADMIN_QR_UPLOAD] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

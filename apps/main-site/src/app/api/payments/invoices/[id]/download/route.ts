import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { logger } from "@/lib/observability/logger";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;

    // 1. Authenticate session
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    // 2. Fetch the invoice record
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 3. RBAC Enforcement: Only the owning user (partner) or an administrator (admin/super_admin) can download
    const isOwner = invoice.userId === auth.userId;
    const isAdmin = auth.role === "admin" || auth.role === "super_admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to access this invoice" }, { status: 403 });
    }

    // 4. Resolve local PDF file path
    const meta = invoice.metadata as { localPath?: string } | null;
    let localPath = meta?.localPath;

    if (!localPath) {
      // Fallback filename logic if not set in metadata
      const filename = `invoice-${invoice.invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`;
      localPath = path.join("storage", "subscription-invoices", filename);
    }

    const fullPath = path.join(process.cwd(), localPath);
    const resolvedPath = path.resolve(fullPath);
    const storageDir = path.resolve(path.join(process.cwd(), "storage", "subscription-invoices"));

    // Path boundary check to prevent directory traversal
    if (!resolvedPath.startsWith(storageDir)) {
      logger({
        level: "error",
        event: "INVOICE_DOWNLOAD_TRAVERSAL_BLOCKED",
        message: `Blocked traversal attack trying to download: ${resolvedPath}`,
        requestId: "invoice-download"
      });
      return NextResponse.json({ error: "Invalid path selection" }, { status: 400 });
    }

    if (!fs.existsSync(resolvedPath)) {
      logger({
        level: "error",
        event: "INVOICE_FILE_NOT_FOUND",
        message: `PDF invoice file not found on disk at: ${resolvedPath}`,
        requestId: "invoice-download"
      });
      return NextResponse.json({ error: "Invoice file not found on disk" }, { status: 404 });
    }

    // 5. Read file buffer and return stream response
    const pdfBuffer = fs.readFileSync(resolvedPath);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error("[INVOICE_DOWNLOAD_API] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

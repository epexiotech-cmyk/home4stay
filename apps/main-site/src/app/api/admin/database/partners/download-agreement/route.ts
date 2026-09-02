import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import AdmZip from "adm-zip";
import { AppError, withErrorHandler } from "@/lib/errors/handler";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth(request);
  if (!auth.authorized || auth.role !== "super_admin") {
    throw new AppError("Unauthorized: Only super admins can download agreements here", 403, "FORBIDDEN");
  }

  const propertyId = request.nextUrl.searchParams.get("propertyId");
  if (!propertyId) {
    throw new AppError("Missing propertyId", 400, "BAD_REQUEST");
  }

  // Fetch the latest agreement for this property
  const agreement = await prisma.propertyAgreement.findFirst({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
  });

  if (!agreement || (!agreement.documentUrl && !agreement.signatureUrl)) {
    throw new AppError("No agreement files found for this property", 404, "NOT_FOUND");
  }

  const zip = new AdmZip();

  // Helper to fetch a URL and add to ZIP
  const addFileToZip = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      zip.addFile(filename, buffer);
    } catch (error) {
      console.error(`Failed to add ${filename} to ZIP:`, error);
      // We gracefully handle it by adding a text file instead of crashing the whole download
      zip.addFile(`${filename}.error.txt`, Buffer.from(`Failed to download this file from storage: ${url}`));
    }
  };

  const tasks: Promise<void>[] = [];
  if (agreement.documentUrl) {
    tasks.push(addFileToZip(agreement.documentUrl, `Agreement_${propertyId}.pdf`));
  }
  if (agreement.signatureUrl) {
    // try to guess extension, usually png/jpg
    const ext = agreement.signatureUrl.split('.').pop()?.split('?')[0] || "png";
    tasks.push(addFileToZip(agreement.signatureUrl, `Signature_${propertyId}.${ext}`));
  }

  await Promise.all(tasks);

  const zipBuffer = zip.toBuffer();

  return new NextResponse(zipBuffer as any, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="partner_agreement_${propertyId}.zip"`,
    },
  });
});

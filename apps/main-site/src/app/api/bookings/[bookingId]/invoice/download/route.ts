import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/database/prisma";
import { InvoiceStorageService } from "@/modules/payments/services/invoiceStorageService";
import { requireAuth } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

/**
 * Validates HMAC cryptographic signatures for replay-safe downloads.
 */
function verifySignature(bookingId: string, signature: string, expires: string): boolean {
  try {
    const expireTime = parseInt(expires, 10);
    if (isNaN(expireTime) || expireTime < Date.now()) {
      return false;
    }
    const secret = process.env.JWT_SECRET || "super-secret-fallback-key-32-chars-at-least";
    const expected = crypto.createHmac("sha256", secret)
                           .update(`${bookingId}:${expires}`)
                           .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * GET handler to stream compiled PDF invoice sheets.
 * Accessible either via (a) Cryptographic Signed URL, or (b) Validated host/guest session ownership.
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await props.params;
  const searchParams = request.nextUrl.searchParams;
  const signature = searchParams.get("signature");
  const expires = searchParams.get("expires");

  let isAuthorized = false;

  // 1. PATH A: Cryptographic Signed URL Verification (Pre-authenticated sharing)
  if (signature && expires) {
    if (verifySignature(bookingId, signature, expires)) {
      isAuthorized = true;
    }
  }

  // 2. PATH B: Session Identity Verification (Dynamic RBAC checks)
  if (!isAuthorized) {
    try {
      const auth = await requireAuth(request);
      if (auth.authorized && auth.userId) {
        // Fetch User and Booking
        const [user, booking] = await Promise.all([
          prisma.user.findUnique({ where: { id: auth.userId } }),
          prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
              guests: {
                include: { guest: true }
              }
            }
          })
        ]);

        if (user && booking) {
          // Administrative roles have total access
          if (["admin", "super_admin"].includes(user.role)) {
            isAuthorized = true;
          }
          // Owners have access if the booking property belongs to their context
          else if (["owner", "manager", "partner"].includes(user.role)) {
            const accesses = await prisma.propertyUserAccess.findFirst({
              where: { userId: user.id, propertyId: booking.propertyId }
            });
            if (accesses) {
              isAuthorized = true;
            }
          }
          // Guests have access if their email or registered ID matches the booking guests
          else {
            const isGuestMatch = booking.guests.some(
              g => g.guest.email?.toLowerCase() === user.email.toLowerCase()
            );
            if (isGuestMatch) {
              isAuthorized = true;
            }
          }
        }
      }
    } catch {
      // Auth parser error, block access
    }
  }

  // Strict boundary check exit
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Access Denied: Invalid signature or unauthorized stay identity" },
      { status: 403 }
    );
  }

  try {
    // 3. Resolve the generated invoice and serve the file
    const invoice = await prisma.invoiceRecord.findFirst({
      where: { bookingId }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not generated: Keep waiting for confirmation sequence." },
        { status: 404 }
      );
    }

    const exists = InvoiceStorageService.exists(bookingId);
    if (!exists) {
      return NextResponse.json(
        { error: "Invoice PDF has not been generated locally yet." },
        { status: 404 }
      );
    }

    const pdfBuffer = await InvoiceStorageService.getInvoicePdf(bookingId);
    const filename = `${invoice.invoiceNumber}.pdf`;

    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal execution error: ${msg}` },
      { status: 500 }
    );
  }
}

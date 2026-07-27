import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { bookingService } from "@/lib/services/bookingService";
import { withErrorHandler } from "@/lib/errors/handler";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) => {
  const { bookingId } = await props.params;
  const searchParams = request.nextUrl.searchParams;
  const signature = searchParams.get("signature") || undefined;
  const expires = searchParams.get("expires") || undefined;

  const auth = await requireAuth(request);
  
  const result = await bookingService.downloadInvoice(
    bookingId,
    { userId: auth.userId, role: auth.role },
    { signature, expires }
  );

  return new NextResponse(result.buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store, max-age=0"
    }
  });
});

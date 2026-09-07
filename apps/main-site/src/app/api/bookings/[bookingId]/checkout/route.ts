import { NextRequest } from "next/server";
import { bookingService } from "@/lib/services/bookingService";
import { requireAuth } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: { bookingId: string } }) => {
  const { bookingId } = params;

  const auth = await requireAuth(request);
  if (!auth.authorized) {
    return auth.response!;
  }

  const result = await bookingService.checkOutBooking(bookingId, { userId: auth.userId!, role: auth.role! });
  return successResponse(result);
});

import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { bookingService } from "@/lib/services/bookingService";

export const GET = withErrorHandler(async (
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) => {
  const { bookingId } = await props.params;

  const result = await bookingService.getPaymentStatus(bookingId);

  return successResponse({
    success: true,
    ...result
  });
});

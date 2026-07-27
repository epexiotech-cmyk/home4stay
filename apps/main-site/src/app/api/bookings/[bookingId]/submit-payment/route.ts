import { NextRequest } from "next/server";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { PaymentSubmitSchema } from "@/modules/payments/validators";
import { bookingService } from "@/lib/services/bookingService";

export const POST = withErrorHandler(async (
  request: NextRequest,
  props: { params: Promise<{ bookingId: string }> }
) => {
  const { bookingId } = await props.params;
  const body = await request.json();
  const { utrNumber } = body;

  let validatedUtr: string | undefined;

  if (utrNumber && utrNumber.trim() !== "") {
    const validation = PaymentSubmitSchema.safeParse({ utrNumber });
    if (!validation.success) {
      throw new AppError(validation.error.issues[0].message, 400, "VALIDATION_ERROR");
    }
    validatedUtr = validation.data.utrNumber;
  }

  const updatedBooking = await bookingService.submitPayment(bookingId, validatedUtr);

  return successResponse({
    success: true,
    bookingId: updatedBooking.id,
    paymentStatus: updatedBooking.paymentStatus,
    status: updatedBooking.status
  });
});

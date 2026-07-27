import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { PaymentService } from "@/modules/payments/services";
import { PaymentStatus } from "@prisma/client";
import { successResponse } from "@/lib/utils/apiResponse";
import { withErrorHandler } from "@/lib/errors/handler";

async function handleGetMyTransactions(request: NextRequest) {
  // 1. Authenticate & Authorize caller
  const auth = await requireAuth(request);
  if (!auth.authorized || !auth.userId) {
    throw new Error("Unauthorized: Missing active session");
  }

  // 2. Parse query parameters
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status")?.toUpperCase();
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  // Validate status
  const status = Object.values(PaymentStatus).includes(statusParam as PaymentStatus) ? (statusParam as PaymentStatus) : undefined;

  // 3. Call PaymentService
  const result = await PaymentService.getUserTransactions({
    userId: auth.userId,
    status,
    limit,
    offset
  });

  return successResponse({
    success: true,
    ...result
  });
}

export const GET = withErrorHandler(handleGetMyTransactions);

import { NextRequest } from 'next/server';
import { withErrorHandler, AppError } from '@/lib/errors/handler';
import { successResponse } from '@/lib/utils/apiResponse';
import { requireRole } from "@/lib/auth/rbac";
import { bookingService } from '@/lib/services/bookingService';
import { createBookingSchema, bookingSearchSchema } from '@/lib/validators/booking.validators';
import { getIdempotencyResponse, setIdempotencyResponse, acquireIdempotencyLock, releaseIdempotencyLock } from '@/lib/security/idempotency';

async function createBookingHandler(request: NextRequest) {
  const idempotencyKey = request.headers.get('idempotency-key');
  const route = '/api/bookings';

  // 1. AUTHENTICATION & CONTEXT
  const { authorized, userId, response } = await requireRole(request, ["user", "customer", "admin", "super_admin"]);
  if (!authorized || !userId) return response as any;

  if (!idempotencyKey) {
    throw new AppError("idempotency-key is required", 400, "MISSING_IDEMPOTENCY_KEY");
  }

  // 2. PARSE & VALIDATE
  const body = await request.json();
  const validation = createBookingSchema.safeParse(body);
  if (!validation.success) {
    throw new AppError("Invalid booking payload", 400, "VALIDATION_ERROR");
  }
  const dto = validation.data;

  // 3. STRICT IDEMPOTENCY FLOW WITH SMART RETRY
  let cached = await getIdempotencyResponse(userId, idempotencyKey);
  if (cached) return successResponse(cached, { status: 201 });

  let lock = await acquireIdempotencyLock(userId, idempotencyKey, route);
  if (!lock.acquired) {
    for (let i = 0; i < 3; i++) {
      await new Promise(res => setTimeout(res, 100));
      cached = await getIdempotencyResponse(userId, idempotencyKey);
      if (cached) return successResponse(cached, { status: 201 });

      lock = await acquireIdempotencyLock(userId, idempotencyKey, route);
      if (lock.acquired) break;
    }
  }

  if (!lock.acquired) {
    throw new AppError("Request already in progress. Please wait.", 409, "CONCURRENT_REQUEST");
  }

  try {
    // 4. CALL SERVICE
    const result = await bookingService.createBooking(dto, userId);

    // 5. CACHE RESPONSE & RETURN
    await setIdempotencyResponse(userId, idempotencyKey, result);
    return successResponse(result, { status: 201 });

  } finally {
    if (lock.lockValue) {
      await releaseIdempotencyLock(userId, idempotencyKey, lock.lockValue);
    }
  }
}

async function getBookingsHandler(request: NextRequest) {
  // 1. AUTHENTICATION
  const { authorized, role, userId, response } = await requireRole(request, [
    "admin", "super_admin", "owner", "partner", "manager", "receptionist", "billing", "housekeeping"
  ]);
  if (!authorized || !userId || !role) return response as any;

  // 2. PARSE & VALIDATE
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const validation = bookingSearchSchema.safeParse(searchParams);
  if (!validation.success) {
    throw new AppError("Invalid search parameters", 400, "VALIDATION_ERROR");
  }

  // 3. TENANT ISOLATION CHECK
  const { propertyId } = validation.data;
  if (propertyId && !["admin", "super_admin"].includes(role)) {
    const { requirePropertyAccess } = await import("@/lib/auth/rbac");
    const propAuth = await requirePropertyAccess(request, propertyId);
    if (!propAuth.authorized) return propAuth.response!;
  }

  // 4. CALL SERVICE
  const result = await bookingService.getBookings({
    searchParams: validation.data,
    userId,
    role,
    allowedPropertyIds: propertyId ? [propertyId] : undefined
  });

  return successResponse(result);
}

export const POST = withErrorHandler(createBookingHandler);
export const GET = withErrorHandler(getBookingsHandler);

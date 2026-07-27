import { NextRequest } from "next/server";
import { createBasicPropertySchema } from "@/lib/validators/property.validators";
import { logger } from "@/lib/observability/logger";
import { requireRole } from "@/lib/auth/rbac";
import { propertyService } from "@/lib/services/propertyService";
import { withErrorHandler, AppError } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. RBAC Check (Admin Only)
  const auth = await requireRole(request, ["admin", "super_admin"]);
  
  if (!auth.authorized) return auth.response!;

  // 2. INPUT VALIDATION
  const body = await request.json();
  const validation = createBasicPropertySchema.safeParse(body);
  if (!validation.success) {
    throw new AppError("Invalid input data", 400, "VALIDATION_ERROR");
  }

  const { name, location, price } = validation.data;

  // 3. DATA PROCESSING
  const result = await propertyService.createBasicProperty(name, location, price);

  await logger({
    level: 'info',
    event: 'CREATE_PROPERTY',
    message: `Property ${name} in ${location} (₹${price}) created by user ${auth.userId}`,
    userId: auth.userId!,
    ip,
    requestId,
    route: '/api/property'
  });

  return successResponse({ success: true, slug: result.slug }, { status: 201 });
});

import { NextRequest } from "next/server";
import { propertyPaymentConfigService } from "@/lib/services/propertyPaymentConfigService";
import { requireRole, requirePropertyAccess } from "@/lib/auth/rbac";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { z } from "zod";

const propertyIdParamSchema = z.object({
  propertyId: z.string().min(1, "propertyId is required"),
});

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner", "manager"]);
  if (!auth.authorized) return auth.response!;

  const resolvedParams = await params;
  const { propertyId } = propertyIdParamSchema.parse(resolvedParams);

  const access = await requirePropertyAccess(request, propertyId);
  if (!access.authorized) return access.response!;

  const configs = await propertyPaymentConfigService.getPaymentConfigs(propertyId);
  return successResponse(configs);
});

const paymentConfigSchema = z.object({
  provider: z.enum(["RAZORPAY", "STRIPE", "PHONEPE", "MANUAL_UPI"]),
  isActive: z.boolean().default(true),
  upiId: z.string().optional(),
  merchantName: z.string().optional(),
  bankName: z.string().optional(),
  gatewayKey: z.string().optional(),
  gatewaySecret: z.string().optional(),
  webhookSecret: z.string().optional(),
});

export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) => {
  const auth = await requireRole(request, ["admin", "super_admin", "owner", "partner"]);
  if (!auth.authorized) return auth.response!;

  const resolvedParams = await params;
  const { propertyId } = propertyIdParamSchema.parse(resolvedParams);

  const access = await requirePropertyAccess(request, propertyId);
  if (!access.authorized) return access.response!;

  const body = await request.json();
  const data = paymentConfigSchema.parse(body);

  const config = await propertyPaymentConfigService.upsertPaymentConfig(propertyId, data);
  return successResponse(config, { status: 201 });
});

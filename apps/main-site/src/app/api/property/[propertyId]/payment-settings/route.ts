import { NextRequest, NextResponse } from "next/server";
import { requirePropertyAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { PropertyPaymentConfigSchema } from "@/modules/payments/validators";
import { encrypt } from "@/modules/payments/utils/crypto";

// Mask sensitive strings (API Secrets, Webhook Secrets) for UI responses
function maskSecret(secret: string | null | undefined): string | null {
  if (!secret) return null;
  return "••••••••••••••••";
}

/**
 * GET /api/property/[propertyId]/payment-settings
 * Returns all payment provider settings configured for a property, with sensitive fields masked.
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await props.params;

  try {
    // 1. Check strict tenant isolation & RBAC access bounds
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch configurations
    const configs = await prisma.propertyPaymentConfig.findMany({
      where: { propertyId },
      orderBy: { provider: "asc" }
    });

    // 3. Mask sensitive keys before exposing them
    const sanitizedConfigs = configs.map(config => ({
      id: config.id,
      provider: config.provider,
      upiId: config.upiId,
      merchantName: config.merchantName,
      bankName: config.bankName,
      gatewayKey: config.gatewayKey,
      hasGatewaySecret: !!config.gatewaySecret,
      gatewaySecret: maskSecret(config.gatewaySecret),
      hasWebhookSecret: !!config.webhookSecret,
      webhookSecret: maskSecret(config.webhookSecret),
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }));

    return NextResponse.json({ success: true, configs: sanitizedConfigs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET payment settings failure:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/property/[propertyId]/payment-settings
 * Upserts a payment configuration for a property, encrypting secrets and enforcing RBAC.
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await props.params;

  try {
    // 1. Check strict tenant isolation & RBAC access bounds
    const auth = await requirePropertyAccess(request, propertyId);
    if (!auth.authorized) {
      return auth.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // 2. Schema Zod Validation
    const result = PropertyPaymentConfigSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed", 
          details: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const validated = result.data;

    // 3. Execute atomic DB Transaction to ensure only ONE active provider is active initially
    const config = await prisma.$transaction(async (tx) => {
      // Find if we already have a record for this provider
      const existingConfig = await tx.propertyPaymentConfig.findFirst({
        where: {
          propertyId,
          provider: validated.provider
        }
      });

      // Encrypt secrets if they are provided as updates
      let encryptedGatewaySecret = existingConfig?.gatewaySecret || null;
      let encryptedWebhookSecret = existingConfig?.webhookSecret || null;

      // Only update secret if a non-masked new value is sent
      if (validated.gatewaySecret && validated.gatewaySecret !== "••••••••••••••••") {
        encryptedGatewaySecret = encrypt(validated.gatewaySecret);
      }
      if (validated.webhookSecret && validated.webhookSecret !== "••••••••••••••••") {
        encryptedWebhookSecret = encrypt(validated.webhookSecret);
      }

      // If this config is set to active, automatically deactivate all other configs for this property
      if (validated.isActive) {
        await tx.propertyPaymentConfig.updateMany({
          where: {
            propertyId,
            provider: { not: validated.provider }
          },
          data: {
            isActive: false
          }
        });
      }

      let savedConfig;
      if (existingConfig) {
        // Update
        savedConfig = await tx.propertyPaymentConfig.update({
          where: { id: existingConfig.id },
          data: {
            upiId: validated.upiId || null,
            merchantName: validated.merchantName || null,
            bankName: validated.bankName || null,
            gatewayKey: validated.gatewayKey || null,
            gatewaySecret: encryptedGatewaySecret,
            webhookSecret: encryptedWebhookSecret,
            isActive: validated.isActive
          }
        });
      } else {
        // Create
        savedConfig = await tx.propertyPaymentConfig.create({
          data: {
            propertyId,
            provider: validated.provider,
            upiId: validated.upiId || null,
            merchantName: validated.merchantName || null,
            bankName: validated.bankName || null,
            gatewayKey: validated.gatewayKey || null,
            gatewaySecret: encryptedGatewaySecret,
            webhookSecret: encryptedWebhookSecret,
            isActive: validated.isActive
          }
        });
      }

      return savedConfig;
    });

    return NextResponse.json({
      success: true,
      message: `${validated.provider} configuration saved successfully.`,
      configId: config.id
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PATCH payment settings failure:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

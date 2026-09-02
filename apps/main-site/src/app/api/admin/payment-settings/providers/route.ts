import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { encryptSecret } from "@/lib/server/encryption";
import { PaymentProviderType, PaymentProvider, Prisma } from "@prisma/client";

/**
 * GET /api/admin/payment-settings/providers
 * Returns all payment providers with secrets masked.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const providers = await prisma.paymentProvider.findMany({
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ]
    });

    // Mask sensitive configurations in frontend responses
    const maskedProviders = providers.map((p: PaymentProvider) => ({
      ...p,
      apiKey: p.apiKey ? "••••••••" : null,
      secretKey: p.secretKey ? "••••••••" : null,
      webhookSecret: p.webhookSecret ? "••••••••" : null
    }));

    return NextResponse.json({ success: true, providers: maskedProviders });

  } catch (error) {
    console.error("[ADMIN_PROVIDERS_GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/payment-settings/providers
 * Creates a new payment provider configuration.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      providerType,
      displayName,
      isEnabled,
      isManual,
      isSandbox,
      isDefault,
      priority,
      apiKey,
      secretKey,
      webhookSecret,
      merchantId,
      merchantName,
      upiId,
      qrImageUrl,
      instructions,
      supportNumber,
      supportEmail
    } = body;

    if (!providerType || !displayName) {
      return NextResponse.json({ error: "Missing required fields: providerType, displayName" }, { status: 400 });
    }

    if (!Object.values(PaymentProviderType).includes(providerType as PaymentProviderType)) {
      return NextResponse.json({ error: `Unsupported provider type: ${providerType}` }, { status: 400 });
    }

    // Encrypt raw credentials
    const encryptedApiKey = apiKey ? encryptSecret(apiKey) : null;
    const encryptedSecretKey = secretKey ? encryptSecret(secretKey) : null;
    const encryptedWebhookSecret = webhookSecret ? encryptSecret(webhookSecret) : null;

    const parsedPriority = parseInt(priority || "0", 10);
    const parsedDefault = !!isDefault;

    // Persist transactionally
    const provider = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Reset other defaults if this is marked as default
      if (parsedDefault) {
        await tx.paymentProvider.updateMany({
          data: { isDefault: false }
        });
      }

      // 2. Create the configuration record
      const record = await tx.paymentProvider.create({
        data: {
          providerType: providerType as PaymentProviderType,
          displayName,
          isEnabled: isEnabled !== false,
          isManual: !!isManual,
          isSandbox: !!isSandbox,
          isDefault: parsedDefault,
          priority: parsedPriority,
          apiKey: encryptedApiKey,
          secretKey: encryptedSecretKey,
          webhookSecret: encryptedWebhookSecret,
          merchantId: merchantId || null,
          merchantName: merchantName || null,
          upiId: upiId || null,
          qrImageUrl: qrImageUrl || null,
          instructions: instructions || null,
          supportNumber: supportNumber || null,
          supportEmail: supportEmail || null
        }
      });

      // 3. Create Audit log
      // Locate or construct dummy transaction trace or link directly to operational logs
      await tx.paymentAuditLog.create({
        data: {
          transactionId: "00000000-0000-0000-0000-000000000000", // System baseline ID
          action: "PROVIDER_CREATED",
          newStatus: "ACTIVE",
          performedBy: auth.userId,
          metadata: {
            providerId: record.id,
            providerType: record.providerType,
            displayName: record.displayName,
            isDefault: record.isDefault,
            priority: record.priority
          }
        }
      });

      return record;
    });

    return NextResponse.json({
      success: true,
      message: "Payment provider configuration created successfully",
      providerId: provider.id
    });

  } catch (error) {
    console.error("[ADMIN_PROVIDERS_POST] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

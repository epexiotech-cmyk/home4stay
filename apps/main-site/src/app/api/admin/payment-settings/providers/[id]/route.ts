import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { prisma } from "@/lib/database/prisma";
import { encryptSecret } from "@/lib/server/encryption";

/**
 * PUT /api/admin/payment-settings/providers/:id
 * Updates payment provider configuration, rotating credentials if changed.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;

    // 1. Authenticate caller (Super Admin only)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const currentProvider = await prisma.paymentProvider.findUnique({
      where: { id: providerId }
    });

    if (!currentProvider) {
      return NextResponse.json({ error: "Payment provider not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
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

    // Build update parameters object
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (isEnabled !== undefined) updateData.isEnabled = !!isEnabled;
    if (isManual !== undefined) updateData.isManual = !!isManual;
    if (isSandbox !== undefined) updateData.isSandbox = !!isSandbox;
    if (priority !== undefined) updateData.priority = parseInt(priority || "0", 10);
    if (merchantId !== undefined) updateData.merchantId = merchantId || null;
    if (merchantName !== undefined) updateData.merchantName = merchantName || null;
    if (upiId !== undefined) updateData.upiId = upiId || null;
    if (qrImageUrl !== undefined) updateData.qrImageUrl = qrImageUrl || null;
    if (instructions !== undefined) updateData.instructions = instructions || null;
    if (supportNumber !== undefined) updateData.supportNumber = supportNumber || null;
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail || null;

    // Handle credential encryption, skipping masked placeholder updates
    if (apiKey !== undefined) {
      if (apiKey !== "••••••••") {
        updateData.apiKey = apiKey ? encryptSecret(apiKey) : null;
      }
    }
    if (secretKey !== undefined) {
      if (secretKey !== "••••••••") {
        updateData.secretKey = secretKey ? encryptSecret(secretKey) : null;
      }
    }
    if (webhookSecret !== undefined) {
      if (webhookSecret !== "••••••••") {
        updateData.webhookSecret = webhookSecret ? encryptSecret(webhookSecret) : null;
      }
    }

    const parsedDefault = isDefault !== undefined ? !!isDefault : currentProvider.isDefault;
    if (isDefault !== undefined) {
      updateData.isDefault = parsedDefault;
    }

    // Run transaction
    const updated = await prisma.$transaction(async (tx: any) => {
      // 1. Reset other defaults if this is marked as default
      if (parsedDefault && !currentProvider.isDefault) {
        await tx.paymentProvider.updateMany({
          where: { id: { not: providerId } },
          data: { isDefault: false }
        });
      }

      // 2. Perform updates
      const record = await tx.paymentProvider.update({
        where: { id: providerId },
        data: updateData
      });

      // 3. Log Audit
      await tx.paymentAuditLog.create({
        data: {
          transactionId: "00000000-0000-0000-0000-000000000000",
          action: "PROVIDER_EDITED",
          performedBy: auth.userId,
          metadata: {
            providerId,
            changes: Object.keys(updateData).filter(k => !["apiKey", "secretKey", "webhookSecret"].includes(k))
          }
        }
      });

      return record;
    });

    return NextResponse.json({
      success: true,
      message: "Payment provider updated successfully",
      providerId: updated.id
    });

  } catch (error: any) {
    console.error("[ADMIN_PROVIDER_PUT] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/payment-settings/providers/:id
 * Deletes or soft-disables a payment provider.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;

    // 1. Authenticate caller (Super Admin only)
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized: Missing active session" }, { status: 401 });
    }

    if (auth.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden: Super Admin operational access required" }, { status: 403 });
    }

    const provider = await prisma.paymentProvider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      return NextResponse.json({ error: "Payment provider not found" }, { status: 404 });
    }

    // Prevent deleting the default provider to avoid system crashes
    if (provider.isDefault) {
      return NextResponse.json({ error: "Cannot delete the default active payment provider. Mark another provider as default first." }, { status: 400 });
    }

    await prisma.$transaction(async (tx: any) => {
      // Cascade delete or soft-disable settings
      await tx.paymentProvider.delete({
        where: { id: providerId }
      });

      await tx.paymentAuditLog.create({
        data: {
          transactionId: "00000000-0000-0000-0000-000000000000",
          action: "PROVIDER_DELETED",
          performedBy: auth.userId,
          metadata: {
            providerId,
            displayName: provider.displayName,
            providerType: provider.providerType
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Payment provider deleted successfully"
    });

  } catch (error) {
    console.error("[ADMIN_PROVIDER_DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

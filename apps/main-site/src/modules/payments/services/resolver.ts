import { prisma } from "../../../lib/database/prisma";
import { PaymentProvider, PaymentProviderType } from "@prisma/client";

/**
 * Resolves the active payment provider based on configuration completeness, priorities, and default flags.
 */
export async function getActivePaymentProvider(): Promise<PaymentProvider> {
  const chain = await getPaymentProviderChain();
  if (chain.length === 0) {
    throw new Error("No active payment provider is configured on the platform.");
  }
  return chain[0];
}

/**
 * Resolves all active, fully-configured providers in preferred priority order:
 * 1. PhonePe
 * 2. YES BANK
 * 3. Manual UPI fallback
 */
export async function getPaymentProviderChain(): Promise<PaymentProvider[]> {
  const providers = await prisma.paymentProvider.findMany({
    where: { isEnabled: true },
    orderBy: [
      { priority: "desc" },
      { isDefault: "desc" }
    ]
  });

  const validChain: PaymentProvider[] = [];

  for (const provider of providers) {
    let isConfigured = false;
    if (provider.providerType === PaymentProviderType.MANUAL_UPI) {
      isConfigured = !!(provider.upiId && provider.instructions);
    } else {
      isConfigured = !!(provider.apiKey || provider.merchantId || provider.gatewayConfig);
    }

    if (isConfigured) {
      validChain.push(provider);
    }
  }

  // Define static priority fallback ordering rank
  const providerPriorityRank: Record<PaymentProviderType, number> = {
    [PaymentProviderType.PHONEPE]: 1,
    [PaymentProviderType.YES_BANK]: 2,
    [PaymentProviderType.MANUAL_UPI]: 3,
    [PaymentProviderType.RAZORPAY]: 4,
    [PaymentProviderType.CASHFREE]: 5,
    [PaymentProviderType.STRIPE]: 6,
  };

  return validChain.sort((a, b) => {
    // 1st Priority: Database Priority field (highest first)
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    // 2nd Priority: Default configuration flag
    if (b.isDefault !== a.isDefault) {
      return (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0);
    }
    // 3rd Priority: Programmatic fallbacks (PhonePe -> YES BANK -> Manual UPI)
    const rankA = providerPriorityRank[a.providerType] ?? 99;
    const rankB = providerPriorityRank[b.providerType] ?? 99;
    return rankA - rankB;
  });
}

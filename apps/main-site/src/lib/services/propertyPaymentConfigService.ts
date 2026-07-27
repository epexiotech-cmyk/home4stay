import { propertyRepository } from '../repositories/propertyRepository';
import { encrypt } from "@/modules/payments/utils/crypto";

export class PropertyPaymentConfigService {
  async getPaymentConfigs(propertyId: string) {
    const configs = await propertyRepository.findPaymentConfigsByPropertyId(propertyId);
    return configs.map(config => ({
      id: config.id,
      provider: config.provider,
      upiId: config.upiId,
      merchantName: config.merchantName,
      bankName: config.bankName,
      gatewayKey: config.gatewayKey,
      hasGatewaySecret: !!config.gatewaySecret,
      gatewaySecret: config.gatewaySecret ? "••••••••••••••••" : null,
      hasWebhookSecret: !!config.webhookSecret,
      webhookSecret: config.webhookSecret ? "••••••••••••••••" : null,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }));
  }
  
  async getPublicPaymentConfig(propertyId: string) {
    const activeConfig = await propertyRepository.findActivePaymentConfig(propertyId);
    if (!activeConfig) return { active: false, provider: null };
    return {
      active: true,
      provider: activeConfig.provider,
      upiId: activeConfig.upiId,
      merchantName: activeConfig.merchantName
    };
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async upsertPaymentConfig(propertyId: string, data: any) {
    let encryptedGatewaySecret: string | null = null;
    let encryptedWebhookSecret: string | null = null;
    if (data.gatewaySecret && data.gatewaySecret !== "••••••••••••••••") {
      encryptedGatewaySecret = encrypt(data.gatewaySecret);
    }
    if (data.webhookSecret && data.webhookSecret !== "••••••••••••••••") {
      encryptedWebhookSecret = encrypt(data.webhookSecret);
    }
    return await propertyRepository.upsertPaymentConfigWithTransaction(
      propertyId,
      data.provider,
      encryptedGatewaySecret !== null ? encryptedGatewaySecret : null,
      encryptedWebhookSecret !== null ? encryptedWebhookSecret : null,
      data.isActive,
      data.upiId || null,
      data.merchantName || null,
      data.bankName || null,
      data.gatewayKey || null
    );
  }
}

export const propertyPaymentConfigService = new PropertyPaymentConfigService();

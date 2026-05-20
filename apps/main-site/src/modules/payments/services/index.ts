import { prisma } from "../../../lib/database/prisma";
import { IPaymentProvider, PaymentRequest } from "./interfaces";
import { ManualUpiProvider } from "./manual-upi/provider";
import { RazorpayProvider } from "./gateways/razorpay";
import { StripeProvider } from "./gateways/stripe";
import { CashfreeProvider } from "./gateways/cashfree";
import { PhonePeProvider } from "./gateways/phonepe";
import { YesBankProvider } from "./gateways/yesbank";
import { getPaymentProviderChain } from "./resolver";
import { PaymentProviderType, PaymentStatus, PaymentTransaction } from "@prisma/client";

export class PaymentService {
  /**
   * Instantiates a concrete payment provider class based on its database configurations
   */
  static async getProviderInstance(providerId: string): Promise<IPaymentProvider> {
    const config = await prisma.paymentProvider.findUnique({
      where: { id: providerId }
    });

    if (!config) {
      throw new Error(`Payment provider config with ID ${providerId} not found`);
    }

    if (!config.isEnabled) {
      throw new Error(`Payment provider ${config.displayName} is currently disabled`);
    }

    switch (config.providerType) {
      case PaymentProviderType.MANUAL_UPI:
        return new ManualUpiProvider({
          upiId: config.upiId || undefined,
          qrImageUrl: config.qrImageUrl || undefined,
          instructions: config.instructions || undefined
        });

      case PaymentProviderType.RAZORPAY:
        return new RazorpayProvider({
          apiKey: config.apiKey || undefined,
          secretKey: config.secretKey || undefined,
          merchantId: config.merchantId || undefined,
          isSandbox: config.isSandbox
        });

      case PaymentProviderType.STRIPE:
        return new StripeProvider({
          apiKey: config.apiKey || undefined,
          secretKey: config.secretKey || undefined,
          webhookSecret: config.webhookSecret || undefined,
          isSandbox: config.isSandbox
        });

      case PaymentProviderType.CASHFREE:
        return new CashfreeProvider({
          apiKey: config.apiKey || undefined,
          secretKey: config.secretKey || undefined,
          isSandbox: config.isSandbox
        });

      case PaymentProviderType.PHONEPE:
        return new PhonePeProvider({
          merchantId: config.merchantId || undefined,
          saltKey: config.secretKey || undefined,
          isSandbox: config.isSandbox,
          gatewayConfig: config.gatewayConfig
        });

      case PaymentProviderType.YES_BANK:
        return new YesBankProvider({
          merchantId: config.merchantId || undefined,
          encryptionKey: config.secretKey || undefined,
          isSandbox: config.isSandbox,
          gatewayConfig: config.gatewayConfig
        });

      default:
        throw new Error(`Unsupported payment provider type: ${config.providerType}`);
    }
  }

  /**
   * Creates a transaction record, generates audit logs, and calls the provider to initiate checkout
   */
  static async initiatePayment(params: {
    propertyId: string;
    subscriptionId?: string;
    providerId: string;
    amount: number;
    currency?: string;
    customerEmail: string;
    customerPhone?: string;
    metadata?: Record<string, any>;
  }): Promise<{ transaction: PaymentTransaction; gatewayResponse: any; paymentUrl?: string; qrCodeUrl?: string }> {
    const currency = params.currency || "INR";

    // 1. Transactionally write pending transaction and baseline audit logs
    const transaction = await prisma.paymentTransaction.create({
      data: {
        propertyId: params.propertyId,
        subscriptionId: params.subscriptionId || null,
        providerId: params.providerId,
        paymentStatus: PaymentStatus.PENDING,
        amount: params.amount,
        currency,
        gatewayResponse: {}
      }
    });

    await prisma.paymentAuditLog.create({
      data: {
        transactionId: transaction.id,
        action: "TRANSACTION_CREATED",
        newStatus: PaymentStatus.PENDING,
        performedBy: "system_billing_v1",
        metadata: {
          amount: params.amount,
          currency,
          providerId: params.providerId
        }
      }
    });

    // 2. Fetch the provider instance and initialize charge
    const provider = await this.getProviderInstance(params.providerId);
    const charge = await provider.createPayment({
      transactionId: transaction.id,
      amount: params.amount,
      currency,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      metadata: params.metadata
    });

    // 3. Update the transaction record with gateway ordering references
    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        gatewayOrderId: charge.gatewayOrderId || null,
        gatewayTransactionId: charge.gatewayTransactionId || null,
        gatewayResponse: charge.rawResponse || {}
      }
    });

    return {
      transaction: updatedTransaction,
      gatewayResponse: charge.rawResponse,
      paymentUrl: charge.paymentUrl,
      qrCodeUrl: charge.qrCodeUrl
    };
  }

  /**
   * Approves a manual peer-to-peer UPI transfer based on UTR reference validation
   */
  static async approveManualUpiPayment(
    transactionId: string, 
    adminUserId: string, 
    reviewNote?: string
  ): Promise<PaymentTransaction> {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.paymentStatus !== PaymentStatus.PENDING && transaction.paymentStatus !== PaymentStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot approve transaction. Status is already ${transaction.paymentStatus}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const txRecord = await tx.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          paymentStatus: PaymentStatus.APPROVED,
          adminReviewNote: reviewNote || "Manual UPI transfer confirmed.",
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          paidAt: new Date()
        }
      });

      await tx.paymentAuditLog.create({
        data: {
          transactionId,
          action: "MANUAL_UPI_APPROVED",
          oldStatus: transaction.paymentStatus,
          newStatus: PaymentStatus.APPROVED,
          performedBy: adminUserId,
          metadata: {
            reviewNote,
            utrNumber: transaction.utrNumber
          }
        }
      });

      return txRecord;
    });

    return updated;
  }

  /**
   * Rejects a manual peer-to-peer UPI transfer
   */
  static async rejectManualUpiPayment(
    transactionId: string, 
    adminUserId: string, 
    reviewNote?: string
  ): Promise<PaymentTransaction> {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.paymentStatus !== PaymentStatus.PENDING && transaction.paymentStatus !== PaymentStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot reject transaction. Status is already ${transaction.paymentStatus}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const txRecord = await tx.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          paymentStatus: PaymentStatus.REJECTED,
          adminReviewNote: reviewNote || "Manual UPI UTR verification failed.",
          reviewedBy: adminUserId,
          reviewedAt: new Date()
        }
      });

      await tx.paymentAuditLog.create({
        data: {
          transactionId,
          action: "MANUAL_UPI_REJECTED",
          oldStatus: transaction.paymentStatus,
          newStatus: PaymentStatus.REJECTED,
          performedBy: adminUserId,
          metadata: {
            reviewNote,
            utrNumber: transaction.utrNumber
          }
        }
      });

      return txRecord;
    });

    return updated;
  }

  /**
   * Smart gateway fallback routing:
   * Tries to initiate payment with the highest priority provider. If it fails,
   * automatically routes to the next provider in priority, falling back to MANUAL_UPI.
   */
  static async initiatePaymentWithFallback(params: {
    propertyId: string;
    subscriptionId?: string;
    amount: number;
    currency?: string;
    customerEmail: string;
    customerPhone?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    transaction: PaymentTransaction;
    gatewayResponse: any;
    paymentUrl?: string;
    qrCodeUrl?: string;
    providerType: PaymentProviderType;
  }> {
    const chain = await getPaymentProviderChain();
    if (chain.length === 0) {
      throw new Error("No enabled payment providers configured on the platform.");
    }

    const currency = params.currency || "INR";

    // 1. Create a baseline transaction record using the highest priority provider
    let currentProvider = chain[0];
    let transaction = await prisma.paymentTransaction.create({
      data: {
        propertyId: params.propertyId,
        subscriptionId: params.subscriptionId || null,
        providerId: currentProvider.id,
        paymentStatus: PaymentStatus.ORDER_CREATED,
        amount: params.amount,
        currency,
        gatewayResponse: {}
      }
    });

    await prisma.paymentAuditLog.create({
      data: {
        transactionId: transaction.id,
        action: "TRANSACTION_CREATED",
        newStatus: PaymentStatus.ORDER_CREATED,
        performedBy: "smart_router_v1",
        metadata: {
          amount: params.amount,
          currency,
          providerId: currentProvider.id,
          priorityChain: chain.map(c => c.providerType)
        }
      }
    });

    let lastError: Error | null = null;

    for (let i = 0; i < chain.length; i++) {
      currentProvider = chain[i];
      try {
        // If we are on a subsequent attempt, update transaction provider reference
        if (i > 0) {
          transaction = await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: { providerId: currentProvider.id }
          });

          await prisma.paymentAuditLog.create({
            data: {
              transactionId: transaction.id,
              action: "GATEWAY_FAILOVER",
              performedBy: "smart_router_v1",
              metadata: {
                previousProvider: chain[i - 1].providerType,
                failedWithError: lastError?.message,
                nextProvider: currentProvider.providerType
              }
            }
          });
        }

        // Fetch provider instance and execute createPayment
        const provider = await this.getProviderInstance(currentProvider.id);
        const charge = await provider.createPayment({
          transactionId: transaction.id,
          amount: params.amount,
          currency,
          customerEmail: params.customerEmail,
          customerPhone: params.customerPhone,
          metadata: params.metadata
        });

        // Update transaction with gateway order information
        const updatedTransaction = await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: PaymentStatus.PENDING,
            gatewayOrderId: charge.gatewayOrderId || null,
            gatewayTransactionId: charge.gatewayTransactionId || null,
            gatewayResponse: charge.rawResponse || {}
          }
        });

        // Initialize reconciliation trace record
        await prisma.paymentReconciliation.create({
          data: {
            transactionId: transaction.id,
            gatewayTransactionId: charge.gatewayTransactionId || null,
            reconciliationStatus: "UNRECONCILED",
            verificationState: "PENDING",
            callbackLogs: [
              { timestamp: new Date().toISOString(), event: "checkout_initiated", provider: currentProvider.providerType }
            ]
          }
        }).catch(() => {});

        return {
          transaction: updatedTransaction,
          gatewayResponse: charge.rawResponse,
          paymentUrl: charge.paymentUrl,
          qrCodeUrl: charge.qrCodeUrl,
          providerType: currentProvider.providerType
        };
      } catch (err: any) {
        console.error(`Gateway ${currentProvider.displayName} failed to initiate checkout:`, err.message);
        lastError = err;
      }
    }

    // If everything failed, update transaction to failed state
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { paymentStatus: PaymentStatus.FAILED }
    });

    await prisma.paymentAuditLog.create({
      data: {
        transactionId: transaction.id,
        action: "TRANSACTION_FAILED",
        newStatus: PaymentStatus.FAILED,
        performedBy: "smart_router_v1",
        metadata: {
          error: "All gateways failed to initiate checkout",
          lastErrorMessage: lastError?.message
        }
      }
    });

    throw new Error(`Failed to initiate checkout via gateway chain. Last error: ${lastError?.message}`);
  }
}

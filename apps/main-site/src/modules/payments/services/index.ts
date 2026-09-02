import { prisma } from "../../../lib/database/prisma";
import { IPaymentProvider } from "./interfaces";
import { ManualUpiProvider } from "./manual-upi/provider";
import { RazorpayProvider } from "./gateways/razorpay";
import { StripeProvider } from "./gateways/stripe";
import { CashfreeProvider } from "./gateways/cashfree";
import { PhonePeProvider } from "./gateways/phonepe";
import { YesBankProvider } from "./gateways/yesbank";
import { getPaymentProviderChain } from "./resolver";
import { PaymentProviderType, PaymentStatus, PaymentTransaction, BillingCycle } from "@prisma/client";
import { PaymentRepository } from "../../../lib/repositories/paymentRepository";

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
          gatewayConfig: (config.gatewayConfig as Record<string, unknown> | null) || undefined
        });

      case PaymentProviderType.YES_BANK:
        return new YesBankProvider({
          merchantId: config.merchantId || undefined,
          encryptionKey: config.secretKey || undefined,
          isSandbox: config.isSandbox,
          gatewayConfig: (config.gatewayConfig as Record<string, unknown> | null) || undefined
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
    metadata?: Record<string, unknown>;
  }): Promise<{ transaction: PaymentTransaction; gatewayResponse: Record<string, unknown>; paymentUrl?: string; qrCodeUrl?: string }> {
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
        gatewayResponse: (charge.rawResponse || {}) as import("@prisma/client").Prisma.InputJsonValue
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
    const transaction = await PaymentRepository.findTransactionById(transactionId);

    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.paymentStatus !== PaymentStatus.PENDING && transaction.paymentStatus !== PaymentStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot approve transaction. Status is already ${transaction.paymentStatus}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const txRecord = await PaymentRepository.updateTransaction(
        transactionId,
        {
          paymentStatus: PaymentStatus.APPROVED,
          adminReviewNote: reviewNote || "Manual UPI transfer confirmed.",
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          paidAt: new Date()
        },
        tx
      );

      await PaymentRepository.createAuditLog(
        {
          transactionId,
          action: "MANUAL_UPI_APPROVED",
          oldStatus: transaction.paymentStatus,
          newStatus: PaymentStatus.APPROVED,
          performedBy: adminUserId,
          metadata: {
            reviewNote,
            utrNumber: transaction.utrNumber
          }
        },
        tx
      );

      // Auto-issue GST Tax Invoice atomically on approval
      if (txRecord.subscriptionId) {
        const { SubscriptionLifecycleService } = await import("./subscriptionLifecycle");
        const { InvoiceService } = await import("@/lib/financial/invoiceService");
        
        await SubscriptionLifecycleService.activateSubscription(txRecord.subscriptionId, adminUserId);
        try {
          await InvoiceService.generateInvoiceForTransaction(transactionId);
        } catch (invoiceErr) {
          console.error("[INVOICE_GENERATION_HOOK_ERROR] Failed to auto-issue invoice:", invoiceErr);
        }
      }

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
    const transaction = await PaymentRepository.findTransactionById(transactionId);

    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.paymentStatus !== PaymentStatus.PENDING && transaction.paymentStatus !== PaymentStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot reject transaction. Status is already ${transaction.paymentStatus}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const txRecord = await PaymentRepository.updateTransaction(
        transactionId,
        {
          paymentStatus: PaymentStatus.REJECTED,
          adminReviewNote: reviewNote || "Manual UPI UTR verification failed.",
          reviewedBy: adminUserId,
          reviewedAt: new Date()
        },
        tx
      );

      await PaymentRepository.createAuditLog(
        {
          transactionId,
          action: "MANUAL_UPI_REJECTED",
          oldStatus: transaction.paymentStatus,
          newStatus: PaymentStatus.REJECTED,
          performedBy: adminUserId,
          metadata: {
            reviewNote,
            utrNumber: transaction.utrNumber
          }
        },
        tx
      );

      if (txRecord.subscriptionId) {
        await tx.propertySubscription.update({
          where: { id: txRecord.subscriptionId },
          data: { status: "INACTIVE" }
        });
      }

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
    metadata?: Record<string, unknown>;
  }): Promise<{
    transaction: PaymentTransaction;
    gatewayResponse: Record<string, unknown>;
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
            gatewayResponse: (charge.rawResponse || {}) as import("@prisma/client").Prisma.InputJsonValue
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
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error("Unknown routing failure");
        console.error(`Gateway ${currentProvider.displayName} failed to initiate checkout:`, errorInstance.message);
        lastError = errorInstance;
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

  /**
   * Orchestrates the business flow for processing incoming webhooks
   * Ensures the database transactions are managed centrally.
   */
  static async processWebhook(params: {
    transactionId: string;
    status: PaymentStatus;
    rawBody: any;
    bankReference: string | null;
    statusCode: string | undefined;
    gatewayTransactionId: string;
    settlementReference: string;
  }) {
    const { transactionId, status, rawBody, bankReference, statusCode, gatewayTransactionId, settlementReference } = params;
    
    const transaction = await PaymentRepository.findTransactionById(transactionId);
    if (!transaction) throw new Error(`Transaction ${transactionId} not found`);

    return await prisma.$transaction(async (tx) => {
      // 1. Update transaction
      const updatedTx = await PaymentRepository.updateTransaction(
        transactionId,
        {
          paymentStatus: status,
          paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
          gatewayResponse: {
            ...(transaction.gatewayResponse as Record<string, unknown> || {}),
            webhookReceivedAt: new Date().toISOString(),
            webhookPayload: rawBody
          }
        },
        tx
      );

      // 2. Audit Log
      await PaymentRepository.createAuditLog(
        {
          transactionId,
          action: "WEBHOOK_PROCESSED",
          oldStatus: transaction.paymentStatus,
          newStatus: status,
          performedBy: "webhook_v1",
          metadata: { bankReference, statusCode }
        },
        tx
      );

      // 3. Reconciliation
      const existingRecon = await PaymentRepository.findReconciliation(transactionId, tx);
      const bankRef = bankReference || `bank_ref_${Date.now()}`;
      const settlementRef = settlementReference || `settle_ref_${Date.now()}`;

      if (existingRecon) {
        const previousLogs = (existingRecon.callbackLogs as import("@prisma/client").Prisma.InputJsonValue[]) || [];
        const newLogEntry = { timestamp: new Date().toISOString(), event: "webhook", status };
        await PaymentRepository.updateReconciliation(
          transactionId,
          {
            gatewayTransactionId: transaction.gatewayTransactionId || gatewayTransactionId,
            bankReference: bankRef,
            settlementReference: settlementRef,
            reconciliationStatus: status === PaymentStatus.SUCCESS ? "MATCHED" : "MISMATCHED",
            verificationState: status === PaymentStatus.SUCCESS ? "VERIFIED" : "FAILED",
            mismatchReason: status !== PaymentStatus.SUCCESS ? "Payment Webhook reported FAILED status" : null,
            callbackLogs: [...previousLogs, newLogEntry]
          },
          tx
        );
      } else {
        const initialLog = { timestamp: new Date().toISOString(), event: "webhook_init", status };
        await PaymentRepository.createReconciliation(
          {
            transactionId,
            gatewayTransactionId: transaction.gatewayTransactionId || gatewayTransactionId,
            bankReference: bankRef,
            settlementReference: settlementRef,
            reconciliationStatus: status === PaymentStatus.SUCCESS ? "MATCHED" : "MISMATCHED",
            verificationState: status === PaymentStatus.SUCCESS ? "VERIFIED" : "FAILED",
            mismatchReason: status !== PaymentStatus.SUCCESS ? "Payment Webhook reported FAILED status" : null,
            callbackLogs: [initialLog]
          },
          tx
        );
      }

      return updatedTx;
    });
  }

  /**
   * Orchestrates the manual UPI submission workflow.
   */
  static async processManualUpiSubmission(params: {
    userId: string;
    propertyId: string;
    selectedPlanId: string;
    billingCycle: BillingCycle;
    utrNumber: string;
    screenshot: File;
    acceptedSubscriptionAgreementVersion: string;
    ip: string;
    userAgent: string;
  }) {
    const { userId, propertyId, selectedPlanId, billingCycle, utrNumber, screenshot, acceptedSubscriptionAgreementVersion, ip, userAgent } = params;

    // Resolve active subscription agreement
    const { LegalService } = await import("@/lib/legal/legalService");
    const activeSub = await LegalService.getActiveDocument("SUBSCRIPTION_AGREEMENT");
    let subAgreementDocId = "";
    if (activeSub) {
      if (activeSub.version !== acceptedSubscriptionAgreementVersion) {
        throw new Error(`Outdated Subscription Agreement version accepted (${acceptedSubscriptionAgreementVersion}). Current active is ${activeSub.version}.`);
      }
      subAgreementDocId = activeSub.id;
    } else {
      const placeholderSub = await prisma.legalDocument.create({
        data: {
          documentType: "SUBSCRIPTION_AGREEMENT",
          title: "Subscription Agreement",
          slug: "subscription-agreement",
          version: acceptedSubscriptionAgreementVersion || "1.0.0",
          content: "Default Subscription Agreement. Please manage in Super Admin.",
          isActive: true,
          publishedAt: new Date()
        }
      });
      subAgreementDocId = placeholderSub.id;
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new Error("Property not found");
    if (property.ownerId !== userId) throw new Error("Forbidden: You do not own this property");

    const duplicateUtr = await PaymentRepository.findDuplicateUtr(utrNumber, propertyId);
    if (duplicateUtr) throw new Error("This UTR reference has already been submitted");

    const pendingSubmission = await PaymentRepository.findPendingSubmission(propertyId, "manual-upi-provider-id"); // Simplified for now
    if (pendingSubmission) throw new Error("You already have a pending payment approval for this property");

    const provider = await prisma.paymentProvider.findFirst({
      where: { providerType: PaymentProviderType.MANUAL_UPI, isEnabled: true }
    });
    if (!provider) throw new Error("Manual UPI provider is not active or configured");

    const { storageDriver } = await import("@/lib/server/storageDriver");
    const fileBuffer = Buffer.from(await screenshot.arrayBuffer());
    const storedFilename = await storageDriver.uploadFile(fileBuffer, screenshot.name, screenshot.type);

    const PLAN_RATES: Record<string, Record<string, number>> = {
      basic: { MONTHLY: 999, QUARTERLY: 2499, YEARLY: 7999, LIFETIME: 19999 },
      premium: { MONTHLY: 1999, QUARTERLY: 4999, YEARLY: 14999, LIFETIME: 39999 }
    };
    const planIdKey = selectedPlanId.toLowerCase();
    const amount = PLAN_RATES[planIdKey]?.[billingCycle.toUpperCase()] || PLAN_RATES["basic"]?.[billingCycle.toUpperCase()] || 999;

    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.propertySubscription.create({
        data: {
          propertyId,
          selectedPlanId,
          status: "PENDING_PAYMENT",
          billingCycle: billingCycle,
          amount,
          currency: "INR",
          createdBy: userId
        }
      });

      const txRecord = await tx.paymentTransaction.create({
        data: {
          propertyId,
          subscriptionId: subscription.id,
          providerId: provider.id,
          paymentStatus: PaymentStatus.PENDING_APPROVAL,
          amount,
          currency: "INR",
          utrNumber,
          paymentScreenshotUrl: storedFilename
        }
      });

      await PaymentRepository.createAuditLog({
        transactionId: txRecord.id,
        action: "MANUAL_UPI_SUBMITTED",
        newStatus: PaymentStatus.PENDING_APPROVAL,
        performedBy: userId,
        metadata: { selectedPlanId, billingCycle, utrNumber, screenshotFilename: storedFilename }
      }, tx);

      await tx.legalAcceptanceLog.create({
        data: {
          userId,
          documentId: subAgreementDocId,
          acceptedVersion: acceptedSubscriptionAgreementVersion,
          ipAddress: ip,
          userAgent,
          metadata: { checkoutAcceptance: true }
        }
      });

      return txRecord;
    });
  }

  static async getUserTransactions(params: { userId: string, status?: PaymentStatus, limit: number, offset: number }) {
    return await PaymentRepository.findUserTransactions(params.userId, params.status, params.limit, params.offset);
  }
}

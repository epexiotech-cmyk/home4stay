import { prisma } from "../../../lib/database/prisma";
import { SubscriptionStatus, BillingCycle } from "@prisma/client";
import { ReferralService } from "../../../lib/referral/referralService";


export class SubscriptionLifecycleService {
  /**
   * Activates a subscription plan, calculates expiration thresholds, and makes the property publicly LIVE
   */
  static async activateSubscription(subscriptionId: string, performedBy: string = "system_billing"): Promise<void> {
    const subscription = await prisma.propertySubscription.findUnique({
      where: { id: subscriptionId },
      include: { property: true }
    });

    if (!subscription) {
      throw new Error(`Subscription with ID ${subscriptionId} not found`);
    }

    const now = new Date();
    const expiresAt = new Date();

    // Calculate expiration offset based on billing cycles
    switch (subscription.billingCycle) {
      case BillingCycle.MONTHLY:
        expiresAt.setDate(now.getDate() + 30);
        break;
      case BillingCycle.QUARTERLY:
        expiresAt.setDate(now.getDate() + 90);
        break;
      case BillingCycle.YEARLY:
        expiresAt.setDate(now.getDate() + 365);
        break;
      case BillingCycle.LIFETIME:
        expiresAt.setFullYear(now.getFullYear() + 99); // 99 years for lifetime plans
        break;
      default:
        expiresAt.setDate(now.getDate() + 30);
    }

    // Run transaction safe activation operations
    await prisma.$transaction(async (tx) => {
      // 1. Update the subscription plan parameters
      await tx.propertySubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startsAt: now,
          expiresAt,
          activatedAt: now
        }
      });

      // 2. Set the property platform status to LIVE
      await tx.property.update({
        where: { id: subscription.propertyId },
        data: {
          status: "LIVE",
          publishedAt: subscription.property.publishedAt || now
        }
      });

      // 3. Log historical lifecycle trace event
      // Locate the last transaction for this subscription to append logs
      const lastTx = await tx.paymentTransaction.findFirst({
        where: { subscriptionId },
        orderBy: { createdAt: "desc" }
      });

      if (lastTx) {
        await tx.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "SUBSCRIPTION_ACTIVATED",
            oldStatus: subscription.status,
            newStatus: SubscriptionStatus.ACTIVE,
            performedBy,
            metadata: {
              startsAt: now,
              expiresAt,
              billingCycle: subscription.billingCycle
            }
          }
        });
      }
    });

    // 4. Award referral credit if this subscription activation qualifies a referred user
    try {
      await ReferralService.awardReferralCredit(subscription.property.ownerId, subscriptionId);
    } catch (referralErr) {
      const message = referralErr instanceof Error ? referralErr.message : "Unknown error";
      console.error("[REFERRAL_CREDIT_AWARD_ERROR] Failed to award credit:", message);
    }
  }

  /**
   * Suspends an active subscription plan and sets property status to SUSPENDED
   */
  static async suspendSubscription(subscriptionId: string, performedBy: string = "system_billing"): Promise<void> {
    const subscription = await prisma.propertySubscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      throw new Error(`Subscription with ID ${subscriptionId} not found`);
    }

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Update subscription status
      await tx.propertySubscription.update({
        where: { id: subscriptionId },
        data: {
          status: SubscriptionStatus.SUSPENDED,
          suspendedAt: now
        }
      });

      // 2. Suspend property visibility
      await tx.property.update({
        where: { id: subscription.propertyId },
        data: {
          status: "SUSPENDED"
        }
      });

      // 3. Create trace audit log
      const lastTx = await tx.paymentTransaction.findFirst({
        where: { subscriptionId },
        orderBy: { createdAt: "desc" }
      });

      if (lastTx) {
        await tx.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "SUBSCRIPTION_SUSPENDED",
            oldStatus: subscription.status,
            newStatus: SubscriptionStatus.SUSPENDED,
            performedBy,
            metadata: {
              suspendedAt: now
            }
          }
        });
      }
    });
  }

  /**
   * Scan for active/renewed subscriptions expiring in <= 7 days and set status to RENEWAL_DUE
   */
  static async scanForRenewalDues(): Promise<{ processed: number; logs: string[] }> {
    const logs: string[] = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    logs.push(`[${now.toISOString()}] Starting scan for upcoming renewal dues...`);

    const subscriptions = await prisma.propertySubscription.findMany({
      where: {
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.RENEWED] },
        expiresAt: {
          lte: sevenDaysFromNow,
          gt: now
        }
      },
      include: {
        property: true
      }
    });

    logs.push(`Found ${subscriptions.length} subscription(s) expiring within 7 days.`);
    let processed = 0;

    for (const sub of subscriptions) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.propertySubscription.update({
            where: { id: sub.id },
            data: { status: SubscriptionStatus.RENEWAL_DUE }
          });

          const lastTx = await tx.paymentTransaction.findFirst({
            where: { subscriptionId: sub.id },
            orderBy: { createdAt: "desc" }
          });

          if (lastTx) {
            await tx.paymentAuditLog.create({
              data: {
                transactionId: lastTx.id,
                action: "RENEWAL_DUE_TRIGGERED",
                oldStatus: sub.status,
                newStatus: SubscriptionStatus.RENEWAL_DUE,
                performedBy: "system_automation",
                metadata: {
                  scannedAt: now,
                  expiresAt: sub.expiresAt
                }
              }
            });
          }
        });
        logs.push(`Successfully updated sub ID ${sub.id} (Property: "${sub.property.title}") to RENEWAL_DUE.`);
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logs.push(`[ERROR] Failed to transition sub ID ${sub.id} to RENEWAL_DUE: ${message}`);
      }
    }

    logs.push(`Scan for renewal dues completed. ${processed} records updated.`);
    return { processed, logs };
  }

  /**
   * Scan for expired subscriptions and transition them to IN_GRACE_PERIOD
   */
  static async scanAndProcessExpiries(): Promise<{ processed: number; logs: string[] }> {
    const logs: string[] = [];
    const now = new Date();

    logs.push(`[${now.toISOString()}] Starting scan for expired subscriptions...`);

    const subscriptions = await prisma.propertySubscription.findMany({
      where: {
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.RENEWED, SubscriptionStatus.RENEWAL_DUE] },
        expiresAt: {
          lt: now
        }
      },
      include: {
        property: true
      }
    });

    logs.push(`Found ${subscriptions.length} expired subscription(s) that need to transition to grace period.`);
    let processed = 0;

    for (const sub of subscriptions) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.propertySubscription.update({
            where: { id: sub.id },
            data: { status: SubscriptionStatus.IN_GRACE_PERIOD }
          });

          const lastTx = await tx.paymentTransaction.findFirst({
            where: { subscriptionId: sub.id },
            orderBy: { createdAt: "desc" }
          });

          if (lastTx) {
            await tx.paymentAuditLog.create({
              data: {
                transactionId: lastTx.id,
                action: "GRACE_PERIOD_ENTERED",
                oldStatus: sub.status,
                newStatus: SubscriptionStatus.IN_GRACE_PERIOD,
                performedBy: "system_automation",
                metadata: {
                  scannedAt: now,
                  expiresAt: sub.expiresAt
                }
              }
            });
          }
        });
        logs.push(`Successfully updated sub ID ${sub.id} (Property: "${sub.property.title}") to IN_GRACE_PERIOD.`);
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logs.push(`[ERROR] Failed to transition sub ID ${sub.id} to IN_GRACE_PERIOD: ${message}`);
      }
    }

    logs.push(`Scan for expired subscriptions completed. ${processed} records updated.`);
    return { processed, logs };
  }

  /**
   * Scan for subscriptions in grace period for > 7 days and suspend them and their listings
   */
  static async scanAndProcessGraceExpiries(): Promise<{ processed: number; logs: string[] }> {
    const logs: string[] = [];
    const now = new Date();
    // Grace period threshold is 7 days past expiresAt
    const graceLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    logs.push(`[${now.toISOString()}] Starting scan for grace-expired subscriptions...`);

    const subscriptions = await prisma.propertySubscription.findMany({
      where: {
        status: SubscriptionStatus.IN_GRACE_PERIOD,
        expiresAt: {
          lt: graceLimit
        }
      },
      include: {
        property: true
      }
    });

    logs.push(`Found ${subscriptions.length} grace-expired subscription(s) that need suspension.`);
    let processed = 0;

    for (const sub of subscriptions) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Suspend subscription
          await tx.propertySubscription.update({
            where: { id: sub.id },
            data: {
              status: SubscriptionStatus.SUSPENDED_OVERDUE,
              suspendedAt: now
            }
          });

          // 2. Set listing status to SUSPENDED
          await tx.property.update({
            where: { id: sub.propertyId },
            data: { status: "SUSPENDED" }
          });

          // 3. Create audit trace log
          const lastTx = await tx.paymentTransaction.findFirst({
            where: { subscriptionId: sub.id },
            orderBy: { createdAt: "desc" }
          });

          if (lastTx) {
            await tx.paymentAuditLog.create({
              data: {
                transactionId: lastTx.id,
                action: "SUBSCRIPTION_EXPIRED_SUSPENDED",
                oldStatus: sub.status,
                newStatus: SubscriptionStatus.SUSPENDED_OVERDUE,
                performedBy: "system_automation",
                metadata: {
                  suspendedAt: now,
                  expiresAt: sub.expiresAt
                }
              }
            });
          }
        });
        logs.push(`Successfully suspended sub ID ${sub.id} & Property: "${sub.property.title}" due to overdue grace period.`);
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logs.push(`[ERROR] Failed to suspend sub ID ${sub.id}: ${message}`);
      }
    }

    logs.push(`Scan for grace expiries completed. ${processed} records suspended.`);
    return { processed, logs };
  }

  /**
   * Dispatch renewal reminder notifications (Email / WhatsApp mocks) at 7, 3, 0 days, grace and suspension
   */
  static async dispatchRenewalReminders(): Promise<{ processed: number; logs: string[] }> {
    const logs: string[] = [];
    const now = new Date();

    logs.push(`[${now.toISOString()}] Starting dispatch of renewal reminders...`);

    // Let's define the scan ranges for our checks
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Fetch all active, renewed, renewal_due, grace or suspended overdue subscriptions
    const subscriptions = await prisma.propertySubscription.findMany({
      where: {
        status: {
          in: [
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.RENEWED,
            SubscriptionStatus.RENEWAL_DUE,
            SubscriptionStatus.IN_GRACE_PERIOD,
            SubscriptionStatus.SUSPENDED_OVERDUE
          ]
        }
      },
      include: {
        property: {
          include: {
            owner: true
          }
        }
      }
    });

    let processed = 0;

    for (const sub of subscriptions) {
      if (!sub.expiresAt || !sub.property.owner) continue;

      const owner = sub.property.owner;
      const daysRemaining = Math.ceil((sub.expiresAt.getTime() - now.getTime()) / oneDayMs);

      let reminderType: "7_DAY" | "3_DAY" | "0_DAY" | "GRACE" | "SUSPENSION" | null = null;

      // Determine which reminder applies
      if (sub.status === SubscriptionStatus.SUSPENDED_OVERDUE) {
        reminderType = "SUSPENSION";
      } else if (sub.status === SubscriptionStatus.IN_GRACE_PERIOD) {
        reminderType = "GRACE";
      } else if (daysRemaining <= 0) {
        reminderType = "0_DAY";
      } else if (daysRemaining <= 3) {
        reminderType = "3_DAY";
      } else if (daysRemaining <= 7) {
        reminderType = "7_DAY";
      }

      if (!reminderType) continue;

      try {
        const lastTx = await prisma.paymentTransaction.findFirst({
          where: { subscriptionId: sub.id },
          orderBy: { createdAt: "desc" }
        });

        if (!lastTx) {
          logs.push(`[WARN] No transaction found for sub ID ${sub.id}. Skipping reminder.`);
          continue;
        }

        // Check for duplicate reminders
        const sentReminders = await prisma.paymentAuditLog.findMany({
          where: {
            transactionId: lastTx.id,
            action: "RENEWAL_REMINDER_SENT"
          }
        });

        const alreadySent = sentReminders.some((log) => {
          const meta = log.metadata as Record<string, string> | null;
          return meta?.reminderType === reminderType && meta?.expiresAt === sub.expiresAt?.toISOString();
        });

        if (alreadySent) {
          // Already sent this specific reminder for the current expiry state
          continue;
        }

        // Draft custom message copies
        let subject = "";
        let body = "";
        let whatsappMsg = "";

        const ownerName = owner.name || "Partner";
        const propertyName = sub.property.title;
        const expiryStr = sub.expiresAt.toLocaleDateString();

        switch (reminderType) {
          case "7_DAY":
            subject = `Action Required: Renew Your Home4Stay Subscription for ${propertyName}`;
            body = `Hello ${ownerName},\n\nYour Home4Stay subscription for "${propertyName}" will expire in 7 days on ${expiryStr}.\nRenew now to prevent any disruption to your listing.\n\nBest,\nHome4Stay Team`;
            whatsappMsg = `Hello ${ownerName}, your Home4Stay subscription for "${propertyName}" expires in 7 days on ${expiryStr}. Please renew now to maintain seamless hosting!`;
            break;
          case "3_DAY":
            subject = `Urgent: Renew Your Home4Stay Subscription in 3 Days (${propertyName})`;
            body = `Hello ${ownerName},\n\nThis is an urgent reminder that your Home4Stay subscription for "${propertyName}" will expire in 3 days on ${expiryStr}.\nRenew today using manual UPI checkouts inside your dashboard.\n\nBest,\nHome4Stay Team`;
            whatsappMsg = `Urgent: ${ownerName}, your Home4Stay subscription for "${propertyName}" expires in 3 days! Renew now to avoid entering grace period.`;
            break;
          case "0_DAY":
            subject = `Your Home4Stay Subscription Expires Today! (${propertyName})`;
            body = `Hello ${ownerName},\n\nYour Home4Stay subscription for "${propertyName}" expires today! Access is now entering a grace period with restricted capabilities.\nRenew immediately to avoid listing suspension.\n\nBest,\nHome4Stay Team`;
            whatsappMsg = `Alert: ${ownerName}, your Home4Stay subscription for "${propertyName}" expires today! Your listing is entering a grace period with restricted features.`;
            break;
          case "GRACE":
            subject = `Warning: Your listing "${propertyName}" is in Grace Period`;
            body = `Hello ${ownerName},\n\nYour subscription for "${propertyName}" has expired. It is now in a 7-day grace period with restricted capabilities (max 3 images, no priority rank, AI content disabled).\nRenew immediately to restore full access and prevent complete suspension.\n\nBest,\nHome4Stay Team`;
            whatsappMsg = `Warning: ${ownerName}, your listing "${propertyName}" is in a Grace Period. Images are restricted and features are locked. Renew today to unlock!`;
            break;
          case "SUSPENSION":
            subject = `CRITICAL: Your Home4Stay listing "${propertyName}" has been SUSPENDED`;
            body = `Hello ${ownerName},\n\nYour grace period has ended. Your Home4Stay subscription for "${propertyName}" is suspended overdue, and your public listing is offline.\nSubmit a manual UPI payment in your billing dashboard to bring it back live immediately.\n\nBest,\nHome4Stay Team`;
            whatsappMsg = `CRITICAL: ${ownerName}, your listing "${propertyName}" is offline due to subscription suspension. Pay via UPI now in your billing panel to reactivate!`;
            break;
        }

        // Mock SMTP Output
        logs.push(`[MOCK SMTP] Sending email to ${owner.email}...`);
        logs.push(`[EMAIL SUBJECT] ${subject}`);
        logs.push(`[EMAIL BODY] ${body.replace(/\n/g, " | ")}`);

        // Mock WhatsApp Output
        if (owner.phone) {
          logs.push(`[MOCK WHATSAPP] Sending WhatsApp to ${owner.phone}...`);
          logs.push(`[WHATSAPP MESSAGE] ${whatsappMsg}`);
        }

        // Create PaymentAuditLog to record that the reminder was sent and block duplicates
        await prisma.paymentAuditLog.create({
          data: {
            transactionId: lastTx.id,
            action: "RENEWAL_REMINDER_SENT",
            oldStatus: sub.status,
            newStatus: sub.status,
            performedBy: "system_automation",
            metadata: {
              reminderType,
              expiresAt: sub.expiresAt,
              sentAt: now
            } as import("@prisma/client").Prisma.InputJsonValue
          }
        });

        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logs.push(`[ERROR] Failed to dispatch reminder for sub ID ${sub.id}: ${message}`);
      }
    }

    logs.push(`Dispatch of renewal reminders completed. ${processed} reminder(s) sent.`);
    return { processed, logs };
  }
}


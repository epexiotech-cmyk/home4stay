import { prisma } from "@/lib/database/prisma";
import { Prisma, type EmailJob } from "@prisma/client";
import { transporter } from "@/lib/server/email";
import { logger } from "@/lib/observability/logger";
import path from "path";
import fs from "fs";

/**
 * Pushes an email into the database queue table to be processed asynchronously.
 */
export async function queueEmail(recipient: string, subject: string, htmlBody: string) {
  try {
    const job = await prisma.emailJob.create({
      data: {
        recipient,
        subject,
        htmlBody,
        status: "PENDING"
      }
    });

    logger({
      level: "info",
      event: "EMAIL_QUEUED",
      message: `Successfully queued email job to ${recipient} (Job ID: ${job.id})`,
      requestId: "queue-system"
    });

    return job;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger({
      level: "error",
      event: "EMAIL_QUEUE_FAILURE",
      message: `Failed to queue email to ${recipient}: ${msg}`,
      requestId: "queue-system"
    });
    throw err;
  }
}

// Single active worker lock in-memory to prevent multiple simultaneous loops in dev fast-refresh
const globalWorker = global as unknown as { __worker_active?: boolean };

/**
 * Boots the background email queue worker polling loop.
 */
export function bootEmailQueueWorker() {
  if (globalWorker.__worker_active) {
    console.log("⚡ [EmailQueueWorker] Poller loop is already active.");
    return;
  }

  console.log("⚙️ [EmailQueueWorker] Initializing background polling worker...");
  globalWorker.__worker_active = true;

  // Poll loop every 10 seconds
  setInterval(async () => {
    try {
      await processEmailQueueTick();
    } catch (err) {
      console.error("[EmailQueueWorker] Unhandled loop tick exception:", err);
    }
  }, 10000);
}

/**
 * Processes a single batch tick of up to 5 pending email jobs in a transaction-safe manner.
 */
async function processEmailQueueTick() {
  // 0. Cheap pre-check — skip transaction entirely if nothing to process
  const pendingCount = await prisma.emailJob.count({ where: { status: "PENDING" } });
  if (pendingCount === 0) return;

  // 1. Atomically query and mark jobs as PROCESSING inside a database transaction
  const batch = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const pending = await tx.emailJob.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 5
    });

    if (pending.length === 0) return [];

    const ids = pending.map((j: EmailJob) => j.id);
    await tx.emailJob.updateMany({
      where: { id: { in: ids } },
      data: { status: "PROCESSING" }
    });

    return pending;
  });

  if (batch.length === 0) return;

  logger({
    level: "info",
    event: "EMAIL_QUEUE_TICK",
    message: `Worker picked up ${batch.length} jobs to process.`,
    requestId: "queue-system"
  });

  // 2. Deliver each job in the batch
  for (const job of batch) {
    const startTime = Date.now();
    const attachments: Array<{ filename: string; path: string }> = [];

    // Parse the htmlBody to check if there is an embedded bookingId
    // Standard format: <!-- bookingId: [bookingId] -->
    const match = job.htmlBody.match(/<!-- bookingId:\s*([a-zA-Z0-9-]+)\s*-->/);
    if (match && match[1]) {
      const bookingId = match[1];
      const pdfPath = path.join(process.cwd(), "storage", "invoices", `${bookingId}.pdf`);

      if (fs.existsSync(pdfPath)) {
        // Attempt to retrieve booking invoice context to extract the real serial invoice number
        const invoice = await prisma.invoiceRecord.findFirst({
          where: { bookingId }
        });
        const filename = invoice ? `${invoice.invoiceNumber}.pdf` : `invoice-${bookingId.substring(0,8).toUpperCase()}.pdf`;
        attachments.push({
          filename,
          path: pdfPath
        });
      }
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || "no-reply@home4stay.homes",
      to: job.recipient,
      subject: job.subject,
      html: job.htmlBody,
      attachments
    };

    try {
      // Deliver via central SMTP transporter
      await transporter.sendMail(mailOptions);
      const durationMs = Date.now() - startTime;

      // Update job to SENT status
      await prisma.emailJob.update({
        where: { id: job.id },
        data: {
          status: "SENT",
          attempts: job.attempts + 1,
          processedAt: new Date()
        }
      });

      logger({
        level: "info",
        event: "EMAIL_DELIVERY_SUCCESS",
        message: `Successfully delivered email to ${job.recipient} in ${durationMs}ms (Job ID: ${job.id})`,
        requestId: "queue-system",
        durationMs
      });

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      const nextAttempts = job.attempts + 1;
      const willRetry = nextAttempts < job.maxRetries;
      const finalStatus = willRetry ? "PENDING" : "FAILED"; // PENDING allows retry on next loop tick

      await prisma.emailJob.update({
        where: { id: job.id },
        data: {
          status: finalStatus,
          attempts: nextAttempts,
          error: errMsg,
          processedAt: new Date()
        }
      });

      logger({
        level: "error",
        event: "EMAIL_DELIVERY_FAILURE",
        message: `Failed to deliver email to ${job.recipient} (Attempt: ${nextAttempts}/${job.maxRetries}). Status set to ${finalStatus}. Error: ${errMsg}`,
        requestId: "queue-system"
      });
    }
  }
}

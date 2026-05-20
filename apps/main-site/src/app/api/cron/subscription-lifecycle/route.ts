import { NextRequest, NextResponse } from "next/server";
import { SubscriptionLifecycleService } from "@/modules/payments/services/subscriptionLifecycle";
import { prisma } from "@/lib/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // 1. Secret Key authorization boundary check
    const authHeader = request.headers.get("Authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");
    
    const configuredSecret = process.env.CRON_SECRET || "local_cron_secret";
    
    let isAuthorized = false;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      isAuthorized = authHeader.substring(7) === configuredSecret;
    } else if (querySecret) {
      isAuthorized = querySecret === configuredSecret;
    } else if (process.env.NODE_ENV === "development") {
      // In local dev, allow execution if no secret is set to simplify manual verification
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing cron secret" }, { status: 401 });
    }

    const executionSummary: any[] = [];
    const executionTrace: string[] = ["Starting centralized subscription lifecycle automation run..."];

    // A. Run scanForRenewalDues
    try {
      const start = Date.now();
      const result = await SubscriptionLifecycleService.scanForRenewalDues();
      const duration = Date.now() - start;
      
      await prisma.automationJobLog.create({
        data: {
          jobType: "EXPIRY_SCAN",
          status: "SUCCESS",
          recordsProcessed: result.processed,
          logs: result.logs
        }
      });
      
      executionSummary.push({ job: "EXPIRY_SCAN", status: "SUCCESS", processed: result.processed, durationMs: duration });
      executionTrace.push(...result.logs);
    } catch (err: any) {
      await prisma.automationJobLog.create({
        data: {
          jobType: "EXPIRY_SCAN",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: err.message,
          logs: [err.message, err.stack]
        }
      });
      executionSummary.push({ job: "EXPIRY_SCAN", status: "FAILED", error: err.message });
      executionTrace.push(`[CRITICAL ERROR] EXPIRY_SCAN failed: ${err.message}`);
    }

    // B. Run scanAndProcessExpiries
    try {
      const start = Date.now();
      const result = await SubscriptionLifecycleService.scanAndProcessExpiries();
      const duration = Date.now() - start;
      
      await prisma.automationJobLog.create({
        data: {
          jobType: "GRACE_SCAN",
          status: "SUCCESS",
          recordsProcessed: result.processed,
          logs: result.logs
        }
      });
      
      executionSummary.push({ job: "GRACE_SCAN", status: "SUCCESS", processed: result.processed, durationMs: duration });
      executionTrace.push(...result.logs);
    } catch (err: any) {
      await prisma.automationJobLog.create({
        data: {
          jobType: "GRACE_SCAN",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: err.message,
          logs: [err.message, err.stack]
        }
      });
      executionSummary.push({ job: "GRACE_SCAN", status: "FAILED", error: err.message });
      executionTrace.push(`[CRITICAL ERROR] GRACE_SCAN failed: ${err.message}`);
    }

    // C. Run scanAndProcessGraceExpiries
    try {
      const start = Date.now();
      const result = await SubscriptionLifecycleService.scanAndProcessGraceExpiries();
      const duration = Date.now() - start;
      
      await prisma.automationJobLog.create({
        data: {
          jobType: "SUSPENSION_PROCESSING",
          status: "SUCCESS",
          recordsProcessed: result.processed,
          logs: result.logs
        }
      });
      
      executionSummary.push({ job: "SUSPENSION_PROCESSING", status: "SUCCESS", processed: result.processed, durationMs: duration });
      executionTrace.push(...result.logs);
    } catch (err: any) {
      await prisma.automationJobLog.create({
        data: {
          jobType: "SUSPENSION_PROCESSING",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: err.message,
          logs: [err.message, err.stack]
        }
      });
      executionSummary.push({ job: "SUSPENSION_PROCESSING", status: "FAILED", error: err.message });
      executionTrace.push(`[CRITICAL ERROR] SUSPENSION_PROCESSING failed: ${err.message}`);
    }

    // D. Run dispatchRenewalReminders
    try {
      const start = Date.now();
      const result = await SubscriptionLifecycleService.dispatchRenewalReminders();
      const duration = Date.now() - start;
      
      await prisma.automationJobLog.create({
        data: {
          jobType: "REMINDER_SCAN",
          status: "SUCCESS",
          recordsProcessed: result.processed,
          logs: result.logs
        }
      });
      
      executionSummary.push({ job: "REMINDER_SCAN", status: "SUCCESS", processed: result.processed, durationMs: duration });
      executionTrace.push(...result.logs);
    } catch (err: any) {
      await prisma.automationJobLog.create({
        data: {
          jobType: "REMINDER_SCAN",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: err.message,
          logs: [err.message, err.stack]
        }
      });
      executionSummary.push({ job: "REMINDER_SCAN", status: "FAILED", error: err.message });
      executionTrace.push(`[CRITICAL ERROR] REMINDER_SCAN failed: ${err.message}`);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: executionSummary,
      trace: executionTrace
    });

  } catch (error: any) {
    console.error("[CRON_ROUTE_ERROR] Lifecycle execution failed:", error);
    return NextResponse.json({
      success: false,
      error: "Global execution failure",
      message: error.message
    }, { status: 500 });
  }
}

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

    interface JobSummary {
      job: string;
      status: "SUCCESS" | "FAILED";
      processed?: number;
      durationMs?: number;
      error?: string;
    }

    const executionSummary: JobSummary[] = [];
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
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      const errStack = err instanceof Error ? err.stack || "" : "";
      await prisma.automationJobLog.create({
        data: {
          jobType: "EXPIRY_SCAN",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: errMsg,
          logs: [errMsg, errStack]
        }
      });
      executionSummary.push({ job: "EXPIRY_SCAN", status: "FAILED", error: errMsg });
      executionTrace.push(`[CRITICAL ERROR] EXPIRY_SCAN failed: ${errMsg}`);
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
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      const errStack = err instanceof Error ? err.stack || "" : "";
      await prisma.automationJobLog.create({
        data: {
          jobType: "GRACE_SCAN",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: errMsg,
          logs: [errMsg, errStack]
        }
      });
      executionSummary.push({ job: "GRACE_SCAN", status: "FAILED", error: errMsg });
      executionTrace.push(`[CRITICAL ERROR] GRACE_SCAN failed: ${errMsg}`);
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
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      const errStack = err instanceof Error ? err.stack || "" : "";
      await prisma.automationJobLog.create({
        data: {
          jobType: "SUSPENSION_PROCESSING",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: errMsg,
          logs: [errMsg, errStack]
        }
      });
      executionSummary.push({ job: "SUSPENSION_PROCESSING", status: "FAILED", error: errMsg });
      executionTrace.push(`[CRITICAL ERROR] SUSPENSION_PROCESSING failed: ${errMsg}`);
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
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      const errStack = err instanceof Error ? err.stack || "" : "";
      await prisma.automationJobLog.create({
        data: {
          jobType: "REMINDER_SCAN",
          status: "FAILED",
          recordsProcessed: 0,
          errorMessage: errMsg,
          logs: [errMsg, errStack]
        }
      });
      executionSummary.push({ job: "REMINDER_SCAN", status: "FAILED", error: errMsg });
      executionTrace.push(`[CRITICAL ERROR] REMINDER_SCAN failed: ${errMsg}`);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: executionSummary,
      trace: executionTrace
    });

  } catch (error) {
    console.error("[CRON_ROUTE_ERROR] Lifecycle execution failed:", error);
    const message = error instanceof Error ? error.message : "Global execution failure";
    return NextResponse.json({
      success: false,
      error: "Global execution failure",
      message
    }, { status: 500 });
  }
}

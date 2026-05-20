import { NextRequest, NextResponse } from "next/server";
import { logger } from "../observability/logger";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public requestId?: string
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Standardized, production-safe error response builder.
 */
function createErrorResponse(error: unknown, requestId: string) {
  const isProd = process.env.NODE_ENV === "production";
  
  let statusCode = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected error occurred. Please contact support.";

  if (error instanceof AppError) {
    // AppErrors are fully trusted operational errors -> safe to expose
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof Error) {
    // System exceptions (Prisma, PostgreSQL, network exceptions)
    // Mask sensitive details and stack traces in production to prevent technical leaks
    if (!isProd) {
      message = error.message;
      code = error.name || "SYSTEM_EXCEPTION";
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        requestId,
      },
    },
    { status: statusCode }
  );
}

/**
 * Enterprise production-grade API Route Wrapper.
 * Captures execution duration, logs metrics, and masks internal exceptions safely.
 */
export const withErrorHandler = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) => async (req: NextRequest) => {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const start = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const route = new URL(req.url).pathname;

  try {
    const response = await handler(req);
    const durationMs = Date.now() - start;

    // Log success metrics
    await logger({
      level: "info",
      event: "API_LATENCY",
      requestId,
      ip,
      route,
      statusCode: response.status,
      durationMs,
    });

    return response;
  } catch (error: unknown) {
    const durationMs = Date.now() - start;
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const isOperational = error instanceof AppError;

    // Log system errors with detailed telemetry (including full stack traces in production logs)
    await logger({
      level: isOperational ? "warn" : "error",
      event: isOperational ? "API_OPERATIONAL_WARNING" : "API_SYSTEM_EXCEPTION",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      requestId,
      ip,
      route,
      statusCode,
      durationMs,
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    return createErrorResponse(error, requestId);
  }
};

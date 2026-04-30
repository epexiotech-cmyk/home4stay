import { NextRequest, NextResponse } from "next/server"
import { logger } from "../observability/logger"

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public requestId?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * Standardized error response format.
 */
function createErrorResponse(error: unknown, requestId: string) {
  const statusCode = error instanceof AppError ? error.statusCode : 500
  const code = error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR"
  const message = error instanceof Error ? error.message : "An unexpected error occurred"

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
  )
}

/**
 * API Route Wrapper for centralized error handling and logging.
 */
export const withErrorHandler = (
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) => async (req: NextRequest) => {
  const requestId = req.headers.get("x-request-id") || "unknown"
  const start = Date.now()
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
  const route = new URL(req.url).pathname

  try {
    const response = await handler(req)
    
    // Automatic success logging
    await logger({
      level: "info",
      event: "API_SUCCESS",
      requestId,
      ip,
      route,
      statusCode: response.status,
      durationMs: Date.now() - start
    })

    return response
  } catch (error: unknown) {
    const durationMs = Date.now() - start
    const statusCode = error instanceof AppError ? error.statusCode : 500

    // Automatic error logging
    await logger({
      level: "error",
      event: "API_FAILURE",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      requestId,
      ip,
      route,
      statusCode,
      durationMs,
      errorStack: error instanceof Error ? error.stack : undefined
    })

    return createErrorResponse(error, requestId)
  }
}

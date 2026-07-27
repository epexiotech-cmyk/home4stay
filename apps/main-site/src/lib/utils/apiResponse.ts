import { NextResponse } from "next/server";

export interface ApiResponsePayload<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

/**
 * Standardized API success response wrapper
 * Designed to be symmetric with the centralized error handler's { success: false, error: {...} } format.
 * 
 * @param data The payload to return
 * @param options Optional configuration for message, metadata, and status code
 */
export function successResponse<T>(
  data: T,
  options?: {
    message?: string;
    meta?: Record<string, unknown>;
    status?: number;
  }
) {
  const payload: ApiResponsePayload<T> = {
    success: true,
    data,
  };
  
  if (options?.message) {
    payload.message = options.message;
  }
  
  if (options?.meta) {
    payload.meta = options.meta;
  }
  
  return NextResponse.json(payload, { status: options?.status || 200 });
}

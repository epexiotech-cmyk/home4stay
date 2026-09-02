import { prisma } from "../database/prisma";
import crypto from "crypto";

export type ErrorSeverity = "WARNING" | "ERROR" | "CRITICAL";

export interface CaptureErrorParams {
  message: string;
  module?: string;
  severity?: ErrorSeverity;
  route?: string;
  stackTrace?: string;
  userId?: string;
}

export async function captureErrorToDB({
  message,
  module = "System",
  severity = "ERROR",
  route,
  stackTrace,
  userId,
}: CaptureErrorParams) {
  try {
    const cleanStack = stackTrace ? stackTrace.replace(/(password|secret|key|token)[=:]\s*[^\s]+/gi, "$1=***") : undefined;
    await prisma.systemError.create({
      data: {
        errorId: crypto.randomUUID(),
        module,
        message,
        severity,
        route,
        stackTrace: cleanStack,
        userId,
        status: "OPEN",
      }
    });
  } catch (err) {
    console.error("CRITICAL: Failed to capture error to database:", err);
  }
}

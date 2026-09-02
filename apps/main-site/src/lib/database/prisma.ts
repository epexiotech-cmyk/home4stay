import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../observability/logger";
// Trigger strict fail-fast production startup validation immediately in non-script mode
if (process.env.IS_SCRIPT !== "true") {
  import("../startup/checkServices").then(({ checkServices }) => {
    checkServices().catch(err => console.error("Startup validation check failed:", err));
  });
}

const globalNode = global as typeof globalThis & {
  prisma?: PrismaClient;
};

// 1. Configure Prisma to emit database query events and error events
export const prisma = globalNode.prisma || new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' }
  ]
});

// 2. Bind query listener to pipe queries and latency profiles directly into structured logger
try {
  (prisma as unknown as { $on: (event: string, cb: (e: Prisma.QueryEvent) => void) => void }).$on('query', (e) => {
    // Only capture queries in log levels to avoid extreme spam, sampling slow queries
    const isSlow = e.duration > 100; // >100ms is slow
    const shouldLog = isSlow || process.env.NODE_ENV !== 'production' || Math.random() < 0.02; // sample 2% of fast DB queries in production
    
    if (shouldLog) {
      logger({
        level: isSlow ? 'warn' : 'info',
        event: 'DATABASE_QUERY',
        message: `${e.query} | Params: ${e.params}`,
        requestId: 'system',
        durationMs: Math.round(e.duration)
      });
    }
  });
} catch (err) {
  console.warn("⚠️ Failed to bind query telemetry to Prisma:", err);
}

if (process.env.NODE_ENV !== "production") {
  globalNode.prisma = prisma;
}

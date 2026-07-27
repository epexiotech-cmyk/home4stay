import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

export const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
  },
  transport: !isProd ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname,env',
      translateTime: 'SYS:standard',
    },
  } : undefined,
});

type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  event: string;
  message?: string;
  requestId: string;
  correlationId?: string;
  ip?: string;
  userId?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  errorStack?: string;
  metadata?: Record<string, unknown>;
}

/**
 * production-grade Centralized Observability & Structured JSON Logger
 */
export async function logger(entry: LogEntry) {
  const { level, message, event, ...context } = entry;

  const logPayload = {
    event,
    ...context,
    msg: message,
  };

  switch (level) {
    case 'info':
      pinoLogger.info(logPayload);
      break;
    case 'warn':
      pinoLogger.warn(logPayload);
      break;
    case 'error':
      pinoLogger.error(logPayload);
      break;
    case 'fatal':
      pinoLogger.fatal(logPayload);
      break;
  }

  // 3. LOG RETENTION & COST MONITORING
  const shouldSendExternal = 
    level === 'error' || 
    level === 'fatal' || 
    level === 'warn' ||
    (level === 'info' && Math.random() < 0.05); // 5% log sampling for verbose HTTP 200 checks

  if (isProd && shouldSendExternal) {
    try {
      await sendToExternalMonitoring(entry);
    } catch (err) {
      pinoLogger.warn({ msg: "Telemetry pipeline failed dispatch", err });
    }
  }
}

async function sendToExternalMonitoring(log: LogEntry) {
  // Flag anomalies (SLAs, severe system defects)
  if (log.durationMs && log.durationMs > 1500) {
    pinoLogger.warn(`[ALERT] API SLA BREACH DETECTED: Route ${log.route} took ${log.durationMs}ms`);
  }
  if (log.level === 'fatal') {
    pinoLogger.error(`[FATAL ESCALATION] Critical system error: ${log.message}`);
  }
  
  // Future Sentry / Datadog / OpenTelemetry logic goes here
  return Promise.resolve();
}

/**
 * Context helper for extracting and propagating requestId
 */
export function withRequestContext(req: { headers: { get: (name: string) => string | null } }) {
  return {
    requestId: req.headers.get("x-request-id") || "unknown",
    correlationId: req.headers.get("x-correlation-id") || "unknown",
  };
}

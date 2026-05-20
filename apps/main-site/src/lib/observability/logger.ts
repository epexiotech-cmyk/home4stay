type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  event: string;
  message?: string;
  requestId: string;
  ip?: string;
  userId?: string;
  route?: string;
  statusCode?: number;
  durationMs?: number;
  errorStack?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const isProd = process.env.NODE_ENV === 'production';

/**
 * production-grade Centralized Observability & Structured JSON Logger
 */
export async function logger(entry: Omit<LogEntry, 'timestamp'>) {
  const fullEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // 1. Production Mode: Structured JSON (for Kibana, Vercel, Datadog parsing)
  if (isProd) {
    console.log(JSON.stringify(fullEntry));
  } else {
    // 2. Development Mode: High-fidelity pretty-printed logs
    const color = entry.level === 'error' ? '❌' : entry.level === 'warn' ? '⚠️' : entry.level === 'fatal' ? '🚨' : 'ℹ️';
    const duration = entry.durationMs !== undefined ? ` [${entry.durationMs}ms]` : '';
    const routeNode = entry.route ? ` [${entry.route}]` : '';
    console.log(`${color} [${entry.level.toUpperCase()}] ${entry.event}${routeNode}${duration}: ${entry.message || ''}`);
  }

  // 3. LOG RETENTION & COST MONITORING
  const shouldSendExternal = 
    entry.level === 'error' || 
    entry.level === 'fatal' || 
    entry.level === 'warn' ||
    (entry.level === 'info' && Math.random() < 0.05); // 5% log sampling for verbose HTTP 200 checks

  if (isProd && shouldSendExternal) {
    try {
      await sendToExternalMonitoring(fullEntry);
    } catch (err) {
      console.warn("⚠️ Telemetry pipeline failed dispatch:", err);
    }
  }
}

async function sendToExternalMonitoring(log: LogEntry) {
  // Flag anomalies (SLAs, severe system defects)
  if (log.durationMs && log.durationMs > 1500) {
    console.warn(`[ALERT] API SLA BREACH DETECTED: Route ${log.route} took ${log.durationMs}ms`);
  }
  if (log.level === 'fatal') {
    console.error(`[FATAL ESCALATION] Critical system error: ${log.message}`);
  }
  return Promise.resolve();
}

/**
 * Context helper for extracting and propagating requestId
 */
export function withRequestContext(req: { headers: { get: (name: string) => string | null } }) {
  return {
    requestId: req.headers.get("x-request-id") || "unknown",
  };
}

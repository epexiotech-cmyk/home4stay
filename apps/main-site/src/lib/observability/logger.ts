type LogLevel = 'info' | 'warn' | 'error' | 'fatal'

interface LogEntry {
  level: LogLevel
  event: string
  message?: string
  requestId: string
  ip?: string
  userId?: string
  route?: string
  statusCode?: number
  durationMs?: number
  errorStack?: string
  timestamp: string
}

const isProd = process.env.NODE_ENV === 'production'

/**
 * Enterprise-grade logger with cost control and tracing.
 */
export async function logger(entry: Omit<LogEntry, 'timestamp'>) {
  const fullEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }

  // 1. ALWAYS log to console (Vercel/Cloud logs)
  if (isProd) {
    console.log(JSON.stringify(fullEntry))
  } else {
    const color = entry.level === 'error' ? '❌' : entry.level === 'warn' ? '⚠️' : 'ℹ️'
    console.log(`${color} [${entry.level.toUpperCase()}] ${entry.event}: ${entry.message || ''}`)
  }

  // 2. LOG RETENTION & COST CONTROL (External Service)
  // Only send warnings and errors to expensive external monitoring
  // Sample high-frequency info logs if needed
  const shouldSendExternal = 
    entry.level === 'error' || 
    entry.level === 'fatal' || 
    entry.level === 'warn' ||
    (entry.level === 'info' && Math.random() < 0.1) // 10% sampling for info logs

  if (isProd && shouldSendExternal) {
    await sendToExternalMonitoring(fullEntry)
  }
}

async function sendToExternalMonitoring(log: LogEntry) {
  // Alert Triggers
  if (log.durationMs && log.durationMs > 1000) {
    // Alert: API SLOW
  }
  
  // Dispatch to external service logic
  return Promise.resolve()
}

/**
 * Context helper for propagating requestId
 */
export function withRequestContext(req: { headers: { get: (name: string) => string | null } }) {
  return {
    requestId: req.headers.get("x-request-id") || "unknown",
  }
}

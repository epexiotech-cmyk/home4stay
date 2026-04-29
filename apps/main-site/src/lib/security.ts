import { promises as fs } from 'fs'
import fsSync from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { crypto } from 'next/dist/compiled/@edge-runtime/primitives'

const isProd = process.env.NODE_ENV === 'production'
const LOG_DIR = path.join(process.cwd(), 'logs')
const MAX_LOG_SIZE_MB = 10 // Rotate if file > 10MB

// 1. SIMPLE MEMORY-BASED RATE LIMITER
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

export function rateLimit(ip: string, limit = 5, windowMs = 60000) {
  if (!isProd) return true
  const now = Date.now()
  const key = `ratelimit:${ip}`
  const record = rateLimitMap.get(key) || { count: 0, lastReset: now }
  if (now - record.lastReset > windowMs) {
    record.count = 1
    record.lastReset = now
  } else {
    record.count++
  }
  rateLimitMap.set(key, record)
  return record.count <= limit
}

// 2. AUDIT LOGGING (Async Queue, Rotated, Structured)
type LogLevel = 'info' | 'warn' | 'error'
let logQueue: Promise<void> = Promise.resolve()

async function getLogFilePath() {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  let logFile = path.join(LOG_DIR, `audit-${dateStr}.log`)
  
  try {
    if (fsSync.existsSync(logFile)) {
      const stats = fsSync.statSync(logFile)
      if (stats.size > MAX_LOG_SIZE_MB * 1024 * 1024) {
        // Find next index for today
        let index = 1
        while (fsSync.existsSync(path.join(LOG_DIR, `audit-${dateStr}-${index}.log`))) {
          const s = fsSync.statSync(path.join(LOG_DIR, `audit-${dateStr}-${index}.log`))
          if (s.size < MAX_LOG_SIZE_MB * 1024 * 1024) break
          index++
        }
        logFile = path.join(LOG_DIR, `audit-${dateStr}-${index}.log`)
      }
    }
  } catch (_e) {
    // Fallback to default
  }
  return logFile
}

export function auditLog(
  userId: string, 
  role: string, 
  action: string, 
  metadata: Record<string, unknown> = {},
  level: LogLevel = 'info'
) {
  const now = new Date()
  const requestId = Math.random().toString(36).substring(2, 10) // Simple correlation ID

  const logEntry = {
    ts: now.toISOString(),
    rid: requestId,
    lvl: level,
    uid: userId,
    rol: role,
    act: action,
    meta: metadata,
  }
  
  // Dev visibility
  if (!isProd) {
    console.log(`📝 [${level.toUpperCase()}] AUDIT: ${role} ${userId} -> ${action} (RID: ${requestId})`)
  }

  // Sequential fire-and-forget write queue
  logQueue = logQueue.then(async () => {
    try {
      if (!fsSync.existsSync(LOG_DIR)) {
        await fs.mkdir(LOG_DIR, { recursive: true })
      }
      
      const logFile = await getLogFilePath()
      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', 'utf-8')
    } catch (err) {
      if (!isProd) console.warn('❌ Audit log failed:', err)
    }
  }).catch(() => {
    // Ensure queue never breaks
  })

  // Return the requestId in case the caller wants to track it
  return requestId
}

// 3. CSRF PROTECTION
export function validateCsrf(request: NextRequest) {
  const csrfToken = request.headers.get('x-csrf-token')
  const csrfCookie = request.cookies.get('csrf-token')?.value
  if (!isProd && !csrfToken) return true
  if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) return false
  return true
}

export function setCsrfToken(response: NextResponse) {
  const token = Math.random().toString(36).substring(2, 15)
  response.cookies.set('csrf-token', token, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  })
  return token
}

import 'server-only';
import { db } from "../server/db";

export type AuditEvent = 
  | "AUTH_LOGIN_SUCCESS"
  | "AUTH_LOGIN_FAILURE"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "PASSWORD_CHANGE_SUCCESS"
  | "ACCOUNT_LOCKED"
  | "SUSPICIOUS_ACTIVITY"
  | "RATE_LIMIT_EXCEEDED";

export type AuditSeverity = "low" | "medium" | "high";

interface AuditLogOptions {
  userId?: string;
  eventType: AuditEvent;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity?: AuditSeverity;
}

/**
 * Logs security-relevant events with geo-intelligence.
 */
export async function logAuditEvent(options: AuditLogOptions) {
  const { userId, eventType, ipAddress, userAgent, metadata, severity = "low" } = options;

  let locationData = null;
  if (ipAddress && ipAddress !== "127.0.0.1" && ipAddress !== "::1") {
    try {
      const geoRes = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (geoRes.ok) {
        const data = await geoRes.json();
        locationData = {
          country: data.country_name,
          city: data.city,
          region: data.region,
          isp: data.org
        };
      }
    } catch (err) {
      console.warn(`[AUDIT] Failed to fetch geo-data for IP ${ipAddress}`);
    }
  }

  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, event_type, ip_address, user_agent, metadata, severity, location_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, eventType, ipAddress, userAgent, JSON.stringify(metadata), severity, JSON.stringify(locationData)]
    );
  } catch (error) {
    console.error("[AUDIT ERROR] Failed to persist audit log:", error);
  }
}

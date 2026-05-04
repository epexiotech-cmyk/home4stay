import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";

/**
 * Scheduled Security Cleanup
 * Deletes expired reset tokens and archives old audit logs.
 */
export async function GET(request: NextRequest) {
  // Verify Cron Secret (Security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Clear Expired Tokens from users table
    const tokenResult = await db.query(`
      UPDATE users 
      SET reset_password_token = NULL, 
          reset_password_expires = NULL,
          reset_password_ip = NULL,
          reset_password_user_agent = NULL
      WHERE reset_password_expires < NOW()
    `);

    // 2. Clear Old Audit Logs (> 90 days)
    const logResult = await db.query(`
      DELETE FROM audit_logs 
      WHERE timestamp < NOW() - INTERVAL '90 days'
    `);

    console.log(`[CLEANUP] Expired tokens cleared: ${tokenResult.rowCount}`);
    console.log(`[CLEANUP] Old audit logs purged: ${logResult.rowCount}`);

    return NextResponse.json({
      success: true,
      clearedTokens: tokenResult.rowCount,
      purgedLogs: logResult.rowCount
    });

  } catch (err) {
    console.error("[CLEANUP ERROR]", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

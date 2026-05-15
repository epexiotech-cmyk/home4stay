import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { findUserByResetToken, updateUserPassword } from "@/lib/models/user";
import { logAuditEvent } from "@/lib/server/audit";
import { revokeAllSessionsForUser } from "@/lib/server/session-manager";
import { checkRateLimit } from "@/lib/security/rate-limiter";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await findUserByResetToken(hashedToken);

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      }
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // 1. Adaptive Defense: Block IPs with too many suspicious attempts
    const redis = (await import("@/lib/server/redis")).getRedis();
    const suspiciousKey = `suspicious-attempts:${ip}`;
    const suspiciousCount = await redis.get(suspiciousKey);

    if (suspiciousCount && parseInt(suspiciousCount) > 3) {
      await logAuditEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        ipAddress: ip,
        userAgent,
        metadata: { reason: "excessive_suspicious_attempts" },
        severity: "high"
      });
      return NextResponse.json({ error: "Access denied due to security policy. Please contact support." }, { status: 403 });
    }

    // 2. Replay Detection: Check if token was recently used
    const incomingHashed = crypto.createHash("sha256").update(token).digest("hex");
    const usedTokenKey = `used-reset-token:${incomingHashed}`;
    if (await redis.exists(usedTokenKey)) {
      await logAuditEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        ipAddress: ip,
        userAgent,
        metadata: { reason: "token_already_used" },
        severity: "medium"
      });
      return NextResponse.json({ error: "This link has already been used" }, { status: 400 });
    }

    // 3. Rate Limiting
    const isRateLimited = !(await checkRateLimit(`failed-reset-attempts:${ip}`, { maxRequests: 10, windowSeconds: 600 }));
    if (isRateLimited) {
      await logAuditEvent({
        eventType: "RATE_LIMIT_EXCEEDED",
        ipAddress: ip,
        userAgent,
        metadata: { flow: "reset-password" },
        severity: "medium"
      });
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    // 4. Token Validation
    const user = await findUserByResetToken(incomingHashed);

    if (!user) {
      await redis.incr(suspiciousKey);
      await redis.expire(suspiciousKey, 3600); // 1 hour block
      await logAuditEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        ipAddress: ip,
        userAgent,
        metadata: { token_hash: incomingHashed },
        severity: "medium"
      });
      return NextResponse.json(
        { error: "This link has expired or is invalid" },
        { status: 400 }
      );
    }

    // 5. Password Security: Check Reuse and verify hash
    const { comparePasswords, hashPassword } = await import("@/lib/server/password");
    const { isValid, needsUpgrade } = await comparePasswords(password, user.password!);

    if (isValid && !needsUpgrade) {
       return NextResponse.json(
        { error: "New password cannot be the same as your current password" },
        { status: 400 }
      );
    }

    // 6. Context Validation (Adaptive Check)
    if (user.reset_password_ip !== ip || user.reset_password_user_agent !== userAgent) {
      await redis.incr(suspiciousKey); // Track as suspicious
      await logAuditEvent({
        userId: user.id,
        eventType: "SUSPICIOUS_ACTIVITY",
        ipAddress: ip,
        userAgent,
        metadata: {
          original_ip: user.reset_password_ip,
          original_ua: user.reset_password_user_agent,
          current_ip: ip,
          current_ua: userAgent
        },
        severity: "medium"
      });
      console.warn(`[SECURITY] Context mismatch for password reset: User ${user.id}`);
    }

    // 7. Update Password & Clear Token
    const hashedPassword = await hashPassword(password);
    await updateUserPassword(user.id, hashedPassword);

    // 8. Global Session Invalidation: Revoke all active sessions
    await revokeAllSessionsForUser(user.id);

    // 9. Replay Protection: Mark token as used in Redis for 24h
    await redis.set(usedTokenKey, "1", "EX", 86400);

    // 10. Clear suspicious counter on success
    await redis.del(suspiciousKey);

    // 11. Audit Logging
    await logAuditEvent({
      userId: user.id,
      eventType: "PASSWORD_RESET_SUCCESS",
      ipAddress: ip,
      userAgent
    });
    console.log(`[SECURITY] Password reset successful for ${user.id} from ${ip}`);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

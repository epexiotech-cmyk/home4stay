import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { findUserByEmail, setResetToken } from "@/lib/models/user";
import { sendPasswordResetEmail } from "@/lib/server/email";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { logAuditEvent } from "@/lib/server/audit";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase();
    
    // 1. Rate Limiting (5 requests per 10 minutes per IP and email)
    const isRateLimited = !(await checkRateLimit(`forgot-password:${ip}`)) || 
                         !(await checkRateLimit(`forgot-password:${email}`));

    if (isRateLimited) {
      await logAuditEvent({
        eventType: "RATE_LIMIT_EXCEEDED",
        ipAddress: ip,
        userAgent,
        metadata: { email, flow: "forgot-password" },
        severity: "medium"
      });
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }

    // 2. Anomaly Detection: Multiple requests for same email from different IPs
    const redis = (await import("@/lib/server/redis")).getRedis();
    const ipSetKey = `forgot-password-ips:${email}`;
    await redis.sadd(ipSetKey, ip);
    await redis.expire(ipSetKey, 600); // 10 minutes
    const ipCount = await redis.scard(ipSetKey);

    if (ipCount > 3) {
      await logAuditEvent({
        eventType: "SUSPICIOUS_ACTIVITY",
        ipAddress: ip,
        userAgent,
        metadata: { 
          email, 
          reason: "multiple_ips_requesting_reset",
          ip_count: ipCount 
        },
        severity: "high"
      });
    }

    const user = await findUserByEmail(email);

    // If user exists, generate token and send email
    if (user) {
      // 2. Token Security: Use hashed tokens with context binding
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store hashedToken and Context (IP/UA) in database
      await setResetToken(email, hashedToken, expires);

      // Log Audit Event
      await logAuditEvent({
        userId: user.id,
        eventType: "PASSWORD_RESET_REQUEST",
        ipAddress: ip,
        userAgent
      });

      // Send rawToken in email link
      const emailResult = await sendPasswordResetEmail(email, rawToken);
      
      if (!emailResult.success) {
        console.error(`Failed to send reset email to ${email}:`, emailResult.message);
      }
    }

    // Always return success to prevent email harvesting
    return NextResponse.json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

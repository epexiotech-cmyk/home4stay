import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getRedis } from "@/lib/server/redis";
import { AuthService } from "@/lib/auth/auth.service";
import { sendPartnerVerificationEmail } from "@/lib/server/email";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { PASSWORD_REGEX } from "@/lib/server/password";
import { hashPassword } from "@/lib/server/password";
import { rateLimit } from "@/lib/security/rateLimiter";

const authService = new AuthService();
const redis = getRedis();

const partnerRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().min(10, "Phone number is too short"),
  password: z.string().regex(
    PASSWORD_REGEX,
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
  ),
  propertyName: z.string().min(3, "Property name must be at least 3 characters"),
  acceptedTermsVersion: z.string().min(1, "Must accept terms and conditions"),
  acceptedPrivacyVersion: z.string().min(1, "Must accept privacy policy"),
});

async function verifyHandler(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  
  // Rate Limit: 5 requests per 15 minutes per IP
  const rateLimitResult = await rateLimit({ key: `verify_api:${ip}`, limit: 5, windowSeconds: 900 });
  if (!rateLimitResult.success) {
    throw new Error("Too many verification requests. Please try again later.");
  }

  const body = await request.json();
  const validation = partnerRegisterSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const data = validation.data;
  const email = data.email.toLowerCase();

  // Check if user already exists in DB
  const existingUser = await authService.checkUserExists(email);
  if (existingUser) {
    throw new Error("A user account with this email address already exists");
  }

  // Generate secure token and hashes before acquiring the lock
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Atomically claim the pending email index using SET NX
  const emailKey = `pending_email:${email}`;
  const acquired = await redis.set(emailKey, tokenHash, "EX", 86400, "NX");
  if (!acquired) {
    throw new Error("A verification email has already been sent to this address. Please check your inbox or wait 24 hours to try again.");
  }

  const redisKey = `pending_partner_reg:${tokenHash}`;

  try {
    // Pre-hash password so plaintext is never stored in Redis
    const hashedPassword = await hashPassword(data.password);
    
    const payloadToStore = {
      ...data,
      email, // Use normalized email
      password: hashedPassword, // Replaced with hashed
    };

    // Store payload in Redis
    await redis.set(redisKey, JSON.stringify(payloadToStore), "EX", 86400);

    // Send Email
    const emailRes = await sendPartnerVerificationEmail(email, rawToken);
    
    if (!emailRes.success) {
      throw new Error("Email sending failed");
    }
  } catch (err) {
    // Cleanup BOTH keys if payload storage or email sending fails
    const pipeline = redis.pipeline();
    pipeline.del(redisKey);
    pipeline.del(emailKey);
    await pipeline.exec();
    
    throw new Error("Failed to send verification email. Please try again.");
  }

  return successResponse(null, { message: "Verification email sent", status: 200 });
}

export const POST = withErrorHandler(verifyHandler);
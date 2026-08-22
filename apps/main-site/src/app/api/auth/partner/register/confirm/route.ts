import { NextRequest } from "next/server";
import crypto from "crypto";
import { getRedis } from "@/lib/server/redis";
import { AuthService } from "@/lib/auth/auth.service";
import { prisma } from "@/lib/database/prisma";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { acquireIdempotencyLock, releaseIdempotencyLock } from "@/lib/security/idempotency";
import { rateLimit } from "@/lib/security/rateLimiter";

const authService = new AuthService();
const redis = getRedis();

async function confirmHandler(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // Rate Limit: 10 requests per 15 minutes per IP
  const rateLimitResult = await rateLimit({ key: `confirm_api:${ip}`, limit: 10, windowSeconds: 900 });
  if (!rateLimitResult.success) {
    throw new Error("Too many confirmation requests. Please try again later.");
  }

  const body = await request.json();
  const token = body.token;
  
  if (!token || typeof token !== "string") {
    throw new Error("Invalid verification token");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const redisKey = `pending_partner_reg:${tokenHash}`;

  // Acquire lock to ensure token is processed atomically
  const { acquired, lockValue } = await acquireIdempotencyLock("system", tokenHash, "/api/auth/register/confirm");
  
  if (!acquired || !lockValue) {
    throw new Error("Verification is already being processed. Please wait.");
  }

  try {
    // Get payload from Redis
    const payloadStr = await redis.get(redisKey);
    if (!payloadStr) {
      throw new Error("Verification link is invalid or has expired");
    }

    const payload = JSON.parse(payloadStr);

    // Check again if user exists just to be perfectly safe
    const existingUser = await authService.checkUserExists(payload.email);
    if (existingUser) {
      await redis.del(redisKey); // Cleanup
      await redis.del(`pending_email:${payload.email}`);
      throw new Error("A user account with this email address already exists");
    }

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create Partner securely with pre-hashed password
    // NOTE: If this fails, it throws, skipping the redis.del below, preserving the token.
    const newUser = await authService.registerPartnerVerified(
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        passwordHash: payload.password, // Pre-hashed by verify API
        propertyName: payload.propertyName,
        acceptedTermsVersion: payload.acceptedTermsVersion,
        acceptedPrivacyVersion: payload.acceptedPrivacyVersion,
      },
      ip,
      userAgent
    );

    // SUCCESS: Atomically delete token and email index
    const pipeline = redis.pipeline();
    pipeline.del(redisKey);
    pipeline.del(`pending_email:${payload.email}`);
    await pipeline.exec();

    // Create session
    const property = await prisma.property.findFirst({ where: { ownerId: newUser.id } });
    const tokenPayload = {
      user: { connect: { id: newUser.id } },
      role: newUser.role,
      propertyId: property?.id,
      propertySlug: property?.slug,
      subdomain: (property as any)?.subdomain,
      onboardingStatus: property?.onboardingStatus || "NOT_STARTED",
    };
    
    const { signToken } = require("@/lib/auth/jwt");
    const sessionTokenStr = crypto.randomBytes(32).toString("hex");
    
    const finalPayload = { ...tokenPayload, sessionToken: sessionTokenStr };
    
    const accessToken = await signToken({ ...finalPayload, type: "access" }, "15m");
    const refreshToken = await signToken({ ...finalPayload, type: "refresh" }, "7d");
    
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await prisma.session.create({
      data: {
        userId: newUser.id,
        sessionToken: sessionTokenStr,
        refreshTokenHash,
        ipAddress: ip,
        userAgent,
        expiresAt,
      }
    });

    const response = successResponse(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      { message: "Partner verified and registered successfully", status: 201 }
    );

    response.cookies.set("access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;

  } finally {
    // Always release the lock
    await releaseIdempotencyLock("system", tokenHash, lockValue);
  }
}

export const POST = withErrorHandler(confirmHandler);
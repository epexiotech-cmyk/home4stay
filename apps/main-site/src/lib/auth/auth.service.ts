import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { AuditRepository } from "../repositories/audit.repository";
import { signToken, verifyToken } from "./jwt";
import { comparePasswords, hashPassword } from "../server/password";
import { revokeJti } from "./blacklist";
import { updateUserPassword } from "../models/user";
import { prisma } from "../database/prisma";

export class AuthService {
  private userRepo = new UserRepository();
  private sessionRepo = new SessionRepository();
  private auditRepo = new AuditRepository();

  /**
   * Implement strict database-only authentication flow.
   */
  async login(
    email: string,
    password: string,
    loginType: 'customer' | 'partner' | 'admin',
    ip: string,
    userAgent: string,
    requestId: string = "system"
  ) {
    console.log(`[AuthService] Incoming database login request for email: ${email} | Type: ${loginType} | IP: ${ip}`);
    
    // STEP 1: Find user in PostgreSQL database
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      console.warn(`[AuthService] Authentication failed. User not found: ${email}`);
      await this.auditRepo.log({
        userId: null,
        action: "USER_LOGIN_FAILURE",
        ipAddress: ip,
        userAgent: userAgent,
        status: "FAILURE",
        metadata: { email, reason: "User not found", requestId }
      });
      throw new Error("Invalid credentials");
    }

    // STEP 2: Verify password using comparative Enterprise Hashing Strategy (Bcrypt/Argon2)
    const { isValid, needsUpgrade } = await comparePasswords(password, user.password || "");
    if (!isValid) {
      console.warn(`[AuthService] Authentication failed. Incorrect password for user: ${email}`);
      await this.auditRepo.log({
        userId: user.id,
        action: "USER_LOGIN_FAILURE",
        ipAddress: ip,
        userAgent: userAgent,
        status: "FAILURE",
        metadata: { email, reason: "Incorrect password", requestId }
      });
      throw new Error("Invalid credentials");
    }

    // Upgrade password hash automatically from Bcrypt to Argon2 if needed
    if (needsUpgrade) {
      try {
        const newHash = await hashPassword(password);
        await updateUserPassword(user.id, newHash);
        console.log(`[AuthService] Successfully upgraded password hash for user ${user.id} to Argon2`);
      } catch (err) {
        console.error(`[AuthService] Password hash upgrade failed for user ${user.id}:`, err);
      }
    }

    // ROLE VALIDATION
    const role = user.role;
    let isAuthorized = false;
    if (loginType === "customer") {
      isAuthorized = role === "customer";
    } else if (loginType === "partner") {
      isAuthorized = ["owner", "manager", "receptionist", "billing", "housekeeping"].includes(role);
    } else if (loginType === "admin") {
      isAuthorized = ["admin", "super_admin"].includes(role);
    }

    if (!isAuthorized) {
      console.warn(`[AuthService] Role validation failed. User ${email} with role ${role} cannot log in as ${loginType}`);
      await this.auditRepo.log({
        userId: user.id,
        action: "USER_LOGIN_FAILURE",
        ipAddress: ip,
        userAgent: userAgent,
        status: "FAILURE",
        metadata: { email, role, loginType, reason: "Unauthorized role for login type", requestId }
      });
      throw new Error("Unauthorized access");
    }

    // STEP 3: Load PropertyUserAccess entries
    let propertyId: string | undefined;
    let propertySlug: string | undefined;
    let subdomain: string | undefined;

    if (loginType === "partner") {
      try {
        const accesses = await this.userRepo.getPropertyAccesses(user.id);
        if (accesses.length > 0) {
          // Map to the first primary property
          propertyId = accesses[0].propertyId;
          propertySlug = accesses[0].property.slug;
          subdomain = (accesses[0].property as { subdomain?: string }).subdomain;
          console.log(`[AuthService] Loaded PropertyUserAccess for user: ${email} -> Property: ${propertySlug} (Role: ${accesses[0].role})`);
        } else {
          // Fallback: Query Property table directly for backward compatibility
          const property = await prisma.property.findFirst({
            where: { ownerId: user.id }
          });
          if (property) {
            propertyId = property.id;
            propertySlug = property.slug;
            subdomain = (property as { subdomain?: string }).subdomain;
            console.log(`[AuthService] PropertyUserAccess empty. Fallback loaded Property for ownerId: ${user.id} -> Property: ${propertySlug}`);
          }
        }
      } catch (err) {
        console.warn("[AuthService] Could not resolve property accesses:", err);
      }
    }

    // STEP 4: Generate unique session token and persist in the sessions table
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // STEP 5: Generate JWT tokens (Dual-Token System linking cryptographically to DB session)
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      propertyId,
      propertySlug,
      subdomain,
      sessionToken
    };

    const accessToken = await signToken({
      ...tokenPayload,
      type: "access"
    }, "15m");

    const refreshToken = await signToken({
      ...tokenPayload,
      type: "refresh"
    }, "7d");

    // Persist session record in PostgreSQL database
    try {
      const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      await this.sessionRepo.create({
        userId: user.id,
        sessionToken,
        refreshTokenHash,
        ipAddress: ip,
        userAgent: userAgent,
        expiresAt
      });
    } catch (err) {
      console.error("[AuthService] Failed to persist session record:", err);
      throw new Error("Session persistence failed");
    }

    // STEP 7: Create success audit log entry
    await this.auditRepo.log({
      userId: user.id,
      action: "USER_LOGIN_SUCCESS",
      ipAddress: ip,
      userAgent: userAgent,
      status: "SUCCESS",
      metadata: { email, loginType, isMock: false, requestId }
    });

    return {
      accessToken,
      refreshToken,
      sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        propertyId,
        propertySlug,
        subdomain
      }
    };
  }

  /**
   * Refactored strict database-only refresh flow.
   */
  async refresh(refreshTokenStr: string, ip: string, userAgent: string) {
    console.log(`[AuthService] Incoming database-first refresh token request...`);
    
    // 1. Verify token signature & type
    const payload = await verifyToken(refreshTokenStr);
    if (!payload || payload.type !== "refresh") {
      console.warn(`[AuthService] Refresh failed. Invalid refresh token signature.`);
      await this.auditRepo.log({
        action: "TOKEN_REFRESH",
        ipAddress: ip,
        userAgent: userAgent,
        status: "FAILURE",
        metadata: { reason: "Invalid signature or invalid token type" }
      });
      throw new Error("Invalid or expired refresh token");
    }

    const userId = payload.userId as string;
    const sessionToken = payload.sessionToken as string;

    if (!sessionToken) {
      console.warn(`[AuthService] Refresh failed. Missing sessionToken in JWT payload.`);
      throw new Error("Invalid token session link");
    }

    // 2. Validate session from sessions table in DB
    const refreshTokenHash = crypto.createHash("sha256").update(refreshTokenStr).digest("hex");
    const session = await this.sessionRepo.findByRefreshTokenHash(refreshTokenHash);

    if (!session || !session.isActive) {
      console.warn(`[AuthService] Refresh failed. Session revoked or inactive for token hash.`);
      await this.auditRepo.log({
        userId,
        action: "TOKEN_REFRESH",
        ipAddress: ip,
        userAgent: userAgent,
        status: "FAILURE",
        metadata: { reason: "Session revoked or inactive in database" }
      });
      throw new Error("Session revoked");
    }

    if (new Date(session.expiresAt) < new Date()) {
      console.warn(`[AuthService] Refresh failed. Session expired in database.`);
      await this.auditRepo.log({
        userId,
        action: "TOKEN_REFRESH",
        ipAddress: ip,
        userAgent: userAgent,
        status: "FAILURE",
        metadata: { reason: "Session expired" }
      });
      throw new Error("Session expired");
    }

    // 3. Load user from database
    const user = await this.userRepo.findById(userId);
    if (!user) {
      console.warn(`[AuthService] Refresh failed. User not found: ${userId}`);
      throw new Error("User not found");
    }

    // 4. Reload property accesses
    let propertyId: string | undefined;
    let propertySlug: string | undefined;
    let subdomain: string | undefined;

    if (["owner", "manager", "receptionist", "billing", "housekeeping"].includes(user.role)) {
      try {
        const accesses = await this.userRepo.getPropertyAccesses(user.id);
        if (accesses.length > 0) {
          propertyId = accesses[0].propertyId;
          propertySlug = accesses[0].property.slug;
          subdomain = (accesses[0].property as { subdomain?: string }).subdomain;
        } else {
          const property = await prisma.property.findFirst({
            where: { ownerId: user.id }
          });
          if (property) {
            propertyId = property.id;
            propertySlug = property.slug;
            subdomain = (property as { subdomain?: string }).subdomain;
          }
        }
      } catch (err) {
        console.warn("[AuthService] Could not resolve property accesses in refresh:", err);
      }
    }

    // 5. Generate new access token preserving the same cryptographic session link
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      propertyId,
      propertySlug,
      subdomain,
      sessionToken
    };

    const accessToken = await signToken({
      ...tokenPayload,
      type: "access"
    }, "15m");

    // 6. Log success audit
    await this.auditRepo.log({
      userId: user.id,
      action: "TOKEN_REFRESH",
      ipAddress: ip,
      userAgent: userAgent,
      status: "SUCCESS",
      metadata: { isMock: false }
    });

    return { accessToken };
  }

  /**
   * Refactored strict database-only logout flow.
   */
  async logout(
    accessTokenStr: string | undefined,
    refreshTokenStr: string | undefined,
    ip: string,
    userAgent: string
  ) {
    console.log(`[AuthService] Incoming database logout request...`);
    let userId: string | null = null;

    // 1. Deactivate Session in Database
    if (refreshTokenStr) {
      try {
        const payload = await verifyToken(refreshTokenStr);
        if (payload) {
          userId = payload.userId as string;
        }
        
        const refreshTokenHash = crypto.createHash("sha256").update(refreshTokenStr).digest("hex");
        const session = await this.sessionRepo.findByRefreshTokenHash(refreshTokenHash);
        if (session) {
          await this.sessionRepo.deactivate(session.sessionToken);
          console.log(`[AuthService] Deactivated database session: ${session.sessionToken}`);
        }
      } catch (err) {
        console.warn("[AuthService] Failed to deactivate session during logout:", err);
      }
    }

    // 2. Blacklist Access Token JTI
    if (accessTokenStr) {
      try {
        const payload = await verifyToken(accessTokenStr);
        if (payload && payload.jti) {
          if (!userId) userId = payload.userId as string;
          const expiry = payload.exp ? (payload.exp as number) - Math.floor(Date.now() / 1000) : 3600;
          await revokeJti(payload.jti as string, Math.max(expiry, 60));
          console.log(`[AuthService] Blacklisted Access Token JTI: ${payload.jti}`);
        }
      } catch (err) {
        console.warn("[AuthService] Failed to blacklist access token JTI during logout:", err);
      }
    }

    // 3. Log Audit
    if (userId) {
      await this.auditRepo.log({
        userId: userId,
        action: "USER_LOGOUT",
        ipAddress: ip,
        userAgent: userAgent,
        status: "SUCCESS",
        metadata: { isMock: false }
      });
    }

    return true;
  }
}

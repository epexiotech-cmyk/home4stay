import { prisma } from "@/lib/database/prisma";

export interface CreateSessionDto {
  userId: string;
  sessionToken: string;
  refreshTokenHash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export class SessionRepository {
  /**
   * Persist a new session in the sessions table.
   */
  async create(data: CreateSessionDto) {
    try {
      console.log(`[SessionRepository] Persisting session for user ${data.userId}...`);
      return await prisma.session.create({
        data: {
          userId: data.userId,
          sessionToken: data.sessionToken,
          refreshTokenHash: data.refreshTokenHash,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          expiresAt: data.expiresAt,
          isActive: true
        }
      });
    } catch (error) {
      console.error("[SessionRepository] Failed to create session in database:", error);
      throw error;
    }
  }

  /**
   * Find a session by its unique session token.
   */
  async findBySessionToken(sessionToken: string) {
    try {
      return await prisma.session.findUnique({
        where: { sessionToken }
      });
    } catch (error) {
      console.error("[SessionRepository] Failed to find session by token:", error);
      return null;
    }
  }

  /**
   * Find a session by its refresh token hash.
   */
  async findByRefreshTokenHash(refreshTokenHash: string) {
    try {
      return await prisma.session.findUnique({
        where: { refreshTokenHash }
      });
    } catch (error) {
      console.error("[SessionRepository] Failed to find session by refresh token hash:", error);
      return null;
    }
  }

  /**
   * Deactivate/Invalidate a specific session.
   */
  async deactivate(sessionToken: string) {
    try {
      console.log(`[SessionRepository] Deactivating session token: ${sessionToken}`);
      return await prisma.session.update({
        where: { sessionToken },
        data: { isActive: false }
      });
    } catch (error) {
      console.error("[SessionRepository] Failed to deactivate session:", error);
      return null;
    }
  }

  /**
   * Deactivate all active sessions for a specific user (e.g. on password reset / global logout).
   */
  async deactivateAllForUser(userId: string) {
    try {
      console.log(`[SessionRepository] Deactivating all sessions for user ID: ${userId}`);
      return await prisma.session.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false }
      });
    } catch (error) {
      console.error("[SessionRepository] Failed to deactivate all sessions for user:", error);
      return null;
    }
  }
}

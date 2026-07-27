import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";

export class SessionRepository {
  /**
   * Persist a new session in the sessions table.
   */
  async create(data: Prisma.SessionCreateInput) {
    try {
      console.log(`[SessionRepository] Persisting session for user...`);
      return await prisma.session.create({
        data
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
      throw error;
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
      throw error;
    }
  }

  /**
   * Fetch all active sessions (e.g. for Admin Dashboard).
   */
  async findActiveSessions() {
    try {
      return await prisma.session.findMany({
        where: {
          isActive: true,
          expiresAt: { gt: new Date() }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });
    } catch (error) {
      console.error("[SessionRepository] Failed to find active sessions:", error);
      throw error;
    }
  }
}

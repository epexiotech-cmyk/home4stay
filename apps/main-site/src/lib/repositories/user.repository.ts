import { prisma } from "../database/prisma";

export class UserRepository {
  /**
   * Find a user in the PostgreSQL database by email.
   */
  async findByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      return user;
    } catch (error) {
      console.error("[UserRepository] Failed database lookup for email:", email, error);
      return null;
    }
  }

  /**
   * Find a user in the PostgreSQL database by ID.
   */
  async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user;
    } catch (error) {
      console.error("[UserRepository] Failed database lookup for id:", id, error);
      return null;
    }
  }

  /**
   * Fetch all PropertyUserAccess entries for a given user.
   */
  async getPropertyAccesses(userId: string) {
    try {
      return await prisma.propertyUserAccess.findMany({
        where: { userId },
        include: { property: true }
      });
    } catch (error) {
      console.error("[UserRepository] Failed to load PropertyUserAccess for userId:", userId, error);
      return [];
    }
  }
}

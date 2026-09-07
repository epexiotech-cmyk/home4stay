import { prisma } from "../database/prisma";
import { Prisma } from "@prisma/client";

export class UserRepository {
  /**
   * Find a user in the database by email.
   */
  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
    } catch (error) {
      console.error("[UserRepository] Failed database lookup for email:", email, error);
      return null;
    }
  }

  /**
   * Find a user in the database by ID.
   */
  async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error("[UserRepository] Failed database lookup for id:", id, error);
      return null;
    }
  }

  /**
   * Create a new user in the database.
   * Expects password to already be hashed by the service layer.
   */
  async create(data: Prisma.UserCreateInput) {
    try {
      return await prisma.user.create({
        data
      });
    } catch (error) {
      console.error("[UserRepository] Failed to create user:", error);
      throw error; // Throw domain errors up to the service layer for handling (e.g. unique constraint)
    }
  }

  /**
   * Create a partner user with all necessary aggregate records via transaction.
   */
  async createPartner(
    userData: Prisma.UserCreateInput,
    propertyData: { title: string; slug: string },
    legalAcceptances: { documentId: string; ipAddress: string; userAgent: string; acceptedVersion: string }[],
    staffAccounts?: { role: string; email: string; passwordHash: string; name: string }[]
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({ data: userData });

        const newProperty = await tx.property.create({
          data: {
            title: propertyData.title,
            slug: propertyData.slug,
            ownerId: newUser.id,
            status: "pending"
          }
        });

        await tx.propertyUserAccess.create({
          data: { propertyId: newProperty.id, userId: newUser.id, role: "owner" }
        });

        if (staffAccounts) {
          for (const staff of staffAccounts) {
            const newStaff = await tx.user.create({
              data: {
                name: staff.name,
                email: staff.email.toLowerCase(),
                role: staff.role,
                password: staff.passwordHash,
                status: "ACTIVE"
              }
            });
            await tx.propertyUserAccess.create({
              data: { propertyId: newProperty.id, userId: newStaff.id, role: staff.role }
            });
          }
        }

        for (const legal of legalAcceptances) {
          await tx.legalAcceptanceLog.create({
            data: {
              userId: newUser.id,
              documentId: legal.documentId,
              ipAddress: legal.ipAddress,
              userAgent: legal.userAgent,
              acceptedVersion: legal.acceptedVersion
            }
          });
        }

        return newUser;
      });
    } catch (error) {
      console.error("[UserRepository] Failed to create partner via transaction:", error);
      throw error;
    }
  }

  /**
   * Update an existing user's data.
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await prisma.user.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error("[UserRepository] Failed to update user:", error);
      throw error;
    }
  }

  /**
   * Set a password reset token and expiration for a user.
   */
  async setResetToken(email: string, token: string, expires: Date) {
    try {
      return await prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: {
          reset_password_token: token,
          reset_password_expires: expires,
        }
      });
    } catch (error) {
      console.error("[UserRepository] Failed to set reset token:", error);
      throw error;
    }
  }

  /**
   * Find a user by a valid (unexpired) reset token.
   */
  async findByResetToken(token: string) {
    try {
      return await prisma.user.findFirst({
        where: { 
          reset_password_token: token,
          reset_password_expires: { gt: new Date() }
        }
      });
    } catch (error) {
      console.error("[UserRepository] Failed to find user by reset token:", error);
      return null;
    }
  }

  /**
   * Update a user's password and clear their reset token.
   * Expects newPasswordHash to already be hashed by the service layer.
   */
  async updatePassword(userId: string, newPasswordHash: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          password: newPasswordHash,
          reset_password_token: null,
          reset_password_expires: null
        }
      });
    } catch (error) {
      console.error("[UserRepository] Failed to update user password:", error);
      throw error;
    }
  }

  /**
   * Fetch all PropertyUserAccess entries for a given user.
   * Preserved from existing implementation.
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

  /**
   * Check if a user has explicitly granted access to a specific property.
   */
  async checkPropertyAccess(userId: string, propertyId: string) {
    try {
      return await prisma.propertyUserAccess.findFirst({
        where: { userId, propertyId }
      });
    } catch (error) {
      console.error("[UserRepository] Failed to check property access:", error);
      return null;
    }
  }

  /**
   * Check if a user has ownership role for a specific property via the junction table.
   */
  async checkPropertyOwnership(userId: string, propertyId: string) {
    try {
      return await prisma.propertyUserAccess.findFirst({
        where: { userId, propertyId, role: "owner" }
      });
    } catch (error) {
      console.error("[UserRepository] Failed to check property ownership:", error);
      return null;
    }
  }

  /**
   * Fetch the first property owned by the user directly (for backward compatibility).
   */
  async findFirstPropertyByOwnerId(ownerId: string) {
    try {
      return await prisma.property.findFirst({
        where: { ownerId }
      });
    } catch (error) {
      console.error("[UserRepository] Failed to find property by owner:", ownerId, error);
      return null;
    }
  }
}

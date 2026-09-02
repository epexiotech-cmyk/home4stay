import { prisma } from "../database/prisma";
import crypto from "crypto";

export class PartnerActivationService {
  /**
   * Generates a readable activation key like H4S-XXXX-XXXX-XXXX
   */
  private static generateActivationKey(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars
    let key = "H4S-";
    for (let i = 0; i < 3; i++) {
      let block = "";
      for (let j = 0; j < 4; j++) {
        block += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      key += block + (i < 2 ? "-" : "");
    }
    return key;
  }

  /**
   * Generates a secure random activation token.
   */
  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Get or create property activation.
   */
  static async getOrCreateActivation(propertyId: string) {
    let activation = await prisma.propertyActivation.findUnique({
      where: { propertyId }
    });

    if (!activation) {
      let uniqueKey = false;
      let activationKey = "";
      let activationToken = "";

      // Ensure key uniqueness (highly likely but handle gracefully)
      while (!uniqueKey) {
        activationKey = this.generateActivationKey();
        activationToken = this.generateSecureToken();
        const existing = await prisma.propertyActivation.findUnique({
          where: { activationKey }
        });
        if (!existing) {
          uniqueKey = true;
        }
      }

      // Guest routing path
      const activationUrl = `/activate/${activationToken}`;

      activation = await prisma.propertyActivation.create({
        data: {
          propertyId,
          activationKey,
          activationToken,
          activationUrl
        }
      });
    }

    return activation;
  }

  /**
   * Activate property
   */
  static async activateProperty(propertyId: string) {
    const activation = await prisma.propertyActivation.findUnique({
      where: { propertyId }
    });

    if (!activation) {
      throw new Error("Activation record not found");
    }

    // Mark as active if not already
    if (activation.status !== "ACTIVE") {
      return prisma.propertyActivation.update({
        where: { id: activation.id },
        data: {
          status: "ACTIVE",
          activatedAt: new Date()
        }
      });
    }

    return activation;
  }

  /**
   * Validate token
   */
  static async validateToken(token: string) {
    return prisma.propertyActivation.findUnique({
      where: { activationToken: token },
      include: {
        property: true
      }
    });
  }
}

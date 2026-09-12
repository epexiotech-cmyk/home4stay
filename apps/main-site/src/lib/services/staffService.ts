import { prisma } from "../database/prisma";
import { AppError } from "../errors/handler";
import bcrypt from "bcryptjs";

export class StaffService {
  /**
   * Fetches all staff members assigned to a specific property.
   */
  static async getStaffList(propertyId: string) {
    if (!propertyId) throw new AppError("Property ID is required", 400, "BAD_REQUEST");

    const accessList = await prisma.propertyUserAccess.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            sessions: {
              take: 1,
              orderBy: { updatedAt: 'desc' },
              select: { updatedAt: true, isActive: true }
            }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            sessions: {
              take: 1,
              orderBy: { updatedAt: 'desc' },
              select: { updatedAt: true, isActive: true }
            }
          }
        }
      }
    });

    const formattedStaff = [];
    
    if (property?.owner) {
       formattedStaff.push({
         accessId: `owner-${property.owner.id}`,
         userId: property.owner.id,
         name: property.owner.name || "Owner",
         email: property.owner.email,
         phone: property.owner.phone || "",
         role: "Owner",
         status: property.owner.status === "ACTIVE" ? "active" : "pending",
         lastLogin: property.owner.sessions?.[0]?.updatedAt ? property.owner.sessions[0].updatedAt.toISOString() : "Never",
         isOnline: property.owner.sessions?.[0]?.isActive || false,
         createdAt: property.owner.createdAt.toISOString(),
         isOwner: true
       });
    }

    for (const access of accessList) {
      if (access.user.id === property?.ownerId) continue;

      formattedStaff.push({
        accessId: access.id,
        userId: access.user.id,
        name: access.user.name || "Staff Member",
        email: access.user.email,
        phone: access.user.phone || "",
        role: access.role,
        status: access.user.status === "ACTIVE" ? "active" : "pending",
        lastLogin: access.user.sessions?.[0]?.updatedAt ? access.user.sessions[0].updatedAt.toISOString() : "Never",
        isOnline: access.user.sessions?.[0]?.isActive || false,
        createdAt: access.createdAt.toISOString(),
        isOwner: false
      });
    }

    return formattedStaff;
  }

  static async inviteStaff(propertyId: string, email: string, name: string, role: string, invitedByUserId: string) {
    if (!propertyId || !email || !role) {
      throw new AppError("Missing required fields", 400, "BAD_REQUEST");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPass = require("crypto").randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPass, salt);
      const resetToken = require("crypto").randomBytes(32).toString("hex");

      user = await prisma.user.create({
        data: {
          email,
          name,
          role: "partner",
          password: hashedPassword,
          status: "PENDING_VERIFICATION",
          reset_password_token: resetToken
        }
      });
      console.log(`[Email Delivery Limitation] In a real environment, send an invitation email to ${email} with reset token: ${resetToken}`);
    }

    const existingAccess = await prisma.propertyUserAccess.findUnique({
      where: {
        propertyId_userId: {
          propertyId,
          userId: user.id
        }
      }
    });

    if (existingAccess) {
      throw new AppError("User is already assigned to this property", 400, "BAD_REQUEST");
    }

    const newAccess = await prisma.propertyUserAccess.create({
      data: {
        propertyId,
        userId: user.id,
        role
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: invitedByUserId,
        action: "STAFF_INVITED",
        resourceType: "PropertyUserAccess",
        resourceId: newAccess.id,
        status: "SUCCESS",
        metadata: { propertyId, email, role }
      }
    });

    return newAccess;
  }

  static async updateStaffRole(accessId: string, propertyId: string, newRole: string, performedByUserId: string) {
    const access = await prisma.propertyUserAccess.findUnique({
      where: { id: accessId }
    });

    if (!access || access.propertyId !== propertyId) {
      throw new AppError("Staff access not found", 404, "NOT_FOUND");
    }

    const updated = await prisma.propertyUserAccess.update({
      where: { id: accessId },
      data: { role: newRole }
    });

    await prisma.auditLog.create({
      data: {
        userId: performedByUserId,
        action: "STAFF_ROLE_UPDATED",
        resourceType: "PropertyUserAccess",
        resourceId: accessId,
        status: "SUCCESS",
        metadata: { propertyId, oldRole: access.role, newRole }
      }
    });

    return updated;
  }

  static async removeStaffAccess(accessId: string, propertyId: string, performedByUserId: string) {
    const access = await prisma.propertyUserAccess.findUnique({
      where: { id: accessId }
    });

    if (!access || access.propertyId !== propertyId) {
      throw new AppError("Staff access not found", 404, "NOT_FOUND");
    }

    await prisma.propertyUserAccess.delete({
      where: { id: accessId }
    });

    await prisma.auditLog.create({
      data: {
        userId: performedByUserId,
        action: "STAFF_ACCESS_REVOKED",
        resourceType: "PropertyUserAccess",
        resourceId: accessId,
        status: "SUCCESS",
        metadata: { propertyId, removedUserId: access.userId }
      }
    });

    return true;
  }
}

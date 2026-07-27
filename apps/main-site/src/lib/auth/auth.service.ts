import crypto from "crypto";
import { UserRepository } from "../repositories/user.repository";
import { SessionRepository } from "../repositories/session.repository";
import { AuditRepository } from "../repositories/audit.repository";
import { signToken, verifyToken } from "./jwt";
import { comparePasswords, hashPassword } from "../server/password";
import { revokeJti } from "./blacklist";
import { LegalService } from "../legal/legalService";
import { sendPasswordResetEmail } from "../server/email";

export class AuthService {
  private userRepo = new UserRepository();
  private sessionRepo = new SessionRepository();
  private auditRepo = new AuditRepository();

  async login(
    email: string,
    password: string,
    loginType: 'customer' | 'partner' | 'admin',
    ip: string,
    userAgent: string,
    requestId: string = "system"
  ) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      await this.auditRepo.log({ userId: null, action: "USER_LOGIN_FAILURE", ipAddress: ip, userAgent, status: "FAILURE", metadata: { email, reason: "User not found", requestId } });
      throw new Error("Invalid credentials");
    }

    const { isValid, needsUpgrade } = await comparePasswords(password, user.password || "");
    if (!isValid) {
      await this.auditRepo.log({ userId: user.id, action: "USER_LOGIN_FAILURE", ipAddress: ip, userAgent, status: "FAILURE", metadata: { email, reason: "Incorrect password", requestId } });
      throw new Error("Invalid credentials");
    }

    if (needsUpgrade) {
      try {
        const newHash = await hashPassword(password);
        await this.userRepo.updatePassword(user.id, newHash);
      } catch (err) {
        console.error("Password hash upgrade failed:", err);
      }
    }

    const role = user.role;
    let isAuthorized = false;
    if (loginType === "customer") isAuthorized = role === "customer";
    else if (loginType === "partner") isAuthorized = ["owner", "manager", "receptionist", "billing", "housekeeping"].includes(role);
    else if (loginType === "admin") isAuthorized = ["admin", "super_admin"].includes(role);

    if (!isAuthorized) {
      throw new Error("Unauthorized access");
    }

    let propertyId: string | undefined;
    let propertySlug: string | undefined;
    let subdomain: string | undefined;

    if (loginType === "partner") {
      try {
        const accesses = await this.userRepo.getPropertyAccesses(user.id);
        if (accesses.length > 0) {
          propertyId = accesses[0].propertyId;
          propertySlug = accesses[0].property.slug;
          subdomain = (accesses[0].property as { subdomain?: string }).subdomain;
        } else {
          const property = await this.userRepo.findFirstPropertyByOwnerId(user.id);
          if (property) {
            propertyId = property.id;
            propertySlug = property.slug;
            subdomain = (property as { subdomain?: string }).subdomain;
          }
        }
      } catch (err) {}
    }

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const tokenPayload = { userId: user.id, role: user.role, propertyId, propertySlug, subdomain, sessionToken };
    const accessToken = await signToken({ ...tokenPayload, type: "access" }, "15m");
    const refreshToken = await signToken({ ...tokenPayload, type: "refresh" }, "7d");

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await this.sessionRepo.create({
      user: { connect: { id: user.id } },
      sessionToken,
      refreshTokenHash,
      ipAddress: ip,
      userAgent: userAgent,
      expiresAt
    });

    await this.auditRepo.log({ userId: user.id, action: "USER_LOGIN_SUCCESS", ipAddress: ip, userAgent, status: "SUCCESS", metadata: { email, loginType, isMock: false, requestId } });

    return { accessToken, refreshToken, sessionToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, propertyId, propertySlug, subdomain } };
  }

  async refresh(refreshTokenStr: string, ip: string, userAgent: string) {
    const payload = await verifyToken(refreshTokenStr);
    if (!payload || payload.type !== "refresh") throw new Error("Invalid or expired refresh token");

    const userId = payload.userId as string;
    const sessionToken = payload.sessionToken as string;
    if (!sessionToken) throw new Error("Invalid token session link");

    const refreshTokenHash = crypto.createHash("sha256").update(refreshTokenStr).digest("hex");
    const session = await this.sessionRepo.findByRefreshTokenHash(refreshTokenHash);

    if (!session || !session.isActive) throw new Error("Session revoked");
    if (new Date(session.expiresAt) < new Date()) throw new Error("Session expired");

    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    let propertyId: string | undefined;
    let propertySlug: string | undefined;
    let subdomain: string | undefined;

    if (["owner", "manager", "receptionist", "billing", "housekeeping"].includes(user.role)) {
      const accesses = await this.userRepo.getPropertyAccesses(user.id);
      if (accesses.length > 0) {
        propertyId = accesses[0].propertyId;
        propertySlug = accesses[0].property.slug;
        subdomain = (accesses[0].property as { subdomain?: string }).subdomain;
      } else {
        const property = await this.userRepo.findFirstPropertyByOwnerId(user.id);
        if (property) {
          propertyId = property.id;
          propertySlug = property.slug;
          subdomain = (property as { subdomain?: string }).subdomain;
        }
      }
    }

    const tokenPayload = { userId: user.id, role: user.role, propertyId, propertySlug, subdomain, sessionToken };
    const accessToken = await signToken({ ...tokenPayload, type: "access" }, "15m");

    return { accessToken };
  }

  async logout(accessTokenStr: string | undefined, refreshTokenStr: string | undefined, ip: string, userAgent: string) {
    let userId: string | null = null;
    if (refreshTokenStr) {
      try {
        const payload = await verifyToken(refreshTokenStr);
        if (payload) userId = payload.userId as string;
        const refreshTokenHash = crypto.createHash("sha256").update(refreshTokenStr).digest("hex");
        const session = await this.sessionRepo.findByRefreshTokenHash(refreshTokenHash);
        if (session) await this.sessionRepo.deactivate(session.sessionToken);
      } catch (err) {}
    }

    if (accessTokenStr) {
      try {
        const payload = await verifyToken(accessTokenStr);
        if (payload && payload.jti) {
          if (!userId) userId = payload.userId as string;
          const expiry = payload.exp ? (payload.exp as number) - Math.floor(Date.now() / 1000) : 3600;
          await revokeJti(payload.jti as string, Math.max(expiry, 60));
        }
      } catch (err) {}
    }

    if (userId) {
      await this.auditRepo.log({ userId, action: "USER_LOGOUT", ipAddress: ip, userAgent, status: "SUCCESS" });
    }
    return true;
  }

  async registerCustomer(data: { name: string; email: string; phone: string; password: string }, ip: string, userAgent: string) {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await hashPassword(data.password);
    const newUser = await this.userRepo.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      role: "customer",
    });

    await this.auditRepo.log({ userId: newUser.id, action: "USER_REGISTER_SUCCESS", ipAddress: ip, userAgent, status: "SUCCESS", metadata: { role: "customer", email: data.email } });
    return newUser;
  }

  async registerPartner(
    data: { name: string; email: string; phone: string; password: string; propertyName: string; acceptedTermsVersion: string; acceptedPrivacyVersion: string },
    ip: string,
    userAgent: string
  ) {
    const email = data.email.toLowerCase();
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) throw new Error("A user account with this email address already exists");

    const activeTerms = await LegalService.getActiveDocument("TERMS_AND_CONDITIONS");
    const activePrivacy = await LegalService.getActiveDocument("PRIVACY_POLICY");

    if (activeTerms && activeTerms.version !== data.acceptedTermsVersion) throw new Error(`Outdated Terms version accepted`);
    if (activePrivacy && activePrivacy.version !== data.acceptedPrivacyVersion) throw new Error(`Outdated Privacy version accepted`);

    const hashedPassword = await hashPassword(data.password);
    const slug = `${data.propertyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${crypto.randomBytes(2).toString("hex")}`;
    
    const legalAcceptances = [];
    if (activeTerms) legalAcceptances.push({ documentId: activeTerms.id, ipAddress: ip, userAgent, acceptedVersion: activeTerms.version });
    if (activePrivacy) legalAcceptances.push({ documentId: activePrivacy.id, ipAddress: ip, userAgent, acceptedVersion: activePrivacy.version });

    const registeredUser = await this.userRepo.createPartner(
      { name: data.name, email, password: hashedPassword, phone: data.phone, role: "partner" },
      { title: data.propertyName, slug },
      legalAcceptances
    );

    return registeredUser;
  }

  async forgotPassword(email: string, ip: string, userAgent: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return; 

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    await this.userRepo.setResetToken(email, hashedToken, expiresAt);
    await sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPasswordPlain: string, ip: string, userAgent: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await this.userRepo.findByResetToken(hashedToken);
    if (!user) throw new Error("Invalid or expired token");

    const newHash = await hashPassword(newPasswordPlain);
    await this.userRepo.updatePassword(user.id, newHash);
    await this.sessionRepo.deactivateAllForUser(user.id);
    return user;
  }

  async changePassword(userId: string, currentPasswordPlain: string, newPasswordPlain: string, ip: string, userAgent: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.password) throw new Error("User not found");

    const { isValid: isSameAsCurrent } = await comparePasswords(newPasswordPlain, user.password);
    if (isSameAsCurrent) throw new Error("New password cannot be the same as your current password");

    const { isValid } = await comparePasswords(currentPasswordPlain, user.password);
    if (!isValid) throw new Error("Incorrect current password");

    const newHash = await hashPassword(newPasswordPlain);
    await this.userRepo.updatePassword(user.id, newHash);
    await this.sessionRepo.deactivateAllForUser(user.id);
    return user;
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; city?: string; image_url?: string }) {
    const updatedUser = await this.userRepo.update(userId, data);
    if (!updatedUser) throw new Error("Failed to update profile");
    return updatedUser;
  }
}

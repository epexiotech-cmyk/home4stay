import fs from 'fs';

const filePath = 'src/lib/auth/auth.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = 'async refresh(refreshTokenStr: string, ip: string, userAgent: string) {';
const endMarker = '  async logout(accessTokenStr: string | undefined,';

// Normalize carriage returns for index searches
const normalizedContent = content.replace(/\r\n/g, '\n');
const startIndex = normalizedContent.indexOf(startMarker);
const endIndex = normalizedContent.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  console.log("Found start and end markers!");
  const before = normalizedContent.substring(0, startIndex);
  const after = normalizedContent.substring(endIndex);
  
  const newRefreshBody = `async refresh(refreshTokenStr: string, ip: string, userAgent: string) {
    console.log(\`[AuthService] Incoming refresh token request...\`);
    
    // 1. Verify token signature
    const payload = await verifyToken(refreshTokenStr);
    if (!payload || payload.type !== "refresh") {
      console.warn(\`[AuthService] Refresh failed. Invalid refresh token signature.\`);
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

    // 2. Load user from database or fallback to mock
    let user = await this.userRepo.findById(userId);
    let isMock = false;

    if (!user) {
      // Find inside static mock records
      const mockRecord = Object.values(MOCK_USERS).find(u => u.id === userId);
      if (mockRecord) {
        user = {
          id: mockRecord.id,
          email: mockRecord.email,
          role: mockRecord.role,
          password: mockRecord.password || "",
          name: mockRecord.name || null,
          phone: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          kycStatus: "NOT_VERIFIED",
          verifiedBadge: false,
          verificationLevel: 0,
          trustedGuestScore: 0,
          verificationCompletedAt: null,
          reset_password_token: null,
          reset_password_expires: null,
          guestProfileId: null
        };
        isMock = true;
      }
    }

    if (!user) {
      console.warn(\`[AuthService] Refresh failed. User not found: \${userId}\`);
      throw new Error("User not found");
    }

    // 3. Validate session from sessions table in DB
    if (!isMock) {
      const refreshTokenHash = crypto.createHash("sha256").update(refreshTokenStr).digest("hex");
      const session = await this.sessionRepo.findByRefreshTokenHash(refreshTokenHash);

      if (!session || !session.isActive) {
        console.warn(\`[AuthService] Refresh failed. Session revoked or inactive for token hash.\`);
        await this.auditRepo.log({
          userId,
          action: "TOKEN_REFRESH",
          ipAddress: ip,
          userAgent: userAgent,
          status: "FAILURE",
          metadata: { reason: "Session revoked or inactive" }
        });
        throw new Error("Session revoked");
      }

      if (new Date(session.expiresAt) < new Date()) {
        console.warn(\`[AuthService] Refresh failed. Session expired in database.\`);
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

    // 5. Generate new access token
    const tokenPayload = {
      userId: user.id,
      role: user.role,
      propertyId,
      propertySlug,
      subdomain
    };

    const accessToken = await signToken({
      ...tokenPayload,
      type: "access"
    }, "15m");

    // 6. Log success audit
    await this.auditRepo.log({
      userId: isMock ? null : user.id,
      action: "TOKEN_REFRESH",
      ipAddress: ip,
      userAgent: userAgent,
      status: "SUCCESS",
      metadata: { isMock }
    });

    return { accessToken };
  }

`;
  
  const finalContent = before + newRefreshBody + after;
  fs.writeFileSync(filePath, finalContent.replace(/\n/g, '\r\n'), 'utf8');
  console.log("Successfully replaced the refresh function!");
} else {
  console.error("Could not find start/end markers:", { startIndex, endIndex });
}

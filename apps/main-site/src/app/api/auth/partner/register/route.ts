import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/models/user";
import { PASSWORD_REGEX } from "@/lib/server/password";
import { prisma } from "@/lib/database/prisma";
import { AuthService } from "@/lib/auth/auth.service";
import { LegalService } from "@/lib/legal/legalService";
import { ReferralService } from "@/lib/referral/referralService";

// Registration validation schema
const partnerRegisterSchema = z.object({
  name: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().min(10, "Phone number is too short"),
  propertyName: z.string().min(1, "Property Name is required"),
  password: z.string().regex(
    PASSWORD_REGEX,
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
  ),
  acceptedTermsVersion: z.string().min(1, "Terms acceptance version is required"),
  acceptedPrivacyVersion: z.string().min(1, "Privacy acceptance version is required"),
  referralCode: z.string().optional(),
});

const authService = new AuthService();

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  try {
    const body = await request.json();

    // 1. Validate inputs
    const validation = partnerRegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, propertyName, password, acceptedTermsVersion, acceptedPrivacyVersion, referralCode } = validation.data;
    const email = validation.data.email.toLowerCase();

    // 2. Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "A user account with this email address already exists" },
        { status: 409 }
      );
    }

    // 3. Resolve active legal agreements and perform self-healing bootstrap if missing
    const activeTerms = await LegalService.getActiveDocument("TERMS_AND_CONDITIONS");
    const activePrivacy = await LegalService.getActiveDocument("PRIVACY_POLICY");

    let termsDocId = "";
    if (activeTerms) {
      if (activeTerms.version !== acceptedTermsVersion) {
        return NextResponse.json(
          { error: `Outdated Terms version accepted (${acceptedTermsVersion}). Current is ${activeTerms.version}.` },
          { status: 400 }
        );
      }
      termsDocId = activeTerms.id;
    } else {
      // Auto-provision placeholder active terms if database is empty
      const placeholderTerms = await prisma.legalDocument.create({
        data: {
          documentType: "TERMS_AND_CONDITIONS",
          title: "Terms and Conditions",
          slug: "terms",
          version: acceptedTermsVersion || "1.0.0",
          content: "Default Terms and Conditions. Please manage in Super Admin.",
          isActive: true,
          publishedAt: new Date()
        }
      });
      termsDocId = placeholderTerms.id;
    }

    let privacyDocId = "";
    if (activePrivacy) {
      if (activePrivacy.version !== acceptedPrivacyVersion) {
        return NextResponse.json(
          { error: `Outdated Privacy version accepted (${acceptedPrivacyVersion}). Current is ${activePrivacy.version}.` },
          { status: 400 }
        );
      }
      privacyDocId = activePrivacy.id;
    } else {
      // Auto-provision placeholder active privacy if database is empty
      const placeholderPrivacy = await prisma.legalDocument.create({
        data: {
          documentType: "PRIVACY_POLICY",
          title: "Privacy Policy",
          slug: "privacy",
          version: acceptedPrivacyVersion || "1.0.0",
          content: "Default Privacy Policy. Please manage in Super Admin.",
          isActive: true,
          publishedAt: new Date()
        }
      });
      privacyDocId = placeholderPrivacy.id;
    }

    // 4. Generate a globally unique property slug
    let slug = propertyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    if (!slug) {
      slug = "property-" + Math.floor(Math.random() * 10000);
    }

    let existingProperty = await prisma.property.findUnique({
      where: { slug }
    });

    let counter = 1;
    let uniqueSlug = slug;
    while (existingProperty) {
      uniqueSlug = `${slug}-${counter}`;
      existingProperty = await prisma.property.findUnique({
        where: { slug: uniqueSlug }
      });
      counter++;
    }

    // 5. Create everything in a secure database transaction
    const registeredUser = await prisma.$transaction(async (tx) => {
      // Create user with 'owner' role
      const newUser = await createUser({
        name,
        email,
        phone,
        password,
        role: "owner"
      });

      // Create property profile mapped to the owner
      const property = await tx.property.create({
        data: {
          ownerId: newUser.id,
          slug: uniqueSlug,
          title: propertyName
        }
      });

      // Establish PropertyUserAccess link
      await tx.propertyUserAccess.create({
        data: {
          propertyId: property.id,
          userId: newUser.id,
          role: "owner"
        }
      });

      // Write immutable legal acceptance logs for compliance audits
      await tx.legalAcceptanceLog.create({
        data: {
          userId: newUser.id,
          documentId: termsDocId,
          acceptedVersion: acceptedTermsVersion,
          ipAddress: ip,
          userAgent,
          metadata: { registrationAcceptance: true }
        }
      });

      await tx.legalAcceptanceLog.create({
        data: {
          userId: newUser.id,
          documentId: privacyDocId,
          acceptedVersion: acceptedPrivacyVersion,
          ipAddress: ip,
          userAgent,
          metadata: { registrationAcceptance: true }
        }
      });

      return newUser;
    });

    // 5.1. Bind referral code if provided
    if (referralCode) {
      try {
        await ReferralService.bindReferral({
          referredUserId: registeredUser.id,
          referralCode,
          registrationIp: ip
        });
      } catch (err: unknown) {
        console.error("[REFERRAL_BIND_ERROR] Failed to bind referral code:", err);
      }
    }

    // 5.2. Initialize referral profile for the new user
    try {
      await ReferralService.getOrCreateProfile(registeredUser.id);
    } catch (err: unknown) {
      console.error("[REFERRAL_PROFILE_CREATE_ERROR] Failed to create referral profile:", err);
    }

    // 5. Automatically log in the user upon successful registration
    const authResult = await authService.login(
      email,
      password,
      "partner",
      ip,
      userAgent,
      requestId
    );

    const { accessToken, refreshToken, user } = authResult;

    // 6. Return response and set cookies immediately
    const response = NextResponse.json(
      {
        success: true,
        message: "Partner account registered and logged in successfully",
        user
      },
      { status: 201 }
    );

    // Set Access Token HttpOnly cookie
    response.cookies.set("access-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    // Set Refresh Token HttpOnly cookie
    response.cookies.set("refresh-token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Set duplicate backward-compatible "token" cookie
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;

  } catch (error) {
    console.error("[PARTNER_REGISTRATION_POST] Error registering owner:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth.service";
import { withErrorHandler } from "@/lib/errors/handler";
import { successResponse } from "@/lib/utils/apiResponse";
import { PASSWORD_REGEX } from "@/lib/server/password";

const authService = new AuthService();

const partnerRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").trim(),
  phone: z.string().min(10, "Phone number is too short"),
  password: z.string().regex(
    PASSWORD_REGEX,
    "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
  ),
  propertyName: z.string().min(3, "Property name must be at least 3 characters"),
  acceptedTermsVersion: z.string().min(1, "Must accept terms and conditions"),
  acceptedPrivacyVersion: z.string().min(1, "Must accept privacy policy"),
});

async function partnerRegisterHandler(request: NextRequest) {
  const body = await request.json();
  
  const validation = partnerRegisterSchema.safeParse(body);
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const newUser = await authService.registerPartner(validation.data, ip, userAgent);

  return successResponse(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    { message: "Partner registered successfully", status: 201 }
  );
}

export const POST = withErrorHandler(partnerRegisterHandler);

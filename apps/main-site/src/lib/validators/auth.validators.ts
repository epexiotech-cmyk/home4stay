import { z } from "zod";
import { PASSWORD_REGEX } from "@/lib/server/password";
import { 
  BaseRegisterRequest, 
  LoginRequest, 
  RegisterRequest, 
  PartnerRegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from "../types/auth.dto";

// --- Shared Primitive Validations ---
export const emailSchema = z.string().email("Invalid email address").trim();

export const strongPasswordSchema = z.string().regex(
  PASSWORD_REGEX,
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
);

// --- Base Schemas ---
export const baseRegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  phone: z.string().min(10, "Phone number is too short"),
  password: strongPasswordSchema,
}) satisfies z.ZodType<BaseRegisterRequest>;

// --- Endpoint Schemas ---

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"), // Intentionally NOT strong validation, just ensuring it's provided
  loginType: z.enum(["customer", "partner", "admin"]),
}) satisfies z.ZodType<LoginRequest>;

export const registerSchema = baseRegisterSchema satisfies z.ZodType<RegisterRequest>;

export const partnerRegisterSchema = baseRegisterSchema.extend({
  name: z.string().min(1, "Full Name is required"), // Overrides base to use "Full Name is required"
  propertyName: z.string().min(1, "Property Name is required"),
  acceptedTermsVersion: z.string().min(1, "Terms acceptance version is required"),
  acceptedPrivacyVersion: z.string().min(1, "Privacy acceptance version is required"),
  referralCode: z.string().optional(),
}) satisfies z.ZodType<PartnerRegisterRequest>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
}) satisfies z.ZodType<ForgotPasswordRequest>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: strongPasswordSchema, // Enforces the same strong validation rules as registration
}) satisfies z.ZodType<ResetPasswordRequest>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"), // Ensure it exists
  newPassword: strongPasswordSchema, // Enforces strong rules for the new password
}) satisfies z.ZodType<ChangePasswordRequest>;

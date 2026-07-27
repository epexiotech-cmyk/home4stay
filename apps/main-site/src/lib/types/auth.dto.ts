export interface BaseRegisterRequest {
  name: string;
  email: string;
  phone: string;
  password?: string; // Strong password regex applied on edge
}

export interface LoginRequest {
  email: string;
  password?: string;
  loginType: 'customer' | 'partner' | 'admin';
}

export interface RegisterRequest extends BaseRegisterRequest {}

export interface PartnerRegisterRequest extends BaseRegisterRequest {
  propertyName: string;
  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
  referralCode?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

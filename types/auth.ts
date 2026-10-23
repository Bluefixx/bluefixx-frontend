/**
 * BlueFixx Authentication Types & Contracts
 * Based on the BlueFixx Authentication API specification
 */

export type UserRole = "CUSTOMER" | "ARTISAN" | "LEARNER";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  role: UserRole | null;
  termsVersion?: string | null;
  termsAcceptedAt?: string | null;
  createdAt: string;
}

// ── 1. Register ──────────────────────────────────────────────
export interface RegisterRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

export interface RegisterResponse {
  message: string;
  challengeId: string;
}

// ── 2. Verify Phone ──────────────────────────────────────────
export interface VerifyPhoneRequest {
  challengeId: string;
  code: string;
}

export interface VerifyPhoneResponse {
  message: string;
  user: User;
}

// ── 3. Resend OTP ────────────────────────────────────────────
export interface ResendOtpRequest {
  challengeId: string;
}

export interface ResendOtpResponse {
  message: string;
  challengeId: string;
}

// ── 4. Login ─────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

// ── 5. Refresh ───────────────────────────────────────────────
export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

// ── 6. Logout ────────────────────────────────────────────────
export interface LogoutResponse {
  message: string;
}

// ── 7. Password Recovery ─────────────────────────────────────
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  challengeId: string;
}

export interface VerifyResetOtpRequest {
  challengeId: string;
  code: string;
}

export interface VerifyResetOtpResponse {
  resetToken: string;
  expiresIn: number;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ── 8. Change Password ───────────────────────────────────────
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// ── 9. Role Selection ────────────────────────────────────────
export interface SelectRoleRequest {
  role: UserRole;
}

export interface SelectRoleResponse {
  user: {
    id: string;
    role: UserRole;
  };
}

// ── 10. Social Auth & Providers ──────────────────────────────
export interface GoogleAuthRequest {
  idToken: string;
  phone?: string;
  acceptedTerms?: boolean;
  fullName?: string;
}

export interface LinkGoogleRequest {
  idToken: string;
}

export interface AuthProviderOptionsResponse {
  providers: {
    google: { enabled: boolean; clientId: string | null };
    apple: { enabled: boolean; clientId: string | null };
  };
  password: {
    minimumLength: number;
    maximumLength: number;
  };
}

export interface AppleChallengeResponse {
  challengeId: string;
  nonce: string;
  expiresIn: number;
}

export interface AppleAuthRequest {
  challengeId: string;
  authorizationCode: string;
  phone?: string;
  acceptedTerms?: boolean;
  fullName?: string;
}

export interface LinkAppleRequest {
  challengeId: string;
  authorizationCode: string;
}

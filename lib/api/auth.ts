import { apiClient, setAccessToken } from "./client";
import {
  RegisterRequest,
  RegisterResponse,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyResetOtpRequest,
  VerifyResetOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  SelectRoleRequest,
  SelectRoleResponse,
  GoogleAuthRequest,
  LinkGoogleRequest,
  AppleChallengeResponse,
  AppleAuthRequest,
  LinkAppleRequest,
  AuthProviderOptionsResponse,
  User,
} from "@/types/auth";

/**
 * 1. Register a new user
 */
export async function registerApi(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiClient.post<RegisterResponse>("/auth/register", payload);
}

/**
 * 2. Verify phone number with 6-digit OTP code
 */
export async function verifyPhoneApi(payload: VerifyPhoneRequest): Promise<VerifyPhoneResponse> {
  return apiClient.post<VerifyPhoneResponse>("/auth/verify-phone", payload);
}

/**
 * 3. Resend OTP verification code
 */
export async function resendOtpApi(payload: ResendOtpRequest): Promise<ResendOtpResponse> {
  return apiClient.post<ResendOtpResponse>("/auth/resend-otp", payload);
}

/**
 * 4. Sign in with email and password
 * Sets HttpOnly refresh cookie in browser and returns accessToken + user
 */
export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  if (response.accessToken) {
    setAccessToken(response.accessToken);
  }
  return response;
}

/**
 * 5. Refresh access token
 */
export async function refreshApi(): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>("/auth/refresh", {});
  if (response.accessToken) {
    setAccessToken(response.accessToken);
  }
  return response;
}

/**
 * 6. Logout current session
 */
export async function logoutApi(): Promise<LogoutResponse> {
  try {
    return await apiClient.post<LogoutResponse>("/auth/logout", {});
  } finally {
    setAccessToken(null);
  }
}

/**
 * 7. Logout from all active sessions
 */
export async function logoutAllApi(): Promise<LogoutResponse> {
  try {
    return await apiClient.post<LogoutResponse>("/auth/logout-all", {});
  } finally {
    setAccessToken(null);
  }
}

/**
 * 8. Forgot password request
 */
export async function forgotPasswordApi(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  return apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", payload);
}

/**
 * 9. Verify password reset code
 */
export async function verifyResetOtpApi(
  payload: VerifyResetOtpRequest
): Promise<VerifyResetOtpResponse> {
  return apiClient.post<VerifyResetOtpResponse>("/auth/verify-reset-otp", payload);
}

/**
 * 10. Set new password with reset token
 */
export async function resetPasswordApi(
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  return apiClient.post<ResetPasswordResponse>("/auth/reset-password", payload);
}

/**
 * 11. Change password (authenticated)
 */
export async function changePasswordApi(
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  return apiClient.post<ChangePasswordResponse>("/auth/change-password", payload);
}

/**
 * 12. Get current authenticated user
 */
export async function getCurrentUserApi(): Promise<{ user: User }> {
  return apiClient.get<{ user: User }>("/auth/me");
}

/**
 * 13. Select initial role (CUSTOMER | ARTISAN | TALENT)
 */
export async function selectRoleApi(payload: SelectRoleRequest): Promise<SelectRoleResponse> {
  return apiClient.patch<SelectRoleResponse>("/auth/role", payload);
}

/**
 * 14. Google Sign-In or Sign-Up
 */
export async function googleAuthApi(payload: GoogleAuthRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/google", payload);
  if (response.accessToken) {
    setAccessToken(response.accessToken);
  }
  return response;
}

/**
 * 15. Link Google to existing account
 */
export async function linkGoogleApi(payload: LinkGoogleRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>("/auth/google/link", payload);
}

/**
 * 16. Read auth provider options
 */
export async function getAuthOptionsApi(): Promise<AuthProviderOptionsResponse> {
  return apiClient.get<AuthProviderOptionsResponse>("/auth/options");
}

/**
 * 17. Create Apple Sign-In challenge
 */
export async function appleChallengeApi(): Promise<AppleChallengeResponse> {
  return apiClient.post<AppleChallengeResponse>("/auth/apple/challenge", {});
}

/**
 * 18. Sign-Up or Sign-In with Apple
 */
export async function appleAuthApi(payload: AppleAuthRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/apple", payload);
  if (response.accessToken) {
    setAccessToken(response.accessToken);
  }
  return response;
}

/**
 * 19. Link Apple account
 */
export async function linkAppleApi(payload: LinkAppleRequest): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>("/auth/apple/link", payload);
}

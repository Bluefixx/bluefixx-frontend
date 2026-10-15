"use client";

import { createContext, useContext } from "react";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface RegistrationData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
  state?: string;
  city?: string;
  streetAddress?: string;
  role?: "customer" | "artisan" | "apprentice";
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  role?: "customer" | "artisan" | "apprentice";
  isVerified: boolean;
}

export type RegistrationStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface AuthState {
  /** Currently authenticated user, null when logged out */
  user: AuthUser | null;
  /** Whether an auth request is in progress */
  isLoading: boolean;
  /** Registration flow: partial data collected so far */
  registrationData: Partial<RegistrationData>;
  /** Registration flow: current step (1–6) */
  registrationStep: RegistrationStep;
  /** Phone verification: the phone number being verified */
  verificationPhone: string;
  /** Phone verification: the OTP code entered */
  verificationCode: string;
  /** Whether OTP has been sent */
  otpSent: boolean;
  /** Selected language preference */
  selectedLanguageId: string;
  /** Whether the intro carousel has been completed or skipped */
  introCompleted: boolean;
}

export interface AuthActions {
  /** Update partial registration data */
  setRegistrationData: (data: Partial<RegistrationData>) => void;
  /** Advance or set the registration step */
  setRegistrationStep: (step: RegistrationStep) => void;
  /** Set phone number for verification */
  setVerificationPhone: (phone: string) => void;
  /** Set the OTP verification code */
  setVerificationCode: (code: string) => void;
  /** Mark OTP as sent */
  setOtpSent: (sent: boolean) => void;
  /** Set language preference */
  setSelectedLanguageId: (id: string) => void;
  /** Mark intro as completed */
  setIntroCompleted: (completed: boolean) => void;
  /** Set loading state */
  setIsLoading: (loading: boolean) => void;
  /** Set user (after login/registration success) */
  setUser: (user: AuthUser | null) => void;
  /** Reset all registration state */
  resetRegistration: () => void;
  /** Reset entire auth state */
  resetAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ────────────────────────────────────────────────────────────────
// Defaults
// ────────────────────────────────────────────────────────────────

export const DEFAULT_AUTH_STATE: AuthState = {
  user: null,
  isLoading: false,
  registrationData: {},
  registrationStep: 1,
  verificationPhone: "",
  verificationCode: "",
  otpSent: false,
  selectedLanguageId: "en",
  introCompleted: false,
};

// ────────────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthStore | null>(null);

/**
 * Hook to access auth state and actions from any client component.
 * Must be used within an `<AuthProvider>`.
 */
export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

"use client";

import { createContext, useContext } from "react";
import { User, LoginRequest, LoginResponse } from "@/types/auth";

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
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  role?: "customer" | "artisan" | "apprentice" | "CUSTOMER" | "ARTISAN" | "LEARNER" | null;
  avatarUrl?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export type RegistrationStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface AuthState {
  /** Currently authenticated user, null when logged out */
  user: AuthUser | null;
  /** Active in-memory access token */
  accessToken: string | null;
  /** Active role currently viewing the application */
  activeRole: "customer" | "artisan" | "apprentice";
  /** Whether the user has completed apprentice training (unlocks artisan role) */
  apprenticeTrainingCompleted: boolean;
  /** Available wallet balance */
  walletBalance: number;
  /** Active location display string */
  locationName: string;
  /** Whether an auth request is in progress */
  isLoading: boolean;
  /** Active phone or password reset challengeId returned by backend */
  challengeId: string | null;
  /** Registration flow: partial data collected so far */
  registrationData: Partial<RegistrationData>;
  /** Registration flow: current step (1–6) */
  registrationStep: RegistrationStep;
  /** Phone verification: the phone number being verified */
  verificationPhone: string;
  /** Phone verification: the OTP code entered */
  verificationCode: string;
  /** Delivery channel for OTP: SMS or EMAIL */
  otpChannel: "SMS" | "EMAIL";
  /** Masked destination where OTP was dispatched (e.g. +234***78 or a***@example.com) */
  otpDestination: string;
  /** Whether OTP has been sent */
  otpSent: boolean;
  /** Selected language preference */
  selectedLanguageId: string;
  /** Whether the intro carousel has been completed or skipped */
  introCompleted: boolean;
}

export interface AuthActions {
  /** Update active role */
  setActiveRole: (role: "customer" | "artisan" | "apprentice") => void;
  /** Set whether apprentice training is completed */
  setApprenticeTrainingCompleted: (completed: boolean) => void;
  /** Set wallet balance */
  setWalletBalance: (balance: number) => void;
  /** Set active location display */
  setLocationName: (location: string) => void;
  /** Update partial registration data */
  setRegistrationData: (data: Partial<RegistrationData>) => void;
  /** Advance or set the registration step */
  setRegistrationStep: (step: RegistrationStep) => void;
  /** Set phone number for verification */
  setVerificationPhone: (phone: string) => void;
  /** Set the OTP verification code */
  setVerificationCode: (code: string) => void;
  /** Set OTP delivery channel */
  setOtpChannel: (channel: "SMS" | "EMAIL") => void;
  /** Set masked OTP destination */
  setOtpDestination: (destination: string) => void;
  /** Mark OTP as sent */
  setOtpSent: (sent: boolean) => void;
  /** Set challenge ID returned by auth endpoints */
  setChallengeId: (id: string | null) => void;
  /** Set language preference */
  setSelectedLanguageId: (id: string) => void;
  /** Mark intro as completed */
  setIntroCompleted: (completed: boolean) => void;
  /** Set loading state */
  setIsLoading: (loading: boolean) => void;
  /** Set user (after login/registration success) */
  setUser: (user: AuthUser | null) => void;
  /** Set in-memory access token */
  setAccessToken: (token: string | null) => void;
  /** Login with backend API */
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  /** Logout with backend API */
  logout: () => Promise<void>;
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
  user: {
    id: "usr-daniel-eze",
    fullName: "Daniel Eze",
    email: "daniel.eze@bluefixx.com",
    phone: "+234 803 245 0182",
    state: "Enugu",
    city: "Independence Layout",
    streetAddress: "14 Ziks Avenue",
    role: "customer",
    isVerified: true,
  },
  accessToken: null,
  activeRole: "customer",
  apprenticeTrainingCompleted: false,
  walletBalance: 0,
  locationName: "Independence Layout, Enugu",
  isLoading: false,
  challengeId: null,
  registrationData: {},
  registrationStep: 1,
  verificationPhone: "",
  verificationCode: "",
  otpChannel: "EMAIL",
  otpDestination: "",
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

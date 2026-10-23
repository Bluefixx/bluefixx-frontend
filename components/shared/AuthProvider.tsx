"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  AuthContext,
  AuthStore,
  AuthUser,
  RegistrationData,
  RegistrationStep,
  DEFAULT_AUTH_STATE,
} from "@/lib/stores/auth-store";
import {
  loginApi,
  logoutApi,
  getCurrentUserApi,
  refreshApi,
} from "@/lib/api/auth";
import {
  setAccessToken as setClientAccessToken,
  setOnAuthFailure,
  getAccessToken,
} from "@/lib/api/client";
import { LoginRequest, LoginResponse } from "@/types/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that wraps the application to supply auth state.
 * Place this in the root layout or the onboarding layout.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_AUTH_STATE.user);
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [activeRole, setActiveRole] = useState<"customer" | "artisan" | "apprentice">(
    DEFAULT_AUTH_STATE.activeRole
  );
  const [apprenticeTrainingCompleted, setApprenticeTrainingCompleted] = useState(
    DEFAULT_AUTH_STATE.apprenticeTrainingCompleted
  );
  const [walletBalance, setWalletBalance] = useState(DEFAULT_AUTH_STATE.walletBalance);
  const [locationName, setLocationName] = useState(DEFAULT_AUTH_STATE.locationName);
  const [isLoading, setIsLoading] = useState(DEFAULT_AUTH_STATE.isLoading);
  const [challengeId, setChallengeId] = useState<string | null>(DEFAULT_AUTH_STATE.challengeId);
  const [registrationData, setRegistrationDataRaw] = useState<Partial<RegistrationData>>(
    DEFAULT_AUTH_STATE.registrationData
  );
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(
    DEFAULT_AUTH_STATE.registrationStep
  );
  const [verificationPhone, setVerificationPhone] = useState(
    DEFAULT_AUTH_STATE.verificationPhone
  );
  const [verificationCode, setVerificationCode] = useState(
    DEFAULT_AUTH_STATE.verificationCode
  );
  const [otpSent, setOtpSent] = useState(DEFAULT_AUTH_STATE.otpSent);
  const [selectedLanguageId, setSelectedLanguageId] = useState(
    DEFAULT_AUTH_STATE.selectedLanguageId
  );
  const [introCompleted, setIntroCompleted] = useState(
    DEFAULT_AUTH_STATE.introCompleted
  );

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setClientAccessToken(token);
  }, []);

  const setRegistrationData = useCallback((data: Partial<RegistrationData>) => {
    setRegistrationDataRaw((prev) => ({ ...prev, ...data }));
  }, []);

  const resetRegistration = useCallback(() => {
    setRegistrationDataRaw({});
    setRegistrationStep(1);
    setVerificationPhone("");
    setVerificationCode("");
    setOtpSent(false);
    setChallengeId(null);
  }, []);

  const resetAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setActiveRole("customer");
    setApprenticeTrainingCompleted(false);
    setIsLoading(false);
    resetRegistration();
    setSelectedLanguageId("en");
    setIntroCompleted(false);
  }, [resetRegistration, setAccessToken]);

  // Hook into client auth failure
  useEffect(() => {
    setOnAuthFailure(() => {
      setAccessToken(null);
    });
  }, [setAccessToken]);

  // Login handler
  const login = useCallback(
    async (credentials: LoginRequest): Promise<LoginResponse> => {
      setIsLoading(true);
      try {
        const response = await loginApi(credentials);
        setAccessToken(response.accessToken);

        const backendUser = response.user;
        const normalizedRole: "customer" | "artisan" | "apprentice" =
          backendUser.role === "ARTISAN"
            ? "artisan"
            : backendUser.role === "LEARNER"
            ? "apprentice"
            : "customer";

        const mappedUser: AuthUser = {
          id: backendUser.id,
          fullName: backendUser.fullName,
          email: backendUser.email,
          phone: backendUser.phone,
          emailVerifiedAt: backendUser.emailVerifiedAt,
          phoneVerifiedAt: backendUser.phoneVerifiedAt,
          role: backendUser.role,
          createdAt: backendUser.createdAt,
          isVerified: Boolean(backendUser.phoneVerifiedAt || backendUser.emailVerifiedAt),
        };

        setUser(mappedUser);
        setActiveRole(normalizedRole);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    [setAccessToken]
  );

  // Logout handler
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout, still clear local session
    } finally {
      resetAuth();
      setIsLoading(false);
    }
  }, [resetAuth]);

  const store: AuthStore = useMemo(
    () => ({
      user,
      accessToken,
      activeRole,
      apprenticeTrainingCompleted,
      walletBalance,
      locationName,
      isLoading,
      challengeId,
      registrationData,
      registrationStep,
      verificationPhone,
      verificationCode,
      otpSent,
      selectedLanguageId,
      introCompleted,
      setUser,
      setAccessToken,
      setActiveRole,
      setApprenticeTrainingCompleted,
      setWalletBalance,
      setLocationName,
      setIsLoading,
      setChallengeId,
      setRegistrationData,
      setRegistrationStep,
      setVerificationPhone,
      setVerificationCode,
      setOtpSent,
      setSelectedLanguageId,
      setIntroCompleted,
      login,
      logout,
      resetRegistration,
      resetAuth,
    }),
    [
      user,
      accessToken,
      activeRole,
      apprenticeTrainingCompleted,
      walletBalance,
      locationName,
      isLoading,
      challengeId,
      registrationData,
      registrationStep,
      verificationPhone,
      verificationCode,
      otpSent,
      selectedLanguageId,
      introCompleted,
      setAccessToken,
      setRegistrationData,
      login,
      logout,
      resetRegistration,
      resetAuth,
    ]
  );

  return <AuthContext value={store}>{children}</AuthContext>;
}

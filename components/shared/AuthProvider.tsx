"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  AuthContext,
  AuthStore,
  AuthUser,
  RegistrationData,
  RegistrationStep,
  DEFAULT_AUTH_STATE,
} from "@/lib/stores/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that wraps the application to supply auth state.
 * Place this in the root layout or the onboarding layout.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_AUTH_STATE.user);
  const [activeRole, setActiveRole] = useState<"customer" | "artisan" | "apprentice">(
    DEFAULT_AUTH_STATE.activeRole
  );
  const [apprenticeTrainingCompleted, setApprenticeTrainingCompleted] = useState(
    DEFAULT_AUTH_STATE.apprenticeTrainingCompleted
  );
  const [walletBalance, setWalletBalance] = useState(DEFAULT_AUTH_STATE.walletBalance);
  const [locationName, setLocationName] = useState(DEFAULT_AUTH_STATE.locationName);
  const [isLoading, setIsLoading] = useState(DEFAULT_AUTH_STATE.isLoading);
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

  const setRegistrationData = useCallback(
    (data: Partial<RegistrationData>) => {
      setRegistrationDataRaw((prev) => ({ ...prev, ...data }));
    },
    []
  );

  const resetRegistration = useCallback(() => {
    setRegistrationDataRaw({});
    setRegistrationStep(1);
    setVerificationPhone("");
    setVerificationCode("");
    setOtpSent(false);
  }, []);

  const resetAuth = useCallback(() => {
    setUser(null);
    setActiveRole("customer");
    setApprenticeTrainingCompleted(false);
    setIsLoading(false);
    resetRegistration();
    setSelectedLanguageId("en");
    setIntroCompleted(false);
  }, [resetRegistration]);

  const store: AuthStore = useMemo(
    () => ({
      user,
      activeRole,
      apprenticeTrainingCompleted,
      walletBalance,
      locationName,
      isLoading,
      registrationData,
      registrationStep,
      verificationPhone,
      verificationCode,
      otpSent,
      selectedLanguageId,
      introCompleted,
      setUser,
      setActiveRole,
      setApprenticeTrainingCompleted,
      setWalletBalance,
      setLocationName,
      setIsLoading,
      setRegistrationData,
      setRegistrationStep,
      setVerificationPhone,
      setVerificationCode,
      setOtpSent,
      setSelectedLanguageId,
      setIntroCompleted,
      resetRegistration,
      resetAuth,
    }),
    [
      user,
      activeRole,
      apprenticeTrainingCompleted,
      walletBalance,
      locationName,
      isLoading,
      registrationData,
      registrationStep,
      verificationPhone,
      verificationCode,
      otpSent,
      selectedLanguageId,
      introCompleted,
      setRegistrationData,
      resetRegistration,
      resetAuth,
    ]
  );

  return <AuthContext value={store}>{children}</AuthContext>;
}

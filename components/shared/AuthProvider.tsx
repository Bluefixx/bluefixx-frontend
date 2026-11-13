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
import { getAccountProfileApi } from "@/lib/api/account";
import { getWalletApi } from "@/lib/api/wallet";
import {
  setAccessToken as setClientAccessToken,
  setOnAuthFailure,
  getAccessToken,
} from "@/lib/api/client";
import { LoginRequest, LoginResponse } from "@/types/auth";

import { setCookie, deleteCookie } from "@/lib/utils/cookies";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that wraps the application to supply auth state.
 * Place this in the root layout or the onboarding layout.
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("bluefixx_user");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_AUTH_STATE.user;
  });

  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken());

  const [activeRole, setActiveRoleState] = useState<"customer" | "artisan" | "apprentice">(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("bluefixx_active_role");
      if (cached === "customer" || cached === "artisan" || cached === "apprentice") {
        return cached;
      }
    }
    return DEFAULT_AUTH_STATE.activeRole;
  });

  const [apprenticeTrainingCompleted, setApprenticeTrainingCompleted] = useState(
    DEFAULT_AUTH_STATE.apprenticeTrainingCompleted
  );

  const [walletBalance, setWalletBalanceState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("bluefixx_wallet_balance");
      if (cached !== null) {
        const val = parseInt(cached, 10);
        if (!isNaN(val)) return val;
      }
    }
    return DEFAULT_AUTH_STATE.walletBalance;
  });

  const [locationName, setLocationNameState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("bluefixx_location_name");
      if (cached) return cached;
    }
    return DEFAULT_AUTH_STATE.locationName;
  });

  const setUser = useCallback((newUser: React.SetStateAction<AuthUser | null>) => {
    setUserState((prev) => {
      const resolved = typeof newUser === "function" ? newUser(prev) : newUser;
      if (typeof window !== "undefined") {
        if (resolved) {
          localStorage.setItem("bluefixx_user", JSON.stringify(resolved));
          if (resolved.role) {
            setCookie("bluefixx_active_role", resolved.role.toLowerCase(), 7);
          }
        } else {
          localStorage.removeItem("bluefixx_user");
          deleteCookie("bluefixx_active_role");
        }
      }
      return resolved;
    });
  }, []);

  const setActiveRole = useCallback((role: "customer" | "artisan" | "apprentice") => {
    setActiveRoleState(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("bluefixx_active_role", role);
      setCookie("bluefixx_active_role", role, 7);
    }
  }, []);

  const setWalletBalance = useCallback((balance: number) => {
    setWalletBalanceState(balance);
    if (typeof window !== "undefined") {
      localStorage.setItem("bluefixx_wallet_balance", balance.toString());
    }
  }, []);

  const setLocationName = useCallback((loc: string) => {
    setLocationNameState(loc);
    if (typeof window !== "undefined") {
      localStorage.setItem("bluefixx_location_name", loc);
    }
  }, []);
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
  const [otpChannel, setOtpChannel] = useState<"SMS" | "EMAIL">(
    DEFAULT_AUTH_STATE.otpChannel
  );
  const [otpDestination, setOtpDestination] = useState<string>(
    DEFAULT_AUTH_STATE.otpDestination
  );
  const [otpSent, setOtpSent] = useState(DEFAULT_AUTH_STATE.otpSent);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("bluefixx_lang");
      if (fromStorage) return fromStorage;
      const match = document.cookie.match(/(?:^|;\s*)bluefixx_lang=([^;]+)/);
      if (match?.[1]) return match[1];
    }
    return DEFAULT_AUTH_STATE.selectedLanguageId;
  });
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
    setOtpChannel("EMAIL");
    setOtpDestination("");
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
    deleteCookie("bluefixx_active_role");
  }, [resetRegistration, setAccessToken, setActiveRole, setUser]);

  // Hook into client auth failure
  useEffect(() => {
    setOnAuthFailure(() => {
      resetAuth();
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/register") && !path.startsWith("/forgot-password")) {
          window.location.href = "/login";
        }
      }
    });
  }, [resetAuth]);

  // Hydrate user profile & wallet on initial app load if authenticated
  useEffect(() => {
    let isMounted = true;

    // 1. Profile & Active Role from /account
    getAccountProfileApi()
      .then((res) => {
        if (!isMounted || !res) return;
        const u = (res as any)?.user || res;
        if (u && (u.id || u.fullName || u.email)) {
          setUser((prev) => ({
            id: u.id || prev?.id || "user-id",
            fullName: u.fullName || prev?.fullName || "",
            email: u.email || prev?.email || "",
            phone: u.phone || prev?.phone || "",
            avatarUrl: u.avatarUrl || (res as any)?.settings?.photoId || prev?.avatarUrl,
            isVerified: Boolean(u.phoneVerifiedAt || u.emailVerifiedAt || (res as any)?.settings?.pinConfigured || prev?.isVerified),
            createdAt: u.createdAt || prev?.createdAt,
            role: (u.role?.toLowerCase() as any) || prev?.role || "customer",
            bio: u.bio,
          }));

          const activeRoleApi = u.activeRole?.toLowerCase();
          if (activeRoleApi === "customer" || activeRoleApi === "artisan" || activeRoleApi === "apprentice") {
            setActiveRole(activeRoleApi);
          }

          const langFromProfile = (res as any)?.settings?.language || (res as any)?.language || u.language;
          if (langFromProfile && typeof document !== "undefined") {
            const currentCookie = document.cookie.match(/(?:^|;\s*)bluefixx_lang=([^;]+)/)?.[1];
            if (currentCookie !== langFromProfile) {
              document.cookie = `bluefixx_lang=${langFromProfile};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
              localStorage.setItem("bluefixx_lang", langFromProfile);
              setSelectedLanguageId(langFromProfile);
            }
          }
        }
      })
      .catch((err) => {
        console.debug("Silent profile hydration failed (offline or unauthenticated).", err);
      });

    // 2. Wallet balance from /wallet
    getWalletApi()
      .then((wallet) => {
        if (!isMounted || !wallet) return;
        const rawAvail = (wallet as any).availableBalanceKobo ?? wallet.available;
        if (rawAvail !== undefined && rawAvail !== null) {
          const kobo = typeof rawAvail === "string" ? parseInt(rawAvail, 10) : rawAvail;
          if (!isNaN(kobo)) {
            setWalletBalance(Math.round(kobo / 100));
          }
        }
      })
      .catch((err) => {
        console.debug("Silent wallet balance hydration failed.", err);
      });

    return () => {
      isMounted = false;
    };
  }, [setUser, setActiveRole, setWalletBalance]);

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
      otpChannel,
      otpDestination,
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
      setOtpChannel,
      setOtpDestination,
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

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getAuthOptionsApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/stores/auth-store";
import { LoginResponse } from "@/types/auth";

interface GooglePromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
    ux_mode?: "popup" | "redirect";
  }) => void;
  prompt: (listener?: (notification: GooglePromptNotification) => void) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      width?: number;
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
    }
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGisScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.google?.accounts?.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`
    );
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Sign-In")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });
}

function decodeJwtName(idToken: string): string {
  try {
    const parts = idToken.split(".");
    if (parts.length < 2) return "";
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    const payload = JSON.parse(json) as { name?: unknown };
    return typeof payload.name === "string" ? payload.name.trim() : "";
  } catch {
    return "";
  }
}

export function useGoogleAuth() {
  const router = useRouter();
  const { loginWithGoogle, setRegistrationStep } = useAuth();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const [initialFullName, setInitialFullName] = useState("");
  const [isFallbackModalOpen, setIsFallbackModalOpen] = useState(false);

  const clientIdRef = useRef<string | null>(null);
  const fallbackContainerRef = useRef<HTMLDivElement | null>(null);

  const routeAfterAuth = useCallback(
    (response: LoginResponse) => {
      toast.success(`Welcome, ${response.user.fullName || "User"}!`);
      if (!response.user.role) {
        setRegistrationStep(6);
        router.push("/signup");
        return;
      }
      const role = response.user.role.toLowerCase();
      if (role === "artisan") {
        router.push("/artisan");
      } else if (role === "apprentice" || role === "talent" || role === "learner") {
        router.push("/talent/home");
      } else {
        router.push("/dashboard");
      }
    },
    [router, setRegistrationStep]
  );

  const handleGoogleError = useCallback(
    (err: unknown, idToken?: string) => {
      if (err instanceof ApiError) {
        if (err.code === "VALIDATION_ERROR" && idToken) {
          setInitialFullName(decodeJwtName(idToken));
          setPendingIdToken(idToken);
          return;
        }
        if (err.code === "GOOGLE_LINK_REQUIRED") {
          toast.error(
            "An account with this email already exists. Sign in with your email and password to link Google.",
            { duration: 5000 }
          );
          router.push("/login");
          return;
        }
        if (err.code === "GOOGLE_AUTH_UNAVAILABLE") {
          toast.error("Google sign-in is temporarily unavailable.");
          return;
        }
        if (err.code === "GOOGLE_CREDENTIALS_INVALID") {
          toast.error("Google verification expired or is invalid. Please try again.");
          return;
        }
        toast.error(err.message || "Google sign-in failed.");
        return;
      }
      toast.error("Could not complete Google sign-in. Please try again.");
    },
    [router]
  );

  const handleCredential = useCallback(
    async (credential: string) => {
      setIsFallbackModalOpen(false);
      setIsGoogleLoading(true);
      try {
        const response = await loginWithGoogle({ idToken: credential });
        routeAfterAuth(response);
      } catch (err: unknown) {
        handleGoogleError(err, credential);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [loginWithGoogle, routeAfterAuth, handleGoogleError]
  );

  const ensureGoogleReady = useCallback(async (): Promise<string | null> => {
    let clientId = clientIdRef.current;
    if (!clientId) {
      const options = await getAuthOptionsApi();
      if (!options.google?.enabled || !options.google?.clientId) {
        toast.error("Google sign-in is not configured on the server.");
        return null;
      }
      clientId = options.google.clientId;
      clientIdRef.current = clientId;
    }

    await loadGisScript();
    const gis = window.google?.accounts?.id;
    if (!gis) {
      toast.error("Google Sign-In failed to initialize.");
      return null;
    }

    gis.initialize({
      client_id: clientId,
      callback: (res) => {
        if (res.credential) {
          void handleCredential(res.credential);
        } else {
          toast.error("Google did not return a credential.");
        }
      },
      ux_mode: "popup",
    });

    return clientId;
  }, [handleCredential]);

  const triggerGoogleSignIn = useCallback(async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    try {
      const clientId = await ensureGoogleReady();
      if (!clientId) {
        setIsGoogleLoading(false);
        return;
      }

      const gis = window.google?.accounts?.id;
      if (!gis) {
        setIsGoogleLoading(false);
        return;
      }

      gis.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleLoading(false);
          setIsFallbackModalOpen(true);
        } else if (
          notification.isDismissedMoment?.() &&
          notification.getDismissedReason?.() !== "credential_returned"
        ) {
          setIsGoogleLoading(false);
        }
      });
    } catch {
      setIsGoogleLoading(false);
      toast.error("Unable to start Google Sign-In. Please check your connection.");
    }
  }, [isGoogleLoading, ensureGoogleReady]);

  useEffect(() => {
    if (!isFallbackModalOpen || !fallbackContainerRef.current) return;
    const gis = window.google?.accounts?.id;
    if (!gis) return;

    fallbackContainerRef.current.innerHTML = "";
    gis.renderButton(fallbackContainerRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      shape: "rectangular",
    });
  }, [isFallbackModalOpen]);

  const submitGoogleProfile = useCallback(
    async (data: { fullName: string; phone: string; acceptedTerms: boolean }) => {
      if (!pendingIdToken) return;
      setIsGoogleLoading(true);
      try {
        const response = await loginWithGoogle({
          idToken: pendingIdToken,
          fullName: data.fullName,
          phone: data.phone,
          acceptedTerms: data.acceptedTerms,
        });
        setPendingIdToken(null);
        routeAfterAuth(response);
      } catch (err: unknown) {
        handleGoogleError(err);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [pendingIdToken, loginWithGoogle, routeAfterAuth, handleGoogleError]
  );

  const closeProfileModal = useCallback(() => {
    setPendingIdToken(null);
  }, []);

  const closeFallbackModal = useCallback(() => {
    setIsFallbackModalOpen(false);
  }, []);

  return {
    triggerGoogleSignIn,
    isGoogleLoading,
    isProfileModalOpen: Boolean(pendingIdToken),
    initialFullName,
    submitGoogleProfile,
    closeProfileModal,
    isFallbackModalOpen,
    fallbackContainerRef,
    closeFallbackModal,
  };
}

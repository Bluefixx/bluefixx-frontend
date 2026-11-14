"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthHeroPanel from "./AuthHeroPanel";
import OtpChannelModal from "./OtpChannelModal";
import PhoneInput from "@/components/ui/PhoneInput";
import { useAuth, RegistrationStep } from "@/lib/stores/auth-store";
import { registerApi, verifyPhoneApi, resendOtpApi, selectRoleApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { toE164 } from "@/lib/utils/phone";
import { OtpChannel } from "@/types/auth";

export default function SignupPage() {
  const router = useRouter();
  const {
    registrationData,
    setRegistrationData,
    registrationStep,
    setRegistrationStep,
    verificationPhone,
    setVerificationPhone,
    verificationCode,
    setVerificationCode,
    challengeId,
    setChallengeId,
    otpChannel,
    setOtpChannel,
    otpDestination,
    setOtpDestination,
    login,
    setUser,
    setActiveRole,
    isLoading,
    setIsLoading,
  } = useAuth();

  // ── Step 1 Form State ─────────────────────────────────────────
  const [fullName, setFullName] = useState(registrationData.fullName || "");
  const [phone, setPhone] = useState(registrationData.phone || "");
  const [countryCode, setCountryCode] = useState("+234");
  const [email, setEmail] = useState(registrationData.email || "");
  const [password, setPassword] = useState(registrationData.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // ── Step 2 Form State ─────────────────────────────────────────
  const [phoneForVerify, setPhoneForVerify] = useState(verificationPhone || phone || "");
  const [selectedChannel, setSelectedChannel] = useState<OtpChannel>(otpChannel || "EMAIL");
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);

  // ── Step 3 Form State (OTP Digits) ────────────────────────────
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 4 Form State (Profile Photo) ─────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(registrationData.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Step 5 Form State (Location) ──────────────────────────────
  const [selectedState, setSelectedState] = useState(registrationData.state || "Enugu");
  const [selectedCity, setSelectedCity] = useState(registrationData.city || "Independence Layout");
  const [streetAddress, setStreetAddress] = useState(registrationData.streetAddress || "14 Ziks Avenue");

  // ── Step 6 Form State (Role Selection) ────────────────────────
  type RoleType = "customer" | "artisan" | "apprentice";
  const [selectedRole, setSelectedRole] = useState<RoleType>(registrationData.role || "customer");

  // ── Stepper Indicator ─────────────────────────────────────────
  const StepperDots = ({ currentStep }: { currentStep: RegistrationStep }) => (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <div
          key={step}
          className={`${
            step === currentStep ? "w-5 h-1.5 bg-[#001B40]" : "w-1.5 h-1.5 bg-neutral-300"
          } rounded-full transition-all`}
        />
      ))}
      <span className="text-[10px] sm:text-xs text-neutral-500 font-medium ml-1">
        Step {currentStep} of 6
      </span>
    </div>
  );

  // ── Back Button ───────────────────────────────────────────────
  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-black mb-3 cursor-pointer w-fit"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      <span>Back</span>
    </button>
  );

  // ── Support Header ────────────────────────────────────────────
  const SupportHeader = () => (
    <div className="w-full flex items-center justify-between lg:justify-end text-xs sm:text-sm text-neutral-600 pb-2 sm:pb-3 pt-1 sm:pt-0">
      <Link href="/" className="lg:hidden flex items-center gap-2">
        <Image
          src="/icons/BFLogoBlue.svg"
          alt="BlueFixx"
          width={26}
          height={26}
          className="w-6 h-6 object-contain"
          priority
        />
        <span className="font-heading font-bold text-base text-[#001B40] tracking-tight">
          BlueFixx
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <span className="hidden xs:inline">Need help?</span>
        <button
          type="button"
          onClick={() => toast("Reach us at support@bluefixxllp.com", { icon: "📧" })}
          className="inline-flex items-center gap-1.5 font-medium text-[#001B40] hover:underline cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-[#001B40]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
          </svg>
          <span className="hidden xs:inline">Contact support</span>
        </button>
      </div>
    </div>
  );

  // ── Step 1 Handler: Create Account ────────────────────────────
  const handleStep1Submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!fullName.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
      if (!phone.trim()) {
        toast.error("Please enter your phone number.");
        return;
      }
      if (!email.trim() || !email.includes("@") || !email.includes(".")) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (!password || password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      if (!agreedToTerms) {
        toast.error("You must agree to the Terms of Use and Privacy Policy.");
        return;
      }

      setRegistrationData({ fullName, phone, email, password });
      setVerificationPhone(phone);
      setPhoneForVerify(phone);
      setIsChannelModalOpen(true);
    },
    [
      fullName, phone, email, password, confirmPassword, agreedToTerms,
      setRegistrationData, setVerificationPhone,
    ]
  );

  // ── Shared Registration Submission (Modal & Step 2) ───────────
  const submitRegistration = useCallback(
    async (rawPhone: string, channel: OtpChannel) => {
      if (!rawPhone.trim()) {
        toast.error("Please enter your phone number.");
        return;
      }

      setIsLoading(true);
      try {
        const payloadPhone = toE164(rawPhone.trim(), countryCode);
        const targetEmail = registrationData.email || email;
        const res = await registerApi({
          fullName: registrationData.fullName || fullName,
          phone: payloadPhone,
          email: targetEmail,
          password: registrationData.password || password,
          acceptedTerms: true,
          channel,
        });

        if (res.challengeId) {
          setChallengeId(res.challengeId);
        }
        setOtpChannel(res.channel || channel);
        setOtpDestination(res.destination || (channel === "EMAIL" ? targetEmail : payloadPhone));

        setVerificationPhone(payloadPhone);
        setIsChannelModalOpen(false);
        setRegistrationStep(3);
        const destinationText = res.destination || (channel === "EMAIL" ? targetEmail : payloadPhone);
        toast.success(res.message || `Verification code sent to ${destinationText}`);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          if (err.code === "SMS_UNAVAILABLE") {
            toast.error("SMS service is currently unavailable. Switched to Email verification.", { duration: 5000 });
            setSelectedChannel("EMAIL");
          } else if (err.code === "EMAIL_UNAVAILABLE") {
            toast.error("Email delivery failed. Try receiving code via SMS instead.");
            setSelectedChannel("SMS");
          } else if (err.code === "OTP_COOLDOWN") {
            toast.error("A code was sent recently. Please wait 60 seconds before requesting a new one.");
          } else if (err.code === "OTP_RATE_LIMIT") {
            toast.error("Too many code requests. Please wait an hour before trying again.");
          } else {
            toast.error(err.message || "Failed to send verification code.");
          }
        } else {
          toast.error("Network error. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      countryCode,
      registrationData,
      fullName,
      email,
      password,
      setIsLoading,
      setChallengeId,
      setOtpChannel,
      setOtpDestination,
      setVerificationPhone,
      setRegistrationStep,
    ]
  );

  // ── Modal Confirm Handler ─────────────────────────────────────
  const handleModalConfirmChannel = useCallback(() => {
    void submitRegistration(phone, selectedChannel);
  }, [submitRegistration, phone, selectedChannel]);

  // ── Step 2 Handler: Send Code (SMS or Email) ─────────────────────
  const handleStep2SendCode = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await submitRegistration(phoneForVerify, selectedChannel);
    },
    [submitRegistration, phoneForVerify, selectedChannel]
  );

  // ── Step 3 Handlers: OTP Entry ────────────────────────────────
  const handleOtpDigitChange = (index: number, value: string) => {
    setOtpError(false);
    const clean = value.replace(/\D/g, "");
    const updated = [...otpDigits];

    if (clean.length > 1) {
      // Pasted full code
      const chars = clean.slice(0, 6).split("");
      chars.forEach((c, i) => {
        updated[i] = c;
      });
      setOtpDigits(updated);
      const nextIndex = Math.min(chars.length, 5);
      digitInputRefs.current[nextIndex]?.focus();
      return;
    }

    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const code = otpDigits.join("");

      if (code.length < 6) {
        toast.error("Please enter all 6 digits of your verification code.");
        return;
      }

      setIsLoading(true);
      try {
        if (!challengeId) {
          toast.error("Verification session expired. Please re-enter your phone number.");
          setRegistrationStep(2);
          return;
        }

        const verifyRes = await verifyPhoneApi({
          challengeId,
          code,
        });

        setVerificationCode(code);
        toast.success(verifyRes.message || "Phone verified successfully!");

        // Auto sign-in to establish access token session
        try {
          await login({
            email: registrationData.email || email,
            password: registrationData.password || password,
          });
        } catch {
          // If login fails right here, continue onboarding
        }

        setRegistrationStep(4);
      } catch (err: unknown) {
        setOtpError(true);
        if (err instanceof ApiError) {
          if (err.code === "CHALLENGE_EXPIRED") {
            toast.error("Verification code has expired. Please request a new one.");
          } else if (err.code === "OTP_INVALID" || err.code === "CHALLENGE_INVALID") {
            toast.error("Invalid verification code. Please check and try again.");
          } else {
            toast.error(err.message || "Invalid verification code.");
          }
        } else {
          toast.error("Failed to verify code. Please check your connection.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      otpDigits,
      challengeId,
      registrationData,
      email,
      password,
      login,
      setIsLoading,
      setVerificationCode,
      setRegistrationStep,
    ]
  );

  const handleResendOtp = useCallback(async () => {
    if (!challengeId) {
      toast.error("Session expired. Please request a new verification code.");
      setRegistrationStep(2);
      return;
    }

    setIsLoading(true);
    try {
      const res = await resendOtpApi({ challengeId });
      setChallengeId(res.challengeId);
      if (res.channel) setOtpChannel(res.channel);
      if (res.destination) setOtpDestination(res.destination);

      const destinationText =
        res.destination ||
        otpDestination ||
        (otpChannel === "EMAIL"
          ? registrationData.email || email
          : verificationPhone || phoneForVerify);
      toast.success(res.message || `New code sent to ${destinationText}`);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError(false);
      digitInputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "OTP_COOLDOWN") {
          toast.error("Please wait 60 seconds before requesting another code.");
        } else if (err.code === "OTP_RATE_LIMIT") {
          toast.error("Rate limit reached. Please wait an hour before requesting another code.");
        } else if (err.code === "SMS_UNAVAILABLE") {
          toast.error("SMS service is currently unavailable. Please go back and select Email verification.");
        } else if (err.code === "EMAIL_UNAVAILABLE") {
          toast.error("Email service is temporarily unavailable.");
        } else {
          toast.error(err.message || "Could not resend code. Please try again.");
        }
      } else {
        toast.error("Could not resend code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    challengeId,
    otpDestination,
    otpChannel,
    registrationData,
    email,
    verificationPhone,
    phoneForVerify,
    setIsLoading,
    setChallengeId,
    setOtpChannel,
    setOtpDestination,
    setRegistrationStep,
  ]);

  // ── Step 4 Handlers: Profile Photo ────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setRegistrationData({ avatarUrl: url });
      toast.success("Photo selected!");
    }
  };

  const handleStep4Continue = useCallback(() => {
    setRegistrationData({ avatarUrl: avatarPreview });
    setRegistrationStep(5);
  }, [avatarPreview, setRegistrationData, setRegistrationStep]);

  const handleStep4Skip = useCallback(() => {
    setRegistrationStep(5);
  }, [setRegistrationStep]);

  // ── Step 5 Handlers: Location ─────────────────────────────────
  const handleUseCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSelectedState("Enugu");
          setSelectedCity("Independence Layout");
          setStreetAddress("14 Ziks Avenue");
          toast.success("Location detected: Enugu, Independence Layout");
        },
        () => {
          setSelectedState("Enugu");
          setSelectedCity("Independence Layout");
          toast("Set default area to Enugu", { icon: "📍" });
        }
      );
    } else {
      setSelectedState("Enugu");
      setSelectedCity("Independence Layout");
    }
  }, []);

  const handleStep5Continue = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedState || !selectedCity) {
        toast.error("Please select your state and city.");
        return;
      }
      setRegistrationData({
        state: selectedState,
        city: selectedCity,
        streetAddress,
      });
      setRegistrationStep(6);
    },
    [selectedState, selectedCity, streetAddress, setRegistrationData, setRegistrationStep]
  );

  // ── Step 6 Handlers: Role Selection ───────────────────────────
  const handleStep6Complete = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const backendRole =
          selectedRole === "artisan"
            ? "ARTISAN"
            : selectedRole === "apprentice"
            ? "LEARNER"
            : "CUSTOMER";

        try {
          await selectRoleApi({ role: backendRole });
        } catch (roleErr) {
          // If already selected or network mismatch, record notice and continue
          console.warn("Role selection note:", roleErr);
        }

        setRegistrationData({ role: selectedRole });
        setActiveRole(selectedRole);

        // Save authenticated user profile to global store
        setUser({
          id: "usr-" + Date.now().toString(36),
          fullName: registrationData.fullName || fullName || "BlueFixx Member",
          email: registrationData.email || email,
          phone: verificationPhone || phone,
          avatarUrl: avatarPreview || undefined,
          state: selectedState,
          city: selectedCity,
          streetAddress,
          role: selectedRole,
          isVerified: true,
        });

        toast.success(
          `Welcome to BlueFixx! You are registered as ${
            selectedRole === "customer"
              ? "a Customer"
              : selectedRole === "artisan"
              ? "an Artisan"
              : "an Apprentice"
          }.`
        );

        // Navigate to role-appropriate destination (first-time Artisan/Apprentice onboarding)
        if (selectedRole === "artisan") {
          router.push("/artisan?view=verification");
        } else if (selectedRole === "apprentice") {
          router.push("/talent/settings/edit-profile?onboarding=1");
        } else {
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          toast.error(err.message || "Failed to complete registration.");
        } else {
          toast.error("Failed to complete registration.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedRole, setIsLoading, setRegistrationData, setActiveRole, setUser,
      registrationData, fullName, email, verificationPhone, phone,
      avatarPreview, selectedState, selectedCity, streetAddress, router,
    ]
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER STEP 1: CREATE ACCOUNT
  // ══════════════════════════════════════════════════════════════
  if (registrationStep === 1) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
        <div className="hidden lg:block lg:w-1/2 min-h-screen">
          <AuthHeroPanel
            image="/images/talents.png"
            imageAlt="Master craftsman teaching apprentice"
            headline="Start with a profile you can trust."
            description="A verified account protects customers, artisans and apprentices — before anyone accepts a job."
            showFooterTags={true}
          />
        </div>

        <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
          <SupportHeader />

          <div className="w-full flex items-center justify-center my-auto py-2 sm:py-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[480px] flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                  GET STARTED
                </span>
                <StepperDots currentStep={1} />
              </div>

              <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
                Create Account
              </h3>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 mb-4 leading-relaxed">
                Set up your BlueFixx account. You can choose how you use the marketplace after verification.
              </p>

              <BackButton onClick={() => router.back()} />

              <form onSubmit={handleStep1Submit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col text-left">
                    <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                      Full name
                    </label>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                      />
                    </div>
                  </div>

                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    placeholder="803 245 0182"
                    label="Phone number"
                  />
                </div>

                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                    Email
                  </label>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col text-left">
                    <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                      Password
                    </label>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-12 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-neutral-700 hover:text-black cursor-pointer"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col text-left">
                    <label className="font-sans font-medium text-xs text-neutral-800 mb-1">
                      Confirm password
                    </label>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-white border border-neutral-300 rounded-xl py-2 pl-9 pr-12 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-neutral-700 hover:text-black cursor-pointer"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-[#001B40] focus:ring-[#001B40]"
                  />
                  <label htmlFor="termsCheckbox" className="text-xs text-neutral-700 cursor-pointer">
                    I agree to the{" "}
                    <a href="#" className="font-semibold text-neutral-900 underline">
                      Terms of Use
                    </a>{" "}
                    and{" "}
                    <a href="#" className="font-semibold text-neutral-900 underline">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-3 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
                >
                  Create Account
                </button>
              </form>

              <div className="text-center text-xs text-neutral-600 mt-4">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-bold text-[#001B40] hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-4" />
        </div>

        <OtpChannelModal
          isOpen={isChannelModalOpen}
          email={email.trim()}
          phone={phone.trim() ? toE164(phone.trim(), countryCode) : ""}
          selectedChannel={selectedChannel}
          onSelectChannel={setSelectedChannel}
          onConfirm={handleModalConfirmChannel}
          onClose={() => setIsChannelModalOpen(false)}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER STEP 2: ACCOUNT VERIFICATION (SMS OR EMAIL CHANNEL)
  // ══════════════════════════════════════════════════════════════
  if (registrationStep === 2) {
    const targetEmail = registrationData.email || email;
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
        <div className="hidden lg:block lg:w-1/2 min-h-screen">
          <AuthHeroPanel
            image="/images/talents.png"
            imageAlt="Service artisan with tools"
            headline="A simple check keeps every marketplace account safer."
            description="Verification helps customers, artisans and apprentices know they are dealing with real people."
            showFooterTags={true}
          />
        </div>

        <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
          <SupportHeader />

          <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[460px] flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                  ACCOUNT VERIFICATION
                </span>
                <StepperDots currentStep={2} />
              </div>

              <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
                Verify your account
              </h3>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-5 leading-relaxed">
                Choose how you would like to receive your 6-digit verification code.
              </p>

              <BackButton onClick={() => setRegistrationStep(1)} />

              <form onSubmit={handleStep2SendCode} className="space-y-4">
                {/* Channel Selector */}
                <div className="space-y-2.5">
                  <label className="font-sans font-medium text-xs text-neutral-800">
                    Verification Method
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Email Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedChannel("EMAIL")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        selectedChannel === "EMAIL"
                          ? "border-[#001B40] bg-blue-50/40 ring-1 ring-[#001B40]"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#001B40] flex items-center justify-center">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedChannel === "EMAIL"
                              ? "border-[#001B40] bg-[#001B40]"
                              : "border-neutral-300"
                          }`}
                        >
                          {selectedChannel === "EMAIL" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
                          Email address
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[170px] mt-0.5">
                          {targetEmail || "Your email inbox"}
                        </div>
                      </div>
                    </button>

                    {/* SMS Option */}
                    <button
                      type="button"
                      onClick={() => setSelectedChannel("SMS")}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        selectedChannel === "SMS"
                          ? "border-[#001B40] bg-blue-50/40 ring-1 ring-[#001B40]"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#001B40] flex items-center justify-center">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedChannel === "SMS"
                              ? "border-[#001B40] bg-[#001B40]"
                              : "border-neutral-300"
                          }`}
                        >
                          {selectedChannel === "SMS" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="font-heading font-bold text-xs sm:text-sm text-[#0F1115]">
                          SMS message
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[170px] mt-0.5">
                          Text to mobile phone
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Phone input (Always required for database profile) */}
                <div className="pt-1">
                  <PhoneInput
                    value={phoneForVerify}
                    onChange={setPhoneForVerify}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    placeholder="803 245 0182"
                    label="Mobile phone number"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Phone number is required for account security and job communications.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Sending code...
                    </span>
                  ) : selectedChannel === "EMAIL" ? (
                    "Send verification code via Email"
                  ) : (
                    "Send verification code via SMS"
                  )}
                </button>
              </form>

              <p className="font-sans text-[11px] text-neutral-400 text-center leading-relaxed mt-4">
                {selectedChannel === "EMAIL"
                  ? "We'll send a 6-digit code to your inbox. Check your spam folder if it doesn't appear immediately."
                  : "Standard SMS operator rates may apply. SMS requires mobile network coverage."}
              </p>
            </div>
          </div>

          <div className="hidden lg:block h-4" />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER STEP 3: VERIFICATION CODE ENTRY (6-DIGIT OTP)
  // ══════════════════════════════════════════════════════════════
  if (registrationStep === 3) {
    const isEmail = otpChannel === "EMAIL";
    const targetDestination =
      otpDestination ||
      (isEmail
        ? registrationData.email || email
        : verificationPhone || "+234 803 245 0182");

    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
        <div className="hidden lg:block lg:w-1/2 min-h-screen">
          <AuthHeroPanel
            image="/images/workers.png"
            imageAlt="Verified service artisans"
            headline="One quick code. One more layer of trust."
            description="Verification protects your messages, payments and marketplace reputation from the start."
            showFooterTags={true}
          />
        </div>

        <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
          <SupportHeader />

          <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[440px] flex flex-col">
              <BackButton onClick={() => setRegistrationStep(2)} />

              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                  {isEmail ? "EMAIL VERIFICATION" : "PHONE VERIFICATION"}
                </span>
                <StepperDots currentStep={3} />
              </div>

              <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
                Verify your account
              </h3>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 mb-5 leading-relaxed">
                Enter the 6-digit code sent to{" "}
                <strong className="font-semibold text-neutral-900">
                  {targetDestination}
                </strong>{" "}
                via {isEmail ? "email" : "SMS"}.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* 6 Individual Code Boxes */}
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        digitInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-full aspect-square rounded-xl text-center text-lg sm:text-xl font-bold transition-all focus:outline-none ${
                        otpError
                          ? "border-2 border-red-500 bg-red-50/50 text-red-900"
                          : digit
                          ? "border-2 border-[#001B40] bg-white text-neutral-900"
                          : "border border-neutral-300 bg-white text-neutral-900 focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                      }`}
                    />
                  ))}
                </div>

                {/* Error Banner when Invalid */}
                {otpError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 pt-1">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>That code is invalid or has expired. Check it and try again.</span>
                  </div>
                )}

                {/* Switch Channel / Edit Contact Option */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChannel(isEmail ? "SMS" : "EMAIL");
                      setRegistrationStep(2);
                    }}
                    className="font-semibold text-[#074292] hover:underline cursor-pointer"
                  >
                    {isEmail ? "Send via SMS instead" : "Send via Email instead"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegistrationStep(2)}
                    className="text-neutral-500 hover:text-neutral-800 hover:underline cursor-pointer"
                  >
                    Change contact details
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify"
                  )}
                </button>

                {/* Resend Code Link */}
                <div className="text-center pt-2">
                  <span className="text-xs text-neutral-500">Didn&apos;t receive a code? </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-xs font-bold text-[#001B40] hover:underline cursor-pointer"
                  >
                    Resend code
                  </button>
                </div>

                {isEmail && (
                  <p className="text-[11px] text-neutral-400 text-center leading-relaxed pt-1">
                    Please check your spam or junk folder if the email doesn&apos;t arrive within a few seconds.
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="hidden lg:block h-4" />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER STEP 4: ADD A PROFILE PHOTO
  // ══════════════════════════════════════════════════════════════
  if (registrationStep === 4) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
        <div className="hidden lg:block lg:w-1/2 min-h-screen">
          <AuthHeroPanel
            image="/images/workers.png"
            imageAlt="Service artisans working together"
            headline="People hire people they can see."
            description="Customers, artisans and apprentices see a real face on every booking and message."
            showFooterTags={true}
          />
        </div>

        <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
          <SupportHeader />

          <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[440px] flex flex-col">
              <BackButton onClick={() => setRegistrationStep(3)} />

              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                  YOUR PROFILE
                </span>
                <StepperDots currentStep={4} />
              </div>

              <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
                Add a profile photo
              </h3>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 mb-6 leading-relaxed">
                A clear face photo builds trust. It appears on your bookings, quotes and messages.
              </p>

              {/* Avatar Graphic with Camera Badge */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 border border-neutral-200 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg
                        className="w-12 h-12 text-neutral-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  {/* Camera Badge */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#001B40] text-white flex items-center justify-center shadow-md hover:bg-[#052F5F] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Upload & Take Photo Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-11 rounded-xl border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="h-11 rounded-xl border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 text-neutral-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Take a photo</span>
                </button>
              </div>

              {/* Photo Checklist */}
              <div className="bg-[#F4F6F9] rounded-2xl p-4 mb-6 space-y-2.5 text-xs text-neutral-700">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Your face is clearly visible and centred</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Good lighting, no sunglasses or filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Just you, no group photos</span>
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleStep4Continue}
                className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none"
              >
                Continue
              </button>

              {/* Skip for now */}
              <button
                type="button"
                onClick={handleStep4Skip}
                className="w-full text-center text-xs font-semibold text-neutral-700 hover:text-black mt-3 cursor-pointer"
              >
                Skip for now
              </button>

              <p className="font-sans text-[11px] text-neutral-400 text-center leading-relaxed mt-4">
                You can change your photo any time in Settings.
              </p>
            </div>
          </div>

          <div className="hidden lg:block h-4" />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER STEP 5: SET YOUR LOCATION
  // ══════════════════════════════════════════════════════════════
  if (registrationStep === 5) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
        <div className="hidden lg:block lg:w-1/2 min-h-screen">
          <AuthHeroPanel
            image="/images/workers.png"
            imageAlt="Service technician"
            headline="Help that is actually nearby."
            description="Your area decides which artisans, jobs and apprenticeships you see first."
            showFooterTags={true}
          />
        </div>

        <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
          <SupportHeader />

          <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[440px] flex flex-col">
              <BackButton onClick={() => setRegistrationStep(4)} />

              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                  YOUR LOCATION
                </span>
                <StepperDots currentStep={5} />
              </div>

              <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
                Set your location
              </h3>

              <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 mb-5 leading-relaxed">
                We use it to show verified artisans and apprenticeships near you.
              </p>

              {/* Use current location button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="w-full h-12 rounded-xl border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 text-neutral-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="22" y1="12" x2="18" y2="12" />
                  <line x1="6" y1="12" x2="2" y2="12" />
                  <line x1="12" y1="6" x2="12" y2="2" />
                  <line x1="12" y1="22" x2="12" y2="18" />
                </svg>
                <span>Use my current location</span>
              </button>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="px-3 text-[11px] font-medium text-neutral-400">or enter your address</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Location Form */}
              <form onSubmit={handleStep5Continue} className="space-y-4">
                {/* State & City Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col text-left">
                    <label className="font-sans font-medium text-xs text-neutral-800 mb-1">State</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 pl-9 pr-8 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#001B40] appearance-none cursor-pointer"
                      >
                        <option value="Enugu">Enugu</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja (FCT)">Abuja (FCT)</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Oyo">Oyo</option>
                        <option value="Anambra">Anambra</option>
                        <option value="Delta">Delta</option>
                        <option value="Kaduna">Kaduna</option>
                        <option value="Kano">Kano</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col text-left">
                    <label className="font-sans font-medium text-xs text-neutral-800 mb-1">City / area</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 pl-9 pr-8 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#001B40] appearance-none cursor-pointer"
                      >
                        <option value="Independence Layout">Independence Layout</option>
                        <option value="New Haven">New Haven</option>
                        <option value="GRA">GRA</option>
                        <option value="Ogui">Ogui</option>
                        <option value="Trans-Ekulu">Trans-Ekulu</option>
                        <option value="Ikeja">Ikeja</option>
                        <option value="Lekki">Lekki</option>
                        <option value="Victoria Island">Victoria Island</option>
                        <option value="Maitama">Maitama</option>
                        <option value="Wuse II">Wuse II</option>
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Street address */}
                <div className="flex flex-col text-left">
                  <label className="font-sans font-medium text-xs text-neutral-800 mb-1">Street address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="14 Ziks Avenue"
                      className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40]"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none mt-2"
                >
                  Continue
                </button>
              </form>

              <p className="font-sans text-[11px] text-neutral-400 text-center leading-relaxed mt-5">
                Your exact address is only shared with an artisan after you book.
              </p>
            </div>
          </div>

          <div className="hidden lg:block h-4" />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // RENDER STEP 6: ROLE SELECTION
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      <div className="hidden lg:block lg:w-1/2 min-h-screen">
        <AuthHeroPanel
          image="/images/workers.png"
          imageAlt="Workers in marketplace"
          headline="One marketplace. Three ways to move forward."
          description="Book reliable help, grow an established trade or learn alongside a Master Artisan."
          showFooterTags={true}
        />
      </div>

      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
        <SupportHeader />

        <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[460px] flex flex-col">
            <BackButton onClick={() => setRegistrationStep(5)} />

            <div className="flex items-center justify-between mb-1">
              <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
                PERSONALISE YOUR EXPERIENCE
              </span>
              <StepperDots currentStep={6} />
            </div>

            <h3 className="font-sans font-bold text-2xl sm:text-[28px] text-[#0F1115] mt-1 tracking-tight">
              How will you use BlueFixx?
            </h3>

            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1 mb-5 leading-relaxed">
              Choose the option that best describes you. You can add another role later.
            </p>

            <form onSubmit={handleStep6Complete} className="space-y-3.5">
              {/* Option 1: Customer */}
              <div
                onClick={() => setSelectedRole("customer")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedRole === "customer"
                    ? "border-[#001B40] bg-blue-50/40 ring-1 ring-[#001B40]"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === "customer" ? "bg-[#001B40] text-white" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-[#0F1115]">I need an artisan</span>
                      {selectedRole === "customer" && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-neutral-500 mt-0.5">
                      Find and book a verified professional for a home or business job.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    selectedRole === "customer"
                      ? "bg-[#001B40] border-[#001B40] text-white"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {selectedRole === "customer" && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Option 2: Artisan */}
              <div
                onClick={() => setSelectedRole("artisan")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedRole === "artisan"
                    ? "border-[#001B40] bg-blue-50/40 ring-1 ring-[#001B40]"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === "artisan" ? "bg-[#001B40] text-white" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-[#0F1115]">I am an artisan</span>
                      {selectedRole === "artisan" && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-neutral-500 mt-0.5">
                      Build your verified profile, receive requests and grow your trade.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    selectedRole === "artisan"
                      ? "bg-[#001B40] border-[#001B40] text-white"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {selectedRole === "artisan" && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Option 3: Apprentice */}
              <div
                onClick={() => setSelectedRole("apprentice")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedRole === "apprentice"
                    ? "border-[#001B40] bg-blue-50/40 ring-1 ring-[#001B40]"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedRole === "apprentice" ? "bg-[#001B40] text-white" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-sm text-[#0F1115]">I want to learn a trade</span>
                      {selectedRole === "apprentice" && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-neutral-500 mt-0.5">
                      Join an apprenticeship, earn certificates and apply for jobs.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    selectedRole === "apprentice"
                      ? "bg-[#001B40] border-[#001B40] text-white"
                      : "border-neutral-300 bg-white"
                  }`}
                >
                  {selectedRole === "apprentice" && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Dynamic CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed mt-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    Saving preferences...
                  </span>
                ) : selectedRole === "customer" ? (
                  "Continue as Customer"
                ) : selectedRole === "artisan" ? (
                  "Continue as Artisan"
                ) : (
                  "Continue as Apprentice"
                )}
              </button>
            </form>

            <p className="font-sans text-[11px] text-neutral-400 text-center leading-relaxed mt-5">
              Your choice changes your dashboard, not your access to BlueFixx.
            </p>
          </div>
        </div>

        <div className="hidden lg:block h-4" />
      </div>
    </div>
  );
}

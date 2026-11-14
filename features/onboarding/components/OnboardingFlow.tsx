"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "./SplashScreen";
import OnboardingHeader from "./OnboardingHeader";
import IntroSlide from "./IntroSlide";
import LanguageSelection from "./LanguageSelection";
import WelcomeSocialSignIn from "./WelcomeSocialSignIn";
import GoogleProfileModal from "./GoogleProfileModal";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { INTRO_SLIDES, SUGGESTED_LANGUAGE, OTHER_LANGUAGES } from "../data/onboarding-data";
import { useAuth } from "@/lib/stores/auth-store";

type OnboardingPhase = "splash" | "intro" | "language" | "welcome";

export default function OnboardingFlow() {
  const router = useRouter();
  const { selectedLanguageId, setSelectedLanguageId, setIntroCompleted } = useAuth();
  const {
    triggerGoogleSignIn,
    isGoogleLoading,
    isProfileModalOpen,
    initialFullName,
    submitGoogleProfile,
    closeProfileModal,
    isFallbackModalOpen,
    fallbackContainerRef,
    closeFallbackModal,
  } = useGoogleAuth();

  const [phase, setPhase] = useState<OnboardingPhase>("splash");
  const [slideIndex, setSlideIndex] = useState(0);

  // Derive selected language display name
  const allLanguages = [SUGGESTED_LANGUAGE, ...OTHER_LANGUAGES];
  const selectedLangObj = allLanguages.find((l) => l.id === selectedLanguageId);
  const selectedLanguageName = selectedLangObj ? selectedLangObj.name : "English";

  // ── Phase handlers ──────────────────────────────────────────

  const handleSplashDone = useCallback(() => {
    setPhase("intro");
    setSlideIndex(0);
  }, []);

  const handleContinueIntro = useCallback(() => {
    if (slideIndex < INTRO_SLIDES.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      setIntroCompleted(true);
      setPhase("language");
    }
  }, [slideIndex, setIntroCompleted]);

  const handleSkipIntro = useCallback(() => {
    setIntroCompleted(true);
    setPhase("language");
  }, [setIntroCompleted]);

  const handleOpenLanguage = useCallback(() => {
    setPhase("language");
  }, []);

  const handleSaveLanguage = useCallback(
    (newLanguageId: string) => {
      if (typeof document !== "undefined") {
        document.cookie = `bluefixx_lang=${newLanguageId};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
        localStorage.setItem("bluefixx_lang", newLanguageId);
      }
      setSelectedLanguageId(newLanguageId);
      setPhase("welcome");
    },
    [setSelectedLanguageId]
  );

  // ── Route to dedicated login/signup pages ───────────────────

  const handleGoToEmailSignIn = useCallback(() => {
    router.push("/login");
  }, [router]);

  const handleGoToSignUp = useCallback(() => {
    router.push("/signup");
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans select-none">
      {/* 1. Splash & Loading Screen */}
      {phase === "splash" && (
        <SplashScreen onComplete={handleSplashDone} autoAdvance={true} durationMs={2800} />
      )}

      {/* 2. Introduction Carousel (Slides 1, 2, 3) */}
      {phase === "intro" && (
        <div className="flex-1 flex flex-col justify-between">
          <OnboardingHeader
            onSkip={handleSkipIntro}
            onOpenLanguage={handleOpenLanguage}
            selectedLanguageName={selectedLanguageName}
          />
          <main className="flex-1 flex items-center">
            <IntroSlide
              slide={INTRO_SLIDES[slideIndex]}
              currentIndex={slideIndex}
              totalSlides={INTRO_SLIDES.length}
              onContinue={handleContinueIntro}
              onDotClick={(idx) => setSlideIndex(idx)}
            />
          </main>
        </div>
      )}

      {/* 3. Language Selection Screen */}
      {phase === "language" && (
        <LanguageSelection
          currentLanguageId={selectedLanguageId}
          onSave={handleSaveLanguage}
          onBackToIntro={() => {
            setPhase("intro");
            setSlideIndex(0);
          }}
        />
      )}

      {/* 4. Welcome & Social Sign-In Screen */}
      {phase === "welcome" && (
        <WelcomeSocialSignIn
          onContinueWithEmail={handleGoToEmailSignIn}
          onGoToSignUp={handleGoToSignUp}
          onGoogleSignIn={triggerGoogleSignIn}
          isGoogleLoading={isGoogleLoading}
        />
      )}

      {/* Google Sign-In Fallback Modal (when One Tap is suppressed) */}
      {isFallbackModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={closeFallbackModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="google-fallback-modal-title"
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-neutral-200/90 shadow-xl w-full max-w-[380px] flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              id="google-fallback-modal-title"
              className="font-sans font-bold text-lg text-[#0F1115]"
            >
              Continue with Google
            </h4>
            <p className="font-sans text-xs text-neutral-600 mt-1 mb-5">
              Click the button below to sign in with your Google account.
            </p>
            <div ref={fallbackContainerRef} className="min-h-[44px] flex items-center justify-center" />
            <button
              type="button"
              onClick={closeFallbackModal}
              className="mt-5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* New Google User Profile Completion Modal */}
      {isProfileModalOpen && (
        <GoogleProfileModal
          key={initialFullName}
          isOpen={isProfileModalOpen}
          isLoading={isGoogleLoading}
          initialFullName={initialFullName}
          onSubmit={submitGoogleProfile}
          onClose={closeProfileModal}
        />
      )}
    </div>
  );
}

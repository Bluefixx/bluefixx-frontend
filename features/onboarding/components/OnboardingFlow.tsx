"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "./SplashScreen";
import OnboardingHeader from "./OnboardingHeader";
import IntroSlide from "./IntroSlide";
import LanguageSelection from "./LanguageSelection";
import WelcomeSocialSignIn from "./WelcomeSocialSignIn";
import { INTRO_SLIDES, SUGGESTED_LANGUAGE, OTHER_LANGUAGES } from "../data/onboarding-data";
import { useAuth } from "@/lib/stores/auth-store";

type OnboardingPhase = "splash" | "intro" | "language" | "welcome";

export default function OnboardingFlow() {
  const router = useRouter();
  const { selectedLanguageId, setSelectedLanguageId, setIntroCompleted } = useAuth();

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
        />
      )}
    </div>
  );
}

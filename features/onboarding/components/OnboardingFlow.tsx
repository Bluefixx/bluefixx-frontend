"use client";

import React, { useState } from "react";
import SplashScreen from "./SplashScreen";
import OnboardingHeader from "./OnboardingHeader";
import IntroSlide from "./IntroSlide";
import LanguageSelection from "./LanguageSelection";
import { INTRO_SLIDES, SUGGESTED_LANGUAGE, OTHER_LANGUAGES } from "../data/onboarding-data";
import { OnboardingStep } from "../types";

interface OnboardingFlowProps {
  initialStep?: OnboardingStep;
  initialSlideIndex?: number;
}

export default function OnboardingFlow({
  initialStep = "splash",
  initialSlideIndex = 0,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [slideIndex, setSlideIndex] = useState<number>(initialSlideIndex);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("en");
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  // Helper to find language display name
  const allLanguages = [SUGGESTED_LANGUAGE, ...OTHER_LANGUAGES];
  const selectedLangObj = allLanguages.find((l) => l.id === selectedLanguageId);
  const selectedLanguageName = selectedLangObj ? selectedLangObj.name : "English";

  // Navigation Handlers
  const handleSplashDone = () => {
    setStep("intro");
    setSlideIndex(0);
  };

  const handleContinueIntro = () => {
    if (slideIndex < INTRO_SLIDES.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      // Reached end of intro slides -> proceed to Language Selection
      setStep("language");
    }
  };

  const handleSkipIntro = () => {
    setStep("language");
  };

  const handleOpenLanguage = () => {
    setStep("language");
  };

  const handleSaveLanguage = (newLanguageId: string) => {
    setSelectedLanguageId(newLanguageId);
    const chosen = allLanguages.find((l) => l.id === newLanguageId)?.name || newLanguageId;
    setCompletedMessage(`Language preference set to ${chosen}. Onboarding completed!`);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col relative font-sans">
      {/* Top Preview Navigator Toolbar for easy switching between all 5 screens */}
      <nav
        aria-label="Screen preview bar"
        className="w-full bg-neutral-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-50 border-b border-neutral-800"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-300">Screen Preview:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setStep("splash");
                setCompletedMessage(null);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                step === "splash"
                  ? "bg-primary-500 text-white font-medium"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              1. Splash
            </button>
            <button
              onClick={() => {
                setStep("intro");
                setSlideIndex(0);
                setCompletedMessage(null);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                step === "intro" && slideIndex === 0
                  ? "bg-primary-500 text-white font-medium"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              2. Intro: Verified
            </button>
            <button
              onClick={() => {
                setStep("intro");
                setSlideIndex(1);
                setCompletedMessage(null);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                step === "intro" && slideIndex === 1
                  ? "bg-primary-500 text-white font-medium"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              3. Intro: Book
            </button>
            <button
              onClick={() => {
                setStep("intro");
                setSlideIndex(2);
                setCompletedMessage(null);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                step === "intro" && slideIndex === 2
                  ? "bg-primary-500 text-white font-medium"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              4. Intro: Careers
            </button>
            <button
              onClick={() => {
                setStep("language");
                setCompletedMessage(null);
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                step === "language"
                  ? "bg-primary-500 text-white font-medium"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              5. Language Selection
            </button>
          </div>
        </div>

        <a
          href="/"
          className="text-neutral-400 hover:text-white underline underline-offset-2 ml-auto"
        >
          &larr; Back to Foundation
        </a>
      </nav>

      {/* Completion Toast / Alert if user saved */}
      {completedMessage && (
        <div className="bg-green-100 border-b border-green-200 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-green-800 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-green-700" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{completedMessage}</span>
        </div>
      )}

      {/* SCREEN 1: Splash and loading */}
      {step === "splash" && (
        <SplashScreen onComplete={handleSplashDone} autoAdvance={true} durationMs={2800} />
      )}

      {/* SCREEN 2, 3, 4: Introduction Carousel */}
      {step === "intro" && (
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

      {/* SCREEN 5: Language Selection */}
      {step === "language" && (
        <LanguageSelection
          currentLanguageId={selectedLanguageId}
          onSave={handleSaveLanguage}
          onBackToIntro={() => {
            setStep("intro");
            setSlideIndex(0);
          }}
        />
      )}
    </div>
  );
}

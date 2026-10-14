"use client";

import React, { useState } from "react";
import SplashScreen from "./SplashScreen";
import OnboardingHeader from "./OnboardingHeader";
import IntroSlide from "./IntroSlide";
import LanguageSelection from "./LanguageSelection";
import WelcomeSocialSignIn from "./WelcomeSocialSignIn";
import EmailSignIn from "./EmailSignIn";
import CreateAccount from "./CreateAccount";
import PhoneVerification from "./PhoneVerification";
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
  const [registeredPhone, setRegisteredPhone] = useState<string>("+234 803 245");

  // Helper to find selected language display name
  const allLanguages = [SUGGESTED_LANGUAGE, ...OTHER_LANGUAGES];
  const selectedLangObj = allLanguages.find((l) => l.id === selectedLanguageId);
  const selectedLanguageName = selectedLangObj ? selectedLangObj.name : "English";

  // Flow Navigation Handlers
  const handleSplashDone = () => {
    setStep("intro");
    setSlideIndex(0);
  };

  const handleContinueIntro = () => {
    if (slideIndex < INTRO_SLIDES.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      // Finished 3 intro slides -> advance to Language selection
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
    // Move to Welcome and Social sign-in
    setStep("welcome");
  };

  const handleGoToEmailSignIn = () => {
    setStep("email-signin");
  };

  const handleGoToSignUp = () => {
    setStep("create-account");
  };

  const handleBackToWelcome = () => {
    setStep("welcome");
  };

  const handleCreateAccountSuccess = (userData: { fullName: string; phone: string; email: string }) => {
    if (userData.phone) {
      setRegisteredPhone(userData.phone);
    }
    // Proceed to Step 2 of 6: Phone verification
    setStep("phone-verify");
  };

  const handleBackToCreateAccount = () => {
    setStep("create-account");
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans select-none">
      {/* 1. Splash & Loading Screen */}
      {step === "splash" && (
        <SplashScreen onComplete={handleSplashDone} autoAdvance={true} durationMs={2800} />
      )}

      {/* 2. Introduction Carousel (Slides 1, 2, 3) */}
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

      {/* 3. Language Selection Screen */}
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

      {/* 4. Welcome & Social Sign-In Screen */}
      {step === "welcome" && (
        <WelcomeSocialSignIn
          onContinueWithEmail={handleGoToEmailSignIn}
          onGoToSignUp={handleGoToSignUp}
        />
      )}

      {/* 5. Email Sign-In Screen */}
      {step === "email-signin" && (
        <EmailSignIn
          onBack={handleBackToWelcome}
          onGoToSignUp={handleGoToSignUp}
          onSuccess={() => alert("Logged in successfully! Welcome to BlueFixx.")}
        />
      )}

      {/* 6. Create Account Screen (Step 1 of 6) */}
      {step === "create-account" && (
        <CreateAccount
          onBack={handleBackToWelcome}
          onGoToSignIn={handleGoToEmailSignIn}
          onSubmitSuccess={handleCreateAccountSuccess}
        />
      )}

      {/* 7. Phone Verification Screen (Step 2 of 6) */}
      {step === "phone-verify" && (
        <PhoneVerification
          initialPhoneNumber={registeredPhone}
          onBack={handleBackToCreateAccount}
          onSendCode={() => {
            alert("Verification code sent via SMS.");
          }}
        />
      )}
    </div>
  );
}

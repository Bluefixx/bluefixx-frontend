"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { SUGGESTED_LANGUAGE, OTHER_LANGUAGES } from "../data/onboarding-data";

interface LanguageSelectionProps {
  currentLanguageId?: string;
  onSave?: (languageId: string) => void;
  onBackToIntro?: () => void;
}

export default function LanguageSelection({
  currentLanguageId = "en",
  onSave,
  onBackToIntro,
}: LanguageSelectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguageId);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // All combined languages
  const allLanguages = useMemo(() => {
    return [SUGGESTED_LANGUAGE, ...OTHER_LANGUAGES];
  }, []);

  // Filtered options for the "ALL LANGUAGES" grid
  const filteredOtherLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return OTHER_LANGUAGES;
    return allLanguages.filter((lang) =>
      lang.name.toLowerCase().includes(q)
    );
  }, [searchQuery, allLanguages]);

  const handleSave = () => {
    if (onSave) {
      onSave(selectedLanguage);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between py-4 px-4 sm:px-8 lg:px-12 border-b border-neutral-100 bg-white z-20">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/logoMain.svg"
            alt="BlueFixx Logo"
            width={100}
            height={32}
            priority
            className="h-8 sm:h-9 w-auto object-contain cursor-pointer"
            onClick={onBackToIntro}
          />
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
          <span>Need help?</span>
          <button
            onClick={() => alert("Support: support@bluefixxllp.com")}
            className="inline-flex items-center gap-1.5 font-medium text-[#001B40] hover:underline cursor-pointer"
          >
            {/* Headset Support Icon */}
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
            <span>Contact support</span>
          </button>
        </div>
      </header>

      {/* Main Two-Panel Section */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Panel: Hero Graphic with bottom gradient */}
        <div className="relative min-h-[360px] lg:min-h-full w-full bg-neutral-900 overflow-hidden select-none flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <Image
            src="/images/customers.png"
            alt="Artisan and customer in community"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />

          {/* Dark Overlay Gradient for Readable Text */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#00132B]/95 via-[#001B40]/40 to-transparent"
            aria-hidden="true"
          />

          {/* Top Logo placeholder on mobile if needed */}
          <div className="relative z-10" />

          {/* Bottom Narrative Callout */}
          <div className="relative z-10 max-w-lg">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white mb-4">
              <svg
                className="w-3.5 h-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="font-sans font-bold text-[10px] sm:text-[11px] tracking-wider uppercase">
                VERIFIED SERVICE MARKETPLACE
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-sans font-bold text-2xl sm:text-3xl lg:text-[34px] leading-snug text-white tracking-tight mb-2.5">
              Local expertise, in the language that feels natural.
            </h2>

            {/* Subtitle */}
            <p className="font-sans text-xs sm:text-sm text-neutral-200 leading-relaxed max-w-md">
              BlueFixx is built for the communities we serve, so every booking and agreement stays clear.
            </p>
          </div>
        </div>

        {/* Right Panel: Language Selection Modal/Card */}
        <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-neutral-100/50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 card-shadow-mobile border border-neutral-200/80 w-full max-w-[440px] flex flex-col">
            {/* Header Category Tag */}
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              LANGUAGE
            </span>

            {/* Headline */}
            <h3 className="font-sans font-bold text-2xl sm:text-[26px] text-[#0F1115] mt-1 tracking-tight">
              Choose the language
            </h3>

            {/* Subtext */}
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-6">
              Select your preferred language below. This helps us tailor your BlueFixx experience.
            </p>

            {/* Suggested Language Section */}
            {!searchQuery && (
              <div className="mb-5">
                <span className="block font-sans font-bold text-[11px] tracking-wider text-neutral-500 uppercase mb-2">
                  SUGGESTED LANGUAGE
                </span>

                <div
                  onClick={() => setSelectedLanguage(SUGGESTED_LANGUAGE.id)}
                  className={`rounded-xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                    selectedLanguage === SUGGESTED_LANGUAGE.id
                      ? "bg-[#E6EFFB] border border-[#001B40]"
                      : "bg-white border border-neutral-300 hover:border-neutral-400"
                  }`}
                  role="radio"
                  aria-checked={selectedLanguage === SUGGESTED_LANGUAGE.id}
                  tabIndex={0}
                >
                  {/* Clean text label without flag */}
                  <span className="font-sans font-semibold text-sm sm:text-base text-neutral-900">
                    {SUGGESTED_LANGUAGE.name}
                  </span>

                  {/* Radio Icon */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      selectedLanguage === SUGGESTED_LANGUAGE.id
                        ? "border-2 border-[#001B40] bg-[#001B40]"
                        : "border-2 border-neutral-300 bg-white"
                    }`}
                  >
                    {selectedLanguage === SUGGESTED_LANGUAGE.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* All Languages Section */}
            <div className="flex-1">
              <span className="block font-sans font-bold text-[11px] tracking-wider text-neutral-500 uppercase mb-2">
                ALL LANGUAGES
              </span>

              {/* Search languages input */}
              <div className="relative w-full mb-3">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search languages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#001B40] focus:ring-1 focus:ring-[#001B40] transition-colors"
                />
              </div>

              {/* Languages Grid (2 Columns, NO flags) */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredOtherLanguages.map((lang) => {
                  const isChecked = selectedLanguage === lang.id;
                  return (
                    <div
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang.id)}
                      className={`rounded-xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "bg-[#E6EFFB] border border-[#001B40]"
                          : "bg-white border border-neutral-300 hover:border-neutral-400"
                      }`}
                      role="radio"
                      aria-checked={isChecked}
                      tabIndex={0}
                    >
                      <span className="font-sans font-semibold text-xs sm:text-sm text-neutral-900">
                        {lang.name}
                      </span>

                      {/* Radio indicator */}
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          isChecked
                            ? "border-2 border-[#001B40] bg-[#001B40]"
                            : "border-2 border-neutral-300 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredOtherLanguages.length === 0 && (
                <p className="text-xs text-neutral-500 text-center py-4">
                  No languages match your search.
                </p>
              )}
            </div>

            {/* Save Changes CTA Button */}
            <button
              onClick={handleSave}
              className="w-full h-12 mt-6 rounded-xl bg-[#001B40] hover:bg-[#052F5F] active:scale-[0.99] text-white font-sans font-semibold text-sm sm:text-base transition-all shadow-sm cursor-pointer select-none"
            >
              Save changes
            </button>

            {/* Footer Notice */}
            <div className="flex items-center justify-center gap-1.5 text-neutral-500 text-[11px] sm:text-xs mt-3.5">
              <svg
                className="w-3.5 h-3.5 text-neutral-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>You can change this later in Settings.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

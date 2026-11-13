"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useTranslations } from "@/components/shared/LanguageProvider";
import AuthHeroPanel from "./AuthHeroPanel";
import { SUGGESTED_LANGUAGE, OTHER_LANGUAGES } from "../data/onboarding-data";

interface LanguageSelectionProps {
  currentLanguageId?: string;
  onSave?: (languageId: string) => void;
  onBackToIntro?: () => void;
}

export default function LanguageSelection({
  currentLanguageId = "en",
  onSave,
}: LanguageSelectionProps) {
  const t = useTranslations("onboarding.language");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguageId);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allLanguages = useMemo(() => {
    return [SUGGESTED_LANGUAGE, ...OTHER_LANGUAGES];
  }, []);

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Panel: Hero Graphic covering 100% full height to the top (desktop only) */}
      <div className="hidden lg:block lg:w-1/2 min-h-screen">
        <AuthHeroPanel
          image="/images/customers.png"
          imageAlt="Artisan and customer in community"
          headline="Local expertise, in the language that feels natural."
          description="BlueFixx is built for the communities we serve, so every booking and agreement stays clear."
          showFooterTags={false}
        />
      </div>

      {/* Right Panel: Support link at top, centered selection card */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-12 bg-white">
        {/* Support Header: Brand logo on mobile + Contact support */}
        <div className="w-full flex items-center justify-between lg:justify-end text-xs sm:text-sm text-neutral-600 pb-2 sm:pb-4 pt-1 sm:pt-0">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Image
              src="/icons/BFLogoBlue.svg"
              alt="BlueFixx"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
              priority
            />
            <span className="font-heading font-bold text-lg text-[#001B40] tracking-tight">
              BlueFixx
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden xs:inline">Need help?</span>
            <button
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
              <span>Contact support</span>
            </button>
          </div>
        </div>

        {/* Center Card */}
        <div className="w-full flex items-center justify-center my-auto py-2 sm:py-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-neutral-200/90 sm:card-shadow-mobile w-full max-w-[440px] flex flex-col">
            {/* Header Category Tag */}
            <span className="font-sans font-bold text-[11px] tracking-[0.16em] text-[#001B40] uppercase">
              {t("tag")}
            </span>

            {/* Headline */}
            <h3 className="font-sans font-bold text-2xl sm:text-[26px] text-[#0F1115] mt-1 tracking-tight">
              {t("title")}
            </h3>

            {/* Subtext */}
            <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-1.5 mb-6">
              {t("subtitle")}
            </p>

            {/* Suggested Language Section */}
            {!searchQuery && (
              <div className="mb-5">
                <span className="block font-sans font-bold text-[11px] tracking-wider text-neutral-500 uppercase mb-2">
                  {t("suggestedLabel")}
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
                  {/* Clean text label without flag as explicitly requested */}
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
                {t("allLabel")}
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
                  placeholder={t("searchPlaceholder")}
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
              {t("saveButton")}
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
              <span>{t("changeHint")}</span>
            </div>
          </div>
        </div>

        {/* Bottom spacing to keep vertical balance */}
        <div className="hidden lg:block h-4" />
      </div>
    </div>
  );
}

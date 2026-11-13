"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useLanguage, useTranslations, SupportedLocale } from "@/components/shared/LanguageProvider";

interface ArtisanLanguageSettingsViewProps {
  onBack: () => void;
  onLanguageSaved?: (lang: string) => void;
}

interface LanguageOption {
  id: SupportedLocale;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: "en", name: "English", nativeName: "English" },
  { id: "ig", name: "Igbo", nativeName: "Asụsụ Igbo" },
  { id: "ha", name: "Hausa", nativeName: "Harshen Hausa" },
  { id: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá" },
  { id: "pcm", name: "Nigerian Pidgin", nativeName: "Pidgin" },
];

export function ArtisanLanguageSettingsView({
  onBack,
  onLanguageSaved,
}: ArtisanLanguageSettingsViewProps) {
  const t = useTranslations("settings.language");
  const { locale, setLocale, isSaving } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLocale>(locale);

  const handleSave = async () => {
    const langObj = LANGUAGES.find((l) => l.id === selectedLanguage);
    try {
      await setLocale(selectedLanguage);
      toast.success(t("saved", { language: langObj?.name || "English" }));
      if (onLanguageSaved) {
        onLanguageSaved(selectedLanguage);
      }
    } catch {
      toast.error("Failed to update language");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 select-none animate-in fade-in duration-200 space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-2 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#001B40] tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Language Options Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-neutral-200/80 shadow-xs divide-y divide-neutral-100">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelectedLanguage(lang.id)}
              className="w-full py-4 px-3 flex items-center justify-between hover:bg-neutral-50/60 rounded-2xl transition-colors cursor-pointer text-left"
            >
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#0F1115]">
                  {lang.name}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {lang.nativeName}
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-[#001B40] bg-white"
                    : "border-neutral-300 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#001B40]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-[#001B40] hover:bg-[#074292] disabled:opacity-50 text-white font-sans font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          {isSaving ? "Saving..." : t("saveButton")}
        </button>
      </div>
    </div>
  );
}

export default ArtisanLanguageSettingsView;

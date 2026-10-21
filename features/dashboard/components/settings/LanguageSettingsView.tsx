"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/stores/auth-store";

interface LanguageSettingsViewProps {
  onBack: () => void;
}

interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
}

export function LanguageSettingsView({ onBack }: LanguageSettingsViewProps) {
  const { selectedLanguageId, setSelectedLanguageId } = useAuth();
  const [selectedLang, setSelectedLang] = useState<string>(selectedLanguageId || "en");
  const [searchQuery, setSearchQuery] = useState("");

  const languages: LanguageOption[] = [
    { id: "en", name: "English", nativeName: "English (Nigeria)", flag: "🇳🇬" },
    { id: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", flag: "🇳🇬" },
    { id: "yo", name: "Yorùbá", nativeName: "Èdè Yorùbá", flag: "🇳🇬" },
    { id: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "🇳🇬" },
    { id: "pcm", name: "Nigerian Pidgin", nativeName: "Naijá Pidgin", flag: "🇳🇬" },
  ];

  const filteredLanguages = languages.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSelectedObj = languages.find((l) => l.id === selectedLang) || languages[0];

  const handleSave = () => {
    setSelectedLanguageId(selectedLang);
    toast.success(`Language preference set to ${currentSelectedObj.name}`);
    onBack();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Breadcrumb & Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-800 transition-colors mb-2 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Settings</span>
        </button>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#001B40]">
          Language
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1">
          Choose your preferred language for Bluefixx.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#001B40]">
              Choose the language
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select your preferred language below. This changes what you see.
            </p>
          </div>

          {/* Selected Banner Box (matching Figma) */}
          <div className="p-4 rounded-2xl bg-[#EBF1F7]/80 border border-blue-100 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-neutral-600">
              You selected <strong className="text-[#001B40] font-bold">{currentSelectedObj.name} ({currentSelectedObj.flag} Nigeria)</strong>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          {/* Search and Language List */}
          <div className="space-y-3">
            <label className="block font-heading font-bold text-xs sm:text-sm text-[#001B40]">
              All Languages
            </label>

            {/* Search Input */}
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search languages"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm placeholder:text-neutral-400 text-neutral-800 focus:outline-hidden focus:border-[#001B40] transition-colors"
              />
            </div>

            {/* Radio Items */}
            <div className="space-y-2 pt-1">
              {filteredLanguages.map((lang) => {
                const isChecked = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLang(lang.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? "border-[#001B40] bg-blue-50/30 shadow-2xs"
                        : "border-neutral-200/80 hover:bg-neutral-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#001B40] block">
                          {lang.name}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          {lang.nativeName}
                        </span>
                      </div>
                    </div>

                    {/* Radio indicator circle */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isChecked
                          ? "border-[#001B40] bg-[#001B40]"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {isChecked && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 bg-[#001B40] hover:bg-[#074292] text-white font-bold text-xs sm:text-sm rounded-xl text-center transition-colors shadow-sm cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </div>

        {/* Right Info Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#001B40]">
            Your language preference
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your selected language is used throughout the Bluefixx app.
          </p>
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-600">
            <span className="font-bold text-[#001B40]">{currentSelectedObj.name}</span> is currently selected.
          </div>
        </div>
      </div>
    </div>
  );
}

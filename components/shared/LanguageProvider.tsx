"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { updateAccountProfileApi } from "@/lib/api/account";
import { useAuth } from "@/lib/stores/auth-store";

import enMessages from "@/i18n/messages/en.json";
import igMessages from "@/i18n/messages/ig.json";
import haMessages from "@/i18n/messages/ha.json";
import yoMessages from "@/i18n/messages/yo.json";
import pcmMessages from "@/i18n/messages/pcm.json";

export type SupportedLocale = "en" | "ig" | "ha" | "yo" | "pcm";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "ig", "ha", "yo", "pcm"];

type TranslationTree = { [key: string]: string | TranslationTree };

const MESSAGES: Record<SupportedLocale, TranslationTree> = {
  en: enMessages as TranslationTree,
  ig: igMessages as TranslationTree,
  ha: haMessages as TranslationTree,
  yo: yoMessages as TranslationTree,
  pcm: pcmMessages as TranslationTree,
};

interface LanguageContextValue {
  locale: SupportedLocale;
  setLocale: (id: SupportedLocale) => Promise<void>;
  isSaving: boolean;
  t: (keyPath: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getNestedValue(obj: TranslationTree, path: string): string | undefined {
  const parts = path.split(".");
  let current: TranslationTree | string | undefined = obj;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}) {
  const { accessToken, selectedLanguageId, setSelectedLanguageId } = useAuth();

  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (typeof window !== "undefined") {
      const fromStorage = localStorage.getItem("bluefixx_lang") as SupportedLocale | null;
      if (fromStorage && SUPPORTED_LOCALES.includes(fromStorage)) {
        return fromStorage;
      }
      const match = document.cookie.match(/(?:^|;\s*)bluefixx_lang=([^;]+)/);
      const fromCookie = match?.[1] as SupportedLocale | undefined;
      if (fromCookie && SUPPORTED_LOCALES.includes(fromCookie)) {
        return fromCookie;
      }
    }
    if (initialLocale && SUPPORTED_LOCALES.includes(initialLocale)) {
      return initialLocale;
    }
    return (selectedLanguageId as SupportedLocale) || "en";
  });

  const [prevSelectedLanguageId, setPrevSelectedLanguageId] = useState(selectedLanguageId);
  if (
    selectedLanguageId &&
    SUPPORTED_LOCALES.includes(selectedLanguageId as SupportedLocale) &&
    selectedLanguageId !== prevSelectedLanguageId
  ) {
    setPrevSelectedLanguageId(selectedLanguageId);
    setLocaleState(selectedLanguageId as SupportedLocale);
  }

  const [isSaving, setIsSaving] = useState(false);

  const setLocale = useCallback(
    async (id: SupportedLocale) => {
      setIsSaving(true);
      try {
        if (typeof document !== "undefined") {
          document.cookie = `bluefixx_lang=${id};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
          localStorage.setItem("bluefixx_lang", id);
          document.documentElement.lang = id;
        }
        setSelectedLanguageId(id);
        setLocaleState(id);

        if (accessToken) {
          try {
            await updateAccountProfileApi({ language: id });
          } catch (err) {
            console.error("Failed to update language on backend:", err);
          }
        }
      } finally {
        setIsSaving(false);
      }
    },
    [accessToken, setSelectedLanguageId]
  );

  const t = useCallback(
    (keyPath: string, variables?: Record<string, string | number>): string => {
      const activeDict = MESSAGES[locale] || MESSAGES.en;
      let val = getNestedValue(activeDict, keyPath);
      if (!val && locale !== "en") {
        val = getNestedValue(MESSAGES.en, keyPath);
      }
      if (!val) {
        return keyPath;
      }

      if (variables) {
        return val.replace(/\{(\w+)\}/g, (_, k) =>
          variables[k] !== undefined ? String(variables[k]) : `{${k}}`
        );
      }
      return val;
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isSaving,
      t,
    }),
    [locale, setLocale, isSaving, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

export function useTranslations(namespace?: string) {
  const { t } = useLanguage();
  return useCallback(
    (key: string, variables?: Record<string, string | number>) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return t(fullKey, variables);
    },
    [t, namespace]
  );
}

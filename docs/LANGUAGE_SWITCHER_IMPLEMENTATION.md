# Language Switcher Implementation Guide

This document describes the language switcher and lightweight i18n system currently implemented in `bluefixx-frontend`. It is intended to be forwarded to a frontend developer so they can reproduce the same behavior in another frontend codebase.

## 1. What was implemented

The app uses a **client-side React Context + JSON dictionary** approach. It is not route-based i18n and does not use `next-intl`.

Supported locales:

| Locale ID | Language | Native/display name used in UI |
|---|---|---|
| `en` | English | English / English (Nigeria) |
| `ig` | Igbo | Igbo / Asụsụ Igbo |
| `ha` | Hausa | Hausa / Harshen Hausa |
| `yo` | Yorùbá | Yorùbá / Èdè Yorùbá |
| `pcm` | Nigerian Pidgin | Nigerian Pidgin / Naijá Pidgin or Pidgin |

The selected locale is stored in three places:

1. `localStorage` key: `bluefixx_lang`
2. Cookie: `bluefixx_lang=<locale>; path=/; max-age=31536000; SameSite=Lax`
3. Auth/application state: `selectedLanguageId`

When the user is authenticated and changes language from Settings, the app also calls:

```http
PATCH /account
```

with:

```json
{
  "language": "ig"
}
```

There is no locale prefix in URLs. `/settings`, `/dashboard`, etc. remain the same regardless of language.

## 2. File inventory

Core implementation files:

- `i18n/messages/en.json`
- `i18n/messages/ig.json`
- `i18n/messages/ha.json`
- `i18n/messages/yo.json`
- `i18n/messages/pcm.json`
- `components/shared/LanguageProvider.tsx`
- `app/layout.tsx`
- `components/shared/AuthProvider.tsx`
- `lib/stores/auth-store.ts`
- `lib/api/account.ts`
- `features/onboarding/data/onboarding-data.ts`
- `features/onboarding/components/OnboardingFlow.tsx`
- `features/onboarding/components/LanguageSelection.tsx`
- `features/onboarding/components/OnboardingHeader.tsx`
- `features/dashboard/components/settings/LanguageSettingsView.tsx`
- `features/dashboard/components/artisan/ArtisanLanguageSettingsView.tsx`
- `features/dashboard/components/settings/SettingsOverviewView.tsx`
- `features/dashboard/components/DashboardSidebar.tsx`
- `features/dashboard/components/AccountMenuDropdown.tsx`

The zip package contains the message JSON files plus reference copies of the implementation files under `reference/`.

## 3. Required project setup

### 3.1 TypeScript JSON imports

The provider imports JSON directly. Ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

This project also uses the `@/*` alias:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

If the target project does not use `@/*`, change imports accordingly.

### 3.2 No external i18n dependency

No package installation is required. The implementation uses only React, TypeScript, and JSON imports.

## 4. Message catalog structure

Create `i18n/messages/` and add one JSON file per locale. The current files each contain the same 96 flattened keys.

Top-level namespaces currently used:

```text
i18n/messages/
├── en.json
├── ig.json
├── ha.json
├── yo.json
└── pcm.json
```

Example shape:

```json
{
  "nav": {
    "home": "Home",
    "settings": "Settings",
    "language": "Language"
  },
  "settings": {
    "language": {
      "title": "Language",
      "subtitle": "Choose your preferred language for Bluefixx.",
      "saveButton": "Save changes",
      "saved": "Language updated to {language}"
    }
  },
  "onboarding": {
    "language": {
      "title": "Choose the language",
      "saveButton": "Save changes"
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

Interpolation uses simple `{variable}` placeholders:

```ts
t("saved", { language: "Igbo" })
// "Language updated to Igbo"
```

Rules:

- Keep the same nested key structure in every locale file.
- English (`en.json`) is the fallback dictionary.
- Missing keys in another locale fall back to English.
- If a key is missing in English too, the raw key path is returned.
- Do not translate language names inside the JSON unless the product explicitly wants that; the current UI intentionally displays native language names from the option arrays.

## 5. Create `LanguageProvider`

Create `components/shared/LanguageProvider.tsx`.

The canonical implementation is bundled in the zip at:

```text
reference/components/shared/LanguageProvider.tsx
```

Use that file verbatim if the target project has the same auth store shape. Important exports:

```ts
export type SupportedLocale = "en" | "ig" | "ha" | "yo" | "pcm";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "ig", "ha", "yo", "pcm"];

export function LanguageProvider({ children, initialLocale = "en" }) { ... }

export function useLanguage(): LanguageContextValue { ... }

export function useTranslations(namespace?: string) { ... }
```

### Provider behavior

`LanguageProvider`:

- Imports all five JSON catalogs.
- Builds a `MESSAGES` record keyed by locale.
- Initializes locale from, in order:
  1. `localStorage.bluefixx_lang`
  2. `document.cookie` value `bluefixx_lang`
  3. `initialLocale` prop
  4. auth store `selectedLanguageId`
  5. fallback `"en"`
- Watches `selectedLanguageId` from auth state. If it changes to a supported locale, the provider updates its internal locale.
- Exposes:
  - `locale`
  - `setLocale(locale)`
  - `isSaving`
  - `t(keyPath, variables?)`
- `setLocale()`:
  - writes the cookie
  - writes `localStorage`
  - updates `document.documentElement.lang`
  - updates auth `selectedLanguageId`
  - updates React state
  - calls `updateAccountProfileApi({ language: id })` when `accessToken` exists
- `t()`:
  - resolves dot-separated paths such as `settings.language.title`
  - falls back to English if the active locale lacks the key
  - returns the key path if no translation exists
  - replaces `{variable}` placeholders

### Minimal usage

```tsx
"use client";

import { useTranslations } from "@/components/shared/LanguageProvider";

export function Example() {
  const t = useTranslations("settings.language");

  return <h1>{t("title")}</h1>;
}
```

Or without a namespace:

```tsx
const { t } = useLanguage();
t("nav.settings");
```

## 6. Mount the provider in the root layout

`LanguageProvider` depends on `useAuth()`, so it must be inside `AuthProvider`.

In `app/layout.tsx`:

```tsx
import AuthProvider from "@/components/shared/AuthProvider";
import ToastProvider from "@/components/shared/ToastProvider";
import { LanguageProvider } from "@/components/shared/LanguageProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <ToastProvider />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

Important: `LanguageProvider` is a client component. Components calling `useLanguage()` or `useTranslations()` must also be client components or be wrapped by a client leaf component.

## 7. Sync language with auth state

`selectedLanguageId` already exists in the auth store. The implementation extends it so onboarding and auth can share the same selection.

### 7.1 Auth store state

In `lib/stores/auth-store.ts`, the state includes:

```ts
selectedLanguageId: string;
```

Default:

```ts
selectedLanguageId: "en"
```

Actions include:

```ts
setSelectedLanguageId: (id: string) => void;
```

### 7.2 AuthProvider initialization

In `components/shared/AuthProvider.tsx`, initialize `selectedLanguageId` from storage/cookie on the client:

```ts
const [selectedLanguageId, setSelectedLanguageId] = useState<string>(() => {
  if (typeof window !== "undefined") {
    const fromStorage = localStorage.getItem("bluefixx_lang");
    if (fromStorage) return fromStorage;

    const match = document.cookie.match(/(?:^|;\s*)bluefixx_lang=([^;]+)/);
    if (match?.[1]) return match[1];
  }

  return DEFAULT_AUTH_STATE.selectedLanguageId;
});
```

### 7.3 Hydrate language from the account profile

After `getAccountProfileApi()` resolves, the current implementation checks:

```ts
const langFromProfile =
  (res as any)?.settings?.language ||
  (res as any)?.language ||
  u.language;

if (langFromProfile && typeof document !== "undefined") {
  const currentCookie = document.cookie.match(
    /(?:^|;\s*)bluefixx_lang=([^;]+)/
  )?.[1];

  if (currentCookie !== langFromProfile) {
    document.cookie = `bluefixx_lang=${langFromProfile};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    localStorage.setItem("bluefixx_lang", langFromProfile);
    setSelectedLanguageId(langFromProfile);
  }
}
```

This lets a returning authenticated user see their saved backend language.

## 8. Onboarding language selection

There are two onboarding pieces:

1. `features/onboarding/data/onboarding-data.ts`
2. `features/onboarding/components/LanguageSelection.tsx`
3. `features/onboarding/components/OnboardingFlow.tsx`

### 8.1 Language option data

Current data:

```ts
export const SUGGESTED_LANGUAGE: LanguageOption = {
  id: "en",
  name: "English",
  isSuggested: true,
};

export const OTHER_LANGUAGES: LanguageOption[] = [
  { id: "ig", name: "Igbo" },
  { id: "ha", name: "Hausa" },
  { id: "yo", name: "Yorùbá" },
  { id: "pcm", name: "Pidgin" },
];
```

### 8.2 Save behavior

`LanguageSelection` does not call `setLocale()` directly. It calls its `onSave` prop with the selected ID.

`OnboardingFlow` handles persistence:

```ts
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
```

Because `LanguageProvider` watches `selectedLanguageId`, updating auth state also updates the active translation dictionary.

The onboarding screen itself is translated through:

```ts
const t = useTranslations("onboarding.language");
```

Translated onboarding keys include:

- `tag`
- `title`
- `subtitle`
- `suggestedLabel`
- `allLabel`
- `searchPlaceholder`
- `saveButton`
- `changeHint`

## 9. Settings language switcher

There are two settings implementations:

- Customer/general: `features/dashboard/components/settings/LanguageSettingsView.tsx`
- Artisan: `features/dashboard/components/artisan/ArtisanLanguageSettingsView.tsx`

Both use the same provider methods:

```ts
const t = useTranslations("settings.language");
const { locale, setLocale, isSaving } = useLanguage();
const [selectedLang, setSelectedLang] = useState<SupportedLocale>(locale);
```

Customer settings option shape:

```ts
interface LanguageOption {
  id: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}
```

Current customer list:

```ts
const languages: LanguageOption[] = [
  { id: "en", name: "English", nativeName: "English (Nigeria)", flag: "🇳🇬" },
  { id: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", flag: "🇳🇬" },
  { id: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "🇳🇬" },
  { id: "yo", name: "Yorùbá", nativeName: "Èdè Yorùbá", flag: "🇳🇬" },
  { id: "pcm", name: "Nigerian Pidgin", nativeName: "Naijá Pidgin", flag: "🇳🇬" },
];
```

Artisan settings list is simpler and has no flags:

```ts
const LANGUAGES: LanguageOption[] = [
  { id: "en", name: "English", nativeName: "English" },
  { id: "ig", name: "Igbo", nativeName: "Asụsụ Igbo" },
  { id: "ha", name: "Hausa", nativeName: "Harshen Hausa" },
  { id: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá" },
  { id: "pcm", name: "Nigerian Pidgin", nativeName: "Pidgin" },
];
```

Save handler pattern:

```ts
const handleSave = async () => {
  try {
    await setLocale(selectedLang);
    toast.success(t("saved", { language: currentSelectedObj.name }));
  } catch {
    toast.error("Failed to update language");
  }
};
```

The button should use `isSaving` for loading/disabled state:

```tsx
<button
  type="button"
  disabled={isSaving}
  onClick={handleSave}
>
  {isSaving ? "Saving..." : t("saveButton")}
</button>
```

The customer view also has a search input that filters by `name` and `nativeName`.

## 10. Translating existing UI

Use namespaced translation hooks in client components:

```tsx
const t = useTranslations("nav");
```

Then replace hardcoded strings:

```tsx
// Before
<span>Settings</span>
<span>Language</span>
<span>Log out</span>

// After
<span>{t("settings")}</span>
<span>{t("language")}</span>
<span>{t("logOut")}</span>
```

Examples already integrated:

- `DashboardSidebar.tsx` uses `useTranslations("nav")` for navigation labels.
- `AccountMenuDropdown.tsx` uses `useTranslations("nav")` for profile/settings/logout.
- `SettingsOverviewView.tsx` uses `useTranslations("settings.overview")`.
- `LanguageSettingsView.tsx` and `ArtisanLanguageSettingsView.tsx` use `useTranslations("settings.language")`.
- `LanguageSelection.tsx` uses `useTranslations("onboarding.language")`.

Only the strings represented in `i18n/messages/*.json` are translated. Many page-level strings remain hardcoded English and can be migrated incrementally by adding keys to every locale file and replacing JSX text with `t("key")`.

## 11. Backend persistence

`LanguageProvider` calls `updateAccountProfileApi()` from `lib/api/account.ts`:

```ts
await updateAccountProfileApi({ language: id });
```

The API helper sends:

```ts
PATCH /account
{
  "language": payload.language || "en"
}
```

Relevant types in `types/customer.ts`:

```ts
export interface AccountProfile {
  language?: string;
}

export interface UpdateAccountRequest {
  language?: string;
}
```

Current caveat: `updateAccountProfileApi()` always includes `language`, defaulting to `"en"` when the caller does not provide one. Some existing profile update callers do not pass the current locale, so a profile save can unintentionally reset the backend language to English. When adapting this guide, prefer only including `language` when it is explicitly provided, or pass the active locale from every profile update caller.

## 12. Adding a new language

To add a locale, for example `fr`:

1. Create `i18n/messages/fr.json`.
2. Copy the structure from `en.json`.
3. Translate every key. Keep placeholders such as `{language}` unchanged.
4. Update `LanguageProvider.tsx`:

```ts
import frMessages from "@/i18n/messages/fr.json";

export type SupportedLocale = "en" | "ig" | "ha" | "yo" | "pcm" | "fr";
export const SUPPORTED_LOCALES: SupportedLocale[] = [
  "en",
  "ig",
  "ha",
  "yo",
  "pcm",
  "fr",
];

const MESSAGES: Record<SupportedLocale, TranslationTree> = {
  en: enMessages as TranslationTree,
  ig: igMessages as TranslationTree,
  ha: haMessages as TranslationTree,
  yo: yoMessages as TranslationTree,
  pcm: pcmMessages as TranslationTree,
  fr: frMessages as TranslationTree,
};
```

5. Add the language to every UI option array:
   - onboarding `OTHER_LANGUAGES`
   - customer `LanguageSettingsView`
   - artisan `ArtisanLanguageSettingsView`
6. Confirm the backend accepts the new `language` value.
7. Verify all locale JSON files have identical keys.

## 13. Verification checklist

After integrating:

- [ ] `i18n/messages/*.json` files are valid JSON.
- [ ] Every locale has the same flattened key set as `en.json`.
- [ ] `resolveJsonModule` is enabled.
- [ ] `LanguageProvider` is mounted inside `AuthProvider` in the root layout.
- [ ] Onboarding selection writes `bluefixx_lang` to localStorage and cookie.
- [ ] Settings save calls `setLocale()` and shows the translated success toast.
- [ ] Authenticated users call `PATCH /account` with `{ "language": "<locale>" }`.
- [ ] Returning users hydrate language from localStorage/cookie/account profile.
- [ ] Sidebar, settings overview, onboarding language screen, and language settings screen update without a page reload.
- [ ] Missing translations fall back to English instead of crashing.
- [ ] `document.documentElement.lang` is updated when `setLocale()` is used.

Suggested checks:

```bash
npm run lint
npm run build
```

Manual smoke test:

1. Open onboarding.
2. Select Hausa or Pidgin.
3. Continue to welcome/login.
4. Open Settings → Language.
5. Confirm the selected language is preselected.
6. Change language and save.
7. Confirm sidebar/settings text changes immediately.
8. Refresh the page and confirm the selection persists.
9. Log out/in and confirm the backend profile language is restored when authenticated.

## 14. Current implementation caveats

These are behaviors of the current implementation. Decide whether to preserve or improve them in the target project.

- Language is client-state driven; there are no `/en`, `/ig`, etc. routes.
- Initial HTML still has `<html lang="en">`; the client provider updates `document.documentElement.lang` only when `setLocale()` runs.
- Onboarding and profile hydration update localStorage/cookie/auth state but do not explicitly update `document.documentElement.lang`.
- All dictionaries are imported into the client bundle. This is fine for five small files, but a larger catalog set may need dynamic imports or a server-backed translation service.
- `setLocale()` catches backend update errors internally, so the UI can still report success even if `PATCH /account` fails.
- `updateAccountProfileApi()` currently defaults `language` to `"en"` when omitted, which can overwrite a saved preference during unrelated profile updates.
- Language names and native names are hardcoded in option arrays and are not translated by the JSON catalogs.
- Some UI strings remain hardcoded English because only selected surfaces have been migrated to `t()`.
- `LanguageSelection` uses `div` elements with `role="radio"`; if adapting it, consider using real radio inputs/buttons for stronger keyboard accessibility.

## 15. Bundle contents

`bluefixx-language-switcher-handoff.zip` contains:

```text
LANGUAGE_SWITCHER_IMPLEMENTATION.md
messages/
  en.json
  ig.json
  ha.json
  yo.json
  pcm.json
reference/
  app/layout.tsx
  components/shared/AuthProvider.tsx
  components/shared/LanguageProvider.tsx
  features/onboarding/components/LanguageSelection.tsx
  features/onboarding/components/OnboardingFlow.tsx
  features/onboarding/components/OnboardingHeader.tsx
  features/onboarding/data/onboarding-data.ts
  features/dashboard/components/DashboardSidebar.tsx
  features/dashboard/components/AccountMenuDropdown.tsx
  features/dashboard/components/settings/LanguageSettingsView.tsx
  features/dashboard/components/settings/SettingsOverviewView.tsx
  features/dashboard/components/artisan/ArtisanLanguageSettingsView.tsx
  lib/api/account.ts
  lib/stores/auth-store.ts
  types/customer.ts
```

Use `messages/` as the translation source and `reference/` as the exact implementation reference.

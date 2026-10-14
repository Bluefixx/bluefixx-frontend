# Component Inventory

This document tracks all reusable UI components implemented in `bluefixx-frontend`.

*Rule: Do not add speculative components. Only document components that exist in the codebase.*

---

## 1. UI Primitives (`components/ui/`)

### `Button`
- **File**: `components/ui/Button.tsx`
- **Category**: Primitive
- **Purpose**: Primary interactive call-to-action supporting official Bluefixx button styles and states.
- **Props**:
  - `variant?: "solid" | "outlined" | "white"` (default: `"solid"`)
  - `size?: "giant" | "large" | "medium" | "small" | "tiny"` (default: `"medium"`)
  - `isLoading?: boolean` (renders spinner and sets `aria-busy`)
  - `disabled?: boolean`
  - Extends standard `React.ButtonHTMLAttributes<HTMLButtonElement>`
- **Used In**: Shared UI components

### `Input`
- **File**: `components/ui/Input.tsx`
- **Category**: Primitive
- **Purpose**: Accessible form input with integrated label, error message, helper text, and optional start icon.
- **Props**:
  - `label: string`
  - `error?: string`
  - `helperText?: string`
  - `startIcon?: React.ReactNode`
  - `containerClassName?: string`
  - Extends standard `React.InputHTMLAttributes<HTMLInputElement>`
- **Used In**: Shared form components

### `TextArea`
- **File**: `components/ui/TextArea.tsx`
- **Category**: Primitive
- **Purpose**: Accessible multi-line textarea with label, error display, and token styling.
- **Props**:
  - `label: string`
  - `error?: string`
  - `helperText?: string`
  - `rows?: number` (default: 4)
  - `containerClassName?: string`
  - Extends standard `React.TextareaHTMLAttributes<HTMLTextAreaElement>`
- **Used In**: Shared form components

### `Card` (Family: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`)
- **File**: `components/ui/Card.tsx`
- **Category**: Primitive
- **Purpose**: Composable surface card containers with token borders, shadows, and paddings.
- **Props**:
  - `variant?: "default" | "elevated" | "outlined"`
  - Extends standard `React.HTMLAttributes<HTMLDivElement>`
- **Used In**: Shared UI components

### `Badge`
- **File**: `components/ui/Badge.tsx`
- **Category**: Primitive
- **Purpose**: Compact status and metadata pill badge.
- **Props**:
  - `variant?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error"`
  - `size?: "small" | "medium"`
  - Extends standard `React.HTMLAttributes<HTMLSpanElement>`
- **Used In**: Shared UI components

---

## 2. Feedback Components (`components/feedback/`)

### `EmptyState`
- **File**: `components/feedback/EmptyState.tsx`
- **Category**: Feedback
- **Purpose**: Renders zero-data states with optional icon, title, description, and action button.
- **Props**: `title: string`, `description?: string`, `icon?: React.ReactNode`, `actionLabel?: string`, `onAction?: () => void`
- **Used In**: Lists, search results, zero-contract screens

### `ErrorDisplay`
- **File**: `components/feedback/ErrorDisplay.tsx`
- **Category**: Feedback
- **Purpose**: Inline error alert block with accessible alert role and retry callback.
- **Props**: `title?: string`, `message: string`, `onRetry?: () => void`
- **Used In**: Failed query sections, form error banners

---

## 3. Feature Components (`features/onboarding/`)

### `SplashScreen`
- **File**: `features/onboarding/components/SplashScreen.tsx`
- **Purpose**: Splash screen with dark `#001B40` background, exact Figma organic diagonal swooping curves, white logo mark, headline, and animated circular spinner.
- **Props**: `onComplete?: () => void`, `autoAdvance?: boolean`, `durationMs?: number`
- **Used In**: Onboarding Flow

### `OnboardingHeader`
- **File**: `features/onboarding/components/OnboardingHeader.tsx`
- **Purpose**: Header with BlueFixx logo, "Skip introduction" button, and Language pill selector.
- **Props**: `onSkip?: () => void`, `onOpenLanguage?: () => void`, `selectedLanguageName?: string`
- **Used In**: Onboarding Flow (Introduction Carousel)

### `IntroSlide`
- **File**: `features/onboarding/components/IntroSlide.tsx`
- **Purpose**: Two-column layout for value proposition slides with artwork, top-left verified badge, bottom-left stat card, overline tag, headline, body, callout box, 3-dot step indicator, and Continue button.
- **Props**: `slide: IntroSlideData`, `currentIndex: number`, `totalSlides: number`, `onContinue: () => void`, `onDotClick: (index: number) => void`
- **Used In**: Onboarding Flow (Introduction Carousel)

### `AuthHeroPanel`
- **File**: `features/onboarding/components/AuthHeroPanel.tsx`
- **Purpose**: Full-height left hero visual column used across Language Selection and Sign-In/Up screens. Extends 100% to the top with the white BlueFixx logo positioned directly inside the image, verified badge, bottom narrative, and verification tags.
- **Props**: `image: string`, `imageAlt: string`, `headline: string`, `description: string`, `badgeLabel?: string`, `showFooterTags?: boolean`
- **Used In**: `LanguageSelection`, `WelcomeSocialSignIn`, `EmailSignIn`, `CreateAccount`, `PhoneVerification`

### `LanguageSelection`
- **File**: `features/onboarding/components/LanguageSelection.tsx`
- **Purpose**: Split layout screen with left full-height hero narrative and right elevated card for selecting English, Igbo, Hausa, Yorùbá, or Pidgin without flags. Supports real-time search.
- **Props**: `currentLanguageId?: string`, `onSave?: (id: string) => void`, `onBackToIntro?: () => void`
- **Used In**: Onboarding Flow

### `WelcomeSocialSignIn`
- **File**: `features/onboarding/components/WelcomeSocialSignIn.tsx`
- **Purpose**: Welcome screen with Google, Apple, and Email sign-in options, security encryption disclaimer, and Sign Up link.
- **Props**: `onContinueWithEmail: () => void`, `onGoToSignUp: () => void`
- **Used In**: Onboarding Flow

### `EmailSignIn`
- **File**: `features/onboarding/components/EmailSignIn.tsx`
- **Purpose**: Email sign-in form with email format validation, password visibility toggle, remember me, forgot password, and exact invalid email error state styling (`1 field needs attention`, red outline, error helper).
- **Props**: `onBack: () => void`, `onGoToSignUp: () => void`, `onSuccess?: () => void`
- **Used In**: Onboarding Flow

### `CreateAccount`
- **File**: `features/onboarding/components/CreateAccount.tsx`
- **Purpose**: Registration form (Step 1 of 6) with Stepper indicator, Full Name, Phone, Email, Password, Confirm Password, Terms checkbox, and Log In link.
- **Props**: `onBack: () => void`, `onGoToSignIn: () => void`, `onSubmitSuccess: (userData) => void`
- **Used In**: Onboarding Flow

### `PhoneVerification`
- **File**: `features/onboarding/components/PhoneVerification.tsx`
- **Purpose**: Phone verification screen (Step 2 of 6) with Stepper indicator, phone input with country code formatting, and SMS dispatch trigger.
- **Props**: `initialPhoneNumber?: string`, `onBack: () => void`, `onSendCode: (phone) => void`
- **Used In**: Onboarding Flow

### `OnboardingFlow`
- **File**: `features/onboarding/components/OnboardingFlow.tsx`
- **Purpose**: Master coordinator controlling step transitions and progression across all 7 screens without any artificial preview headers.
- **Props**: `initialStep?: OnboardingStep`, `initialSlideIndex?: number`
- **Used In**: `app/page.tsx` & `app/onboarding/page.tsx`

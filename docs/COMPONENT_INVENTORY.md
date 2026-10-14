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
- **Used In**: `app/page.tsx`, `components/feedback/EmptyState.tsx`, `components/feedback/ErrorDisplay.tsx`

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
- **Used In**: `app/page.tsx`

### `Badge`
- **File**: `components/ui/Badge.tsx`
- **Category**: Primitive
- **Purpose**: Compact status and metadata pill badge.
- **Props**:
  - `variant?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error"`
  - `size?: "small" | "medium"`
  - Extends standard `React.HTMLAttributes<HTMLSpanElement>`
- **Used In**: `app/page.tsx`

---

## 2. Feedback Components (`components/feedback/`)

### `EmptyState`
- **File**: `components/feedback/EmptyState.tsx`
- **Category**: Feedback
- **Purpose**: Renders zero-data states with optional icon, title, description, and action button.
- **Props**:
  - `title: string`
  - `description?: string`
  - `icon?: React.ReactNode`
  - `actionLabel?: string`
  - `onAction?: () => void`
  - `className?: string`
- **Used In**: Lists, search results, zero-contract screens

### `ErrorDisplay`
- **File**: `components/feedback/ErrorDisplay.tsx`
- **Category**: Feedback
- **Purpose**: Inline error alert block with accessible alert role and retry callback.
- **Props**:
  - `title?: string`
  - `message: string`
  - `onRetry?: () => void`
  - `className?: string`
- **Used In**: Failed query sections, form error banners

---

## 3. Feature Components (`features/`)

### `SplashScreen`
- **File**: `features/onboarding/components/SplashScreen.tsx`
- **Category**: Feature (`onboarding`)
- **Purpose**: Splash screen with dark `#001B40` background, brand curves, white logo mark, headline, and animated circular spinner.
- **Props**: `onComplete?: () => void`, `autoAdvance?: boolean`, `durationMs?: number`
- **Used In**: `/onboarding`

### `OnboardingHeader`
- **File**: `features/onboarding/components/OnboardingHeader.tsx`
- **Category**: Feature (`onboarding`)
- **Purpose**: Header with BlueFixx logo, "Skip introduction" button, and Language pill selector.
- **Props**: `onSkip?: () => void`, `onOpenLanguage?: () => void`, `selectedLanguageName?: string`
- **Used In**: `/onboarding`

### `IntroSlide`
- **File**: `features/onboarding/components/IntroSlide.tsx`
- **Category**: Feature (`onboarding`)
- **Purpose**: Two-column layout for value proposition slides with artwork, top-left verified badge, bottom-left stat card, overline tag, headline, body, callout box, 3-dot step indicator, and Continue button.
- **Props**: `slide: IntroSlideData`, `currentIndex: number`, `totalSlides: number`, `onContinue: () => void`, `onDotClick: (index: number) => void`
- **Used In**: `/onboarding`

### `LanguageSelection`
- **File**: `features/onboarding/components/LanguageSelection.tsx`
- **Category**: Feature (`onboarding`)
- **Purpose**: Split layout screen with left handshake hero narrative and right elevated card for selecting English, Igbo, Hausa, Yorùbá, or Pidgin without flags. Supports real-time search.
- **Props**: `currentLanguageId?: string`, `onSave?: (id: string) => void`, `onBackToIntro?: () => void`
- **Used In**: `/onboarding`

### `OnboardingFlow`
- **File**: `features/onboarding/components/OnboardingFlow.tsx`
- **Category**: Feature (`onboarding`)
- **Purpose**: Master coordinator controlling step transitions, slide progression, language state, and preview bar.
- **Props**: `initialStep?: OnboardingStep`, `initialSlideIndex?: number`
- **Used In**: `app/onboarding/page.tsx`

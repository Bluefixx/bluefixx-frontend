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
- **Purpose**: Master coordinator controlling step transitions and progression across Onboarding phases (Splash -> Intro -> Language Selection -> Welcome).
- **Props**: None (reads language and progression from `useAuth`)
- **Used In**: `app/page.tsx` & `app/onboarding/page.tsx`

### `LoginPage`
- **File**: `features/onboarding/components/LoginPage.tsx`
- **Purpose**: Dedicated sign-in page (`/login`) featuring full-height hero artwork, real-time email format validation, password visibility toggling, "Remember me", link to `/forgot-password`, link to `/signup`, toast notifications, and `useAuth` user session storage.
- **Props**: None
- **Used In**: `app/login/page.tsx`

### `SignupPage`
- **File**: `features/onboarding/components/SignupPage.tsx`
- **Purpose**: Dedicated multi-step registration flow (`/signup`) covering all 6 steps from Figma:
  1. *Create Account* (Name, phone, email, password, terms agreement)
  2. *Phone Verification (Number entry)* (SMS dispatch)
  3. *Verification Code Entry* (6 individual OTP boxes, backspace support, invalid code handling, resend)
  4. *Add a profile photo* (Avatar preview, upload/take photo actions, guideline checklist, skip option)
  5. *Set your location* (Current location detection, state/city dropdowns, street address)
  6. *Personalise experience / Role selection* (Customer, Artisan, Apprentice selection cards with dynamic CTA)
- **Props**: None
- **Used In**: `app/signup/page.tsx`

### `ForgotPasswordPage`
- **File**: `features/onboarding/components/ForgotPasswordPage.tsx`
- **Purpose**: Dedicated account recovery page (`/forgot-password`) with phone entry, SMS reset code timer info, 6-digit code entry, password reset fields, and return to sign in.
- **Props**: None
- **Used In**: `app/forgot-password/page.tsx`

---

## 4. Providers & Global State (`components/shared/`, `lib/stores/`)

### `AuthProvider` & `useAuth`
- **File**: `components/shared/AuthProvider.tsx`, `lib/stores/auth-store.ts`
- **Purpose**: Global authentication and onboarding registration state management context. Tracks user session, registration steps, OTP status, language selection, and user profile data pending backend API availability.
- **Used In**: `app/layout.tsx`

### `ToastProvider`
- **File**: `components/shared/ToastProvider.tsx`
- **Purpose**: App-wide notification toasts powered by `react-hot-toast` with brand styling (`#001B40`, rounded-xl, details shadow).
- **Used In**: `app/layout.tsx`

---

## 5. Dashboard Components (`features/dashboard/`)

### `DashboardSidebar`
- **File**: `features/dashboard/components/DashboardSidebar.tsx`
- **Purpose**: Primary dashboard navigation sidebar featuring brand logo, navigation links (`Home`, `Explore`, `Post a Job`, `Bookings`, `Messages`, `Profile`), and bottom user profile card and settings.
- **Used In**: `app/dashboard/layout.tsx`

### `DashboardHeader`
- **File**: `features/dashboard/components/DashboardHeader.tsx`
- **Purpose**: Top dashboard header with interactive location selector, user type toggle button (`↕`), notification bell with orange pip, wallet balance display, and avatar dropdown trigger.
- **Used In**: `app/dashboard/layout.tsx`

### `UserRoleSwitcherModal`
- **File**: `features/dashboard/components/UserRoleSwitcherModal.tsx`
- **Purpose**: Modal to switch active profile between Customer, Artisan, and Apprentice. Enforces the rule that an Apprentice account cannot switch to Artisan unless training is completed, while Customer access is always available.
- **Used In**: `app/dashboard/layout.tsx`, `features/dashboard/components/ApprenticeHomeView.tsx`

### `AccountMenuDropdown`
- **File**: `features/dashboard/components/AccountMenuDropdown.tsx`
- **Purpose**: User profile dropdown menu opened from avatar, displaying user name, role, links to profile, settings, and logout action.
- **Used In**: `features/dashboard/components/DashboardHeader.tsx`

### `CustomerHomeView`
- **File**: `features/dashboard/components/CustomerHomeView.tsx`
- **Purpose**: Home dashboard for customers featuring search card with popular tags, wallet balance, escrow protection, 7-day warranty cards, quick action banner, categorized service cards, and verified artisan cards.
- **Used In**: `app/dashboard/page.tsx`

### `ArtisanHomeView`
- **File**: `features/dashboard/components/ArtisanHomeView.tsx`
- **Purpose**: Home dashboard for artisans featuring job lead stats, earnings summary, rating, open customer job requests in their area, and quote submission actions.
- **Used In**: `app/dashboard/page.tsx`

### `ApprenticeHomeView`
- **File**: `features/dashboard/components/ApprenticeHomeView.tsx`
- **Purpose**: Home dashboard for apprentices featuring current curriculum progress, master artisan mentorship info, practical hours tracker, and graduation simulation controller.
- **Used In**: `app/dashboard/page.tsx`

### `BrowseServicesView`
- **File**: `features/dashboard/components/BrowseServicesView.tsx`
- **Purpose**: Marketplace discovery interface featuring category filters, search input, and service grid with starting prices and direct quote request triggers.
- **Used In**: `app/dashboard/explore/page.tsx`

### `PostJobWizard`
- **File**: `features/dashboard/components/PostJobWizard.tsx`
- **Purpose**: 8-step service request wizard (Service, Details, Photos & voice, Budget, Address, Preferred time, Review, Job live) with interactive task chips, live summary preview, and problem description. Features device photo uploads with remove actions, audio recording with MediaRecorder and playback, urgency selector pills, and verified checkmark badge.
- **Used In**: `app/(dashboard)/post-job/page.tsx`

### `JobPostingsView`
- **File**: `features/dashboard/components/JobPostingsView.tsx`
- **Purpose**: Comprehensive view for managing posted jobs and viewing incoming quotes. Supports:
  - Empty state (`media_1792270117606.png`) with calendar icon and `+ Post a job` button.
  - Posted jobs list view showing active postings with status pills (`Receiving quotes`, `No quotes yet`, `Expired`).
  - Job detail view with 3 design states:
    1. `receiving-quotes`: 3 quote cards (Emeka Okafor, Blessing Nwankwo, Chidi Nweze), uploaded job details, photos, 9-step timeline, and protection notice.
    2. `no-quotes-yet`: Warning banner, `No quotes yet` card, `Manage posting` actions, `Matching activity` stats.
    3. `expired`: 14-day limit notice, `This posting has expired` card, `Manage posting`, `Listing summary` stats.
  - Cancel Job Dialog Modal (`media_1792270182127.png`) with reason selection presets and detail textarea for cancellation reason.
### `CompareQuotesView`
- **File**: `features/dashboard/components/CompareQuotesView.tsx`
- **Purpose**: Quote comparison interface matching `media_1792437256603.png`. Features 7-day Bluefixx warranty banner, sorting/filter pills (`Recommended`, `Lowest price`, `Highest rated`, `Closest`, `Fastest`), side-by-side artisan quote cards with labor and material breakdowns, Quote Detail Dialog (`media_1792437315267.png`), and Accept Quote Dialog (`media_1792437355974.png`).
- **Used In**: `features/dashboard/components/JobPostingsView.tsx`

### `QuoteAcceptedView`
- **File**: `features/dashboard/components/QuoteAcceptedView.tsx`
- **Purpose**: Confirmation screen for accepted artisan quote matching `media_1792437409407.png`. Displays paper plane badge, total agreed amount, job summary table (Customer, Job, Submitted, Amount, Completion time, Warranty), and action buttons `Continue to Payment` and `View Job`.
- **Used In**: `features/dashboard/components/JobPostingsView.tsx`

### `ArtisanPublicProfileView`
- **File**: `features/dashboard/components/ArtisanPublicProfileView.tsx`
- **Purpose**: Artisan public profile view matching `media_1792437458303.png`, `media_1792439474717.png`, `media_1792439523516.png`, `media_1792439614969.png`, and `media_1792439655096.png`. Features:
  - Dark blue hero banner with avatar, trade, experience, Expert Artisan gold badge, trust score, and key stats (Rating 4.9, Jobs done 318, Replies in 8m).
  - **About Tab**: Biography, verified completed jobs, same-day availability, and written warranty highlights.
  - **Services Tab**: Indicative price list for leak repair, water heater install, re-piping, and pump servicing, with escrow negotiation notice.
  - **Portfolio Tab**: Project gallery with an immersive, full-screen **Lightbox Modal** supporting keyboard navigation (left/right/escape), prev/next controls, location metadata, and zoom styling.
  - **Reviews Tab**: Customer review cards (Tunde A., Okeke O.) with star ratings, quality tags (`On time`, `Neat work`, `Fair price`), and attached repair photos.
  - **Verification Tab**: Multi-tier status cards (`Verified Artisan`, `Certified Professional`, `Expert Artisan`, `Master Artisan [Not attained]`) with NIN/BVN and trade assessment status.
  - Right sticky action card with `Available today` badge, `Continue` button (accepts quote), and `Message` button (routes to `/messages`).
- **Used In**: `features/dashboard/components/JobPostingsView.tsx`



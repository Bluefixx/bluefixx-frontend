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

### `SecureJobPaymentView`
- **File**: `features/dashboard/components/SecureJobPaymentView.tsx`
- **Purpose**: Escrow payment and job scheduling workflow matching `media_1792531657923.png`, `media_1792531765288.png`, `media_1792531808352.png`, `media_1792531843952.png`, and `media_1792531872000.png`. Features:
  - **Secure Your Job**: 7-day warranty banner, Job summary card, selectable Payment source options (Bluefixx Wallet, Fund Wallet, Paystack), Escrow protection guarantee, and Payment summary card with Labour/Materials/Total and `Continue` trigger. (Payment option card omitted per instructions).
  - **Enter Transaction PIN Modal**: Clean 4-digit PIN input with auto-focus and auto-advance (numeric keypad omitted per user instructions) and `Continue to payment` action.
  - **Payment Secured Screen**: Navy lock badge, total amount, transaction summary (Job, Artisan, Transaction ID TXN-639890, Amount, Paid in full, Timestamp), artisan notification banner, and `Continue to Schedule` action.
  - **Schedule Job Screen**: Schedule confirmation card (Artisan, Customer, Date, Time slot), artisan proposed time notice, stylized interactive map location preview card, and `Confirm Schedule` CTA.
  - **Job Scheduled Screen**: Navy calendar badge, `"Job Scheduled"` title, live/interactive countdown card (`Starts in 21h 19m`), location pill, and `View Job` button.
- **Used In**: `features/dashboard/components/JobPostingsView.tsx`, `app/(dashboard)/bookings/page.tsx`

### `JobProgressTrackerView`
- **File**: `features/dashboard/components/JobProgressTrackerView.tsx`
- **Purpose**: Live Job Progress Tracker and Milestone Completion flow matching `media_17925368...png` through `media_17925372...png`:
  - **Job tracker: scheduled**: `< My jobs` breadcrumb, job title & subtitle, status badges (`Scheduled`, `Payment Secured`), `Safety` badge, 7-day warranty banner, `Assigned professional` card (Emeka Okafor ★ 4.9, `Message Emeka`), `Job details` card (specs, location, date, urgency), `Photos` card (damp patch, pipe joint), `Additional information` Q&A, and `Work updates` feed.
  - **Right Sidebar Cards**: 9-step timeline (`Job posted` → `Receiving quotes` → `Quote accepted` → `Payment secured` → `Job scheduled` → `Artisan arrived` → `Work in progress` → `Completed by artisan` → `Payment released`), `Payment summary` card (Labour ₦80,000, Materials ₦40,000, Total ₦120,000, 3.5% escrow fee), `Location` card with interactive map placeholder, and `Job actions` card with `Advance Job Status` / `Confirm completion`.
  - **Additional cost requested**: Amber escrow alert banner, breakdown card (Additional labour ₦15,000, Additional materials ₦10,000, Original approved ₦120,000, New total ₦145,000) with `Approve`, `Decline`, and `Ask Question` actions.
  - **Safety options dialog (`Conversation options`)**: Triggered by `Safety` badge; options for `Call the police` (tel:112), `Message Bluefixx support` (priority chat), and `Share location` (clipboard copy).
  - **Job tracker: completed by artisan**: Timeline advances to `Completed by artisan` with work updates, completion photos, and primary action `Confirm completion`.
  - **Confirm completion view (`Is your job complete?`)**: Escrow release warning banner, completion photos from artisan, `Job summary` card (Amount held ₦120,000, TXN-639890), `Confirm completion`, and `Report a problem` dispute modal.
  - **Release payment dialog (`Release payment?`)**: Modal confirming immediate payment of ₦120,000 to artisan with `Confirm & Release` and `Not yet`.
- **Used In**: `app/(dashboard)/bookings/page.tsx` (`tab=active`)

### `PaymentReleasedView`
- **File**: `features/dashboard/components/PaymentReleasedView.tsx`
- **Purpose**: Completed booking payment release screen matching `media_1792575083520.png`. Features green active warranty banner with claim link, payment released check badge, total amount (₦120,000), detailed fee breakdown (customer payment, 7% service fee, artisan earnings, transaction ID, release timestamp), and `Leave a Review` CTA.
- **Used In**: `app/(dashboard)/bookings/page.tsx` (`tab=completed`)

### `RateArtisanView`
- **File**: `features/dashboard/components/RateArtisanView.tsx`
- **Purpose**: Post-service artisan rating and review screen matching `media_1792575083520.png`. Features artisan avatar card with interactive 5-star rating selector, public comment textarea, recommendation toggle (`Would you recommend Emeka? Yes/No`), and `Submit Review` CTA.
- **Used In**: `app/(dashboard)/bookings/page.tsx` (`tab=completed`)

### `WarrantyClaimView`
- **File**: `features/dashboard/components/WarrantyClaimView.tsx`
- **Purpose**: Warranty claim issue reporting form matching `media_1792575107078.png`. Features issue category chips (`The leak is back`, `Part stopped working`, `Damage from the repair`, `Work left unfinished`, `Other`), problem description textarea, `Add photo(s)` and `Add Video` media attachment buttons, and `Send to Emeka and Bluefixx` submission. Includes side panel detailing how the 24-hour return visit warranty policy works.
- **Used In**: `app/(dashboard)/bookings/page.tsx` (`tab=completed`)

### `WarrantyClaimSentView`
- **File**: `features/dashboard/components/WarrantyClaimSentView.tsx`
- **Purpose**: Warranty claim confirmation screen matching `media_1792575107078.png`. Features green checkmark badge, 24-hour artisan response SLA notice, and action buttons for `Message Emeka` and `View booking`.
- **Used In**: `app/(dashboard)/bookings/page.tsx` (`tab=completed`)

### `FundWalletView`
- **File**: `features/dashboard/components/FundWalletView.tsx`
- **Purpose**: Dedicated multi-step wallet funding journey matching Figma designs:
  - **Fund Account Form**: Amount input with dynamic balance preview, quick chips (₦5,000, ₦10,000, ₦25,000, ₦50,000, ₦100,000), breakdown table (Current balance, Funding fee, Processed by, Total to pay), Paystack badge sidecard.
  - **Paystack Checkout Modal**: Paystack brand logotype, amount, user details, `Pay with Card`, `Pay with Transfer`, and secure checkout notice.
  - **Deposit Processing**: Animated circular spinner, `Deposit processing`, amount, `Processing` status badge, and Deposit summary sidecard.
  - **Deposit Successful**: Circular green checkmark badge, amount, transaction ID with copy action, timestamp, payment method, updated wallet balance card, and `Done` action.
- **Used In**: `app/(dashboard)/wallet/page.tsx`

### `WithdrawWalletView`
- **File**: `features/dashboard/components/WithdrawWalletView.tsx`
- **Purpose**: Dedicated multi-step wallet withdrawal journey matching fund wallet design language:
  - **Withdraw Funds Form**: Amount input with dynamic remaining balance preview, quick chips, destination bank card (`Access Bank ···· 1416`), breakdown table (Balance, Free fee, NIP transfer, Total payout), and security sidecard.
  - **4-Digit PIN Authorization Modal**: Secure PIN input to verify user authorization before fund transfer.
  - **Withdrawal Processing**: Animated circular spinner, `Withdrawal processing`, amount, `Processing` status badge, and Withdrawal summary sidecard.
  - **Withdrawal Successful**: Circular green checkmark badge, amount, destination bank, transaction reference with copy action, updated balance card, and `Done` action.
- **Used In**: `app/(dashboard)/wallet/page.tsx`

### `SettingsOverviewView`
- **File**: `features/dashboard/components/settings/SettingsOverviewView.tsx`
- **Purpose**: Main Settings overview screen matching Figma Customer Web · Settings overview:
  - **Profile Header Card**: Avatar photo, user name, location, contact information, and `Edit profile` CTA.
  - **Account Card**: Chevron rows for `Personal details`, `Security & transaction PIN`, `Notifications`, and `Language`.
  - **Support Card**: Chevron rows for `Safety & support` and `Report a problem`.
  - **Right Column Cards**: Navy Bluefixx Wallet card (₦85,000 balance with `Open wallet`), `Referral` card (₦5,000 voucher invite & earn), and `Account actions` card (`Log out` and `Delete Bluefixx account`).
  - **Modals**: Integrated dialogs for Safety & Support (Emergency 112 dial, Support chat), Report a Problem, Referral code sharing, and Delete Account confirmation.
- **Used In**: `app/(dashboard)/settings/page.tsx`

### `PersonalDetailsView`
- **File**: `features/dashboard/components/settings/PersonalDetailsView.tsx`
- **Purpose**: User profile editing screen matching Figma Customer Web · Personal details:
  - **Profile Photo**: Avatar with functional file picker to upload and update image.
  - **Form Fields**: First name, Last name, Phone number, Email address, Address.
  - **Emergency Contact**: Contact name, Phone number, and Safety Center helper note.
  - **Summary Sidecard**: Profile information guidance, emergency contact review, and update policies.
- **Used In**: `app/(dashboard)/settings/page.tsx` (`tab=personal-details`)

### `LanguageSettingsView`
- **File**: `features/dashboard/components/settings/LanguageSettingsView.tsx`
- **Purpose**: App-wide language preference selector matching Figma Customer Web · Language:
  - **Active Language Banner**: Dynamic highlight box indicating currently selected language.
  - **Interactive Search**: Real-time language search filter.
  - **Radio Options**: National flag indicators for English, Igbo, Yorùbá, Hausa, and Nigerian Pidgin.
  - **Summary Sidecard**: Language policy information and current active state.
- **Used In**: `app/(dashboard)/settings/page.tsx` (`tab=language`)

### `TransactionPinView`
- **File**: `features/dashboard/components/settings/TransactionPinView.tsx`
- **Purpose**: 3-step security PIN setup wizard matching Figma Customer Web · Create / Confirm / PIN created:
  - **Step 1 (Create PIN)**: Keypad icon, 4-digit input boxes with auto-advance and backspace support, `Continue` CTA.
  - **Step 2 (Confirm PIN)**: 4-digit confirmation input boxes, validation against initial PIN, `Confirm PIN` CTA.
  - **Step 3 (PIN Created)**: Circular green checkmark badge, completion summary, and `Done` action.
  - **Security Sidecard**: Fraud prevention guidance, wallet protection details, and confidentiality policies.
- **Used In**: `app/(dashboard)/settings/page.tsx` (`tab=pin`)

### `NotificationsSettingsView`
- **File**: `features/dashboard/components/settings/NotificationsSettingsView.tsx`
- **Purpose**: Notification channels preferences screen with toggles for SMS Security Alerts, Email Quotes & Receipts, Push Notifications, and Promotions.
- **Used In**: `app/(dashboard)/settings/page.tsx` (`tab=notifications`)


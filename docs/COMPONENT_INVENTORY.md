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

### `InviteAndEarnView`
- **File**: `features/dashboard/components/settings/InviteAndEarnView.tsx`
- **Purpose**: Full referral program screen matching Figma *Customer Web · Invite & earn*:
  - **Referral Code Card**: Code `BLUE-SIMEON` with one-click copy, share link, and direct social share options.
  - **Performance Metrics**: 4 stat cards showing Earned (`₦14,000`), Invited (`28`), Joined (`12`), and Activated (`7`).
  - **Referral Journey Pipeline**: Visual 4-stage pipeline showing friend onboarding from invite to qualification reward.
  - **Double Referral Week Banner**: High-urgency promotional banner for boosted rewards.
  - **Filterable Activity Table**: Real-time filtering by `All`, `In progress`, `Reward earned`, and `Not qualified` with status badges.
- **Used In**: `app/(dashboard)/settings/page.tsx` (`tab=referral`)

### `SafetySupportView`
- **File**: `features/dashboard/components/settings/SafetySupportView.tsx`
- **Purpose**: Safety & emergency management suite matching Figma *Customer Web · Safety & support* and *Safety report submitted*:
  - **Immediate Danger Banner**: Direct 112 emergency police dialer for on-site crises.
  - **Live Job Card & Map**: Displays active artisan on job (`Chidi Obi - Plumber`), real-time job site location map, and direct GPS location sharing with trusted emergency contact (`Ada Eze`).
  - **Emergency Contact**: Configured emergency contact details with quick edit.
  - **Report Safety Issue Modal**: Radio selector for safety concerns (`Feel unsafe with the artisan`, `Threatening or abusive behaviour`, `Damage to my property`, `Injury on site`, etc.) and issue description.
  - **Safety Report Submitted View**: Immediate response view with red badge, active priority ticket (`SF-884210`), and real-time safety desk dispatch notes.
- **Used In**: `app/(dashboard)/settings/page.tsx` (`tab=support`, `tab=safety`)

### `ReportProblemView`
- **File**: `features/dashboard/components/settings/ReportProblemView.tsx`
- **Purpose**: Problem reporting and dispute arbitration suite matching Figma *Customer Web · Report a problem* and *Dispute reported*:
  - **Issue Category Selector**: Interactive chips (`Work incomplete`, `Poor quality`, `No long service`, `Damage to property`, `Safety concern`, `Payment issue`, `Other`).
  - **Description & Media Attachments**: Detailed problem description textarea with photo and video upload buttons and file counters.
  - **Escrow Notice**: Highlights automatic payment freeze on artisan payout until dispute is arbitrated.
  - **Dispute Reported Tracking View**: Interactive arbitration tracker with copyable transaction ID (`BFX-TXN-4475193`), frozen payout banner, 4-stage dispute resolution timeline (`Report filed`, `Artisan notified`, `Evidence review`, `Resolution`), and live chat feed with Bluefixx Resolution Desk.
- **Used In**: `app/(dashboard)/settings/page.tsx` (`tab=report-problem`)

### `NotificationsDropdown`
- **File**: `features/dashboard/components/NotificationsDropdown.tsx`
- **Purpose**: Header popover dropdown matching Figma *Customer Web · Notifications panel*:
  - **Top Bar**: "Notifications" title with "Mark all as read" link.
  - **Recent Notifications List**: Top 3 activity alerts with custom type icons (quote, job completion, warranty), timestamps, and unread indicator blue pips.
  - **Footer Link**: "See all notifications" linking directly to the dedicated `/notifications` page.
- **Used In**: `features/dashboard/components/DashboardHeader.tsx`

### `ReviewsPage`
- **File**: `app/(dashboard)/reviews/page.tsx`
- **Purpose**: Dedicated customer reviews workbench matching Figma *12 · Reviews*:
  - **Completed Bookings List**: Review pending items (`Bathroom Plumbing Repair · Emeka Okafor` with `Leave a review` CTA), alongside reviewed jobs with 5-star ratings (`AC servicing · Musa Danjuma`, `Bathroom tiling · Grace Adeyemi`).
  - **Write a Review View**: Interactive 5-star rating selector with dynamic descriptive labels (`4 out of 5 · Very good`), "What went well?" multi-select positive chips (`Arrived on time`, `Clean work`, `Fair price`, `Explained the fix`, `Friendly`), optional review textarea, and "Reviews build trust" sidecard.
  - **Review Submitted Confirmation Screen**: Green checkmark circle, confirmation message, `Book Emeka again`, and `Back to bookings` buttons.
- **Used In**: `app/(dashboard)/reviews/page.tsx` (accessible via sidebar `Reviews` link)

### `NotificationsPage`
- **File**: `app/(dashboard)/notifications/page.tsx`
- **Purpose**: Dedicated notifications center matching Figma *13 · Notifications*:
  - **Filters & Actions**: `All` and `Unread` filter pills, with a one-click `Mark all as read` trigger.
  - **Timeline Groupings**: "Today" and "Earlier" sections with icons, titles, descriptions, timestamps, and unread dots.
  - **Empty State**: "You're all caught up" card with rounded bell illustration when no unread notifications remain.
- **Used In**: `app/(dashboard)/notifications/page.tsx`

---

## 4. Talent / Apprentice Dashboard Modules (`features/dashboard/components/talent/`)

### `TalentHomeView`
- **File**: `features/dashboard/components/talent/TalentHomeView.tsx`
- **Purpose**: Primary dashboard landing screen matching Figma *01 · Home & role switch (Talent Web · Home)*:
  - **Greeting Header**: Personalized morning greeting with avatar, name, "⚡ Upgrade to Artisan" pill, and "Find opportunities" primary CTA.
  - **Your Training Section**: Active apprenticeship card with current module badge ("Advanced Welding"), master artisan credit ("John Obiora"), 65% progress bar, attendance (92%), and "Open My Apprenticeship" CTA.
  - **Next Session & Escrow Payment Cards**: Next scheduled session time and location, and escrow balance status (`₦50,000 held in escrow`).
  - **Learn Another Skill Section**: Explore card with preview of alternative apprenticeships (`Home Electrical Installation · Chinedu Okafor`).
  - **Subview Routing**: Orchestrates state-driven and URL-synchronized deep-linking between `home`, `progress`, `discover`, `master-profile`, and `apply` views.
- **Used In**: `features/dashboard/components/ApprenticeHomeView.tsx`

### `TalentTrainingProgressView`
- **File**: `features/dashboard/components/talent/TalentTrainingProgressView.tsx`
- **Purpose**: Full training progression and syllabus tracking matching Figma *Talent Web · Training progress*:
  - **Master Artisan Header Card**: John Obiora profile card with workshop location, direct "Message" button, and 3 key performance metric cards: `Attendance: 92%`, `Hours: 48`, `Fee: 2/3`.
  - **Training Timeline**: 7-stage interactive apprenticeship roadmap (`Orientation`, `Workshop Safety`, `Basic Tools`, `Welding Fundamentals`, `Advanced Welding` [active], `Final Practical`, `Completion`).
  - **Assignments List**: Practical joint sample and safety worksheet assignments with status pills (`Due`, `Submitted`) and points.
  - **Training Fee Breakdown & Receipts**: Total fee (`₦50,000`), paid balance (`₦35,000`), pending balance (`₦15,000`), and modal preview of downloadable official payment receipts.
  - **Curriculum Documents**: Downloadable resource cards for PDF guides (`Programme Syllabus.pdf`, `Workshop safety guide.pdf`, `Payment receipt.pdf`).
- **Used In**: `TalentHomeView` (accessible via "Full progress" or sidebar `My apprenticeship`)

### `TalentDiscoveryView`
- **File**: `features/dashboard/components/talent/TalentDiscoveryView.tsx`
- **Purpose**: Apprenticeship opportunities catalog matching Figma *02 · Discover & apply (Talent Web · Discovery)*:
  - **Trade Search & Filters**: Search input and interactive category filter chips (`All trades`, `Welding`, `Electrical`, `Plumbing`, `Carpentry`).
  - **Apprenticeship Program Cards**: Grid listing master artisan cards with portrait, verified badge, experience rating, duration, upfront & total fee, workshop location, and remaining spots counter (`1 place left`).
- **Used In**: `TalentHomeView` (accessible via "Find opportunities" or sidebar `Find apprenticeships`)

### `MasterArtisanProfileView`
- **File**: `features/dashboard/components/talent/MasterArtisanProfileView.tsx`
- **Purpose**: Detailed master artisan profile and syllabus page matching Figma *Talent Web · Master artisan profile*:
  - **Profile Hero & Stats**: Master artisan badge, verified label, accepting apprentices chip, and quick stats: `12 Apprentices trained`, `4.9 Rating`, `7 yrs Experience`.
  - **What You Will Learn**: Skill tags list (`Workshop safety`, `Arc welding`, `Measurement & cutting`, `Gate fabrication`).
  - **Apprenticeships Offered**: Program details with schedules, fee structure, syllabus overview, and next intake batch date.
  - **Workshop Portfolio**: Image gallery of recent master artisan fabrication jobs.
  - **Reviews**: Verified reviews from previous apprentices with star ratings and feedback testimonials.
  - **Sticky Action Card**: "Apply for a place" primary button, "Message John" secondary button, trade certifications list, and workshop location pin map preview.
- **Used In**: `TalentHomeView` (accessible when selecting any program card in Discovery)

### `TalentApplicationFormView`
- **File**: `features/dashboard/components/talent/TalentApplicationFormView.tsx`
- **Purpose**: Multi-question apprenticeship application form matching Figma *Talent Web · Application form* and *Talent Web · Application validation*:
  - **Dynamic Progress Counter**: Real-time counter of answered required questions (`X of 4 required questions answered`).
  - **5 Comprehensive Questions**:
    1. *Why do you want to learn this trade?* (Textarea with live character counter).
    2. *What experience do you already have?* (Input field).
    3. *Can you attend the workshop six days a week?* (Yes / No radio button cards).
    4. *Which best describes your current situation?* (Situation selector: `Secondary school leaver`, `Currently unemployed`, `Working, changing trade`, `Student`).
    5. *Upload examples of previous work (optional)* (File uploader for project photos).
  - **Validation & Error States**: Highlights missing fields with red error notices matching the Figma error state.
  - **Sticky Application Summary**: Shows applicant details, program fee, escrow policy disclaimer (`Applying is free. You will only be asked to pay after the master artisan accepts you.`), and "Submit Application" button.
- **Used In**: `TalentHomeView` (accessible via "Apply for a place" on Master Artisan profile or sidebar `My applications`)

### `ApprenticeshipCompletedModal`
- **File**: `features/dashboard/components/talent/ApprenticeshipCompletedModal.tsx`
- **Purpose**: Graduation celebration modal matching Figma *Talent Web · Apprenticeship completed*:
  - **Graduation Badge**: Gold celebration mortarboard icon with subtle pulse ring.
  - **Completion Certificate Notice**: "Congratulations, [Name] - You have completed Welding & Metal Fabrication with John Obiora. Your certificate is now on your Bluefixx profile, and you can apply to become a verified artisan."
  - **Action Triggers**: "View certificate" (triggers digital certificate preview/download) and "Review John" (submits artisan feedback).
- **Used In**: `TalentHomeView` and `TalentTrainingProgressView`

### `TalentApplicationSentView`
- **File**: `features/dashboard/components/talent/TalentApplicationSentView.tsx`
- **Purpose**: Application confirmation view matching Figma *Talent Web · Application sent*:
  - **Confirmation Card**: Green checkmark circle with title and review timing expectation ("John Obiora will review your application. Response takes about 2 days.").
  - **Programme Details**: Summary card showing Trade, Master artisan, Workshop location, and Duration.
  - **Action Buttons**: "Track my application" and "Find more opportunities".
- **Used In**: `TalentHomeView` (accessible upon submitting an application)

### `TalentApplicationsListView`
- **File**: `features/dashboard/components/talent/TalentApplicationsListView.tsx`
- **Purpose**: Comprehensive applications tracker matching Figma *03 · Applications (Talent Web · My applications)*:
  - **Interactive Application Cards**:
    - *Accepted card*: Green highlight banner, start date, schedule (`Monday - Saturday · 8:00 AM - 5:00 PM`), and "Make payment to enrol now" trigger.
    - *Under review card*: 3-stage progress track (`Application submitted` → `Under review · in progress` → `Decision`).
    - *Declined card*: Rejection rationale banner and "Find another apprenticeship" CTA.
  - **Empty State**: Matching Figma *Talent Web · Applications: none yet* with clipboard illustration and "Find opportunities" action.
- **Used In**: `TalentHomeView` (accessible via sidebar `My applications`)

### `TalentApplicationAcceptedDetailView`
- **File**: `features/dashboard/components/talent/TalentApplicationAcceptedDetailView.tsx`
- **Purpose**: Acceptance overview matching Figma *Talent Web · Accepted detail*:
  - **Celebration Card**: Offer announcement from John Obiora with start date and artisan credentials.
  - **Escrow & Spot Hold Notice**: Highlights 72-hour enrollment hold window and milestone escrow release.
  - **Sticky Programme Summary**: Programme specs, paid-in-full breakdown (`₦150,000`), and "Continue to payment" CTA.
- **Used In**: `TalentHomeView` (accessible by selecting an accepted application)

### `TalentApplicationDeclinedDetailView`
- **File**: `features/dashboard/components/talent/TalentApplicationDeclinedDetailView.tsx`
- **Purpose**: Decline notice matching Figma *Talent Web · Application declined*:
  - **Notice Card**: Red icon, decline explanation ("All 3 places on Welding & Metal Fabrication have been filled"), and artisan details.
  - **Alternative Discovery CTA**: Side card with programme recap and "Find other apprenticeships" button.
- **Used In**: `TalentHomeView` (accessible by selecting a declined application)

### `TalentApprenticeshipPaymentView`
- **File**: `features/dashboard/components/talent/TalentApprenticeshipPaymentView.tsx`
- **Purpose**: Apprenticeship payment suite matching Figma *04 · Payment (Talent Web · Payment selection)*:
  - **Payment Structure**: "Pay in full (`₦150,000 · Nothing else to pay`)".
  - **Payment Methods**: Multi-option selector between Bluefixx Wallet (`Balance: ₦185,500`) and Paystack (`Card, bank transfer, USSD`).
  - **Transaction PIN Dialog**: Modal matching *Talent Web · Payment PIN dialog* with 4-digit security dots and interactive numeric keypad (`1-9`, `0`, `⌫`).
  - **Paystack Checkout Dialog**: Modal matching *Talent Web · Paystack checkout* with "Pay with Card" and "Pay with Transfer".
  - **Payment Processing Spinner**: Animated dialog matching *Talent Web · Payment processing* with escrow transaction reference (`PTX-78194-2025`).
  - **Refund Protection Card**: Integrated link to the 30-day refund policy.
- **Used In**: `TalentHomeView` (accessible from accepted application detail)

### `TalentRefundPolicyView`
- **File**: `features/dashboard/components/talent/TalentRefundPolicyView.tsx`
- **Purpose**: Policy documentation matching Figma *Talent Web · 30-day refund policy*:
  - **Rules & Qualifications**: Explains escrow protection, criteria for full refunds, partial refund calculation, and 24-hour wallet reimbursement.
  - **Apprenticeship Status Card**: Fee paid (`₦150,000`), start date, and countdown to refund window end with "Request a refund" button.
- **Used In**: `TalentHomeView` (accessible via sidebar `Payments & receipts` or payment selection)

### `TalentRequestRefundView`
- **File**: `features/dashboard/components/talent/TalentRequestRefundView.tsx`
- **Purpose**: Refund submission form matching Figma *Talent Web · Request a refund*:
  - **Reason Chips**: Interactive chips (`Sessions cancelled or missed`, `Training not as described`, `Unsafe workshop`, `Changed my mind`, `Other`).
  - **Detailed Textarea**: "Tell us what happened" with validation.
  - **Destination Selector**: Bluefixx wallet (within 24 hours) or Bank account.
  - **Escrow Guarantee Note**: "Up to ₦150,000 held in escrow. Master artisan will respond or Bluefixx will auto-resolve within 2 working days."
- **Used In**: `TalentHomeView` (accessible from refund policy)

### `TalentRefundRequestedConfirmationView`
- **File**: `features/dashboard/components/talent/TalentRefundRequestedConfirmationView.tsx`
- **Purpose**: Confirmation screen matching Figma *Talent Web · Refund requested*:
  - **Confirmation Card**: Return arrow icon, "Refund request sent" title, paused payout notice, and 24-hour wallet turnaround message.
  - **Action Triggers**: "View request" and "Back to payments".
- **Used In**: `TalentHomeView` (accessible upon submitting refund form)

### `TalentApprenticeshipActivatedView`
- **File**: `features/dashboard/components/talent/TalentApprenticeshipActivatedView.tsx`
- **Purpose**: Enrollment & escrow confirmation view matching Figma *Talent Web · Apprenticeship activated*:
  - **Confirmation Status**: Green checkmark badge, "Apprenticeship activated!" headline, and escrow protection banner.
  - **Payment & Enrollment Breakdown**: Detailed receipt displaying Programme Title, Master Artisan, Start Date, Payment Method (`Paystack · Debit Card **** 4012`), and unique reference (`BFX-TRN-4417202`).
  - **Action Triggers**: Primary "View Apprenticeship" button and secondary "Manage master artisan" link.
- **Used In**: `TalentHomeView` (routed upon successful payment completion)

### `TalentPaymentFailedView`
- **File**: `features/dashboard/components/talent/TalentPaymentFailedView.tsx`
- **Purpose**: Failed payment & recovery view matching Figma *Talent Web · Payment failed (empty state)*:
  - **Notice Badge**: Red alert circle with "Payment was not completed" explanation.
  - **Escrow Spot Hold Notice**: Highlights 48-hour place reservation before release to waitlisted candidates.
  - **Recovery Actions**: "Use wallet instead" primary CTA and "Try payment again" secondary button.
- **Used In**: `TalentHomeView` (routed upon payment failure)

### `TalentMessagesView`
- **File**: `features/dashboard/components/talent/TalentMessagesView.tsx`
- **Purpose**: Comprehensive messaging suite matching Figma *Talent Web · Inbox*, *Talent Web · Mentor conversation*, and *Talent Web · Locked offer*:
  - **Master Artisan Conversation**: Direct chat thread with mentor John Obiora displaying apprenticeship status banner, live workshop guidance, and voice note player with waveform animation.
  - **Locked Offer Preview**: Modal displaying the formal Apprenticeship Agreement contract terms with John Obiora.
  - **Empty Inbox Fallback**: Zero-state matching *Talent Web · Messages: no messages (empty state)* with chat illustration and "Find opportunities" trigger.
- **Used In**: `TalentHomeView` (accessible via sidebar `Messages` or direct links)

### `TalentProfileSettingsView`
- **File**: `features/dashboard/components/talent/TalentProfileSettingsView.tsx`
- **Purpose**: Account overview and configuration hub matching Figma *Talent Web · Settings*:
  - **Profile Hero Banner**: Talent avatar, full name, phone number, and "Edit profile" action.
  - **Two-Column Settings Hub**:
    - *Account Section*: Personal details, Transaction PIN, Notifications, and Language selector.
    - *Payments & Support Section*: Bluefixx Wallet, Safety Center & live location, Report a problem, and Invite & Earn referrals.
  - **Account Danger Zone**: Logout and Delete Account triggers connected to global auth modals.
- **Used In**: `TalentHomeView` (accessible via sidebar `Settings` or `Profile`)

### `TalentEditProfileView`
- **File**: `features/dashboard/components/talent/TalentEditProfileView.tsx`
- **Purpose**: Personal information management view matching Figma *Talent Web · Edit profile*:
  - **Avatar Uploader**: Circular profile picture uploader with camera badge and live photo preview.
  - **Profile Fields**: First name, Last name, Phone number, Email address, Residential address, and Emergency Contact.
  - **Action Buttons**: "Save changes" with simulated saving feedback and "Cancel" back navigation.
- **Used In**: `TalentHomeView` (accessible from Profile settings)

### `TalentTransactionPinView`
- **File**: `features/dashboard/components/talent/TalentTransactionPinView.tsx`
- **Purpose**: Clean inline 4-digit security PIN creator matching Figma *Talent Web · Create PIN*, *Talent Web · Confirm PIN*, and *Talent Web · PIN success*:
  - **No Virtual Keypad Dialogue**: Complies with requirement by providing direct, accessible 4-digit inline PIN input boxes with auto-focus advancing.
  - **Three Step State Flow**:
    1. *Create PIN*: Enter initial 4 digits.
    2. *Confirm PIN*: Re-enter 4 digits with mismatch validation.
    3. *PIN Created Success*: Celebration checkmark and confirmation message.
- **Used In**: `TalentHomeView` (accessible from Account settings)

### `TalentReferralView`
- **File**: `features/dashboard/components/talent/TalentReferralView.tsx`
- **Purpose**: Invite & Earn incentive center matching Figma *Talent Web · Referral (Invite & earn)*:
  - **Reward Banner**: "Get ₦3,000 for every friend who enrols in an apprenticeship" with 1-click clipboard copy for code `BLUE-SIMEON`.
  - **Promo Callout**: Double referral week banner (earn ₦6,000 per referral).
  - **Metrics Row**: Total earned (`₦18,000`), Friends invited (`7`), Pending rewards (`₦6,000`), and Available to withdraw (`₦12,000`).
  - **Milestone Progress Tracker**: 5-step reward milestone ladder (`Level 1 - Starter` to `Level 5 - Ambassador`).
  - **Tabbed Activity Tracker**: Filter referrals across `All (7)`, `In progress (3)`, `Reward earned (3)`, and `Not qualified (1)`.
- **Used In**: `TalentHomeView` (accessible from Settings or referral links)

### `TalentSafetyCenterView`
- **File**: `features/dashboard/components/talent/TalentSafetyCenterView.tsx`
- **Purpose**: Workshop emergency and security suite matching Figma *Talent Web · Safety support* and *Talent Web · Safety report sheet*:
  - **Emergency 112 Banner**: Direct red emergency dialer banner for immediate dispatch.
  - **Live GPS Workshop Sharing**: Toggleable live location sharing with emergency contact (Ada Eze) active during training hours.
  - **Workshop Verification Card**: Address confirmation (`14 Ziks Avenue, Enugu`) with interactive pin preview.
  - **Report Safety Issue Sheet**: Accessible modal with issue selector (`I feel unsafe at the workshop`, `Artisan absent`, `Harassment`, `Safety gear not provided`), description textarea, and urgent report submission.
- **Used In**: `TalentHomeView` (accessible from settings or training progress)

### `TalentReviewsSuite`
- **File**: `features/dashboard/components/talent/TalentReviewsSuite.tsx`
- **Purpose**: Completed apprenticeship review workflow matching Figma *Talent Web · Completed apprenticeship: review pending*, *Talent Web · Review your master artisan*, and *Talent Web · Review submitted*:
  - **Pending Review Notice**: Highlight banner alerting graduate to review John Obiora to finalize certification on their public profile.
  - **Interactive 5-Star Rating Selector**: Responsive hover and selection star rating component.
  - **"What went well?" Multi-Select Chips**: Interactive feedback tags (`Patient mentor`, `Hands-on training`, `Safe workshop`, `Modern tools`, `Punctual`, `Good communication`).
  - **Review Submission Form**: Detailed comments textarea, anonymous submission toggle, and "Submit review" button.
  - **Review Submitted Confirmation Screen**: Matching *Talent Web · Review submitted* with green checkmark badge, "Thanks for your review" headline, "Your review is live on John's master artisan profile and helps the next apprentice choose", "View certificate" outlined button, and "Back to my apprenticeship" primary button.
  - **Side Trust Card**: Explains how verified apprentice reviews build credibility across the Bluefixx marketplace.
- **Used In**: `TalentHomeView` (accessible via sidebar `Reviews`, after graduation, or from pending review alerts)

---

## 4. Artisan Dashboard Suite (`features/dashboard/components/artisan/`)

### `ArtisanHomeView`
- **File**: `features/dashboard/components/artisan/ArtisanHomeView.tsx`
- **Purpose**: Central hub for the Artisan role matching Figma *01 · Dashboard & role switch*, *03 · Unverified states*, and *04 · Just verified*:
  - **Verification States**: Supports 4 distinct states (`verified`, `not_verified`, `in_review`, `just_verified`) with live preview switcher.
  - **Online/Available Toggle**: Interactive `Available for new jobs` switch with instant feedback.
  - **5 Metric Cards**: New requests, Active jobs, Rating, Withdrawable balance, and Held in escrow.
  - **Active Jobs Card**: Live scheduled job card (`Bathroom Plumbing Repair - ● Scheduled`) with client name and timing.
  - **Recommended Jobs Feed**: Job cards with trade, urgent/receiving quotes pills, customer budget range, and thumbnail preview.
  - **Training & Earnings Grid**: Training summary (waiting applications + apprentice progress bars) alongside recent earnings ledger (+₦85,000, +₦62,000, +₦48,000).
- **Used In**: `app/(dashboard)/dashboard/page.tsx` when `activeRole === "artisan"`

### `ArtisanFindJobsView`
- **File**: `features/dashboard/components/artisan/ArtisanFindJobsView.tsx`
- **Purpose**: Live job discovery feed for artisans matching Figma *04 · Find Jobs: not verified*:
  - **Unverified Banner**: Progress banner informing unverified artisans to complete ID verification to quote.
  - **Search & Filters**: Keyword search bar and filter button.
  - **Filter Category Pills**: `My trade`, `Nearby`, `Newest`, `Urgent`, `Highest budget`.
  - **Feed Cards**: Rich cards with location distance, budget, quote snippet, thumbnail photo, and "View job" CTA.
- **Used In**: `ArtisanHomeView` (`view === "find-jobs"`)

### `ArtisanJobDetailView`
- **File**: `features/dashboard/components/artisan/ArtisanJobDetailView.tsx`
- **Purpose**: Comprehensive job proposal and review screen matching Figma *05 · Job detail: quoting locked*:
  - **Customer Requirements Table**: Detailed breakdown of Service, Date, Time, Budget range, and Urgency.
  - **Customer Photo Gallery**: Attached photo preview of the issue (`Kitchen pipe under the sink`).
  - **Customer Voice Note Player**: Interactive audio player with custom waveform visualizer, play/pause state, and elapsed counter.
  - **Customer Profile Card**: Customer initials, escrow guarantee badge, and review metrics.
  - **Quoting Locked Callout**: Prominent amber card when ID verification is incomplete with "Continue verification →".
  - **Action Buttons**: `Send Quote` (opens modal or locked state), `Ask Question`, and `Decline`.
  - **Area & Map View**: Location map snippet with pin marker and approximate distance.
- **Used In**: `ArtisanHomeView` (`view === "job-detail"`)

### `ArtisanSendQuoteModal`
- **File**: `features/dashboard/components/artisan/ArtisanSendQuoteModal.tsx`
- **Purpose**: Interactive modal for submitting a formal job quote:
  - **Labor & Materials Inputs**: Real-time total calculation.
  - **Duration & Scope Notes**: Timeline estimator and explanatory notes.
  - **Submission Feedback**: Toast notification and state sync.
- **Used In**: `ArtisanJobDetailView`

### `ArtisanOnboardingFlow`
- **File**: `features/dashboard/components/artisan/ArtisanOnboardingFlow.tsx`
- **Purpose**: 5-step onboarding and identity verification wizard matching Figma *02 · Onboarding: Become an artisan*:
  - **Step 1 (Your details)**: Full name, phone number, years of experience, and bio textarea with public profile trust card.
  - **Step 2 (Identity check)**: 11-digit NIN input with inline error validation, Government ID uploader with simulated upload state, Liveness selfie check, encrypted privacy callout, and interactive trigger to preview the Identity Check Failed state.
  - **Step 3 (Trade & service area)**: Multi-select trade pills (Plumbing, Welding, Generator Repair, etc.), base location input, and travel distance radius selector (5 km, 10 km, 25 km, Anywhere in Enugu).
  - **Step 4 (Pricing)**: Indicative price ranges for selected trades (Leak repair, Water heater, Pressure pump, Gate fabrication) with 3× quote request boost notice and 7% fee explanation.
  - **Step 5 (Portfolio)**: Photo uploader with empty (`0 of 3 photos added`) and completed (`5 photos added · minimum met`) states, image cards, and "Submit for review" action.
  - **Identity Check Failed Screen**: Dedicated error state view (`We could not verify your identity`) with Contact support and Try again recovery actions.
- **Used In**: `ArtisanHomeView` (`view === "verification"` or when clicking "Continue verification →")

### `ArtisanFiltersModal`
- **File**: `features/dashboard/components/artisan/ArtisanFiltersModal.tsx`
- **Purpose**: Centered filter modal matching Figma *Artisan Web · Filters open*:
  - **5 Filter Dimensions**: Trade (Plumbing, Tiling, Generator Repair, All trades), Distance (Within 5 km, Within 10 km, Within 25 km, Any distance), Budget (Any budget, ₦25k+, ₦50k+, ₦100k+), Urgency (Any urgency, Urgent, Soon, Flexible), and Date (Any date, Today, Tomorrow, This week).
  - **Single Action**: Full-width "Show" action applying selections.
- **Used In**: `ArtisanFindJobsView`

### `ArtisanJobsListView`
- **File**: `features/dashboard/components/artisan/ArtisanJobsListView.tsx`
- **Purpose**: 4-tab requests & job list management hub matching Figma *06 · Requests & job lists*:
  - **Requests Tab**: Displays incoming job requests with badge count (3), cards (AC repair, Generator changeover wiring, No power emergency), and "View request" CTA.
  - **Active Tab**: Live in-progress job cards (AC repair, Full house rewiring) with "Manage job" actions.
  - **Completed Tab**: Completed payout ledger cards (`Lighting installation`, Kelechi Nwosu, Completed badge, `₦25,740 · paid out`).
  - **Declined Tab**: Declined job history (`Lighting installation`, Kelechi Nwosu, Declined badge, `₦28,000 · paid out`).
- **Used In**: `ArtisanHomeView` (`view === "requests"`, `view === "active-jobs"`, `view === "completed-jobs"`, `view === "declined"`)

### `ArtisanQuoteFormView`
- **File**: `features/dashboard/components/artisan/ArtisanQuoteFormView.tsx`
- **Purpose**: Comprehensive quote proposal page matching Figma *07 · Quoting (Artisan Web · Quote form)*:
  - **Customer Budget Reference Banner**: `Customer budget: ₦25,000 - ₦50,000` with pricing guidelines.
  - **Detailed Inputs**: Labour fee, Materials fee, Estimated completion pills, Warranty minimum pills, Work description textarea, Materials included/excluded, and Additional notes.
  - **Sticky Quote Calculation Card**: Live total calculation (₦45,000), 7% platform fee breakdown (₦3,150 deduction, ₦41,850 net earnings), and full-width "Send Quote" button.
  - **Acceptance Tip Banner**: Advice on clear quote descriptions boosting acceptance by 40%.
- **Used In**: `ArtisanHomeView` (`view === "send-quote"`, or when clicking "Send Quote" in `ArtisanJobDetailView`)


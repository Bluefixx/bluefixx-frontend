# Current Session Handoff

*Last updated: 2026-10-27 (Customer Dashboard Endpoints Integration)*

---

## 1. Current Task Overview & Completed Deliverables

In response to the user's request to plug the customer dashboard endpoints:

1. **Customer Home Dashboard (`features/dashboard/components/CustomerHomeView.tsx`)**:
   - Wired live endpoints via React hooks:
     - `getCustomerDashboardApi()`: Fetches aggregate dashboard metrics (unread notifications, dynamic popular services).
     - `getCatalogApi()`: Fetches real catalog categories with starting prices and trade count.
     - `getArtisansApi({ latitude, longitude, distance, limit })`: Discovers real nearby verified artisans, dynamically displaying their rating, review count, distance, verified badges, and availability.
     - `getWalletApi()`: Fetches live available wallet balance and escrow-held funds, keeping the user's balance synchronized.
   - Dynamic time-of-day greeting ("Good morning", "Good afternoon", "Good evening") customized with the authenticated user's first name.
   - Popular search suggestions dynamically derived from `popularServices` with fallbacks.
   - Connected "View profile" on artisan cards to open `ArtisanPublicProfileView` directly.
   - Zero-layout-shift fallback architecture: gracefully uses design-token mock data whenever the backend is offline or returns empty sets.

2. **Artisan Public Profile View (`features/dashboard/components/ArtisanPublicProfileView.tsx`)**:
   - Plugged `getArtisanByIdApi(artisanId)` to fetch real artisan data when viewing any artisan's profile.
   - Dynamically maps services, portfolio items, and verified customer reviews from the API response with resilient fallbacks.
   - Integrated full lightbox navigation and review listings.

3. **Explore / Browse Services (`features/dashboard/components/BrowseServicesView.tsx`)**:
   - Plugged `getServicesApi()` to fetch real trade categories and services dynamically.

4. **Global Dashboard Header (`features/dashboard/components/DashboardHeader.tsx`)**:
   - Plugged `getNotificationsApi()` to keep unread notification counts and items in sync with the backend.
   - Updated notification store with `setNotifications` action.

5. **Customer UI Views Endpoints Integration**:
   - `PostJobWizard.tsx`: Connected `createJobApi()` for live job creation, `getSavedAddressesApi()` for address selection, and `uploadMediaFile()` for direct binary photo uploads.
   - `JobPostingsView.tsx`: Connected `getJobsApi()` to load active/past job postings from backend, and `cancelJobApi()` for job cancellations.
   - `FundWalletView.tsx`: Connected `createPaymentApi()` to initialize Paystack/wallet payments.
   - `WithdrawWalletView.tsx`: Connected `requestWithdrawalApi()` to submit withdrawal requests, and `getSavedBankAccountsApi()` to load verified payout accounts.
   - `CompareQuotesView.tsx`: Connected `acceptOfferApi()` for accepting artisan counter-offers and reserving booking visits.
   - `RateArtisanView.tsx`: Connected `submitReviewApi()` to submit verified reviews and ratings.
   - `settings/PersonalDetailsView.tsx`: Connected `getAccountProfileApi()` to load profile details, `updateAccountProfileApi()` for saving updates, and `uploadMediaFile()` for avatar photos.
   - `settings/TransactionPinView.tsx`: Connected `setTransactionPinApi()` to persist 4-digit transaction PINs.
   - `settings/NotificationsSettingsView.tsx`: Connected `getNotificationPreferencesApi()` and `updateNotificationPreferencesApi()`.
   - `settings/InviteAndEarnView.tsx`: Connected `getReferralSummaryApi()` to load real referral code/link and statistics.
   - `settings/ReportProblemView.tsx`: Connected `createSupportCaseApi()` to file dispute and warranty cases.
   - `app/(dashboard)/bookings/page.tsx`: Connected `getBookingsApi()` to fetch live booking records and counts.
   - `app/(dashboard)/messages/page.tsx`: Connected `getQuoteMessagesApi()` and `sendQuoteMessageApi()` for quote conversation chats.

5. **Endpoint Comments Cleanup (`lib/api/*.ts`)**:
   - Removed all raw endpoint comments (`* GET /api/v1/...`, `* POST /api/v1/...`, etc.) from all endpoint modules per user request.

6. **Centralized HTTP Client (`lib/api/client.ts`)**:
   - Installed and configured `axios` client instance with base URL resolution (`process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'`).
   - Enabled `withCredentials: true` to support automatic exchange of the HttpOnly session cookie (`bluefixx_refresh` in dev or `__Host-bluefixx_refresh` in production).
   - Injected standard security headers (`X-Requested-With: XMLHttpRequest` and dynamic `Origin: <frontendOrigin>`) for CSRF compliance.
   - Built automatic 401 token refresh queue (`failedQueue` promise array) that seamlessly rotates access tokens via `POST /auth/refresh` on token expiration without dropping concurrent requests.
   - Built normalized `ApiError` class matching the backend error envelope `{ error: { code, message, details } }`.

2. **Complete Authentication Endpoints Service (`lib/api/auth.ts`)**:
   - Implemented all 19 authentication operations:
     - `registerApi`: `POST /auth/register` (receives `challengeId`)
     - `verifyPhoneApi`: `POST /auth/verify-phone` (validates SMS code and returns verified user)
     - `resendOtpApi`: `POST /auth/resend-otp` (queues replacement SMS and returns new `challengeId`)
     - `loginApi`: `POST /auth/login` (returns user, accessToken, and sets HttpOnly refresh cookie)
     - `refreshApi`: `POST /auth/refresh` (rotates refresh cookie and returns fresh accessToken)
     - `logoutApi`: `POST /auth/logout` (clears refresh cookie and revokes session)
     - `logoutAllApi`: `POST /auth/logout-all` (revokes all active sessions)
     - `forgotPasswordApi`: `POST /auth/forgot-password` (dispatches reset SMS and returns `challengeId`)
     - `verifyResetOtpApi`: `POST /auth/verify-reset-otp` (returns 10-minute single-use `resetToken`)
     - `resetPasswordApi`: `POST /auth/reset-password` (updates password using `resetToken`)
     - `changePasswordApi`: `POST /auth/change-password` (updates password and revokes previous sessions)
     - `getCurrentUserApi`: `GET /auth/me` (reads authenticated profile)
     - `selectRoleApi`: `PATCH /auth/role` (`CUSTOMER`, `ARTISAN`, `LEARNER`)
     - Social & provider endpoints: `POST /auth/google`, `POST /auth/google/link`, `GET /auth/options`, `POST /auth/apple/challenge`, `POST /auth/apple`, `POST /auth/apple/link`.

3. **Customer & Marketplace Endpoints Modular Services**:
   - `lib/api/customer.ts`: `getCustomerDashboardApi`, `getCatalogApi`, `getServicesApi`, `getArtisansApi`, `getArtisanByIdApi`.
   - `lib/api/jobs.ts`: `getJobsApi`, `getJobByIdApi`, `createJobApi`, `editJobDraftApi`, `publishJobApi`, `cancelJobApi`.
   - `lib/api/quotes.ts`: `getQuotesApi`, `getQuoteByIdApi`, `createQuoteApi`, `editQuoteDraftApi`, `respondQuoteApi`, `createOfferApi`, `acceptOfferApi`.
   - `lib/api/bookings.ts`: `getBookingsApi`, `getBookingByIdApi`, `confirmBookingApi`, `cancelBookingApi`, `proposeRescheduleApi`, `decideScheduleProposalApi`, `decideAdditionApi`, `confirmBookingScheduleVisitApi`.
   - `lib/api/wallet.ts`: `getWalletApi`, `getWalletTransactionsApi`, `createPaymentApi`, `verifyPaymentApi`, `requestWithdrawalApi`.
   - `lib/api/messages.ts`: `getConversationsApi`, `getQuoteMessagesApi`, `sendQuoteMessageApi`, `markQuoteMessagesReadApi`, `blockUserApi`, `unblockUserApi`.
   - `lib/api/reviews.ts`: `getReviewsApi`, `submitReviewApi`.
   - `lib/api/notifications.ts`: `getNotificationsApi`, `markNotificationReadApi`, `getNotificationPreferencesApi`, `updateNotificationPreferencesApi`.
   - `lib/api/account.ts`: `getAccountProfileApi`, `updateAccountProfileApi`, `getSavedAddressesApi`, `createSavedAddressApi`, `deleteSavedAddressApi`, `requestPhoneChangeChallengeApi`, `confirmPhoneChangeApi`, `setTransactionPinApi`, `requestSecurityChallengeApi`, `confirmSecurityChallengeApi`, `getAccountSessionsApi`, `revokeAccountSessionApi`, `getAccountRolesApi`, `enrollAccountRoleApi`, `switchActiveRoleApi`.
   - `lib/api/media.ts`: `initiateMediaUploadApi`, `completeMediaUploadApi`, `getMediaUrlApi`, `uploadMediaFile`.
   - `lib/api/banks.ts`: `getSavedBankAccountsApi`, `addBankAccountApi`, `resolveBankAccountApi`, `searchSupportedBanks`, and curated `SUPPORTED_NIGERIAN_BANKS`.
   - `lib/api/referrals.ts`: `getReferralSummaryApi`, `claimReferralRewardApi`.
   - `lib/api/support.ts`: `getHelpArticlesApi`, `getSupportCasesApi`, `createSupportCaseApi`, `getSupportCaseByIdApi`, `sendSupportCaseMessageApi`, `openSupportChatApi`, `getSupportConversationsApi`.
   - `lib/api/location.ts`: `searchLocationsApi` (offline curated Nigerian locations + OpenStreetMap geocoding fallback), `reverseGeocodeApi`, and `POPULAR_NIGERIAN_LOCATIONS`.
   - `lib/api/index.ts`: Barrel export of all modules.

4. **Synchronized Global State & UI Flow Connections**:
   - `lib/stores/auth-store.ts` & `components/shared/AuthProvider.tsx`: Updated with `accessToken`, `challengeId`, and connected `login` and `logout` actions.
   - `features/onboarding/components/LoginPage.tsx` & `EmailSignIn.tsx`: Wired to call `login({ email, password })` with exact server error feedback.
   - `features/onboarding/components/SignupPage.tsx`: Wired Step 1 & 2 (`registerApi`), Step 3 (`verifyPhoneApi` + auto session login), and Step 6 (`selectRoleApi`).
   - `features/onboarding/components/ForgotPasswordPage.tsx`: Converted form to email-based recovery, wired to `forgotPasswordApi`, `verifyResetOtpApi`, and `resetPasswordApi`.
   - `features/dashboard/components/AccountMenuDropdown.tsx`: Wired to call `logout()` and clear session.

5. **Mobile Layout Optimizations & Runtime Alignment**:
   - Resolved mobile split-screen vertical stacking across all auth and onboarding screens:
     - On desktop, auth screens feature a 50/50 split (`AuthHeroPanel` artwork + form card).
     - On mobile screens (< 1024px), `AuthHeroPanel` is cleanly hidden (`hidden lg:block lg:w-1/2`) to prevent stacking a 420px image above the inputs, eliminating forced scrolling.
     - Added an elegant mobile brand header with the BlueFixx logo (`/icons/BFLogoBlue.svg`) and support link across:
       - `LoginPage.tsx`
       - `SignupPage.tsx` (all 6 steps)
       - `ForgotPasswordPage.tsx`
       - `WelcomeSocialSignIn.tsx`
       - `LanguageSelection.tsx`
       - `PhoneVerification.tsx`
       - `CreateAccount.tsx` & `EmailSignIn.tsx`
     - Refined card padding and borders: switched from rigid desktop boxes to responsive `p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200/90 sm:card-shadow-mobile`.
     - In `IntroSlide.tsx`, reduced mobile visual height (`h-[220px] sm:h-[320px] lg:h-auto lg:aspect-[4/4.5]`) and adjusted spacing so the intro carousel fits naturally on mobile viewports.
     - In `OnboardingHeader.tsx`, adjusted skip button text to collapse to "Skip" on small devices to prevent header wrapping.
   - Resolved client runtime errors:
     - Removed disallowed custom `Origin` header from `lib/api/client.ts`.
     - Added `.env.local` pointing `NEXT_PUBLIC_API_URL` to `https://bluefixx-api.onrender.com`.

---

## 2. Relevant Files
- `lib/api/client.ts`
- `lib/api/auth.ts`
- `lib/api/customer.ts`
- `lib/api/jobs.ts`
- `lib/api/quotes.ts`
- `lib/api/bookings.ts`
- `lib/api/wallet.ts`
- `lib/api/messages.ts`
- `lib/api/reviews.ts`
- `lib/api/notifications.ts`
- `features/onboarding/components/LoginPage.tsx`
- `features/onboarding/components/SignupPage.tsx`
- `features/onboarding/components/ForgotPasswordPage.tsx`
- `features/onboarding/components/WelcomeSocialSignIn.tsx`
- `features/onboarding/components/LanguageSelection.tsx`
- `features/onboarding/components/PhoneVerification.tsx`
- `features/onboarding/components/IntroSlide.tsx`
- `features/onboarding/components/OnboardingHeader.tsx`
- `features/onboarding/components/CreateAccount.tsx`
- `features/onboarding/components/EmailSignIn.tsx`
- `.env.local`

---

## 3. Verification Performed
- Static TypeScript compiler (`npx tsc --noEmit`) verified clean with **0 errors**.
- Full end-to-end type safety established between backend contract schemas and frontend client interfaces.


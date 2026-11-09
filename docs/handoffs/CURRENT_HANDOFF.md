# Current Session Handoff

*Last updated: 2026-11-09 (Customer Dashboard Dynamic Integration & Persistence on Refresh)*

---

## 1. Current Task Overview & Completed Deliverables

### A. Customer Dashboard Dynamic Data & Persistence Fixes
1. **Header Notifications & Bell Dot (`DashboardHeader.tsx` & `NotificationsDropdown.tsx`)**:
   - Notifications bell pip is now strictly dynamic (`unreadCount > 0`). When there are unread notifications, the bell button transitions to `border-amber-300 bg-amber-50/50 text-amber-600` with the amber pip. When all are read, the bell returns to neutral with zero pip.
   - `getNotificationsApi()` updates `setNotifications` even with an empty array `[]` so empty inboxes correctly clear unread count.
   - Added a polished empty state in `NotificationsDropdown.tsx` ("No notifications yet. You're all caught up with your updates.").
   - `app/(dashboard)/notifications/page.tsx` now loads live notifications dynamically on mount and hydrates unread status.

2. **Dashboard Home Categories (`features/dashboard/components/CustomerHomeView.tsx`)**:
   - Replaced non-existent `/catalog` call with canonical `getServicesApi()` (`GET /services` - API #22).
   - Dynamically mapped real trade categories into `displayCategories` (real category names, live service counts, and dynamic navigation links `/explore?category=${cat.id}`).

3. **Browse Services View (`features/dashboard/components/BrowseServicesView.tsx`)**:
   - Replaced static `CATEGORIES` constant loops with `apiCategories` from `getServicesApi()`.
   - Header summary dynamically computes `${allServices.length} services · ${apiCategories.length} categories`.
   - Category selector dropdown and left sidebar pills dynamically render from live trade categories and reflect accurate counts.
   - Grouped services are dynamically bucketed under their matching live category IDs.

4. **Messages Page (`app/(dashboard)/messages/page.tsx`)**:
   - Connected `getConversationsApi()` (`GET /conversations` - API #41) on mount.
   - Dynamically populates conversation list with real peer name, avatar, snippet, timestamp, and unread badges.
   - When selecting a conversation, fetches message history via `getQuoteMessagesApi(quoteId)` (`GET /quotes/{id}/messages` - API #38) and marks as read via `markQuoteMessagesReadApi(quoteId)` (`POST /quotes/{id}/read` - API #40).
   - Dispatches outgoing messages via `sendQuoteMessageApi(quoteId, { text, clientId, mediaIds })` (`POST /quotes/{id}/messages` - API #39).
   - Always provides a persistent 24/7 Bluefixx Support channel.

5. **Reviews Page (`app/(dashboard)/reviews/page.tsx`)**:
   - Fetches completed customer bookings via `getBookingsApi({ tab: "completed", view: "customer" })` (`GET /bookings` - API #44) and submitted reviews via `getReviewsApi()` (`GET /reviews` - API #57).
   - Eliminates hardcoded dummy bookings; displays real completed bookings with pending/reviewed status, star ratings, and dates.
   - Added clean empty state ("No completed bookings to review") when user has no completed jobs.
   - Submits reviews to the backend via `submitReviewApi(bookingId, { stars, text, mediaIds })` (`POST /bookings/{id}/review` - API #56).

6. **Wallet Page (`app/(dashboard)/wallet/page.tsx`)**:
   - Fetches live wallet balance and held escrow amount via `getWalletApi()` (`GET /wallet` - API #94).
   - Fetches transaction activity via `getWalletTransactionsApi()` (`GET /wallet/transactions` - API #95).
   - Dynamically renders available balance and live held funds (`₦{heldBalance.toLocaleString()} held for jobs in progress`).
   - If transactions are empty, renders a clean zero-state table row instead of dummy transactions.

7. **Account Settings Wallet Balance (`features/dashboard/components/settings/SettingsOverviewView.tsx`)**:
   - Fixed hardcoded fallback `₦{(walletBalance || 85000).toLocaleString()}` to `₦{(walletBalance ?? 0).toLocaleString()}`.
   - Added on-mount hydration via `getWalletApi()` in `SettingsOverviewView.tsx`.

8. **Page Refresh Data Loss Resolution**:
   - Root cause 1: `DEFAULT_AUTH_STATE.walletBalance` was initialized to `85000`; changed to `0`.
   - Root cause 2: `AuthProvider.tsx` now caches `user`, `activeRole`, `walletBalance`, and `locationName` in `localStorage` so reload never causes flash of default dummy state.
   - Root cause 3: Token persisted in both `sessionStorage` and `localStorage` (`bluefixx_access_token`) via `lib/api/client.ts`.
   - Root cause 4: Removed non-existent endpoint calls (`/catalog`) that were 404ing on refresh and forcing fallback to mock arrays.

### B. Dynamic Data Across Artisan & Talent Dashboards
1. **Dynamic Greetings & User Hydration**:
   - Replaced all hardcoded greetings (`Good morning`) across Customer, Artisan, and Talent dashboards with client-side, time-aware greetings (`Good morning`, `Good afternoon`, `Good evening` based on `new Date().getHours()`).
   - Profile hydration on mount in `AuthProvider.tsx` calling `getAccountProfileApi()` to set real user name, email, phone, avatar, and verification status.
   - Fallbacks now dynamically derive first names (`user?.fullName ? user.fullName.split(" ")[0] : ...`).
2. **Artisan Dashboard Dynamic Integration (`features/dashboard/components/artisan/ArtisanHomeView.tsx`)**:
   - Removed the view state simulator dropdown (`<select>`) from the home view. Verification status is now derived strictly from `dashboardData?.profile?.approval` and live capabilities.
   - Bound the 5 summary metric cards directly to `dashboardData`:
     - New requests: `dashboardData?.requests?.length ?? 0`
     - Active jobs: `dashboardData?.activeJobs?.length ?? 0`
     - Rating: calculated from `ratingTotal / ratingCount` with `"New"` / `"4.8"` fallback
     - Withdrawable balance: formatted via `formatNaira(dashboardData.earnings.available, true)`
     - Held in escrow: formatted via `formatNaira(dashboardData.earnings.escrow, true)`
   - Active jobs section dynamically maps `dashboardData.activeJobs` with clean zero-state fallback.
   - Recent earnings section dynamically maps `dashboardData.recentEarnings`.
3. **Customer Dashboard Dynamic Fixes & POST/PATCH Integrations (`features/dashboard/components/CustomerHomeView.tsx`, `JobPostingsView.tsx`, `BookingsPage`, `BrowseServicesView.tsx`, `InviteAndEarnView.tsx`)**:
   - Location-aware coordinates for nearby artisan discovery (Lagos, Abuja, Enugu) with 100km radius search.
   - Removed all mock fallback arrays (`CATEGORIES`, `SERVICES`, `INITIAL_POSTED_JOBS`, `TRUSTED_ARTISANS`, mock referrals) across the dashboard.
   - Fixed `JobPostingsView.tsx` to initialize empty and fetch live posts via `getJobsApi()`.
   - Fixed `BookingsPage` (`app/(dashboard)/bookings/page.tsx`): dynamic tab badges, mapped active bookings, and mapped completed bookings with warranty/receipt/review actions.
   - Fixed `InviteAndEarnView.tsx`: dynamic code, link, earned/pending stats from `getReferralSummaryApi()`, claim action wired to `claimReferralRewardApi()`, and referral history mapped dynamically.
   - Verified and plugged all key POST and PATCH endpoints:
     - `POST /jobs` via `createJobApi` in `PostJobWizard.tsx` (supports budget, urgency, start/end dates, answers, and idempotency keys).
     - `PATCH /account` via `updateAccountProfileApi` in `PersonalDetailsView.tsx` (aligns with backend schema `fullName`, `photoId`, `emergencyName`, `emergencyPhone`, `language`).
     - `POST /bookings/{id}/review` via `submitReviewApi` in `RateArtisanView.tsx` and `reviews/page.tsx`.
     - `POST /quotes/{id}/messages` via `sendQuoteMessageApi` in `app/(dashboard)/messages/page.tsx`.
   - Corrected hardcoded held escrow fallback from `120000` to `0` or actual calculated held balance.
   - Bound greeting to dynamic client-side time-of-day greeting.
4. **Talent Dashboard Dynamic Fixes (`features/dashboard/components/talent/TalentHomeView.tsx`)**:
   - Dynamic time-of-day greeting.
   - Added clean empty state for when a user has no active apprenticeship enrollments instead of displaying static mock values.
5. **Artisan Reviews Suite (`app/(dashboard)/reviews/page.tsx`)**:
   - Connected role-aware reviews view: when `activeRole === "artisan"`, displays Completed Jobs review pending list (`Generator repair · Daniel C.`, etc.) and transitions into `ArtisanRateCustomerView` with matching feedback chips (`Punctual`, `Paid on time`, `Respectful`, `Good tea`, `Clear problem`) and submission confirmation.
6. **Settings & Profile Routes Navigation Fix**:
   - Header dropdown navigates to `/profile` and `/settings` instead of 404 `/dashboard/profile` or `/dashboard/settings`.
   - Settings views (`ArtisanSettingsOverviewView.tsx` & `ArtisanPersonalDetailsView.tsx`) now bind to live `useAuth()` data (name, phone, location, wallet balance) and support editing.
   - Removed testing debug buttons ("Reset sample notifications") from `ArtisanNotificationsView.tsx`.
7. **Build & Typecheck Validation**:
   - Wrapped search-param dependent routes and subviews in `<React.Suspense>`.
   - Passed strict type checks (`npx tsc --noEmit` exited with code 0).
Integrated the entire backend API suite for the Artisan Web Dashboard per the BlueFixx Artisan Integration Guide:
1. **Type Contracts (`types/artisan.ts`)**:
   - Comprehensive TypeScript definitions matching all endpoints: Dashboard, Onboarding, Identity, Jobs Feed, Offers, Bookings, Work Updates, 48h Completion Checklist, Wallet Withdrawals, Apprenticeship creation/pipeline, Reviews, Safety, Disputes, and Notification preferences.
2. **API Client Layer (`lib/api/artisan.ts` & `lib/api/index.ts`)**:
   - Implemented typed API functions routing through `apiClient` (`/api/v1`) with automatic Bearer tokens.
   - Financial operations (`requestArtisanWithdrawalApi`, `withdrawArtisanOfferApi`, `submitArtisanOfferApi`) send retry-safe `Idempotency-Key` headers.
3. **Utilities**:
   - `lib/utils/currency.ts`: `koboToNaira`, `nairaToKobo`, and `formatNaira` for integer kobo conversion.
   - `lib/utils/idempotency.ts`: RFC4122 UUIDv4 generator.
4. **Component Wiring**:
   - Wired live endpoints with graceful offline/fallback handling across all 25 artisan UI components.

### B. Artisan Dashboard UI Suite (`features/dashboard/components/artisan/`)
Built the complete, pixel-perfect Artisan Web experience based on the 5 Figma design boards provided by the user:

1. **`ArtisanHomeView.tsx` (`01 · Dashboard & role switch`, `03 · Unverified states`, `04 · Just verified`)**:
   - **4 Verification States**:
     - *Verified*: "Verified artisan: John Obiora", `🟢 Available for new jobs` interactive toggle, 5 metric cards (New requests: 3, Active jobs: 2, Rating: 4.8, Withdrawable balance: ₦168,000, Held in escrow: ₦46,500), active job card (`Bathroom Plumbing Repair - ● Scheduled`), 2 recommended job cards with `View job` action, bottom 2-column grid (Training: 3 waiting applications + apprentice progress bars; Recent earnings ledger: Shower line +₦85,000, Kitchen sink +₦62,000, Bathroom +₦48,000).
     - *Not Verified*: Blue notification banner with 1 of 4 step progress bar, locked artisan pill, empty active jobs state.
     - *In Review*: Amber notification banner with 3 of 4 step progress bar ("Usually approved within 24 hours").
     - *Just Verified*: Green celebratory badge banner with "Find jobs →" CTA and dismiss action.
   - **Interactive State Switcher**: Dropdown control embedded in the view to test all 4 verification states with one click.
   - **Availability Toggle**: `Available for new jobs` pill button with live state change and toast feedback.

2. **`ArtisanFindJobsView.tsx` (`04 · Find Jobs: not verified`)**:
   - Verification status banner for unverified artisans.
   - Search bar with Filter trigger.
   - Trade filter category chips (`My trade`, `Nearby`, `Newest`, `Urgent`, `Highest budget`).
   - Matching job feed cards showing location distance, customer budget range, excerpt, and photo preview.

3. **`ArtisanJobDetailView.tsx` (`05 · Job detail: quoting locked`)**:
   - Customer Requirements specification table: Service, Date, Time, Budget, Urgency.
   - Photos from the customer with image preview and caption.
   - Voice note player from the customer with custom animated sound wave bars and duration counter.
   - Daniel C. customer summary card with escrow guarantee assurance.
   - Verification status card (2 of 4 steps done) with disabled/enabled `Send Quote` button, `Ask Question`, and `Decline`.
   - Additional questions checklist and location/area map preview card.

4. **`ArtisanSendQuoteModal.tsx`**:
   - Interactive quote submission modal with labour fee, materials cost, duration, and notes.

5. **`ArtisanOnboardingFlow.tsx` (`02 · Onboarding: Become an artisan` & `Identity check failed`)**:
   - **Step 1 (Your details)**: Name, phone, whole years of experience, and bio textarea with public profile trust badge card.
   - **Step 2 (Identity check & incomplete validation)**: 11-digit NIN input with inline error validation, Government ID upload simulation, Liveness selfie camera check, encrypted privacy card, and interactive trigger to preview the failed verification screen.
   - **Step 3 (Trade & service area)**: Multi-select trade pills (Plumbing, Welding, Generator Repair, etc.), base location input, and travel distance selector (5 km, 10 km, 25 km, Anywhere in Enugu).
   - **Step 4 (Pricing)**: Indicative price ranges for selected trades with 3× quote request boost notice and 7% fee explanation.
   - **Step 5 (Portfolio & Portfolio Complete)**: Photo uploader supporting empty (0 of 3) and complete (5 photos added) states with "Submit for review" action.
   - **Identity check failed screen**: Dedicated empty/error state matching Figma with "We could not verify your identity", "Contact support", and "Try again".

6. **Updated `ArtisanFindJobsView.tsx` & `ArtisanFiltersModal.tsx`**:
   - Filter Modal matching *Artisan Web · Filters open* with Trade, Distance, Budget, Urgency, and Date options.
   - Urgent filter support matching *Artisan Web · Find Jobs urgent*.
   - Empty state matching *Artisan Web · Find jobs: no jobs nearby (empty state)* with "No jobs in your area right now" and action buttons to "Edit trades" and "Widen travel distance".

7. **`ArtisanJobsListView.tsx` (`06 · Requests & job lists`)**:
   - 4-tab requests and job lists management matching *Requests*, *Active jobs*, *Completed jobs*, and *Declined jobs*.
   - Requests feed with status badges (New, Emergency) and "View request" CTA.
   - Active jobs feed with "Manage job" actions.
   - Completed & Declined payout ledger with paid out badges.

8. **`ArtisanQuoteFormView.tsx` (`07 · Quoting`)**:
   - Complete quote form matching *Artisan Web · Quote form*.
   - Customer budget reference banner (`₦25,000 - ₦50,000`).
   - Inputs for Labour, Materials, Estimated completion pills, Warranty minimum pills, Work description, Materials included/excluded, and Additional notes.
   - Sticky calculation card displaying Quote total, 7% platform fee deduction (₦3,150), and net earnings payout (₦41,850).
   - Sending quote seamlessly returns to the dashboard with toast confirmation.

9. **`ArtisanQuoteSentView.tsx` (`Quote sent`, `Withdraw confirmation`, `Withdrawn success`)**:
   - Quote submission status overview matching *Artisan Web · Quote sent* and *Quote sent variant*.
   - Detailed specification table with "View Job" and "Withdraw Quote" actions.
   - Modal dialog for quote withdrawal confirmation.
   - Information banner for withdrawn status with "Find more jobs" CTA.

10. **Updated `ArtisanJobDetailView.tsx` (`Job detail after quote sent` & `Declined job detail`)**:
    - Post-quote state: Displays primary "View Your Quote" CTA taking the artisan directly to their submitted proposal.
    - Declined state: Displays top notice banner ("You declined this job. It has been removed from your recommendations...") with "Back to Find Jobs" button.

11. **`ArtisanActiveJobDetailView.tsx` (`Active-job detail`, `Additional cost`, `Completion checklist`, `Awaiting confirmation`, `Payment released`)**:
    - In-progress workbench with secured escrow notice (₦60,000 held, ₦55,242 payout).
    - Timeline work updates feed with photo upload support and real-time posting.
    - Dynamic status panel and full lifecycle state machine:
      - Default mode: Customer info, map pin, approved quote, `Mark Completed`, `Messages`, `Extra Cost`.
      - Request Additional Cost mode: Inputs for reason, additional labour, and materials with automatic total computation (₦60k + ₦25k = ₦85k).
      - Completion Checklist mode: 3-item mandatory verification checklist (Work completed, Final record, Customer notified) with proof photo attachments.
      - Awaiting Confirmation mode: Amber banner indicating 48-hour customer review window before automatic escrow release.
      - Completed & Payment Released mode: Celebratory green banner with 7-day warranty notice, fee deductions breakdown (₦35,000 labour + ₦25,000 materials - ₦4,200 platform fee - ₦600 insurance = ₦55,242 net payout), `Rate Customer`, and `Find more jobs` CTAs.

12. **`ArtisanEarningsView.tsx` (`09 · Earnings & withdrawals: Earnings dashboard`)**:
    - Dark blue hero card with Withdrawable balance (`₦168,000`), "Withdraw to bank" CTA, In escrow (`₦46,500`), Paid out this month (`₦412,000`), and Apprentice earnings (`₦212,000`).
    - Performance section: "Your standing" badge with monthly revenue and BlueFixx Rewards, paired with a daily bar chart.
    - Itemized transaction ledger with category icons, customer names, dates, and amounts (+₦85k, +₦62k, +₦48k).
    - Platform fee notice (7% fee + 1% optional insurance).

13. **`ArtisanWithdrawFlowView.tsx` (`Withdrawal request, processing, sent, failed, add account, confirm PIN, account added`)**:
    - Complete 7-state withdrawal experience:
      - Form mode: Amount input with quick pills (₦5k, ₦10k, ₦20k, all), bank dropdown, account number, green verified name badge (`JOHN OBIORA`), name restriction notice, and fee breakdown card (₦0 withdrawal fee).
      - Processing state: Animated spinner with account transfer details and 5-minute SLA notice.
      - Sent state: Green checkmark with reference code (`BFX-WD-49180`), itemized bank breakdown, and navigation back to Home or Earnings.
      - Failed state: Red alert badge, name mismatch diagnosis (comparing profile name with bank account holder), support escalation, and account switcher.
      - Add Account view: Bank selector, 10-digit account input, real-time name validation card, and regulatory name matching guide.
      - Confirm PIN view: 4-digit transaction PIN verification modal (`Confirm you want to add GTBank •••• 6789 (JOHN OBIORA)`).
      - Account Added view: Green checkmark confirmation card with `Back to earnings` and `Withdraw now` primary actions.

14. **`ArtisanMessagesView.tsx` (`10 · Messages: Inbox, Conversation, Quote conversation, and Job booking`)**:
    - Integrated with `app/(dashboard)/messages/page.tsx` for artisans.
    - Conversation list: Chiamaka Obi (Online, unread badge, voice message preview), Fatima Bello (Quote request), and BlueFixx Support.
    - Empty conversation selection state.
    - Active conversation workbench with audio waveform voice note player, chat composer, attachments, and mic.
    - Quote conversation with customer damage photo preview under sink and quoting system pill.
    - `Job Booking` detail screen (`View job →` action) with locked offer card (₦43,500), labour, materials breakdown, warranty, timeline, and green `Accepted, terms locked` status.

15. **`ArtisanCreateApprenticeshipView.tsx` (`11 · Apprenticeship: create & publish: Steps 1-4 & Published`)**:
    - Step 1 (Creation): Trade/skill selector chips (Welding, Electrical, etc.), Skills taught, Workplace address, Available slots, Duration in months, Working days picker (Mon-Sat), Start/Close times, and Hands-on offline apprenticeship notice.
    - Step 2 (Questionnaire): Dynamic application questions manager with question type tags (`Long Answer`, `Short Answer`, `Yes/No`, `File Upload`), `Required`/`Optional` chips, move up/down reorder handles, trash delete, and `+ Add Custom Question` dialog.
    - Step 3 (Fees & Structure): Training fee input (`₦150,000`), `Paid in full upfront` structure pill, locked capacity indicator (`3 from Step 1`), amount per apprentice and total (₦450,000) breakdown card, and escrow policy notice.
    - Step 4 (Review & Summary): Program overview card with skills taught tags, details ledger (Trade, Duration, Location, Start date, Capacity, Fee, Payment terms, Questions count), and `Publish` CTA.
    - Published State: Green checkmark card with program summary, `View my apprenticeship`, and `Back to Dashboard` navigation.

16. **`ArtisanApprenticeshipsHubView.tsx` (`Active programmes`, `Applications overview`, `New applicants`, `Declined list`, and empty state)**:
    - Active Programmes Tab: Live cards (Welding & Metal Fabrication, Plumbing Basics) displaying duration, open slots, weekly operating schedule, applicant counts, and `Manage` trigger.
    - Applications Overview Tab: Grouped apprenticeship listings with `2 new`, `1 new`, and `Filled` status badges, paired with `View applications` actions.
    - New Applicants Pipeline: 4-subtab pipeline (`New`, `Reviewing`, `Accepted`, `Declined`) with detailed applicant cards (Chidera Okwu, Ifeanyi Ugwu), background notes, and one-click `View`, `Decline`, and `Accept` actions.
    - Declined List Tab: Single-row compact summary cards matching Figma *Artisan Web · Declined list* with red `Declined` tag.
    - Empty State: Graduation cap empty state card with `Create apprenticeship` primary trigger.

17. **`ArtisanApplicantDetailView.tsx` (`Submitted applicant detail, Accept/Decline dialogs, Accepted/Declined states`)**:
    - Application Questionnaire Responses: Detailed answers for motivation, experience, weekly schedule commitment, employment status, and portfolio file links.
    - Portfolio & Recommendation: Two-column work photo gallery and master artisan endorsement card (*Uncle Obi Okwu · Fabricator, Nsukka*).
    - Applicant Summary Card: Profile summary (Chidera Okwu, age 21, Abakpa Enugu East), applied date, and status badge.
    - Interactive Decision Dialogs & Success Screens:
      - Accept Confirmation Dialog (*Accept Chidera? They will be asked to pay ₦150,000...*).
      - Accepted Success Screen with green checkmark and *Talent can now continue to payment* message.
      - Accepted Applicant Awaiting Payment View with green countdown banner (*They have 3 days (due 24 Aug) to pay ₦150,000 to activate their place*).
      - Decline Confirmation Dialog (*Decline this application*).
      - Declined Success Screen with red 'X' and *Their place is put back so other applicants can apply*.
      - Declined Applicant View with notice banner and *View My Apprenticeships* CTA.

18. **`ArtisanProfileView.tsx` (`Artisan Web · Master artisan profile`)**:
    - Hero Master Card: Business name (`Obiora Welding & Fabrication`), artisan name (`John Obiora`), address, verified badges (`Already verified`, `Master Artisan verified`), and 4-metric grid (`126 Jobs`, `4.8 Rating`, `7 Posts`, `4 Talent`).
    - Services & Portfolio: Offered trade chips and dual photo preview gallery.
    - Reviews Section: Average rating `★ 4.8 (121)` with customer review quotes.
    - Side Actions: Active apprenticeship opportunities widget (`Manage →`), service area coverage list, and profile navigation menu (Earnings, Talent, Notifications, Support, Logout).
    - Automatically rendered in `app/(dashboard)/profile/page.tsx` for artisans.

19. **`ArtisanApprenticeProgressView.tsx` (`13 · Apprenticeship: training progress`)**:
    - Active apprentice progress matching *Artisan Web · Active apprentice progress*, *Progress recommendation variant*, *Complete training confirmation*, *Confirm apprenticeship completion*, and *Apprenticeship completed*:
    - **Hero Card**: Daniel Eze (`Welding & Metal Fabrication Apprenticeship`, `In Training: Advanced Welding`, 85% progress bar).
    - **3 Key Metrics**: Attendance (`92%`), Payments (`2/3`), Sessions (`48`).
    - **Interactive Training Timeline**: Modular syllabus checklist with interactive completion checkboxes (Orientation, Workshop Safety, Basic Tools, Welding Fundamentals, Advanced Welding, Final Practical, Completion).
    - **Programme Details Card**: Fee ₦150,000, Paid in full, Next payout ₦50,000, Next session Thursday 28 August.
    - **Dual Action Button Variants**: Default operational controls (`Mark as Completed`, `Message`, `Write Recommendation`) and recommended state variant (`Recommend Daniel`, `Back to apprentices`).
    - **Confirmation Modals**: Simple modal (*Has this apprentice completed training?*) and comprehensive payout confirmation modal (*Confirm apprenticeship completion?* with 92% attendance, 48 active days, ₦50,000 final payout release note).
    - **Graduation Celebration View**: High-contrast graduation card (*Daniel Eze has graduated · His certificate is now on his BlueFixx profile, and your final payout of ₦50,000 has been released*) with `View certificate` and `Back to my apprenticeships` navigation.

20. **`ArtisanPersonalDetailsView.tsx` (`14 · Settings & account: Artisan Web · Edit profile`)**:
    - Profile Photo Uploader with camera badge and PNG/JPG upload requirements helper text.
    - Personal Details Form: First name, Last name, Phone number, Email address, Physical residential/workshop address, Emergency contact.
    - Accessible actions: `Cancel` and `Save changes` with live feedback.

21. **`ArtisanCreatePinView.tsx` (`14 · Settings & account: Artisan Web · Create PIN`)**:
    - Dedicated transaction security PIN configuration matching Figma.
    - Shield lock icon, confidentiality notice, 4 interactive PIN digit boxes.
    - Native hardware/device keyboard input handling with auto-advance and backspace navigation (on-screen keypad omitted per requirement).
    - Direct `Create PIN` CTA with validation feedback.

22. **`ArtisanReferralView.tsx` (`Artisan Web · Referral`)**:
    - Header `< Profile` return navigation and `Invite & earn` page title.
    - Dual Hero Cards:
      - Invite Card: Dark blue brand card (`Earn ₦5,000 when they complete their first job`), unique referral code pill (`BLUE-JOHN`), and dual `Share code` and `Copy link` trigger buttons with clipboard copy feedback.
      - Promo Card: High-contrast yellow promotional card (`Double Referral Week`, 5 days left banner, and doubled reward highlight).
    - 4 Stat Metrics: `₦25,000 Earned`, `12 Invited`, `7 Joined`, `5 Activated`.
    - 5-Step Referral Progress Timeline: Visual sequential timeline tracking conversion from `1 Joined`, `2 Completed verification`, `3 Won first job`, `4 Completed first job`, to `5 Reward paid ₦5,000`.
    - Filterable referral activity ledger (`All`, `In progress`, `Reward earned`, `Not qualified`) with cards for Daniel James, Chiamaka Okator, Fatima Yusuf, Peter Adelowo, phone invite, Sam O., and Solomon Davies.

23. **`ArtisanSettingsOverviewView.tsx` (`Artisan Web · Settings`, `Delete account dialog`, and `Log out dialog`)**:
    - Complete settings dashboard matching Figma *Artisan Web · Settings*:
      - Profile Header: Avatar, artisan name (`John Obiora`), address (`Independence Layout, Enugu`), and `Edit` action leading to `ArtisanPersonalDetailsView`.
      - Verification section: Identity verification (`Verified`) and Competence verification (`2 of 4`).
      - Account section: Personal details, Security & Transaction PIN, Notifications, Language.
      - Payments section: Bluefixx Wallet (`₦168,000`), Payout account (`GTBank •••• 6789`), Transaction history.
      - Safety section: Safety Center, Job insurance, Emergency contacts (`Ada Obiora`), Report an incident.
      - Support section: Help center, Contact support (`0700 258 3349 · 24/7`), Report a problem.
      - Referral section: Invite & earn (`₦25,000 earned so far`).
      - Modals:
        - *Log out dialog*: `Log out of BlueFixx?` ("You will need your phone number and OTP to log back in. Active jobs will continue as normal.") with `Cancel` and `Log out`.
        - *Delete account dialog*: `Delete BlueFixx account?` ("This permanently removes your jobs, reviews, certificates and apprenticeship. Withdraw your ₦168,000 balance first. This cannot be undone.") with `Cancel` and `Delete account`.

24. **`ArtisanLanguageSettingsView.tsx` (`Artisan Web · Language`)**:
    - Regional language preferences with native language subtitles matching Figma:
      - `English` (English)
      - `Igbo` (Asụsụ Igbo)
      - `Hausa` (Harshen Hausa)
      - `Yoruba` (Èdè Yorùbá)
      - `Nigerian Pidgin` (Pidgin)
    - Interactive radio selection and `Save language` CTA.

25. **`ArtisanSafetyCenterView.tsx` (`Artisan Web · Safety support`, `Safety report`, `Report submitted`)**:
    - Emergency police trigger: Red `Call police 112` button.
    - Live location sharing toggle with BlueFixx Safety Team.
    - 24/7 live job support hotline card.
    - Interactive live journey route map mockup showing the path between artisan location and customer destination.
    - Active job specifications: `Bathroom Plumbing Repair`, `Daniel C. (Customer)`, `Scheduled`, `14 Okpara Avenue, Independence Layout`.
    - Safety report modal with 6 issue categories, details textarea, and confirmation screen with 15-minute SLA.

26. **`ArtisanReportProblemView.tsx` (`Artisan Web · Report a problem` and `Artisan Web · Dispute detail`)**:
    - Problem reporting form with category tags (`Customer unreachable`, `Job scope changed`, `Additional cost refused`, `Damage claim against me`, `Safety concern`, `Payment issue`, `Other`), description textarea, photo and video evidence uploaders.
    - Safe escrow guarantee banner confirming ₦45,000 is protected during review.
    - Dispute detail workbench:
      - Amber `Disputed` badge and `Under Review` status tag.
      - Job specifications table (`BFX-PAY-123842`, `₦45,000 in dispute`, reason, customer evidence).
      - BlueFixx Dispute Support message card from Amaka with 24h photo evidence response window.
      - 4-step dispute timeline (`Customer opened dispute` → `Under review` → `Waiting for response` → `Resolved`).
      - `Message customer` and `Contact Support` actions.

27. **`ArtisanRateCustomerView.tsx` (`Reviews: Completed jobs, Rate your customer, Rating submitted`)**:
    - Completed jobs list with `Review pending` badge and `Rate Customer` trigger for `Generator repair · Daniel C. (₦60,000 paid out)`.
    - Interactive 5-star rating with dynamic feedback text (`Good with 4/5 stars`).
    - Attribute tags: `Punctual`, `Clear brief`, `Easy to find`, `Safe area`, `Help on site`.
    - Review notes textarea.
    - Rating submitted celebratory card with `Find jobs` and `Back to completed jobs` triggers.

28. **`DashboardSidebar.tsx` Artisan Navigation & Profile Accordion**:
    - Added `activeRole === "artisan"` navigation block:
      - `Home` (`/dashboard`)
      - `Jobs` (with badge `4` and accordion: `Find jobs`, `Requests`, `My quotes`, `Active jobs`, `Completed jobs`)
      - `Talent` (with accordion: `Training programmes`, `Apprentice applications`, `Active apprentices`)
      - `Messages` (with badge `1`)
      - `Profile` accordion submenu (`My profile`, `Verification`, `Earnings`) matching Figma Screenshot 02.

29. **`ArtisanNotificationsView.tsx` (`16 · Notifications: Notifications, Notifications panel, and Notifications: all caught up`)**:
    - Full notifications hub matching Figma:
      - Filter chips: `All` and `Unread`.
      - Actions: `Mark all as read` and `Clear`.
      - Chronological groups: `Today` and `Earlier` with category icons (Job, Payment, Message, Apprenticeship, Review, Verification).
      - Action routing to corresponding app views (`find-jobs`, `earnings`, `messages`, `apprenticeships-hub`, `rate-customer`, `verification`).
      - Zero state card: `You're all caught up` with bell icon and reset sample toggle.

30. **`ArtisanNotificationSettingsView.tsx` (`16 · Notifications: Notification settings`)**:
    - Notification preferences matrix matching Figma:
      - Channels: `Push`, `Email`, and `SMS`.
      - Categories: `New jobs`, `Quotes & bookings`, `Payments & payouts`, `Apprenticeship`, `Messages`, `Promotions & referrals`.
      - Interactive toggle switches with state tracking.
      - `Cancel` and `Save preferences` actions.

---

### B. Prerender Build Resolution (`CustomerHomeView.tsx`)
- **Root Cause**: `new Date().getHours()` was invoked inside a `useMemo` during Next.js SSG static prerendering for `/dashboard`. Next.js 16 prerender worker requires static determinism and threw `[BUILD_UTILS_SPAWN_1] Command "npm run build" exited with 1`.
- **Fix**: Replaced static evaluation with a `useState("Good morning")` default and moved dynamic hour calculation to `useEffect` on the client.

---

### C. Vercel Hobby Organization Workaround
Documented strategy for deploying private GitHub organization repositories on Vercel Hobby plan using GitHub Actions with `vercel-action` / Vercel CLI token deployment, or repository mirroring.

---

## 2. Verification Results
- **TypeScript Strictness**: `npx tsc --noEmit` passed with 0 errors.
- **Design Tokens**: Used semantic color tokens (`bg-[#001B40]`, `bg-[#074292]`, neutral scales) and Montserrat/Poppins typography.

---

## 3. Next Steps
1. Wire backend endpoints for Artisan actions when the Artisan API guide is provided (similar to the Talent API).
2. Wire Artisan settings and earnings pages (`/wallet` & `/account/earnings`).

1. **TypeScript Contracts (`types/talent.ts`)**:
   - Strictly typed data models matching OpenAPI schemas:
     - `TalentProgramListItem`, `TalentProgramDetail`, `TalentProgramFilterParams`, `TalentArtisan`
     - `TalentApplicationListItem`, `CreateTalentApplicationPayload`, `TalentApplicationStatus`, `TalentCurrentSituation`
     - `TalentEnrollmentDetail`, `TalentEnrollmentSummary`, `TalentMilestone`, `TalentAssignment`, `TalentAttendanceRecord`
     - `PayTalentEnrollmentPayload`, `PayTalentEnrollmentResponse`, `TalentPaymentSource`
     - `SubmitAssignmentPayload`, `ConfirmMilestoneResponse`, `ConfirmTalentCompletionResponse`
     - `TalentCertificateRecord`, `SubmitArtisanReviewPayload`, `RequestTalentRefundPayload`
     - `TalentMessage`, `SendTalentMessagePayload`, `TalentAlert`

2. **Modular Talent API Service (`lib/api/talent.ts`)**:
   - `getTalentHomeApi`: `GET /talent/home`
   - `getTalentProgramsApi`: `GET /talent/programs`
   - `getTalentProgramByIdApi`: `GET /talent/programs/{id}`
   - `submitTalentApplicationApi`: `POST /talent/programs/{id}/applications`
   - `getTalentApplicationsApi`: `GET /talent/applications`
   - `withdrawTalentApplicationApi`: `POST /talent/applications/{id}/withdraw`
   - `getTalentAlertsApi`, `createTalentAlertApi`, `deleteTalentAlertApi`: `/talent/alerts`
   - `payTalentEnrollmentApi`: `POST /talent/enrollments/{id}/pay` (with UUID `Idempotency-Key` header)
   - `getTalentEnrollmentByIdApi`: `GET /talent/enrollments/{id}`
   - `submitAssignmentApi`: `POST /talent/training/assignments/{id}/submission`
   - `confirmMilestoneApi`: `POST /talent/training/milestones/{id}/confirm`
   - `confirmTalentCompletionApi`: `POST /talent/enrollments/{id}/completion/confirm`
   - `getTalentCertificateApi`: `GET /talent/certificates/{id}`
   - `submitArtisanReviewApi`: `POST /talent/enrollments/{id}/review`
   - `getProgramMessagesApi`: `GET /talent/programs/{id}/messages`
   - `sendProgramMessageApi`: `POST /talent/programs/{id}/messages`
   - `requestTalentRefundApi`: `POST /talent/enrollments/{id}/refunds`

3. **Wallet & Financial Utilities Enhancement (`lib/api/wallet.ts`)**:
   - `getWalletActivityApi`: `GET /wallet/activity`
   - `getPaymentStatusApi`: `GET /payments/{id}`
   - `downloadPaymentReceiptApi`: `GET /payments/{id}/receipt` (blob download)
   - `getReferralHistoryApi`: `GET /account/referrals/history` in `lib/api/referrals.ts`

4. **UI Components Integration (`features/dashboard/components/talent/`)**:
   - `TalentHomeView.tsx`: Integrated `getTalentHomeApi()` for dynamic enrollment summary, session schedule in Africa/Lagos, and escrow held balance.
   - `TalentDiscoveryView.tsx`: Integrated `getTalentProgramsApi()` for trade and search filtering.
   - `MasterArtisanProfileView.tsx`: Integrated `getTalentProgramByIdApi()` for dynamic outcomes, remaining spots, and pricing.
   - `TalentApplicationFormView.tsx`: Integrated `submitTalentApplicationApi()` and binary work sample uploads via `uploadMediaFile`.
   - `TalentApplicationsListView.tsx`: Integrated `getTalentApplicationsApi()` and `withdrawTalentApplicationApi()`.
   - `TalentApprenticeshipPaymentView.tsx`: Integrated `payTalentEnrollmentApi()`, `getWalletApi()`, `verifyPaymentApi()`, and fresh idempotency key generation.
   - `TalentTrainingProgressView.tsx`: Integrated `getTalentEnrollmentByIdApi()`, `submitAssignmentApi()`, `confirmMilestoneApi()`, and PDF receipt download.
   - `ApprenticeshipCompletedModal.tsx`: Integrated `confirmTalentCompletionApi()` and `getTalentCertificateApi()`.
   - `TalentReviewsSuite.tsx`: Integrated `submitArtisanReviewApi()`.
   - `TalentMessagesView.tsx`: Integrated `getProgramMessagesApi()` and `sendProgramMessageApi()`.
   - `TalentRequestRefundView.tsx`: Integrated `requestTalentRefundApi()`.
   - `TalentReferralView.tsx`: Integrated `getReferralSummaryApi()`.
   - `TalentSafetyCenterView.tsx`: Integrated `createSupportCaseApi()`.

---

## 2. Talents / Apprentice Dashboard UI Suite (Previous Session Baseline)
Built the complete Talent/Apprentice Dashboard interface pixel-perfect against the 5 user-provided Figma design screenshots:

1. **Talent Home Screen (`TalentHomeView.tsx`)**:
   - Matching Figma *01 · Home & role switch (Talent Web · Home)*.
   - Header with dynamic personalized greeting ("Good morning, Daniel"), profile avatar, "⚡ Upgrade to Artisan" badge, and "Find opportunities" CTA.
   - Active Apprenticeship Card ("Welding & Metal Fabrication Apprenticeship" with "Advanced Welding" badge, Master artisan John Obiora credit, 65% progress bar, 92% attendance, and "Open My Apprenticeship" action).
   - Right-side cards: Next session preview ("Thursday 28 August · 8:00am · Emene workshop") and Payment escrow breakdown ("₦50,000 held in escrow").
   - "Learn another skill" section with explore card ("Home Electrical Installation · Chinedu Okafor").
   - URL-synchronized subview routing supporting `home`, `progress`, `discover`, `master-profile`, and `apply` views.

2. **Role Menu Dropdown & Header Switcher (`DashboardHeader.tsx` & `AccountMenuDropdown.tsx`)**:
   - Floating role switcher menu matching Figma *Talent Web · Role menu open*:
     - "Switch to Customer"
     - "Switch to Artisan"
     - "Switch to Talent" (highlighted when active)
   - Updated Account Menu dropdown to reflect `Talent account` when `activeRole === "apprentice"`.

3. **Training Progression & Syllabus View (`TalentTrainingProgressView.tsx`)**:
   - Matching Figma *Talent Web · Training progress*.
   - Master artisan card (John Obiora) with workshop location, direct "Message" button, and 3 key metrics cards: `Attendance: 92%`, `Hours: 48`, `Fee: 2/3`.
   - 7-stage interactive timeline (`Orientation`, `Workshop Safety`, `Basic Tools`, `Welding Fundamentals`, `Advanced Welding` [active], `Final Practical`, `Completion`).
   - Practical assignments list (`Practice butt joint, 5 samples`, `Workshop safety worksheet`) with due dates and status pills.
   - Training fee breakdown (`₦50,000` total, `₦35,000` paid, `₦15,000` balance) with downloadable receipt previews.
   - Curriculum documents section (`Programme Syllabus.pdf`, `Workshop safety guide.pdf`, `Payment receipt.pdf`).

4. **Apprenticeship Completed Celebration Modal (`ApprenticeshipCompletedModal.tsx`)**:
   - Matching Figma *Talent Web · Apprenticeship completed*.
   - Floating modal card with gold graduation cap badge.
   - "Congratulations, Daniel" certificate notification.
   - "View certificate" and "Review John" call-to-actions.

5. **Apprenticeship Discovery & Opportunities View (`TalentDiscoveryView.tsx`)**:
   - Matching Figma *02 · Discover & apply (Talent Web · Discovery)*.
   - Trade search input and interactive category filter chips (`All trades`, `Welding`, `Electrical`, `Plumbing`, `Carpentry`).
   - Apprenticeship cards grid displaying program title, master artisan name, verified badge, rating & years of experience, workshop address, duration, upfront & total fee, and remaining slots counter (`1 place left`).

6. **Master Artisan Profile View (`MasterArtisanProfileView.tsx`)**:
   - Matching Figma *Talent Web · Master artisan profile*.
   - Profile hero with verified badge, accepting apprentices chip, and stats: `12 Apprentices trained`, `4.9 Rating`, `7 yrs Experience`.
   - "What you will learn" skill tags.
   - Apprenticeships offered program cards with schedule, fee, and intake batch info.
   - Workshop portfolio image gallery.
   - Verified apprentice reviews and ratings.
   - Sticky action sidecard with "Apply for a place", "Message John", certifications list, and workshop location pin map preview.

7. **Multi-Question Application Form & Validation (`TalentApplicationFormView.tsx`)**:
   - Matching Figma *Talent Web · Application form* and *Talent Web · Application validation*.
   - Live dynamic counter: `X of 4 required questions answered`.
   - 5 questions:
     1. Why do you want to learn this trade? (textarea with character counter).
     2. What experience do you already have? (input field).
     3. Can you attend the workshop six days a week? (Yes / No cards).
     4. Which best describes your current situation? (4 selection cards).
     5. Upload examples of previous work (optional file uploader).
   - Real-time error validation state with red highlight notices.
   - Sticky applicant summary and escrow policy disclaimer.

8. **Talent Dashboard Sidebar Navigation (`DashboardSidebar.tsx`)**:
   - Branching navigation tree when `activeRole === "apprentice"`:
     - `Home` (`/dashboard`)
     - `Learn` (accordion: `Find apprenticeships`, `My applications`)
     - `Progress` (accordion: `My apprenticeship`, `Payments & receipts`)
     - `Messages` (`/messages`)
     - `Profile` (`/profile`)
     - Bottom: `Settings`, `Help & support`, and user pill with "Talent" designation.

9. **Application Sent Confirmation Screen (`TalentApplicationSentView.tsx`)**:
   - Matching Figma *Talent Web · Application sent*.
   - Green checkmark circle with confirmation message ("Response takes about 2 days").
   - Summary card with Trade, Master Artisan, Workshop location, and Duration.
   - Primary "Track my application" and secondary "Find more opportunities" buttons.

10. **My Applications Suite (`TalentApplicationsListView.tsx`)**:
    - Matching Figma *03 · Applications (Talent Web · My applications)* and empty state *Talent Web · Applications: none yet*.
    - Interactive application list displaying:
      - *Accepted*: Green banner, start date, schedule (`Monday - Saturday · 8:00 AM - 5:00 PM`), and "Make payment to enrol now" trigger.
      - *Under review*: 3-stage progress timeline (`Application submitted` → `Under review · in progress` → `Decision`).
      - *Declined*: Rationale notice and "Find another apprenticeship" trigger.
    - Full empty state view when no applications exist.

11. **Application Accepted & Declined Detail Views**:
    - `TalentApplicationAcceptedDetailView.tsx`: Matching Figma *Talent Web · Accepted detail* with acceptance card, John Obiora credentials, 72-hour enrollment hold notice, and "Continue to payment" CTA.
    - `TalentApplicationDeclinedDetailView.tsx`: Matching Figma *Talent Web · Application declined* with rejection notice and "Find other apprenticeships" CTA.

12. **Apprenticeship Payment Suite (`TalentApprenticeshipPaymentView.tsx`)**:
    - Matching Figma *04 · Payment (Talent Web · Payment selection)*:
      - Payment structure: Pay in full (`₦150,000`).
      - Multi-method selector: Bluefixx Wallet (`Balance: ₦185,500`) vs Paystack.
      - PIN Dialog modal matching *Talent Web · Payment PIN dialog* with custom numeric keypad.
      - Paystack checkout modal matching *Talent Web · Paystack checkout*.
      - Animated Payment processing spinner modal matching *Talent Web · Payment processing*.
      - 30-day refund policy protection card.

13. **30-Day Refund Policy & Refund Request Suite**:
    - `TalentRefundPolicyView.tsx`: Matching Figma *Talent Web · 30-day refund policy* with full rules, qualification criteria, escrow protection details, and "Request a refund" action.
    - `TalentRequestRefundView.tsx`: Matching Figma *Talent Web · Request a refund* with multi-reason chips, detailed textarea, destination selector, and escrow notice.
    - `TalentRefundRequestedConfirmationView.tsx`: Matching Figma *Talent Web · Refund requested* with return icon, paused payout notice, and "Back to payments" CTA.

14. **Apprenticeship Activated Confirmation View (`TalentApprenticeshipActivatedView.tsx`)**:
    - Matching Figma *Talent Web · Apprenticeship activated*.
    - Green checkmark badge, "Apprenticeship activated!" headline, and escrow safety notice.
    - Complete enrollment breakdown with reference `BFX-TRN-4417202`, start date `1 September 2025`, and payment details.
    - Action CTAs: "View Apprenticeship" and "Manage master artisan".

15. **Payment Failed State View (`TalentPaymentFailedView.tsx`)**:
    - Matching Figma *Talent Web · Payment failed (empty state)*.
    - Alert card with 48-hour place reservation hold notice before spot is forfeited to other candidates.
    - Quick recovery options: "Use wallet instead" and "Try payment again".

16. **Messaging & Mentor Communication Suite (`TalentMessagesView.tsx`)**:
    - Matching Figma *Talent Web · Inbox*, *Talent Web · Mentor conversation*, and *Talent Web · Locked offer*.
    - Interactive conversation with master artisan John Obiora with active apprenticeship status banner, live messaging, and audio note player.
    - Formal Locked Offer Agreement modal detailing master artisan terms.
    - Zero-message empty state fallback matching *Talent Web · Messages: no messages (empty state)*.

17. **Profile & Account Settings Hub (`TalentProfileSettingsView.tsx`)**:
    - Matching Figma *Talent Web · Settings*.
    - Profile hero with avatar, user credentials, and "Edit profile" action.
    - Two-column organized menu (`Account` and `Payments & Support`).
    - Standard logout and delete account actions integrated with global modals.

18. **Edit Profile View (`TalentEditProfileView.tsx`)**:
    - Matching Figma *Talent Web · Edit profile*.
    - Circular photo uploader with preview, First name, Last name, Phone number, Email, Residential address, and Emergency Contact details.

19. **Inline 4-Digit Transaction PIN Creator (`TalentTransactionPinView.tsx`)**:
    - Matching Figma *Talent Web · Create PIN*, *Talent Web · Confirm PIN*, and *Talent Web · PIN success*.
    - Implemented clean inline 4-digit input boxes with auto-focus advancing and zero dialogue popup boxes per user instruction.
    - Mismatch validation and celebratory confirmation state.

20. **Referral Program Suite (`TalentReferralView.tsx`)**:
    - Matching Figma *Talent Web · Referral (Invite & earn)*.
    - ₦3,000 per referral banner, double referral week callout (₦6,000), 1-click clipboard code copy for `BLUE-SIMEON`.
    - 4 metrics cards, 5-level milestone track (`Level 1 - Starter` to `Level 5 - Ambassador`), and tabbed referrals list (`All`, `In progress`, `Reward earned`, `Not qualified`).

21. **Workshop Safety Center & Live GPS Sharing (`TalentSafetyCenterView.tsx`)**:
    - Matching Figma *Talent Web · Safety support* and *Talent Web · Safety report sheet*.
    - Direct Emergency 112 call banner.
    - Live GPS workshop location sharing toggle with emergency contact during workshop hours.
    - Workshop verification card and modal for filing urgent safety reports.

22. **Apprenticeship Reviews Suite (`TalentReviewsSuite.tsx`)**:
    - Matching Figma *Talent Web · Completed apprenticeship: review pending* and *Talent Web · Review your master artisan*.
    - Review reminder banner, interactive 5-star rating selector, "What went well?" multi-select positive tags, review textarea, and "Reviews build trust" sidecard.

---

## 2. Prior Deliverables (Customer Dashboard & Endpoints Integration)

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


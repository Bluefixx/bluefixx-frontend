# Current Session Handoff

*Last updated: 2026-11-03 (Artisan Dashboard Suite & Prerender Build Resolution)*

---

## 1. Current Task Overview & Completed Deliverables

### A. Artisan Dashboard UI Suite (`features/dashboard/components/artisan/`)
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

13. **`ArtisanWithdrawFlowView.tsx` (`Withdrawal request, processing, sent, failed, add account`)**:
    - Complete 5-state withdrawal experience:
      - Form mode: Amount input with quick pills (₦5k, ₦10k, ₦20k, all), bank dropdown, account number, green verified name badge (`JOHN OBIORA`), name restriction notice, and fee breakdown card (₦0 withdrawal fee).
      - Processing state: Animated spinner with account transfer details and 5-minute SLA notice.
      - Sent state: Green checkmark with reference code (`BFX-WD-49180`), itemized bank breakdown, and navigation back to Home or Earnings.
      - Failed state: Red alert badge, name mismatch diagnosis (comparing profile name with bank account holder), support escalation, and account switcher.
      - Add Account view: Bank selector, 10-digit account input, real-time name validation card, and regulatory name matching guide.

14. **`DashboardSidebar.tsx` Artisan Navigation & Profile Accordion**:
   - Added `activeRole === "artisan"` navigation block:
     - `Home` (`/dashboard`)
     - `Jobs` (with badge `4` and accordion: `Find jobs`, `Requests`, `My quotes`, `Active jobs`, `Completed jobs`)
     - `Talent` (with accordion: `Training programmes`, `Apprentice applications`, `Active apprentices`)
     - `Messages` (with badge `1`)
     - `Profile` accordion submenu (`My profile`, `Verification`, `Earnings`) matching Figma Screenshot 02.

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


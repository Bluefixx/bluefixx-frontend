# Route Map

This document tracks all implemented routes in `bluefixx-frontend`.

*Rule: Do not add speculative routes. Update this file whenever a new page or route is added to `app/`.*

---

| Route Path | Application Area | Page Purpose | Shared Layout | Implementation Status | Relevant Design Reference |
|---|---|---|---|---|---|
| `/` | Onboarding / App Entry | Primary entry point starting directly with the complete Onboarding flow (Splash, Intro, Language, Welcome) | `app/layout.tsx` | Complete | `REF-ONB-001` through `REF-ONB-010` |
| `/onboarding` | Onboarding / Welcome | Dedicated onboarding flow route | `app/layout.tsx` | Complete | `REF-ONB-001` through `REF-ONB-010` |
| `/login` | Authentication | Dedicated Sign In page with email validation, remember me, error alerts, and toast notifications | `app/layout.tsx` | Complete | Customer Web · Sign In |
| `/signup` | Authentication / Registration | 6-step registration flow: 1. Create Account, 2. Phone entry, 3. OTP verification, 4. Profile photo, 5. Location, 6. Role selection | `app/layout.tsx` | Complete | Customer Web · Registration Steps 1–6 |
| `/forgot-password` | Authentication / Recovery | Password recovery via phone number and SMS OTP code | `app/layout.tsx` | Complete | Customer Web · Forgot password |
| `/dashboard` | Multi-Role Dashboard | Customer, Talent, and Artisan dashboards switch dynamically based on activeRole: Customer home, Talent apprenticeships hub, and Artisan workbench (Find Jobs, Quoting, Verification states) | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Home, Talent Web · Apprenticeships, Artisan Web · 01–05 Screenshots |
| `/explore` | Customer Discovery | Browse 29 services across 5 categories with search, category filtering, and direct quote requests | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Browse services |
| `/post-job` | Customer Booking | 8-step job posting wizard matching services (3 on top, 2 on bottom), details, photos & voice note | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Post a job: service selection & photos/voice |
| `/bookings` | Customer Bookings | Full Job posts lifecycle (Empty state, Posted jobs list, Receiving quotes, No quotes yet, Expired) + Cancel Job modal with cancellation reason; plus Active bookings and Completed tabs | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Bookings (Screenshots 1–5) |
| `/messages` | Customer Communication | Full 3-column communication suite: conversation list (Emeka Okafor, Bluefixx Support), chat window with photo attachments and waveform voice note player, booking details panel, conversation options modal (emergency 112 dial, support transfer, share location), and empty state view | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Conversation with Emeka, Bluefixx Support chat, Conversation options, Messages empty state |
| `/wallet` | Customer Financials | Wallet overview with balance card (₦85,000, ₦120,000 held for jobs in progress), dedicated multi-step Fund Account flow (amount chips, Paystack modal, processing, successful confirmation), mirror Withdrawal flow (bank selector, PIN modal, processing, successful), Payment methods and Transaction PIN settings, multi-tab transaction history, and deep Transaction Details view with breakdowns and dispute actions | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Wallet overview, Fund wallet, Withdraw wallet, Transaction detail |
| `/profile` | Customer Account | User profile, location display, verified badge, and contact information | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Sidebar Profile |
| `/settings` | Customer Settings | Complete settings suite: Overview hub, Personal details with photo upload, 3-step Transaction PIN setup, Notifications preferences, Language selector with search and Nigerian flag radios, Safety & support (112 emergency dial, live job tracking map, safety incident modal, report submitted screen), Report a problem dispute tracker with frozen escrow, and Invite & earn referral dashboard | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Settings overview, Personal details, Language, PIN wizard, Safety & support, Report a problem, Invite & earn |
| `/reviews` | Customer Reviews | Dedicated reviews management suite: Completed bookings review pending list, interactive 5-star review submission with positive tags and feedback, and review submitted confirmation with rebook CTA | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Completed bookings: review pending, Write a review, Review submitted |
| `/notifications` | Customer Alerts | Full notifications activity feed with All / Unread filter tabs, Today / Earlier timeline groupings, real-time unread badges, mark all as read, and "You're all caught up" empty state | `app/(dashboard)/layout.tsx` | Complete | Customer Web · Notifications, Notifications panel, Notifications: all caught up |
| `/artisan` | Artisan Dashboard | Dedicated artisan workbench with job alerts, active jobs, completed jobs, and earnings | `app/(artisan)/artisan/page.tsx` | Complete | Artisan Web · Workbench |
| `/talent/home` | Talent Dashboard | Apprenticeship dashboard with active programs, milestones, workshop sessions, and alerts | `app/(talent)/layout.tsx` | Complete | Talent Web · Apprenticeships |
| `/talent/discover` | Talent Discovery | Browse/search apprenticeship programs by trade, with saved availability alerts | `app/(talent)/layout.tsx` | Complete | Talent Web · Discovery |
| `/talent/discover/[id]` | Talent Discovery | Master artisan profile detail with artwork gallery and apply/message actions | `app/(talent)/layout.tsx` | Complete | Talent Web · Artisan profile |
| `/talent/discover/[id]/apply` | Talent Applications | Application form (motivation, experience, availability, work photos) | `app/(talent)/layout.tsx` | Complete | Talent Web · Apply |
| `/talent/discover/[id]/apply/sent` | Talent Applications | Application submitted confirmation | `app/(talent)/layout.tsx` | Complete | Talent Web · Application sent |
| `/talent/applications` | Talent Applications | Track and manage apprenticeship program applications | `app/(talent)/layout.tsx` | Complete | Talent Web · Applications |
| `/talent/applications/[id]` | Talent Applications | Application decision detail (accepted → continue to payment, or declined) | `app/(talent)/layout.tsx` | Complete | Talent Web · Application accepted / declined |
| `/talent/enrollments` | Talent Financials | Payments & receipts hub with wallet balance, fees, and downloadable receipts | `app/(talent)/layout.tsx` | Complete | Talent Web · Payments & receipts |
| `/talent/enrollments/[id]/payment` | Talent Financials | Apprenticeship fee payment via wallet balance or Paystack checkout | `app/(talent)/layout.tsx` | Complete | Talent Web · Payment |
| `/talent/enrollments/[id]/payment-failed` | Talent Financials | Payment failure recovery with retry or use-wallet actions | `app/(talent)/layout.tsx` | Complete | Talent Web · Payment failed |
| `/talent/enrollments/[id]/activated` | Talent Financials | Apprenticeship activated confirmation | `app/(talent)/layout.tsx` | Complete | Talent Web · Apprenticeship activated |
| `/talent/enrollments/[id]/refund-policy` | Talent Financials | Refund policy explanation before requesting a refund | `app/(talent)/layout.tsx` | Complete | Talent Web · Refund policy |
| `/talent/enrollments/[id]/request-refund` | Talent Financials | Refund request form (reason, notes, destination wallet) | `app/(talent)/layout.tsx` | Complete | Talent Web · Request refund |
| `/talent/enrollments/[id]/refund-requested` | Talent Financials | Refund requested confirmation | `app/(talent)/layout.tsx` | Complete | Talent Web · Refund requested |
| `/talent/progress` | Talent Progress | Milestones, learning progress, assignment submissions, and completion flow | `app/(talent)/layout.tsx` | Complete | Talent Web · Progress |
| `/talent/certificates` | Talent Certificates | View and copy earned training certificate code | `app/(talent)/layout.tsx` | Complete | Talent Web · Certificates |
| `/talent/reviews` | Talent Reviews | Review the master artisan and access the earned certificate | `app/(talent)/layout.tsx` | Complete | Talent Web · Reviews |
| `/talent/messages` | Talent Communication | Chat with the master artisan for the active programme | `app/(talent)/layout.tsx` | Complete | Talent Web · Messages |
| `/talent/settings` | Talent Settings | Talent profile and preference hub | `app/(talent)/layout.tsx` | Complete | Talent Web · Settings |
| `/talent/settings/edit-profile` | Talent Settings | Personal details with profile photo upload | `app/(talent)/layout.tsx` | Complete | Talent Web · Personal details |
| `/talent/settings/transaction-pin` | Talent Settings | Create or change the 4-digit transaction PIN | `app/(talent)/layout.tsx` | Complete | Talent Web · Transaction PIN |
| `/talent/settings/notifications` | Talent Settings | Notification preference toggles | `app/(talent)/layout.tsx` | Complete | Talent Web · Notifications |
| `/talent/settings/safety-support` | Talent Settings | Safety centre, emergency dial, and support reporting | `app/(talent)/layout.tsx` | Complete | Talent Web · Safety & support |
| `/talent/settings/referrals` | Talent Settings | Invite & earn referral dashboard | `app/(talent)/layout.tsx` | Complete | Talent Web · Invite & earn |

---

## Route Addition Protocol
When adding a new route:
1. Ensure the route directory is placed cleanly under `app/`.
2. Determine if a nested layout is required.
3. Record the route path, user audience, status, and Figma screenshot reference in this table.

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
| `/talent/home` | Talent Dashboard | Apprenticeship dashboard with active programs, milestones, and workshop sessions | `app/(talent)/talent/home/page.tsx` | Complete | Talent Web · Apprenticeships |
| `/talent/discover` | Talent Discovery | Browse and search for apprenticeship and training programs | `app/(talent)/talent/discover/page.tsx` | Complete | Talent Web · Discovery |
| `/talent/applications` | Talent Applications | Track and manage apprenticeship program applications | `app/(talent)/talent/applications/page.tsx` | Complete | Talent Web · Applications |
| `/talent/enrollments` | Talent Enrollments | Access active training programs and materials | `app/(talent)/talent/enrollments/page.tsx` | Complete | Talent Web · Enrollments |
| `/talent/progress` | Talent Progress | View milestones, learning progress, and training history | `app/(talent)/talent/progress/page.tsx` | Complete | Talent Web · Progress |
| `/talent/certificates` | Talent Certificates | View and download earned training certificates | `app/(talent)/talent/certificates/page.tsx` | Complete | Talent Web · Certificates |
| `/talent/reviews` | Talent Reviews | Manage reviews for programs and master artisans | `app/(talent)/talent/reviews/page.tsx` | Complete | Talent Web · Reviews |
| `/talent/settings` | Talent Settings | Talent-specific profile and preference management | `app/(talent)/talent/settings/page.tsx` | Complete | Talent Web · Settings |

---

## Route Addition Protocol
When adding a new route:
1. Ensure the route directory is placed cleanly under `app/`.
2. Determine if a nested layout is required.
3. Record the route path, user audience, status, and Figma screenshot reference in this table.

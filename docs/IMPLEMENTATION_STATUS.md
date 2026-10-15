# Implementation Status

This document tracks current progress, backlog, known issues, and next actions for `bluefixx-frontend`.

*Last updated: 2026-10-15 (Customer, Artisan & Apprentice Dashboards, Explore Services, 8-Step Post a Job & Role Switching)*

---

## 1. Completed Work
- [x] **Primary Entry Route (`/`)**: Starts with the onboarding flow (Splash -> Intro -> Language Selection -> Welcome).
- [x] **Dedicated Route Architecture**:
  - `/login`: Standalone Sign In page with email format validation, error alerts, and toast feedback.
  - `/signup`: Standalone 6-step Registration flow with stepper dots and back navigation.
  - `/forgot-password`: Standalone Account Recovery page with phone number input and SMS reset code handling.
  - `/onboarding`: Dedicated onboarding route.
  - `/dashboard`: Core marketplace home dashboard dynamically rendering Customer, Artisan, or Apprentice views based on `activeRole`.
  - `/dashboard/explore`: Comprehensive service discovery directory covering 29 services across 5 categories with real-time category filtering and search.
  - `/dashboard/post-job`: Full 8-step job posting wizard with interactive task selection, live summary card, budget ranges, and location confirmation.
  - `/dashboard/bookings`: Active & completed bookings management view.
  - `/dashboard/messages`: Live communication chat interface between customers and artisans.
  - `/dashboard/profile`: Verified user profile management view.
  - `/dashboard/settings`: Multi-language preferences and security notification settings.
- [x] **Sidebar Navigation**:
  - Implemented with "Post a Job" placed immediately after "Explore" as requested.
  - Navigation links: Home, Explore, Post a Job, Bookings, Messages, Profile.
  - Footer items: Settings, Help & Support, and My Account role indicator.
- [x] **User Type Toggle Button & Modal Switcher**:
  - Menu button next to notification bell with toggle arrows (`↕`) for switching between Customer, Artisan, and Apprentice profiles.
  - **Business Rule Enforced**:
    - Customers can switch to Artisan or Apprentice.
    - Artisans can switch to Customer or Apprentice.
    - Apprentices can switch to Customer, but the Artisan switch is strictly locked until apprenticeship training is completed (includes simulation toggle for testing).
- [x] **Top Header Controls**:
  - Location selector with quick change modal.
  - Notification bell with orange badge pip.
  - Wallet balance display widget (`₦85,000`).
  - User avatar with account dropdown menu (Profile, Settings, Log out).
- [x] **TypeScript Strict Check**: Verified with `npx tsc --noEmit` (0 errors).

---

## 2. Work in Progress
- Backend API endpoints integration via `lib/api/client.ts`.

---

## 3. Upcoming Work
- Real-time WebSockets/SSE for live chat and artisan location tracking.
- Escrow payment gateway integration (Paystack/Flutterwave).

---

## 4. Known Issues / Missing Assets
- None. All requested screens, routes, and states are complete and verified.

---

## 5. Technical Debt
- None.

---

## 6. Next Recommended Action
- Run `npm run dev` to test the full end-to-end customer and artisan journey across `/dashboard`, `/dashboard/explore`, `/dashboard/post-job`, and the user type switcher.



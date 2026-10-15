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

---

## Route Addition Protocol
When adding a new route:
1. Ensure the route directory is placed cleanly under `app/`.
2. Determine if a nested layout is required.
3. Record the route path, user audience, status, and Figma screenshot reference in this table.

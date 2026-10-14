# Design Reference Index

This document catalogs all supplied Figma screenshots, mockups, and visual references for the Bluefixx web application.

---

## 1. Reference Catalog

| Reference ID | Reference Name | File Path | Intended Page | Route | Application Area | Status | Design Notes |
|---|---|---|---|---|---|---|---|
| `REF-ONB-001` | Splash and loading | User Attachment 1 | Splash Screen | `/` & `/onboarding` | Onboarding | Implemented | Navy `#001B40` bg, brand curves, white logo, animated spinner, bottom value text. |
| `REF-ONB-002` | Introduction — verified artisans | User Attachment 2 | Intro Slide 1 | `/` & `/onboarding` | Onboarding | Implemented | Artwork (`customers.png`) with verified badge and "100%" check stat card, 3-dot indicator (pill 1 active). |
| `REF-ONB-003` | Introduction — book with confidence | User Attachment 3 | Intro Slide 2 | `/` & `/onboarding` | Onboarding | Implemented | Artwork (`workers.png`) with "1 thread" stat card, 3-dot indicator (pill 2 active). |
| `REF-ONB-004` | Introduction — careers and skills | User Attachment 4 | Intro Slide 3 | `/` & `/onboarding` | Onboarding | Implemented | Artwork (`talents.png`) with "One app" stat card, 3-dot indicator (pill 3 active). |
| `REF-ONB-005` | Language selection | User Attachment 5 | Language Selection | `/` & `/onboarding` | Onboarding / Preferences | Implemented | Split view: left hero handshake narrative covering full height to top with logo inside, right language modal. English, Igbo, Hausa, Yorùbá, Pidgin. *No flags*. |
| `REF-ONB-006` | Welcome and social sign in | User Attachment 6 | Welcome Screen | `/` & `/onboarding` | Auth / Onboarding | Implemented | Split view: left hero handshake (`customers.png`) with logo inside. Right card: Google, Apple, and Email options. Security disclaimer. |
| `REF-ONB-007` | Email sign in | User Attachment 7 | Email Sign In | `/` & `/onboarding` | Auth | Implemented | Split view: left hero worker (`workers.png`). Right card: Email, password with Show toggle, remember me, forgot password, Log In. |
| `REF-ONB-008` | Email sign in — invalid email | User Attachment 8 | Email Sign In Error | `/` & `/onboarding` | Auth | Implemented | Validation state: `1 field needs attention`, red outline on email, error helper text, subtitle prompt. |
| `REF-ONB-009` | Create account | User Attachment 9 | Create Account (Step 1 of 6) | `/` & `/onboarding` | Auth / Onboarding | Implemented | Split view: left hero talents (`talents.png`). Right card: Stepper (Step 1 of 6), Full name, phone, email, password, confirm password, Terms checkbox. |
| `REF-ONB-010` | Phone verification keypad | User Attachment 10 | Phone Verification (Step 2 of 6) | `/` & `/onboarding` | Auth / Onboarding | Implemented | Split view: left hero talents (`talents.png`). Right card: Stepper (Step 2 of 6), Nigerian phone input (`+234 803 245`), Send verification code, SMS disclaimer. |

---

## 2. Protocol for Registering a New Design Reference
When a new Figma screenshot or design reference is provided:
1. Save the reference image into `public/design-references/<area>/` or note its location.
2. Add a new row to the table above with:
   - Unique Reference ID (e.g., `REF-AUTH-001`)
   - Human-readable name
   - File path
   - Intended page and target route (e.g. `/signin`)
   - Application area (e.g. Customer, Worker, Auth, Admin)
   - Status (`Pending`, `In Progress`, `Implemented`)
   - Specific design notes (unique layout constraints, typography deviations, breakpoints)
3. Follow the implementation workflow in `docs/workflows/implement-page.md`.

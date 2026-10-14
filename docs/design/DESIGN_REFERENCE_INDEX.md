# Design Reference Index

This document catalogs all supplied Figma screenshots, mockups, and visual references for the Bluefixx web application.

---

## 1. Reference Catalog

| Reference ID | Reference Name | File Path | Intended Page | Route | Application Area | Status | Design Notes |
|---|---|---|---|---|---|---|---|
| `REF-ONB-001` | Splash and loading | User Attachment 1 | Splash Screen | `/onboarding` | Onboarding | Implemented | Navy `#001B40` bg, brand curves, white logo, animated spinner, bottom value text. |
| `REF-ONB-002` | Introduction — verified artisans | User Attachment 2 | Intro Slide 1 | `/onboarding` | Onboarding | Implemented | Artwork (`customers.png`) with verified badge and "100%" check stat card, 3-dot indicator (pill 1 active). |
| `REF-ONB-003` | Introduction — book with confidence | User Attachment 3 | Intro Slide 2 | `/onboarding` | Onboarding | Implemented | Artwork (`workers.png`) with "1 thread" stat card, 3-dot indicator (pill 2 active). |
| `REF-ONB-004` | Introduction — careers and skills | User Attachment 4 | Intro Slide 3 | `/onboarding` | Onboarding | Implemented | Artwork (`talents.png`) with "One app" stat card, 3-dot indicator (pill 3 active). |
| `REF-ONB-005` | Language selection | User Attachment 5 | Language Selection | `/onboarding` | Onboarding / Preferences | Implemented | Split view: left hero handshake narrative, right language modal. English, Igbo, Hausa, Yorùbá, Pidgin. *No flags*. |

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

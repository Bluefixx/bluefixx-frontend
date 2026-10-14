# Route Map

This document tracks all implemented routes in `bluefixx-frontend`.

*Rule: Do not add speculative routes. Update this file whenever a new page or route is added to `app/`.*

---

| Route Path | Application Area | Page Purpose | Shared Layout | Implementation Status | Relevant Design Reference |
|---|---|---|---|---|---|
| `/` | Onboarding / App Entry | Primary entry point starting directly with the complete Onboarding and Authentication flow | `app/layout.tsx` | Complete | `REF-ONB-001` through `REF-ONB-010` |
| `/onboarding` | Onboarding / Welcome | Dedicated onboarding flow route | `app/layout.tsx` | Complete | `REF-ONB-001` through `REF-ONB-010` |

---

## Route Addition Protocol
When adding a new route:
1. Ensure the route directory is placed cleanly under `app/`.
2. Determine if a nested layout is required.
3. Record the route path, user audience, status, and Figma screenshot reference in this table.

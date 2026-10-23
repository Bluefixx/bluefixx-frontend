# API Contracts & Integration Conventions

This document specifies conventions for backend integration, environment configuration, error envelopes, and API client architecture matching the BlueFixx Authentication & Customer Integration specification.

---

## 1. Centralized API Architecture (`lib/api/`)

All network communications route through the centralized, strongly-typed client in `lib/api/client.ts` with dedicated modular service files:

```
lib/api/
├── client.ts         # Axios instance, withCredentials, 401 refresh queue & ApiError normalization
├── auth.ts           # Authentication & session operations (19 endpoints)
├── customer.ts       # Customer dashboard, catalog, services & artisan discovery
├── jobs.ts           # Job post drafting, broadcasting and cancellation
├── quotes.ts         # Quote requests, counter-offers, and acceptance
├── bookings.ts       # Booking lifecycle, progress, rescheduling, and confirmation
├── wallet.ts         # Wallet balances, Paystack payments, and withdrawals
├── messages.ts       # Conversations, quote messages, and blocking
├── reviews.ts        # Verified booking reviews
├── notifications.ts  # Notifications list and preference updates
└── index.ts          # Centralized barrel export
```

### Client Usage:
```typescript
import { loginApi, getCustomerDashboardApi, getArtisansApi } from "@/lib/api";

// Example call:
const loginRes = await loginApi({ email, password });
```

---

## 2. API Conventions & Environment Variables

| Item | Contract |
| :--- | :--- |
| **Base URL** | `process.env.NEXT_PUBLIC_API_URL` (Defaults to `http://localhost:8000/api/v1` in local development) |
| **Authentication** | `Authorization: Bearer <ACCESS_TOKEN>` for protected endpoints |
| **Session Cookies** | `withCredentials: true` (`bluefixx_refresh` in dev or `__Host-bluefixx_refresh` in production) |
| **Security Headers** | `X-Requested-With: XMLHttpRequest` and dynamic `Origin: <frontendOrigin>` for CSRF protection |
| **Money Format** | Request amounts are integer kobo; returned database monetary values are decimal strings in kobo |
| **Pagination** | `limit` and `cursor` (or `offset` for artisan discovery) |

---

## 3. Standard Error Envelope

Backend responses follow the standard error envelope:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more request fields are invalid.",
    "details": {}
  }
}
```

The frontend normalizes this into an `ApiError` instance with:
- `error.status`: HTTP status code (400, 401, 403, 404, 409, 429, 500, 503)
- `error.code`: Error code string (e.g. `INVALID_CREDENTIALS`, `CHALLENGE_EXPIRED`, `OTP_COOLDOWN`, `RATE_LIMITED`)
- `error.message`: User-friendly server message
- `error.details`: Validation field map if present

---

## 4. Automatic Token Refresh Queue

When a protected API call encounters a `401 Unauthorized`:
1. The request interceptor intercepts the failure.
2. Concurrent requests are queued via a `failedQueue` promise array.
3. A single `POST /auth/refresh` is dispatched (browser sends HttpOnly refresh cookie automatically).
4. On success, `accessToken` in `sessionStorage` and in-memory store is updated, and all queued requests replay automatically with the new token.
5. On failure, all requests reject, the session is cleared, and the user is redirected to `/login`.

---

## 5. Completed Auth Flow Integration

1. **Sign-up Flow**:
   - `POST /auth/register` sends `{ fullName, phone, email, password, acceptedTerms: true }` and returns `{ challengeId }`.
   - `POST /auth/verify-phone` verifies 6-digit SMS code with `{ challengeId, code }`.
   - `POST /auth/resend-otp` requests a new code with `{ challengeId }`.
   - `POST /auth/login` logs in and establishes access token + refresh cookie.
   - `PATCH /auth/role` selects initial role (`CUSTOMER`, `ARTISAN`, or `LEARNER`).
2. **Sign-in Flow**:
   - `POST /auth/login` with `{ email, password }` sets session and redirects to `/dashboard`.
3. **Password Recovery**:
   - `POST /auth/forgot-password` with `{ email }` returns `{ challengeId }`.
   - `POST /auth/verify-reset-otp` with `{ challengeId, code }` returns `{ resetToken }`.
   - `POST /auth/reset-password` with `{ resetToken, newPassword }` completes password update.

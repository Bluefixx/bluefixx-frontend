# API Contracts & Integration Conventions

This document specifies conventions for backend integration, environment configuration, error envelopes, and mock data boundaries.

---

## 1. Centralized API Access
All network communications must pass through the centralized client in `lib/api/client.ts`:

```typescript
import { apiClient } from "@/lib/api/client";

// Example call:
const result = await apiClient<UserProfile>("/users/me");
```

Direct use of raw `fetch` or third-party HTTP clients inside components is prohibited.

---

## 2. Environment Variable Conventions
- All frontend runtime configuration is driven by `.env.example` / `.env.local`:
  - `NEXT_PUBLIC_API_URL`: Root base URL for the backend API (default: `http://localhost:8000/api` or `/api`).
  - `NEXT_PUBLIC_ENABLE_MOCKS`: Boolean flag to switch between mock handlers and network requests.
- **Security Rule**: NEVER place API private keys, database passwords, or server secrets in `NEXT_PUBLIC_*` variables.

---

## 3. Standard Request and Response Envelopes

### Successful Single Resource (`ApiResponse<T>`)
```typescript
{
  "success": true,
  "data": { ... },
  "message": "Resource loaded successfully"
}
```

### Paginated Collection (`PaginatedResponse<T>`)
```typescript
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Error Envelope (`ApiErrorResponse`)
```typescript
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": ["Invalid email format"]
  }
}
```

---

## 4. Authentication Integration Boundaries
- **Storage**: Auth tokens should be stored securely (e.g. HTTP-only cookies managed by middleware, or secure session tokens).
- **Headers**: When authenticated, `apiClient` attaches the `Authorization: Bearer <token>` header.
- **Provider Status**: No specific external auth provider (Auth0, Clerk, Firebase) is hardwired yet. Auth boundaries remain abstracted behind token/session headers.

---

## 5. Mock Data Rules
1. **Location**: Mocks must live outside JSX, in feature mock files (e.g., `features/<feature>/mocks/<feature>.mock.ts`).
2. **Realism**: Mock structures must adhere strictly to the TypeScript contracts defined in `types/`.
3. **Transparency**: Mock handlers must log a clear warning in the console when serving mock data to prevent mistaking mocks for real backend persistence.
4. **No Side Effects**: Mock actions (like submitting a form) must indicate simulated success clearly in documentation.

---

## 6. Pending Backend Endpoints
All actual endpoints (e.g. `/auth/login`, `/jobs`, `/workers`) are **Pending Backend Specification**. They will be integrated as backend contracts are formalized.

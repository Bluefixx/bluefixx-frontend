# Bluefixx Architecture & Conventions

This document explains the technical architecture, component paradigms, and code boundaries implemented in the repository.

---

## 1. Routing Conventions (Next.js App Router)
- **Root Directory**: `app/`
- **Root Layout**: `app/layout.tsx` wraps the app with Montserrat & Poppins font variables, default metadata, and global viewport settings.
- **Route Groups**: Route groups (e.g., `(auth)`, `(dashboard)`) should only be introduced when there is a concrete layout boundary separation (e.g. separate header/sidebar structure).
- **Route Creation Rule**: Do not create speculative routes until designs for that specific route are being implemented.

---

## 2. Component Organization & Hierarchy

Components are structured strictly by reuse scope:

1. **`components/ui/` (Primitives)**:
   - Atomic, domain-agnostic UI elements (`Button`, `Input`, `TextArea`, `Card`, `Badge`).
   - Clean prop interfaces extending standard HTML attributes.
   - Do not contain business logic or feature queries.
2. **`components/feedback/`**:
   - Empty states, error displays, loading skeletons, alert banners.
3. **`components/layout/`**:
   - High-level layout elements like Navbars, Footers, and Sidebars.
4. **`components/shared/`**:
   - Composite widgets shared across multiple features (e.g., StarRating, WorkerCardPreview).
5. **`features/<feature-name>/components/`**:
   - Domain-specific components tailored to a single business capability (e.g., `features/jobs/components/JobCard.tsx`).

---

## 3. Server Components vs. Client Components

- **Server Components (Default)**:
  - All page components and static UI blocks are Server Components.
  - Keeps bundle size minimal and enables server-side rendering.
- **Client Components (`"use client"`)**:
  - Reserved strictly for components using React state (`useState`, `useReducer`), effects (`useEffect`), event handlers (`onClick`, `onChange`), or browser APIs.
  - Push Client Components down to leaf components rather than wrapping entire pages.

---

## 4. Data Layer & API Boundaries

- **Client Abstraction**: `lib/api/client.ts` exports `apiClient` and `ApiError`.
- **Environment Driven**: Connects to `NEXT_PUBLIC_API_URL` (defaults to `/api`).
- **Mock Separation**:
  - When backend APIs are not yet built, mock implementations live in `features/<feature>/mocks/`.
  - Mocks are never embedded directly in JSX or production page files.
- **Security**: No credentials, private tokens, or secrets in client-accessible code.

---

## 5. State Management Conventions

- **Local State**: Use `useState` / `useReducer` for component-level UI state (e.g., modal visibility, dropdown open).
- **URL State**: Use URL search params (`useSearchParams`, `useRouter`) for filter, tab, and pagination state to ensure shareable URLs.
- **Global / Server State**: Do not install global state libraries (Redux, Zustand) or server-state libraries (TanStack Query) until concrete multi-page state sharing justifies the dependency.

---

## 6. Styling & Design Tokens

- Styling is managed exclusively with **Tailwind CSS v4** theme tokens in `app/globals.css`.
- Avoid ad-hoc inline styles or hardcoded arbitrary values (e.g., avoid `text-[#001B40]`; use `text-primary-900`).
- Use the helper `cn(...)` from `lib/utils/cn.ts` for conditional class joining.

---

## 7. Error Handling & Resilience

- **API Failures**: Caught and transformed via typed `ApiError` instances.
- **UI Error Boundaries**: Render `components/feedback/ErrorDisplay` with retry capabilities.
- **Form Validation**: Display inline error messages on input fields with `aria-invalid` and `aria-describedby` for assistive technologies.

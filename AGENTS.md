# AGENTS.md — Bluefixx Frontend Repository Guidelines

This document serves as the primary instruction and alignment guide for all AI coding assistants, agents, and engineers contributing to the **Bluefixx Frontend** repository (`bluefixx-frontend`).

---

## 1. Project Purpose & Core Philosophy

**Bluefixx** is a service marketplace connecting customers with skilled workers, verified artisans, and apprenticeship opportunities.
- **Real Product**: This is a production application built iteratively from Figma designs.
- **Maintainability & Context Preservation**: Different AI models and engineers work on this codebase across independent sessions. All architectural decisions, component inventory, route tracking, and handoffs must remain documented in `docs/` so future sessions have full context without chat history.
- **Quality over Speculation**: Build only what is specified in designs or current scope. Do not invent speculative backend endpoints, fake database calls, or unrequested features.

---

## 2. Technology Stack & Key Tooling

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19 (Server Components by default, Client Components where interactivity/state is needed)
- **Language**: TypeScript 5 (Strict Mode; no `any` casts)
- **Styling**: Tailwind CSS v4 using CSS Theme Tokens in `app/globals.css`
- **Typography**: Montserrat (primary UI font) and Poppins (headings/secondary) via `next/font/google`
- **Icons**: SVG assets located in `public/icons/` and Lucide React when needed
- **Build / Dev Rule**: The user prefers to execute `npm run build` and `npm run dev` directly to conserve quota. Do not run daemon builds or continuous watchers without request.

---

## 3. Directory Structure & Architecture Conventions

The repository follows a clean, modular structure:

```
bluefixx-frontend/
├── app/                  # Next.js App Router routes and pages
│   ├── globals.css       # Design tokens, typography utilities, and themes
│   ├── layout.tsx        # Root layout, fonts, metadata
│   └── page.tsx          # Current landing / foundation status page
├── components/
│   ├── ui/               # Reusable primitive UI components (Button, Input, Card, Badge, etc.)
│   ├── shared/           # Cross-feature composite components
│   ├── layout/           # Shared layout components (Navbar, Sidebar, Footer)
│   └── feedback/         # Feedback & state components (EmptyState, ErrorDisplay, etc.)
├── features/             # Feature-specific modules (jobs, profiles, auth, etc.)
├── lib/
│   ├── api/              # Centralized API client abstraction
│   ├── utils/            # Utility helpers (cn, formatters)
│   └── constants/        # Centralized app configuration & route constants
├── types/                # Shared TypeScript contracts and interfaces
├── config/               # App configuration
├── docs/                 # Continuous project documentation
│   ├── design/           # Design reference index and notes
│   ├── handoffs/         # Active handoff state and session transitions
│   └── workflows/        # Workflows for implementing, reviewing, and handing off
├── public/
│   ├── icons/            # Brand SVG icons
│   └── images/           # Static image assets
├── .env.example          # Environment variable template
└── tsconfig.json         # TypeScript configuration with @/* path aliases
```

### Architectural Rules:
1. **Server vs. Client Components**:
   - Default to Server Components (`async` data fetching, static rendering).
   - Use `"use client"` only at leaf levels where React hooks (`useState`, `useEffect`), event handlers, or browser APIs are required.
   - Never mark an entire page tree as `"use client"` unnecessarily.
2. **Path Aliasing**:
   - Always import using `@/components/...`, `@/lib/...`, `@/types/...`, etc.

---

## 4. Design System & Styling Rules

The Bluefixx design system is synchronized with `bluefixx-website`:
- **Primary Brand Color**: `--color-primary-900` (`#001B40`)
- **Secondary Brand Color**: `--color-secondary-700` (`#074292`)
- **Neutral Scale**: `--color-neutral-100` (`#FFFFFF`) to `--color-neutral-1000` (`#0F1115`)
- **Typography Scale**: Pre-defined classes in `app/globals.css`:
  - Headings: `.text-h1` through `.text-h5`
  - Subtitles: `.text-s1`, `.text-s2`
  - Body: `.text-b1` (regular 16px), `.text-b2` (medium 16px), `.text-b3` (regular 14px), `.text-b4` (medium 14px)
  - Captions & Labels: `.text-c1` (12px), `.text-c2` (medium 12px), `.text-label`
  - Buttons: `.btn-giant`, `.btn-large`, `.btn-medium`, `.btn-small`, `.btn-tiny`
- **Shadows**: `.card-shadow-mobile`, `.details-shadow`
- **Rule**: Do not hardcode ad-hoc hexadecimal color values or inconsistent pixel margins. Use semantic token classes (e.g. `bg-primary-900`, `text-neutral-700`, `border-neutral-300`).

---

## 5. Component Reuse & Development Rules

1. **Check Existing Inventory**: Before building any UI component, check `docs/COMPONENT_INVENTORY.md` to see if a primitive or shared component already exists.
2. **Composition over Complexity**: Build small, focused components using composition. Avoid components with excessive boolean props or nested conditionals.
3. **Accessibility**:
   - All interactive elements must have semantic tags (`<button>`, `<a>`, `<input>`).
   - Provide accessible labels, `aria-describedby` for error states, and visible focus rings.
   - Respect reduced motion and color contrast requirements.

---

## 6. API and Mock Data Boundaries

1. **Centralized Client**: All API communications must route through `lib/api/client.ts` (`apiClient`).
2. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` for backend endpoint base.
   - `NEXT_PUBLIC_ENABLE_MOCKS` to toggle mock responses.
   - **Never** expose secrets in client-side environment variables (`NEXT_PUBLIC_*`).
3. **Mock Data Separation**:
   - Store mock data in dedicated feature mock files (e.g., `features/<feature>/mocks/`).
   - Never embed large raw mock data objects directly inside JSX components.
   - When returning mock responses, make it obvious in logs and types that mocks are active.

---

## 7. Screenshot-Driven Workflow for Coding Agents

When given a Figma screenshot or page implementation task:
1. **Analyze First**: Follow `docs/workflows/implement-page.md`. Inspect layout, typography, colors, responsive flow, and required data.
2. **Check Shared Assets**: Verify what can be reused from `components/ui/` and `public/icons/`.
3. **Implement**: Build the page using Server Components where possible and leaf Client Components for interactivity.
4. **Self-Review**: Follow `docs/workflows/review-page.md`. Verify visual alignment, type safety, accessibility, and console cleanliness.
5. **Update Documentation**:
   - If a new route was created: update `docs/ROUTE_MAP.md`.
   - If a reusable component was added: update `docs/COMPONENT_INVENTORY.md`.
   - If an architectural decision was made: update `docs/DECISIONS.md`.
   - Update `docs/IMPLEMENTATION_STATUS.md`.
   - Update `docs/handoffs/CURRENT_HANDOFF.md`.

---

## 8. Git and Safety Rules

- Do not commit secrets, `.env`, or `.env.local` files.
- Do not reset, discard, or overwrite unrelated changes or existing files without a clear reason.
- Respect TypeScript strictness. Never bypass errors with `@ts-ignore` or `any` without explicit justification.

# Architecture Decision Log (ADRs)

This document tracks significant architectural decisions made in `bluefixx-frontend`.

---

## ADR-001: Next.js 16 App Router with Server Components Default
- **Date**: 2026-10-13
- **Status**: Accepted
- **Context**: The repository was initialized with Next.js 16 and App Router.
- **Decision**: Adopt App Router conventions with React Server Components as the default. Client Components (`"use client"`) are restricted to interactive leaves.
- **Rationale**: Keeps client bundle sizes small, optimizes initial page loads, and aligns with modern React standards.

---

## ADR-002: Tailwind CSS v4 Theme Token Synchronization
- **Date**: 2026-10-13
- **Status**: Accepted
- **Context**: The sibling repository `bluefixx-website` contains established brand tokens (Primary 900 `#001B40`, Secondary 700 `#074292`, Neutral scales, and typography classes).
- **Decision**: Mirror the exact Bluefixx brand tokens, typography scales, and button sizes into `app/globals.css` using Tailwind CSS v4 `@theme` directives.
- **Rationale**: Ensures complete visual continuity across the marketing website and web application while avoiding hardcoded ad-hoc styles.

---

## ADR-003: Zero-Dependency `cn` Classname Composition Utility
- **Date**: 2026-10-13
- **Status**: Accepted
- **Context**: Combining dynamic Tailwind classes requires conditional joining.
- **Decision**: Implemented a lightweight, zero-dependency `cn` helper in `lib/utils/cn.ts` supporting strings, arrays, booleans, and object conditional syntax.
- **Rationale**: Avoids unnecessary external dependencies (`clsx`, `tailwind-merge`) until complex merging edge cases strictly require them.

---

## ADR-004: Centralized API Client and Mock Boundary
- **Date**: 2026-10-13
- **Status**: Accepted
- **Context**: Frontend pages will be built iteratively from Figma designs before backend APIs are complete.
- **Decision**: Established a centralized `apiClient` in `lib/api/client.ts` with typed error handling and mock separation. Mock data is forbidden from inline JSX.
- **Rationale**: Allows seamless swapping between mock datasets and real production APIs without rewriting UI components.

---

## ADR-005: Retain Root App Structure with Path Alias `@/*`
- **Date**: 2026-10-13
- **Status**: Accepted
- **Context**: The existing Next.js setup uses `app/` at the root directory with `"paths": { "@/*": ["./*"] }`.
- **Decision**: Maintain root `app/`, `components/`, `lib/`, `types/`, and `docs/` structure instead of forcing a migration to `src/`.
- **Rationale**: Preserves working TypeScript path mappings and avoids breaking Next.js configuration or existing files unnecessarily.

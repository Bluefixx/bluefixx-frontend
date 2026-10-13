# AI Context & Session Quickstart

This file is the concise entry point for any new AI session or coding agent working on **Bluefixx Frontend**.

---

## 1. Product Summary
**Bluefixx** is a multi-sided marketplace connecting customers with skilled workers, verified artisans, and apprenticeship/talent opportunities.

## 2. Current Stack & Configuration
- **Framework**: Next.js 16.4.0 (App Router)
- **React**: React 19.3.0
- **TypeScript**: Strict Mode enabled, `@/*` maps to `./*`
- **Styling**: Tailwind CSS v4 configured via theme tokens in `app/globals.css`
- **Fonts**: Montserrat (primary UI) and Poppins (headings) from `next/font/google`
- **Icons**: Shared SVG brand assets in `public/icons/`

## 3. Directory Layout Highlights
- `app/`: Next.js App Router root layout, global styles, and route pages
- `components/ui/`: Reusable primitives (`Button`, `Input`, `TextArea`, `Card`, `Badge`)
- `components/feedback/`: Feedback components (`EmptyState`, `ErrorDisplay`)
- `lib/api/`: Centralized API client abstraction (`lib/api/client.ts`)
- `lib/constants/`: App constants (`APP_CONFIG`, `ROUTES`)
- `lib/utils/`: Lightweight utilities (`cn.ts`)
- `types/`: Common UI & API contract types
- `docs/`: Continuous system documentation and tracking

## 4. Current Implementation Status
- **Foundation Phase Complete**: Design system tokens, typography scales, fonts, assets, and foundational UI primitives are in place and verified.
- **Next Phase**: Ready for iterative, screenshot-driven implementation of pages from Figma designs.

## 5. Key Documentation Index
- [AGENTS.md](../AGENTS.md): Full coding guidelines & rules
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md): Detailed product scope and target groups
- [ARCHITECTURE.md](./ARCHITECTURE.md): Component, data, and boundary architecture
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md): Design tokens, colors, typography, and spacing
- [COMPONENT_INVENTORY.md](./COMPONENT_INVENTORY.md): Catalog of implemented reusable components
- [ROUTE_MAP.md](./ROUTE_MAP.md): Tracked application routes
- [API_CONTRACTS.md](./API_CONTRACTS.md): API conventions and mock rules
- [DECISIONS.md](./DECISIONS.md): Architectural Decision Records (ADRs)
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md): Current tasks and backlog
- [CURRENT_HANDOFF.md](./handoffs/CURRENT_HANDOFF.md): Active handoff state between sessions

## 6. Instructions for Continuing Work
1. Read [CURRENT_HANDOFF.md](./handoffs/CURRENT_HANDOFF.md) to understand the immediate next task.
2. Read [implement-page.md](./workflows/implement-page.md) before writing new pages.
3. Reuse components from `components/ui/` rather than recreating primitives.
4. When concluding your session, update `docs/IMPLEMENTATION_STATUS.md` and `docs/handoffs/CURRENT_HANDOFF.md`.

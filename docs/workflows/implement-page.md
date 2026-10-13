# Workflow: Implement Page from Screenshot / Figma

Follow this step-by-step workflow whenever a new Figma screenshot or design reference is supplied.

---

## Step 1: Identify and Log Reference
1. Determine the target route (e.g. `/signin`, `/jobs/create`, `/dashboard`).
2. Log the reference in `docs/design/DESIGN_REFERENCE_INDEX.md`.

## Step 2: Visual & Structural Analysis
1. Inspect the layout: header, sidebar, grid, columns, margins.
2. Inspect typography: identify headings (`.text-h1` - `.text-h5`), body sizes, weights.
3. Inspect colors: map elements to primary (`primary-900`), secondary, neutral, or semantic tokens.
4. Inspect interactive elements: buttons, form inputs, toggles, dropdowns.
5. Identify responsive adaptation: how elements stack on mobile (`< 768px`) vs desktop.

## Step 3: Reuse Inventory Check
1. Consult `docs/COMPONENT_INVENTORY.md` to identify existing components to reuse (`Button`, `Input`, `Card`, `Badge`, etc.).
2. Do not rebuild primitives that already exist.

## Step 4: Component & Data Scaffolding
1. Plan component hierarchy:
   - Page Server Component (`app/<route>/page.tsx`).
   - Feature-specific interactive components in `features/<feature>/components/`.
   - Feature mock data in `features/<feature>/mocks/` (if API is pending).
2. Produce a concise internal plan before writing code.

## Step 5: Implementation
1. Build with semantic HTML (`<main>`, `<header>`, `<section>`, `<article>`, `<button>`).
2. Apply Tailwind design tokens from `app/globals.css`.
3. Add accessible attributes (`aria-label`, `aria-describedby`, form `label` associations).
4. Implement responsive breakpoints (`sm:`, `md:`, `lg:`).

## Step 6: Self-Review & Verification
1. Run the checks outlined in `docs/workflows/review-page.md`.
2. Compare rendered output with the reference image.
3. Fix discrepancies.

## Step 7: Documentation Updates
1. Add the new route to `docs/ROUTE_MAP.md`.
2. Record any newly created shared components in `docs/COMPONENT_INVENTORY.md`.
3. Update `docs/IMPLEMENTATION_STATUS.md`.
4. Update `docs/handoffs/CURRENT_HANDOFF.md`.

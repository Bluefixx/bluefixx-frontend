# Workflow: Review Implemented Page

Follow this verification checklist after implementing any page or major component.

---

## 1. Visual & Layout Fidelity
- [ ] **Alignment & Grid**: Container widths (`max-w-7xl`, `max-w-5xl`) and alignments match the design.
- [ ] **Spacing**: Padding, margins, and gaps follow design system scales without ad-hoc values.
- [ ] **Typography**: Correct scale classes used (`.text-h1` - `.text-h5`, `.text-b1` - `.text-b4`, `.text-s1`, `.text-s2`).
- [ ] **Color Tokens**: Only semantic color tokens used (e.g. `bg-primary-900`, `text-neutral-700`). No raw arbitrary hex strings.
- [ ] **Borders & Shadows**: Verified against `.card-shadow-mobile` or `.details-shadow`.

## 2. Interactive & State Validation
- [ ] **Buttons**: All buttons have correct size, variant, hover state, and disabled behavior.
- [ ] **Form Inputs**: Validation messages, focus rings, and placeholder texts function correctly.
- [ ] **Loading & Empty States**: Appropriate loading skeletons or `EmptyState` rendered when collections are empty.
- [ ] **Error States**: `ErrorDisplay` or field error messages rendered upon submission failure.

## 3. Responsiveness
- [ ] Mobile viewport (< 640px): Cards stack vertically, padding compresses appropriately, buttons expand to full width if specified.
- [ ] Tablet viewport (640px - 1024px): Grid adjusts gracefully.
- [ ] Desktop viewport (> 1024px): Max container constraints enforced.

## 4. Accessibility & Code Hygiene
- [ ] Proper semantic tags used (`<button>` instead of clickable `<div>`).
- [ ] Interactive elements have keyboard focus visibility.
- [ ] Form inputs have associated `<label>` elements.
- [ ] No `any` types used; strict TypeScript types defined.
- [ ] No console errors or hydration warnings.

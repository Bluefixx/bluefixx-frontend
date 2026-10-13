# Bluefixx Design System Specification

This document details the visual foundation, tokens, typography, and component specifications synchronized with the official Bluefixx brand guidelines and `bluefixx-website`.

---

## 1. Brand Identity
- **Name**: Bluefixx (Bluefixx LLP)
- **Tagline**: Trusted hands for every job
- **Primary Identity**: Deep Blue `#001B40` (Primary 900)
- **Secondary Identity**: Vibrant Corporate Blue `#074292` (Secondary 700)
- **Logo Asset**: `public/icons/logoMain.svg`

---

## 2. Color Tokens

### Primary Palette (Blue)
| Token | Hex Value | Usage |
|---|---|---|
| `--color-primary-100` | `#E6F0FA` | Subtle badges, active link backgrounds |
| `--color-primary-200` | `#B3D1F5` | Disabled button states, light borders |
| `--color-primary-300` | `#80B3EB` | Soft brand borders |
| `--color-primary-400` | `#4D94E0` | Hover accents |
| `--color-primary-500` | `#1A75D6` | Focus outlines, interactive links |
| `--color-primary-600` | `#0D5CB8` | Medium brand elements |
| `--color-primary-700` | `#094285` | Hover on secondary elements |
| `--color-primary-800` | `#052F5F` | Button hover state |
| `--color-primary-900` | `#001B40` | **Core Brand Primary**, default button background |
| `--color-primary-1000` | `#000F24` | Ultra-dark text / headers |

### Secondary Palette
| Token | Hex Value | Usage |
|---|---|---|
| `--color-secondary-100` | `#E6EFFB` | Subtle card highlights |
| `--color-secondary-200` | `#B5D0F4` | Light secondary accents |
| `--color-secondary-700` | `#074292` | **Brand Secondary**, key subheadings |
| `--color-secondary-900` | `#031D40` | Deep secondary accents |

### Neutral Palette
| Token | Hex Value | Usage |
|---|---|---|
| `--color-neutral-100` | `#FFFFFF` | Card surfaces, pure white canvas |
| `--color-neutral-200` | `#F5F6F7` | App page background, disabled surface |
| `--color-neutral-300` | `#EAECEE` | Card borders, dividing rules |
| `--color-neutral-400` | `#D0D4D9` | Input field borders |
| `--color-neutral-500` | `#9098A3` | Placeholder text, inactive icons |
| `--color-neutral-600` | `#656E7B` | Secondary body text, caption text |
| `--color-neutral-700` | `#4C535F` | Subtext, labels |
| `--color-neutral-800` | `#303540` | High-contrast body text |
| `--color-neutral-900` | `#1E212A` | Sub-headings |
| `--color-neutral-1000` | `#0F1115` | Default body foreground |

### Semantic Palette
| Category | Light Background (100) | Core Color (200) |
|---|---|---|
| **Error / Destructive** | `#FEE2E2` (`red-100`) | `#EF4444` (`red-200`) |
| **Warning / Attention** | `#FEF3C7` (`yellow-100`) | `#F59E0B` (`yellow-200`) |
| **Success / Verified** | `#D1FAE5` (`green-100`) | `#10B981` (`green-200`) |

---

## 3. Typography

Fonts loaded via `next/font/google`:
- **Primary Sans**: `Montserrat` (`--font-montserrat`)
- **Secondary / Headings**: `Poppins` (`--font-poppins`)

### Typography Utility Classes
| Class | Font Size | Line Height | Weight | Description |
|---|---|---|---|---|
| `.text-h1` | `3.000rem` (48px) | `3.625rem` (58px) | 600 SemiBold | Page Hero Title |
| `.text-h2` | `2.500rem` (40px) | `3.000rem` (48px) | 600 SemiBold | Primary Section Title |
| `.text-h3` | `2.000rem` (32px) | `2.375rem` (38px) | 600 SemiBold | Subsection Header |
| `.text-h4` | `1.750rem` (28px) | `2.125rem` (34px) | 600 SemiBold | Card / Modal Title |
| `.text-h5` | `1.500rem` (24px) | `1.750rem` (28px) | 600 SemiBold | Component Header |
| `.text-s1` | `1.125rem` (18px) | `1.750rem` (28px) | 600 SemiBold | Large Subtitle |
| `.text-s2` | `1.000rem` (16px) | `1.500rem` (24px) | 600 SemiBold | Standard Subtitle |
| `.text-b1` | `1.000rem` (16px) | `1.500rem` (24px) | 400 Regular | Standard Body Text |
| `.text-b2` | `1.000rem` (16px) | `1.500rem` (24px) | 500 Medium | Emphasized Body |
| `.text-b3` | `0.875rem` (14px) | `1.250rem` (20px) | 400 Regular | Compact Body Text |
| `.text-b4` | `0.875rem` (14px) | `1.250rem` (20px) | 500 Medium | Compact Medium Body |
| `.text-c1` | `0.750rem` (12px) | `1.000rem` (16px) | 400 Regular | Caption / Helper |
| `.text-c2` | `0.750rem` (12px) | `1.000rem` (16px) | 500 Medium | Badge / Micro Label |
| `.text-label` | `0.750rem` (12px) | `1.000rem` (16px) | 500 Medium | Form Field Label |

---

## 4. Spacing & Layout Constraints

- **Max Content Width**: `max-w-7xl` (1280px) for general pages, `max-w-5xl` for forms/dashboards.
- **Page Container Padding**: `px-4 sm:px-6 lg:px-8`.
- **Border Radii**:
  - Small elements / badges: `rounded-sm` (2px) to `rounded-md` (6px)
  - Buttons / Inputs: `rounded-lg` (8px)
  - Cards / Modals: `rounded-xl` (12px) or `rounded-2xl` (16px)
- **Shadows**:
  - `.card-shadow-mobile`: `0px 4px 20px 0px rgba(15, 23, 42, 0.05)`
  - `.details-shadow`: `0px 16px 40px -8px rgba(88, 92, 95, 0.16)`

---

## 5. Standard Component Specs

### Buttons
- **Variants**:
  - `solid`: Background `primary-900`, text `white`, hover `primary-800`.
  - `outlined`: Transparent background, 2px border `primary-900`, text `primary-900`, hover `primary-100`.
  - `white`: Background `white`, text `neutral-1000`, border `neutral-300`.
- **Sizes**:
  - `giant`: 54px height (`px-6 py-3 rounded-lg`)
  - `large`: 44px height (`px-5 py-2.5 rounded-lg`)
  - `medium`: 38px height (`px-4 py-2 rounded-md`)
  - `small`: 32px height (`px-3 py-1.5 rounded-md`)
  - `tiny`: 26px height (`px-2 py-1 rounded-sm`)

### Form Inputs
- Surface: `bg-neutral-100` (`#FFFFFF` or subtle `#FAFAFA`).
- Border: `border-neutral-400` (`#D0D4D9`), focus `border-primary-900 ring-1 ring-primary-900`.
- Error state: `border-red-200 ring-red-200`.

### Status Badges
- Pill shape (`rounded-full`), `text-c1` or `text-c2`, subtle 100-scale background with matching colored border.

---

## 6. Accessibility & Responsiveness
- All interactive controls provide visible keyboard focus rings.
- Color contrast meets WCAG 2.1 AA standards.
- Form inputs include `aria-invalid` and `aria-describedby` error associations.

# Design System: Stockify

## 1. Visual Theme & Atmosphere
**"Suq Editorial"** — A warm, tactile, and modern Arabic-first aesthetic. It blends operational efficiency with an editorial layout. The interface feels physical, featuring a "warm paper" surface and subtle geometric paper textures (8-point star grids). It achieves clarity under pressure without feeling like a generic corporate dashboard.

## 2. Color Palette & Roles

### Brand Palette
* **Saffron / Amber (Primary)**: `oklch(0.58 0.18 48)` — Used for primary actions, branding, and leading elements.
* **Deep Sage (Secondary)**: `oklch(0.40 0.09 165)` — Used for secondary highlights and stabilizing elements.
* **Terracotta (Accent)**: `oklch(0.58 0.19 32)` — Used for distinct accents or special callouts.
* **Ink (Text)**: `oklch(0.18 0.02 60)` — Deep, soft black used for primary typography to reduce eye strain.
* **Warm Paper (Background)**: `oklch(0.974 0.014 78)` — The primary background color in light mode, simulating a tactile surface.

### Semantic Palette
* **Success**: `oklch(0.52 0.13 150)` (Green)
* **Warning**: `oklch(0.72 0.16 75)` (Yellow/Amber)
* **Error**: `oklch(0.55 0.22 22)` (Red)
* **Info**: `oklch(0.55 0.15 240)` (Blue)

### Dark Mode
A deep, cool-toned dark mode using `oklch(0.16 0.012 60)` as the base background, with soft borders (`oklch(0.30 0.018 60)`) and stark, crisp text (`oklch(0.95 0.01 80)`). The geometric background star grid remains visible but subdued (70% opacity).

## 3. Typography Rules
* **Font Family**: **Almarai** (sans, display, and serif fallback). Chosen specifically for elegant, readable Arabic typography.
* **Eyebrows**: Very small (`0.6875rem`), uppercase-styled (for English), wide letter-spacing (`0.22em`), muted text color.
* **Display Text**: Tight letter spacing (`-0.01em`) for strong, grounded headers.
* **Numbers**: Tabular and lining numerals for fast cashier scanning (`-0.02em` tracking).

## 4. Component Stylings
* **Cards/Containers**: Feature varying degrees of rounded corners (from `sm` `0.375rem` up to `3xl` `1.75rem`). They sit on near-white (`oklch(0.992 0.006 80)`) or warm-tan backgrounds. 
* **Interactivity (Lift)**: Cards and interactive elements elevate on hover (`translateY(-2px)`) with a deep, diffused drop shadow (`0 18px 40px -28px oklch(0.18 0.02 60 / 0.25)`).
* **Dividers**: Ornamental hairline dividers with a center motif, bringing an editorial, traditional feel to structural lines.

## 5. Layout Principles
* **RTL-First Structure**: All layouts prioritize right-to-left visual flow.
* **Animations**: Intentional and brief. Uses a standard `rise-in` animation (fade in + upward translate) easing out with a cubic-bezier `(0.2, 0.7, 0.2, 1)` for a smooth, elastic-free entry.
* **Scrollbars**: Custom 8px wide, styled with the surface border color to maintain the immersive "Suq Editorial" theme without relying on default browser styling.

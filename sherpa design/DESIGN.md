# Design System Strategy: High-End Editorial AI

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

We are moving away from the cluttered, "dashboard-heavy" look of typical SaaS tools. Instead, we are building a high-end strategy publication that happens to be powered by AI. The goal is to make the user feel like they are interacting with a bespoke intelligence briefing. 

To achieve this, we prioritize **Intentional Asymmetry** and **Tonal Depth**. Use generous white space (referencing the **spacing-2** or **spacing-3** tokens) to create an expensive, "airy" feel. Break the rigid grid by overlapping glass-morphic cards over subtle background shifts, ensuring the UI feels like a curated canvas rather than a set of boxes.

---

## 2. Colors & Surface Philosophy
The palette is built on "Alabaster" neutrals and "Precision Blue" accents, designed to feel cool, calm, and hyper-competent.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or layout. Containers must never be "boxed in" by lines. Instead, define boundaries using:
- **Background Shifts:** Place a `surface_container_low` (#f2f4f7) element against a `surface` (#f7f9fc) background.
- **Tonal Transitions:** Use a soft shift from `surface_container_lowest` (#ffffff) to `surface_container` (#eceef1) to indicate a change in context.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper or frosted glass.
- **Level 0 (Foundation):** `surface` (#f7f9fc).
- **Level 1 (Sections):** `surface_container_low` (#f2f4f7) for large content areas.
- **Level 2 (Interaction):** `surface_container_lowest` (#ffffff) for primary cards or data inputs to make them "pop" forward.
- **The "Glass & Gradient" Rule:** For floating modals or high-energy AI insights, use `surface_container_lowest` at 80% opacity with a `backdrop-blur` of 20px. Apply a subtle linear gradient from `primary` (#0058be) to `primary_container` (#2170e4) only on high-value CTAs to give them a "jewel-like" sapphire glow.

---

## 3. Typography: Editorial Sophistication
We use **DM Sans** to bridge the gap between tech-modernity and editorial tradition.

- **Display & Headline:** Use `display-lg` and `headline-lg` with a `-0.02em` letter-spacing for a tight, authoritative look. These should feel like magazine mastheads.
- **Body & Captions:** Use `body-md` (#0.875rem) with an increased letter-spacing of `+0.01em` to ensure the AI-generated text feels readable and premium.
- **The Hierarchy Rule:** Never use more than three font weights on a single screen. Favor `ExtraBold` for headlines and `Medium` or `Regular` for body text. Use `label-sm` in `primary` (#0058be) uppercase for category tags to inject "Precision Blue" energy into the editorial flow.

---

## 4. Elevation & Depth
In this system, depth is a function of light and tone, not shadows.

- **The Layering Principle:** Achieve lift by "stacking." A `surface_container_lowest` card placed on a `surface_container_high` background creates a natural, soft-touch elevation without artificial shadows.
- **Ambient Shadows:** If a floating element (like a dropdown) requires a shadow, use a diffuse, multi-layered blur. 
    - *Formula:* `0px 10px 40px rgba(25, 28, 30, 0.04)`. The shadow must be a tinted version of `on_surface` to feel like natural ambient light.
- **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` token at **15% opacity**. This creates a "suggestion" of a boundary rather than a hard wall.

---

## 5. Components

### Buttons
- **Primary:** High-energy `primary` (#0058be) fill with `on_primary` (#ffffff) text. Use `lg` (0.5rem) rounding. No shadow; use a 2px inset highlight on the top edge for a "machined" look.
- **Secondary:** Transparent background with a `Ghost Border` and `primary` text.
- **Tertiary:** Text-only with an underline that appears on hover, utilizing the 3.5 (1.2rem) spacing for touch targets.

### Input Fields
- **Styling:** Use `surface_container_lowest` as the fill.
- **Interaction:** On focus, do not use a heavy border. Instead, shift the background color slightly to `primary_fixed` (#d8e2ff) or add a subtle 2px "Precision Blue" bottom-bar.

### Cards & Lists
- **The Divider Ban:** Strictly forbid 1px horizontal lines between list items. Use the **Spacing Scale** (specifically `spacing-4` or `1.4rem`) to create "White Space Dividers." 
- **AI Insight Cards:** Use a soft gradient background (from `surface_container_lowest` to `primary_fixed_dim` at 10% opacity) to signify AI-generated content.

### Floating Briefing (Custom Component)
A signature "Curator" component that sits asymmetrically on the right side of the screen. Use a Glassmorphic background with `surface_container_highest` at low opacity to present key AI summaries.

---

## 6. Do's and Don'ts

### Do
- **Do** use asymmetrical layouts where the left margin is wider than the right to mimic a modern publication.
- **Do** use "Precision Blue" sparingly. It is a laser, not a paint bucket. Use it for the "one thing" you want the user to do.
- **Do** lean into the `xl` (0.75rem) rounding for large containers to soften the "AI" clinical feel.

### Don't
- **Don't** use pure black (#000000). Always use `on_background` (#191c1e) for text to maintain the "Alabaster/Ether" softness.
- **Don't** use standard 12-column grids for everything. Allow content to flow into "Editorial Columns" (600px–800px wide) for better readability.
- **Don't** use 1px borders. If you feel you need a border, try adding more white space first.
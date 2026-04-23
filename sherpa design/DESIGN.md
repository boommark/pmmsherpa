# PMM Sherpa Design System

> Updated April 2026 after homepage redesign v2.

## 1. Creative North Star

**"The Digital Curator"** — a high-end strategy publication powered by AI. The user should feel like they're interacting with a bespoke intelligence briefing, not a SaaS dashboard.

Prioritize **clarity and density** over decorative white space. Every element earns its vertical space. Reference sites: Tebra.com (trust-forward, compact feature sections), Cyclops.ai (clean 2x2 grids, inline SVG icons).

---

## 2. Colors

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#0058be` | CTAs, icon accents, links, tags |
| `primary-hover` | `#004a9e` | Button hover states |
| `primary-gradient` | `#0058be → #2170e4` | Gradient text, hero CTA fills |
| `on-primary` | `#ffffff` | Text on primary backgrounds |
| `primary-fixed` | `#d8e2ff` | Input focus highlights |

### Neutrals (Alabaster System)

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#191c1e` | Headlines, nav text |
| `text-body` | `#3a3f47` | Body copy |
| `text-secondary` | `#4a4f57` | Subtitles, descriptions (improved contrast from old #5f6368) |
| `text-muted` | `#5f6368` | Nav links, footer, tertiary labels |
| `surface` | `#f7f9fc` | Page background |
| `surface-section` | `#f8f9fd → #f0f3fa` | "What It Does" section gradient |
| `border-subtle` | `#e8ecf4` | Card borders (at 60% opacity) |
| `border-divider` | `#e2e5ea` | Section dividers (at 50% opacity) |

### Dark Mode (Dark sections: Testimonials, How It Works)

| Token | Hex | Usage |
|-------|-----|-------|
| `dark-bg` | `#0a1628 → #0f1d35` | Section backgrounds |
| `dark-text` | `#c8d0e0` | Body text on dark |
| `dark-muted` | `#8e9199` | Secondary text on dark |
| `dark-accent` | `#5a9cf5` | Labels, step badges on dark |
| `dark-border` | `white/[0.08]` | Card borders on dark |

### Hard Rules
- Never use pure black (`#000000`). Use `#191c1e` for text.
- `#0058be` is a laser, not a paint bucket. Use for the one thing you want the user to do.
- Amber `#f59e0b` is reserved exclusively for star ratings.

---

## 3. Typography

**Font:** System default (inherited from Tailwind). Previously DM Sans — can be reinstated if needed.

### Hierarchy

| Level | Class | Weight | Usage |
|-------|-------|--------|-------|
| Display | `text-4xl md:text-[3.5rem]` | `font-extrabold` | Hero headline only |
| Section heading | `text-3xl md:text-4xl` | `font-extrabold` | Section titles |
| Step heading | `text-2xl` | `font-semibold` | How It Works step titles |
| Feature title | `text-lg` | `font-bold` | What It Does item titles, Who It's For card titles |
| Body | `text-base` (16px) | `font-normal` | Descriptions, paragraphs |
| Body small | `text-sm` (14px) | `font-normal` | Card descriptions, technical notes |
| Label | `text-xs` | `font-semibold uppercase tracking-widest` | Section labels (WHAT IT DOES, HOW IT WORKS) |
| Tags | `text-xs` | `font-medium tracking-wide` | Feature tags (POSITIONING · MESSAGING) |

### Rules
- `tracking-[-0.03em]` on all extrabold headlines for tight, authoritative feel
- Max three font weights per screen: extrabold, semibold/bold, normal
- Body text line-height: `leading-relaxed` (1.625)
- Testimonial quotes: `text-[15px] leading-[1.7]` — slightly smaller than body for visual distinction

---

## 4. Icons

**Library:** Lucide React (installed via shadcn/ui). No PNG icons on the homepage.

### Homepage Icon Mapping

| Section | Icon | Lucide Name |
|---------|------|-------------|
| What It Does — Frame | Crosshair | `Crosshair` |
| What It Does — Consult | Speech bubble | `MessageSquare` |
| What It Does — Validate | Checkmark shield | `ShieldCheck` |
| What It Does — Grow | Upward trend | `TrendingUp` |
| Who It's For — Product Marketers | Target | `Target` |
| Who It's For — Product Managers | Box | `Box` |
| Who It's For — Founders | Rocket | `Rocket` |
| CTAs | Arrow right | `ArrowRight` |

### Styling Rules
- **Inline with title:** Icon and title on the same horizontal line (Cyclops.ai pattern)
- **"What It Does" icons:** `h-5 w-5 text-[#0058be]` with `strokeWidth={2}`
- **"Who It's For" icons:** `h-6 w-6 text-[#0058be]` with `strokeWidth={1.75}`, inside a `w-12 h-12 rounded-xl bg-[#0058be]/[0.08]` container
- **No PNG icons on landing page.** All icons must be Lucide SVGs for transparency and consistency.
- Old PNG icons in `/public/icons/` (frame.png, consult.png, etc.) are kept for potential chat UI use but are not used on the homepage.

---

## 5. Layout Patterns

### Section Padding (Global)
- Standard sections: `py-14 md:py-20`
- Testimonials section (dark): `py-12 md:py-16`
- Never exceed `py-20 md:py-28` — that creates the "wasted white space" problem

### Section Order (Homepage)
1. Nav (sticky, blur backdrop)
2. Hero (orb, headline, subtext, CTAs)
3. Logo banner (scrolling company logos)
4. Featured testimonial (shadow card, vertical layout)
5. Demo video
6. What It Does (2x2 grid, Lucide icons)
7. Testimonials (dark section, glassmorphic cards)
8. How It Works (merged with Under the Hood — 4 alternating steps with video + technical notes)
9. Who It's For (3-column cards, Lucide icons)
10. CTA (blue gradient card)
11. Footer

### "What It Does" — 2x2 Grid Pattern
```
grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0
```
Each item: icon + title inline → description → tags. Separated by `border-b` on top row.

### "How It Works" — Alternating Steps
Steps alternate text-left/video-right and video-left/text-right. Each step includes:
- Step badge (numbered circle in `bg-[#0058be]/20`)
- Capability headline (white, semibold)
- Benefit body (muted text)
- Technical note (smaller, muted, with `border-l-2 border-[#0058be]/30 pl-4`)

Step spacing: `mb-10 md:mb-14` between steps.

### Stats Bar
4-column grid at the bottom of "How It Works" section. Numbers in `text-[#5a9cf5]` extrabold, labels in muted text below.

---

## 6. Component Patterns

### Shadow Cards (Testimonials)
```
rounded-2xl bg-white p-5 md:p-7
shadow-[0_2px_20px_rgba(0,0,0,0.06)]
border border-[#e8ecf4]/40
```

### Glassmorphic Cards (Dark Section)
```
rounded-2xl p-5 md:p-6
backdrop-blur-xl
border border-white/[0.08]
shadow-[0_8px_32px_rgba(0,0,0,0.2)]
background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)
```

### Buttons
- **Primary:** `rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white font-medium px-8 h-12`
- **Secondary/Outline:** `rounded-full bg-white text-[#191c1e] border border-[#e2e5ea] h-12`
- **Ghost:** `rounded-full text-[#5f6368] hover:text-[#191c1e] hover:bg-[#f2f4f7]`
- **Inverted (on blue):** `rounded-full bg-white text-[#0058be] hover:bg-blue-50 font-semibold`

### Navigation
```
sticky top-0 z-50 bg-white/80 backdrop-blur-xl
max-w-6xl mx-auto h-16
```

---

## 7. Do's and Don'ts

### Do
- Use Lucide SVGs for all homepage icons
- Keep section padding at `py-14 md:py-20` or less
- Use `#4a4f57` for subtitle text (better contrast than `#5f6368`)
- Put icon and title on the same line for feature lists
- Use 2x2 grid for feature items when there are exactly 4
- Use alternating left/right layout for step-by-step sections with visuals

### Don't
- Use PNG icons with baked-in backgrounds on the landing page
- Use oversized decorative numbers (01, 02, 03...) — they add visual weight without information
- Exceed `py-20 md:py-28` padding on any section
- Use `text-[#5f6368]` for body/subtitle text (too low contrast) — use `#4a4f57`
- Use pure black `#000000` for text
- Create more than 3 levels of font weight per screen

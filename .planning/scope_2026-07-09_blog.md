# PMM Sherpa Blog — Feature Plan (v1 draft, for iteration)

**Status:** Design draft — iterating with Abhishek before specs/build.
**Date:** 2026-07-09

## Goal

A first-class blog at `pmmsherpa.com/blog`: SEO-grade content marketing surface with
rich posts (header image, formatting, inline images, hyperlinks) and share cards that
embed the post's header image. "Blog" link in the top header of the marketing site.

## What exists to build on (audit findings)

- **Docs subsystem is the template.** `src/app/docs/[[...slug]]/page.tsx` +
  `src/lib/docs/index.ts` (loads repo-root `docs/*.mdx` with hand-rolled frontmatter)
  + `src/components/docs/DocContent.tsx` (react-markdown + remark-gfm + rehype-slug +
  rehype-highlight, anchor headings, copy-button code blocks). Own public layout with
  header/footer, forced light mode, SSG via `generateStaticParams` + `generateMetadata`.
- **Guides is NOT a content system** (hardcoded TSX prompt library) — don't copy it.
- **Missing site-wide (blog introduces these):** `sitemap.ts`, `robots.ts`, RSS feed,
  per-page OG images (today one static logo PNG for the whole site).
- **Nav insertion points:** landing header `src/app/page.tsx` (~line 112, next to Docs
  link) + mobile menu (~546); footer; optionally dashboard sidebar later.
- **Images:** Supabase Storage buckets exist (`avatars` public-bucket pattern), but
  `next.config.ts` has no `images.remotePatterns` — needed if serving from Supabase
  with `next/image`. Repo `public/` works with zero config.
- **Admin gating pattern:** `profiles.is_admin` checked server-side in `/api/admin/*`.
- **No MDX compilation anywhere** (deliberate — react-markdown covers needs). No ISR.

## Decision D1 — Content source: files-in-repo vs DB-driven editor

| | A. MDX files in repo (recommended for v1) | B. Supabase `blog_posts` + admin editor |
|---|---|---|
| Authoring | Write markdown in Claude Code / Obsidian, commit | Browser editor at `/admin/blog` (markdown + live preview) |
| Publish | git push → deploy (~2 min) | Instant, no deploy |
| Build cost | Small (clone Docs) | Medium-large (editor, uploads, drafts, APIs) |
| SEO/rendering | Pure SSG, fastest | ISR/dynamic + revalidate |
| Versioning | Git history for free | DB, needs own history if wanted |
| Risk | None new | New write surface to secure |

**Recommendation:** A for v1 — Abhishek is the only author and drafts with Claude
anyway; Claude Code *is* the editor. Structure `src/lib/blog/` behind a small
interface (`listPosts`, `getPost`) so a later swap to DB-driven (Option B as Phase 3)
touches only the loader. Decide before build.

## Decision D2 — Share card (OG image) strategy

Requirement: shared links show a thumbnail of the post's header image.

- **a. Raw header image as `og:image`** — simplest; authors must supply ~1200×630 or
  accept platform cropping.
- **b. Dynamic branded card (recommended):** per-post `opengraph-image.tsx` using
  `next/og` `ImageResponse` — header image as background + gradient scrim + post title
  + PMM Sherpa wordmark. Consistent, professional cards on LinkedIn/X/Slack/iMessage
  regardless of source image aspect. Falls back to raw header image if generation
  fails. Plus `twitter:card = summary_large_image`.

## Content model (frontmatter)

```yaml
title:        "..."                     # required
description:  "..."                     # excerpt for cards + meta description
heroImage:    "/blog/<slug>/hero.jpg"   # required (used in card grid + OG + post top)
heroImageAlt: "..."
author:       "Abhishek Ratna"          # default; avatar + LinkedIn link
publishedAt:  2026-07-15
updatedAt:    2026-07-20                # optional
tags:         [ai, gtm, positioning]    # optional; drives filter chips later
draft:        true                      # excluded from index/sitemap/RSS until false
```

Body = GFM markdown: headings, bold/italic, lists, quotes, tables, code (highlighted),
images (`![alt](src)` → rounded, full-width, alt as caption), links (external → new
tab + `rel="noopener"`). Reading time computed at build. Images live in
`public/blog/<slug>/` alongside the post (versioned with it).

## Information architecture & pages

- **`/blog` (index):** featured latest post (large card: hero image, title, excerpt,
  date) + responsive card grid for the rest (hero thumb, title, excerpt, date, reading
  time, tags). Tag filter chips (Phase 2).
- **`/blog/[slug]` (post):** hero image (rounded, max-width ~760px prose column, hero
  can bleed wider), title (serif-weight display per DESIGN.md), meta row (author
  avatar + name, date, reading time), prose body, share row (LinkedIn, X, copy link),
  "Keep reading" (2–3 recent/related posts), CTA banner ("Meet PMM Sherpa" → /signup).
- **Layout:** own top-level `src/app/blog/` route group with the marketing-style
  header (logo, Docs, Blog, Login/Open app) cloned from docs layout. Light mode forced
  like Docs (recommend; matches marketing surface) — confirm.
- **Nav:** "Blog" link in landing header next to Docs, in the mobile menu, and in the
  footer. Dashboard sidebar: skip for v1 (marketing content), revisit.

## SEO plumbing (new, site-wide benefit)

- `src/app/sitemap.ts` — landing, docs pages, blog index + posts.
- `src/app/robots.ts`.
- RSS at `/blog/feed.xml` (route handler).
- JSON-LD `Article` schema per post; canonical URLs; `generateMetadata` per post
  (title template, description, OG + Twitter tags).

## Build spec (v1, locked 2026-07-09)

**Content:** `content/blog/<slug>.md` (plain markdown + frontmatter, parsed like
`src/lib/docs`); images in `public/blog/<slug>/`; `content/blog/authors.json`
registry (`id, name, title, avatar, linkedin?`), avatars in `public/blog/authors/`.
Frontmatter: `title, description, heroImage?, heroImageAlt?, author (id),
publishedAt, updatedAt?, tags[], draft?`. Hero optional — absent heroes render a
branded gradient placeholder (cards, post top) so posts can ship text-first.

**Loader:** `src/lib/blog/index.ts` — `listPosts()` (published, desc),
`getPost(slug)`, `getAuthor(id)`, reading time (words/225), `listSlugs()`.

**Routes:** `src/app/blog/layout.tsx` (theme-aware marketing header/footer — NOT
docs-light), `blog/page.tsx` (featured latest + card grid + NewsletterCapture),
`blog/[slug]/page.tsx` (SSG, generateStaticParams/Metadata, JSON-LD Article, hero,
byline w/ author profile, prose, ShareRow, related = 2 most-recent others,
NewsletterCapture), `blog/[slug]/opengraph-image.tsx` (ImageResponse 1200×630:
raster hero as background + scrim when present, else brand-blue gradient; title +
wordmark + author). RSS `blog/feed.xml/route.ts`; site-wide `src/app/sitemap.ts` +
`robots.ts` (landing, docs, blog). Renderer `src/components/blog/BlogContent.tsx`
(clone/generalize DocContent; keep docs untouched).

**Newsletter:** migration `newsletter_subscribers` (id, email unique, status
pending|confirmed|unsubscribed, source, confirm_token uuid, created_at,
confirmed_at; RLS deny-all, service-role only). `POST /api/newsletter/subscribe`
{email, source} → upsert pending + Resend double-opt-in email;
`GET /api/newsletter/confirm?token` → confirmed + admin notification + friendly
confirmation page; `GET /api/newsletter/unsubscribe?token`. `NewsletterCapture`
client component (inline states).

**Nav:** Blog link in landing header (next to Docs), mobile menu, footer.

**Inaugural post:** migrate the Odin report (`research/notes/final_report_ai-
rebuilding-enterprise-c0b3fe.md`) → `content/blog/ai-rebuilding-enterprise-2026.md`:
convert `[[note-id]]` citations to real source hyperlinks via the hyperresearch
vault note frontmatter (`~/Documents/AOL AI/research/notes/<id>.md` → `source:`
URL), add frontmatter (author abhishek, description from exec summary), keep
draft:true until Abhishek reviews. Hero: ships with gradient placeholder; swap in
a real image later (Canva / nano-banana).

## Phasing

- **Phase 1 — Publishable blog:** `content/blog/*.mdx` loader (`src/lib/blog/`),
  `/blog` + `/blog/[slug]` (SSG), blog layout/header, BlogContent renderer (reuse/
  generalize DocContent), per-post dynamic OG images, sitemap/robots/RSS, JSON-LD,
  nav links (header/mobile/footer), inaugural post (the Odin blog) migrated in.
- **Phase 2 — Polish:** share buttons, related posts, tag filtering, CTA banner,
  PostHog events (blog_post_viewed, blog_cta_clicked), image captions/lightbox.
- **Phase 3 (optional, on demand):** DB-driven authoring — `blog_posts` table, admin
  markdown editor with live preview + drag-drop image upload to public `blog-images`
  bucket, drafts/scheduling. Loader interface swap only.

## Decisions locked (2026-07-09, Abhishek)

- **Theme-aware** (light + dark), not docs-style forced light.
- **Newsletter email capture: YES** — capture module on blog index + end of each post.
  v1 scope: store to a `newsletter_subscribers` Supabase table (email, source_post,
  created_at, confirmed) + admin notification via Resend; double-opt-in confirmation
  email. Sending actual newsletters is out of scope (export list / future tool).
- **Comments: NO** (drive discussion to LinkedIn).
- **Guest authors: YES**, with author profiles — small picture, name, small title
  (e.g. "PMM Lead, Acme"). Author model:
  - `content/blog/authors.ts` (or `authors/*.json`) registry: `id, name, title,
    avatar (public/blog/authors/<id>.jpg), linkedin?`.
  - Post frontmatter references `author: <id>`; multiple authors allowed later.
  - Rendered: avatar + name + title in post meta row and on cards; author byline
    links to LinkedIn if present. (No public author pages in v1 — add
    `/blog/author/[id]` later if guest volume grows.)

## Open questions for Abhishek

1. **D1:** files-in-repo v1 (recommended) or admin editor from day one? Note guest
   authors don't force an editor in v1 — guests send drafts, we commit them; an
   editor becomes worthwhile if guests should self-serve publish.
2. **Odin blog: FOUND** (2026-07-09). It was written on this Mac (Warp session
   `39071c8f`, AOL-AI workspace) as the final report of an Odin deep-research run:
   `~/Documents/AOL AI/research/notes/final_report_ai-rebuilding-enterprise-c0b3fe.md`
   — *"How AI Is Rebuilding the Modern Enterprise in 2026"* (~44.5K, publish-grade
   long-form). Inaugural-post migration tasks: convert `[[note-id]]` vault citations
   to real hyperlinks (source URLs are in the hyperresearch vault notes), add
   frontmatter + hero image, trim executive-summary duplication if desired.
3. **D1 RESOLVED: files-in-repo v1** — guests send drafts, we commit them
   (Abhishek, 2026-07-09). Admin editor deferred to Phase 3 on demand.

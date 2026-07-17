# PMM Sherpa Blog — Authoring Guide

Posts live in this directory as plain markdown files: `content/blog/<slug>.md`.
The filename (minus `.md`) becomes the URL: `content/blog/my-post.md` →
`pmmsherpa.com/blog/my-post`. Use lowercase, dash-separated slugs.

## Frontmatter contract

Every post starts with a YAML frontmatter block:

```yaml
---
title: "How AI Is Rebuilding the Modern Enterprise in 2026"
description: "A one-to-two sentence excerpt. Used on blog cards, meta description, and share previews."
heroImage: /blog/my-post/hero.jpg
heroImageAlt: "Describe the hero image for screen readers"
author: abhishek
publishedAt: 2026-07-15
updatedAt: 2026-07-20
tags: [ai, gtm, positioning]
draft: true
---
```

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Plain string. Quotes optional unless it contains `:`. |
| `description` | yes | Excerpt for cards + `<meta name="description">` + OG/Twitter. Aim for 120–160 chars. |
| `heroImage` | no | Path under `public/`, e.g. `/blog/<slug>/hero.jpg`. If omitted, a branded gradient placeholder renders on cards, the post top, and share images. Prefer JPG/PNG ~1600×900 (JPG/PNG also render into the dynamic OG share card; WebP heroes fall back to the branded gradient there). |
| `heroImageAlt` | no | Alt text for the hero image. |
| `author` | yes | An author `id` from `authors.json` (below). Unknown ids render a generic fallback byline. |
| `publishedAt` | yes | `YYYY-MM-DD`. Controls sort order; rendered as "July 15, 2026". |
| `updatedAt` | no | `YYYY-MM-DD`. Shown in JSON-LD as `dateModified`. |
| `tags` | no | Inline array: `[ai, gtm]`. Reserved for filter chips (Phase 2). |
| `draft` | no | `true` hides the post from the index, sitemap, and RSS, but it still renders at its direct URL with a "Draft" badge and `noindex` — share the URL for review. Remove (or set `false`) to publish. |

Everything after the closing `---` is the post body: GitHub-flavored markdown.
Headings, bold/italic, lists, quotes, tables, fenced code (syntax-highlighted,
copy button), images, and links all work. External links open in a new tab.

## Images

Post images live in `public/blog/<slug>/` next to the post they belong to:

```
content/blog/my-post.md
public/blog/my-post/hero.jpg
public/blog/my-post/diagram.png
```

Reference them in markdown as `![Caption text](/blog/my-post/diagram.png)` —
the alt text renders as a caption under the image.

## Authors

Guest authors are added to `authors.json` in this directory:

```json
{
  "jane-doe": {
    "id": "jane-doe",
    "name": "Jane Doe",
    "title": "PMM Lead, Acme",
    "avatar": "/blog/authors/jane-doe.jpg",
    "linkedin": "https://www.linkedin.com/in/janedoe"
  }
}
```

Avatars go in `public/blog/authors/` (square, ~256×256 JPG). `linkedin` is
optional; when present the byline links to it.

> Note: `public/blog/authors/abhishek.jpg` is currently a brand-icon
> placeholder — swap in a real headshot when available.

## Workflow for guest drafts

1. Guest sends markdown (or a doc we convert to markdown).
2. Add frontmatter per the contract above with `draft: true`.
3. Add the author to `authors.json` + avatar image.
4. Commit; the draft is reviewable at `staging.pmmsherpa.com/blog/<slug>`.
5. Remove `draft: true` and merge to publish.

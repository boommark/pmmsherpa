# Research — Launch Blog Post

## Canonical sources (read FIRST)

- **Smart Brevity** (VandeHei / Allen / Schwartz) — primary structural source.
  Card: `~/Documents/AbhishekR/Book Brain/Smart Brevity.md`. The Core 4 (TEASE
  → LEDE → WHY IT MATTERS → GO DEEPER) is the structural spine.
- **Bly — The Copywriter's Handbook** — headline craft and CTA discipline.
  Card: `~/Documents/AbhishekR/Book Brain/Bly - The Copywriters Handbook.md`.
  4 U's (Urgent / Unique / Useful / Ultra-specific), 8 headline types, the
  You-Orientation rule, "headline = 80% of the work."
- **Zinsser — On Writing Well** — clutter removal, active voice, specificity
  over abstraction. Card: `~/Documents/AbhishekR/Book Brain/Zinsser - On Writing Well.md`.
  Used as the line-level craft check.

## What the books establish

### Smart Brevity — the structural spine

The Core 4 sequence is the load-bearing decision for this artifact. Smart
Brevity treats brevity as **respect** — every word that doesn't serve the
reader is theft of their attention. Specifically:

- **TEASE** — the hook. Build stakes / curiosity *before* the announcement.
  This is the section that suppresses the "Today we're excited to announce…"
  default opening that kills 80% of launch posts.
- **LEDE** — one sentence that delivers the news. Not the product name, not
  the feature list — the news the reader actually cares about (what changes
  for them).
- **WHY IT MATTERS** — the significance to *the reader*, in their world. This
  is where "why now" lives. Without it, the post reads like a changelog.
- **GO DEEPER** — context, supporting detail, evidence, capability list. Made
  optional by Smart Brevity because not every reader needs it; we keep it as
  a section but enforce that it follows the value, never leads.

The Audience-First principle is the negative-guidance engine: every section
must be drafted from the reader's perspective, not the company's.

### Bly — headline + CTA discipline

Bly's contribution is at the two ends of the post (where Smart Brevity's
structural guidance is light):

- **The 4 U's headline test** — every headline is rated 1-4 on Urgent, Unique,
  Useful, Ultra-specific. Aim for 3+ on at least three dimensions. This is the
  filter that kills "Introducing X" headlines.
- **8 headline types** — Direct, Indirect, News, How-To, Question, Command,
  Reason-Why, Testimonial. For a launch post, News / Reason-Why / How-To are
  the three types that work; the others almost never do for B2B launches.
- **You-Orientation** — address the reader as "you" in the body. Reframe
  anything that says "we" or "our platform" into "you" or "your team."
- **CTA must be specific and singular.** "Learn more" is not a CTA. "Start your
  free trial," "See it in a 12-minute demo," "Read the case study" are CTAs.
  One per post; one is the rule, not the maximum.

### Zinsser — line-level discipline

UCBH (Unity / Clarity / Brevity / Humanity) and the Clutter Enemy are the
craft check applied to every paragraph after drafting:

- Active voice over passive (every sentence)
- Concrete particulars over abstractions ("reconciles 47K rows in 90 seconds"
  beats "drives operational efficiency")
- Cut every word that does no work; "personal friend" is clutter when "friend"
  works
- Read aloud — if it sounds like a press release, rewrite

Zinsser doesn't shape the structure — Smart Brevity owns that — but he sets
the bar for the prose inside each section.

---

## Corpus research (amplification)

Top citations from `.planning/mcp-phase-2/corpus-research/10-launch-blog-post.json`
(query: structure / tone / length / SEO / failure modes for B2B SaaS launch
posts):

1. **Punchy p.70** (book) — the messaging stack reused at the post level: lead
   with value, support with benefit, end with feature. Reinforces Smart
   Brevity's TEASE → LEDE → WHY IT MATTERS shape.
2. **Pocket Guide to Product Launches p.22, p.93** — rolling thunder principle:
   the launch post is the *anchor*, not the finish line. Every downstream
   post / social / email links back and extends one specific angle. Net-new
   addition adopted into the post-publication "rolling thunder" footer of
   the artifact.
3. **Wes Bush / productled.com — SaaS SEO mistakes** — H1 + first 150 words
   carry SEO weight; structure "What's new" subheads as use-case queries
   ("How to automate X") instead of feature names ("Feature 1: X Engine"). This
   is **net-new contribution** that the books don't address (SEO is outside
   their scope). Adopted as a dedicated SEO checklist section.
4. **Kyle Poyar substack — SaaS homepage copy** — homepage / launch-post
   parallel: the H1 must work for someone who has never heard of the product.
   Same discipline as Bly's headline rule but B2B-tuned.
5. **Stevie Langford / PMA — B2B messaging pitfalls** — practitioner taxonomy
   of failure modes (jargon, generic benefits, inside-out). Validates Smart
   Brevity's audience-first rule and Bly's You-Orientation.
6. **Wes Bush / productled.com — B2B acquisition** — CTA placement: one
   primary CTA at the end, one optional repeat mid-post for long-form.

### Corpus addition kept beyond the book canon

- **600-900 word target.** Smart Brevity is principle-only on length ("short
  not shallow"); Bly is print-era. Corpus consensus is 600-900 for a B2B
  launch post. Locked.
- **"Why now" as its own section, not an afterthought.** All three books
  imply it; corpus practitioners are explicit that it's the most-skipped
  section and the one that determines whether the post reads as news or as
  marketing.
- **SEO checklist.** Net-new from corpus. Books don't cover it.
- **Rolling thunder footer.** From Pocket Guide to Product Launches. Reframes
  the post as an anchor for the launch program (artifact 09), not a one-off.

### Where books and corpus disagreed

- **Length.** Bly's Copywriter's Handbook leans on long-copy direct-response
  tradition (1500+ words for a sales letter). Smart Brevity argues for as-short-
  as-the-news-can-be. Corpus B2B SaaS norm: 600-900. **Winner: Smart Brevity
  + corpus.** A B2B launch post is news + value, not a sales letter; the
  long-copy tradition belongs in `landing_page_copy` (artifact 35), not here.
- **Headline pattern.** Bly endorses any of 8 types; Smart Brevity is implicit
  that the LEDE-style News headline is preferred. **Winner: merge.** Three
  named patterns are allowed (News / Reason-Why / How-To). The other 5 are
  flagged as failure modes for a launch post specifically.
- **"We" voice.** No real conflict — all three sources reject "we" leads. The
  template enforces You-Orientation in both the hook and the value sections.

---

## Boundary calls

This artifact is the **external announcement post** — the company-blog version
that customers / prospects / press read. Distinct from:

- **Launch press release (11)** — formal third-party-press format with quotes,
  dateline, boilerplate. Different audience (journalists / analysts), different
  format. The blog post is conversational; the press release is structured-news.
- **Launch plan / GTM brief (09)** — internal program doc with timing, owners,
  channels. The blog post is *one tactic* inside that plan and inherits
  positioning, ICP, and CTA from it.
- **Generic blog post brief (34)** — content-marketing post, not tied to a
  release moment. The launch post is a one-time anchor; a blog brief is a
  recurring content pattern. Different "why now," different CTA logic, often
  different headline type.
- **Positioning (01) and strategic narrative (03)** — upstream inputs, not
  duplicated. The blog post inherits positioning's Differentiated Value
  themes and the strategic narrative's "old game / new game" frame.

---

## Template design decisions

**Authority hierarchy.** Smart Brevity Core 4 owns the structure. Bly owns
headline craft + CTA. Zinsser owns line-level prose. Corpus amplifies with
B2B specifics (length, SEO, rolling thunder).

**Skeleton = TEASE → LEDE → WHY NOW (WHY IT MATTERS) → WHAT'S NEW (with
"so that" pairing) → VALUE → CTA, with PROOF threaded through and a
ROLLING-THUNDER FOOTER.** The Smart Brevity Core 4 expanded slightly:

- WHY IT MATTERS is renamed **WHY NOW** because the corpus is unanimous that
  this is the most-skipped section, and the rename forces explicit specificity.
- WHAT'S NEW is the "GO DEEPER" slot but renamed because launch posts have a
  specific job to introduce capabilities.
- VALUE is split out from WHAT'S NEW because Punchy / Smart Brevity / corpus
  all agree: features need a paired outcome ("so that…"), and the aspirational
  layer ("what does the customer's world look like in 6 months") earns its
  own block.

**Pre-work block.** Three pre-work decisions before drafting: (1) launch tier
inheritance from artifact 09 (tier-1 release vs feature update changes the
hook altitude); (2) primary audience (one buyer; same A+ Customer discipline
as messaging framework); (3) the one CTA (decided BEFORE drafting so the post
builds toward it). Pre-work is structurally similar to artifacts 01 and 02.

**Headline section before TEASE.** The headline is its own section with the
4 U's checklist + the three permitted headline types. This is unusual for a
"blog post" template but the corpus is clear: the headline does most of the
work, and post-drafting it is the most-skipped step.

**SEO sub-block.** Net-new corpus addition. Tucked into the Headline section
because H1 + first 150 words are the SEO surface. Includes meta description,
H2 use-case-query subheads, internal link to product page.

**Proof-point integration, not a separate section.** Customer voice (one quote
or data point) is a *required* element threaded into either the LEDE or the
VALUE block. A separate "proof" section reads like a testimonial wall and
breaks the narrative flow. Smart Brevity's prose-driven shape wins here over
the practitioner pattern of "proof = its own section."

**Rolling-thunder footer.** From Pocket Guide to Product Launches. Two-line
section at the end of the artifact: "this post is the anchor — what extends
it?" Forces the user to think of the post as part of a program, not a
standalone deliverable.

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work (tier / audience / single CTA) | Smart Brevity (audience-first) + Bly (CTA discipline) + corpus (rolling thunder requires tier) | Skipping pre-work produces "Today we're excited to announce…" posts |
| Headline + 4 U's check + SEO sub-block | Bly (headline = 80% of the work, 4 U's, headline types) + corpus (SEO) | The single most-skipped craft step in launch posts |
| TEASE (hook) | Smart Brevity (Core 4) | Suppresses the "we're excited" opener — opens on reader pain |
| LEDE | Smart Brevity (Core 4) | One sentence delivering the news in reader-relevant terms |
| WHY NOW | Smart Brevity (renamed) + corpus | The most-skipped section per corpus; renamed to force specificity |
| WHAT'S NEW (with "so that" pairing) | Smart Brevity (Go Deeper) + Punchy VBF + corpus | Forces feature-outcome pairing instead of feature-list dumps |
| VALUE (six-months-out aspirational frame) | Smart Brevity + corpus + Punchy | The aspirational layer; what the buyer's world looks like if this works |
| CTA (one, specific) | Bly + corpus | "Learn more" is not a CTA |
| Rolling-thunder footer | Pocket Guide to Product Launches (corpus) | Reframes post as anchor, not finish line |

## Sections excluded

- **Press-release format (dateline, boilerplate, formal quote block)** —
  artifact 11.
- **Launch program / RACI / channel mix** — artifact 09.
- **Battlecard / comparison content** — artifacts 16-17. A launch post may
  reference a competitor implicitly but doesn't audit them.
- **Long-copy direct-response section** (Bly tradition) — artifact 35
  (landing_page_copy).
- **Multi-channel adaptations (email / social / ad)** — separate artifacts
  (25 / 38). The launch post is the anchor; channel cuts are downstream.

---

## System prompt failure modes (negative guidance)

From books + corpus, distilled to 8:

1. **"Today we're excited to announce…" opener** — the single most common
   launch-post failure. Open on the reader's pain, not your product.
2. **Feature-list lede** — "We're shipping five new capabilities" before
   establishing why the reader cares. Suppresses the news instinct.
3. **Missing "why now"** — a launch post without it reads like a changelog.
   Must connect to a market shift, regulatory change, behavior change, or
   buyer-world change.
4. **Features without "so that" pairing** — every capability gets a paired
   outcome. "Real-time anomaly detection, so that your team catches revenue
   leakage before quarter-close" — never standalone.
5. **Jargon as trust signal** — "AI-native, multi-tenant, event-driven
   architecture" reads as opacity, not competence. Name the outcome first;
   explain the mechanism only if it earns its place.
6. **"We" voice / inside-out framing** — every paragraph drafted from the
   reader's perspective ("you," "your team"), not the company's ("we,"
   "our platform").
7. **No clear CTA / multiple CTAs** — one specific next step. "Learn more"
   is not a CTA. "Read the case study," "Start a free trial," "See a
   12-minute demo" are CTAs. One per post.
8. **No customer voice** — at minimum one quote, data point, or beta-customer
   line. A launch post without proof reads as marketing; with proof it reads
   as evidence.

## Open questions for audit

- **Should the Headline section render the 4 U's as a checklist or a
  scoring rubric?** Currently checklist. Rubric (1-4 per dimension) is more
  rigorous but adds friction.
- **Should "rolling thunder" be a section in the post or only in the
  footer-as-meta?** Currently footer-as-meta (it's a planning prompt for the
  user, not body copy in the post). Could move to a separate launch-program
  artifact comment.
- **Length target — should the template render an explicit word count
  bracket per section, or only the total?** Currently total only (600-900).
  Per-section guidance might over-constrain voice.

## Corpus gaps logged

- The corpus query did not surface a Smart Brevity chunk with clean metadata —
  the structural canon came from the book card, not the corpus. Two book
  citations returned with `author: null` and Amazon-search URLs (Punchy p.70,
  Pocket Guide p.22 / p.93). Logged in `corpus-gaps.md` for the next ingestion
  sweep. Did not block the template since the book cards were authoritative.

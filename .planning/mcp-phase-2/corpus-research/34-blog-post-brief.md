# Research — Blog Post Brief (evergreen content, not launch announcement)

## Canonical sources (read FIRST)

- **Smart Brevity** (VandeHei / Allen / Schwartz) — primary structural source
  for headline + lede craft. Card: `~/Documents/AbhishekR/Book Brain/Smart Brevity.md`.
  Core 4 (TEASE → LEDE → WHY IT MATTERS → GO DEEPER) translated to brief
  format: a brief is the *contract* that forces the writer to honor Core 4.
- **Bly — The Copywriter's Handbook** — title craft. Card:
  `~/Documents/AbhishekR/Book Brain/Bly - The Copywriters Handbook.md`. The
  4 U's test (Urgent / Unique / Useful / Ultra-specific), 8 headline types,
  You-Orientation, "headline = 80% of the work."
- **Zinsser — On Writing Well** — voice and clutter discipline. Card:
  `~/Documents/AbhishekR/Book Brain/Zinsser - On Writing Well.md`. UCBH
  (Unity / Clarity / Brevity / Humanity), Specificity over Abstraction, Voice
  as Self. Used as the voice-notes section authority.

## What this artifact is — and is not

This is a **brief**, not a draft. The PMM hands this to a writer (in-house,
contract, or agency) and the writer takes it from there. The brief's job is
to answer every question a good writer would ask before typing a single word.
The output is a contract, not a draft.

This is the **evergreen / thought-leadership / SEO / nurture** blog post brief.
Sibling artifact `launch_blog_post` (10) is the *launch announcement* — event-
driven, news-led, anchored to a release moment. Artifact 34 is the recurring
content pattern: SEO-driven informational post, commercial-intent comparison,
thought-leadership opinion piece, or nurture stage explainer. Different "why
now," different CTA logic, often different headline type.

## What the books establish

### Smart Brevity — translates from draft-shape to brief-shape

Smart Brevity's Core 4 was designed for the *draft*. For a brief, the Core 4
becomes the **structural-outline** section: the brief tells the writer what
each Core-4 slot must do for this post. Specifically:

- **TEASE / Hook** — the brief specifies the tension, friction, or surprise
  the reader feels right now. Not "introduce the topic" — name the moment of
  pain.
- **LEDE / Key argument** — the brief locks the post's *one-sentence
  argument*. If the writer cannot point to it after drafting, the brief
  failed. Captured in this template as a dedicated **Key argument (one
  sentence)** field.
- **WHY IT MATTERS / Search intent + reader pain** — the brief names the
  search query the reader typed and the pain that drove them to type it. This
  is the most-skipped brief section per corpus.
- **GO DEEPER / Outline + evidence list** — the brief gives the writer the
  H2-by-H2 architecture and the *evidence* each section must include. Frame
  of the house, not the furniture.

Audience-First is the negative-guidance engine: the brief writes one specific
named persona ("a demand gen manager at a 200-person SaaS company running a
two-person team") and forbids "B2B marketers" / "marketing leaders" / generic
segments. Smart Brevity's "short, not shallow" sets the discipline that the
brief is not a list of generic prompts but a sharp set of specific decisions.

### Bly — title craft and the 4 U's

Bly's contribution is the **working title + alt headlines** section. For a
brief specifically:

- **Working title is a hypothesis, not a final.** The brief proposes the
  working title and then provides 3 alternates so the writer can A/B in their
  head before drafting. Three alternates is the corpus norm — fewer is
  under-tested, more is choice paralysis.
- **The 4 U's test** is the same as artifact 10 — every title rated 1-4 on
  Urgent / Unique / Useful / Ultra-specific. Aim for 3+ on at least three
  dimensions.
- **Headline type by post intent.** For SEO/informational posts: How-To and
  Question types win. For commercial-intent posts: Reason-Why and Direct.
  For thought-leadership: Provocative (a sub-type of Indirect). For nurture:
  How-To. The brief picks ONE intent and the type follows.
- **Headline = 80% of the work.** Same rule as artifact 10. The brief makes
  the title decision *before* the writer drafts so the post builds toward it.

### Zinsser — voice notes and clutter discipline

Zinsser owns the voice-notes section. Most briefs skip this entirely and then
editors spend hours fixing tone after the fact. The brief includes 3-5
sentences that describe how the post should sound — not "professional" or
"conversational," but specific:

- "Write like a smart colleague explaining this over Slack."
- "No jargon for jargon's sake. Short paragraphs. Use 'you' throughout.
  Assume the reader has tried the obvious stuff and it didn't work."

UCBH (Unity / Clarity / Brevity / Humanity) and Specificity-over-Abstraction
are the line-level checks the writer is told to apply. The brief points the
writer to a published piece that nails the voice, if one exists.

---

## Corpus research (amplification)

Top citations from `.planning/mcp-phase-2/corpus-research/34-blog-post-brief.json`
(query: how to write a B2B SaaS blog post brief — title testing, target
reader, search intent, evidence sourcing, voice and structural outline):

1. **Klettke — Punchy** (book, p.5) — the brief is a *contract* between the
   strategist and the writer. The brief should answer every question a good
   writer would ask before typing. Adopted as the framing principle for the
   template.
2. **Neil Patel — B2B marketing guide** — search intent breaks into four
   types: informational, navigational, commercial, transactional. Most B2B
   SaaS high-value content lives in informational and commercial. Knowing
   which one the post serves changes the entire structure. **Adopted as the
   "post intent" pre-work decision.**
3. **Wes Bush — productled.com** — for B2B SaaS, the brief should specify
   what evidence is mandatory (named statistics, customer proof, expert POV)
   versus optional (analyst data, market-size stats). Generic claims kill
   B2B content; specificity is the credibility signal. Adopted as the
   evidence-list section.
4. **Stevie Langford / PMA — B2B messaging** — the persona should be one
   named individual ("a demand gen manager at a 200-person SaaS who runs a
   two-person team and is being asked to do more with less"), not a category.
   Validates Smart Brevity's audience-first rule. **A single piece of content
   can't serve two personas well** — the brief picks one primary, optionally
   notes a secondary.
5. **PMA — buyer's journey post** — different stages of the buyer's journey
   need different blog post types. Brief must locate the post on the journey:
   Awareness (informational, no product mention) / Consideration (commercial,
   light product mention) / Decision (deep product, ROI-focused) / Customer
   marketing (post-purchase). Adopted as a sub-decision under post intent.
6. **Klettke — voice notes are most-skipped** — most briefs skip the voice
   section entirely. Three to five specific sentences beat "professional,"
   "conversational," or a 50-page brand voice doc. Adopted.
7. **Wes Bush — SEO** — for SEO posts specifically, the H1 + first 150 words
   carry the SEO weight. The H2s should match how buyers search ("How to
   automate X"), not how the team thinks about the product. Adopted into the
   structural-outline section as a sub-rule for SEO-intent posts.
8. **PMA — internal linking** — every B2B SaaS post should link out to 2-4
   internal anchors (product page, related blog post, customer case study,
   relevant resource). The brief specifies *which* internal links are
   required so the writer doesn't invent them. Adopted as a dedicated
   internal-link map section.
9. **Generic content marketing corpus** — CTA discipline is different for
   evergreen content than for launch posts. Evergreen CTAs are softer and
   journey-stage-matched: "Read the next post in this series" (top-of-funnel),
   "See how [Customer] solves this" (mid-funnel), "Try it for your own data"
   (bottom-of-funnel). One CTA, not three. Same one-CTA rule as artifact 10
   but the CTA *type* shifts with the post intent.
10. **Generic — success metrics** — a brief without success metrics is a
    creative ask. The brief should name the metric the post is optimized for
    (organic traffic / time on page / scroll depth / lead conversion / sales-
    cycle-length impact) and the 30-day / 90-day target. Adopted as the final
    section.

### Corpus addition kept beyond the book canon

- **Post intent as a pre-work decision.** Books don't taxonomize blog post
  intents. Corpus is unanimous: SEO / thought-leadership / nurture / customer-
  marketing are different jobs requiring different briefs. Locked as the
  first pre-work decision, because everything downstream (title type, persona
  detail, CTA shape, success metric) flows from it.
- **Search intent type (informational / commercial / navigational /
  transactional).** Net-new from corpus (Patel). Books don't cover SEO
  intent. Adopted as a sub-decision under post intent.
- **Internal-link map as a dedicated section.** Net-new from corpus. Books
  don't cover this. Without it, the writer guesses at internal links and
  the post becomes an SEO leak.
- **Success metrics block.** Net-new from corpus. A brief without success
  metrics is an opinion piece dressed as content marketing. Adopted as the
  final section.

### Where books and corpus disagreed

- **Title locking.** Bly is firm: lock the headline before drafting. Klettke /
  corpus: propose 3 alternates and let the writer test against the search
  query. **Winner: corpus.** A brief is a contract between two people; the
  writer needs alternates to test, the strategist locks the *intent*. The
  template renders working title + 3 alternates + the 4 U's test as the
  decision instrument.
- **Voice section length.** Zinsser implies voice should be felt across the
  whole prose, not pre-specified. Klettke / corpus: 3-5 sentences, plus a
  link to a piece that nails it. **Winner: corpus.** A brief needs explicit
  voice notes; Zinsser's organic-voice principle is a writing-time check, not
  a brief-time check.
- **CTA singularity.** Same as artifact 10 — one CTA. No disagreement; the
  CTA *type* shifts with the post intent (SEO / nurture / commercial).

---

## Boundary calls (sibling differentiation)

This artifact is the **evergreen content blog brief**. Distinct from:

- **Launch blog post (10)** — event-driven, news-led, anchored to a release.
  Artifact 34 is recurring, evergreen, journey-stage-led. Artifact 10 is the
  *post itself*; artifact 34 is the *brief* a writer takes to draft a post.
  Artifact 10 has a "why now" tied to a release; artifact 34 has a "why now"
  tied to a search query the reader typed today. Artifact 10's CTA is the
  launch CTA inherited from the launch plan; artifact 34's CTA is journey-
  stage-matched and softer.
- **Strategic narrative (03)** — upstream input, not duplicated. The brief
  may inherit thought-leadership angle from the strategic narrative if the
  post is a thought-leadership piece.
- **Positioning statement (01) / messaging framework (02)** — upstream
  inputs. The brief inherits the Differentiated Value themes (artifact 01)
  and persona detail (artifact 02 / 05).
- **Cold email sequence (25)** — separate artifact for sequence content.
  The blog brief is for a single piece, not a multi-touch sequence.
- **Landing page copy (35)** — long-copy direct-response artifact. Different
  intent (conversion, not consumption).

---

## Template design decisions

**Authority hierarchy.** Klettke / Smart Brevity own the brief-shape (a
brief is a contract; Core 4 translated to brief sections). Bly owns title
craft + 4 U's. Zinsser owns voice notes. Corpus owns post-intent
taxonomy, internal-link map, success metrics, and the writer-contract framing.

**Skeleton order = pre-work (post intent + search intent + journey stage) →
working title + 4 U's + 3 alternates → target reader (one named persona) →
reader pain / search query / job-to-be-done → key argument (one sentence) →
evidence list (mandatory vs optional) → outline (H2 by H2) → voice notes →
CTA → internal-link map → success metrics.**

**Pre-work block.** Three pre-work decisions before drafting the brief: (1)
post intent (SEO / thought-leadership / nurture / customer-marketing); (2)
search intent type (informational / commercial / navigational / transactional);
(3) journey stage (Awareness / Consideration / Decision / Customer marketing).
These three force the brief into a coherent shape — without them, the brief
defaults to "interesting topic, hope it works."

**Working title is a hypothesis, not a final.** Bly's 4 U's plus 3 alternates.
The strategist locks the *angle*; the writer picks the final wording.

**Target reader is a named individual, not a segment.** Three sentences
specifying title, company size, team size, current quarter pressure, what
makes them say yes, what makes them bounce. "B2B marketers" is forbidden.

**Key argument as one sentence.** This is the LEDE in brief form. If the
writer cannot point to a single sentence that contains the post's argument
after drafting, the brief failed.

**Evidence list with mandatory vs optional.** Klettke / corpus: tell the
writer which evidence must appear and which is nice-to-have. Cuts back-and-
forth and forces the strategist to decide before drafting.

**Outline as H2-by-H2 architecture.** Frame of the house, not the furniture.
Each H2 gets a one-line summary of the argument. The writer fills in the
prose. For SEO posts, the H2s match search queries.

**Voice notes section.** Three to five specific sentences. Plus a link to a
piece that nails the voice if one exists.

**CTA matched to journey stage.** One CTA. Type shifts with post intent.
Awareness: "Read the next post in this series." Consideration: "See how
[Customer] solves this." Decision: "Try it for your own data."

**Internal-link map.** Net-new from corpus. Specifies 2-4 internal anchors
the writer must include.

**Success metrics block.** Net-new from corpus. Names the metric and the
30-day / 90-day target.

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work (post intent, search intent, journey stage) | Corpus (Patel + PMA) + Smart Brevity (audience-first) | Without these three decisions the brief defaults to "interesting topic" |
| Working title + 4 U's + 3 alternates | Bly + corpus (Klettke) | Headline = 80% of the work; lock the angle, give the writer 3 to test |
| Target reader (one named persona) | Smart Brevity + PMA + Klettke | "B2B marketers" is forbidden; one named individual or the brief fails |
| Reader pain / search query / job-to-be-done | Smart Brevity (TEASE) + Patel (search intent) | The most-skipped brief section per corpus; forces specificity |
| Key argument (one sentence) | Smart Brevity (LEDE) + Klettke | If the writer can't point to one sentence, the brief failed |
| Evidence list (mandatory vs optional) | Klettke + Wes Bush | Generic claims kill B2B content; specificity is the credibility signal |
| Structural outline (H2 by H2) | Smart Brevity (Go Deeper) + Wes Bush (SEO subheads) | Frame of the house, not the furniture |
| Voice notes (3-5 sentences + sample link) | Zinsser + Klettke | Most-skipped brief section; "professional / conversational" doesn't work |
| CTA (one, journey-stage-matched) | Bly + corpus | One CTA; type shifts with post intent |
| Internal-link map (2-4 anchors) | Corpus (PMA) | Closes SEO loop; writer doesn't invent links |
| Success metrics (metric + 30/90-day target) | Corpus | A brief without metrics is a creative ask, not a content ask |

## Sections excluded

- **Draft prose.** A brief is a contract, not a draft. The brief never
  writes the post for the writer.
- **Press-release format / launch CTA.** Artifact 10 / 11 territory.
- **Multi-channel adaptations (email / social / ad cuts).** Separate artifacts
  (25 / 38). The brief is for one post; channel cuts are downstream.
- **Long-copy direct-response section.** Artifact 35 (landing_page_copy).
- **Detailed SEO checklist (meta description, schema, internal-link
  recommendations beyond the map).** A brief specifies the *target*, not the
  full SEO playbook.

---

## System prompt failure modes (negative guidance)

Distilled to 8:

1. **Drafting the post.** A brief is a contract, not a draft. The brief
   never produces prose for the writer; it produces *decisions* the writer
   needs.
2. **Generic personas.** "B2B marketers," "marketing leaders," "PMMs at
   growth-stage companies" are forbidden. The persona must be one named
   individual with title, company size, team size, current quarter pressure,
   what makes them say yes.
3. **Skipping the headline test.** The 4 U's test is mandatory. "We'll
   figure out the title later" is the brief failing. Lock the angle, give
   the writer 3 alternates to test.
4. **Missing search intent / journey stage.** Without these, the brief
   defaults to "interesting topic." Pick the intent and the stage explicitly.
5. **Generic evidence asks.** "Include some statistics" is not an evidence
   ask. "One named stat with source and recency, one customer proof point
   from the corpus, one expert POV" is.
6. **CTA loaded at every section.** Evergreen content has ONE CTA at the
   end, journey-stage-matched. Repeating the CTA at every H2 reads as
   marketing. The brief specifies one location.
7. **Voice notes that don't work.** "Professional," "conversational,"
   "smart but accessible" are voice-note failures. Three to five specific
   sentences plus a link to a piece that nails the voice.
8. **Jargon Zinsser would cut.** "Leverage," "synergy," "robust solution,"
   "best-in-class," "AI-powered" — flag these in the voice notes as words
   the writer must NOT use. Specificity over abstraction is the rule.

## Open questions for audit

- **Should the brief render the H2 outline as a full mini-outline (one line
  per H2) or as a more flexible "argument shape" (just the argument arc)?**
  Currently full mini-outline (H2 by H2 with one-line summary). Argument-
  shape is lighter but pushes more decisions onto the writer.
- **Should the success-metrics section render specific targets (numbers) or
  only the metric name?** Currently both — metric + 30-day / 90-day target.
  Numbers might over-constrain; metric-only might under-constrain.
- **Should the brief include a section on the *competitor or category
  context* (what others are saying, where the gap is)?** The corpus
  (Klettke) suggests yes, but it overlaps with the strategic narrative
  artifact (03). Currently folded into the evidence list as an optional
  bullet rather than its own section.

## Corpus gaps logged

- The corpus query did not surface a Smart Brevity chunk specifically about
  briefs (the framework is implicit in the Core 4). Came from the book card.
  Pocket Guide to Product Launches and other launch-specific content
  appeared incidentally and was discarded as off-topic. No new gap to log.

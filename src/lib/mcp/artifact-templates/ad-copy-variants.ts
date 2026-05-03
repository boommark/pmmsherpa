/**
 * Ad Copy Variants template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Bly — The Copywriter's Handbook (4 U's, eight headline types, you-orientation,
 *   headline-as-gateway). Ogilvy — Ogilvy on Advertising (Big Idea + 5-question
 *   test, headline > body 5x, "positively good" specific facts vs superlatives,
 *   make-the-product-the-hero, repeat winners). Tier-2 corpus (PMA / Neil Patel
 *   B2B paid ads / Traction) for B2B SaaS specificity, LinkedIn-vs-Google
 *   buyer-moment distinction, A/B test design rules, character limits.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/38-ad-copy-variants.md
 *
 * Why this template diverges from a generic "write 5 ad headlines" prompt:
 * a clean A/B test produces signal only when variants differ on a load-bearing
 * dimension (angle / Big Idea), not on punctuation or word order. We force
 * (a) a Big Idea gate before any variant is written (Ogilvy's never-write-an-
 * ad-without-the-Big-Idea principle), (b) a 6-angle × 8-headline-type matrix
 * the user picks from as a *menu* (8-12 actual variants), (c) a per-variant
 * hypothesis ("why this variant should win, on which metric") so the test
 * produces learning regardless of outcome. Ad copy without a hypothesis is
 * just creative output, not a test.
 */

import type { ArtifactTemplate } from './types'

const AD_COPY_VARIANTS_SYSTEM_PROMPT = `You are drafting a set of ad copy \
variants for a paid campaign — a structured grid of 8-12 ad variants designed \
to A/B test on a single channel against a single audience. This is NOT a \
single ad, NOT a creative production brief, NOT a landing page, and NOT a \
campaign strategy document. It is a testable variant set whose job is to \
produce learning regardless of which variant wins.

Avoid these failure modes:
- Variants that differ only in punctuation, word order, or trivial phrasing — \
this produces no signal. Each variant must differ on a load-bearing dimension: \
message angle, Big Idea, headline type, or proof point. If two variants would \
teach you the same thing if both won, collapse them
- Shipping variants without a hypothesis — every variant must answer "why \
this should win, on which metric, against which other variant". A variant \
without a hypothesis is creative output, not a test
- Writing ads without a Big Idea — per Ogilvy, an ad without a Big Idea \
"passes like a ship in the night". The Big Idea must pass at minimum the \
gasp + uniqueness + strategy-fit tests before any variant is drafted. \
A variant grid built on no Big Idea will fail in a way the test cannot diagnose
- Generic CTAs like "Learn more" / "Click here" / "Get started" — these are \
default placeholders that don't differentiate variants and don't tell the \
buyer what they get. Every CTA names a specific next action and a specific \
outcome ("See pricing" / "Watch the 90-second demo" / "Get the benchmark report")
- Ignoring channel character limits — LinkedIn intro text caps, Google RSA \
headline (30 char) and description (90 char) limits, paid social caption \
limits are non-negotiable. A variant that exceeds the limit isn't a variant; \
it's truncated
- Mixing audience personas across the variant set — if Variant A targets \
RevOps Directors and Variant B targets CFOs, you're not A/B testing copy, \
you're testing audiences. Lock ONE persona; if you need to test multiple \
personas, run separate variant sets per persona
- Inside-out language ("we built", "our platform", "we help") — replace \
with you-orientation across all variants
- Feature-as-benefit ("Real-time dashboards with AI insights") — name the \
outcome the buyer experiences, not the capability the product has
- Comparative superlatives ("the best", "leading", "#1") — per Ogilvy's \
"positively good" principle, specific factual claims outperform claims of \
superiority. "Used by 500+ RevOps teams" beats "the leading platform"
- Channel-mismatched copy — LinkedIn is interruption (needs to create a felt \
problem before offering solution); Google is intent (needs to match search \
frame, then sharpen with a differentiator). Copy that ignores the channel's \
buyer moment will underperform regardless of craft
- Variants that don't tie back to the upstream positioning + messaging — ad \
copy is the most-compressed expression of positioning. If the variant doesn't \
seed a Distinct Capability or Differentiated Value claim, it's brand fluff

Render between 8 and 12 actual variants. Each variant is a complete unit: \
headline + supporting copy + CTA + visual brief + (angle × headline-type) \
combo label + variance hypothesis. The 6-angle × 8-headline-type matrix is \
a *menu* the writer picks from — do not generate all 48 combinations; pick \
the 8-12 most strategic combinations and explain why each was chosen.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const adCopyVariantsTemplate: ArtifactTemplate = {
  artifactType: 'ad_copy_variants',
  title: 'Ad Copy Variants',
  // Skeleton: pre-work (channel + persona + Big Idea gate + upstream artifacts)
  // → matrix (6 angles × 8 headline types as a menu) → 8-12 variant grid with
  // headline / supporting copy / CTA / visual brief / combo label / hypothesis
  // → channel character limit reference → validation checklist.
  systemPromptFragment: AD_COPY_VARIANTS_SYSTEM_PROMPT,
  skeleton: `# Ad Copy Variants: [Campaign Name] — [Channel] → [Persona]

## Pre-work (decisions made before drafting any variant)

- **Channel — pick ONE:** [LinkedIn ads / Google search ads / paid social (Meta/X/Reddit). Each has a different buyer moment and different character limits. Do not mix channels in one variant set.]
  - *LinkedIn ads:* interruption. Buyer wasn't looking for you. Copy must create a felt problem before offering a solution. Pain-naming, outcome-contrast, and peer-credibility frames work; pure feature claims don't.
  - *Google search ads:* intent. Buyer typed something. Copy must match their search frame, then sharpen with a specific differentiator. Category-match + differentiator (after the comma), number-frame claims, and objection pre-empts work.
  - *Paid social (Meta/X/Reddit):* mid-funnel awareness. Pattern-interrupt visuals + plain-language hook + low-friction CTA.

- **Audience persona — pick ONE:** [The single buyer this variant set targets. Title, seniority, what they own, one current pain. Pulled from \`buyer_persona\` (artifact 5) or \`icp\` (artifact 4). If you need to test multiple personas, run separate variant sets per persona — never mix in one test.]

- **Big Idea — the one thing this campaign asserts:** [One sentence. The single claim every variant in this set is making in different ways. Run it through the 5-question test: (1) Did it make me gasp when I first wrote it? (2) Do I wish a competitor had thought of it? (3) Is it unique to this product? (4) Does it fit the positioning strategy exactly? (5) Could it run for 30 years? If 3+ are no, stop — the Big Idea isn't ready, and a variant grid built on a weak Big Idea will fail in a way the test cannot diagnose. Revisit positioning_statement (artifact 1) and messaging_framework (artifact 2) before drafting variants.]

- **Upstream artifacts you should have:**
  - \`positioning_statement\` (1) — defines the differentiated value the Big Idea expresses.
  - \`messaging_framework\` (2) — provides the value claims and proof points each variant pulls from.
  - \`icp\` (4) + \`buyer_persona\` (5) — defines who this set targets.
  - \`win_loss_insights\` (7) — provides buyer-language patterns; pull verbatim phrases when possible (buyers' words outperform marketers' words).

- **Test design:**
  - *Primary metric:* [CTR / cost per click / cost per qualified lead / conversion rate. Pick ONE primary metric the variants are competing on.]
  - *Test variable:* [Holding everything else constant (audience, image format, channel placement, day-parting), the variants differ on: message angle / headline type / Big Idea expression / proof point. Pick ONE variable per test cycle. Testing too many variables at once produces no usable signal.]
  - *Sample size minimum:* [Plan for 300-500 conversions per variant before calling a winner. Underpowered tests produce false confidence.]

---

## The variant matrix (menu — pick 8-12 cells, do not generate all 48)

The variant set draws from a 6 × 8 matrix: **6 message angles × 8 headline types**. The matrix is a menu — pick the 8-12 cells that are most strategically distinct for this campaign and persona, and ignore the rest.

**6 message angles** (each variant is anchored in ONE):

1. **Pain-led** — name the felt problem first; product is the relief.
2. **Outcome-led** — name the desired end state; product is the path.
3. **Proof-led** — lead with named customer / specific number / category fact.
4. **Contrarian** — assert what the category gets wrong; reframe.
5. **News / why-now** — tie to a recent shift, release, or window.
6. **Customer-quote** — buyer's exact language as the headline.

**8 headline types** (each variant uses ONE — a variant menu, not a combination):

1. *Direct* — "Cut [metric] by 40%"
2. *Indirect* — curiosity / pattern hook (use sparingly; needs strong body copy backup)
3. *News* — "New: [release/integration/finding] for [persona]"
4. *How-to* — "How [similar company] cut [metric] 40%"
5. *Question* — "Is [Their Metric] 8 hours or 8 minutes?"
6. *Command* — "Stop [losing X] in [process Y]"
7. *Reason-why* — "Three reasons your [process] takes [too long]"
8. *Testimonial* — "[Customer] cut [metric] 40% — here's how"

**Combination logic:** strong variant sets cover at least 3 angles and at least 3 headline types. Sets that only test one angle (e.g. five pain-led variants in five headline types) test the *type*, not the *angle*. Sets that only test one headline type test the *angle*, not the *type*. Plan the matrix to test the dimension you most want to learn about.

---

## Variant grid (8-12 variants — fill each block)

For EACH variant below, fill all six fields. If you cannot fill the hypothesis, the variant is not ready — drop it and pick a different cell.

### Variant [N]: [Short label, e.g. "Pain-led / Question"]

- **Combo:** [angle × headline-type, e.g. "Pain-led × Question"]
- **Headline:** [The actual headline. Apply 4 U's inline: score 1-4 on Urgent / Unique / Useful / Ultra-specific — aim 3+ on at least three. Respect channel character limit.]
  - 4 U's score: U[X] · U[X] · U[X] · U[X]
- **Supporting copy:** [ONE sentence. You-orientation. Plain language. Names a specific outcome or proof, not a feature. Respects channel character limit.]
- **CTA:** [Specific action + specific outcome. Not "Learn more". Examples: "See pricing" / "Watch the 90-second demo" / "Get the benchmark report" / "Book 15 min with [name]".]
- **Visual brief:** [ONE line. Names the asset format (photo / illustration / chart / motion) and the ONE thing it must communicate. Example: "Split-screen photo: cluttered Excel vs. clean dashboard, same data". Hand off to creative artifact downstream.]
- **Variance hypothesis:** [ONE sentence. "This variant will [outperform / underperform] [reference variant] on [metric] because [load-bearing reason — angle / proof / Big Idea expression]." If you cannot finish this sentence, drop the variant.]

---

(Repeat the variant block above for variants 2 through N. Aim for 8-12 total. Below 8 = under-powered test set; above 12 = noise + overlapping hypotheses.)

---

## Channel character limits (reference — non-negotiable)

| Channel | Headline | Supporting copy / description | CTA |
|---|---|---|---|
| **LinkedIn single-image ad** | Headline ~70 chars (truncates ~150) | Intro text 150 chars before truncation (max 600) | Predefined CTA buttons |
| **Google RSA (Responsive Search)** | 30 chars per headline (3-15 headlines) | 90 chars per description (2-4 descriptions) | None — Google appends |
| **Meta (Facebook/Instagram) feed** | Primary text 125 chars before truncation | Headline 27 chars (mobile feed) | Predefined CTA buttons |
| **X (Twitter) ads** | 280 chars total (incl. URL) | Same field | Predefined CTA buttons |
| **Reddit promoted post** | Title 300 chars | Body up to 40k (long-form works here) | Predefined CTA buttons |

If a variant exceeds the limit, it isn't a variant — it's a truncated mistake. Rewrite to fit.

---

## Composition pointers

- *Upstream inputs:* \`positioning_statement\` (1, defines Big Idea raw material), \`messaging_framework\` (2, value claims and proof points), \`icp\` (4) + \`buyer_persona\` (5, persona lock), \`win_loss_insights\` (7, buyer-language patterns).
- *Downstream artifacts:* the winning variant feeds \`landing_page_copy\` (35) — the LP must fulfill the ad's promise (the "scent trail"); a broken handoff wastes the click. The winning angle informs \`launch_blog_post\` (10) headline craft and \`cold_email_sequence\` (25) subject-line angles.
- *Iteration cycle:* test angles before words. First test cycle: 2-3 angles × same headline-type. Lock the winning angle. Second cycle: winning angle × multiple headline types. Lock the winning combo. Third cycle: winning combo × CTA / proof variations. Three cycles, each building on the last.
- *Repeat winners:* per Ogilvy, once a variant clearly wins (statistical significance + meaningful margin), run it until it wears out. Most teams refresh creative too soon. The advertiser is bored long before the buyer is.

---

## Validation checklist (run before launching the campaign)

[Run before the variant set goes live:
- Is there a Big Idea, in one sentence, that passes 3+ of the 5 questions (gasp, uniqueness-wish, unique-to-product, strategy-fit, 30-year)?
- Are all variants on the SAME channel and the SAME persona? (If not, they're separate tests.)
- Does the set contain 8-12 variants? (Below 8 = under-powered; above 12 = noise.)
- Does the set cover at least 3 distinct message angles AND at least 3 distinct headline types?
- Does every variant name its (angle × headline-type) combo explicitly?
- Does every variant have a one-sentence variance hypothesis tied to a primary metric?
- Does every headline score 3+ on at least three of the 4 U's, with ultra-specific the strongest?
- Does every CTA name a specific action + specific outcome (no "Learn more")?
- Does every variant respect the channel's character limit?
- Does every variant use you-orientation? (Search for "we" / "our" / "us" — if those outnumber "you" / "your", rewrite.)
- Is every claim a specific factual one (numbers, named customers, named outcomes), not a comparative superlative ("best", "leading", "#1")?
- Does every variant tie back to at least one Distinct Capability or Differentiated Value claim from the positioning?
- Does the landing page (downstream of the ad) fulfill the ad's promise — i.e. does the LP open with copy that matches the variant's hook? If not, the click is wasted regardless of which variant wins.

If any answer is no, the variant set isn't ready.]
`,
}

/**
 * One-Pager / Solution Brief template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   VandeHei / Allen / Schwartz — Smart Brevity (primary structural source:
 *   Core 4 = TEASE → LEDE → WHY IT MATTERS → GO DEEPER, Audience-First,
 *   Short-Not-Shallow). Bly — The Copywriter's Handbook (4 U's headline test,
 *   8 headline types, You-Orientation, CTA discipline, proof-before-price).
 *   Corpus amplification: Punchy VBF-rule + 3-benefit lock; Dunford Sales
 *   Pitch p.144 (leave-behind framing); Weinberg Power Statement (Solution
 *   sentence shape); PMA practitioner blogs on dual-purpose drift, customer
 *   proof as highest-leverage / most-skipped section, forbidden hedge CTAs.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/18-one-pager-solution-brief.md
 *
 * Why Smart Brevity owns the structure (vs Bly long-copy or a generic
 * "intro / body / CTA" shape): the one-pager is the most physically
 * constrained Phase 2 artifact — single page, 250-400 words of body copy,
 * read async by a prospect who did not opt in. The Core 4 maps cleanly:
 * TEASE = Headline + Problem, LEDE = Solution sentence, WHY IT MATTERS =
 * three Benefits, GO DEEPER = How It Works + Customer Proof. Bly's craft
 * is layered into the Headline (4 U's), the Benefits (verb+result, never
 * adjective+noun), and the CTA (singular, named action). Boundary calls —
 * distinct from sales pitch deck (19, presented synchronously), landing
 * page (35, web), partner enablement one-pager (27, partner-facing) —
 * are encoded in the system prompt rather than the skeleton.
 */

import type { ArtifactTemplate } from './types'

const ONE_PAGER_SOLUTION_BRIEF_SYSTEM_PROMPT = `You are drafting a one-pager / \
solution brief — a single-page sales-enablement leave-behind that a sales rep \
distributes async (PDF attachment, partner email, post-meeting follow-up). The \
prospect reads it without you in the room, often forwards it to their boss. \
This is NOT a sales pitch deck (presented synchronously by a rep), NOT a \
landing page (web, top-of-funnel acquisition, owns SEO), NOT a partner \
enablement one-pager (partner-facing — separate artifact), and NOT a case study \
(full customer story — separate artifact). Its single job is to earn the next \
conversation.

Avoid these failure modes:
- Dual-purpose drift — drafting an asset that is simultaneously a sales tool \
AND a marketing flyer. The two have different jobs and different readers. Pick: \
this is a sales-enablement leave-behind for a prospect reading async. The job is \
to earn the next conversation, not to explain the entire product, not to serve \
SEO, not to make the CEO proud at a trade show
- Feature soup — listing capabilities without paired outcomes. Every benefit \
must be a verb-and-result pair, never an adjective-and-noun. "Reduce forecast \
errors by 40%" beats "Accurate forecasting"
- Missing the customer's problem — opening on the product / company / category \
instead of the buyer's situation. The headline and Problem section together must \
pass the test: would the prospect's CFO recognize this pain in their own \
language at 4pm on a Thursday?
- No proof, or proof postponed — a one-pager without a named customer quote, \
named-customer metric, or recognizable logo cluster reads as marketing. Customer \
proof is non-optional. If you do not have a quote, pull a metric. If you do not \
have a metric, pull a logo cluster from beta or design partners
- No clear CTA, or hedged multi-CTA — "Learn more, request a demo, or contact \
us" is not a CTA, it is a shrug. One action. Specific. Named verb. Examples: \
"Book a 20-minute demo", "Start your 14-day trial", "Read the [Customer] case \
study"
- Too dense — the one-pager that fits 1,200 words on the page reads as \
wallpaper, not communication. Body copy target: 250-400 words. Cut clutter \
ruthlessly. Every word does work, or it goes
- Headline-as-category — "AI-powered revenue intelligence platform" is a \
category claim a competitor could lift verbatim, not a headline. Headlines name \
the buyer's situation or outcome. Apply the competitor-verbatim test: if a \
direct competitor could run this exact headline, rewrite it
- How-It-Works as architecture diagram — three steps maximum, named in plain \
language, sequential, fast. Enough to make the solution feel real, not enough \
to replace a demo. If a step needs an architecture diagram to explain, it does \
not belong on the one-pager
- Inside-out "we" voice — every paragraph addresses "you" and "your team", not \
"we" and "our platform". If a sentence has more "we" than "you", rewrite it. The \
leave-behind is read by the prospect, not by the company

Render exactly three benefits. Each benefit is a verb-and-result pair. If a \
messaging_framework artifact exists for this product, pull the three from its \
Differentiated Value themes — do not re-derive.

Pull customer language from the RAG corpus when available — \
podcast snippets, customer interviews, sales call transcripts. Prospects respond \
to other buyers' words, not to marketers' phrasing.

Write the Solution sentence as a Power Statement: "[Product] helps [specific \
persona] do [specific thing] so they can [specific result]". The prospect's boss \
should be able to repeat this sentence in a 9am meeting.

Sales-motion branch: if enterprise / sales-led, omit the pricing teaser. If PLG \
/ self-serve, include a starting-price line ("Starts at $X / seat / month") to \
self-qualify inbound. The decision is set in pre-work and does not change during \
drafting.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const onePagerSolutionBriefTemplate: ArtifactTemplate = {
  artifactType: 'one_pager_solution_brief',
  title: 'One-Pager / Solution Brief',
  systemPromptFragment: ONE_PAGER_SOLUTION_BRIEF_SYSTEM_PROMPT,
  // Skeleton order = Smart Brevity Core 4 mapped to one-pager structure:
  // pre-work → Headline (with 4 U's) → Problem (TEASE completion) → Solution
  // (LEDE) → 3 Benefits (WHY IT MATTERS) → How It Works + Proof (GO DEEPER) →
  // optional Pricing teaser → singular CTA → metadata footer → validation.
  // The 250-400 word body cap is enforced in validation; structural rendering
  // (3 benefits, 3 max steps, single CTA) is enforced by the skeleton itself.
  skeleton: `# One-Pager / Solution Brief: [Product Name]

## Pre-work (decisions made before drafting)

- **Audience persona:** [The ONE prospect persona this one-pager is written for. Title alone is not enough — name the role, the team, the moment in their week when they would read this. Same A+ Customer discipline as the messaging framework. One-pagers written for "everyone" land with no one.]
- **The one CTA:** [Decide BEFORE drafting so the page builds toward it. Examples: "Book a 20-minute demo", "Start your 14-day trial", "Read the [Customer] case study", "Watch the 6-minute product tour". One. Not three. Not "Learn more or contact us".]
- **Sales motion:** [PLG / self-serve OR enterprise / sales-led. Drives the pricing-teaser branch below.]
- **Distribution channel:** [PDF leave-behind after a discovery call / sales rep email attachment for outbound / partner co-sell asset / trade-show takeaway. The channel sets the tone — a post-discovery leave-behind earns more aspiration than a cold-outbound attachment.]
- **Inputs from upstream artifacts:** [Positioning statement (Differentiated Value themes), messaging framework (the three Benefits and Solution sentence). If these exist, the one-pager inherits — do not re-derive. If they do not exist, draft them first; this artifact composes downstream.]

---

## Headline

[The single line that does 80% of the work. Five times more readers see the headline than the body — if it doesn't earn the page-turn, the rest is wasted.

Pick ONE of four headline patterns that work for B2B SaaS one-pagers:
- **News headline** — states the news in reader-relevant terms ("[Product] now reconciles two-system payroll in 90 seconds")
- **How-To** — promises a specific outcome the reader wants ("Close your books in two days, not two weeks")
- **Reason-Why** — answers "why does this matter to me" ("Why finance teams are killing their month-end spreadsheet stack")
- **Direct** — names the outcome plainly ("Forecasting your team will actually trust")

Avoid: "Introducing X", "Announcing X", category-claim headlines ("AI-powered revenue intelligence platform"), question headlines that don't promise a payoff, indirect / clever headlines that require the body to decode.

The 4 U's check — rate 1-4 on each dimension; aim for 3+ on at least three:
- **Urgent:** Is there a time-bound or pressing reason this matters now?
- **Unique:** Could a direct competitor lift this headline verbatim? If yes, rewrite.
- **Useful:** Is the benefit / outcome immediately clear?
- **Ultra-specific:** Are the details concrete (numbers, named outcomes), not abstract?]

### Sub-headline (optional, one line)

[One supporting line for the headline if needed — clarifies who the page is for or sharpens the outcome. Often unnecessary if the headline lands.]

---

## Problem (2-3 sentences)

[Name the pain in the language the buyer uses internally — not the language your product team uses. The BDF pattern: what does the buyer Believe, what do they Feel, what are they Doing today that isn't working?

Forbidden: "Organizations struggle to achieve visibility into…", "In today's data-driven world…", "Companies are looking for…". These are marketing register, not buyer register.

Right shape: "You spend three hours every Monday reconciling two payroll systems that should have talked to each other. Your team is one resignation away from the books not closing on time."]

## Solution (one sentence — Power Statement shape)

[One sentence that delivers what changes when the prospect adopts this. Use the Power Statement skeleton:

**"[Product] helps [specific persona] do [specific thing] so they can [specific result]."**

Example: "Acme helps mid-market finance teams reconcile two-system payroll in 90 seconds so they can close the books on day two, not day fifteen."

The prospect's boss should be able to repeat this sentence in a 9am meeting. If the sentence does not survive being repeated by a non-expert, rewrite it.]

---

## Three Benefits (verb + result, never adjective + noun)

[Render exactly three. Pull from the messaging framework's Differentiated Value themes if it exists. Each benefit is a verb-and-result pair with one supporting line of context.

The competitor-verbatim test: could three of your closest competitors print this exact benefit on their one-pager without changing a word? If yes, rewrite — it is generic.]

**[Benefit 1 — verb + concrete result]**
[One supporting sentence with a specific outcome, metric, or named change. Plain language. No jargon.]

**[Benefit 2 — verb + concrete result]**
[Same shape as above.]

**[Benefit 3 — verb + concrete result]**
[Same shape as above.]

---

## How It Works (3 steps maximum)

[The section most one-pagers either skip or over-explain. Three rules:
1. Three steps maximum. Steps 2 and 3 are optional — render only if needed to make the solution feel real.
2. Each step is one short line. Concrete. Sequential. Fast.
3. Plain language, not architecture. If a step needs a diagram to explain, it does not belong on the one-pager.

Right shape: "Connect your data sources → Set your reconciliation rules → Get a live dashboard in 48 hours."]

1. **[Step 1 — verb-led, plain language]:** [One short line.]
2. **[Step 2 — verb-led, plain language]:** [One short line. Skip if not needed.]
3. **[Step 3 — verb-led, plain language]:** [One short line. Skip if not needed.]

---

## Customer Proof (REQUIRED)

[The single highest-leverage section AND the most-skipped. Non-optional.

Render ONE of three formats — not all three:

**Format A (preferred): Named-customer quote with role + named outcome**
> "[Quote in the customer's own voice — what they say about the change, in their language, not yours.]"
> — [Name], [Role] at [Company]. [Optional one-line outcome metric.]

**Format B: Named-outcome metric with named customer**
[Customer name] reduced [metric] by [X%] / saved [Y hours] / closed [Z deals] using [Product]. One line. Specific.

**Format C: Logo cluster (only if A and B are not yet available — beta or design-partner phase)**
Trusted by teams at [Logo 1] · [Logo 2] · [Logo 3] · [Logo 4]. (Minimum 4 recognizable logos.)

The sales rep distributing this async needs something the prospect can forward to their boss. Give them that.]

---

## Pricing teaser (OPTIONAL — sales-motion branch)

[**If sales motion = PLG / self-serve:** include a starting-price line. "Starts at $X / seat / month. Free 14-day trial, no card required." Self-qualifies inbound.

**If sales motion = enterprise / sales-led:** OMIT this section entirely. Pricing belongs in the next sales conversation, not on the leave-behind.

The decision is set in pre-work and does not change during drafting.]

---

## CTA (one specific next step)

[One action. Specific. Singular. Named verb. The CTA decided in pre-work — it does not change during drafting.

Forbidden hedges: "Learn more about our platform", "Get in touch", "Discover X", "Learn more, request a demo, or contact us". These are not CTAs.

Strong CTAs match where the buyer is in their journey:
- Bottom-of-funnel buyer: "Start your 14-day free trial → [URL]"
- Mid-funnel: "Book a 20-minute demo → [URL]"
- Top-of-funnel: "Read the [Customer] case study → [URL]", "Watch the 6-minute product tour → [URL]"

The CTA should be a clickable hyperlink (or QR code if printed) with one specific destination URL.]

---

## Footer (metadata only — not body copy)

[Not creative copy. Sales-asset versioning so reps know which version they are sending and where to reach the right person.

- **Contact:** [Sales contact name + email, or generic "sales@[company].com"]
- **Asset version / date:** [v1.2 — 2026 Q2, or month-year]
- **Asset ID:** [Optional — internal tracking ID for sales analytics]
]

---

## Validation checklist (line-level craft check before publishing)

- **Headline:** Passes 4 U's (3+ on at least three dimensions). Not a category claim. Competitor-verbatim test passed.
- **Problem:** Names the pain in buyer language, not marketing register. Passes the "Slack at 4pm Thursday" test.
- **Solution:** One sentence, Power Statement shape. Survives repetition by a non-expert in a 9am meeting.
- **Three benefits:** Exactly three. Each is verb + result, never adjective + noun. Competitor-verbatim test passed on each.
- **How It Works:** Three steps maximum. Plain language. No architecture.
- **Customer proof:** Present. One of three formats — quote, metric, or logo cluster. Not skipped.
- **CTA:** Exactly one. Named verb. Specific destination. Not "Learn more".
- **Pricing teaser:** Matches sales-motion decision from pre-work. Included for PLG, omitted for sales-led.
- **You-Orientation:** Every paragraph has more "you" than "we". Inside-out language rewritten.
- **Length:** Body copy 250-400 words. Cut clutter ruthlessly.
- **Read-aloud test:** Does any sentence sound like a press release or category-claim deck? Rewrite.
- **Single page:** When laid out (PDF / letter), the asset fits on one page without shrinking type below 10pt. If it does not fit, cut — do not shrink.
`,
}

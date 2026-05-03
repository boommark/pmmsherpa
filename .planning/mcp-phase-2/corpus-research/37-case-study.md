# Research — Case Study (artifact 37)

## Canonical sources

Per `artifact-book-map.md` row 37: **Stories that Stick (Hall)** + corpus.

**Book card read:** `~/Documents/AbhishekR/Book Brain/Stories that Stick.md`.
The card surfaces five frameworks; two are load-bearing for case studies:

- **Customer Story** (one of the four business stories: Value, Founder,
  Purpose, Customer). The case study artifact IS the published, long-form
  Customer Story. A real example of transformation through your offering.
- **Story Structure: Normal → Explosion → New Normal.** Hall's three-act
  spine maps cleanly to the case-study craft pattern: Situation (before /
  Normal) → Solution (the change / Explosion) → Outcome (after / New Normal).
- **Four Story Elements: Identifiable Characters, Authentic Emotion,
  Significant Moment, Specific Details.** These are the craft components
  that turn a structured case study from a checklist into a story that
  sticks. We encode them as inline composition rules, not standalone
  sections, so the skeleton stays scannable.

**Authority decision:** The book card is the structural source. The corpus
is amplification — B2B specificity (multi-stakeholder reading, headline
writing formula, the "vendor as protagonist" failure mode) that the book
doesn't address because Hall's frame is generic-business, not B2B-SaaS.

## Corpus citations (top 10)

The corpus query returned a single high-density synthesis chunk plus 10
citations. The corpus body itself reads like a finished case-study craft
guide and aligns with the book on every load-bearing structural call.

- Geoffrey A. Moore — *Crossing the Chasm* p. 154 (whole-product proof
  pattern; case studies as chasm-crossing evidence)
- Aratrika Rath (PMA) — *6 best practices for creating engaging case
  studies* (the closest direct-topic chunk)
- Stevie Langford (PMA) — *What is B2B messaging* — "Prevalent pitfalls"
- PMA — *How brand messaging changes B2C → B2B*, "B2B example: Salesforce"
  (multi-stakeholder reading: front desk + CFO + patient)
- Wes Bush (productled.com) — *6 SEO secrets, Typeform* (headline / SEO
  patterns for case-study landing pages)
- Stevie Langford (PMA) — *What is B2B messaging* — "How to avoid B2B
  messaging mistakes"
- Maja Voje — *The Go-To-Market Strategist* p. 291 (proof-stack patterns)
- April Dunford — *Sales Pitch* p. 16 (proof slot in pitch architecture)
- Stevie Langford (PMA) — generic chunk
- Wes Bush (productled.com) — *B2B customer acquisition strategy* —
  "Step 3: Focus on the benefits, not the features"

## What the corpus added beyond the book

- **B2B multi-stakeholder reading.** The same case study is read by the
  economic buyer, end user, and champion with different questions. The
  Salesforce / online-scheduling-software example: front desk *and* CFO
  *and* patient satisfaction. We encode this as a pre-work decision and a
  composition pointer, not as multiple separate case studies.
- **Headline formula.** `[Customer type] + [Specific outcome] + [Time or
  scale context]`. "How a 200-person fintech cut month-end close from 12
  days to 4 without adding headcount" beats "Customer Success Story: Acme
  Corp" by a mile. The book has no headline guidance.
- **Specificity rule for outcomes.** "One number beats three adjectives."
  The percentage trap: "improved efficiency by 40%" means nothing without
  context. "Cut manual reporting from 8 hours weekly to 45 minutes" means
  everything. Encoded as a hero-metric pre-work decision.
- **Vendor-as-protagonist failure mode.** The most common B2B case-study
  failure: vendor centers itself. "Our platform's AI-powered workflow
  engine reduced..." Wrong subject. Customer reduced. Customer achieved.
  Customer transformed. This isn't a Hall framework; it's a B2B-specific
  trap.
- **Quote rule.** Customers should be quoted on *business impact*, not on
  product UX. "Cut our close cycle from 12 days to 4" is a quote that
  earns its place. "Easy to use" is filler that pollutes the case study.

## Boundary clarity (resolved before drafting)

Three frames that get conflated:

- **The ask** (artifact 15, sibling) — the email/Slack/Zoom *request* for a
  quote or testimonial. Short-form. Output: a message you send.
- **The interview guide** — the question set you take into the customer
  interview. Internal artifact. Not in this template.
- **The case study** (this artifact) — the published, written 800-1500-word
  marketing collateral piece on a website / sales handoff / analyst proof
  point. Output: the *finished case study draft*, not the upstream
  artifacts.

This template covers the **finished published draft only.** Interview
guide is referenced as upstream pre-work, not rendered.

## Design decisions

- **Three-act spine, not feature-list.** Hall's Normal → Explosion → New
  Normal. Renamed to B2B vocabulary: Situation → Solution → Outcome. The
  acts are the unmovable backbone; everything else slots inside.
- **Hero card at the top.** Headline + 1-line metric proof + customer
  logo placement. The hero card is the failure-mode antidote: it forces
  the writer to commit to a specific outcome metric before writing any
  prose. If you can't fill the hero card, the case study isn't ready.
- **Customer-as-hero is structural, not a tone preference.** The
  "About the customer" section comes BEFORE "Why they chose us" — and
  "Why they chose us" is framed as the customer's decision, not our pitch.
  The negative system prompt enforces it ("don't open with our company
  name, don't lead with our product, don't substitute generic adjectives
  for outcome data").
- **Single hero metric.** The case study is hung on ONE number. Secondary
  outcomes belong in the outcome section but never in the hero card.
  Multiple competing hero metrics dilute every reader takeaway.
- **Narrative angle as a pre-work decision.** Cost saved / revenue grown
  / risk avoided / time-to-value. Pick one before drafting. The angle
  determines which numbers go in the hero card and which stakeholder gets
  quoted.
- **Customer voice via direct quotes, on business impact.** Two or three
  quotes embedded in the relevant acts. Quote rule: customers speak to
  *outcomes and decisions*, not to product UX. "Easy to use" quotes are
  blocked by the negative system prompt.
- **The lesson + CTA close.** "What others should learn from this" is a
  short standalone section that doubles as a takeaway for the skim
  reader. The CTA is single, named, and specific (book a demo, read the
  next case study, talk to the team).
- **Permission gate as Step 0.** Customer name + permission status is the
  first pre-work check. Anonymized case studies are valid but weaker —
  flagged in pre-work, not blocked.
- **Upstream artifacts named explicitly.** Positioning, messaging, and
  testimonial-ask outputs feed this artifact. The pre-work section
  references them so the writer doesn't reinvent strategic decisions
  inside the case study draft.
- **Word target: 800-1500.** Hard floor enforced by the spine. Hard
  ceiling enforced by the negative prompt — "don't use the case study to
  relitigate positioning" is the anti-bloat rule.

## What's excluded

- Interview guide / question set — different artifact, internal use
- Testimonial ask (artifact 15) — sibling, see above
- Video case study production logistics — out of scope
- Case study landing page meta tags / SEO setup — implicit in headline,
  not templated
- Multi-customer "round-up" or trend reports — different artifact
- Customer logo permission / legal release language — flagged as a
  pre-work check, not drafted

## System prompt failure modes (negative guidance)

Distilled to 7:

1. **Don't open with our company name.** Open with the customer or the
   problem. "[Customer] cut close cycle from 12 days to 4" — not "[Our
   product] helped [customer]…"
2. **Don't lead with our product.** Product enters in Act 2 (Solution),
   briefly. The customer is the protagonist across all three acts.
3. **Don't omit a specific metric.** A case study without a hero number
   is a testimonial. The hero card REQUIRES a quantified outcome.
4. **Don't substitute generic adjectives for outcome data.** "Significant
   time savings" is worthless. "Cut manual reporting from 8 hours weekly
   to 45 minutes" is the bar. Adjectives without numbers are filler.
5. **Don't quote customers saying "easy to use".** Quote them on
   business impact: outcomes, decisions, what they couldn't do before.
   UX-praise quotes pollute the case study.
6. **Don't use the case study to relitigate positioning.** Positioning
   is upstream. The case study uses it as input, doesn't re-argue it.
   This is the primary anti-bloat rule.
7. **Don't write a vendor-could-be-anyone headline.** "Acme Achieves
   Operational Excellence with [Product]" tells the reader nothing. Use
   the formula: `[Customer type] + [Specific outcome] + [Time or scale
   context]`.

Voice rule: customer-centric, specific, outcome-anchored. No author
name-drops in the output. Match the customer's register where quoted.

## Open questions for audit

- Should we render TWO variants (full long-form vs. snippet/sales-ready
  short-form ~300 words)? Decided: NO — short-form lives inside
  `one_pager_solution_brief` and `sales_pitch_deck`; this artifact is
  long-form only. Revisit if practitioners ask.
- Should the template render the customer logo / hero image as a
  field? Decided: render as a placeholder pointer (logo placement,
  alt text), not as a literal image — the artifact output is markdown.

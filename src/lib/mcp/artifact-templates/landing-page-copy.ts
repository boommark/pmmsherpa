/**
 * Landing Page Copy template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Bly — The Copywriter's Handbook (4 U's headline test, Eight Headline Types,
 *   AIDA arc, You-Orientation, headline-as-gateway, one specific CTA).
 *   Hormozi — $100M Offers (Value Equation: Dream Outcome × Likelihood /
 *   (Time Delay × Effort & Sacrifice); Problems & Solutions stack; friction-
 *   reducers above the fold; offer wrapper / naming). Corpus amplification:
 *   Wes Bush (ProductLed) above-the-fold persuasion patterns, Neil Patel B2B
 *   PPC LP optimization, PMA practitioner blogs on conversion failure modes.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/35-landing-page-copy.md
 *
 * Why AIDA expanded for LP modules (vs. a generic "hero / features / CTA"
 * shape or the Smart Brevity Core 4 used for the launch blog post): a landing
 * page is a permanent conversion surface running continuously against paid +
 * organic traffic. The work it does is not announcement — it's persuasion
 * across one scroll. Bly's AIDA is the canonical scaffold for one-shot
 * persuasion; Hormozi's Problems & Solutions stack is what fills the middle.
 * Each benefit block carries an inline 4 U's micro-test so the model cannot
 * draft a vague benefit and move on. Objection handlers live as a named
 * section (not buried in FAQ) because the corpus is unambiguous: late-stage
 * conversion is unlocked by naming and answering specific objections.
 *
 * Boundary discipline against adjacent artifacts:
 * - vs. Launch Blog Post (10): blog post is a one-time announcement structured
 *   by Smart Brevity around a launch moment. LP is a permanent multi-module
 *   conversion surface.
 * - vs. Cold Email Sequence (25): sequence is 5 day-spaced emails with
 *   escalating CTAs. LP is one page, all modules co-present, single primary
 *   CTA repeated.
 * - vs. Positioning (1) / Messaging Framework (2): the LP is the consumer-
 *   facing surface that *renders* those internal docs. The pre-work block
 *   forces inheritance, not re-derivation.
 */

import type { ArtifactTemplate } from './types'

const LANDING_PAGE_COPY_SYSTEM_PROMPT = `You are drafting landing page copy — \
the structured web copy block for a conversion-oriented page (homepage, product \
page, or campaign LP). This is COPY, not visual design or layout. Output is \
text in named modules a designer or developer will render. This is NOT a launch \
blog post (one-time announcement), NOT a cold email (outbound 1:1 surface), \
and NOT a positioning statement (internal strategic doc). It is the page that \
turns visitor attention into a single specific action.

Avoid these failure modes:
- "We" / inside-out copy — every block written from the reader's POV. If a \
sentence has more "we" / "our" than "you" / "your", rewrite it. The visitor \
arrived to solve THEIR problem, not learn about your company
- Vague benefit copy — "best-in-class", "next-gen", "AI-powered", "all-in-one \
platform for modern teams", "enterprise-grade". Anything a competitor could \
copy verbatim is filler, not a benefit. Every benefit block must pass the \
4 U's micro-test (Useful, Urgent, Unique, Ultra-specific) — at least 3 of 4 \
at strength 3+
- Headlines that fail the 4 U's — "Introducing X", "The leading AI platform for Y", \
"Streamline your workflow", "Transform your business", indirect/clever \
headlines that require the body to decode. Lead with a specific tangible \
outcome the reader can picture in their head
- Buried CTA / multiple competing CTAs — choice is the most consistent \
conversion killer above the fold. ONE primary CTA, repeated at every major \
section break. The CTA decided in pre-work does not change during drafting
- Feature-first structure — leading the page with what the product does \
instead of what the buyer gets. Buyers don't wake up thinking about \
integrations; they wake up thinking about the problem those integrations \
solve. Lead with the pain or the outcome, never the mechanism
- Generic proof / proof without specificity — "5 stars" and "Great product!" \
do nothing. One named-VP quote with a metric ("reduced churn by 23% in \
90 days") beats five generic quotes. Logos do double duty (trust + ICP \
self-identification) only when they match the buyer's industry
- Restating positioning as marketing hype — the positioning statement is the \
internal source. The LP renders it as buyer-facing benefits, not as the \
internal language. "Distinct Capabilities" and "Differentiated Value" are \
private vocabulary; on the page, they show up as outcomes and proof
- Message mismatch — the ad / search query / referral promise must match the \
LP hero. If the ad said "close your books in two days" and the hero says \
"the most powerful finance platform", the visitor feels deceived and bounces. \
Pre-work forces the user to name the upstream traffic source and lock the \
match
- CTA friction the copy ignores — "Request a demo" under a 10-field form is a \
copy-and-form failure together. Friction-reducers ("No credit card required", \
"Free for 14 days", "2-minute setup", named guarantee) belong in the hero, \
not the footer
- Objections handled in FAQ only — late-stage conversion is unlocked by \
naming and answering 3-5 specific objections (price, switching cost, \
security/compliance, "this won't work for our setup", time-to-value) in a \
dedicated section, then re-touching them in FAQ. Both, not either

Inherit (do not re-derive) from upstream artifacts:
- Positioning statement → Differentiated Value themes become the benefit blocks
- Messaging framework → primary value prop and pillars become the hero + \
benefit-block headers
- ICP / persona → the page speaks to ONE primary persona. Pages written for \
"everyone" land with no one
- Launch plan (if a campaign LP) → the single CTA and audience inherit from there

Apply the Value Equation as a copy check on every benefit block: does the \
block raise the Dream Outcome, raise Perceived Likelihood (proof / specificity), \
shrink Time Delay (speed), or shrink Effort & Sacrifice (friction-reducer)? \
A benefit block that doesn't move at least one of these levers is filler.

Reference frameworks implicitly. Do not name-drop authors or framework names \
(AIDA, Value Equation, 4 U's) in the output. The 4 U's micro-test in the \
skeleton is for the user's drafting discipline, not the published page.`

export const landingPageCopyTemplate: ArtifactTemplate = {
  artifactType: 'landing_page_copy',
  title: 'Landing Page Copy',
  // Skeleton order = AIDA expanded for B2B SaaS LP modules:
  //   Attention (hero + proof bar)
  //   Interest (problem agitation + solution overview)
  //   Desire (benefit blocks with inline 4 U's check + testimonial + feature
  //          deep-dives + objection handlers)
  //   Action (secondary CTA + FAQ + footer CTA)
  // Pre-work block forces inheritance from upstream artifacts and locks the
  // single primary CTA before drafting begins.
  systemPromptFragment: LANDING_PAGE_COPY_SYSTEM_PROMPT,
  skeleton: `# Landing Page Copy: [Page Name]

## Pre-work (decisions made before drafting)

- **Page type:** [Homepage / product page / campaign landing page / use-case page / comparison page. Each has different conventions: a homepage carries the broadest brand promise; a product page goes deep on one offering; a campaign LP is single-purpose and ad-matched. Pick one — do not draft a hybrid.]
- **Primary persona:** [The ONE buyer the page is written for. Same A+ Customer discipline as the messaging framework. Title, seniority, the pain in their gut, the language they use. Pages written for "everyone" land with no one.]
- **Upstream artifacts consumed:** [Positioning statement (Differentiated Value themes → benefit blocks), messaging framework (primary value prop → hero), ICP/persona (audience), launch plan if campaign LP (single CTA, audience). If these exist, the page inherits — do not re-derive. If they don't exist, flag this and recommend drafting them first.]
- **The one primary CTA:** [Decide BEFORE drafting so the page builds toward it. Examples: "Start free trial", "Book a demo", "Get the report", "Talk to sales". One. Repeated, never replaced. Match to time-to-aha: if a new user reaches value in <30 min, free trial; if guided walkthrough is needed, demo.]
- **Secondary CTA (optional):** [For visitors not ready for the primary CTA. Lower-commitment fallback: "See it in a 12-min demo video", "Read the [Customer] case study", "Get the [Asset]". Optional — adding one only if it serves a real audience segment.]
- **Friction-reducers:** [The lines that go in the hero next to the CTA. "No credit card required", "Free for 14 days", "2-minute setup", "Cancel anytime", named guarantee. These move conversion measurably; they belong above the fold, not in the footer.]
- **Traffic source / message match:** [Where does traffic to this page come from? Paid ads, organic search query, partner referral, in-product link, sales email. Name the upstream promise / ad headline / search query. The hero must continue that promise — message mismatch is one of the most under-recognized conversion killers.]

---

## HERO (above the fold)

### Primary headline
[ONE specific, tangible outcome the reader can picture in their head. Lead with the outcome; the mechanism comes later.

Strong shapes for B2B SaaS:
- **Direct outcome:** "Close your books in two days, not two weeks."
- **How-To:** "How [persona] [achieves outcome] without [common pain]."
- **News (for new launches):** "[Capability] now [does specific thing for specific buyer]."
- **Reason-Why:** "Why [smart segment] is moving off [old approach]."

Avoid: "Introducing X", "The leading platform for Y", "Streamline your Z", "Transform your business", question headlines without a payoff, indirect/clever lines that require the body to decode.]

### 4 U's micro-test (rate each 1-4; aim for 3+ on at least three dimensions)
- **Useful:** [Is the benefit / outcome immediately clear to the reader?]
- **Urgent:** [Is there a time-bound or stakes-bound reason to care now?]
- **Unique:** [Does this say something the reader hasn't heard from competitors verbatim?]
- **Ultra-specific:** [Are the details concrete (numbers, named outcomes, named workflows)?]

### Alt headline 1
[Different angle — e.g., if primary is direct outcome, try How-To here.]

### Alt headline 2
[Different angle — e.g., a Reason-Why or contrast-state ("Stop spending 12 hours a week on X").]

### Alt headline 3
[Different angle — e.g., a quantified-outcome variant or a buyer-quote shape.]

### Subheadline (one sentence, <25 words)
[Reduce the perceived leap. Name who the page is for and how the outcome happens. "For [persona] at [segment] who [situation]" does more work than "Our powerful suite of tools". Connect the headline's promise to a believable mechanism without listing features.]

### Primary CTA (button label)
[The action verb + the value, not the action verb alone. "Start free trial" beats "Get started". "Book a 12-min demo" beats "Contact us". Match the label to the pre-work primary CTA.]

### Friction-reducer microcopy (next to / under the CTA)
[The friction-reducers from pre-work, rendered as one short line. "No credit card. Free for 14 days." or "2-minute setup. Cancel anytime."]

### Secondary CTA (text link, lower-commitment, optional)
[The secondary CTA from pre-work, rendered as a text link or ghost button next to the primary. Skip if no secondary was specified.]

### Hero visual brief (one line — designer prompt, not visual design)
[One sentence describing what the hero visual should show. Product screenshot of the specific outcome, customer logo bar, before/after split — whatever continues the headline's promise. Not "a hero image" — a specific image.]

---

## PROOF BAR (just below the hero, above the scroll)

### Logo strip
[5-8 customer logos, chosen for the visitor's industry / segment match (not the most famous logos). The logos do double duty: trust + ICP self-identification. List the logos to use, in priority order.]

### Headline metric (optional, one line)
["Trusted by 4,000+ finance teams" or "Used in 200+ Series-B SaaS companies" or "$2B reconciled in 2026". One specific, defensible number. Skip if no defensible metric exists — a fake metric is worse than no metric.]

---

## PROBLEM (agitation — make the visitor feel understood)

### Section header
[One line that names the pain in the visitor's language. "Your team is drowning in two-system reconciliation." Not "The challenges of modern finance".]

### Body (2-3 short paragraphs)
[Describe the current state — the visitor's Tuesday morning, the moment of friction, the cost of the status quo. Use buyer language pulled from the corpus / user research, not marketing language.

The pattern that works is contrast-state framing: "Your team spends 12 hours a week on manual reconciliation. The companies that fixed this spend two." Make the cost of inaction concrete before introducing the solution.

Forbidden: "In today's fast-paced business world", "Modern companies need", any opener that could appear on five competitor pages without modification.]

---

## SOLUTION OVERVIEW (one paragraph + one image)

### Section header
[The new way, named in one line. "Reconciliation that runs while you sleep." Not "Our Platform".]

### Body (one short paragraph, <80 words)
[Name the shift the product makes possible. Not the product's architecture, not the feature list. The before-state from PROBLEM resolved into a different way of working. Optional one-line mechanism only if the reader needs it to trust the claim.]

### Solution visual brief (one line)
[One sentence describing the supporting image. Product screenshot, simple before/after diagram, named workflow. Not "a screenshot" — specific.]

---

## BENEFIT BLOCKS (3-5 — each solves a related buyer problem)

[Each benefit block names a specific problem the buyer faces and how the product solves it. Render 3-5 blocks. More than 5 dilutes the page. Each block must move the Value Equation: raise Dream Outcome, raise Perceived Likelihood (proof), shrink Time Delay (speed), or shrink Effort & Sacrifice (friction). A block that doesn't move at least one is filler.]

### Benefit block 1

- **Header (outcome-led, not feature-led):** [E.g., "Close the books in two days, not two weeks." Not "Reconciliation Engine".]
- **Body (1-2 sentences):** [Specific outcome + one-line mechanism if needed. Buyer-facing language only.]
- **Proof point (1 line):** [One specific metric, customer name, or named workflow. "[Customer] cut close time from 11 days to 2." If no proof exists yet, flag — do not fabricate.]
- **4 U's micro-check (yes/no per dimension, target 3+ yes):** Useful? Urgent? Unique? Ultra-specific?

### Benefit block 2

- **Header:** [Outcome-led.]
- **Body:** [Specific outcome.]
- **Proof point:** [Specific.]
- **4 U's micro-check:** Useful? Urgent? Unique? Ultra-specific?

### Benefit block 3

- **Header:** [Outcome-led.]
- **Body:** [Specific outcome.]
- **Proof point:** [Specific.]
- **4 U's micro-check:** Useful? Urgent? Unique? Ultra-specific?

### Benefit block 4 (optional)

- **Header:** [Outcome-led. Skip if 3 covers the differentiated value — fewer is better than padded.]

### Benefit block 5 (optional)

- **Header:** [Outcome-led. Skip if 3-4 covers it.]

---

## TESTIMONIAL SLOT (one named, specific quote)

### Quote
["[Outcome the customer achieved]" — exactly that, in their words. Pull from corpus / customer interviews. Specificity beats volume: one named-VP quote with a metric beats five generic five-star quotes.]

### Attribution
[Full name, title, company. Logo if available. Title + company alone is weaker than full attribution.]

### Optional outcome callout
[The one number from the quote, surfaced visually. "Cut close time 80%." Designer renders this as a stat block.]

---

## FEATURE DEEP-DIVES (optional — only for product pages or longer-form LPs)

[For a homepage or short campaign LP, skip this section — the benefit blocks are the page. For product pages or long-form LPs, render 2-3 feature deep-dives that go one layer below the benefit blocks. Each deep-dive earns its place ONLY if a serious buyer needs the mechanism to trust the outcome.

Each deep-dive: one outcome-led header, 2-3 sentences of body, one screenshot or diagram brief. Feature deep-dives are the place mechanism finally earns its place — but still in the buyer's language, not the product team's.]

### Feature deep-dive 1 (optional)

- **Header:** [Outcome-led, specific.]
- **Body:** [How it works, in buyer language. 2-3 sentences max.]
- **Visual brief:** [One sentence — specific screenshot or diagram.]

### Feature deep-dive 2 (optional)

[Same shape.]

### Feature deep-dive 3 (optional)

[Same shape.]

---

## OBJECTION HANDLERS (3-5 — name and answer the real reasons buyers don't convert)

[Late-stage conversion is unlocked by naming the specific objections that block buyers, then answering each one before they can voice it. This is NOT the FAQ — this is the persuasion layer. The FAQ comes later and handles the long tail.

For each objection: name it in the buyer's voice, then answer it in one short paragraph. Render 3-5. Common objection categories for B2B SaaS:
- **Price:** "It's too expensive for our stage / budget."
- **Switching cost:** "We already have [incumbent / spreadsheet] — moving is too painful."
- **Security / compliance:** "Will this pass our security review / SOC 2 requirement?"
- **Fit:** "This won't work for our [setup / stack / industry / scale]."
- **Time-to-value:** "How long until we see results — we don't have time for a 6-month rollout."]

### Objection 1

- **Buyer's voice:** ["[Direct quote of the worry]"]
- **Answer:** [One short paragraph. Resolve with proof, a mechanism, or a friction-reducer — not a marketing-style reassurance.]

### Objection 2

- **Buyer's voice:** ["[Direct quote.]"]
- **Answer:** [Resolve with specifics.]

### Objection 3

- **Buyer's voice:** ["[Direct quote.]"]
- **Answer:** [Resolve with specifics.]

### Objection 4 (optional)
[If a fourth real objection exists — not padding.]

### Objection 5 (optional)
[If a fifth real objection exists.]

---

## SECONDARY CTA SECTION (re-up the primary CTA before FAQ)

### Section header (one line)
[Compress the page's value into one closing line. "Ready to close your books in two days?" Not "Get Started Today".]

### Supporting line (one sentence)
[One sentence reinforcing the outcome and removing residual friction. "[Number] teams have made the switch this quarter. Setup takes 2 minutes."]

### CTA (button label — same as hero)
[The same primary CTA as the hero. Do not introduce a new action here. Consistency is the conversion lever.]

### Friction-reducer microcopy
[The same friction-reducers from the hero, restated.]

---

## FAQ (long-tail objections — 5-8 questions)

[The FAQ handles the questions buyers ask after the persuasion has done its work — pricing details, integration list, security specifics, contract terms, support model. Each question is a real buyer question (drawn from sales calls, support tickets, demo Q&A), not a marketing-fabricated softball.

Each answer: one short paragraph, specific, no hedging. If the answer is "yes" or "no", lead with that word. Optional one-line CTA inside the answer where it earns its place ("See the full integration list" → linked).]

### FAQ 1

- **Q:** [Real buyer question, in their words.]
- **A:** [Direct answer. Specifics.]

### FAQ 2

- **Q:** [Real buyer question.]
- **A:** [Direct answer.]

### FAQ 3

- **Q:** [Real buyer question.]
- **A:** [Direct answer.]

### FAQ 4

- **Q:** [Real buyer question.]
- **A:** [Direct answer.]

### FAQ 5

- **Q:** [Real buyer question.]
- **A:** [Direct answer.]

### FAQ 6-8 (optional — only real questions, not padding)
[Add only if a real buyer question exists.]

---

## FOOTER CTA (the final ask)

### Headline
[One line. Direct. Returns the visitor to the primary action. "Start closing your books in two days." Not "Ready to get started?".]

### Primary CTA (same as hero — third occurrence)
[Same button label as hero and secondary CTA. Three occurrences of the same CTA across the page is the rule.]

### Friction-reducer microcopy
[Restated one final time.]

---

## Validation checklist (line-level craft check before shipping)

- **Headline:** Passes 4 U's (3+ on at least three dimensions). Outcome-led, not feature-led. Not "Introducing X" / "The leading platform for Y".
- **Subheadline:** Names the persona and the mechanism in one sentence, <25 words.
- **Friction-reducer:** Present in the hero, not buried in the footer.
- **Proof bar:** Logos match the buyer's industry, not the most famous logos. Headline metric (if used) is defensible.
- **Problem section:** Opens on the buyer's pain in the buyer's language. Not "in today's fast-paced world".
- **Benefit blocks:** Each block is outcome-led, has a specific proof point, and passes the 4 U's micro-check (3+ of 4). Each block moves at least one Value-Equation lever (Dream Outcome / Likelihood / Time / Effort).
- **Testimonial:** One named-person quote with a metric. Full attribution.
- **Objection handlers:** 3-5 real objections, named in buyer voice, answered with specifics.
- **CTA discipline:** One primary CTA. Three occurrences (hero, secondary CTA section, footer). Same button label every time.
- **Message match:** Hero promise continues the upstream traffic source's promise (ad / search query / referral).
- **You-Orientation:** Every paragraph has more "you" / "your" than "we" / "our". Inside-out language rewritten.
- **No vague benefit copy:** No "best-in-class", "next-gen", "AI-powered", "all-in-one", "enterprise-grade", "transform your business" anywhere on the page.
- **Read-aloud test:** Does any sentence sound like a press release, a feature spec, or an awards-show pitch? Rewrite.
`,
}

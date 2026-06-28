/**
 * Case Study template for the generate_artifact MCP tool.
 *
 * Canonical source (read first per .planning/mcp-phase-2/methodology.md):
 *   Kindra Hall — Stories that Stick. The Customer Story (one of the four
 *   business stories) + the Normal → Explosion → New Normal three-act spine
 *   + the four story-craft components (Identifiable Characters, Authentic
 *   Emotion, Significant Moment, Specific Details). Adjacent: Geoffrey
 *   Moore — Crossing the Chasm (case studies as whole-product proof).
 *   Corpus tier-2: PMA case study
 *   guides (Aratrika Rath, Asya Bashina), B2B case-study practitioner
 *   patterns.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/37-case-study.md
 *
 * Why this template's spine is three acts, not "company background →
 * challenge → results": Hall's Normal → Explosion → New Normal is the
 * structural pattern that makes a story stick — it forces a vivid before,
 * a moment of change, and an after that earns its place. The conventional
 * B2B case-study template (company blurb → challenge → results) buries the
 * customer behind a corporate dossier and treats the vendor as the
 * protagonist. The corpus is unanimous on this: vendor-as-protagonist is
 * the #1 case-study failure mode in B2B. Three acts, customer hero, hero
 * metric committed up front in a card.
 *
 * Sibling: customer_testimonial_ask (artifact 15) — the upstream ask. This
 * artifact is the published, written long-form draft used as marketing
 * collateral on websites / sales handoff / analyst proof, 800-1500 words.
 * Not the ask, not the interview guide.
 */

import type { ArtifactTemplate } from './types'

const CASE_STUDY_SYSTEM_PROMPT = `You are drafting a published, written \
customer case study — long-form (800-1500 words) marketing collateral used \
on a website, sales handoff, or analyst proof point. The customer is the \
hero. The vendor enters the story briefly in Act 2 and exits to let the \
customer's outcome carry Act 3.

Avoid these failure modes:
- Don't open with our company name. Open with the customer or the problem. \
The first sentence centers the customer's world, not our product.
- Don't lead with our product. The product enters in Act 2 (Solution), \
briefly. The customer is the protagonist across all three acts.
- Don't omit a specific metric. A case study without a hero number is a \
testimonial. The hero card requires a quantified outcome — single hero \
metric, named in the headline.
- Don't substitute generic adjectives for outcome data. "Significant time \
savings" is worthless. "Cut manual reporting from 8 hours weekly to 45 \
minutes" is the bar. One number beats three adjectives every time.
- Don't quote customers saying "easy to use" or other UX praise. Quote \
them on business impact: outcomes, decisions, what they couldn't do \
before. UX-praise quotes pollute the case study.
- Don't use the case study to relitigate positioning. Positioning is \
upstream input, not subject matter. This is the anti-bloat rule.
- Don't write a vendor-could-be-anyone headline. "[Company] Achieves \
Operational Excellence with [Product]" tells the reader nothing. Use the \
formula: [Customer type] + [Specific outcome] + [Time or scale context].

Three-act spine is non-negotiable: Situation (before — vivid pain, status \
quo cost) → Solution (with us — brief, the change moment) → Outcome \
(after — quantified business impact, secondary outcomes, customer voice). \
Most words go to Acts 1 and 3. Act 2 is the bridge.

Embed two or three direct customer quotes, attributed by name + title + \
company. Each quote earns its place by speaking to outcomes or decisions, \
not to features.

Word target: 800-1500. If the draft runs longer, the failure is usually \
relitigating positioning or padding Act 2. Cut, don't pad.

Reference frameworks implicitly. Do not name-drop authors in the output. \
Match the customer's register where quoted.`

export const caseStudyTemplate: ArtifactTemplate = {
  artifactType: 'case_study',
  title: 'Customer Case Study',
  systemPromptFragment: CASE_STUDY_SYSTEM_PROMPT,
  // Skeleton: pre-work → hero card → about the customer → situation
  // (Act 1) → why they chose us → solution (Act 2, brief) → outcome
  // (Act 3, with hero metric proof + secondary outcomes + quote) →
  // the lesson → CTA. Three-act spine with hero card up front and a
  // takeaway lesson at the close for skim readers.
  skeleton: `# Case Study: [Customer Name] — [Headline-Worthy Outcome]

## Pre-work (decisions made before drafting)

- **Customer name + permission status:** [Named, with written approval / under NDA / anonymized industry-only. If permission isn't locked, the case study isn't ready to publish — flag it. Anonymized case studies are valid but weaker; name + logo carry significantly more weight.]
- **Hero metric (single):** [The ONE quantified outcome the case study hangs on. Format: before-state number → after-state number, with time or scale context. "Cut month-end close from 12 days to 4." "Grew qualified pipeline from $2M to $8M in two quarters." If you cannot name a single hero metric in this format, the case study isn't ready — go back to the customer for harder numbers before drafting.]
- **Narrative angle:** [Pick ONE: cost saved / revenue grown / risk avoided / time-to-value. The angle determines which numbers go in the hero card and which stakeholder gets quoted. Mixing angles produces a diffuse case study with no headline.]
- **Hero customer voice:** [Name + title + company of the primary quoted person. The title needs to resonate with your buyer persona — a quote from a Senior Analyst, even a delighted one, does less work than a Director-or-above quote that matches your prospect's seat.]
- **Multi-stakeholder reading:** [In B2B the same case study gets read by the economic buyer, end user, and champion with different questions. Note which stakeholders matter for this case and what each is reading for. This shapes the secondary outcomes and the secondary quote (if used).]
- **Upstream artifacts (inputs, not subject matter):** [Positioning statement, messaging framework, customer testimonial ask outputs. The case study USES these as input — it does not re-argue positioning or restate messaging. Flag the inputs so the writer doesn't drift into strategy work mid-draft.]
- **Asset placement:** [Where the case study lives: customer-stories landing page, sales handoff PDF, analyst briefing kit, launch landing page sidebar. Placement shapes the headline and the CTA.]

---

## Hero card

[Top of the published asset. Three elements, locked.]

**Headline:** [Formula: [Customer type] + [Specific outcome] + [Time or scale context]. Example: "How a 200-person fintech cut month-end close from 12 days to 4 without adding headcount." Avoid: "[Customer] Achieves Operational Excellence with [Product]" — that headline could apply to any vendor on G2.]

**One-line metric proof:** [The hero metric in a single sentence the skim reader can grab in three seconds. "Reporting time dropped from 8 hours weekly to 45 minutes." This is the same number from pre-work, surfaced again so the reader doesn't have to dig.]

**Customer logo placement:** [Logo file pointer + alt text. The hero card carries the logo at the top right or beneath the headline, not buried in the footer.]

---

## About the customer

[80-120 words. Who they are, what they do, what scale they operate at, what stakeholder is telling this story. Specific details — industry, employee count, geography, year founded — that ground the reader in a real company. The B2B reader is checking "is this company like mine?" — give them the signals to answer yes (or honestly, no, in which case they self-select out, which is also fine).

Failure mode to avoid: writing this as a marketing blurb of the customer ("[Customer] is a leading provider of next-generation solutions…"). Concrete and specific, not promotional.]

---

## Act 1 — The situation (before)

[200-350 words. The vivid before-state. What was the team doing? What was the pain? What was the status quo costing them — in time, money, missed opportunity, risk?

Specifics, not generalities. "Reconciling 14 spreadsheets every close cycle and still missing errors" not "they needed better visibility." The more specific the pain, the more the right reader leans in and thinks *that's us.*

This is also where Hall's "identifiable character" and "specific details" do their work — a named protagonist (the champion, named earlier) wrestling with a concrete situation, not an abstract problem. Use one of the customer's own phrases here if you have it.

End with the trigger: what made them start looking? A new compliance requirement, a missed deadline, an executive mandate, a growth phase the old approach couldn't handle. The trigger is the moment the customer left the status quo.]

---

## Why they chose us

[120-200 words. Framed as the *customer's decision*, not as our pitch. What did they evaluate? What were the alternatives — internal build, incumbent, doing nothing, an adjacent tool? What were the 2-3 decision factors that mattered most for *this customer's specific situation* (not generic feature parity)?

The corpus failure mode here: turning this section into a feature list dressed up as a decision narrative. Avoid. Stick to what the customer actually weighed and what tipped it.

If a customer quote on the decision exists, this is a strong place for it — short, decision-oriented, attributed.

> *"[Customer quote on the decision — what made them pick us, in their voice, grounded in a specific factor that mattered to their situation. NOT 'easy to use' or 'great support'.]"*
> — [Name], [Title], [Company]]

---

## Act 2 — The solution (with us)

[150-250 words. SHORT. This is the bridge act, not the destination. What did the customer do, what did we do, who else was involved? Keep it tactical and concrete.

Three sub-beats:
- **What the customer did:** [The team that owned the rollout, the change they led inside their org, what they had to commit.]
- **What we did:** [Implementation, support, configuration — named briefly. This is where the product appears, but it is not the protagonist.]
- **Who else was involved:** [Other stakeholders, partner / SI involvement if relevant, internal champions.]

Resist the urge to pad this section. The reader is here for the outcome, not the implementation play-by-play. If Act 2 runs longer than Act 1 or Act 3, you've lost the spine.]

---

## Act 3 — The outcome (after)

[250-450 words. The longest act in the case study. What does the customer's life look like now? What can they do that they couldn't before?

Open with the hero metric proof — restate the headline number with one or two sentences of context that earn it. Then layer in 2-4 secondary outcomes that show the change cascaded across the org (multi-stakeholder reading: the front desk *and* the CFO *and* patient satisfaction).

Specifics, again. "Cut month-end close from 12 days to 4" — not "improved efficiency." Numbers, time spans, headcount comparisons, before/after framings the reader can picture and translate to their own situation.

Embed the primary customer quote here — the strongest one, on business impact, attributed:

> *"[Primary customer quote on the outcome — speaks to what changed for the business, not to product UX. Names a number or a decision or a capability they didn't have before. One or two sentences max. Should sound like something this person would actually say in a board meeting, not in a marketing brochure.]"*
> — [Name], [Title], [Company]

If a second stakeholder quote exists (different seat, different angle), it can land here too — short, specific, attributed. Two quotes max in this section; three in the whole case study.]

---

## The lesson

[60-100 words. What should other readers take from this story? This section doubles as the takeaway for the skim reader who only reads the hero card and the lesson.

Frame it as a generalizable insight, not a product pitch. "Teams running monthly close on legacy stacks plus N spreadsheets typically discover the bottleneck isn't the tool — it's the reconciliation step the tool can't see." The lesson connects this customer's specific story to the broader pattern your prospect is in the middle of.]

---

## CTA

[ONE specific, named action. Not "learn more" — that is a shrug. Examples that work: "Book a 20-minute demo to see how [Product] handles month-end close." "Read the [Other Customer] case study on the same problem in healthcare." "Talk to the team that worked with [This Customer]."

The CTA matches the asset placement decided in pre-work. A landing-page case study earns a demo CTA. A sales-handoff PDF earns a "talk to your AE" pointer. An analyst-kit version earns a contact-the-analyst-relations-team line.]

---

## Validation checklist

[Run before publishing:
- Does the headline use the formula and name a specific outcome with time/scale context?
- Does the hero card commit to a single quantified metric?
- Is the first sentence about the customer or the problem — NOT about us?
- Does the product first appear in Act 2, not Act 1?
- Are Acts 1 and 3 longer than Act 2?
- Are all customer quotes about business impact, NOT product UX?
- Are quotes attributed by name + title + company?
- Is every "improved" / "enhanced" / "significant" claim backed by a number?
- Does the case study stay between 800 and 1500 words?
- Is there exactly one CTA, named and specific?
- Has the customer signed off on the final draft for publication?

If any answer is no, the case study isn't ready to ship.]
`,
}

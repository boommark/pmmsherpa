/**
 * Internal Launch FAQ template for the generate_artifact MCP tool.
 *
 * Canonical source (read first per .planning/mcp-phase-2/methodology.md):
 *   VandeHei / Allen / Schwartz — Smart Brevity (TEASE → LEDE → optional
 *   GO DEEPER as the per-Q+A craft discipline; Audience First; Short, Not
 *   Shallow). Corpus amplification: PMA practitioner
 *   blogs (sales-asset and battlecard guides; Matt Heng on sales
 *   collaboration); Dunford — Sales Pitch p.127 + p.129 (objection
 *   language).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/12-internal-launch-faq.md
 *
 * Why this template structures every Q+A as TEASE/LEDE rather than a free-
 * form Q+A list: the dominant failure mode for internal launch FAQs is
 * marketing prose pasted in place of operational rep answers. Forcing each
 * answer to lead with one decision-grade sentence (LEDE) — and only then
 * allowing optional GO DEEPER bullets — produces FAQ-shaped reference
 * material a rep can actually use at 2pm Thursday on a Slack call. The
 * "awkward questions" the corpus surfaced ("what does it NOT do", "who is
 * NOT a good fit", "where do competitors have a legitimate advantage",
 * "what's the do-nothing case") are required H3s, not optional, because
 * the corpus's strongest critique is that typical launch FAQs skip exactly
 * these and reps invent answers in the field.
 *
 * This is the INTERNAL FAQ — for AEs, SEs, CSMs, support, exec stakeholders.
 * It can name competitors, name pricing exceptions, name known issues, and
 * cite roadmap candidly. The partner-facing FAQ (artifact 30) is a separate
 * template with different sensitivity defaults.
 */

import type { ArtifactTemplate } from './types'

const INTERNAL_LAUNCH_FAQ_SYSTEM_PROMPT = `You are drafting an internal launch \
FAQ — the operational reference doc that AEs, SEs, CSMs, support reps, and \
exec stakeholders consult between meetings during a launch. This is NOT \
marketing copy, NOT a customer-facing FAQ, and NOT a partner-facing FAQ. The \
reader is an employee who needs a usable answer in the next sixty seconds.

Avoid these failure modes:
- Marketing copy as answers — press-release prose, hero-headline lines, \
value-proposition paragraphs in place of operational rep answers. Reps need \
plain language they can repeat verbatim, not language to translate
- Missing the awkward questions — skipping "what does it NOT do yet?", "who \
is NOT a good fit?", "where do competitors have a legitimate advantage?", \
"what's the do-nothing case?" These are required, not optional. Reps will \
invent answers in the field if you don't supply them
- Principles instead of scripts in objection sections — "explain your value" \
is not an answer; quoted language a rep could repeat is. Every objection \
response must be the actual words, not the strategy
- Roadmap-as-shipped — forward-looking statements written as if features are \
live. Creates legal exposure and rep mistrust when prospects ask follow-ups. \
Mark roadmap explicitly as roadmap, with safe-to-share framing
- Vague SE handoff ("when it gets technical") — give a specific trigger \
("when the prospect asks about [X], or when the deal includes [Y]")
- Vague discount authority — "talk to your manager" is not an answer. Name \
the approver, the threshold, and the exception path
- No known issues section, or a sanitized one — list the two or three things \
that aren't perfect yet. Reps who get blindsided in the field become \
internal critics. Reps who were warned become allies
- Long answers — each LEDE caps at 2-4 sentences; GO DEEPER caps at 3-5 \
bullets. Anything longer is a different artifact (one-pager, deck, \
battlecard) and should be linked, not duplicated

Required behaviors:
- Render every Q+A as TEASE (the question a real rep would ask) plus LEDE \
(one decision-grade sentence answer), with optional GO DEEPER bullets only \
when the question genuinely has nuance. No WHY IT MATTERS preambles — every \
question is by definition rep-relevant
- Write in plain language. If a CSM has to translate the FAQ for a \
customer, the FAQ is failing
- Where the skeleton requires a script (pricing-objection responses, \
competitor-objection responses, objection-handling section), produce the \
actual quoted language a rep would say, not guidance about what to say
- If a positioning statement, battlecard, or pricing page exists for this \
launch, inherit them: positioning drives the "what is it" + "how it \
competes" answers; battlecard drives competitor-specific responses; pricing \
page is the customer-facing source of truth that the internal pricing \
section operationalises
- Include a "known issues" closer with the two or three real limitations \
shipping with this launch. This is the block most PMMs avoid — that's why \
it's the most valuable to reps

Reference frameworks implicitly. Do not name-drop authors in the output. \
Reps don't care which book the methodology came from.`

export const internalLaunchFaqTemplate: ArtifactTemplate = {
  artifactType: 'internal_launch_faq',
  title: 'Internal Launch FAQ',
  systemPromptFragment: INTERNAL_LAUNCH_FAQ_SYSTEM_PROMPT,
  // Skeleton order = corpus-derived category architecture (what is it →
  // who's it for → why now → pricing → how it competes → sales process →
  // support → talking points/what to avoid → objection handling → known
  // issues). Each Q+A renders as TEASE (H3 question) + LEDE (one-line
  // answer) + optional GO DEEPER (bullets). The "awkward questions"
  // surfaced by the corpus are required H3s, not optional.
  skeleton: `# Internal Launch FAQ: [Product / Feature Name]

> **Audience:** AEs, SEs, CSMs, support, exec stakeholders. Internal only — \
do not share externally. For partner-facing or customer-facing FAQs, use the \
separate artifacts.

## Pre-work (input check)

- **Positioning statement:** [Does one exist for this launch? If yes, the "what is it" and "how it competes" answers inherit from it. If no, flag this FAQ as loose pending the positioning artifact.]
- **Battlecard:** [Does one exist? If yes, the "how it competes" section summarizes and links. If no, the competitor-specific scripts will be best-effort.]
- **Pricing page / pricing decision:** [Tiers, SKU treatment, and discount authority locked? If no, the pricing section will be loose.]
- **Launch tier:** [Tier 1 / 2 / 3 — drives how much enablement weight this FAQ carries. Tier 1 launches need every section filled; Tier 3 may collapse some.]
- **Launch date + freeze date:** [When does this become real? When does the FAQ stop changing? Reps need a stable doc the day-of.]

---

## 1. What is it

*Plain-language operational definition. No press-release prose. A rep should be able to read the LEDE and repeat it verbatim.*

### What does it actually do?
[One sentence, plain English. No product names in the definition. The kind of sentence a rep could say to a friend who doesn't work in tech.]

### What's the fastest way to show it working?
[The 60-second demo path SEs use. Bullet the steps if needed.]

### What does it NOT do yet?
[Required answer. The boundaries of the launch. If this is missing, reps will guess in front of prospects. Be specific: list the 2-3 things the product visibly does not do that a buyer might assume it does.]

### How is this different from [adjacent feature / product] we already have?
[The disambiguation question. Required when the launch overlaps with an existing surface area in the product. If there's no overlap, mark N/A.]

---

## 2. Who's it for

*Operational ICP for reps in the field. Names and filters, not philosophy.*

### Who's the primary buyer?
[Title, company size, and the specific trigger that makes them care this quarter — not next quarter, not in general.]

### Who's the primary user? (Often different from the buyer)
[Name both if they differ. CSMs especially need this — adoption depends on the user, not the buyer.]

### Who is NOT a good fit?
[Required answer. The negative ICP. The most-skipped question and the most valuable for CSMs handling expansion calls and AEs qualifying out. Be concrete: which company sizes / industries / use cases will this disappoint?]

### Which existing accounts should we call first?
[A filter, not a philosophy. "Accounts on the [tier] plan with more than [N] [users/seats/usage signal] who logged a ticket about [X] in the last 90 days" — that's a filter. "Strategic accounts" is not.]

---

## 3. Why now

*Defuses the unspoken sales objection: "why this quarter instead of next?"*

### What changed in the market or buyer's world that makes this timely?
[The external trigger. Specific market shift, regulatory change, competitive move, or buyer-behavior change. Not "AI is hot."]

### What's the cost of waiting for the customer?
[A number, a risk, or a competitive dynamic. Specific. "They keep losing [X] per month" is specific; "they're falling behind" is not.]

### Why did we build this now?
[Reps get asked this. Have an honest answer. The product story behind the launch — what we learned, what tipped us over.]

---

## 4. Pricing

*Vague pricing answers destroy AE credibility faster than anything else. Scripts required for the awkward questions.*

### What does it cost?
[Exact tiers or ranges. "Contact us" is not an answer for an internal audience. Include the SKU name, the unit, and the standard list price.]

### How does it fit into existing contracts?
[Expansion motion / new SKU / included in current tier? Spell out the renewal mechanic too — does this show up at next renewal automatically, or is it a separate co-term?]

### What's the discount authority?
[Name the approver and the threshold. "Up to X% — AE. X-Y% — manager. Over Y% — VP Sales + finance."]

### Script: what do we say when a prospect says it's too expensive?
[Required script. Quoted language, not a strategy. The actual words an AE could repeat. Anchor in value reframe + qualifying question, but produce the *sentences*, not the principle.]

---

## 5. How it competes

*Inherits from battlecard if one exists. Honest answers — reps will find out the truth in the field anyway.*

### Who are we most likely to see in competitive deals?
[Name them. Two or three, max. Resist the urge to list every competitor — reps need the realistic shortlist.]

### What's our honest one-line differentiation against each?
[For each named competitor, one line. The differentiation that holds up under scrutiny, not the marketing line.]

### Where do competitors have a legitimate advantage?
[Required answer. Reps will find out in the field. Better they hear it from PMM. Name 1-2 places competitors are genuinely stronger and how to navigate them in deals.]

### Script: what do we say when a prospect says "Competitor X already does this"?
[Required script. Quoted language. The reframe + the proof point + the trap question that surfaces a real differentiator.]

### What's the "do nothing" case?
[Required answer. The most common competitor in B2B SaaS is the status quo. How do we frame the cost of inaction? What's the urgency story when there's no named competitor in the deal?]

---

## 6. Sales process

*How this launch shows up in the deal cycle.*

### What stage does this typically enter a conversation?
[New logo / expansion / renewal — and *when* in that motion. Discovery? After demo? Pricing call?]

### Who needs to be in the room?
[Economic buyer / champion / technical approver — for this specific launch, not for deals in general.]

### What's the typical deal-cycle change, if any?
[Does this lengthen the cycle (security review, procurement re-engagement)? Shorten it (faster time-to-value)? Be specific.]

### What does a good discovery question look like for surfacing this need?
[1-2 actual discovery questions reps can ask verbatim. Pain-surfacing, not feature-leading.]

### What's the SE handoff trigger?
[Specific trigger. "When the prospect asks about [X], or when the deal includes [Y]" — not "when it gets technical."]

### What proof points exist right now?
[Beta customers, design partners, case studies, reference-able names. If proof is thin, say so honestly here.]

---

## 7. Support model

*CSMs and support reps inherit the field consequences. They need explicit scope.*

### What's in scope for standard support vs. professional services?
[Where's the line? Implementation help, configuration, integrations — what's billable vs. included?]

### What's the known limitation or edge case most likely to generate a ticket?
[The honest answer. The 1-2 things support will see most often in the first 30-60 days post-launch.]

### Where does the escalation path go when something breaks?
[Specific. Owner name(s), Slack channel, on-call rotation, escalation SLA.]

### What should a CSM say if a customer asks for a feature that's on the roadmap but not committed?
[Script. The safe forward-looking language — "we're exploring X, no committed timeline" — not roadmap dates that aren't committed.]

---

## 8. Talking points + what to avoid

*Put them together. The contrast is what makes both useful.*

### Say this
[3-5 short, scannable talking points. The one-sentence value statement that's been tested with customers; the proof point that's most credible right now (specific customer, specific outcome); the forward-looking statement that's safe to share (roadmap direction without commitments).]

### Don't say this
[3-5 short, blunt items. Specific phrases that overclaim, confuse with competitors, or create legal exposure. "It's AI-powered" without explanation. Roadmap features as if shipped. Specific competitor names in writing to prospects (flag for legal). Pricing exceptions outside discount authority.]

---

## 9. Objection handling

*Standalone section. Scripted responses, not principles. If your team can read these and use them in a deal tomorrow, the FAQ is doing its job.*

For each objection, render this 4-line block:

### Objection: "[The actual words a prospect would say]"
- **What they're really saying:** [The underlying concern — risk aversion, budget timing, competitor incumbency, etc.]
- **Response:** [Specific quoted language a rep can repeat. Not "explain your value." Actual sentences.]
- **If they push back again:** [The follow-up move. Often a calibrated question or a different proof point.]

[Render this block for each of the 3-4 objections most likely to come up for this specific launch. Not generic objections. The *specific* ones — pulled from beta-customer feedback, lost-deal notes, and PMM's hypothesis about how the market will react.]

---

## 10. Known issues (the section most PMMs skip)

*The two or three things that aren't perfect yet. Withholding these turns reps who get blindsided into the loudest internal critics. Sharing them turns reps into allies.*

### Known issue 1: [Short label]
[What's the limitation, who is it most likely to affect, and what's the workaround or framing? When is it expected to be resolved (or marked "no current ETA" if unknown)?]

### Known issue 2: [Short label]
[Same structure.]

### Known issue 3 (if applicable): [Short label]
[Same structure.]

---

## Maintenance

- **Owner:** [Single PMM owner for this FAQ, by name.]
- **Last updated:** [Date.]
- **Next review:** [Date — typically 2 weeks post-launch, then monthly until stable.]
- **Linked artifacts:** [Battlecard, launch deck, one-pager, pricing page — link don't duplicate.]
`,
}

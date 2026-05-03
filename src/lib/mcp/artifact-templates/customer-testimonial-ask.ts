/**
 * Customer Testimonial / Quote Ask template for the generate_artifact MCP tool.
 *
 * Canonical source (read first per .planning/mcp-phase-2/methodology.md):
 *   None — corpus-only artifact (Sharebird customer-marketing AMAs, PMA blogs
 *   on case studies and storytelling, customer-marketing playbooks). Book-
 *   cards-first rule honored: no book chunks surfaced strongly enough to
 *   override the practitioner spine.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/15-customer-testimonial-ask.md
 *
 * Why two variants: practitioner sources are unanimous that warm asks (cite a
 * specific recent moment) outperform colder asks (no acute signal, brokered
 * intro, or different-title ask), but PMMs need help drafting both because
 * the cold variant is harder craft and easier to get wrong. Folding them into
 * one variant produces a mushy template that fits neither situation. The
 * template renders both with shared anatomy and three channel sub-formats
 * each (email, Slack/DM, in-person/Zoom).
 */

import type { ArtifactTemplate } from './types'

const TESTIMONIAL_ASK_SYSTEM_PROMPT = `You are drafting a customer testimonial / \
quote ASK — the message you send to request a short quote or testimonial. This \
is NOT the published quote, and it is NOT a case study (which is long-form, \
artifact 37). It is the email / Slack DM / spoken script that asks for the quote.

Avoid these failure modes:
- Generic opening — "Hope you're well!" / "We're building out our customer story \
library." The opening is about THEM and a specific moment or outcome, not about \
you and your roadmap
- No pre-drafted quote — asking the customer to write from scratch is asking for \
unpaid work. Always include a draft they can react to and edit. The draft is the \
single highest-leverage move in the ask
- Vague usage — "for some marketing materials" reads as legal risk. Name the \
channel and the asset specifically (sales deck, homepage, launch page, battlecard)
- Vague time commitment — "a few minutes of your time" feels like a trap. Name \
the minutes (five, ten, fifteen)
- Multi-question close — stacking asks (quote + video + case study + webinar) \
collapses response rate. One ask per message
- Wrong-persona ask — asking the most enthusiastic customer when the buyer needs \
to hear from a higher title. Persona credibility outranks champion loyalty
- Wrong-moment ask — quarterly check-ins, renewal calls, and EBRs are scrutiny \
moments, not gratitude moments. The window is right after a specific win, ideally \
within 24 hours
- Too long — if the email reads in more than 45 seconds, you've lost them. Cut \
everything that doesn't serve the ask

Render BOTH variants the user requests. Default to warm-ask first; mark cold-ask \
as the harder craft for cases where no recent acute signal exists, the ask runs \
through a CSM/AE intermediary, or the quote needs to come from a different (often \
higher-title) persona than the direct champion.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const customerTestimonialAskTemplate: ArtifactTemplate = {
  artifactType: 'customer_testimonial_ask',
  title: 'Customer Testimonial / Quote Ask',
  systemPromptFragment: TESTIMONIAL_ASK_SYSTEM_PROMPT,
  // Skeleton: pre-work → warm-ask variant (3 channels) → cold-ask variant
  // (3 channels) → composition pointers. Two variants, locked anatomy of six
  // elements per ask, pre-drafted quote enforced as a required field.
  skeleton: `# Customer Testimonial / Quote Ask: [Customer Name]

## Pre-work (decisions made before drafting)

- **Specific win:** [The exact moment, metric, or outcome you're asking against — "reporting time dropped 40% in Q3", "shipped on the deadline because of us", "renewed and expanded by 60%". If you can't name a specific win, the ask isn't ready — generate a moment first.]
- **Recency:** [How recent is the win? The ideal window is the same conversation or within 24 hours. If it's been weeks, warm the relationship before asking.]
- **Whose voice does the prospect need to hear?** [The title that resonates with your buyer, not just whoever loves you most. If your prospects are VPs of Finance, a quote from a Senior Analyst — even a delighted one — does less work than a tepid quote from a Director of Finance.]
- **Where will it be used?** [Specific channel + asset: sales deck slide 12, homepage hero, launch landing page, battlecard, case study sidebar. Vague usage reads as legal risk.]
- **Variant choice:** [Warm-ask if you have a recent specific moment with this person. Cold-ask if you're asking through an intermediary, or asking the champion to broker an intro to their boss, or no recent acute signal exists.]

---

## Variant A — Warm ask (default)

For: a customer with whom you (or a teammate) have a direct, recent relationship signal — a glowing call, a Slack thank-you, a renewal conversation, a review they left elsewhere.

### A1. Email

**Subject line:** [7-9 words, references the specific win, not "quick favor". Example: "That 40% reporting-time number — quick ask"]

**Body:**

[Paragraph 1 — relationship-grounded opening. Cite the specific moment in their words. "You mentioned on our call last Tuesday that your team cut reporting time by 40% — that landed on me all week."]

[Paragraph 2 — the ask, one sentence. Name what you're asking for, where you'll use it, and the time commitment in minutes. "Would you be open to a short quote we could use on our [specific asset]? Five minutes — I've put a draft together for you to react to."]

[Paragraph 3 — the pre-drafted quote, indented or block-quoted. Written in their voice, grounded in the specific outcome. "Here's a starting point — please edit however you'd like:

> *'[Customer's draft quote — first-person, names the specific outcome, one sentence, sounds like something this person would actually say.]'*

— [Their name], [Their title], [Their company]"]

[Paragraph 4 — single-question close + specific gratitude. "Does that work? Happy to adjust if it doesn't quite fit. Thanks for letting me put words in your mouth — I know it's a slightly weird ask."]

### A2. Slack / DM

[2-3 sentences max. Same six elements, compressed. Example shape:

"Hey [Name] — that 40% reporting-time stat from last week's call has been living rent-free in my head. Any chance I could use a short quote from you on our launch page next month? I drafted something below — just react if it works or edit it however you'd like:

> *'[Pre-drafted quote.]'*

Five minutes, easy yes-or-no — does that land?"]

### A3. In-person / Zoom (spoken script, 30 seconds)

[Spoken outline — five beats, conversational not corporate:
1. Reference the specific moment in one sentence
2. Name the ask: "I'd love to use that as a short quote on [asset]"
3. Name what you'll do for them: "I'll send you a draft so you can just react to it — five minutes max"
4. Name the title-resonance reasoning briefly: "It'd land hard with [prospect persona]"
5. Single-question close: "Would that be alright?"]

---

## Variant B — Cold(er) ask

For: a customer where the relationship is real but no recent acute signal exists; you're asking through CSM/AE intermediary; or the quote needs to come from a higher-title persona than your direct champion (e.g., champion brokers intro to their boss).

The pre-drafted quote does even more work in the cold variant. A bad draft kills the cold ask. A good draft *is* the ask — it proves you understand their outcome and can speak in their register.

### B1. Email

**Subject line:** [9-12 words, leads with the outcome data + the broker context if any. Example: "Q3 reporting-time win — Sarah suggested I reach out"]

**Body:**

[Paragraph 1 — outcome-grounded opening + brokered context. "Your team's reporting time dropped 40% in Q3 according to the data we pulled together with Sarah on our CS team — she suggested you'd be the right person to speak to that result."]

[Paragraph 2 — slightly more business framing. Why the quote matters and which use case / prospect / deal it'll unlock. "We're putting together [specific asset] for [specific buyer segment / use case], and a quote from someone in your seat would do real work for prospects evaluating against [alternative]."]

[Paragraph 3 — the ask, time commitment, and the pre-drafted quote. Same anatomy as warm ask but with extra context grounding. "Would you be open to a short quote? I've drafted something below grounded in the Q3 numbers — you'd just edit it to match your voice. Ten minutes, max:

> *'[Pre-drafted quote — outcome-specific, in their register, one sentence that earns its place.]'*

— [Their name], [Their title], [Their company]"]

[Paragraph 4 — single-question close + low-pressure exit. "Does that work, or would a different framing land better? Totally fine to pass — and either way, thanks for the work your team's been doing."]

### B2. Slack / DM (via broker)

[For when the broker is forwarding to the higher-title contact, or you have a Slack Connect channel. 3-4 sentences. Example shape:

"Hey [Higher-Title Name] — [Broker Name] suggested I reach out. Your team's Q3 reporting time dropped 40%, and we'd love to use that as a quote on our [specific asset]. I've drafted something you can edit — ten minutes:

> *'[Pre-drafted quote.]'*

Does that land, or want me to adjust the framing?"]

### B3. In-person / Zoom (spoken script via broker, 45 seconds)

[Spoken outline — six beats:
1. Acknowledge the broker context: "[Broker] mentioned you'd be the right person to ask"
2. Name the specific outcome data: "the Q3 reporting-time numbers your team hit"
3. Name the ask + asset: "we'd love to feature that as a quote on [asset]"
4. Name what you'll do for them: "I'd draft it for you, you'd just react and edit"
5. Name the time commitment: "ten minutes, no more"
6. Single-question close + easy exit: "Would that be alright? Totally fine to pass."]

---

## Composition pointers

- The resulting quote feeds: \`landing_page_copy\`, \`sales_pitch_deck\`, \`battlecard\`, \`one_pager_solution_brief\`
- Long-form sibling: \`case_study\` (artifact 37) — different commitment, different ask, different template
- You'll likely need a release form or comms approval — flag this in your follow-up, don't bury it in the ask itself

---

## Validation checklist

[Run before sending:
- Does the opening cite a specific moment or specific outcome data — not "hope you're well"?
- Is there a pre-drafted quote in their voice, grounded in a specific outcome?
- Is the channel + asset named explicitly?
- Is the time commitment named in minutes?
- Is there exactly ONE question in the close?
- Does the ask read in under 45 seconds?
- Is the persona's title one your buyer will recognize and respect?
- Is the moment recent — same conversation, same week, not "we should ask sometime"?

If any answer is no, the ask isn't ready.]
`,
}

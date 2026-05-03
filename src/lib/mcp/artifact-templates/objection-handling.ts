/**
 * Objection Handling template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Voss — Never Split the Difference (primary: response sequence — labeling,
 *   calibrated questions, mirroring, getting to "no", Black Swan / unknown
 *   unknowns). Cialdini — Influence (proof toolkit: social proof, authority,
 *   scarcity, reciprocity, commitment/consistency, liking, unity). Weinberg —
 *   New Sales Simplified (sales-cycle discipline: don't reflexively concede,
 *   the objection is usually a proxy, Power Statement close).
 *   Corpus amplification: PMA practitioner pattern — stage-based primary axis
 *   (early/mid/late), 4-element-per-objection block (stated → real concern →
 *   response sequence → escalation), security/integration carve-out, living
 *   document discipline, "objections as positioning failures in disguise".
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/22-objection-handling.md
 *
 * Why this template is organized by deal stage rather than by objection
 * category: the same objection means different things at different stages.
 * "We already have X" in discovery is a positioning challenge; in negotiation
 * it's a stall. Stage-based grouping forces stage-appropriate intervention
 * and prevents one-size-fits-all rebuttals. Within each stage, every objection
 * renders the same 4-element block — stated, real concern, response sequence
 * (label → calibrated question → proof), escalation path — so the rep reaches
 * for the same move-set every time. Cialdini's principles are toolkit, not
 * skeleton: they live inside the proof slot of the response sequence, never
 * as the opening. INTERNAL-ONLY and leak-tolerant: no mockery of buyers, no
 * internal slang.
 */

import type { ArtifactTemplate } from './types'

const OBJECTION_HANDLING_SYSTEM_PROMPT = `You are drafting an objection handling \
doc — an INTERNAL-ONLY, sales-only, evergreen document. Reps read it before \
calls, in deal review, and in the moment when an objection lands. It is NOT a \
launch FAQ (that is broader, cross-functional, time-bounded). It is NOT a \
battlecard (that is per-competitor; this is per-objection across competitors). \
It is NOT a talk track (that is the proactive default story; this is the \
reactive response when the buyer interrupts that story).

CRITICAL — assume this document will leak. Reps share files, prospects forward \
decks, people change jobs. Do not write any line you would be embarrassed to \
see quoted back. No mockery of buyer concerns, no internal slang for objection \
types, no language a competitor or reporter could weaponize.

Avoid these failure modes:
- Answering the stated objection instead of the real one — "your price is too \
high" almost never means the money doesn't exist. It usually means unclear \
value, missing internal champion ammunition, or a competing priority. Every \
objection block must explicitly name the real concern underneath, not just the \
rebuttal
- Splitting the difference / agreeing too quickly — "totally understand, let me \
see what I can do on price" teaches buyers that objections are a negotiating \
lever. Mark which objections must NEVER be reflexively accommodated. Concession \
is a deliberate move, not a discomfort response
- Defensive responses — "we totally understand, let me explain why we're \
actually great at that". Acknowledges then immediately defends, which signals \
the rep is not listening. Use tactical-empathy register: name the constraint, \
ask a calibrated question, let the buyer co-solve
- Leading with social proof or feature defense — "lots of customers have this \
concern" or "actually our platform handles that with X" as the opening move. \
Social proof and proof points belong at the proof layer (slot 3 of the response \
sequence), AFTER the acknowledgment. Leading with proof reads defensive
- Marketing-register response language — rebuttals must read as something a rep \
would actually say on a Zoom call. If a line sounds like a press release or a \
homepage hero, it is unusable live. Read each rebuttal aloud
- Generic objections without verbatim buyer phrasing — "they may be concerned \
about cost" is useless. The stated-objection slot must capture how buyers \
actually phrase it ("this is going to be a hard sell to my CFO right now", \
"we tried something like this before and it stalled in IT")
- Same response across deal stages — if the rebuttal for "we already have X" in \
discovery is identical to the rebuttal in late-stage negotiation, the stage \
axis has been ignored. Discovery-stage version is positioning work; \
late-stage version is stall management. Different intervention
- Treating security/integration objections as stalls — these are usually real \
blockers, not soft objections. Response framework shifts from reframe-and-advance \
to diagnose-and-route. Specificity on review timeline, named certifications, \
named integrations defuses anxiety better than reassurance
- Mockery of buyer pushback or competitor mention — leak tolerance applies. \
Never write a line that belittles the buyer's concern or the competitor's offering

Required behaviors:
- Organize by deal stage as the primary axis (Early pipeline / Mid-funnel / \
Late-stage). Nest objection categories under each stage, not the inverse
- For every objection, render exactly four slots in this order: (1) stated \
objection in verbatim buyer phrasing, (2) real concern underneath / Black Swan, \
(3) response sequence — Label → Calibrated question → Proof point, in that \
order, (4) escalation path if the rebuttal does not land
- Inside slot 3's proof step, name the influence principle being used (social \
proof, authority, scarcity, reciprocity, commitment/consistency, liking, \
unity). The metacognitive label helps reps reach for the right tool
- Use the calibrated-question pattern from the response-sequence canon: \
open-ended "how" / "what", inviting the buyer to co-solve. Avoid "why" — it \
puts buyers on the defensive
- Use labeling phrasing for slot 3 step 1: "It sounds like…", "It seems like…", \
"It looks like…". Acknowledge without agreeing
- Mark objections that must NEVER be reflexively accommodated with an explicit \
do-not-concede flag (typically: price discount in early pipeline, scope cut to \
fit timeline, opening up the contract for procurement-introduced changes)
- If win/loss insights, positioning_statement, or messaging_framework artifacts \
exist, inherit their patterns. The objection-handling doc is downstream of all \
three. Do not duplicate their content; reference them
- Treat the doc as a living document. Include refresh cadence and refresh \
triggers (loss-reason shifts, new competitor in market, pricing change, \
security framework change)

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const objectionHandlingTemplate: ArtifactTemplate = {
  artifactType: 'objection_handling',
  title: 'Objection Handling',
  systemPromptFragment: OBJECTION_HANDLING_SYSTEM_PROMPT,
  // Skeleton organized by deal stage as the primary axis (corpus's clear net-new
  // contribution over the books). Each objection inside a stage renders the same
  // 4-element block: stated → real concern → response sequence (label →
  // calibrated question → proof) → escalation path. Security and integration
  // are carved out into a separate section because they are legit blockers, not
  // stalls. Living-doc metadata at top; reflection prompt at bottom.
  skeleton: `# Objection Handling: [Product Name]

> **INTERNAL ONLY.** Sales-arming document. Do not share with prospects, partners, or external audiences. Calibrate every line as if it will leak.

**Owner:** [PMM owner name + email]
**Last reviewed:** [YYYY-MM-DD]
**Next review:** [YYYY-MM-DD — quarterly minimum, sooner on trigger events listed at bottom]
**Inherited inputs:**
- Positioning statement: [link to artifact / "not yet drafted"]
- Messaging framework: [link / "not yet drafted"]
- Win/loss insights: [link / "not yet drafted"]
- Battlecards: [list of competitor battlecards in scope]

---

## Pre-work (decisions before drafting)

- **Champion buyer profile:** [The ONE buyer this doc is calibrated for — title, seniority, what they own, what gets them fired, the language they use when frustrated. Tactical empathy requires knowing whose emotion you are labeling. If multiple personas need coverage, draft a separate stage grid for each.]
- **Do-not-immediately-concede list:** [The 3-5 objections where reflexive accommodation does long-term damage. Typically: price discount before value is established, scope cut to fit a timeline, opening the contract for procurement-introduced clauses, agreeing to roadmap commitments to close. List each here, then flag inline below.]
- **Source of buyer language:** [Where verbatim objection phrasing was pulled from — call recordings, win/loss interviews, sales notes, support tickets. Generic "they may be concerned about cost" phrasings are unusable; reps need the actual words.]

---

## Stage 1 — Early pipeline (discovery, first demo)

[Stage context: at this point the buyer is positioning the product against status quo, internal builds, or category alternatives. Most objections here are positioning challenges — the value isn't landing, or the category frame is unclear. Intervention: re-frame, surface the real pain, advance to a deeper conversation. This is NOT where you negotiate.]

### Objection 1.1: "[Stated objection in verbatim buyer phrasing — e.g., 'We already do this with spreadsheets and it's working fine.']"

- **Real concern underneath:** [What the buyer is actually worried about — e.g., "Switching cost is real and they don't have evidence the upside justifies disruption. They've seen tools-of-the-month fail before."]
- **Response sequence:**
  1. *Label* — ["It sounds like / it seems like…" — name the constraint or emotion. Example: "It sounds like the spreadsheet is doing the job today and the bar for switching is high — which makes sense."]
  2. *Calibrated question* — [Open-ended "how" / "what" that invites the buyer to surface the gap. Example: "What would have to change in your process for the spreadsheet to stop being enough?"]
  3. *Proof point* — [Customer story, metric, or analyst quote — and name the influence principle being used (social proof / authority / scarcity / reciprocity / commitment / liking / unity). Example: "(social proof) — One of our customers, similar size, ran on spreadsheets for two years before they hit the ceiling at X. Here's what the next quarter looked like for them."]
- **Escalation path:** [What the rep does if the rebuttal does not land — e.g., "Offer a 30-minute working session with their analyst to model the gap on their actual data. Do not push for a follow-up demo."]
- **Do-not-concede flag:** [If applicable: "Do NOT offer a free pilot at this stage." Otherwise omit.]

### Objection 1.2: "[Stated objection in verbatim buyer phrasing]"

- **Real concern underneath:** [The Black Swan — what they are actually worried about.]
- **Response sequence:**
  1. *Label* — [Tactical-empathy phrasing.]
  2. *Calibrated question* — [Open-ended, inviting co-solve.]
  3. *Proof point* — [And the influence principle named.]
- **Escalation path:** [Next move if rebuttal stalls.]
- **Do-not-concede flag:** [If applicable.]

### Objection 1.3: "[Stated objection in verbatim buyer phrasing]"

- **Real concern underneath:** [The Black Swan.]
- **Response sequence:**
  1. *Label* — [Tactical-empathy phrasing.]
  2. *Calibrated question* — [Open-ended.]
  3. *Proof point* — [Influence principle named.]
- **Escalation path:** [Next move.]
- **Do-not-concede flag:** [If applicable.]

[Add Objection 1.4 / 1.5 only if a real fourth/fifth pattern exists. Filler objections dilute the doc.]

---

## Stage 2 — Mid-funnel (technical review, security, procurement)

[Stage context: the buyer is past the question of "is this worth solving" and into "can we actually deploy this safely". Objections here are often real blockers, not stalls — integration concerns, security/compliance, implementation risk, internal stakeholder coverage. Intervention: diagnose specifically, route to the right SE / security / CS resource, give timeline specificity. Reassurance without specificity makes things worse.]

### Objection 2.1: "[Stated objection in verbatim buyer phrasing — e.g., 'Our security team will need to review this and that usually takes months.']"

- **Real concern underneath:** [Specific fear — e.g., "They're afraid this stalls in security review and the buyer loses internal momentum / quarter slips."]
- **Response sequence:**
  1. *Label* — [E.g., "It sounds like the security review timeline is the binding constraint, not the security posture itself."]
  2. *Calibrated question* — [E.g., "What does your standard SaaS security review look like — what's the actual path and who owns it?"]
  3. *Proof point* — [Named principle. E.g., "(authority + specificity) — Our SOC 2 Type II + our security packet typically gets us through review in three weeks with one stakeholder. Here's the packet."]
- **Escalation path:** [E.g., "Offer to join the first security call directly with our CISO; offer the security packet upfront, do not wait for the formal request."]
- **Do-not-concede flag:** [If applicable.]

### Objection 2.2: "[Stated objection]"

- **Real concern underneath:** [The Black Swan.]
- **Response sequence:**
  1. *Label* — [Tactical-empathy phrasing.]
  2. *Calibrated question* — [Open-ended.]
  3. *Proof point* — [Influence principle named.]
- **Escalation path:** [Route or next move.]
- **Do-not-concede flag:** [If applicable.]

### Objection 2.3: "[Stated objection]"

- **Real concern underneath:** [The Black Swan.]
- **Response sequence:**
  1. *Label* — [Tactical-empathy phrasing.]
  2. *Calibrated question* — [Open-ended.]
  3. *Proof point* — [Influence principle named.]
- **Escalation path:** [Route or next move.]
- **Do-not-concede flag:** [If applicable.]

---

## Stage 3 — Late-stage (negotiation, legal, final approval)

[Stage context: the deal is close. Objections here are often stalls dressed as concerns — price, timing, missing decision-maker, last-minute scope. Intervention: surface the real concern (often missing internal buy-in or competing priority), do not reflexively concede on price, get to "no" on the underlying premise so the buyer states what would actually unlock the deal. This is the stage Weinberg's discipline matters most: every reflexive concession trains the buyer to push harder.]

### Objection 3.1: "[Stated objection — e.g., 'The price is going to be a problem with my CFO.']"

- **Real concern underneath:** [Almost always a proxy. E.g., "The internal champion doesn't have the ammunition to justify the spend upstairs, OR there's a competing budget priority eating the line item, OR they want a discount because they think they can get one. Different concerns require different responses."]
- **Response sequence:**
  1. *Label* — [E.g., "It sounds like the conversation with your CFO is the gating event, not the number itself."]
  2. *Calibrated question* — [E.g., "What would the business case need to look like for your CFO to say yes? What's worked when you've made spend cases like this before?"]
  3. *Proof point* — [Named principle. E.g., "(commitment/consistency + social proof) — In our discovery you mentioned reducing X was a board-level priority — here's how a peer at [similar company] framed the same case to their CFO and what the payback period looked like."]
- **Escalation path:** [E.g., "Offer to build the business case WITH them — co-author the CFO memo. Do NOT lead with discount. If discount becomes the only path, tie it to a multi-year commit or a reference commitment, never give it away unilaterally."]
- **Do-not-concede flag:** [Yes — flagged in pre-work. "Do NOT discount before the value-to-CFO case has been built. Do NOT discount as the first concession."]

### Objection 3.2: "[Stated objection — e.g., 'This isn't the right time, let's revisit next quarter.']"

- **Real concern underneath:** [The Black Swan — often "the champion has lost momentum", or "a competing priority took the slot", or "they're negotiating by stalling".]
- **Response sequence:**
  1. *Label* — [E.g., "It seems like something shifted in the priority stack — that's worth understanding before we put this on hold."]
  2. *Calibrated question* — [E.g., "What changed since we last spoke that moved this off the front burner? And what would have to come back into focus for it to move back?"]
  3. *Proof point* — [Named principle. Use scarcity sparingly here — overuse reads as manipulative. Better: commitment/consistency anchored on a prior stated priority.]
- **Escalation path:** [E.g., "Get to a real 'no' on Q this-quarter so the rep knows whether to keep the deal warm or genuinely re-engage Q next. Ask: 'Is it crazy to think this could still close this quarter?' — let them confirm or correct."]
- **Do-not-concede flag:** [If applicable: "Do NOT extend the pricing offer indefinitely without a date."]

### Objection 3.3: "[Stated objection — e.g., 'I need to bring this to my boss before we move forward.']"

- **Real concern underneath:** [Either the rep has been working with a non-decision-maker (qualification gap), OR the actual decision-maker has not been pre-sold, OR the buyer is genuinely escalating. Each requires different action.]
- **Response sequence:**
  1. *Label* — [E.g., "It sounds like the final call sits with [boss role] and they haven't been part of the conversation yet."]
  2. *Calibrated question* — [E.g., "What does [boss role] need to see for a yes — and how have they decided on tools like this in the past?"]
  3. *Proof point* — [Named principle. E.g., "(authority) — Offer to do an exec-to-exec call with our [VP/CEO]. Frame as peer alignment, not sales push."]
- **Escalation path:** [E.g., "Get a meeting on the calendar with the actual decision-maker before the next deal step. Do not let the champion become the relay — relayed pitches lose 60%+ of their force."]
- **Do-not-concede flag:** [If applicable.]

[Add Objections 3.4 / 3.5 only if recurring patterns justify them.]

---

## Security and integration objections (legitimate blockers — diagnose and route, don't reframe)

[These are different from the objections above. They are usually real blockers, not stalls. The response framework shifts: specificity defuses anxiety better than reassurance. Buyers consistently overestimate timelines and underestimate the vendor's preparation. Naming exact paths, exact certifications, exact integration coverage is the move.]

### Security review

- **Our certifications:** [SOC 2 Type II / ISO 27001 / HIPAA / GDPR / FedRAMP / etc. — list with date of last audit.]
- **Our standard security review process:** [The actual path. E.g., "Buyer's security team requests our packet → we deliver in 24 hours → typical review is 2-3 weeks with one stakeholder. We can join the kickoff call directly."]
- **Security packet contents:** [Pen test summary, SOC report, data flow diagram, sub-processor list, DPA template — what's in the packet they get.]
- **Common security objection patterns + responses:** [3-5 specific concerns we hear (data residency, encryption-at-rest, key management, access controls, AI/ML data usage) with the specific factual answer. No marketing language; engineering specificity.]

### Integration review

- **Native integrations:** [List of our productized integrations — names + the depth of each (sync, bidirectional, event-stream, etc.) + average implementation time per integration.]
- **API surface:** [REST / GraphQL / webhooks coverage; rate limits; auth mechanism.]
- **Implementation timeline (typical):** [E.g., "First-value in 2 weeks; full rollout in 6-8 weeks for org of [size range]."]
- **Common integration objection patterns + responses:** [3-5 specific concerns we hear (legacy system X, custom data model, residency boundaries, identity provider, SSO/SCIM) with specific factual answers.]

---

## Reflection — what these objections tell us upstream

[This block runs quarterly when the doc is refreshed. The discipline: **which objections in this doc are positioning failures in disguise?** If "we already have X" appears in 60% of discovery calls, the differentiation story isn't landing pre-call. If "your price is too high" appears across all stages, the value calibration is off. If security objections recur in the same shape, the security packet needs an upgrade.

Loop the patterns back to the upstream artifacts:
- [Pattern → positioning_statement update]
- [Pattern → messaging_framework update]
- [Pattern → battlecard update]
- [Pattern → pricing_page_copy update]]

---

## Refresh triggers (re-verify this doc when any of these happen)

- [Win/loss data shows a new top-3 loss reason that isn't covered here.]
- [A new competitor enters the deals and a new "we already have X" pattern emerges.]
- [Pricing or packaging changes — every price objection rebuttal needs re-validation.]
- [Security framework or certification changes (new SOC report, new region launch, new compliance scope).]
- [New decision-maker persona enters deals (e.g., procurement gets involved at a new threshold).]
- [More than 90 days since last review, regardless of triggers.]
`,
}

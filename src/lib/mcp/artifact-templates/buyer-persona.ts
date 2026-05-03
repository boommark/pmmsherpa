/**
 * Buyer Persona template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Kalbach — Jobs to Be Done Playbook (job performer + 5 JTBD elements +
 *   desired outcome statements). Torres — Continuous Discovery Habits
 *   (proto-persona discipline: interview-grounded, not invented). Cagan —
 *   Inspired (the Four Risks — specifically value risk and viability risk
 *   as persona-load-bearing).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/05-buyer-persona.md
 *
 * Why this template diverges from the conventional "Marketing Mary, age 34,
 * drives a Subaru, listens to NPR" persona format: a persona that isn't
 * grounded in actual interviews is fiction. Demographics describe the
 * account (which is the ICP artifact, #04), not the human. This template
 * forces a single buying-role per doc, replaces "needs" with JTBD job
 * elements + desired outcomes, requires an evidence column on every claim,
 * and omits the fields (name, photo, hobbies) that invite invention.
 *
 * Boundary discipline:
 *   - Artifact 04 (ICP) = the company
 *   - Artifact 05 (this) = the human inside the best-fit account
 *   - Artifact 06 (buyer journey) = that human's stages from trigger to renewal
 *
 * Multi-stakeholder reality: positioning targets ONE champion (artifact 01).
 * If multiple stakeholder personas are needed, produce SEPARATE docs — one
 * per role — never a composite persona that blurs roles.
 */

import type { ArtifactTemplate } from './types'

const BUYER_PERSONA_SYSTEM_PROMPT = `You are drafting a buyer persona — the \
internal strategic document about ONE human inside a best-fit account. This is \
NOT marketing content, NOT a sales sheet, and NOT the ICP (which is the company).

Avoid these failure modes:
- Fictional detail inflation — names, stock photos, ages, hobbies, "favorite \
podcast," pet's name. If a detail isn't grounded in an interview, deal note, \
support ticket, or observed behavior, it doesn't belong on the persona. \
Inventing personality color is the #1 reason persona docs become decorative
- Demographic-only construction — title + company size + industry + tenure \
describes the *account*, not the *human*. Two VPs of Engineering at similar \
companies can have completely different buying triggers. Move past the title
- Missing jobs-to-be-done — every persona must answer: what is this person \
trying to accomplish in their role, what does success look like for them \
specifically, and what are they afraid will go wrong? No JTBD answer, no \
persona
- Persona soup — one doc trying to cover champion + economic buyer + end user \
simultaneously. Pick ONE role per doc. Other roles get their own docs (or \
none) and are referenced via objection-handling, not blended in
- ICP drift — describing the company (industry, ARR band, tech stack). That \
belongs to the ICP artifact. The buyer persona is about the human
- Journey drift — describing awareness → consideration → decision stages. \
That belongs to the buyer journey artifact. The persona is the *who*, not the *path*

Discipline rules:
- Single role per doc. Pick exactly one of: champion (recommended primary), \
economic buyer, end user, technical evaluator. The champion persona is the \
foundation; everything else is objection-handling support
- Every claim cites a source: interview quote, deal note, support ticket, \
anonymized customer, or explicitly labeled "untested assumption." Untested \
assumptions are allowed but must be flagged so the team knows what to validate \
in the next round of interviews
- Replace vague "needs" with desired-outcome statements: direction of change \
+ unit of measure + object + clarifier (e.g., "minimize time to first \
demonstrable analytics win after onboarding")
- Capture functional, emotional, AND social jobs. B2B champions have emotional \
jobs ("don't get blamed if this fails") and social jobs ("look credible to \
my CFO") that demographic personas miss
- The trigger event matters more than biography. What started the buying \
process? Job change? Failed previous tool? Board mandate? Specific incident?

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const buyerPersonaTemplate: ArtifactTemplate = {
  artifactType: 'buyer_persona',
  title: 'Buyer Persona',
  systemPromptFragment: BUYER_PERSONA_SYSTEM_PROMPT,
  // Skeleton order: declare role first (forces single-role focus) → anchor
  // to the ICP company → trigger that starts buying → JTBD job elements →
  // desired outcomes → buying behavior (shortlist, yes-criteria, internal
  // politics) → cross-role objections → evidence audit. Evidence section
  // last so every section above it references back into it.
  skeleton: `# Buyer Persona: [Role Title — e.g., "VP RevOps Champion"]

## Role declaration (pick exactly ONE)

- [ ] **Champion** — runs the evaluation, builds the shortlist, recommends to the economic buyer. *(This is the primary persona. If you only build one, build this one.)*
- [ ] **Economic buyer** — controls budget, gives final approval. Often not in the room until late.
- [ ] **End user** — lives with the product daily. Can't approve, but can kill a deal during POC.
- [ ] **Technical evaluator** — IT / security / legal. Doesn't pick winners, but vetoes losers.

[If more than one role matters to your deal motion, create a separate persona doc for each. Do not blend roles in a single doc.]

## Best-fit account context

- **Linked ICP pattern:** [One-line reference to the company-level pattern from the ICP artifact. e.g., "Mid-market RevOps teams running Salesforce + 8 spreadsheets, just hired their first analytics lead."]
- **Where this human sits in that account:** [Function, scope of ownership, who they report to, how many direct reports, budget authority level. NOT a biography — just the structural facts that shape their behavior.]

## Trigger event & circumstances

- **What starts the buying process for this person:** [Specific trigger — new hire, board mandate, failed previous tool, churned customer incident, missed quarter, regulatory change. Cite the interviews / deals where you've seen it.]
- **Recent shifts that make the trigger more frequent now:** [Optional. Market changes, role changes, technology shifts that increase the volume of triggered buyers.]
- **What they're doing right now to cope without you:** [Spreadsheets, internal builds, an adjacent tool repurposed, manual process, doing nothing. Same input as the Competitive Alternatives section of positioning, but at the human level.]

## Jobs they're trying to get done

### Functional jobs
[The literal work they're trying to accomplish in their role. Verb + object + clarifier. e.g., "Forecast next-quarter pipeline accurately enough to defend the number on the QBR call."]

### Emotional jobs
[How they want to feel — and what they want to avoid feeling. e.g., "Feel in control of the number. Avoid feeling caught off guard in front of the CRO." Especially important for champions; this is where buying decisions live.]

### Social jobs
[How they want to be perceived by peers, leadership, their team. e.g., "Be seen as the leader who modernized the function, not the one who bought another tool nobody uses."]

## Desired outcomes (what success looks like for them specifically)

[3-5 desired-outcome statements in the form: direction of change + unit of measure + object + clarifier.

Examples:
- "Minimize time to first defensible forecast after onboarding."
- "Maximize likelihood that pipeline reviews end without surprises."
- "Reduce variance between board-committed number and actual close.")]

## Shortlist criteria

[How this person decides who makes the cut. The criteria they actually use — analyst rankings, peer recommendations, specific must-have features, integration requirements, budget thresholds, security certifications, vendor track record. Specific enough that you could build their shortlist for them.]

## What makes them say yes (value risk)

[The crux. What does this person need to believe is true before they recommend you? What proof do they need? What would break the tie between you and the leading alternative? This is the value-risk answer for *this human*, not the company.]

## What makes them fail internally if they pick you (viability risk)

[Champion-specific. What's the political downside of choosing you? What objection from finance / IT / leadership do they have to manage upward? What does "safe choice" mean to them, and what would make picking you feel unsafe? This section is why champion personas exist; without it, the doc is decorative.]

## Cross-role objections this persona will need to handle

[Each other role this persona will navigate, and the predictable objection from each. e.g.:
- Economic buyer: "Why now? Why this much?"
- IT: "Where does the data live? What's the SOC 2 status?"
- End user: "Is this going to be one more tool I have to log into?"

The champion already factors these in. Capture them here so messaging arms the champion to pre-handle them.]

## Evidence audit

[Every non-trivial claim above should map to a source. Use a 2-column table:

| Claim | Source |
|---|---|
| [Trigger = "new hire under pressure to show wins"] | [3 win-call interviews + 2 PMA blog patterns] |
| [Top emotional job = "don't get blamed if this fails"] | [Untested assumption — validate next interview round] |
| [Shortlist criterion = "must integrate with Salesforce"] | [Lost-deal review #4, churn interview #2] |
| ...

Untested assumptions are allowed and useful — they tell the team what to test. But they must be labeled. A persona without an evidence column is fiction.]

---

## Persona refresh checklist

- [ ] Re-validated against the last 6-8 customer interviews
- [ ] Reconciled with most recent win/loss data
- [ ] Trigger event still matches the deals coming in this quarter
- [ ] Untested assumptions tested or explicitly re-flagged
`,
}

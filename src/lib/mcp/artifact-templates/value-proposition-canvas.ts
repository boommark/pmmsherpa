/**
 * Value Proposition Canvas template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Strategyzer — Value Proposition Canvas (6-component customer profile ↔
 *   value map structure; corpus-grade canon, no Book Brain card).
 *   Hormozi — $100M Offers (Value Equation as a per-line scoring overlay:
 *   Dream Outcome × Likelihood / Time × Effort).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/08-value-proposition-canvas.md
 *
 * The two sources merge cleanly: Strategyzer is the structural skeleton (what
 * to map), Hormozi is the weighting overlay (how much each mapping is worth).
 * The Value Equation is embedded inline inside Pain Relievers and Gain Creators
 * rather than rendered as a parallel section — it is a multiplier on canvas
 * fit, not an alternative framework.
 *
 * Boundary: this is buyer-job-level value fit. NOT the same as positioning's
 * Differentiated Value (artifact 01, company-level themes). Customer profile
 * overlaps with buyer_persona (05) — inherit if a persona artifact exists.
 */

import type { ArtifactTemplate } from './types'

const VALUE_PROPOSITION_CANVAS_SYSTEM_PROMPT = `You are drafting a Value \
Proposition Canvas — a buyer-job-level fit document with two halves that must \
map to each other. This is NOT a feature list, a positioning statement, or a \
buyer persona. It is the proof that the product's value lines up with the \
buyer's actual jobs, pains, and gains in the world today.

Avoid these failure modes:
- Features-as-gain-creators — "real-time dashboard", "AI-powered insights", \
"single source of truth" are features. A gain creator must terminate on an \
outcome in the buyer's life ("walks into Monday standup already knowing what \
broke over the weekend"). If the line from a gain creator lands on your \
roadmap instead of the buyer's life, rewrite it.
- Pains-as-not-having-the-product — "lack of a unified platform" is a \
solution description in disguise. Every pain must be friction that exists \
today in the world, regardless of whether your product exists. Test: would \
this pain still be true if your company shut down tomorrow?
- Vague jobs — "manage operations more efficiently" is a category, not a job. \
Specify until you can imagine watching someone do it ("prioritize which \
support tickets get escalated before the VP of CS sees the queue").
- Gains as inverted pains — if every gain is just the negation of a pain, the \
gains list is hollow. Gains are aspirational outcomes the buyer would chase \
even if every pain were already handled. They live above the line.
- One-to-many sloppiness — 8 pains and 2 pain relievers labelled as "fit" is \
not fit. Each pain needs a specific reliever, or you've identified a gap. \
Both are useful outputs; conflating them is not.
- Skipping the per-line value scoring — without rating Dream Outcome, \
Likelihood, Time, and Effort on each mapped pair, the canvas reads as a flat \
checklist where every mapping looks equal. The scoring is what produces the \
prioritization downstream messaging needs.

Draft the customer profile (Jobs → Pains → Gains) BEFORE the value map. \
Drafting value-map-first produces solution-shaped pains and feature-shaped \
gain creators. Customer profile is a description of the buyer's world; value \
map is your response to it.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const valuePropositionCanvasTemplate: ArtifactTemplate = {
  artifactType: 'value_proposition_canvas',
  title: 'Value Proposition Canvas',
  systemPromptFragment: VALUE_PROPOSITION_CANVAS_SYSTEM_PROMPT,
  // Skeleton order: customer profile first (Jobs → Pains → Gains), then the
  // value map (Products → Pain Relievers → Gain Creators), with the Value
  // Equation scoring embedded per-line inside Pain Relievers and Gain Creators.
  // Closes with the fit test — the line-drawing exercise that distinguishes a
  // completed canvas from a 6-bullet list pretending to be one.
  skeleton: `# Value Proposition Canvas: [Product Name]

## Pre-work

- **Champion buyer:** [The ONE buyer this canvas is for. If a buyer_persona artifact already exists, inherit its job statement and decision criteria here. One canvas per champion — drafting for "everyone" produces nothing.]
- **What you're mapping:** [The full product, one module, or one workflow? Canvas fit gets fuzzy if you mix levels. Pick one.]

---

## Customer profile

### Jobs
[What the champion is actually trying to accomplish. Cover all three types:
- **Functional:** the task itself ("prioritize which support tickets get escalated before the VP of CS sees the queue")
- **Social:** how they want to be perceived ("look in control of the queue when leadership asks")
- **Emotional:** how they want to feel ("stop the Sunday-night dread about Monday's escalations")

Specify each job until you can imagine watching someone do it. Aim for 3-5 jobs total across the three types. Vague jobs produce vague value props.]

### Pains
[Frustrations, risks, and obstacles in the way of doing the jobs above. NOT the absence of your product. Each pain must be friction that exists today in the world. Re-test every pain: would this still be true if your company shut down tomorrow? If no, rewrite it. Examples of real pains:
- "I spend 45 minutes before every board meeting reconciling numbers from three tools and I'm still not confident they're right"
- "Every escalation that reaches the VP feels like a personal failure"

Aim for 5-8 specific pains. One vivid sentence each beats five abstract bullets.]

### Gains
[Desired outcomes and benefits *beyond* completing the job. Aspirational, not the inverse of pains. The buyer would chase these even if the pains were already handled. Cover:
- Functional gains ("close the books in 2 days instead of 5")
- Social/status gains ("present at the analyst board meeting with confidence")
- Emotional gains ("end the week feeling like the team is ahead, not behind")

Aim for 4-6 gains. If a gain reads as "no more X" where X is a pain, rewrite it as a positive outcome.]

---

## Value map

### Products & services
[What you actually offer. Not analysis — inventory. One bullet per discrete offer (platform / module / service tier). Used as the anchor for what's mapping to which pains and gains below.]

### Pain relievers
[How your offering reduces each *specific* pain above. One pain reliever per row, mapped explicitly to the pain it addresses. For each, score the four value variables qualitatively and add a one-line rationale:

| Pain addressed | Pain reliever | Dream outcome | Likelihood | Time to result | Effort & sacrifice |
|---|---|---|---|---|---|
| [Quote pain verbatim from above] | [How the offering reduces it] | [High / Med / Low — what outcome lands?] | [High / Med / Low — will they believe it?] | [How fast?] | [What do they have to give up to get there?] |

Pains with no reliever go in the "fit gaps" section below. Don't pad — gaps are useful information.]

### Gain creators
[How your offering produces each *specific* gain above. Same scoring structure. The test for a real gain creator: can you draw a line from this item to a specific gain on the customer profile? If the line lands on a feature on your roadmap instead of an outcome in the buyer's life, rewrite it as the outcome.

| Gain produced | Gain creator | Dream outcome | Likelihood | Time to result | Effort & sacrifice |
|---|---|---|---|---|---|
| [Quote gain verbatim from above] | [How the offering produces it — outcome language, not feature language] | [What outcome lands?] | [Will they believe it?] | [How fast?] | [What do they have to give up?] |

Competitor-verbatim test: could a direct competitor's marketing page lift this gain creator without changing a word? If yes, it's a category cliché, not a gain creator. Sharpen until it can only describe your product.]

---

## Fit test

[Now draw the lines. Annotate explicitly:

- **Strong 1:1 fits** — pains/gains where exactly one reliever or creator maps cleanly with high scores on Dream Outcome AND Likelihood. These are the load-bearing claims for downstream messaging and landing page copy.
- **Weak 1:many** — pains/gains where multiple relievers/creators each address a slice but none owns the outcome. Often a sign of feature inventory pretending to be value.
- **Fit gaps (right side)** — pains or gains with no reliever or creator. Either a roadmap input or a deliberate "not for them" decision. Name which.
- **Orphan claims (left side)** — relievers or creators with no pain or gain on the right side. Almost always feature drift. Either find the buyer-side outcome they serve or cut them.

Closing diagnostic: read your pains list aloud. Do they describe friction that exists *today in the world*, or do they describe a world where your product doesn't exist yet? Those are very different documents — only the first one is a Value Proposition Canvas.]
`,
}

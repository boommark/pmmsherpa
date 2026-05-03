/**
 * Strategic Narrative template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   April Dunford — Sales Pitch (8-step storyboard, two-phase structure).
 *   Kindra Hall — Stories that Stick (four story elements, Normal → Explosion
 *   → New Normal arc, value-story slot in the four-business-stories taxonomy).
 *   Corpus (Tier 2) — Andy Raskin practitioner material via PMA blogs, Lenny
 *   podcast, Loved (Kaplan), The Go-To-Market Strategist: the 5-component
 *   strategic-narrative frame (shift / stakes / promised land / obstacles /
 *   guide).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/03-strategic-narrative.md
 *
 * Why this template is a hybrid (and what we deliberately rejected):
 * The 8-step sales-pitch storyboard is buyer-deal-specific (it ends with an
 * Ask). The strategic narrative is the company-level story that *feeds* the
 * sales pitch — same DNA, different audience and time horizon. We use the
 * Sales Pitch Setup phase as the spine (Insight / Alternatives / Perfect
 * World), drop Steps 6-8 (Proof, Objections, Ask — those belong to artifact
 * 19, the sales pitch deck), and overlay the practitioner 5-component
 * vocabulary (shift, stakes, old game vs. new game, promised land, guide)
 * because it's sharper for the movement-level framing. Hero's Journey is
 * explicitly rejected (Dunford's critique stands for B2B). The named enemy
 * is the *old way of working*, never a competing vendor — vendor call-outs
 * are battlecard material, not narrative material.
 *
 * This artifact is distinct from:
 *   - artifact 01 (positioning_statement) — the internal strategic doc that
 *     this narrative externalizes.
 *   - artifact 19 (sales_pitch_deck) — the buyer-specific deal application
 *     of this narrative.
 */

import type { ArtifactTemplate } from './types'

const STRATEGIC_NARRATIVE_SYSTEM_PROMPT = `You are drafting a strategic narrative — \
the company-level story about a shift in the buyer's world that the company is \
positioned to help them win. This is NOT a sales pitch deck, NOT a tagline, NOT a \
mission statement. It is the movement: the story that unites all audiences (buyers, \
employees, investors, press) and survives product pivots.

Avoid these failure modes:
- Vague shift — "the market is evolving", "AI is changing everything", "buyers want \
more value". A weather report is not a shift. The shift must be a specific, named, \
undeniable change in the buyer's world that the buyer would nod at within thirty \
seconds. If you're introducing them to the shift instead of confirming it, you're \
doing education, not narrative
- Promised land described as the product — "a world where you use our platform" is \
not a promised land. The buyer's transformed reality lives in their world (their \
team, their numbers, their day), not yours
- Stakes too soft — "you'll miss out on growth" creates no urgency. Stakes name what \
dries up, what gets eaten by competitors who adapted, what stops working. Loss \
aversion outperforms gain framing
- Hero's Journey drift — making the buyer a "hero on a quest" produces fuzzy B2B \
narratives that don't survive the first concrete objection. The buyer has a shift to \
navigate, not a fantasy quest. The arc is Normal → market explosion → New Normal, not \
ordinary world → call to adventure → return
- Vision without evidence — pure aspiration with no signal that the shift is real. \
The shift must be confirmable from the buyer's own experience, third-party data, or \
analyst reporting. If the only evidence is your roadmap, it's not a narrative
- Named enemy as a vendor — calling out a competitor by name turns the narrative \
into a battlecard. The enemy is the OLD WAY of working (manual outbound, siloed \
dashboards, quarterly planning, etc.), never a named company
- Bottom-of-funnel content drift — proof points, objection responses, and a \
specific commercial Ask belong to the sales pitch deck, not the narrative. The \
narrative earns the right to have a conversation; it doesn't close a deal

Positive asks:
- Ground the shift in real, verifiable industry evidence — analyst data, named \
behavioral changes, regulatory moves, public benchmarks. Pull from the corpus when \
generating; do not invent trends
- Position the company as the GUIDE, not the hero. Yoda, not Luke. The buyer is the \
one trying to win the new game; the company has mapped the terrain
- Apply the four story craft elements as a quality gate: identifiable characters, \
authentic emotion, a significant moment, specific details. Abstract narratives don't \
stick

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const strategicNarrativeTemplate: ArtifactTemplate = {
  artifactType: 'strategic_narrative',
  title: 'Strategic Narrative',
  systemPromptFragment: STRATEGIC_NARRATIVE_SYSTEM_PROMPT,
  // Skeleton order: pre-work → shift (open) → stakes (urgency) →
  // old game vs. new game (the pivot) → promised land (the payoff) →
  // obstacles (what's in the way) → your role as guide (the company) →
  // craft quality gate → anchor-sentence validation.
  // Steps 6-8 of the Sales Pitch storyboard (Proof, Objections, Ask) are
  // intentionally excluded — they belong to the sales pitch deck artifact.
  skeleton: `# Strategic Narrative: [Company / Product Name]

## Pre-work (decisions made before drafting)

- **Narrative scope:** [Is this a movement-level narrative (one story for buyers, employees, investors, press) or a launch-specific narrative (single product or category push)? Movement-level narratives are broader and survive product pivots; launch-level narratives are sharper but expire.]
- **Shift recognizability:** [Will the buyer recognize the shift from their own experience (confirmation mode) or do you need to teach them the shift exists (education mode)? Education mode requires harder evidence and a longer Insight section.]
- **Anchor audience:** [If you have to pick ONE audience this narrative has to land with first, who is it? Buyers, employees, or investors? Other audiences inherit the framing; they don't drive it.]

## The Shift

[A specific, named, undeniable change in the buyer's world. Not "the market is evolving" — a concrete event, behavior change, regulatory move, or technology break that the buyer has already felt. They should nod within thirty seconds: "yes, that is exactly what's happening." Cite the evidence: customer behavior, analyst data, public benchmarks, named industry moves. One short paragraph.]

## The Stakes

[What happens to companies that don't adapt to the shift? Frame as concrete tragedy, not abstract opportunity loss. What dries up, what gets eaten, what stops working, what becomes uneconomic. Loss aversion is the engine here. Two to four sentences.]

## Old Game vs. New Game

[Name the old way of winning explicitly — the playbook that worked before the shift and is now breaking. Then name the new way of winning that the shift demands. Side-by-side, concrete. The "enemy" of the narrative is the old way of working, not any vendor. If you cannot name what specifically stopped working, the shift isn't sharp enough — go back to the Shift section.]

## The Promised Land

[A vision of the buyer's transformed world if they win the new game. Lives in the buyer's reality, not the product's. "Marketing teams generate inbound demand without cold interruption" is a promised land. "Our platform has 47 features" is not. Describe their team, their numbers, their day — what looks different when they've adapted. One paragraph.]

## The Obstacles

[What stands between the buyer and the promised land? The structural challenges they will face on the way: legacy tools that were built for the old game, organizational habits, data fragmentation, talent gaps. This section makes the promised land feel earned, not handed over — and it is where your product's problem-set surfaces, framed as the buyer's journey rather than your feature list. Three to five obstacles.]

## Your Role as Guide

[The company's role in helping the buyer win the new game. The buyer is the hero; the company is the guide who has mapped the terrain. Name the company and what category of help it provides — briefly. This is the reveal, not the pitch. The reader should already understand the problem and what the solution category needs to do; introducing the company is just naming what they've already concluded they need. Two to four sentences.]

---

## Narrative quality gate (self-check before sign-off)

[Verify before considering the narrative done:
- **Identifiable characters:** Is there a recognizable buyer archetype the reader can picture? (Not "B2B SaaS companies" — "RevOps leaders watching their pipeline-to-quota ratio invert.")
- **Authentic emotion:** Does the narrative trigger a real feeling — recognition, urgency, relief — rather than reading as corporate copy?
- **Significant moment:** Is there a clear inflection point — the moment the old game stopped working — that the reader can date or name?
- **Specific details:** Are there concrete particulars (numbers, behaviors, named tools, named industry moves) that make the abstract concrete?]

## Validation: the anchor-sentence test

[Can the buyer finish this sentence with something they already believe?

> "The world has changed because ____________."

If the buyer agrees with that completion in their own words within thirty seconds of hearing the narrative, it is doing its job. If they need to be educated into the shift, the narrative is too far ahead of the market — either sharpen the shift, add evidence, or accept that this is a longer education play and budget accordingly.

Second test (the boundary test): can a sales AE build an 8-step pitch deck from this narrative for a specific deal stage? If not, the narrative is too vague to power a sales motion. If yes, this narrative is the source; the sales pitch deck is the application.]
`,
}

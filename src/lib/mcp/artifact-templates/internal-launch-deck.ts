/**
 * Internal Launch Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Duarte — Resonate (Sparkline arc — what-is / what-could-be oscillation;
 *   Audience-as-hero / Mentor stance; S.T.A.R. moment; Big Idea).
 *   Duarte & Sanchez — Illuminate (Torchbearer model; Empathetic Listening
 *   before telling; Threshold Crossing as commitment moment; Symbolic
 *   Artifacts; Four-Stage Toolkit pointing to next ceremonies).
 *   Corpus (Tier 2) — PMA practitioner sources for the operational 8-section
 *   spine, role-by-role asks, outcome-not-activity metrics.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/13-internal-launch-deck.md
 *
 * Why this template's center of gravity is change-comm psychology, not deck
 * mechanics: the dominant failure mode of internal launch decks is not bad
 * slides — it is treating an internal audience the same way as an external
 * one. The repurposed pitch deck. Employees walk out informed but not
 * committed. Illuminate's torchbearer / threshold-crossing frame and
 * Resonate's audience-as-hero stance both invert that default. The skeleton
 * keeps the corpus's 8 operational sections (which are correct) but reframes
 * each through the torchbearer / Sparkline lens via bracketed prompts.
 *
 * Output format note: the skeleton emits one prompt PER SLIDE. The LLM
 * generates the deck *content* slide-by-slide; the user converts to actual
 * slides downstream. This matches how PMM teams build decks and avoids
 * locking content to any specific slide tool.
 *
 * This artifact is distinct from:
 *   - artifact 14 (customer_facing_launch_deck) — different audience (buyers,
 *     not employees), different ask (try / buy, not commit / carry).
 *   - artifact 19 (sales_pitch_deck) — buyer-facing deal application, not
 *     internal kickoff.
 *   - artifact 09 (launch_plan) — the upstream GTM brief; this deck is one
 *     of its deliverables.
 *   - artifact 12 (internal_launch_faq) — different artifact, linked to from
 *     this deck's final slide; do not duplicate FAQ content here.
 */

import type { ArtifactTemplate } from './types'

const INTERNAL_LAUNCH_DECK_SYSTEM_PROMPT = `You are drafting an internal \
launch deck — the artifact a launch lead presents at the company all-hands or \
launch kickoff. Audience is employees: sales, customer success, support, \
marketing, product, executives. This is NOT a customer pitch deck, NOT an \
investor deck, NOT the external announcement. The job is to turn employees \
into torchbearers who carry the launch into their own roles, not passive \
recipients who clap and forget.

Avoid these failure modes:
- Repurposed pitch deck — using investor / external-buyer language for an \
internal audience ("we're disrupting the $40B market" is meaningless to a \
support rep trying to answer a ticket on Monday). Rewrite for the audience \
or rebuild the deck
- Launch team as hero — slides about the team that built the launch instead \
of the team that will carry it. The audience is the hero; the presenter is \
the mentor handing them tools. If the deck reads as a victory lap for the \
launch team, it has failed
- No clear ask — deck ends on a "questions?" slide and everyone walks out \
unsure what they're supposed to do differently Monday morning. Every role \
must walk away with a specific behavioral commitment, not a vague \
appreciation
- One generic message for everyone — treating sales, CS, support, marketing, \
and product as a single audience. A CS manager and an SDR have completely \
different jobs after a launch. Either render one slide per role with a \
role-specific ask, or do not include a role-asks section at all (and accept \
the launch will under-perform)
- Linear march without oscillation — flat "context → product → ask" \
sequence. The deck must oscillate between today's frustrating reality (a \
deal slipping, a CS escalation, a support backlog) and the new reality the \
launch enables — so each role sees their own world reflected and feels the \
shift, not just hears about it
- No planted moment — decks without a single memorable beat (a 90-second \
customer clip, one shocking stat, a codename, a symbol) are forgotten by \
Friday. Plant exactly one such moment per deck
- One-off event framing — treating the all-hands as the end of the launch \
instead of one ceremony in a 90-day arc. The timeline must point forward to \
the next moments (30/60/90 check-ins, first-deal celebration), so employees \
understand the launch is a journey, not an announcement

Positive asks:
- Listen before telling. The deck should reflect that the launch lead has \
already heard the team — pre-launch rep interviews, an early preview cohort, \
CS escalation patterns. If the deck does not show evidence of listening, \
employees will not commit
- Position the audience as the hero. The launch lead is the mentor / \
torchbearer who has mapped the path. Employees are the ones who will win \
the new game in their own roles. Inverting this is the dominant internal-deck \
failure
- Surface ONE Big Idea — a single sentence that captures what the launch is \
and why it matters, repeatable by an SDR in a hallway. If the deck doesn't \
surface a Big Idea, employees walk out remembering features, not movement
- Plant ONE memorable moment AND ONE symbolic artifact. The moment is what \
people remember (customer clip, shocking stat, demo beat). The symbol is \
what gets reused for the next 90 days (codename, rallying number, shared \
phrase)
- Pull customer voice from the RAG corpus when available — real customer \
language, podcast quotes. Buyers' words in front of an \
internal audience reset the room from features to outcomes
- Render the role-by-role asks as a threshold-crossing moment, not a \
checklist. This is where employees commit to becoming torchbearers \
themselves. Use commitment language ("starting Monday, your team will…"), \
not advisory language

Output format: emit one bracketed prompt per slide. The user will convert to \
actual slides downstream. Each prompt is two to four sentences max — long \
enough to brief the LLM, short enough to avoid prompt bloat. Do not produce \
slide visuals or layout instructions.

Reference frameworks implicitly. Do not name-drop authors, books, or named \
frameworks (no "Sparkline", no "torchbearer", no "Hero's Journey") in the \
output.`

export const internalLaunchDeckTemplate: ArtifactTemplate = {
  artifactType: 'internal_launch_deck',
  title: 'Internal Launch Deck',
  systemPromptFragment: INTERNAL_LAUNCH_DECK_SYSTEM_PROMPT,
  // Skeleton order: pre-work (listen first) → Big Idea cold open →
  // oscillating context/product/win arc → mentor's tools (sales motion) →
  // threshold-crossing role asks → symbolic metric → forward-pointing
  // ceremonies (timeline) → FAQ pointer → live Q&A. Each slide is one
  // bracketed prompt; LLM fills in content; user converts to slides.
  skeleton: `# Internal Launch Deck: [Product / Launch Name]

## Pre-work (decisions made before drafting)

- **Listen first:** [Have you run an early preview cohort (≈10 reps / CS leads two weeks before all-hands), or done rep interviews to surface the team's current pain and what change the launch is asking of them? If not, the deck will be a broadcast, not a commitment moment. Name what you heard.]
- **Anchor audience:** [Across sales, CS, support, marketing, and product, which role's behavior change matters most to launch success this quarter? Other roles inherit the framing; this role drives it.]
- **Big Idea:** [One sentence — repeatable by an SDR in a hallway — that captures what the launch is and why it matters. If you can't write this sentence, the deck isn't ready.]

---

## Slide 1 — Cold open: the Big Idea + planted moment

[Open with the Big Idea sentence on screen, then immediately follow with the one memorable moment for the deck — a 90-second customer clip, a single shocking stat about the buyer's world, or a symbol (codename, rallying number, screenshot). This is what the room will remember on Friday. Do NOT open with an agenda slide. Do NOT open with the launch team's photo.]

## Slide 2 — Context: what's happening in our buyer's world

[Name the shift / pain the buyer is feeling that triggered this launch. Confirmation, not education — your colleagues should nod within thirty seconds because they have heard this from customers themselves. Pull customer language from the corpus when available. One slide. Specific. Not "the market is evolving."]

## Slide 3 — What we're launching

[Crisp product description. One demo screenshot or 60-second clip. The core job the product does — not the feature list. Resist the urge to show every capability; that lives in enablement docs, not the deck. Frame as "the thing that closes the gap on Slide 2," not as a feature catalogue.]

## Slide 4 — Why we're winning

[The differentiated position, distilled to a line your sales team will actually memorize. NOT a feature comparison. NOT a "we're better at everything" boast. The specific thing this product does that nothing else does, for whom, and why that matters. Inherit from the positioning_statement artifact's Differentiated Value if it exists.]

## Slide 5 — Sales motion: how this gets sold

[ICP, qualification signals, the deal stage where this gets introduced, the top two or three objections with one-line responses. If there's a new pricing model or packaging change, name it explicitly here — do not bury it in the FAQ. Pointer to battlecard / comparison_matrix artifacts for depth. The mentor handing tools to the hero.]

## Slide 6 — Role-by-role commitments (the threshold moment)

[This is the slide where employees become torchbearers. One slide per role, each with a specific behavioral commitment starting Monday. Use commitment language, not advisory language. Specific enough that someone reading it at 8am before a customer call knows exactly what to do.

- **Sales:** [Pitch language to memorize, qualification questions to add to discovery, battlecard pointer, who to loop in on complex deals.]
- **CS:** [Expansion trigger signals to watch, how to introduce to existing customers, escalation path for edge cases, which existing accounts to revisit first.]
- **Support:** [Known limitations, what's in scope vs out of scope, where to route tickets, on-call rotation if applicable.]
- **Marketing:** [Campaign timing, content going live, social amplification asks, embargo dates, named owner per channel.]
- **Product:** [Feedback loop — where to log what the field is hearing, roadmap communication protocol, who reviews and when.]

If a role has no specific ask, omit its slide. A blank ask is worse than no ask.]

## Slide 7 — Success metrics

[Outcome metrics, not activity metrics. Pipeline influenced, feature adoption rate, competitive win rate on deals where this came up, expansion ARR triggered. The distinction signals to the room that we're measuring whether the launch *worked*, not whether the launch *happened*. Pick one or two as the rallying number — the symbol the company will reuse for the next 90 days.]

## Slide 8 — Timeline: the next ceremonies

[Visual timeline. Embargo lift, external announcement, sales enablement live, first campaign wave, 30 / 60 / 90 day check-ins, first-deal-won celebration. Frame the check-ins as ceremonies, not status meetings — the moments when the company comes back together to mark progress. The launch is a 90-day arc, not a one-time event.]

## Slide 9 — Where to get help

[Pointer slide. Link to the launch FAQ (living document, not a slide). Link to enablement repository. Link to battlecard. Link to the dedicated Slack / Teams channel for launch questions — confusion is acceptable, silence is not. Name the launch lead and DRIs per role.]

## Slide 10 — Live Q&A

[Open the room for live questions. Surface the unasked questions yourself by previewing the top three things you expect to hear ("you might be wondering…"). Psychological safety is the goal — employees who feel safe to say "I don't understand this yet" will ask; those who don't will nod and wing it.]

---

## Self-check before sign-off

[Verify before considering the deck done:
- **Audience as hero:** Does the deck make the audience (sales, CS, support, marketing, product) the protagonists, with the launch team in the mentor role? Or does it read as a victory lap for the team that built it?
- **One Big Idea:** Is there a single sentence an SDR could repeat in a hallway? If you can't extract it from Slide 1 in five seconds, it isn't there yet.
- **One planted moment:** Is there exactly one memorable beat (customer clip, shocking stat, symbol) the room will remember on Friday?
- **Oscillation:** Do the slides oscillate between today's pain and the new reality, or do they march linearly? Each role-ask slide should carry a what-is / what-could-be beat for that role.
- **Threshold crossed:** Do the role-by-role asks demand a specific behavioral commitment starting Monday, or do they read as polite suggestions?
- **Forward-pointing:** Does the timeline frame the launch as a 90-day arc with named upcoming ceremonies, or does it end at the all-hands?]

## Validation: the Monday-morning test

[Pick three employees from three different roles in the room. If, on Monday morning, each one knows exactly what they will do differently this week because of this launch — and can describe it in one sentence — the deck did its job. If any of them describes the launch as "the new product the marketing team announced," the deck made the audience passive. Rebuild the role-by-role slides until each role's commitment is specific, behavioral, and dated.]
`,
}

/**
 * Customer-Facing Launch Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Nancy Duarte — Resonate (Sparkline, "What Is / What Could Be" oscillation,
 *   audience-as-hero, mentor stance, S.T.A.R. moment). Jeremy Donovan — How to
 *   Deliver a TED Talk (Idea Worth Spreading, opening hook, story-evidence
 *   loop, closing circle, time discipline, slide strategy). Corpus (Tier 2)
 *   for B2B-launch specifics: dual audience (customers + prospects), the
 *   "why us? vs. why now?" boundary line vs. sales pitch deck, virtual/in-
 *   person time budgets (25-30 / ~40 min), the post-launch "What's Next"
 *   insider beat, and the canonical five failure modes (feature-heavy, no
 *   narrative arc, missing emotional beat, no clear CTA, too long).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/14-customer-launch-deck.md
 *
 * Why this template diverges from a generic "launch presentation" outline:
 * a customer-facing launch deck is structurally a Sparkline (oscillating
 * What Is / What Could Be), not a feature announcement. The corpus's cleanest
 * boundary line — "a sales pitch deck answers 'why us?'; a launch event deck
 * answers 'why now?'" — drives every structural choice here. We keep the
 * Sparkline as the spine, layer TED's opening-hook + closing-circle + time
 * discipline on top, and bake the corpus's five failure modes plus a single-
 * CTA rule into the system prompt. Hero's Journey is rejected (same B2B
 * critique as artifact 03). Talk track / speaker notes are rejected (those
 * belong to artifact 24, executive keynote). Internal enablement content
 * (RACI, Q&A appendix, talk track) is rejected (that's artifact 13).
 *
 * Distinct from:
 *   - artifact 13 (internal_launch_deck) — internal GTM enablement; talk track,
 *     RACI, Q&A. Goal: enable. This artifact is external; goal is to inspire.
 *   - artifact 19 (sales_pitch_deck) — 1:1 deal conversation, ends in
 *     commercial Ask. This artifact is broadcast, ends in event-CTA.
 *   - artifact 24 (executive_keynote) — script + outline. This artifact is
 *     deck spec only.
 *   - artifact 36 (webinar_deck) — thought-leadership / how-to format. This
 *     artifact is launch-specific (named product, named release).
 */

import type { ArtifactTemplate } from './types'

const CUSTOMER_LAUNCH_DECK_SYSTEM_PROMPT = `You are drafting a customer-facing \
launch event deck — the deck a founder, CMO, or product leader uses to launch a \
new product or major release to a room of existing customers and prospects \
(virtual broadcast, customer day, conference keynote). This is NOT internal \
enablement, NOT a 1:1 sales pitch, NOT a webinar. It is a performance — a \
moment in a larger narrative — and the audience came to feel the future \
arriving, not to evaluate features.

The single sharpest framing: a sales pitch deck answers "why us?"; a launch \
event deck answers "why now?". Every structural decision flows from that.

Avoid these failure modes:
- Feature-list slides — every capability slide must answer "what does this \
make possible that wasn't possible before?" If the slide reads as inventory, \
the narrative collapses and the audience checks their phones
- Inside-out language — "we built", "our platform", "our team is excited". \
The audience is the hero of this story; the company is the mentor (Yoda, not \
Luke). Body slides live in the buyer's reality, not yours
- Agenda slide, logo slide, "thanks for joining" opens — these waste the first \
30 seconds, which is the slot where attention is won or lost. Open on a \
provocation: a stat that reframes the audience's world, a question they have \
not thought to ask, an unexpected revelation
- Live demo with no video safety net — live demos at events carry real risk. \
A failed demo destroys the planted S.T.A.R. moment. If the demo is live, name \
the 90-second narrated fallback video in the same skeleton slot
- More than one CTA — the launch CTA is one specific low-friction action \
(start a trial, join a beta, book a session, attend the breakout). "Learn \
more at our website" is not a CTA, it is a shrug. Three CTAs are zero CTAs
- Vendor name-drops as enemies — the "enemy" of the narrative is the OLD WAY \
of working (manual outbound, siloed dashboards, quarterly planning), never a \
named competitor. Vendor call-outs are battlecard material
- Vaporware in the "What's Next" slot — directional, not committal. Customers \
should feel like insiders, not like they are being pre-sold roadmap that may \
slip
- Exceeding the time budget — virtual launches: 25-30 minutes is the ceiling \
before attention fragments (~12-15 slides). In-person: ~40 minutes (~15-18 \
slides). If the draft exceeds budget, cut slides; do not speed-talk
- Hero's Journey drift — making the buyer a "hero on a quest" produces fuzzy \
B2B narratives that do not survive the first concrete objection. The arc is \
What Is → What Could Be (oscillating), not ordinary world → call to adventure \
→ return

Positive asks:
- Render the deck as a Sparkline: every "what could be" slide must be preceded \
by a "what is" slide. The audience must feel the contrast, not just hear the \
launch announced
- One planted S.T.A.R. moment — Something They'll Always Remember — named in \
pre-work and visible in the skeleton. Most often this is the customer-story \
climax or the demo reveal. The S.T.A.R. moment is the line people will quote \
on LinkedIn afterward
- Pull customer language from the RAG corpus when drafting the customer-story \
slide and the market-shift framing. Buyer words outperform marketer words
- Inherit upstream artifacts when present: the strategic narrative seeds the \
market-shift slides; the positioning statement seeds the "what we are \
launching" frame; the messaging framework seeds the language register. Do not \
re-derive these — apply them

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const customerLaunchDeckTemplate: ArtifactTemplate = {
  artifactType: 'customer_launch_deck',
  title: 'Customer-Facing Launch Deck',
  systemPromptFragment: CUSTOMER_LAUNCH_DECK_SYSTEM_PROMPT,
  // Skeleton is slide-by-slide (not section-by-section) because this artifact
  // produces a deck spec, not a document. The Sparkline oscillation (What Is →
  // What Could Be) is enforced by slide order: opening (what is) → market
  // shift (why what-is is breaking) → launch (what could be) → demo (what
  // could be made tangible) → customer story (what could be made real, in
  // someone else's life) → what's next (what could be extended) → CTA (cross
  // the threshold). TED's closing circle collapses into the CTA slot — the
  // CTA answers the opening hook, not a new add-on.
  skeleton: `# Customer-Facing Launch Deck: [Product Name] — [Event Name]

## Pre-work (lock these decisions before drafting slides)

- **Event format & time budget:** [Virtual broadcast (25-30 min ceiling, ~12-15 slides), in-person keynote (~40 min, ~15-18 slides), or recorded for on-demand? Format dictates pacing and demo risk tolerance.]
- **Dual audience read:** [Existing customers want validation that they bet right. Prospects want to feel the future arriving. Name what each group needs to walk out feeling. The narrative must work for both — that is why the spine is shift-based, not customer-specific.]
- **Idea Worth Spreading (the locking sentence):** [Finish this in one sentence: "The way [job to be done] gets done is no longer [old way]; it is [new way], and that makes [previously-impossible thing] possible." If you cannot finish it, you do not have a keynote yet — you have a release-notes meeting.]
- **Planted S.T.A.R. moment:** [Which single slide is the moment people will quote on LinkedIn afterward? Most launches make this the customer-story climax or the demo reveal. Without a planted moment, the deck is informational, not memorable.]
- **The single CTA:** [One action. Start a trial, join a beta, book a session with a CSM, attend the breakout, contact a named team. Choose the one that moves the most people the most meaningful step forward. "Learn more" is not a CTA.]
- **Inherited upstream artifacts:** [Does a strategic narrative (03) exist? It seeds the market shift. A positioning statement (01)? It seeds the launch frame. A messaging framework (02)? It seeds the language. Do not re-derive — apply.]

---

## Slide 1 — Opening hook (What Is)

[A provocation in the first 30 seconds. A stat that reframes the audience's world, a question they have not thought to ask, an unexpected revelation. Creates a tiny moment of discomfort: "wait, is that true about my situation?" That tension pulls them forward. NOT a logo, NOT an agenda, NOT "thanks for joining". One slide, one idea.]

## Slides 2-3 — Why now / the market shift (What Is, deepening)

[The tectonic shift: something specific has moved in the buyer's world, the old approach no longer works, and a new category of solution is now possible. Cite the evidence — customer behavior, analyst data, public benchmarks, named industry moves. Two slides, story-evidence loop: slide 2 names the shift narratively; slide 3 grounds it in proof. The audience should nod within thirty seconds. This is the heart of the deck — most teams underinvest here.]

## Slides 4-5 — What we are launching (What Could Be)

[Name the product/release, frame it, and connect it back to the shift you just described. One clear headline per launch item. NOT a feature list. The question each slide must answer: "what does this make possible that was not possible before?" Slide 4 is the announcement; slide 5 is the one-line "what it makes possible" frame. Inherit positioning's differentiated value themes here.]

## Slides 6-7 — Demo or proof (What Could Be, made tangible)

[Show the thing working. Preferred: a tight 90-second narrated video edited to show the emotional experience of using the product, not the technical depth. Customers want to feel the relief, not understand the architecture. If live demo is unavoidable, the 90-second video is the safety net — name it in the skeleton, do not skip. Two slides: slide 6 sets up "here is what it looks like in practice"; slide 7 is the demo/video reveal.]

## Slides 8-9 — Customer story (What Could Be, made real — and the likely S.T.A.R. moment)

[A before/after story with a named human at the center, not a logo wall and not a quote slide. Slide 8: who they were, what they were stuck on, the specific number that hurt ("Acme was spending 14 hours a week on X"). Slide 9: what changed, the specific number now ("now it takes 20 minutes — and they reallocated two analysts to revenue work"). Specificity is credibility. This is where skeptics in the audience convert. If you flagged this as the S.T.A.R. moment in pre-work, this is where the planted dramatic beat lands — the line people quote afterward.]

## Slide 10 — What is next (What Could Be, extended) — optional

[The insider beat. Show direction without promising vaporware. Customers feel like they are seeing where the platform is going; prospects feel like they are joining at the right moment. Directional, not committal. Two or three themes, no specific dates. Omit this slide if there is no credible direction to share — empty roadmap teasers erode trust faster than no teaser.]

## Slide 11 — CTA / closing circle

[One specific, low-friction action — the one named in pre-work. Tie it back to the opening hook so the deck closes the loop: the question or revelation from slide 1 is now answered or extended by everything in between. The audience should leave with one thing to do and one feeling — that the future just arrived and they are part of it. NO logo slide after this. The CTA is the last frame.]

---

## Narrative quality gate (audit before sign-off)

[Verify before considering the deck done:
- **Sparkline check:** Read the slide titles top-to-bottom. Does the deck oscillate What Is / What Could Be? If three "what could be" slides land in a row, the audience never returns to their reality and the contrast collapses.
- **Audience-as-hero check:** Read every body slide. Is the subject of the headline the buyer or the company? "We built X" fails; "Marketing teams now do Y in minutes" passes.
- **One-S.T.A.R. check:** Is there exactly one slide that could become the LinkedIn quote? Zero = informational deck. More than one = no single moment will land.
- **One-CTA check:** Is there exactly one ask, and is it specific? "Start a trial at [url]" passes; "learn more / follow us / read the blog" fails.
- **Time budget check:** At ~90 seconds per slide for a virtual keynote (~2 min for in-person), does the deck fit the budget locked in pre-work? If not, cut — do not speed-talk.]

## Validation: the watercooler test + the "why now?" test

[Two crisp gates:

**Watercooler test (S.T.A.R. principle):** What is the one line, image, or moment from this deck that someone in the audience will repeat to a colleague tomorrow? If you cannot name it, the deck has no S.T.A.R. moment and will be forgotten by Monday.

**"Why now?" test (boundary against sales pitch):** Read the deck as if you were the audience. Does it answer "why is this the moment?" — or does it answer "why us?" If the latter, you have drafted a sales pitch deck (artifact 19), not a launch event deck. Rewrite the market-shift section until the "why now?" is the dominant emotional beat. The "why us?" answer should be implicit in the launch itself, not the spine of the narrative.]
`,
}

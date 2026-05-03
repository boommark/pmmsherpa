/**
 * Webinar Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Nancy Duarte — Resonate (Sparkline, "What Is / What Could Be" oscillation,
 *   audience-as-hero, mentor stance, S.T.A.R. moment). Jeremy Donovan — How to
 *   Deliver a TED Talk (Idea Worth Spreading, opening hook, time discipline,
 *   slide minimalism, closing circle). Corpus (Tier 2) for the webinar-specific
 *   operational layer: attention-curve mechanics, demo-as-proof framing, seeded
 *   Q&A, three-CTA stair, the "fail in the middle" failure mode taxonomy, and
 *   the demand-gen vs. sales-pitch boundary line.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/36-webinar-deck.md
 *
 * Why this template diverges from a generic "webinar outline": a webinar is
 * structurally a Sparkline compressed to a 45-min slot with a hard attention
 * curve, NOT a sales pitch with logos and an agenda slide. The boundary against
 * the customer-launch deck (artifact 14, "why now?") and the sales pitch deck
 * (artifact 19, "why us?") is load-bearing: a webinar is demand-gen / education
 * with a *soft* product reveal in the last 30%. The first 50% must be
 * vendor-agnostic enough that a registrant who never becomes a customer still
 * walks away with one usable framework — that is what makes the registration
 * list compound. Skeleton renders section-by-section (mapped to the attention
 * curve), not slide-by-slide, because the curve is the load-bearing structure.
 */

import type { ArtifactTemplate } from './types'

const WEBINAR_DECK_SYSTEM_PROMPT = `You are drafting a webinar deck for a B2B \
SaaS demand-gen / education event. This is NOT a sales pitch deck (artifact 19, \
for one named champion in a deal cycle), NOT a customer-launch deck (artifact \
14, "why now?" event broadcast), NOT a keynote (artifact 24, story-led at scale). \
A webinar mixes thought-leadership content with a soft product reveal in the \
last 30%. The first 50% must be vendor-agnostic.

Avoid these failure modes (corpus-named):
- Opening with logos, agenda slide, "thank you for joining", or "About Us" \
— audience tabs away in the first 90 seconds. Open with a specific, \
uncomfortable truth from the audience's own week, paired with a teased payoff.
- Pitching in the first 50% — collapses the demand-gen frame. Product mention \
belongs in the last 30% (minute 25-35 of a 45-min slot), not earlier.
- Demo as feature tour — corpus is sharp: "after 12 minutes establishing the \
problem, the demo answers ONE question: what does solving it actually look like?" \
Show one workflow with one "oh, that's it" moment, not a feature parade.
- Letting the middle collapse — webinars fail between minute 8 and minute 35, \
not at the ends. If the script has a 10-minute monologue with no poll, \
provocative question, or surprising stat, the middle will collapse. Plant a \
pattern interrupt at minute 10 and again around minute 25.
- Ending with "any questions?" — give the seeded answer first. Q&A that \
converts is seeded with 2-3 real objections from a champion or colleague \
(implementation, pricing, "how is this different from what we already have"). \
Close Q&A with a specific transition, not "feel free to reach out".

Required behavior:
- Audience-as-hero, mentor stance. The registrant is the hero; the presenter \
is the mentor. The body of the talk lives in the registrant's reality. The \
product is one possible answer to the question they are now asking — not the \
subject of the talk.
- Plant ONE S.T.A.R. moment (Something They'll Always Remember) — usually the \
customer-story climax with a specific number and a specific human, OR the demo \
reveal moment. Without a planted S.T.A.R., the webinar is informational, not \
memorable, and conversion to demo / trial collapses.
- Idea Worth Spreading: one takeaway the audience can repeat at the watercooler \
the next morning. NOT a product line — a market POV or framework they can cite \
even if they never become a customer.
- CTA stair (three asks at decreasing friction), surfaced 3x: end of main \
content, during Q&A, follow-up email. Lower the bar from "schedule a demo" to \
something like "a 25-minute conversation about your specific workflow."

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const webinarDeckTemplate: ArtifactTemplate = {
  artifactType: 'webinar_deck',
  title: 'Webinar Deck',
  systemPromptFragment: WEBINAR_DECK_SYSTEM_PROMPT,
  // Skeleton order: pre-work locks the four decisions that prevent feature-tour
  // drift, then sections render against the attention curve (0-3 / 3-12 /
  // 12-25 / 25-35 / 35-45). Slide titles named inside sections; full
  // word-for-word script is artifact 21 (talk track), not this artifact.
  skeleton: `# Webinar Deck: [Working Title]

## Pre-work (decisions made before drafting)

- **Webinar type:** [Problem-led education / customer-marketing case-study / \
soft-launch reveal. Each shifts how aggressive the product reveal is. \
Problem-led = strict last-30% reveal. Case-study = product visible inside the \
customer's story. Soft-launch = reveal can move earlier but the talk still has \
to deliver a usable framework, not just an announcement.]
- **Registrant persona (1 named):** [Title, seniority, what they own, why they \
registered. Single persona — webinars written for "everyone" resonate with no \
one. If two segments registered, run two webinars.]
- **One takeaway they repeat at the watercooler:** [The Idea Worth Spreading. \
One sentence. NOT a product line. A market POV or framework they can cite even \
if they never become a customer. This is the load-bearing demand-gen asset.]
- **Primary CTA (low-friction):** [What does the next step look like? Lower \
the bar than "schedule a demo". Examples: "a 25-minute conversation about \
your specific workflow," "an async demo you can navigate yourself and share \
with your team."]
- **Seeded Q&A:** [2-3 real objections planted with a champion or colleague \
ahead of time. Implementation complexity, pricing, "how is this different \
from X we already use". The questions buyers are afraid to ask publicly. \
The Q&A intro answers the first seeded question — does NOT open with "any \
questions?"]
- **The S.T.A.R. moment:** [What is the single beat the audience will \
remember? Customer-story climax (specific number, specific human) OR demo \
reveal ("oh, that's it" frame). Plant it in pre-work or it won't appear.]
- **Format:** [Total runtime: 30 / 45 / 60 min. Default 45 min: 30-35 min \
content + 10-15 min Q&A. Recording status, leave-behind plan (async demo, \
gated asset).]

---

## Section 1 — Opening hook (minutes 0-3)

[Slide 1: cold-open hook. NO logos. NO agenda. NO "thank you for joining." \
Open with a specific, uncomfortable truth from the audience's own week — a \
reframing stat or question. Pair it with a teased payoff: "By the end of \
this, you'll have a framework you can use in your next [pipeline review / \
roadmap planning / QBR]." This is the contract with the audience for the \
next 45 minutes.]

[Slide 2: who you are, in one line, framed as the mentor's credibility — \
not About Us. Keep to under 30 seconds verbal.]

## Section 2 — Problem reframe (minutes 3-12)

[The "What Is" beat, deepening. Take the truth from the hook and unpack \
it: why the old way is breaking, what's at stake, what the audience is \
already feeling but hasn't named. Vendor-agnostic. Speak to the registrant's \
reality — their week, their stakeholders, their KPIs.]

[Slide titles for this section: 3-5 slides. Image-led, one idea per slide. \
End the section with a question or surprising stat that reframes the problem \
in a way the audience hasn't heard before. This is the first attention-curve \
checkpoint — minute 8-10 is where they tab away if you've been monologuing.]

[**Pattern interrupt at ~minute 10:** poll the audience, ask a provocative \
question, or surface a surprising stat. The middle of the webinar collapses \
without one. Name the interrupt explicitly here.]

## Section 3 — Market POV / new game (minutes 12-25)

[The "What Could Be" beat, named. The new winning approach. Vendor-agnostic \
principles, not your product. What the audience can take away and apply \
even if they never buy. This is the heart of the takeaway they'll repeat at \
the watercooler.]

[Slide titles: 4-6 slides. Frame the principles as a small named framework \
if possible (3-5 elements, memorable). Cite outside evidence — analyst, \
peer customer, market data.]

[**Second pattern interrupt around minute 22-25:** another poll, a chat \
prompt, or a customer name-check. The audience's attention drops again \
here. Re-engage before the product reveal.]

## Section 4 — Product reveal + demo (minutes 25-35)

[The soft reveal. Position the product as ONE answer to the question the \
audience is now asking — not the subject of the talk. Frame: "There are \
several ways to operationalize this; here's how we do it." Avoid "we built", \
"our platform," "our team."]

[Demo as proof, NOT tour. ONE workflow that answers ONE question: what does \
solving the problem you've named for the last 12 minutes actually look like? \
Build to the "oh, that's it" moment. Show specific input → specific output. \
NOT a feature parade. NOT five workflows. ONE.]

[Customer story as S.T.A.R. moment if not delivered through the demo: \
specific number, specific human, before/after, the reaction or quote that \
makes it land. This is the moment the audience remembers tomorrow.]

## Section 5 — Q&A + CTA stair (minutes 35-45)

[Q&A opener: do NOT say "any questions?" Open by answering the FIRST seeded \
question yourself. "A few of you registered with this question, so let me \
take that first." Builds momentum, removes silence-risk, demonstrates you \
read the room.]

[Run through seeded Q&A first (2-3), then take live Q&A. Keep answers \
tight — under 90 seconds each.]

[**CTA stair — three asks at decreasing friction:**
- **Primary CTA (highest intent):** [Low-friction first ask, e.g., "a \
25-minute conversation about your specific workflow." NOT "schedule a demo."]
- **Secondary CTA (medium intent):** [Try / self-serve trial / interactive \
demo the buyer can navigate themselves and share with their team.]
- **Tertiary CTA (lowest intent):** [Next webinar in the series / gated \
asset / follow-up email opt-in. Captures the long-tail audience.]
]

[Surface the CTA stair THREE TIMES: end of main content (slide before Q&A), \
during Q&A as a pivot from a seeded question, and in the follow-up email. \
Most teams only do it once at the very end when half the audience is gone.]

## Closing slide

[The closing circle: callback to the hook. Restate the takeaway in one line \
the audience can repeat. Then the CTA stair, visible on the closing slide \
so it stays on screen during Q&A.]

---

## Validation gates (before shipping the deck)

[Run these gates explicitly before the webinar goes live. Each is a hard \
gate, not a checklist:]

- **Demand-gen test:** Read the script. Could a registrant who never \
becomes a customer walk away with ONE usable framework? If no, the talk is \
a sales pitch in disguise — push the product reveal later, deepen the POV.
- **Last-30% test:** Where does the product first appear? If before \
minute 25 (45-min webinar) or 17 (30-min webinar), the demand-gen frame is \
collapsed. Move it.
- **Attention-curve test:** Identify the pattern interrupt at minute 10 \
and minute ~22-25. If either is missing, the middle will collapse. Add a \
poll, provocative question, or surprising stat.
- **S.T.A.R. test:** Name the moment the audience will remember tomorrow. \
If you can't, plant one before the deck ships.
- **Seeded-Q&A test:** Confirm 2-3 questions seeded with a champion / \
colleague. Confirm the Q&A opens by answering the first seeded question, \
not with "any questions?"
- **Watercooler test:** Can the audience repeat the takeaway in one \
sentence the next morning? If the takeaway is "their product is good," \
the talk failed. If it's a market POV or framework they can cite, it \
worked.
- **Three-CTA-touch test:** Confirm the CTA appears at end of main \
content, during Q&A, AND in the follow-up email. Single-CTA webinars leave \
50% of the funnel on the table.
`,
}

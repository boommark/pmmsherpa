/**
 * Talk Track / Pitch Script template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   April Dunford — Sales Pitch (8-step storyboard as the pitch spine).
 *   Chris Voss — Never Split the Difference (calibrated questions, mirroring,
 *   labeling, tactical empathy — the conversational engine). Mike Weinberg —
 *   New Sales Simplified (Power Statement as compressed verbal opener; the
 *   non-negotiable Ask; suppression of "show up and throw up"). Corpus
 *   amplification: the bridge-in / frame / question-out triplet per slide,
 *   sharper failure-mode language ("if your prospect can read faster than
 *   you talk, you've already lost them"; "'any questions?' is surrender").
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/21-talk-track-pitch-script.md
 *
 * Why this template renders one block per Dunford step with a four-part
 * sub-pattern (bridge / frame / body / question): the talk track's job is to
 * sit on top of the deck (artifact 19) and render it as a conversation, not a
 * monologue. Three layers compose cleanly without conflict — Dunford gives the
 * pitch architecture (what to say), Voss gives the conversational engine (how
 * to keep the buyer talking), Weinberg gives the bookends (compact opener +
 * forcing close). The unit-of-work is the slide: every slide gets a verbal
 * bridge in, a one-sentence frame, a body the rep delivers, and a calibrated
 * question that hands the floor back. Reps internalize the unit; the talk
 * track is a map, not a script.
 *
 * Distinct from:
 *   - artifact 19 (sales_pitch_deck) — the visual argument: slides, titles,
 *     layouts. This is the verbal companion. They compose 1:1 by step.
 *   - artifact 20 (demo_script) — governs only the demo segment. This artifact
 *     covers the whole pitch verbal flow and references the demo as one beat.
 *   - artifact 22 (objection_handling) — long-tail reactive objection library.
 *     This artifact only proactively names the top 3-4 in step 7.
 *   - artifact 23 (discovery_questions) — pre-pitch qualification. Calibrated
 *     questions here are in-pitch, used to drive engagement slide by slide.
 *   - artifact 24 (executive_keynote) — broadcast / one-to-many. This is 1:1.
 *   - artifact 25 (cold_email_sequence) — async written outbound. This is live verbal.
 */

import type { ArtifactTemplate } from './types'

const TALK_TRACK_SYSTEM_PROMPT = `You are drafting a talk track / pitch script — \
the verbal companion that lives underneath the sales pitch deck. The deck is \
the visual argument; this is the human argument. They compose 1:1 by step. The \
output is a map a rep internalizes, not a script the rep memorizes. The best \
reps know it cold enough to abandon it the moment the buyer says something \
more interesting than the next slide.

Avoid these failure modes:
- Monologue / show-up-and-throw-up — 20+ minutes of rep talking with no \
questions. Questions are not interruptions; they are how the rep knows they \
are still in a conversation. If a step has no calibrated question, the buyer \
is consuming, not engaging
- Reading the slides aloud — if the buyer can read faster than the rep talks \
(they can), the rep has already lost them. The talk track must add what the \
slide does NOT contain — the framing, the customer language, the why-this-\
matters-to-you. The slide carries the headline; the rep carries the story
- No calibrated questions — a pitch with zero questions is a presentation, \
and presentations do not close deals. Every step needs at least one open \
"how" / "what" question that gets the buyer talking and listening to \
themselves. Avoid "why" questions (defensive)
- Weak transitions — "okay, so the next slide is…" kills momentum. The bridge \
in must connect the previous insight to the next one ("So that is the \
problem. Here is what we decided to do about it."). Without bridges, the \
pitch is a slide deck read aloud
- Missing the close — ending with "any questions?" is the most common and most \
expensive mistake in B2B SaaS sales. That is not a close, it is surrender. \
The Ask is specific, time-bound, framed as the logical next step, and stated \
out loud
- Inside-out opener — starting with the company, the team, the funding, the \
awards. The verbal flow lives in the buyer's reality from word one. The \
Power Statement and the Insight beat both start with the buyer's pain, not \
the rep's product
- Lecturing past a buying signal — when the buyer says something more \
interesting than the next slide (a specific number, an internal constraint, \
a stakeholder name, a competitor mention), abandon the planned line and \
follow the thread. Mirror the last three words. Label the emotion. The talk \
track is a map; the deal is in the detour

Positive asks:
- Render every step with the four-part pattern: BRIDGE IN (verbal transition \
from the previous step), FRAME (one sentence the rep says before the buyer \
reads the slide), BODY (the verbal flow as bullet beats, not paragraphs), \
QUESTION OUT (one calibrated "how" / "what" question that hands the floor \
back). All four parts every step. No exceptions
- After Insight (step 1), pause. Actually wait. The silence after a good \
calibrated question is where deals start. Mark the pause in the script
- Pull customer language from the RAG corpus when drafting body beats and \
calibrated questions. Buyer words ("we are spending fourteen hours a week \
reconciling…") outperform marketer words ("operational efficiency") in every \
register
- Inherit upstream artifacts when present: positioning_statement (01) sets \
the Differentiated Value claims for step 5. messaging_framework (02) sets \
the language register. strategic_narrative (03) seeds steps 1-3. \
sales_pitch_deck (19) is the slide-by-slide partner — render exactly one talk \
track block per deck slide
- Use mirroring (repeat the buyer's last three words) and labeling ("it \
sounds like…", "it seems like…") as response patterns when the buyer talks. \
These are not pitch beats — they are how the rep stays in the conversation \
when the buyer reveals something. Cue them in the body beats where the buyer \
is most likely to push back

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const talkTrackPitchScriptTemplate: ArtifactTemplate = {
  artifactType: 'talk_track_pitch_script',
  title: 'Talk Track / Pitch Script',
  systemPromptFragment: TALK_TRACK_SYSTEM_PROMPT,
  // Skeleton mirrors Dunford's 8-step pitch storyboard 1:1, with a four-part
  // sub-pattern per step (bridge / frame / body / question). The skeleton
  // enforces the pattern structurally — the model cannot draft a step without
  // a calibrated question because the QUESTION OUT bracket is empty until
  // filled. Power Statement, considered/unconsidered branch, and inherited
  // upstream artifacts live in pre-work. Mirroring + labeling cue cards live
  // as a sidebar after step 8, reachable mid-pitch.
  skeleton: `# Talk Track / Pitch Script: [Product Name]

## Pre-work (lock these decisions before writing the talk track)

- **Champion in the room:** [The ONE buyer this pitch is for. Title, what they own, what makes them say yes, what makes their boss say yes. The talk track is built for this person, not for the room. Multi-stakeholder variations are downstream artifacts.]
- **Considered or unconsidered purchase:** [Considered = the buyer is in market, has defined requirements, knows the category. Move faster through Insight + Alternatives, dwell on Differentiated Value + Proof. Unconsidered = the buyer does not yet recognize the problem. Insight is the longest beat; Proof has higher burden because skepticism extends to the problem itself.]
- **Power Statement (the 60-second compact pitch):** [The compressed verbal opener used when there is no deck — cold call, elevator, hallway intro. Four beats, one sentence each: (1) the problem we solve (in the buyer's words), (2) what we do (plain language), (3) proof (one named customer + one specific outcome), (4) the ask (a specific conversation, not "learn more"). This primes the Insight slide; it is not a separate step in the deck pitch.]
- **Inherited upstream artifacts:** [Does positioning_statement (01) exist? Inherit Distinct Capabilities + Differentiated Value for step 5. messaging_framework (02)? Inherit the language register for body beats. strategic_narrative (03)? Inherit the market shift for steps 1-3. sales_pitch_deck (19)? Render exactly one talk track block per deck slide. Do not re-derive these — apply them.]
- **Pre-pitch verbal warm-up (before slide 1):** [The opening move that earns permission to run the pitch. Validate the buyer's stated problem before launching: "Before I walk you through anything, I want to make sure I have this right. You mentioned [problem from discovery]. Is that still the biggest thing on your plate, or has something shifted?" This signals the rep listened and creates space to adapt the pitch in real time.]

---

## Step 1 — Insight (Setup phase)

**Bridge in:** [Verbal transition from the warm-up to the pitch. Connects what the buyer just confirmed in the warm-up to the market shift you are about to name. Example pattern: "What you just described is not just your team — it is a pattern we are seeing across [segment]. Let me show you what we mean."]

**Frame (one sentence before the buyer reads the slide):** [The single sentence the rep says as the slide appears, orienting the buyer to read it the right way. Not the slide title — the human framing of why this matters to THEM.]

**Body (verbal beats, not paragraphs):** [The Insight delivered as 3-5 spoken beats. The shift in the market — technology, behavior, regulation, competitive dynamics — that creates a new class of problems. The buyer should think "yes, that is exactly what I have been experiencing and could not name." Pull the language from the strategic narrative if it exists. If unconsidered purchase, dwell here longer; this is where the buyer first realizes they have a problem.]

**Calibrated question out:** [One open "how" / "what" question that gets the buyer to confirm or push back on the Insight in their own words. "How is that pattern showing up in your team specifically?" or "What is your read on whether [shift] is real for your business?" THEN PAUSE. The silence after a good Insight question is where deals start. Do not fill it.]

---

## Step 2 — Alternatives (Setup phase)

**Bridge in:** [Connects the Insight just confirmed to the question of what the buyer is doing today about it. Pattern: "Given that, most teams we talk to handle this one of three ways…"]

**Frame:** [One-sentence framing of the alternatives slide as empathetic, not adversarial. The rep is not attacking the alternatives; they are acknowledging why the buyer chose them and naming what they leave on the table.]

**Body:** [3-5 beats covering the current alternatives — spreadsheets, legacy tools, manual processes, doing nothing, an adjacent tool repurposed. Real alternatives, not just named competitors. For each: why the buyer chose it (acknowledge), what gap it now leaves given the Insight (reveal). Inherit Competitive Alternatives from positioning_statement if present.]

**Calibrated question out:** [Surfaces the buyer's actual current state. "How are you handling [problem] today?" or "What is the cost of [current alternative] for your team right now?" Listen for the specific number — that becomes ammunition for the Differentiated Value step.]

---

## Step 3 — The Perfect World (Setup phase)

**Bridge in:** [Connects the inadequacy of alternatives to the question of what an ideal solution would look like. Pattern: "If you could design a solution from scratch — not improve what you have, but build the right thing — what would it need to do?"]

**Frame:** [Frames the Perfect World as objective criteria, not a product description. The buyer should be nodding along thinking "yes, that is exactly what I need" before the product is named.]

**Body:** [3-5 criteria the ideal solution would meet, framed as buyer-needs not product-features. The criteria match the product's strengths exactly — but they are described as what the market needs, not what the product does. This earns the right to introduce the product on the next step.]

**Calibrated question out:** [Confirms the criteria resonate with the buyer's own thinking. "Out of those, which would matter most to your team?" or "What would you add or change?" If the buyer adds a criterion, weave it in.]

---

## Step 4 — The Introduction (Follow-Through phase)

**Bridge in:** [The pivot from setup to product. The work has been done; the introduction is the reveal, not the pitch. Pattern: "That is exactly why we built [Product]. Let me tell you what it is."]

**Frame:** [One clear sentence: what the product is and what category it belongs in. NOT a feature list. NOT a tagline. The category frame matters because it sets the buyer's expectations.]

**Body:** [60-90 seconds, no more. Name the product, the category, the one-line value frame. Inherit from positioning_statement's Market Category and Differentiated Value if present. Do not start the demo. Do not list features. The Introduction is the reveal; the next step does the work.]

**Calibrated question out:** [Confirms the buyer's mental model is intact. "Does that match how you have been thinking about this kind of solution?" or "What questions does that raise before I show you what it does?"]

---

## Step 5 — Differentiated Value (Follow-Through phase)

**Bridge in:** [Connects the Introduction to the specific reasons to choose this over the alternatives. Pattern: "There are three things that make [Product] different from [Alternative]. Let me walk through each."]

**Frame:** [Frames the next 3-5 beats as outcomes, not capabilities. The lead is always the value; the feature appears briefly as proof.]

**Body:** [3-5 differentiated value beats, mapped 1:1 to the Perfect World criteria from step 3. For each: the outcome (what changes for the buyer), the capability that delivers it (one sentence of feature proof), the so-what for THIS buyer (referencing what they said in steps 1-2). If the demo lives here, hand off to the demo script (artifact 20) for that segment; resume the talk track at step 6.]

**Calibrated question out:** [Tests which value beat lands hardest. "Of those three, which would move the needle most for your team this quarter?" The answer tells the rep where to spend Proof.]

---

## Step 6 — Proof (Follow-Through phase)

**Bridge in:** [Connects the Differentiated Value claims to validation. Pattern: "Let me show you what this looks like for a team like yours."]

**Frame:** [Match the proof to the person in the room. A VP of Sales gets a VP of Sales story. An IT leader gets an IT leader story. Specificity is credibility.]

**Body:** [One customer story (preferred) structured as: their situation (industry, size, role) → their problem (specific pain, specific number) → what they did with the product → the measurable outcome (specific number now). Plus one piece of data (usage stat, ROI figure, benchmark) and optionally one third-party validation (analyst, award). The customer story matching the buyer's profile is the highest-leverage proof. Pull customer language from the RAG corpus.]

**Calibrated question out:** [Maps the buyer's situation to the story. "How does [customer's starting situation] compare to where you are today?" Listen for the gap; that is the next conversation.]

---

## Step 7 — Objections (Follow-Through phase)

**Bridge in:** [Connects Proof to the proactive surfacing of common objections. Pattern: "Before you ask — there are a few things people in your role usually want to know at this point. Let me address them up front."]

**Frame:** [Names 3-4 most common objections proactively, before the buyer raises them. This removes them from the buyer's mental "reasons not to buy" list before they anchor. The long-tail objection library lives in the objection_handling artifact (22); this is the top of the funnel.]

**Body:** [3-4 objection beats, each structured as: "You might be wondering [concern]. Here is how we think about that: [honest, direct response]." Acknowledge concerns honestly — pretending they do not exist erodes credibility. Common categories: deployment risk, switching cost, internal buy-in, security/compliance, pricing readiness. Pick the 3-4 most likely for THIS champion.]

**Calibrated question out:** [Surfaces objections the rep did not name. "What concerns are coming up for you that I have not addressed?" or "What would your [CFO / IT / legal] want to know about this?" Maps the buying committee.]

---

## Step 8 — The Ask (Follow-Through phase)

**Bridge in:** [Connects everything to the specific next step. Pattern: "Based on what you have shared today, the logical next step would be…"]

**Frame:** [The Ask is specific, time-bound, low-friction, and framed as the logical next step — not a favor, not "any questions?", not "let me know what you think". State it out loud.]

**Body:** [The single Ask, stated as one sentence. Match the stage of the sale: first pitch ends with a proposal to demo / introduce the champion to the economic buyer / schedule a working session; later-stage pitch ends with asking for the decision. Specify what you propose, what the buyer needs to do, and a specific timeframe ("Can we get [next step] on the calendar for next week?"). Equip the champion with internal-sell material on the way out.]

**Calibrated question out:** [The forcing question. "Does that make sense as the next step?" or "What would need to be true for that to happen by [date]?" The answer either advances the deal or surfaces the real blocker. "Any questions?" is NOT the question. Never end with "any questions?".]

---

## Calibrated question library (substitute mid-call when the locked-in question does not fit)

[Five general-purpose calibrated questions that work across the pitch — the rep substitutes when the buyer's energy or pushback makes the step's locked question wrong:

- **Confirms the problem:** "Is that consistent with what you are seeing?"
- **Surfaces pain:** "What is the cost of that for your team right now?"
- **Exposes the alternative:** "How are you handling that today?"
- **Maps the buying committee:** "Who else would need to be part of this conversation?"
- **Tests urgency:** "What would need to be true for this to be a priority this quarter?"

Use no more than one calibrated question per slide. More than one creates an interrogation register, not a conversation.]

---

## Mirroring + labeling cue cards (response patterns when the buyer talks)

[These are NOT pitch beats — they are how the rep stays in the conversation when the buyer reveals something. Use them in the body of any step where the buyer is likely to push back, share a number, or name an internal stakeholder.

- **Mirror (repeat the buyer's last three words, with rising intonation):** Buyer says "we tried that and it broke down at scale." Rep replies "broke down at scale?" Then silence. The buyer almost always elaborates. Cheap, effective, no script needed.
- **Label the emotion ("it sounds like…", "it seems like…"):** Buyer says "we have looked at five tools already." Rep replies "It sounds like you are skeptical that another tool is the answer." Naming the emotion before the buyer does defuses resistance and signals the rep is listening.
- **AVOID "why" questions** ("why are you doing it that way?"). They put the buyer on the defensive. Use "what" or "how" instead ("what led you there?", "how is that working?").]

---

## Failure-mode audit (run before the pitch)

[Verify before considering the talk track ready to deliver:

- **Monologue check:** Read the script start to finish. Does every step have a calibrated question out? If any step has zero questions, the rep will monologue through that segment.
- **Slide-reading check:** For each step, does the body add what the slide does NOT contain — framing, customer language, why-it-matters-to-them? If the body just narrates the slide title, the rep will read the slide.
- **Transition check:** Read the bridge-ins in order. Do they connect insight to insight, or do any of them read as "okay, next slide"? Weak bridges kill momentum.
- **Close check:** Is the step 8 Ask specific, time-bound, and stated out loud? "Any questions?" anywhere in step 8 = fail.
- **Inside-out check:** Read the first 60 seconds (warm-up + step 1). Is the subject the buyer or the company? "We have helped 200 customers" fails; "Most teams in your situation are dealing with X" passes.
- **Buying-signal-permission check:** Does the script give the rep permission to abandon the next line when the buyer says something more interesting? If not, add a note: this is a map, not a teleprompter.]

## Validation: the silence test + the Ask test

[Two crisp gates:

**Silence test (Voss / Insight beat):** After the calibrated question on step 1 (Insight), can the rep sit in silence for 5+ seconds without filling it? If the script has the rep keep talking, the script has killed the buyer's space to engage. The most expensive moment in the pitch is the silence after a good Insight question — and the most expensive mistake is filling it.

**Ask test (Weinberg / step 8):** Can the rep state the Ask in one sentence, with a specific next action and a specific timeframe? Read the step 8 body out loud. If it ends with "any questions?", "let me know what you think", or "feel free to follow up", the script has no close. Rewrite the Ask until the rep can deliver it as one declarative sentence the buyer either accepts or counter-proposes.]
`,
}

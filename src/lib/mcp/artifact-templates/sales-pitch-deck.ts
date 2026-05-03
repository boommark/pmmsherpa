/**
 * Sales Pitch Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   April Dunford — Sales Pitch (8-step storyboard, two-phase Setup /
 *   Follow-Through architecture, champion-focus, considered/unconsidered
 *   purchase modes). Nancy Duarte — Resonate (Sparkline oscillation between
 *   What Is / What Could Be, S.T.A.R. moment, mentor stance). Corpus (Tier 2)
 *   amplification: the Insight is "the wedge"; the Perfect World writes the
 *   RFP; demo-too-early and weak-Ask are the dominant practitioner failure
 *   modes; sales pitch ≠ strategic narrative ≠ product demo.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/19-sales-pitch-deck.md
 *
 * Why this template diverges from a generic "pitch deck" outline:
 * Dunford's 8-step storyboard is the canonical spine — buyer cannot translate
 * features into business value before they understand the problem; the
 * Setup phase (Steps 1-3) earns the right to introduce the product. We
 * render the full 8 steps slide-by-slide with TWO bracketed prompts per
 * slide ("what's on the slide" + "what the rep says") so the deck is
 * delivery-aware, not just visual. Resonate's Sparkline is overlaid as the
 * arc; the S.T.A.R. moment is named in pre-work and visible in the skeleton.
 * Hero's Journey is rejected (Dunford's B2B critique stands). Vendor names
 * as enemies are rejected (battlecard material, not pitch material).
 *
 * This artifact is distinct from:
 *   - artifact 03 (strategic_narrative) — the WRITTEN movement story;
 *     role-agnostic; feeds Steps 1-3 of this pitch. This artifact is the
 *     deck used in 1:1 sales calls, champion-specific, full 8 steps.
 *   - artifact 14 (customer_launch_deck) — broadcast event deck; answers
 *     "why now?". This artifact answers "why us?" to one champion.
 *   - artifact 20 (demo_script) — the proof step INSIDE this pitch (Slide 13).
 *     Pitch frames the demo; demo doesn't replace the pitch.
 *   - artifact 21 (talk_track) — full word-for-word script. This artifact
 *     encodes a verbal beat per slide, not a full script.
 *   - artifact 22 (objection_handling) — long-form per-objection brief.
 *     Slide 14 here handles only the top 3 unspoken objections inline.
 *   - artifact 26 (partner_pitch_deck) — channel-partner audience and
 *     motivations differ; future thin variant, not this template.
 */

import type { ArtifactTemplate } from './types'

const SALES_PITCH_DECK_SYSTEM_PROMPT = `You are drafting a sales pitch deck — \
the deck an AE uses in a 30-60 minute 1:1 sales call with a champion. This is \
NOT a strategic narrative, NOT a launch event deck, NOT a product demo, NOT a \
talk track. It is a structured story that earns the right to introduce the \
product, then proves it and closes for a specific next step.

The single sharpest framing: a strategic narrative answers "why is the world \
changing?"; a launch deck answers "why now?"; a sales pitch deck answers \
"why us, over the alternatives this champion could choose today, with a \
specific next step?". Every structural decision flows from that.

Avoid these failure modes:
- Feature-list pitches — slides whose subject is a capability, not a buyer \
outcome. Step 5 (Differentiated Value) slides MUST lead with a value-led \
headline; supporting capability bullets are proof, never the lead. If the \
headline could be deleted and the slide still made sense as a feature \
inventory, the slide has failed
- Weak insight — "companies need to move faster", "data silos slow teams \
down", "AI is changing everything". These are problem statements every \
competitor uses verbatim. The Insight is the wedge; if it's weak, every \
subsequent slide reads against a generic frame. The Insight must be specific, \
counterintuitive, and rooted in something the rep specifically knows that \
reframes how the buyer thinks
- Demo too early — introducing the product (Step 4) or showing capability \
(Step 6) before the buyer has agreed on the Perfect World criteria (Step 3). \
When the product is revealed before the criteria are set, every feature lands \
as "interesting" rather than "exactly what we need". The Setup earns the demo
- Generic discovery — Step 2 (Alternatives) treated as a checkbox. "So, what \
are you using today?" is not discovery; it's a survey. Step 2 must surface \
which alternative the buyer is closest to and where it specifically breaks \
for them, because Step 5 must be positioned against THAT alternative, not \
against a generic competitive set
- Weak Ask — "any questions?", "we'll follow up with materials", "let us \
know what you think". The Ask is a sales decision, not a courtesy. It must be \
one specific, low-friction action that matches the deal stage: a demo with \
the technical team, an intro to the economic buyer, a working session, a \
procurement kickoff. Vague Asks kill momentum
- Hero's Journey drift — making the buyer "a hero on a quest with the \
product as their elixir" produces fuzzy B2B pitches that don't survive the \
first concrete objection. The buyer has a deal to close, not a quest to \
complete. The Sparkline arc is What Is (current pain) → What Could Be \
(Perfect World) → What Could Be Made Real (proof, demo), not ordinary world → \
call to adventure → return
- Vendor name as enemy — calling out a named competitor in Alternatives, \
Differentiated Value, or Proof slides. Vendor call-outs collapse the pitch \
into a battlecard. The "enemy" of the pitch is the old way of working \
(manual outbound, siloed dashboards, quarterly planning) or the buyer's \
current alternative described by category, never by vendor name. Battlecards \
are where vendor positioning lives
- Inside-out language — "we built X", "our platform delivers Y", "our team \
is excited to introduce Z". The buyer is the hero; the company is the guide. \
Body slide headlines must have the buyer (or buyer archetype) as the subject. \
"RevOps leaders close 30% faster" passes; "Our platform speeds up RevOps" \
fails
- About-us slide, agenda slide, logo wall opener — these waste the first 30 \
seconds, which is the slot where attention is won or lost. Slide 1 is the \
Insight, period

Positive asks:
- Render the pitch as a Sparkline — every Setup slide ("what is") must be \
answered by a Follow-Through slide ("what could be / what is real"). Slide 1 \
(Insight) and Slide 11 (customer story) form the dominant arc; the demo \
(Slide 13) is the visceral payoff
- One planted S.T.A.R. moment — Something They'll Always Remember. Named in \
pre-work, visible in the skeleton. Most often the customer-story climax \
(Slide 11), occasionally a striking insight stat (Slide 2) or the demo reveal \
(Slide 13). Without a planted moment, the champion has nothing to quote when \
re-pitching internally
- Inherit upstream artifacts when present: positioning's differentiated value \
themes seed Slides 8-10. The strategic narrative seeds Slides 1-5 (Setup \
phase). The messaging framework seeds the language register. Do not re-derive \
— apply. If the upstream artifacts don't exist, name the gap in pre-work and \
proceed with caveats
- Pull customer language from the RAG corpus when drafting Slide 11 \
(customer story) and the language register on every body slide. Buyer words \
outperform marketer words — pull from AMAs, podcast transcripts, customer \
interview quotes when available

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const salesPitchDeckTemplate: ArtifactTemplate = {
  artifactType: 'sales_pitch_deck',
  title: 'Sales Pitch Deck',
  systemPromptFragment: SALES_PITCH_DECK_SYSTEM_PROMPT,
  // Skeleton is slide-by-slide (not section-by-section) because this artifact
  // is a deck spec, not a document. Each slide has TWO bracketed prompts —
  // "what's on the slide" (visual / headline / one-idea slot) and "what the
  // rep says" (verbal beat) — so the deck is delivery-aware. The 8-step
  // Dunford storyboard maps to 14 slides + 2 appendix: Setup phase (Slides
  // 1-6, Steps 1-3) is visually distinct from Follow-Through (Slides 7-15,
  // Steps 4-8). Insight, Alternatives, and Proof get slide pairs; Perfect
  // World, Introduction, Demo, Objections, and Ask are single slides.
  // Differentiated Value renders one slide per theme (3 themes locked from
  // upstream messaging framework / positioning).
  skeleton: `# Sales Pitch Deck: [Product Name] — [Champion / Deal Stage]

## Pre-work (lock these decisions before drafting slides)

- **Purchase mode:** [Considered (buyer is in market, has defined requirements — move faster through Setup, spend more on Differentiated Value and Proof) or Unconsidered (buyer doesn't yet recognize the problem — Insight does most of the work, more weight on Slides 1-2 and Slides 11-13). Pick one; it weights the deck.]
- **Champion persona:** [The ONE buyer this pitch is for — the person who leads the evaluation and recommends to the economic buyer. Title, seniority, what they own, the language they use, what they need to walk out feeling. Other stakeholders are handled in the appendix, never by diluting the spine.]
- **Inherited upstream artifacts:** [Does a strategic narrative (03) exist? It seeds Slides 1-5 (Setup phase). A positioning statement (01)? It seeds Slide 7 (Introduction) and Slides 8-10 (Differentiated Value themes — 3 themes locked). A messaging framework (02)? It seeds the language register on every body slide. If any are missing, name the gap and proceed with caveats — the pitch will be weaker.]
- **Demo container:** [Live demo, narrated 90-second video, or both? If live, name the recorded fallback video that runs if the live demo fails — a failed demo destroys the planted S.T.A.R. moment. The demo shows the moment of highest differentiated value FIRST, not the login screen.]
- **Planted S.T.A.R. moment:** [Which single slide is the moment the champion will quote when re-pitching internally? Most pitches make this Slide 11 (customer-story climax). Some make it Slide 2 (a striking insight stat) or Slide 13 (the demo reveal). Name it in pre-work; if you cannot, the deck is informational and the champion has nothing to repeat.]
- **The specific Ask for this deal stage:** [One named, low-friction next step matching where this champion is in the buying process. First-pitch Asks: technical deep-dive with their team, intro to the economic buyer, a scoped pilot. Late-stage Asks: a decision by a date, a procurement kickoff. "Any questions?" is not an Ask.]

---

## Setup phase (Slides 1-6 — earn the right to introduce the product)

### Slide 1 — Insight: the wedge

- **What's on the slide:** [A single specific, counterintuitive observation about the buyer's world that the champion has felt but not fully articulated. One headline, one supporting visual (a stat, a contrast, a named industry move). NOT "companies are struggling with X" — that's something every competitor says verbatim. Specific enough that the champion thinks "huh, I hadn't put it that way." Buyer (or buyer archetype) is the subject of the headline.]
- **What the rep says:** [Open with the Insight in 30-60 seconds. Pose it as something the rep has seen across [N] customer conversations or as a shift the data is now showing. Land on a question that pulls the champion forward: "is that what you're seeing too?" The first 30 seconds are where attention is won or lost — no agenda, no logo wall, no "thanks for joining". The Insight IS the open.]

### Slide 2 — Insight proof / why this is real now

- **What's on the slide:** [The evidence that grounds the Insight. Verifiable: customer behavior data, analyst report, public benchmark, named regulatory/industry move. One visualization, one source. Not your roadmap — that's not evidence.]
- **What the rep says:** [Walk through the evidence in 60-90 seconds. Make the shift undeniable from data the champion can verify. If this is an unconsidered purchase, this slide does extra work — the champion needs more proof to accept the shift exists. If this slide is your S.T.A.R. moment (a striking stat), pause and let it land.]

### Slide 3 — Alternatives: the landscape

- **What's on the slide:** [The 2-4 things the champion could realistically do today: their current tooling described by category, internal builds, manual processes, doing nothing. NO vendor names. Each alternative gets a one-line frame: "X is what most teams use because Y." Empathetic, not dismissive — these were reasonable choices.]
- **What the rep says:** [Acknowledge what the champion is likely doing today and why it was a reasonable choice given the world before the shift. Name the alternatives by category. Then transition: "given what we just talked about, what are you using today?" This is the structured discovery slot — listen for which alternative the champion is closest to. That answer shapes how Slide 8-10 land.]

### Slide 4 — Alternatives: where each one breaks

- **What's on the slide:** [For each alternative on Slide 3, the specific way it breaks given the shift named in Slide 1-2. One line each. Not "it's bad" — "it was built for the old game where [X], but the new world requires [Y], and so [specific failure mode]." Concrete. The buyer should nod at the alternative they're using.]
- **What the rep says:** [Walk through where each alternative falls short given the new world. Empathetic framing: "this isn't a knock on [category] — it was built for a different problem." Pause on the alternative the champion named in Slide 3 discovery. The champion should agree their current approach has gaps before you introduce yours.]

### Slide 5 — The Perfect World: criteria for an ideal solution

- **What's on the slide:** [3-5 criteria for what an ideal solution to this problem would look like, framed objectively. The criteria are engineered to match your distinct capabilities exactly — but they are written as criteria, not as your features. "It would have to [X], integrate with [Y], adapt to [Z]." This slide writes the RFP in your favor before the demo.]
- **What the rep says:** [Frame as: "based on the shift and where the alternatives fall short, what would a solution actually need to do?" Walk the criteria. Get the champion nodding before naming any product. Optionally: "does this match what you'd be looking for?" Their agreement is now the evaluation criteria they will apply to every other vendor.]

### Slide 6 — The Setup → Follow-Through transition

- **What's on the slide:** [A bridge slide. One line: "given those criteria, here's what we built and why we think it matches." Or a visual that signals the pivot — the deck is about to introduce the product. Optional but useful in a 60-minute call to mark the phase change. Skip if the deck needs to compress.]
- **What the rep says:** [Briefly recap: "so we've established [the shift], looked at [the alternatives and their gaps], and aligned on [what an ideal solution would do]. Let me show you what we built — designed specifically for the world we just talked about."]

---

## Follow-Through phase (Slides 7-15 — introduce, prove, close)

### Slide 7 — Introduction: the reveal

- **What's on the slide:** [Product name, category, and a single buyer-outcome headline derived from positioning's market category and differentiated value. NOT a feature list. NOT a vision tagline. The reveal lands cleanly because Slides 1-6 have done all the work. Logo and product name are appropriate here — this is the only logo slot in the deck.]
- **What the rep says:** [Brief and confident: "[Product] is a [category] built specifically for [buyer archetype] who [the situation set up in Setup]." One or two sentences. The champion should already understand the problem and what the solution category needs to do; introducing the product is naming what they've already concluded they need.]

### Slide 8 — Differentiated value: theme 1

- **What's on the slide:** [A single value-led headline derived from theme 1 of the upstream positioning's differentiated value. The buyer (or buyer archetype) is the subject. "RevOps leaders close 30% faster" not "Our platform speeds up RevOps". Maximum 3 supporting capability bullets underneath, each one a specific feature that *enables* the value. If the headline could be deleted and the slide still made sense as a feature inventory, the slide has failed — rewrite.]
- **What the rep says:** [Lead with the value, name the capability that enables it, briefly cite who else gets this outcome. 60-90 seconds. Map back to the Slide 5 criteria the champion already agreed to: "this is what we meant by [criterion X] — here's how we deliver it."]

### Slide 9 — Differentiated value: theme 2

- **What's on the slide:** [Same structure as Slide 8 — value-led headline, max 3 capability bullets — for theme 2 of the differentiated value. Different theme, same discipline.]
- **What the rep says:** [Same delivery pattern as Slide 8. Tie back to Slide 5 criteria. If discovery in Slide 3 surfaced a specific pain that maps to this theme, name it explicitly: "this is the part that hits closest to what you were describing about [pain]."]

### Slide 10 — Differentiated value: theme 3

- **What's on the slide:** [Same structure as Slides 8-9 — value-led headline, max 3 capability bullets — for theme 3 of the differentiated value. Three themes is locked. If positioning has 4-5 themes, pick the three sharpest for THIS champion.]
- **What the rep says:** [Same delivery pattern. Close the differentiated value section with a one-line summary: "those three things together are why we exist — and why [category alternatives] can't get there from where they're starting."]

### Slide 11 — Proof: customer story (likely S.T.A.R. moment)

- **What's on the slide:** [One named customer story whose profile (industry, size, role, problem) closely matches the champion's situation. Three beats: who they were and what they were stuck on (with a specific number that hurt — "Acme was spending 14 hours a week on X"); what they did with the product; the measurable outcome (with a specific number — "now it takes 20 minutes — and they reallocated two analysts to revenue work"). Specificity is credibility. NOT a logo wall, NOT a quote slide.]
- **What the rep says:** [Tell the story in 90-120 seconds with the named human at the center. The closer the customer's profile to the champion's, the more the champion can imagine themselves in the story. If this is the planted S.T.A.R. moment, slow down at the inflection point — the moment things changed for the customer is the moment the champion remembers and quotes later.]

### Slide 12 — Proof: data + third-party validation

- **What's on the slide:** [The credibility frame around the value claims. Aggregate data (usage stats, ROI benchmarks, time-to-value), analyst mentions, awards, named-customer logos as a strip. Not the focus of the slide, but the underwriting that makes Slide 11 not feel like a one-off.]
- **What the rep says:** [60-90 seconds: "here's what this looks like across our customer base — and here's what [analyst / press / community] has been saying." Sets up the demo by establishing that the value is reproducible, not anecdotal.]

### Slide 13 — Demo (the visceral payoff)

- **What's on the slide:** [A demo slot. Either a 90-second narrated video edited to show the emotional experience of using the product (preferred for risk control), or a live demo that opens on the moment of highest differentiated value (NOT login, NOT account setup). If live, name the fallback video on the same slide. The demo shows the best thing first.]
- **What the rep says:** [Brief setup before the demo: "let me show you what this looks like in practice — specifically the part that maps to [the criterion or pain the champion most cared about]." Run the demo. After the demo (60 seconds): name what the champion just saw and why it matters in their context. If the demo is the planted S.T.A.R. moment, pause at the reveal.]

### Slide 14 — Objections: address the unspoken ones proactively

- **What's on the slide:** [The top 3 objections this champion is likely thinking but won't say. Each as a "you might be wondering" frame with an honest, direct response. Common categories: scale ("does this work at our size?"), integration ("will this play with our stack?"), risk ("what does the migration look like?"), price ("is this in our budget?"). Pick the three most likely for THIS champion's situation.]
- **What the rep says:** [Lead with: "before we talk about next steps, let me get ahead of the things you're probably thinking but might not ask." Walk through the three. Honest, direct, no hedging. This builds more credibility than pretending objections don't exist. Long-form objection handling lives in artifact 22 — this slide is for the unspoken ones inline.]

### Slide 15 — The Ask

- **What's on the slide:** [One specific, low-friction next step matching the deal stage named in pre-work. Action, who's involved, when. "Schedule a 60-minute technical deep-dive with [your eng lead] and our SE next Tuesday or Thursday." NOT "any questions?", NOT "we'll send materials", NOT three options. One ask, one frame.]
- **What the rep says:** [Close confidently: "based on what we covered, here's what I'd suggest as the next step." Name the ask. Pause. Let the champion respond. If they hesitate, name the alternative ask (intro vs. deep-dive vs. pilot scope) — but the slide carries the primary ask. Momentum lives or dies in the last 60 seconds; specificity is what carries it.]

---

## Champion enablement appendix (Slides A1-A2 — equip the champion to re-pitch internally)

### Slide A1 — Condensed deck for internal use

- **What's on the slide:** [A single-slide condensed version of the pitch the champion can take to internal stakeholders. Three blocks: the shift (Slide 1-2 collapsed to one line + one stat), the differentiated value (the three themes from Slides 8-10 as one-liners), the proof (customer-story headline from Slide 11). Designed to be presentable without the rep in the room.]
- **What the rep says:** [Hand-off framing: "after this call, you're going to have to explain this to [your stakeholders]. This slide is what you take to that conversation. The shift, the three things that matter, the customer who's done it." The champion should feel armed, not abandoned.]

### Slide A2 — Per-stakeholder objection brief

- **What's on the slide:** [Top 1-2 objections per stakeholder type relevant to THIS deal (IT/security, legal, finance/economic buyer, end users) with one-line responses each. NOT the long-form objection handling doc (that's artifact 22) — this is the cheat sheet the champion uses when fielding internal pushback.]
- **What the rep says:** [Wrap-up: "as you walk this around the org, here's what you'll hear from each function and how we typically address it. If anything comes up that's not on this slide, ping me directly and I'll get you what you need." Closes the loop on champion enablement and re-states the rep's availability.]

---

## Narrative quality gate (audit before sign-off)

[Verify before considering the deck done:
- **Sparkline check:** Read the slide titles top-to-bottom. Does the deck oscillate What Is (Slides 1-4) → What Could Be (Slides 5, 7-10) → What Could Be Made Real (Slides 11-13)? If the arc is flat, the audience never feels the contrast and the deck reads as a list.
- **Setup-earns-Follow-Through check:** If you compressed Slides 1-6 to one paragraph, would Slides 7-15 still land? They shouldn't — the Setup is what makes the Follow-Through inevitable. If the Follow-Through stands alone, the Setup is doing nothing and needs to be sharpened.
- **Value-led headline check:** Read every Slide 8-10 headline. Is the subject the buyer (or buyer archetype) or is it the company/product? "We built X" fails; "[Buyer archetype] now does Y" passes. If the headline could be deleted and the slide still read as a feature inventory, rewrite.
- **One-S.T.A.R. check:** Is there exactly one slide that the champion will quote when re-pitching internally? Zero = informational deck. More than one = no single moment will land.
- **One-Ask check:** Is there exactly one Ask on Slide 15, and is it specific, low-friction, and matched to the deal stage? "Any questions?" fails; "Schedule a 60-min technical deep-dive next Tuesday" passes.
- **No-vendor-names check:** Scan Slides 3, 4, 8-10, 11-12. Are any named competitors mentioned? If yes, those vendor call-outs belong on a battlecard (artifact 16), not in the pitch.
- **Champion enablement check:** Could the champion present Slide A1 without the rep in the room? If the condensed deck doesn't carry the story alone, the champion will falter at the internal re-pitch.]

## Validation: the 90-second test + the "why us?" test

[Two crisp gates:

**90-second test (Setup integrity):** Can the rep deliver Slides 1-6 in 8-10 minutes and have the champion saying "yes, that's exactly what I need" before Slide 7 (the Introduction)? If not, the Setup isn't earning the right to introduce the product. The Insight is too weak, the Alternatives too generic, or the Perfect World too abstract.

**"Why us?" test (boundary against artifacts 03 and 14):** Read the deck as if you were the champion. Does it answer "why us, with a specific next step for this deal?" — or does it answer "why is the world changing?" (that's artifact 03, strategic narrative) or "why now? to a broadcast audience" (that's artifact 14, customer launch deck)? If the dominant emotional beat is "why now?" rather than "why us?", you've drafted a launch deck. If the dominant beat is "why the world is changing" with no specific Ask, you've drafted a strategic narrative. The pitch deck owns the champion-specific, deal-stage-specific "why us, what's next?" beat.]
`,
}

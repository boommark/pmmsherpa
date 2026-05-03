# Research — Talk Track / Pitch Script

## Canonical sources (read FIRST)

- **Dunford — Sales Pitch** (canonical card: `~/Documents/AbhishekR/Book Brain/Dunford - Sales Pitch.md`)
  - The 8-step storyboard (Insight → Alternatives → Perfect World → Introduction → Differentiated Value → Proof → Objections → Ask) is the pitch *structure*. The talk track is the *verbal layer* that runs on top of that structure.
  - Setup phase (steps 1–3) earns the right to introduce the product. The pitch should make the prospect say "yes, that sounds like exactly what I need" *before* the product is named.
  - Champion focus: the talk track is delivered to the champion. After the call, the champion needs material to sell internally — but the live talk track is one buyer, one room.
  - Considered vs. unconsidered framing changes how much air the Insight beat needs: unconsidered purchases require the talk track to dwell longer on Insight + Alternatives.
- **Voss — Never Split the Difference** (`~/Documents/AbhishekR/Book Brain/Voss - Never Split the Difference.md`)
  - **Calibrated questions** — open-ended "how" / "what" questions that get the buyer talking and listening to themselves. These are the engine that turns a monologue into a conversation. Avoid "why" (defensive).
  - **Mirroring** — repeat the last three words to keep the buyer talking. Cheap, effective, no script needed.
  - **Labeling** — "It sounds like…", "It seems like…" — name the emotion you're sensing before they name it. Defuses resistance, builds rapport.
  - **Tactical empathy** — listen to understand, not to reply. Negotiations (and pitches) are won by getting the other side talking.
- **Weinberg — New Sales Simplified** (`~/Documents/AbhishekR/Book Brain/Weinberg - New Sales Simplified.md`)
  - **Power Statement** — pain → offering → proof → CTA. A compact, customer-centric verbal opener that replaces the "show up and throw up" feature dump.
  - "Show up and throw up" — Weinberg's single most-cited failure mode and the reason most reps need a talk track at all.
  - The story (talk track) is one of three sales weapons (with phone + face-to-face). Without it, activity is wasted.
  - The Ask is non-negotiable. Calls without an Ask are activity, not sales.

## What each book contributes (clean composition, no overlap)

| Layer | Source | What it gives the artifact |
|---|---|---|
| Pitch structure (the spine) | Dunford — Sales Pitch | 8 steps of *what* to convey, in order. The deck (artifact 19) renders these as slides. The talk track delivers them verbally. |
| Conversational tactics | Voss | Calibrated questions, mirroring, labeling — the *how* of getting the buyer talking at every step. |
| Compact opener + CTA discipline | Weinberg | The Power Statement as the verbal opener for cold/short-form pitches. The Ask as a non-negotiable close, not a "any questions?". |

This composition is unusually clean — the three books address three different layers and don't conflict. Dunford gives the pitch architecture; Voss gives the engagement tactics; Weinberg gives the bookends (opener + close).

## Corpus research (Tier-2 amplification)

The corpus query returned a synthesized answer that's near-perfect for this artifact. Top citations (10):

1. **Dunford — Sales Pitch p.123, p.129, p.135** — three Sales Pitch chunks; confirms Dunford as the spine.
2. **Dunford — Obviously Awesome v2 p.117** — positioning underpinning the pitch.
3. **Maja Voje — The Go To Market Strategist p.291** — practitioner pitch construction.
4. **Joel Klettke — Punchy p.70** — messaging stack feeds the language register.
5. **Geoffrey Moore — Crossing the Chasm p.154** — early-market pitch context.
6. **Weinberg/Mares — Traction p.132** — adjacent (channel testing); not directly applicable.
7. **Stevie Langford / PMA — "Prevalent pitfalls"** — practitioner failure-mode taxonomy.
8. Untitled blog — B2B SaaS sales funnel context (low value).

**Net-new contribution from the corpus:** the **bridge in / frame / question out** triplet per slide. Neither Dunford, Voss, nor Weinberg states this structure explicitly, but it's the obvious operationalisation of the three layers combined: Dunford gives the slide content; Voss gives the question-out engine; Weinberg gives the transition discipline. The corpus synthesizer surfaced this as the natural verbal pattern. **Adopted as the per-step skeleton.**

**Net-new failure-mode language from the corpus:**
- "If your prospect can read faster than you talk (they can), you've already lost them" — sharper than Weinberg's "show up and throw up." Used in system prompt.
- "'Any questions?' is not a close, it's a surrender." — sharper than book canon. Used in system prompt.
- "Pause. Actually wait. The silence after a good insight question is where deals start." — Voss in spirit; corpus made it concrete. Embedded in the Insight beat.

## Boundary calls (what this artifact is and is NOT)

- **vs. artifact 19 (sales pitch deck)** — the deck is the *visual* argument: slides, titles, layouts. The talk track is the *verbal* argument: what you say, when, what you ask. The pairing is explicit: one talk-track entry per deck slide. The two artifacts are designed to compose.
- **vs. artifact 20 (demo script)** — the demo script governs only the demo segment (Big Bang Opening, macro-to-micro guided tour, the 5–8 specific things to demo). The talk track covers the *whole pitch verbal flow* — opening, market frame, alternatives, intro, value, proof, objections, close — and references the demo segment as one beat inside it.
- **vs. artifact 25 (cold email sequence)** — outbound *write* (asynchronous, written) vs. live *verbal*. Different register, different cadence, different success metric.
- **vs. artifact 22 (objection handling doc)** — the talk track *proactively* names the top 3–4 objections (Dunford step 7) before the buyer raises them; the objection handling doc covers the long tail of reactive objections in detail.
- **vs. artifact 23 (discovery question set)** — discovery happens *before* the pitch (qualification + need-shaping). Calibrated questions in the talk track are *during* the pitch, used to drive engagement and surface buying signals slide by slide.
- **vs. artifact 24 (executive keynote)** — keynote is broadcast (one-to-many, performative, audience-as-hero); pitch is 1:1 (champion-focused, transactional, ends in commercial Ask).

## Template design decisions

**Spine = Dunford 8-step.** Slide order = step order. The talk track renders one block per step. Non-negotiable.

**Per-step structure = corpus's three-part pattern.** Each step gets:
1. **Bridge in** — the verbal transition from the previous step. Connects insight to insight; kills "okay, next slide" momentum-killers.
2. **Frame** — one sentence the rep says before the buyer reads the slide. Orients them so they read with the right frame.
3. **What to say (the body)** — concise verbal flow, NOT a script. Bullet beats, not paragraphs.
4. **Calibrated question out** — Voss-style "how" / "what" question at the slide's exit. Drives the buyer to engage before the next slide. Never more than one per step.

This four-part triplet (plus the body) is the single sharpest design decision. It collapses Dunford + Voss + Weinberg into a unit-of-work the rep can internalize per slide.

**Power Statement as pre-work, not a body section.** Weinberg's Power Statement is the compact verbal opener for cold/short-form pitches (e.g., the first 60 seconds before slide 1, or the elevator version of the pitch). Captured in pre-work so it primes the actual Insight slide; not duplicated as a step.

**Pre-pitch openings live in pre-work.** The corpus's "Before I walk you through anything…" opener (which validates the prospect's stated problem before launching the pitch) belongs in pre-work as the verbal warm-up — it precedes Dunford step 1, doesn't replace it.

**Calibrated-question library as a sidebar.** The corpus surfaced 5 calibrated questions that work across the pitch (cost surface, alternative surface, buying-committee map, urgency test, problem confirm). These get a dedicated section so reps can substitute mid-call when the locked-in question for the step doesn't fit the buyer's energy.

**Mirroring + labeling cue cards.** Voss's two simplest tactics (mirror the last three words; label the emotion with "it sounds like…") get short cue cards in the body, used when the buyer talks. They are *response patterns*, not pitch beats — separated visually.

**Failure modes locked into system prompt.** Five failure modes, all confirmed by both books and corpus: monologue, slide-reading, no questions, weak transitions, missing close. Plus two book-derived ones: show-up-and-throw-up, vague Ask.

**Champion-focused.** Inherits from Dunford v2 + positioning_statement (artifact 01): one champion persona, one pitch. Multi-stakeholder talk tracks are built downstream as variations, not at this layer.

**Considered vs. unconsidered branch.** Pre-work asks the user which they're in. If unconsidered, the talk track flags that the Insight beat needs more air time — it's the most important step and the buyer doesn't yet recognize the problem.

## Section-to-source map

| Template section | Source |
|---|---|
| Pre-work: Champion + considered/unconsidered | Dunford — Sales Pitch |
| Pre-work: Power Statement (60-sec compact opener) | Weinberg |
| Pre-work: Inherited upstream artifacts | Architectural decision (composes with 01, 02, 03, 19) |
| Pre-pitch verbal warm-up | Corpus + Voss (calibrated questions, tactical empathy) |
| Steps 1–8 talk track blocks | Dunford — Sales Pitch (structure) + Voss (questions) + Corpus (bridge/frame/body/question pattern) |
| Calibrated question library | Voss + Corpus |
| Mirroring + labeling cue cards | Voss |
| Failure-mode audit | Books + corpus, distilled |
| Validation: the silence test + Ask test | Voss + Weinberg |

## Sections excluded

- **Detailed objection handling** — separate artifact (22). The talk track names the top 3–4 proactive objections (Dunford step 7) but defers the long tail.
- **Discovery question set** — separate artifact (23). Discovery happens before the pitch; this artifact covers in-pitch questions only.
- **Demo blocking and tackling** — separate artifact (20). The talk track has one beat for the demo segment that points to the demo script.
- **Slide visuals / layout** — separate artifact (19). This is the verbal layer.
- **Multi-stakeholder variations** — out of scope for v1. The talk track is for the champion; downstream variants (CFO call, IT call, end-user demo) are derivatives.
- **Cold-call openers (longer-form)** — Weinberg-style cold-prospecting is a different surface; this artifact is for the booked pitch meeting.

## System prompt failure modes (negative guidance)

Distilled from books + corpus to seven:

1. **Monologue / show-up-and-throw-up** — talking for 30+ minutes with no questions. Books + corpus aligned.
2. **Reading the slides aloud** — the buyer reads faster than the rep talks; corpus phrasing is sharpest here.
3. **No calibrated questions** — a pitch with zero questions is a presentation, not a sales conversation. Voss + corpus.
4. **Weak transitions** — "okay, the next slide is…" kills momentum. Bridges must connect insight to insight. Corpus.
5. **Missing the close** — "any questions?" is surrender. The Ask is specific, time-bound, and stated. Weinberg + Dunford.
6. **Inside-out opener** — starting with the company, the team, the funding, the awards. The verbal flow lives in the buyer's reality from word one. Books aligned.
7. **Lecturing past a buying signal** — when the buyer says something more interesting than the next slide (a number, a constraint, an internal name), abandon the script and follow the thread. The talk track is a map, not a script. Corpus + Voss.

## Open questions for audit

- **Should we render all 8 steps as separate skeleton blocks (current) or compress to fewer, with sub-beats?** Current approach is verbose — 8 blocks × 4 sub-parts (bridge/frame/body/question) = 32 bracket-prompts. Argument for compression: cognitive load. Argument for keeping separate (chosen): the rep needs to feel the unit-of-work per slide, and Dunford's 8 steps are the canonical structure they'll see referenced everywhere else.
- **Should the Power Statement be a pre-work item or its own step?** Currently pre-work. Argument for elevating: it's the most useful sub-30-second version of the pitch (cold-call register, hallway intro). Argument for keeping in pre-work (chosen): when delivering the deck, the Power Statement is the compressed framing that primes step 1; it's not a separate verbal step.
- **Should mirroring + labeling get an exercise/practice block?** Currently included as cue cards inside the body. Argument for an exercise block: these are skills, not just lines. Argument against (chosen): this is a pitch-script artifact, not a sales-training artifact.
- **Considered vs. unconsidered — should the artifact branch into two skeletons?** Currently single skeleton with a pre-work flag that adjusts emphasis. Argument for branching: the unconsidered version genuinely spends more time on Insight. Argument against (chosen): one skeleton with a flagged "if unconsidered, dwell here" note keeps the artifact composable.

## Corpus gaps

- Dunford — Sales Pitch surfaced as `book_sales` source_type with `null` section_title. Page numbers came through (123, 129, 135) but no chapter titles. Consistent with prior artifacts. Logged in `corpus-gaps.md` for next ingestion sweep.
- Voss — Never Split the Difference did NOT surface in the top 10. Corpus query was about pitch flow / engagement; Voss is shelved under negotiation/communication and the embeddings didn't bridge. Mitigated by reading the book card directly per methodology Tier-2.
- Weinberg — New Sales Simplified did NOT surface either (Traction surfaced instead — adjacent author, wrong book). Same mitigation: book card was authoritative.

The corpus is strong on Dunford specifically because Sales Pitch is in the corpus and the query terms ("pitch", "talk track") aligned. Negotiation-tactics books and pure-prospecting books don't bridge to "pitch script" semantically. The fix is upstream (re-tag or re-embed Voss/Weinberg with sales-conversation metadata), not at this artifact's level.

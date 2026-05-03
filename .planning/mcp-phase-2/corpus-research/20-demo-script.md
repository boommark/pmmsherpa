# Research — Demo Script

## Canonical sources (read FIRST)

- **Efti — Product Demos that Sell** (primary structural source)
  - Card: `~/Documents/AbhishekR/Book Brain/Product Demos that Sell.md`
- **Dunford — Sales Pitch** — boundary source: where the demo lives inside the
  pitch (Proof / Differentiated Value step, not the opening)
  - Card: `~/Documents/AbhishekR/Book Brain/Dunford - Sales Pitch.md`

## What the Demos book establishes (operational backbone)

### The Seven Deadly Sins (failure-mode taxonomy)
1. Demoing without qualification — running the demo before knowing if they're a fit
2. Starting with features, not pain
3. The feature dump — showing everything
4. Ignoring the audience — missing confusion / disengagement / questions
5. No clear structure — no beginning / middle / call to action
6. Failing to make it real — generic data, not their industry / use case / language
7. No close — ending on "any questions?"

These are the dominant negative-guidance set. Every section of the template
has at least one prompt that suppresses one of these sins.

### Demo Discovery and Qualification
Before a demo is earned, the prospect must be qualified. Five Demo Discovery
questions:
- What is the problem they're trying to solve?
- What have they tried before? Why didn't it work?
- What does success look like?
- Who else is involved in the decision?
- Timeline / urgency?

The Discovery answers become the demo script. The demo is built around
**what you learned from this prospect**, not around what the product can do.
This is a pre-work step in our template — Step 0.

### The Feature/Need Matrix
Map prospect needs against features. Demo only features with a direct mapping
to an expressed need. **Removing features increases persuasiveness.**
Cognitive load + dilution is the failure mode. We render this as a literal
matrix in the pre-work block.

### Big Bang Opening (the first 60-90 seconds)
The first 60 seconds set the emotional frame. Open with the most impressive,
most relevant moment — the visceral "yes" reaction. Three elements:
1. Name the pain (restate from Discovery)
2. Show the before state (make the old way feel painful)
3. Reveal the solution (the moment that eliminates the pain)

After the Big Bang, the prospect leans forward. Everything else confirms what
they already want to believe. **Do not save the best for last.**

### Macro-to-Micro Structure
Three layers:
1. **Macro** — what world does the product create?
2. **Mid (Workflow)** — the core workflow, step by step
3. **Micro (Features)** — specific features mapped to specific stated needs

Most reps start at micro and never reach macro. Big Bang reverses this:
macro outcome first, then drill into workflow and features.

### Three-Point Rule
Prospects can only hold ~3 ideas in working memory. Structure every demo
around exactly 3 core claims. Each claim:
1. Stated up front ("Today I'll show you three things...")
2. Demonstrated with one specific feature
3. Confirmed at the end ("So we showed you how...")

Cut everything that doesn't support one of the three claims. This is the
structural backbone — three acts, each act = one of the three claims.

### Tell-Show-Tell (corpus, sharper than the book)
Per-beat narration discipline:
- **Tell** — set up what you're about to show ("here's the problem this solves")
- **Show** — what to click, what to demonstrate
- **Tell** — verbal callout: what just happened in business terms ("the system
  did X automatically — that normally takes your team 3 days")

The corpus surfaced this as the single sharpest fix for the "no business
outcome" sin. Reps show something powerful and then just click to the next
screen; the callout is where the value gets booked. We adopted Tell-Show-Tell
as the per-beat scaffold inside each act.

### Inception Hack
Involve the prospect in building / configuring something specific to their
situation during the demo itself. Increases ownership of the outcome. Optional
in our template (flagged as a tactic in the rules-of-engagement block, not a
required scene) because it depends heavily on product type.

### Rules of Demo Engagement
- Ask permission before transitioning ("Is it OK if I show you how X works?")
- Pause and check in after each major section
- Handle confusion immediately
- Make silence comfortable
- Control screen transitions (no setup screens, no loading screens, no
  unrelated features)

### Demo discipline (time + customization)
- Time discipline — keep it tight, don't run over
- Audience customization — the same demo for CFO + ops manager fails. Different
  callouts, different metrics, sometimes different scenes

## What Sales Pitch establishes (boundary)

The demo is **inside** the sales pitch, not the whole pitch. In Dunford's
8-step storyboard, the demo sits at **Step 5 (Differentiated Value) / Step 6
(Proof)**. It is the moment where the narrative stops being words and becomes
evidence.

Critical implication: the demo script does NOT need to do Insight, Old Game,
New Game, or Ask. Those belong to the talk track / pitch deck. The demo script
inherits the pitch's setup and delivers the proof. If the rep skips the setup
and opens with screen-share, the buyer has no frame and every feature looks
like a feature instead of a solution.

This shaped the boundary calls:
- The demo script is the **narrated walk-through**, not the whole pitch
- Prerequisite input: the sales pitch deck (artifact 19) and talk track
  (artifact 21) define the pitch arc; the demo script slots into Step 5/6
- Audience: champion + technical evaluator + sometimes economic buyer (per
  the user's brief)

---

## Corpus research (amplification)

Top citations from the synthesized RAG response (10 chunks; query saved at
`20-demo-script.json`):

1. **Efti, Product Demos that Sell** (book p.33) — book canon echo
2. **Dunford, Sales Pitch** (p.31, p.78, p.116, p.129) — repeated reinforcement
   that demo lives at Differentiated Value / Proof, not as the opening
3. **PMA — "Tips for hosting live demos"** — practitioner tactics
4. **Michael Robin Hansen / PMA — "Scripted demos are killing your deals"**
   (two sections: "Build a storytelling framework" + "How to keep demos
   structured yet authentic") — net-new contribution: the storytelling
   formula (real-world problem → social proof from a buyer like this →
   show exactly how they solved it). Cites a cybersecurity case where
   demo-to-close jumped 25% in 3 months
5. **Maja Voje — Go-To-Market Strategist** (p.291) — adjacent context
6. **Wes Bush — State of B2B SaaS 2025 (productled.com)** — adjacent
   ("self-service gap")

### What the corpus added beyond the books
- **Tell-Show-Tell scaffold.** Sharper than Macro-to-Micro alone. Adopted as
  the per-beat structure.
- **The storytelling formula.** Real-world problem (spoken aloud) → social
  proof from someone who looks like the buyer → show exactly how they solved
  it. Adopted as the spine of the Big Bang Opening prompt.
- **The buyer's silent question.** "Has someone like me done this before, and
  did it actually work?" Adopted as a system-prompt voice rule.
- **Audience-specific callouts.** Same scene, different verbal callouts for
  CFO vs ops manager vs technical evaluator. Adopted as a per-beat prompt.
- **The deeper principle (worth keeping).** "Buyers don't buy products. They
  buy a version of the future where their problem is gone." Used as the
  framing line in the system prompt.

### Where they merged
- Big Bang Opening (Efti) + storytelling formula (corpus) merged into the
  Act 1 / Scene 1 prompt. Efti gives the structure; the corpus sharpens the
  proof component (social proof from a lookalike buyer).
- Tell-Show-Tell (corpus) + Macro-to-Micro (Efti) compose: Macro-to-Micro is
  the demo arc shape; Tell-Show-Tell is the per-beat narration discipline
  inside each scene.

### Where they could have disagreed (no real conflict)
- Three-Point Rule (Efti, hard "exactly three") vs. corpus practitioner
  blogs that float "two to four claims". **Winner: Efti.** Three is locked
  in the skeleton (three acts), same enforcement logic as Punchy's three
  benefits in the messaging framework.
- Demo length. Efti implies tight (cite cognitive load). Corpus aligns. We
  set a soft 20-minute target with explicit "cut, don't add" guidance.

### Corpus gap
- Citation 1 surfaced as `Efti, p.33` — page reference present, section title
  null. Not blocking. Logged informally; not adding to corpus-gaps.md
  separately (book canon was already authoritative for this artifact).

---

## Template design decisions

**Authority hierarchy:** Efti drives structure. Dunford defines the boundary
(demo lives at Proof step). Corpus amplifies with Tell-Show-Tell, the
storytelling formula, and audience-specific callouts.

**Three acts, locked.** The skeleton renders exactly three acts (one per
core claim). Three-Point Rule is structurally enforced, same pattern as
the messaging-framework's three-benefit lock.

**Per-scene format = Tell / Show / Callout.** Inside each scene the model
fills three bracketed prompts:
- *Tell (the setup)* — what we're about to show, framed as the buyer's pain
- *Show (what to click)* — exact clicks / data / screens
- *Tell (the business-outcome callout)* — the verbal line the rep says after
  the show, naming the business outcome in the buyer's metric

This is the structural fix for Sin #2 (features not pain) + Sin #6 (no
business outcome). The model cannot draft a feature-led scene without
violating the structure. Same enforcement pattern as the messaging
framework's V/B/F nesting.

**Pre-work as Step 0.** Three pre-work blocks: Discovery summary (the five
Discovery answers), audience map (who's in the room + what each cares about),
and Feature/Need Matrix (which 3 claims, which features, what to cut).
Skipping pre-work is Sin #1.

**Big Bang Opening as a dedicated act.** Act 1 is structurally separated as
the opening, distinct from the three claim-acts. This makes the "do not save
the best for last" rule visually unambiguous.

**Audience-specific callouts.** Each scene has a "callout variants" line —
how the same scene narrates differently for the technical evaluator vs the
champion vs the economic buyer. Suppresses Sin #5.

**The Ask is in scope.** Even though the demo lives inside a larger pitch,
ending the demo on "any questions?" is Sin #7. The template includes a
specific Demo Close block that hands back to the larger pitch's Ask, not a
passive question.

**Time budget per act.** Each act has a target minute count (sums to the
demo total). Discipline as a structural element, not a footnote.

**No screenshots / mockups in the artifact.** The script is text. Visual
assets belong to a separate demo recording / loom-style asset.

---

## Section-to-source map

| Template section | Source |
|---|---|
| Pre-work: Discovery summary | Efti (Demo Discovery) |
| Pre-work: Audience map | Efti (Sin #5) + corpus (audience-specific callouts) |
| Pre-work: Feature/Need Matrix + Three Claims | Efti (Feature/Need Matrix + Three-Point Rule) |
| Act 1: Big Bang Opening (3 scenes: Pain / Before / Reveal) | Efti (Big Bang Opening) + corpus (storytelling formula — lookalike proof) |
| Acts 2 / 3 / 4: One per claim, Macro→Workflow→Feature scenes, Tell-Show-Tell per scene | Efti (Macro-to-Micro + Three-Point Rule) + corpus (Tell-Show-Tell) |
| Audience-specific callout variants per scene | Corpus (PMA practitioner blogs) |
| Rules of engagement block | Efti (Rules of Demo Engagement) |
| Demo Close (hand back to the pitch's Ask) | Efti (no "any questions?") + Dunford (Step 8: Ask is in the pitch, not the demo) |
| Time discipline / target minute counts | Efti (time discipline) |

## Sections excluded

- Insight / Old Game / New Game / Promised Land — those are pitch-deck
  (artifact 19) and talk-track (artifact 21) territory, not demo
- Objection handling — separate artifact (22)
- Discovery questions in detail — separate artifact (23); we only ingest
  Discovery *outputs* as pre-work
- Customer story long-form — that's the case-study artifact (37); we cite
  one lookalike proof per Big Bang Opening but don't render the full story
- Pricing / commercial slide — pitch deck, not demo
- Screenshots / loom recordings — out of scope; this is a script, not assets

## System prompt failure modes (negative guidance)

The seven sins, sharpened with corpus failure modes, distilled to 8:

1. **Feature dump** — completeness theater
2. **Features-first** — opening with capability before pain
3. **No narrative spine** — feature tour the buyer can't see themselves in
4. **No business-outcome callout** — showing something powerful then clicking
   away. Tell-Show-Tell breaks here
5. **Same demo for every audience** — CFO + ops manager + technical evaluator
   getting the same callouts
6. **Not real for THIS buyer** — generic demo data, generic industry
7. **Passive close** — "any questions?" instead of handing to the pitch's Ask
8. **Saving the best for last** — opening on the login screen / dashboard tour

Voice rule: Reference frameworks implicitly. Do not name authors in output.
The line "buyers don't buy products; they buy a version of the future where
their problem is gone" is a corpus-surfaced framing line and goes into the
system prompt as the demo's job-to-be-done.

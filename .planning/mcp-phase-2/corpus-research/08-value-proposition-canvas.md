# Research — Value Proposition Canvas

## Canonical sources (read FIRST)

- **Strategyzer — Value Proposition Canvas** (corpus-grade canon; no Book Brain card exists, so we treat the canvas as authoritative when it surfaces with Strategyzer attribution per Tier-2 rules). The canvas is the *structural skeleton*: 6 components, customer profile ↔ value map, with explicit fit/no-fit testing.
- **Hormozi — $100M Offers** (Book Brain card read in full)
  - Card: `~/Documents/AbhishekR/Book Brain/Hormozi - 100M Offers.md`
  - The Value Equation is the *quantitative complement* to the canvas: `(Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)`.

These two sources merge cleanly — they answer different questions and don't conflict on any structural decision (see "Where they merged" below).

## What Strategyzer's canvas establishes

### The 6 components (3 + 3, with explicit mapping)

**Customer profile (right side):**
1. **Customer Jobs** — what the customer is trying to accomplish: functional ("manage my team's projects"), social ("look competent in front of my CEO"), and emotional ("feel less anxious going into Monday standup"). All three drive decisions.
2. **Pains** — frustrations, risks, and obstacles that get in the way of doing the job. **Crucially: not the absence of your product.** "Lack of a unified platform" is a solution description in disguise; the real pain is "I spend 45 minutes before every board meeting reconciling numbers from three tools and I'm still not confident they're right."
3. **Gains** — desired outcomes and benefits beyond just completing the job: positive emotions, status, ambition. Gains are **not simply the opposite of pains** — they live above the line.

**Value map (left side):**
4. **Products & Services** — what you actually offer.
5. **Pain Relievers** — how your offering reduces *specific* pains. One-to-one mapping to the pains list.
6. **Gain Creators** — how your offering produces the gains customers want. Mapped explicitly to the gains list.

### The fit test
Fit happens when left maps to right. **Draw the lines.** Where there are no lines, you have gaps. Where two lines converge on one item, that's your differentiation density. Where three pain relievers map to nothing, you have feature inventory pretending to be value.

### Three named failure modes (corpus-derived, distilled from Strategyzer + practitioner amplification)
- **Features-as-gain-creators** — "Real-time dashboard" is not a gain creator. "You walk into the Monday standup already knowing what broke over the weekend" is. Test: can you draw a line from this item to a specific *outcome* on the customer profile? If the line goes to a roadmap feature instead, you've slipped into feature listing.
- **Pains-as-not-having-the-product** — defining pains as the absence of your solution preempts the emotional and situational texture that makes messaging resonate. Pains describe friction that exists **today in the world**, not in a hypothetical world where your product doesn't exist yet.
- **Vague jobs** — "manage operations more efficiently" is a category, not a job. A real job is specific enough that you can imagine watching someone do it: "prioritize which support tickets get escalated before the VP of CS sees the queue."

## What Hormozi's Value Equation contributes

### The four variables
- **Dream Outcome** — the result the buyer actually wants (not the feature you ship)
- **Perceived Likelihood of Achievement** — will they believe it works? Do they trust you to deliver?
- **Time to Result** — how long before they feel the win?
- **Effort & Sacrifice** — what do they have to give up or endure to get there?

The equation: value goes up when **Dream Outcome** and **Likelihood** go up. Value goes up when **Time** and **Effort** go down.

### Why it's not a substitute for the canvas
The canvas tells you *what* to map. The Value Equation tells you *how much* the mapping is worth. Two products mapping to the same gain — "reduces anxiety" — are valued radically differently if one delivers in a week with no friction and the other takes six months of painful implementation. Same dream outcome, wildly different Time and Effort.

### Where it slots into the canvas
Per-gain (and per-pain-reliever), score the four variables. This is what turns a checklist into a value proposition with weights — surfacing which gain creators are over-weighted and which are under-served. Without this scoring overlay, the canvas can render as a flat 3×3 grid where every line looks equal.

---

## Corpus research (amplification)

The corpus query (`08-value-proposition-canvas.json`) returned 10 citations, dominated by:
- **Jobs To Be Done Playbook** (Kalbach) — pp. 107, 108, 109, 231 — used in artifact 05 / 06 already; here it reinforces the "vague jobs" failure mode and the functional/social/emotional triad
- **The Go To Market Strategist** p. 339 — adjacent (value-prop placement in GTM brief), not pulled into this artifact
- **Punchy** p. 23 — outside-in framing, reinforces "pains are real friction, not solution-shaped"
- **Hormozi — $100M Offers** p. 70 — the Value Equation, direct quote of the four variables
- **Strategyzer canvas** — surfaced in synthesized RAG response with full structural fidelity (no broken metadata this time)

### What the corpus added beyond Strategyzer + Hormozi
- **Per-statement test for gain-creators** — "draw the line from this item to a specific gain; if the line lands on your roadmap, it's a feature, not a gain creator." Sharper as a per-line filter than Strategyzer's general "fit" notion. Adopted into the system prompt.
- **The "world today" vs. "world without your product" frame** — the cleanest articulation of the pains-as-absence failure. Adopted as a closing diagnostic in the template.
- **Functional/social/emotional triad** — Strategyzer mentions all three; Kalbach and the corpus stress that *missing the social/emotional jobs* is what makes B2B value props read as ROI calculators. Adopted into the Jobs prompt.

### Where the corpus reinforced rather than added
- "Gains ≠ opposite of pains" — both Strategyzer and corpus state this; doubling-down is healthy but no net-new content.
- One-to-one mapping discipline — Strategyzer canon, corpus echoes.

### Notable corpus gap
Strategyzer surfaced as part of the synthesized response but the citation list shows no Strategyzer book entry — the canvas content was inferred from blog/practitioner chunks rather than ingested from `Value Proposition Design`. Logged for `corpus-gaps.md` if a Strategyzer book ingest hasn't happened yet.

---

## Template design decisions

**Authority hierarchy:** Strategyzer drives the *structural skeleton* (6 components, customer profile / value map, fit testing). Hormozi's Value Equation is *layered on as a per-component scoring overlay*, not as a replacement structure. The corpus contributes per-line failure-mode tests and language sharpeners.

**Skeleton order = Strategyzer order, customer-side first.** Jobs → Pains → Gains → Products & Services → Pain Relievers → Gain Creators. Strategyzer is firm: customer profile is filled in before the value map. Drafting value-map-first produces solution-shaped pains and feature-shaped gain creators.

**Value Equation as a scoring overlay, not its own section.** Hormozi's four variables are embedded inside Pain Relievers and Gain Creators as a per-line scoring prompt — the user rates Dream Outcome / Likelihood / Time / Effort on each mapped pair. This forces the user to identify which mappings carry weight vs. which are filler. A standalone "Value Equation" section would imply it's parallel to the canvas; it's not — it's a multiplier on canvas fit.

**Fit-test as the closing section.** The user must literally annotate the line-drawing: which pains have no reliever, which gain creators have no gain, which mappings are 1:1 strong vs. 1:many weak. This is what differentiates a completed canvas from a 6-bullet list pretending to be one.

**Boundary discipline (per artifact-book-map row 08):**
- This is **not** positioning's "Differentiated Value" (artifact 01) — that's company-level value themes. This is buyer-job-level fit.
- This **feeds** messaging (02) — the Gain Creators with high Value-Equation scores become the seeds for the three Benefits in the messaging stack.
- This **feeds** landing page copy (35) — Hormozi's Value Equation is also a primary source there; the landing page renders the highest-scoring gain creators as hero copy.
- Customer profile side **overlaps** with buyer persona (05). To keep the two artifacts distinct: persona owns the human profile (firmographics, day-in-the-life, watering holes, decision criteria); the canvas owns the *value-fit* slice (jobs/pains/gains, narrowed to the buyer's relationship with this product). The template explicitly prompts the user to inherit the persona's job statement if a buyer_persona artifact exists, rather than re-doing persona work.

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work: champion buyer | Strategyzer (one persona per canvas) + composition with buyer_persona artifact | Drafting a canvas for "everyone" produces nothing. One champion per canvas. |
| Customer Jobs | Strategyzer; corpus reinforced functional/social/emotional triad | Jobs anchor the whole right side. Without specific jobs, pains and gains drift. |
| Pains | Strategyzer; corpus added "world today vs. world without product" test | The most-failed component — users default to writing pains as solution gaps. |
| Gains | Strategyzer; corpus reinforced "not opposite of pains" | Gains live above the line — outcomes the buyer would chase even if no pains existed. |
| Products & Services | Strategyzer (light section) | Inventory, not analysis. One bullet per offer. |
| Pain Relievers (with Value Equation scoring) | Strategyzer + Hormozi | One-to-one mapping; per-line score on Outcome / Likelihood / Time / Effort. |
| Gain Creators (with Value Equation scoring) | Strategyzer + Hormozi | Same scoring overlay. The competitor-verbatim test sharpens "is this a gain creator or a feature?" |
| Fit test | Strategyzer | The line-drawing exercise. What a finished canvas actually looks like. |

## Sections excluded

- **Standalone "Value Equation" block** — embedded inline, not parallel
- **Pricing / willingness-to-pay** — Hormozi's Value Equation can support pricing but that's pricing_page_copy / Monetizing Innovation territory (artifact 39)
- **Persona empathy maps / day-in-the-life** — buyer_persona artifact (05)
- **Competitive matrix / battlecard content** — separate artifacts (16, 17)
- **Differentiated Value themes** — that's positioning_statement (01), upstream of this

## System-prompt failure modes (negative guidance)

From Strategyzer + corpus + Hormozi, distilled to 6:

1. **Features-as-gain-creators** — "Real-time dashboard" / "AI-powered insights" / "single source of truth" are features. The line must terminate on an outcome in the buyer's life.
2. **Pains-as-not-having-the-product** — "lack of a unified platform" is a solution description. Re-write every pain as friction that exists today in the world, regardless of whether your product exists.
3. **Vague jobs** — "manage operations more efficiently" is a category. Specify the job until you can imagine watching someone do it.
4. **Gains as inverted pains** — if every gain is just the negation of a pain, the gains list is hollow. Gains are aspirational outcomes the buyer would chase even if the pains were already handled.
5. **One-to-many sloppiness** — listing 8 pains and 2 pain relievers and calling it fit. Either each pain has a specific reliever, or you've identified a gap. Both are useful; conflating the two is not.
6. **Skipping the Value Equation scoring** — without per-line Outcome / Likelihood / Time / Effort scores, the canvas reads as a flat checklist where every mapped pair looks equal. The scoring is what produces the prioritization needed for downstream messaging.

Voice rule: reference Strategyzer / Hormozi implicitly. Do not name-drop in the output.

---

## Open questions for audit

- **Value Equation scoring granularity** — should the template prompt for numeric scores (1–5 on each of the four variables) or qualitative ("high/low + why")? Current choice: qualitative + a one-line rationale, because numeric scores in a template feel false-precise for an early-draft document. Open for revision.
- **Customer profile overlap with persona** — current handling is "inherit if persona exists, else fill in tight." Strict alternative: refuse to render Jobs/Pains/Gains unless a buyer_persona artifact ID is passed. Friction trade-off; current choice is permissive. Open for your call.
- **Should "Products & Services" be excluded entirely?** Strategyzer keeps it; in B2B SaaS practice it's usually one bullet ("the platform"). Argument to drop: it's filler. Argument to keep: forces the user to decide *what* they're mapping (full platform vs. one module). Kept for now.
- **Corpus gap** — Strategyzer's `Value Proposition Design` book may not be ingested. The synthesized RAG response carried Strategyzer fidelity but no direct citation surfaced. Worth checking the next ingestion sweep.

# Research — Positioning Statement (revised)

## Canonical sources (read FIRST)

- **Dunford - Obviously Awesome v2** (2026 ed.) — primary structural source
  - Card: `~/Documents/AbhishekR/Book Brain/Dunford - Obviously Awesome v2.md`
- **Dunford - Sales Pitch** — validation mechanism (positioning passes the test only if you can write a sales pitch from it)
- **Moore - Crossing the Chasm** — early-market case (mentioned but not primary)
- **Ries - Play Bigger** — category creation case (when you're inventing the category, not entering one)

## What the v2 book card establishes

### The 5 components (2026 nomenclature)
1. **Competitive Alternatives** — what customers would do if your product didn't exist (real alternatives: spreadsheets, internal builds, doing nothing — not perceived competition)
2. **Distinct Capabilities** — features and capabilities the alternatives lack. Renamed from "Unique Attributes" (v1)
3. **Differentiated Value** — the *business benefit* those capabilities enable. NOT all the value; specifically the value only you can deliver. Aim for 1-3 themes max. This is the core of messaging. Renamed from "Value Themes" (v1)
4. **Best-Fit Accounts** — *characteristics of companies* that care most. Buy quickly, don't ask for discounts, intuitively understand value, refer others. Renamed from "Target Market Characteristics" (v1)
5. **Market Category** — the competitive context that primes buyer assumptions. Choose a category where your strengths are *expected norms*, not differentiators

### Pre-work (4 decisions BEFORE the exercise)
1. **Timing readiness** — enough happy customers to see patterns? If not: loose positioning until you do
2. **What you're positioning** — product / multi-product / platform / company
3. **Champion persona** — which buyer leads the deal and recommends to economic buyer? **Position for THEM only.** Handle other stakeholders via objection responses
4. **Exclude bad-fit accounts** — remove outliers from the exercise; position for the best-fit pattern, not the biggest/weirdest customer

### Multi-product positioning options (new in v2)
- Cascading (company = sum of products)
- Lead product model (sell one first, others as add-ons — early Salesforce)
- Product family / platform (suite, any order)
- Segment-specific (different buyer types — rare)

### Two traps (consistent v1 → v2)
- **Built ≠ intended** — cake-pop positioned as a lollipop because you set out to build a cake
- **Market shifted around you** — diet muffin → gluten-free Mediterranean snack era

### Dunford's CRITIQUE of the proof sentence (v2 sharper)
The traditional "For [target] who [need], our [offering] is a [category] that [benefit], unlike [competitor] which [alternative benefit]" template **fails** because:
- Assumes you already know the answers — reinforces status quo
- Doesn't reveal better positioning options
- Nobody uses the output
- Impossible to memorize

**Validation mechanism per v2:** the *sales pitch* (per the Sales Pitch book). If you can build an 8-step sales narrative from this positioning that lands the differentiated value with your champion in 90 seconds, the positioning works.

---

## Corpus research (amplification only)

Top 10 citations from query "What are the essential sections of a strong B2B SaaS positioning statement, and what makes each section work? What are the most common positioning failure modes?":

- April Dunford — Sales Pitch p.129; substack "Why positioning fails to make the page"
- Geoffrey Moore — Crossing the Chasm p.142
- Stevie Langford / PMA — 3 articles ("What is B2B Messaging" — pitfalls + framework)
- Wes Bush / productled.com — recovery from bad positioning
- PMA — Salesforce brand-messaging example, customer-centric SaaS

**Notable corpus gap:** Obviously Awesome surfaced as `[book] ? p.129` — broken metadata, no author/title/url. Logged in `corpus-gaps.md`. The synthesis defaulted to PMA-blog interpretations of positioning (which use the conventional "For X who Y" template — exactly the formula Dunford v2 critiques).

**What the corpus added beyond the book:**
- B2B-specific examples (Salesforce, mid-market ops phrasing)
- "Multi-stakeholder reality" framing — but this CONTRADICTS Dunford v2's "champion persona only" guidance, so we follow Dunford
- "Why now" trends — a PMA pattern, NOT in Dunford's 5; we drop it
- Recovery / re-positioning patterns — kept as a system-prompt failure mode

---

## Template design decisions (revised)

**Authority hierarchy:** Dunford v2 framework drives structure. Sales Pitch validates. Corpus amplifies with B2B specifics where it doesn't contradict.

**5 components, not 6.** Drop "Why now / relevant trends" — corpus pattern, not in Dunford. Including it diluted the framework.

**Use 2026 nomenclature.** "Distinct Capabilities" not "Unique Attributes." "Differentiated Value" not "Value Themes." "Best-Fit Accounts" not "Target Customer." This is the current canon and customer-facing PMM teams in 2026 are using these names.

**Add the pre-work section as Step 0.** v2 explicitly separates pre-work from the 5-step process. Skipping pre-work is the first failure mode.

**Champion persona section, not multi-stakeholder.** v2 is direct: position for ONE champion. The corpus disagreement here is a clear case where the book wins.

**Drop the "For X who Y..." sentence.** Replace with the **Sales pitch test** as validation: "Can you build an 8-step sales narrative (Sales Pitch ch. 1) from this positioning that lands the differentiated value with your champion in 90 seconds?"

**Add multi-product flag.** If positioning multi-product / platform / family, the template prompts the user to choose one of v2's four options before drafting. Otherwise this flag is a no-op.

**Two traps as system prompt failure modes** (not template sections). The traps shape what to avoid; they aren't artifact deliverables.

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work checklist | Dunford v2 (new) | Explicit decisions before drafting. Skipping these = vague positioning. |
| Competitive Alternatives | Dunford v1+v2 (unchanged) | Foundational. Differentiation is meaningless without an alternative. |
| Distinct Capabilities | Dunford v2 | Renamed from v1. Filters out roadmap-as-differentiator. |
| Differentiated Value | Dunford v2 | Renamed from v1. The "so what?" — corpus failure mode #1 (attribute soup). 1-3 themes max. |
| Best-Fit Accounts | Dunford v2 | Renamed from v1. Company-level characteristics + champion persona. |
| Market Category | Dunford v1+v2 (unchanged) | Strategic frame; sets buyer expectations. Corpus failure mode #2 (category confusion). |
| Sales pitch test | Dunford v2 + Sales Pitch | The validation mechanism. Replaces the critiqued sentence formula. |

## Sections excluded

- "For [target] who [need]..." sentence — Dunford v2 critiques explicitly
- "Why now / relevant trends" — PMA pattern, not in Dunford
- Proof points / customer logos — belong to messaging framework + case study
- Detailed buyer persona — separate `buyer_persona` template
- Mission statement / brand values — different artifact

## System prompt failure modes (negative guidance)

From book + corpus, distilled to 5:
1. **Inside-out language** — describing what you built vs. what the buyer needs
2. **Generic differentiators** — "easy to use," "enterprise-grade" — anything a competitor could lift
3. **Vague Best-Fit definition** — demographics instead of psychographic + situational specificity
4. **Trap 1: Cake-as-lollipop** — positioning what you intended, not what you actually built
5. **Trap 2: Market shifted around you** — the world changed, the positioning didn't

Voice rule: Reference Dunford / Moore / Ries implicitly. Do not name-drop authors in the output.

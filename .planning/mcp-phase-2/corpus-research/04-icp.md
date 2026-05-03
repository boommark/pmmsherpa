# Research — ICP (Ideal Customer Profile)

## Canonical sources (read FIRST)

- **Dunford — Obviously Awesome v2** (2026 ed.) — primary structural source for company-level Best-Fit Accounts
  - Card: `~/Documents/AbhishekR/Book Brain/Dunford - Obviously Awesome v2.md`
- **Hormozi — $100M Offers** — market selection lens (the 4 conditions for a great market). Validates that the ICP framework is upstream of offer/value-equation work.
  - Card: `~/Documents/AbhishekR/Book Brain/Hormozi - 100M Offers.md`

## What the v2 book card establishes (Best-Fit Accounts at full fidelity)

Dunford v2 Step 4 — "Best-Fit Accounts" — defines this as **characteristics of companies** (not people, not segments) that care most about your differentiated value. Four observable behaviors signal a best-fit account:

1. **Buys quickly** — short cycles, low friction
2. **Doesn't ask for discounts** — accepts pricing as priced
3. **Intuitively understands the value** — no heavy education or proof burden
4. **Refers others** — acts as a word-of-mouth multiplier

Dunford specifically calls out **acute pain + budget + reachability** as the qualifying floor (Step 4). Best-fit characteristics span: **industry, size, role, trigger events**. The exercise excludes outliers — biggest/weirdest customers — so the pattern isn't distorted by exceptions.

## What Hormozi adds — market selection (4 conditions)

Hormozi's Market Selection Framework: offer quality matters less than market fit. A Grand Slam Offer to the wrong market falls flat. Evaluate any market by:

1. **Massive pain** — urgency of the problem the buyer feels
2. **Purchasing power** — can they actually pay
3. **Easy to target** — can you reach them via a definable channel/list
4. **Growing market** — tailwinds, not headwinds

This is the **upstream filter** that sits *above* Best-Fit Accounts. Dunford tells you which **companies** within a chosen market are best-fit; Hormozi tells you whether the **market itself** is worth pursuing. Together they answer "where to fish" + "which fish to keep."

## Corpus citations (top 10)

From query "What defines an ICP for B2B SaaS? What firmographic, psychographic, and behavioral signals identify best-fit accounts? How do you exclude bad-fit segments? What's the difference between TAM, SAM, SOM, and ICP, and how does ICP relate to buyer persona?":

1. Samantha Rideout / PMA — "6 steps to define your ICP" (TAM-to-ICP funnel)
2. The Go To Market Strategist — p.291 (book, author metadata broken)
3. Neil Patel — B2B marketing guide ("Know Your Ideal Customer (ICP)")
4. Sharon Markowitz — Sharebird AMA
5. PMA — "How to determine your Ideal Customer Profile"
6. `[book] ? p.67` — broken metadata, likely Dunford or Hormozi (logged in corpus-gaps.md #2)
7. PMA — "How target audience, ICP, and personas guide PMM strategies" (Layer 2: ICP — who should buy?)
8. PMA — "How PMM skills can future-proof your content career" (Develop your ICP)
9. Devon O'Rourke / PMA — "Build an effective, repeatable GTM process" (ICP and persona development)
10. Lenny Rachitsky — podcast (PM)

### What corpus added beyond the books

- **Three signal layers** — firmographic / psychographic / behavioral. Dunford lists "industry, size, role, trigger events" but doesn't cleanly carve psychographic from behavioral. The corpus's 3-layer split is sharper for B2B SaaS practitioners and we adopt it.
- **Lenny Rachitsky's pain / budget / authority / timing pattern** — overlaps with Dunford's "acute pain + budget + reachability" floor. We merge: pain + budget + authority + timing (PBAT) becomes the qualifying floor.
- **TAM → SAM → SOM → ICP funnel** — useful framing for distinguishing market sizing (TAM/SAM/SOM) from a quality filter (ICP). Neither Dunford nor Hormozi cover this explicitly. We include it as orientation, not as a deliverable section.
- **Bad-fit exclusion patterns specific to B2B SaaS:** company too early (no budget/process/champion); company too large (you become a rounding error); wrong buying motion (PLG vs. enterprise procurement); misaligned success metrics. We pull this in directly — Dunford says "exclude outliers" but doesn't give B2B-specific exclusion patterns.
- **In-market behavioral signals** — hiring patterns, content consumption, competitive displacement, PLG product-usage signals. Strongest practitioner amplification of Dunford's "trigger events" — we adopt it.

### Where corpus and book diverge — and who wins

- **Conflict 1: persona inside ICP?** Several PMA blogs blur ICP and buyer persona into one document. Dunford v2 is direct: position for ONE champion, but Best-Fit is **company-level**. Persona is a separate exercise. **Book wins.** ICP template stays company-level. Persona work goes to artifact 05.
- **Conflict 2: ICP as targeting list vs. prioritization philosophy?** Corpus framing leans toward "ICP is a prioritization decision-making framework." This is compatible with Dunford ("buy quickly, don't grind on discounts" is a prioritization signal, not a list). **Merge** — we treat ICP as both: a quality filter that produces a target list AND a weekly decision-making lens for messaging/roadmap/sales qualification.
- **Conflict 3: 4 market conditions before or after Best-Fit?** Hormozi lives upstream of Dunford — market selection precedes account selection. **Sequence:** Market Conditions → Best-Fit Account Profile → Exclusion Criteria. The template orders sections this way.

## Boundary clarity — ICP vs. positioning's Best-Fit Accounts vs. buyer persona

This is the most important reconciliation in this artifact. Three documents overlap conceptually; here's how we cut it:

| Document | Altitude | Output | Length |
|---|---|---|---|
| Positioning's Best-Fit Accounts (artifact 01) | Compressed signal | 4-5 lines inside the positioning doc | Bullet-tight |
| ICP (artifact 04) | Standalone, full fidelity | Market conditions + firmographic + psychographic + behavioral + exclusions + qualifying floor + sourcing/operationalization | Full deliverable |
| Buyer persona (artifact 05) | People inside the account | Champion / economic buyer / blocker — roles, JTBD, objections, info sources, decision authority | Full deliverable per persona |

**Mental model:** Positioning's Best-Fit Accounts is the **headline**. ICP is the **full article**. Buyer persona is the **interview with the people in the article**.

Practical rule encoded in both templates: positioning's Best-Fit Accounts should be derivable from the full ICP doc by extracting the 4 Dunford signals (buy quickly, no discount-grinding, intuitive value, refer others) plus the 1-2 most predictive trigger events. The ICP doc adds market conditions (Hormozi), psychographic depth, behavioral signals, exclusion criteria, qualifying floor (PBAT), and operational signals — none of which fit in the positioning doc.

## Template design decisions

**1. Two-layer structure.** Hormozi market selection layer ABOVE Dunford best-fit account layer. Without "is this market worth fishing in?" first, the rest is busywork.

**2. Three-signal taxonomy.** Firmographic / psychographic / behavioral as three named subsections under Best-Fit Profile. This is corpus phrasing the books don't have but practitioners universally use; it doesn't contradict Dunford.

**3. Explicit exclusion criteria section.** Dunford says "exclude outliers"; we make it a deliverable section. Bad-fit pattern (slow close, discount-grinding, customization, support load, no references) becomes a checklist.

**4. Qualifying floor (PBAT) as a separate section.** Pain + Budget + Authority + Timing — the minimum for an account to even enter consideration. Drawn from Dunford's "acute pain + budget + reachability" merged with Lenny Rachitsky's PBAT pattern.

**5. Best-Fit signals borrow Dunford's 4 behaviors verbatim** — buy quickly, don't ask for discounts, intuitively understand value, refer others. These are the v2-specific language. Subsumes "the cake-pop / lollipop trap" implicitly.

**6. Trigger events / in-market signals** as a named section. Dunford lists "trigger events" inside Step 4; corpus expanded this to hiring patterns, content consumption, competitive displacement, product usage. Combined.

**7. Operationalization section** — list-build sources, scoring, weekly decision use. Corpus framing ("a decision-making framework you can use every week"). Without operationalization, ICP becomes a doc nobody references.

**8. NOT included:** detailed buyer persona work (→ artifact 05), TAM/SAM/SOM market sizing math (orientation only, not a deliverable), JTBD framing (→ artifacts 05 & 06), value equation construction (→ artifact 08).

## Section-by-section rationale

| Section | Source | Why |
|---|---|---|
| Pre-work | Dunford v2 (pre-work) + practitioner | Same discipline as positioning: timing, customer-data readiness, exclusion of outliers before drafting. |
| Market conditions (4) | Hormozi 100M Offers | Upstream filter. Without massive pain + purchasing power + easy to target + growing market, ICP work is waste. |
| Firmographic profile | Corpus (PMA, Sharebird) + Dunford ("industry, size") | Company-shape attributes — the easy/observable layer. |
| Psychographic profile | Corpus (Samantha Rideout, Lenny) | Beliefs, prior attempts, ROI vs. vision orientation. The "tried and failed before" signal is the most predictive. |
| Behavioral signals / in-market triggers | Corpus + Dunford ("trigger events") | Hiring, content, competitive churn, product usage. The most predictive AND most underused. |
| Best-fit signals (the 4 Dunford behaviors) | Dunford v2 Step 4 | Buy quickly / no discount / intuitive value / refer others. Verbatim. |
| Qualifying floor (PBAT) | Dunford ("acute pain + budget + reachability") merged with Lenny | Minimum bar to even consider. |
| Exclusion criteria | Dunford ("exclude outliers") + corpus B2B patterns | Bad-fit pattern made explicit and operational. |
| Operationalization | Corpus | Sources, scoring, weekly use — turns the doc into a tool. |

## Sections excluded

- Detailed buyer persona inside ICP — separate `buyer_persona` artifact
- TAM/SAM/SOM market sizing math — orientation only, not a deliverable here
- Value equation construction — `value_proposition_canvas` artifact
- JTBD job map — `buyer_journey_map` artifact
- Win/loss themes — `win_loss_insights_summary` artifact

## System prompt failure modes (negative guidance)

Distilled from books + corpus, plus the boundary work above:

1. **Conflating ICP with buyer persona** — describing humans inside the account (titles, JTBDs, objections) instead of the account itself. ICP is company-level.
2. **Demographics-only ICP** — "B2B SaaS, 100-500 employees, North America" without psychographic + behavioral specificity. Dunford's central critique of vague Best-Fit.
3. **No exclusion criteria** — ICP is a quality filter; without explicit bad-fit it's just a TAM doc.
4. **Skipping the market-conditions check** — drafting Best-Fit before validating the market is worth fishing in (Hormozi).
5. **No trigger events / behavioral signals** — leaves ICP unactionable for outbound and scoring.
6. **Targeting-list mindset** — treating ICP as a one-time list build instead of a weekly prioritization lens for messaging, roadmap, sales qualification.
7. **Best-fit dictated by biggest customer** — letting your largest/loudest customer define ICP when they're an outlier (Dunford's exclude-bad-fit pre-work).
8. **Cake-pop trap (inherited from positioning)** — describing the ICP you wish you had, not the one your happy customers actually represent.

Voice rule: Reference Dunford / Hormozi / Lenny implicitly. No author name-drops in template output.

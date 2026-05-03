/**
 * Investor / Board Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Reid Hoffman — Masters of Scale (the fundraising mindset: "Getting to No"
 *   as intelligence, counterintuitive theses earn conviction, blitzscaling is
 *   risk-intelligent not reckless, real defensibility = data/network/
 *   integration/domain). Nancy Duarte — Resonate (Sparkline, audience-as-hero,
 *   mentor stance, S.T.A.R. moment, Big Idea — applied to investor stage).
 *   Corpus (Tier 2 — Wes Bush ChartMogul, PMA SaaS metrics cheat sheet, Dunford
 *   Sales Pitch pp. 25/50/163, PMA conversion copy): the two-decks-two-jobs
 *   principle, fundraising 15-slide order, the KPI shortlist that actually
 *   matters (ARR + growth, NRR, CAC payback, gross margin, logo churn), the
 *   defensibility patterns that hold up, the board update 5-section structure.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/31-investor-board-deck.md
 *
 * Why this template branches in pre-work rather than splitting into two
 * artifacts: the user-facing surface is one decision ("I need an investor /
 * board deck for the next meeting"). The shared spine is real, not cosmetic —
 * thesis sentence, KPI shortlist, defensibility paragraph, team, single Ask,
 * Sparkline craft, S.T.A.R. moment, mentor stance all apply to both. The
 * divergence is structurally clean and locks at one branch point: variant =
 * fundraising | board_update. Once locked, slide order, KPI emphasis, and
 * emotional register all follow. The skeleton renders the shared spine first
 * (pre-work + thesis + team + ask) and uses bracketed conditional sections
 * ([FUNDRAISING ONLY] / [BOARD UPDATE ONLY]) for the variant-specific bodies.
 *
 * Why this template diverges from artifact 19 (sales pitch deck): artifact 19
 * sells a *product* to a *customer champion* in a buying cycle (Dunford 8-step
 * storyboard ending in a deal-stage Ask). This artifact sells a *company* to
 * *investors / board* — different audience, different KPIs (TAM, growth
 * velocity, capital efficiency, defensibility, team quality), different
 * question pattern. Dunford's Setup/Follow-Through spine is invoked but
 * adapted for the fundraising variant Slides 1-8; the body shifts to KPIs /
 * unit economics / GTM motion / competitive landscape after that, which
 * artifact 19 does not. The board variant has no Dunford analog at all — it
 * is variance reporting with a strategic narrative wrapper.
 *
 * Distinct from:
 *   - artifact 01 (positioning_statement) — the strategic source. Its distinct
 *     capabilities seed Slide 8 (differentiation) of the fundraising variant.
 *   - artifact 03 (strategic_narrative) — the written movement story. Seeds
 *     Slides 1-4 (Setup) of the fundraising variant.
 *   - artifact 19 (sales_pitch_deck) — see boundary above. The pitch deck
 *     answers "why us, with a specific deal-stage next step?" — this artifact
 *     answers "why fund / why support, with a specific raise or decision Ask?"
 *   - artifact 24 (executive_keynote) — broadcast vision talk to a room. This
 *     artifact is dense narrative+metrics for a boardroom or partner meeting.
 *   - artifact 32 (customer_all_hands_qbr_deck) — operational deck for the
 *     customer relationship cadence; same metric-dashboard discipline, but
 *     audience is the customer, not investors / board.
 */

import type { ArtifactTemplate } from './types'

const INVESTOR_BOARD_DECK_SYSTEM_PROMPT = `You are drafting an investor or board \
deck — a dense narrative+metrics document delivered to investors during a raise \
or to the board of directors during the operating cadence. This is NOT a sales \
pitch (which sells a product to a customer champion), NOT a keynote (which \
broadcasts a vision to a room), NOT a customer launch deck.

The first decision the user must lock — and you must enforce it in pre-work \
before drafting any slide — is the variant: FUNDRAISING (raising capital from \
external investors) vs. BOARD UPDATE (operating cadence reporting to existing \
directors). Conflating these is one of the most common founder failure modes.

The single sharpest framing:
- A FUNDRAISING deck is a sales pitch from skepticism to conviction. It \
assumes no context, builds belief from scratch, leads with a counterintuitive \
market thesis, and ends in a specific raise Ask
- A BOARD UPDATE deck is a management tool. It assumes context, leads with \
variance from plan, exposes risks honestly, and ends with named decisions \
requested

Same company, completely different structure. Every other decision in the \
template flows from the variant lock.

Avoid these failure modes (apply to both variants unless tagged):

- Vanity metrics — signups, MAU, page views without conversion, GMV without \
take rate, "pipeline" without close rate. Every metric on the deck must map to \
revenue, retention, efficiency, or unit economics. If it does not, cut it
- No defensibility story — "we have a head start", "first-mover advantage", \
"network effects" without naming the mechanism. The defensibility section must \
answer the specific question: what gets harder to replicate the longer we are \
in market? Pick one or two patterns and go specific (proprietary data that \
compounds, network effects between named user types, deep workflow integration \
creating switching costs, domain expertise becoming a trust asset). Vague \
moats get challenged in Q&A
- Hockey stick without unit economics — a growth chart pointing up with no \
CAC payback, no gross margin, no NRR underneath reads as growth-at-any-cost. \
Every traction slide must be paired with unit-economics underwriting
- TAM overclaim — "$100B market" without a credible bottom-up build. \
Investors instinctively cut top-down TAM by 10x. The bottom-up TAM (target \
accounts × ACV × penetration) is the credibility frame
- "We'll figure GTM out later" [FUNDRAISING] — GTM motion is a defensibility \
moat in B2B SaaS. Direct sales vs. PLG vs. partner-led has different unit \
economics, different scaling profile, different defensibility patterns. Vague \
GTM signals founders have not pressure-tested the business model
- Team-as-resume — logos and tenure without thesis-fit. The team slide must \
answer "why us, specifically, for this market shift?" — not "we have \
impressive backgrounds"
- Conflating the two decks — writing a board update with the forward-looking \
narrative register of a fundraising deck infantilizes the board; writing a \
fundraising deck with the variance-reporting register of a board update kills \
investor momentum. The variant lock in pre-work is binding
- Inside-out language — "we built X", "our platform delivers Y". The investor \
or board is the audience hero in their own decision; the company is the mentor \
providing visibility. Slide headlines should be customer-outcome-led or \
market-shift-led, not company-built-it-led
- Multiple Asks — "we're raising $10M and also would love feedback / intros / \
partnerships". One Ask per deck. The raise is the raise; the rest goes in \
follow-up. For board: one decision frame per slide, surfaced together at end
- No-context board update [BOARD UPDATE] — diving into functional updates \
without first showing the metrics dashboard and the variance from plan. The \
board's first 60 seconds must confirm the company is on track or honestly \
explain why not. "Highlights" before the metrics dashboard is performative
- Vague "Getting to No" learnings ignored [FUNDRAISING] — if you have heard \
the same objection from three investors and the deck has not been updated to \
answer it, the deck is stale. Investor rejections are intelligence, not \
verdicts. Iterate weekly during a raise

Positive asks:

- Render the FUNDRAISING variant as a Sparkline: market shift (what is) → \
broken old way (what is, deepened) → new category / wedge (what could be, \
named) → product as the wedge (what could be, made real) → traction proving \
the thesis (what could be, validated) → unit economics + defensibility \
underwriting → team as the inevitable executor → specific Ask. Flat opens \
kill conviction in the first 90 seconds
- Render the BOARD UPDATE variant as: pre-read summary → metrics dashboard \
with variance → highlights and lowlights honestly framed → functional updates \
keyed to plan → risks register → decisions requested → next quarter plan. \
Variance leads, not narrative
- One thesis sentence, locked in pre-work. FUNDRAISING: "We believe \
[counterintuitive market thesis], and we are the team building [the category] \
that benefits when [the shift] happens." BOARD UPDATE: "We are executing on \
[the thesis] and [N] of [N] quarter goals are on track." If the founder \
cannot finish either sentence in pre-work, the deck is not ready
- Inherit upstream artifacts when present. The strategic narrative (03) seeds \
Slides 1-4 of the fundraising variant. The positioning statement (01) seeds \
Slide 5 (product / category) and Slide 8 (differentiation / defensibility). \
The messaging framework (02) seeds the language register. Do not re-derive — \
apply
- Pull customer language and metric framing from the RAG corpus when drafting \
the traction slide and any named-customer cohort. Buyer words and \
named-customer outcomes outperform marketer adjectives. "Acme reduced support \
cost 40% in 90 days" lands harder than "customers see significant ROI"
- One planted S.T.A.R. moment, named in pre-work. FUNDRAISING: most often a \
single metric chart that bends right (cohort retention, NRR > 130%, payback < \
6 months) — the line the partner quotes in the Monday partner meeting. BOARD \
UPDATE: the inflection-point chart in the variance section — the line the \
chair quotes in the post-meeting summary email
- Single specific Ask. FUNDRAISING: amount, valuation framing (or "valuation \
discussion in person"), use-of-funds breakdown, named lead-investor profile if \
known. BOARD UPDATE: the specific decision requested, named accountability \
(who decides, who executes), timeline
- Tune KPI emphasis to investor stage [FUNDRAISING]. Seed: thesis + team + \
early signal. Series A: thesis + traction + repeatable unit economics. Series \
B+: efficiency + scale plan + defensibility. Series C+ / growth: Rule of 40 + \
cohort retention curves dominate; vision recedes
- Treat investor objections from prior pitches as deck inputs. If three \
investors have asked the same question, the next deck answers it on a slide

Render variant-conditional sections explicitly. Sections tagged [FUNDRAISING \
ONLY] render only when variant = fundraising; sections tagged [BOARD UPDATE \
ONLY] render only when variant = board_update. Sections without a tag render \
in both variants.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const investorBoardDeckTemplate: ArtifactTemplate = {
  artifactType: 'investor_board_deck',
  title: 'Investor / Board Deck',
  systemPromptFragment: INVESTOR_BOARD_DECK_SYSTEM_PROMPT,
  // Skeleton uses a branching pattern: pre-work locks variant
  // (fundraising | board_update), then a shared spine renders, then variant-
  // conditional body sections render based on the lock. Sections are tagged
  // [FUNDRAISING ONLY] or [BOARD UPDATE ONLY] so the LLM skips the inapplicable
  // variant. The shared spine: thesis sentence + S.T.A.R. moment + team frame
  // + single Ask + Sparkline craft + KPI discipline. The variant divergence:
  // fundraising = 15-slide story-led storyboard with KPIs in the middle;
  // board update = 7-section operational dashboard with strategic narrative
  // wrapper.
  skeleton: `# Investor / Board Deck: [Company Name] — [Meeting Type, Date]

## Pre-work (lock these decisions before drafting a single slide)

- **Variant lock (BINDING for the rest of the template):** [Pick exactly one. FUNDRAISING — raising capital from external investors; deck assumes no context, builds belief from scratch, leads with a counterintuitive market thesis, ends in a specific raise Ask. BOARD UPDATE — operating cadence reporting to existing directors; deck assumes context, leads with variance from plan, exposes risks honestly, ends with named decisions requested. Conflating these is the single most common founder failure mode. Once locked, every section below either renders or is skipped per the variant tag.]
- **Investor stage [FUNDRAISING ONLY]:** [Seed (thesis + team + early signal dominate; KPIs are aspirational and team-credibility-led) / Series A (thesis + traction + repeatable unit economics; the deck is judged on whether early KPIs are real and patterning) / Series B (scale plan + efficiency + defensibility; the deck is judged on whether the model compounds) / Series C+ or growth (Rule of 40 + cohort retention curves; vision recedes, efficiency dominates). Locks the KPI weight on Slides 9-12.]
- **Board cadence and pre-read protocol [BOARD UPDATE ONLY]:** [Quarterly board meeting / monthly operating review / extraordinary board meeting (specific decision)? Pre-read sent 48-72 hours before? Best practice: board-meeting time is spent on discussion of risks and decisions, not on metric review. The deck supports both async pre-read consumption and live discussion.]
- **Thesis sentence (the locking sentence):** [FUNDRAISING: "We believe [counterintuitive market thesis], and we are the team building [the category] that benefits when [the shift] happens." Plain language, one sentence, memorable. The line the partner repeats to the firm. BOARD UPDATE: "We are executing on [the thesis] and [N] of [N] quarter goals are on track." If you cannot finish the sentence, the deck is not ready — pause and sharpen the thesis first.]
- **Planted S.T.A.R. moment:** [The single moment the audience will quote afterward. FUNDRAISING: most often a single metric chart that bends right — cohort retention curves, NRR > 130%, CAC payback < 6 months, a customer behavior pattern that proves the thesis. The line the partner quotes in the Monday partner meeting. BOARD UPDATE: the inflection chart in the variance section — the line the chair quotes in the post-meeting summary email. Name it now; the deck plants it.]
- **The single specific Ask:** [FUNDRAISING: amount, valuation framing (specific number or "valuation discussion in person"), use-of-funds breakdown, named lead-investor profile if known, expected close date. BOARD UPDATE: the specific decision(s) requested, named accountability (who decides, who executes), timeline. NOT "any feedback?", NOT "we'd love intros and feedback and partnerships". One Ask per deck.]
- **Inherited upstream artifacts:** [Strategic narrative (03)? It seeds Slides 1-4 of the fundraising variant — the market shift. Positioning statement (01)? It seeds Slide 5 (product / category) and Slide 8 (differentiation / defensibility). Messaging framework (02)? It seeds the language register on every body slide. If any are missing, name the gap and proceed with caveats — the deck will be weaker.]
- **Investor objections heard so far [FUNDRAISING ONLY]:** [List the objections heard from prior pitches verbatim. If three investors have asked the same question, the next deck answers it on a slide. Treat rejections as intelligence, not verdicts.]

---

## Shared spine (renders for both variants)

### Slide 1 — Cover / one-line thesis

[FUNDRAISING: Company name, one-line thesis from pre-work, raise stage and amount as a footer, date. The thesis sentence is the load-bearing element — it sets the frame for every subsequent slide. BOARD UPDATE: Company name, "Q[N] [year] Board Update", the thesis-execution sentence ("[N] of [N] quarter goals on track"), date. The execution-status sentence is the load-bearing element — it sets the variance frame.]

---

## [FUNDRAISING ONLY] body — 15-slide investor deck

### Slide 2 — The market shift / insight (Setup, ~2 min)

[The counterintuitive observation about the market that earns the right to pitch the company. NOT "the market is large." A point of view: "Seven years ago [X] was the dominant playbook. Today, that assumption is breaking because [Y]." Specific enough that the partner thinks "huh, I had not framed it that way." The opening that pulls a skeptical investor forward. Inherits from strategic narrative (03) if available.]

### Slide 3 — Why now (Setup, ~1 min)

[The forcing functions that make this the right moment, not five years ago and not three years from now. Regulatory shifts, technology inflection, buyer-behavior changes, ecosystem maturation. Two or three named drivers, each with one piece of public evidence. The partner has to believe the timing is real before any product slide lands.]

### Slide 4 — The problem / broken old way (Setup, ~1 min)

[The cost the buyer is absorbing because of the shift named on Slide 2. Specific. One named customer's before-state with a specific number works better than a stat. The pain the audience must feel before the product is introduced. Inherits language from messaging framework (02) and customer language from the RAG corpus if available.]

### Slide 5 — The product / the wedge (Solution, ~1 min briefly)

[The product introduced as the answer to Slides 2-4. Brief — one screenshot or one architectural visual, plus a one-sentence value claim. NOT a feature list, NOT a deep demo. The product is the wedge into the new market thesis; this slide reveals the wedge. Inherits the market category from positioning (01).]

### Slide 6 — Differentiation (Solution, ~2 min)

[Why we win, framed against the realistic alternatives (current tools, internal builds, doing nothing — alternatives by category, not vendor names). Two or three differentiated value points expressed as buyer outcomes, with a one-line capability proof underneath each. Differentiation comes BEFORE traction because investors need to understand why you win before they can interpret the numbers. Inherits from positioning (01).]

### Slide 7 — Traction (Proof, ~2 min)

[The numbers that prove the thesis is working. ARR, growth rate (MoM if early, YoY if later), customer count, named-customer logos if compelling. One named-customer story or cohort that maps tightly to the thesis on Slide 2 — the specificity is credibility. If this slide is your S.T.A.R. moment, this is where the chart that bends right lives. Pair every metric with the unit-economics underwriting on Slide 9 — never let traction stand alone.]

### Slide 8 — Defensibility / the moat (Proof, ~2 min)

[Answer the specific question: what gets harder to replicate the longer we are in market? Pick one or two patterns from the four that hold up in B2B SaaS — proprietary data that compounds, network effects between named user types, deep workflow integration creating switching costs, domain expertise becoming a trust asset over time — and go specific. Name the mechanism, the rate of compounding, and what a competitor would need to do to catch up. "We have a head start" is NOT an answer. Vague "network effects" gets challenged in Q&A.]

### Slide 9 — Business model and unit economics (Business, ~2 min)

[How we make money and at what efficiency. ARR build, ACV by segment if relevant, contract length, gross margin (target 70-80%+ for software; if below, explain why). The KPI shortlist that matters: ARR + growth rate (MoM early, YoY later), Net Revenue Retention (>120% is a real signal of PMF; >130% is fundable), CAC payback (under 18 months SMB, under 24 enterprise), gross margin, logo churn rate (separate from revenue churn — investors will ask). Visualize cohort retention if it bends right.]

### Slide 10 — Go-to-market motion (Business, ~2 min)

[How we acquire, expand, and retain customers. Direct sales / PLG / partner-led / hybrid — name the dominant motion and the unit economics it produces. Pipeline coverage and conversion rate by stage. Sales cycle length. Expansion motion (land-and-expand mechanic, NRR driver). Why this motion is defensible — the GTM is part of the moat in B2B SaaS, not a footnote.]

### Slide 11 — Competitive landscape (Business, ~1 min)

[The 2-4 categories of alternatives the buyer is choosing between (current tooling described by category, internal builds, manual processes, doing nothing). Where we win against each, in one line. NO vendor name-drops as enemies — battlecard material lives in artifact 16. The honest framing of the landscape lands harder than a magic-quadrant grid with us in the corner.]

### Slide 12 — Financial plan (Business, ~1 min)

[3-year financial projections at the line-item level the partner expects: ARR by year, gross margin trajectory, opex by function, burn rate, runway. Tied to the use of funds on Slide 14. The plan must be ambitious-but-credible — investors model a 30% haircut by default. Show one base case; mention upside / downside in verbal if asked.]

### Slide 13 — Team (Ask, ~1 min)

[Why us, specifically, for this market shift. NOT a logo wall of past employers. Each founder / leader: the lived experience that makes them the inevitable executor of THIS thesis. Domain trust as a defensibility asset (especially in regulated or relationship-led markets). Key hires already made. Team goes near the end, after conviction is built, not at the start.]

### Slide 14 — Use of funds (Ask, ~1 min)

[How the raise gets deployed and what milestones it unlocks. Three or four buckets (engineering, GTM, operations, runway extension) with a percentage allocation each, paired with the specific milestone each bucket gets us to (e.g., "$3M GTM gets us to $X ARR / [N] enterprise logos / Series A readiness"). The milestones are how investors evaluate whether the raise is rightsized.]

### Slide 15 — The Ask (Ask, ~1 min)

[The single specific raise Ask from pre-work. Amount, valuation framing (specific number or "valuation discussion in person" if pre-priced), expected close date, named lead-investor profile if known. One Ask, one frame. NOT "we'd love intros and feedback." Close confidently. The momentum of the close is what the partner remembers.]

---

## [BOARD UPDATE ONLY] body — 7-section operational deck

### Section 1 — Pre-read summary (Slide 2, ~30 sec read)

[A one-page summary the board reads before the meeting. Three blocks: thesis-execution sentence (from pre-work — "[N] of [N] quarter goals on track"), top-3 highlights, top-3 concerns. Designed to be consumed async 48-72 hours before the meeting. The board enters the room calibrated; meeting time is spent on discussion, not on catch-up.]

### Section 2 — Metrics dashboard with variance (Slide 3-4, ~3 min)

[The KPI shortlist as a dashboard, each metric paired with: actual, plan / forecast, variance, and a one-line narrative for any variance >10%. Same KPIs as fundraising: ARR + growth rate, NRR, CAC payback, gross margin, logo churn — plus operational metrics specific to this stage (pipeline coverage, runway, opex burn, sales productivity). Variance leads, narrative supports. The board's first 60 seconds must confirm we are on track or honestly explain why not.]

### Section 3 — Highlights and lowlights (Slide 5, ~3 min)

[Three highlights and three lowlights, both with specificity. Highlights: a named customer win, a hiring milestone, a product shipping moment, a unit-economics improvement. Lowlights: a missed metric with the diagnosed cause, a churn that mattered, a hire that did not work, a strategic bet that did not land. Honest lowlights build board trust faster than performative highlights. Hiding lowlights gets caught in 1:1s and erodes trust.]

### Section 4 — Functional updates keyed to plan (Slide 6-9, ~5 min)

[One slide per function (product, sales / GTM, marketing, finance / ops). Each slide: the goals committed last quarter, what shipped / hit / missed, the diagnosed cause for any miss, and the goals committed for next quarter. Keyed to plan, not to activity. "What we did" is a status update; "what we committed and what we delivered against the commitment" is variance reporting.]

### Section 5 — Risks register (Slide 10, ~3 min)

[The top 3-5 risks the company is carrying right now, framed honestly. Each risk: probability, impact, current mitigation, what the board can help with. Categories typically include market / category, talent, technical, financial, legal / regulatory. Surfacing risks is the board's primary value-add — a board that hears about risks for the first time during a crisis is a board that cannot help.]

### Section 6 — Decisions requested (Slide 11, ~3 min)

[The single specific Ask from pre-work — but for board, this is one slide listing the named decisions requested at this meeting. Each decision: the question, the recommendation, the named accountability (who decides, who executes), the timeline. Common categories: budget reallocation, executive hire approval, strategic pivot endorsement, financing decision, comp / equity refresh approval. NO "any feedback?" — board time is for decisions.]

### Section 7 — Next quarter plan (Slide 12, ~2 min)

[The 3-5 commitments for the next quarter, framed as measurable goals with named owners. The bridge from this meeting to the next. The board signs off on these commitments; next quarter's variance reports against them. Specific, time-bound, owned.]

---

## Appendix (renders for both variants)

### A1 — Detailed metrics backup

[The detail behind the headline KPIs. Cohort retention by month / quarter, ARR by segment, churn breakdown by reason code, pipeline aging, sales productivity by rep tenure. Lives in appendix because the deck body should not drown in numbers — but the partner / board member who wants depth has it on hand. Updated every cycle so it is fresh.]

### A2 — Detailed financials [FUNDRAISING ONLY] / Detailed P&L variance [BOARD UPDATE ONLY]

[FUNDRAISING: Three-statement model (P&L, balance sheet, cash flow) for the projection horizon, with key assumptions called out. Lives in appendix or shared as a separate model link. The slide deck presents the headline; the model lets investors stress-test. BOARD UPDATE: Quarter P&L vs. budget at the line-item level, balance sheet snapshot, cash position. Same logic — the slide deck shows variance; the model lets the audit committee dig.]

### A3 — Customer cohort detail

[Named customers with use case, deal size, expansion trajectory, NRR contribution. Especially valuable for: showing concentration risk if any, demonstrating expansion mechanic, supporting any "Bloomberg of SaaS" defensibility claim with named data depth. NOT a logo wall — a profile per named customer, with the story.]

### A4 — Founder bios and team org [FUNDRAISING ONLY]

[Long-form bios behind the team slide, organizational chart showing reporting structure and key hires planned. Investors who want to dig into team-as-defensibility have the depth here without bloating the body deck.]

---

## Narrative quality gate (audit before sign-off)

[Verify before the deck ships:

- **Variant-coherence check:** Read the deck as the audience. FUNDRAISING — does the dominant emotional beat answer "why fund, what do we get, what is the thesis?" or has it drifted into variance reporting (you have written a board update by mistake)? BOARD UPDATE — does the dominant beat answer "are we on track, what risks need decisions?" or has it drifted into thesis-pitching (you have written a fundraising deck by mistake)? Variant lock from pre-work is binding; rewrite if the register has drifted.
- **KPI-discipline check:** Scan every metric on the deck. Does each one map to revenue, retention, efficiency, or unit economics? Is any metric a vanity metric (signups, MAU, page views, pipeline without close rate)? Cut vanity metrics. Are the five investor-readable KPIs visible: ARR + growth rate, NRR, CAC payback, gross margin, logo churn? If any are missing, the deck is incomplete.
- **Defensibility-specificity check:** Read Slide 8 (fundraising) or the equivalent moat reference (board). Does it name a specific mechanism (proprietary data, named network effect, integration depth, domain trust asset) and explain what gets harder to replicate over time? "Head start", "first-mover advantage", and unspecified "network effects" all fail this gate. Rewrite to specificity.
- **One-S.T.A.R. check:** Is there exactly one moment / chart / line that the audience will quote afterward? Zero = informational deck. More than one = no single moment will land. Name it; verify it is visible on the slide it lives on.
- **One-Ask check:** Is there exactly one Ask, and is it specific? FUNDRAISING — amount, valuation framing, use-of-funds, expected close. BOARD UPDATE — named decision, named accountability, timeline. "Any feedback?" / "intros and partnerships" / "let us know" all fail this gate.
- **Mentor-stance check:** Read every slide headline. Is the audience (investor / board) or the market shift the subject — or is the company the subject? "We built X" fails; "[Buyer archetype] now does Y" / "The market is shifting toward Z" pass. The investor / board is the hero of their own decision; the company is the mentor providing visibility.
- **No-vendor-names check [FUNDRAISING]:** Scan Slide 6 (differentiation) and Slide 11 (competitive landscape). Are any named competitors called out as enemies? Vendor call-outs collapse the deck into a battlecard; move them to artifact 16.
- **Variance-leads check [BOARD UPDATE]:** Does Section 2 (metrics dashboard) come BEFORE Section 3 (highlights and lowlights)? Highlights before metrics is performative; the board's first 60 seconds must be variance, not narrative.]

---

## Validation: the conviction test + the variant-lock test

[Two crisp gates before the deck ships:

**Conviction test [FUNDRAISING]:** Read the deck as a skeptical investor partner who has seen 200 decks this year. Does the deck build conviction in 90 seconds? Specifically: by the end of Slide 4, does the partner believe the market shift is real and the timing is right? By the end of Slide 8, does the partner believe the moat is real, not handwaved? By the end of Slide 9-10, does the partner believe the unit economics work and the GTM motion compounds? If conviction breaks at any of those gates, the deck is not done — fix the upstream slide. The Ask on Slide 15 is only earned if Slides 2-12 have built conviction; an Ask without conviction is asking strangers for money.

**Variant-lock test:** Read the deck end to end. Could it be confused for the OTHER variant? FUNDRAISING decks that read like board updates are stale — they assume context the investor does not have, lead with variance the investor cannot interpret, and bury the thesis. BOARD UPDATE decks that read like fundraising decks are insulting — they re-pitch the thesis to a board that already owns the thesis, and they bury the variance under narrative. If the deck could be confused for the other variant, the variant lock from pre-work has not been honored. Rewrite until the audience-question is sharp: "why fund?" or "are we on track and what decisions do you need from me?"]
`,
}

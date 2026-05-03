---
artifact: investor_board_deck
phase: 2
tier: 3 (executive / cross-functional)
canonical_books:
  - Hoffman - Masters of Scale (blitzscaling, network effects, "Getting to No", counterintuitive scaling principles for the fundraising story)
  - Duarte - Resonate (Sparkline, audience-as-hero, mentor stance, S.T.A.R. moment, Big Idea — applied to investor stage)
  - Tier 2 corpus (PMA blogs + Dunford Sales Pitch) — slide order, KPI shortlist, defensibility patterns, board-vs-fundraising distinction
related_artifacts:
  - 01-positioning-statement (seeds the differentiated value and category framing on Slide 5/6)
  - 03-strategic-narrative (seeds Slides 1-4 of the fundraising variant — the market shift)
  - 19-sales-pitch-deck (sibling boundary — sells to a champion in a buying cycle, not to investors / board)
  - 24-executive-keynote (sibling craft — Sparkline, S.T.A.R., audience-as-hero applied to a different audience)
  - 32-customer-all-hands-qbr-deck (separate operational deck for customer relationship cadence)
---

# Investor / Board Deck — audit note

This is the audit doc for artifact 31 in the 39-template Phase 2 set. The user reads this end-to-end to pressure-test the structure of a single template that has to render TWO different documents: a fundraising deck and a board update deck.

Three sections:

1. Findings across canonical books and practitioners
2. Why we chose this template structure (the branching decision)
3. System prompt asks (most important)

---

## 1. Findings across canonical books and practitioners

### What Masters of Scale (Hoffman) said — the fundraising mindset

Hoffman is not a "build a deck" book; he is the canonical source for *why investors say yes* and the storytelling posture that earns conviction. The load-bearing claims:

- **"Getting to No" is intelligence.** Investor rejection sharpens the thesis: it surfaces the unspoken objections (TAM credibility, defensibility, capital efficiency, team gap) that the deck has not yet answered. Founders who treat rejection as feedback iterate the deck weekly during a raise; founders who treat it as a verdict run the same deck for six months and run out of runway.
- **The best ideas seem implausible at first.** A counterintuitive thesis — "the market is bigger than it looks because the buyer category does not yet exist" or "the dominant moat in this space is data, not distribution, and we are accumulating it faster than anyone" — is more fundable than a safe one once you have evidence. The deck has to *invite skepticism and answer it*, not avoid it.
- **Blitzscaling is risk-intelligent, not reckless.** When a fund hears "we plan to grow 3x annually for three years," they are pattern-matching for whether the plan is intelligent: is the competitive window closing, is the network effect compounding, is the unit economics stable enough that capital accelerates rather than masks. Vanity growth ("we tripled signups") without unit-economics framing reads as recklessness, not blitzscaling.
- **Network effects, data accumulation, deep workflow integration are real defensibility.** "We have a head start" is not a moat. The defensibility section has to answer one specific question: *what gets harder to replicate the longer we are in market?*
- **First-principles thinking** in the team / culture section. Investors are betting on whether the founders can adapt when the plan is wrong, not whether the plan as written is right.

The book's central principle for fundraising decks: *the deck is the externalization of conviction. If the founders are not yet convinced about the counterintuitive thesis, the deck reads as a list of facts. If they are, the deck reads as inevitability.*

### What Resonate (Duarte) said — the craft layer (applies to both variants)

Resonate's contribution is craft, not structure. The deck is the spine; Resonate makes the slides actually land:

- **Sparkline structure.** Investors decide in 60-90 seconds whether to lean in or lean out. The opening slides have to oscillate between "what is" (the market shift, the broken old way, the painful status quo) and "what could be" (the new category, the new winning playbook, the founder's wedge). Flat opens kill conviction.
- **Audience-as-hero (mentor stance).** For fundraising: the *fund* is the hero whose return profile improves by backing this thesis; the founder is the mentor who has seen the shift first. For board updates: the *board* is the hero whose oversight is strengthened by clear variance reporting; the operating team is the mentor providing visibility, not the hero seeking applause.
- **S.T.A.R. moment.** One planted moment the partner repeats to the rest of the firm in the Monday partner meeting. Most often a single arresting metric (NRR > 130%, payback < 6 months, a customer cohort behavior chart that bends in the right direction). For board decks: a single inflection point the chair will quote in the post-meeting summary email.
- **Frequency tuning by stage.** Seed: thesis + team + early signal. Series A: thesis + traction + repeatable unit economics. Series B+: efficiency + scale plan + defensibility. Same spine, different KPI weights.
- **Big Idea / one-line thesis.** A fundraising deck must collapse to one sentence: "We believe [counterintuitive market thesis], and we are the team building [the category] that benefits when [the shift] happens." If the founder cannot finish this sentence in pre-work, the deck will not land.

### What the corpus added — slide order, KPIs, the board/fundraising split

The corpus query (Wes Bush ChartMogul piece, PMA SaaS metrics cheat sheet, Dunford Sales Pitch pp. 25/50/163, PMA conversion copy) supplied:

- **The two-decks-two-jobs principle.** "A board deck is a management tool. A fundraising deck is a sales pitch. Same company, completely different structure. Conflating them is one of the most common mistakes founders make." This is the load-bearing decision for this template — branching, not merging.
- **Fundraising slide order (15 slides, 4 phases):**
  - Setup (1-4): Problem → Market shift / insight → Why now → Underinvested by most decks; this is where conviction is built before the product is shown
  - Solution + proof (5-8): Product (briefly) → Differentiation → Traction. *Differentiation before traction* — investors need to understand why you win before they can interpret the numbers
  - Business (9-12): Business model → Unit economics → GTM motion → Competitive landscape. KPIs live here
  - Ask (13-15): Team → Use of funds → The ask. Team goes near the end, after conviction is built — not at the start
- **The KPI shortlist for B2B SaaS (Series A+):** ARR + growth rate (MoM early, YoY later), Net Revenue Retention (>120% is a real signal of PMF), CAC payback (<18 months SMB, <24 enterprise), gross margin (70-80%+), logo churn (separate from revenue churn — investors will ask). Anything beyond this list is supporting; anything missing this list is incomplete.
- **The defensibility patterns that hold up:** proprietary data that compounds, network effects between users or buyers, deep workflow integration creating switching costs, domain expertise becoming a trust asset over time. The "Bloomberg of SaaS" pattern (accumulating customer data → benchmarking → genuinely hard to replicate) is a real one. Vague "network effects" claims without naming the mechanism get challenged in Q&A.
- **Board update structure (5 sections):** key metrics dashboard → highlights and lowlights → functional updates (product, sales, marketing, finance) → risks and decisions needed → next quarter plan. The board deck *leads with variance*: what happened vs. what you said would happen, and why.
- **The practical difference, in one line:** "In a board deck, you can write 'CAC increased 15% in Q2' and the board will engage with it. In a fundraising deck, that same fact needs framing, context, and a forward-looking narrative or it kills momentum."

### What the corpus did NOT cover (gap log)

- **Board update cadence and pre-read protocol.** Best practice (most boards, most operating partners): pre-read sent 48-72 hours before the meeting, board meeting time spent on discussion of risks and decisions (not on metric review). The corpus did not surface this directly; included from PMM practitioner knowledge.
- **The "growth investor" vs. "venture investor" framing.** Growth-stage decks (Series C+) shift weight again — efficiency / Rule of 40 / cohort retention curves dominate; vision/category framing recedes. The corpus query was framed broadly enough to surface seed-to-Series A patterns most strongly. Late-growth nuance is encoded in the "investor stage" pre-work field.
- **Board-only artifacts** (committee charters, audit committee reports, comp committee inputs) are out of scope — the board *update deck* is the operating cadence touchpoint, not the governance artifact set.

---

## 2. Why we chose this template structure (the branching decision)

### The branching question

Should artifact 31 be:

- **(A) Two separate templates** (`fundraising_deck` and `board_update_deck`) with shared craft principles but independent skeletons, or
- **(B) One template with conditional branching** in pre-work and a shared spine that diverges by phase?

We chose **(B) — one template, branching pre-work, shared spine, conditional sections**. Three reasons:

1. **The user-facing surface is one decision** — "I need an investor / board deck for the next [meeting type]." Forcing the user to pick between two artifact types before they have made the structural decision pushes craft work into a UI surface and away from where it belongs (in the pre-work the LLM walks the user through).
2. **The shared spine is real, not cosmetic.** Both variants need: a thesis sentence, the KPI shortlist, the defensibility paragraph, the team slide, the ask. The Sparkline / S.T.A.R. / mentor-stance craft principles apply to both. Splitting the templates would force the craft layer to be duplicated.
3. **The divergence is structurally clean and locks at one branch point.** Once the variant is selected in pre-work (`fundraising` or `board_update`), the slide order, KPI emphasis, and emotional register all follow. The skeleton renders the shared spine first (pre-work + thesis + team + ask) and then the variant-specific body sections.

### Sibling boundary (artifact 19 — sales pitch deck)

Artifact 19 sells a *product* to a *customer champion* in a buying cycle. Artifact 31 sells a *company* to *investors / board*. The audiences are different, the KPIs are different, and the question pattern is different:

- Artifact 19 question: "Why should I buy this, over the alternatives I could choose today?" Answer: differentiated value vs. alternatives, with a specific deal-stage Ask.
- Artifact 31 (fundraising) question: "Why should I invest, given my fund's return profile and the alternatives I could fund?" Answer: market thesis + capital-efficient growth plan + defensibility + team — with a specific raise Ask.
- Artifact 31 (board update) question: "Are we executing the plan I oversee, and what risks need my decision?" Answer: variance from plan + risk register + decisions needed.

The Dunford 8-step Setup/Follow-Through spine of artifact 19 is *invoked but adapted* in the fundraising variant (Slides 1-8) — the corpus answer cites Dunford pp. 25/50/163. We do NOT replicate the artifact 19 storyboard verbatim; the investor body shifts to KPIs / unit economics / GTM motion / competitive landscape after Slide 8, which artifact 19 does not.

### What we excluded

- **Per-slide "what the rep says" verbal beats** (artifact 19 has these). Investor decks are not delivered with a uniform script — the founder reads the room and adjusts pacing. We supply slide-level prompts and a delivery protocol in pre-work, not slide-by-slide verbal beats.
- **The 7-beat keynote spine** (artifact 24). Keynotes broadcast a vision to a room; investor decks build investment conviction or board oversight. Different ask shape.
- **Deep dive into product / demo slides.** The product slide is one slide in the fundraising deck (briefly demonstrated, not deeply demo'd). Demo material lives in artifact 20.
- **Per-stakeholder objection slides** (artifact 19's Slide A2). For investors, objection handling lives in the verbal Q&A and the appendix metrics; not in the body deck itself.

### What we included specifically

- **Variant-locking pre-work field.** The first pre-work decision is `fundraising` vs. `board_update`. The skeleton uses bracketed conditional renderings (`[FUNDRAISING ONLY]` / `[BOARD ONLY]`) so the LLM knows what to fill and what to skip. Both variants render their full skeleton; the LLM omits sections marked for the other variant.
- **Investor stage pre-work field** (seed / Series A / Series B / Series C+ / growth / board-update-not-applicable). Locks KPI emphasis.
- **The KPI shortlist as a template-enforced section** (ARR + growth rate, NRR, CAC payback, gross margin, logo churn). The deck does not ship without these — every investor deck failure mode in the corpus traces to either missing or vanity KPIs.
- **The defensibility paragraph as a forced specificity gate** — bracket prompt requires naming the mechanism (proprietary data, network effects, integration depth, domain expertise) and what specifically gets harder to replicate over time. "Head start" is explicitly called out as a non-answer.
- **One S.T.A.R. moment** named in pre-work, planted in the deck — for fundraising, most often the cohort retention chart or the NRR / payback metric; for board, the inflection moment in the variance section.
- **The single Ask** — for fundraising, the raise specifics (amount, valuation framing, use of funds breakdown); for board, the decision(s) requested with named accountability and timeline.
- **Champion-investor-stage tuning** in the team slide — "team-as-mentor" framing (the team has lived through this market shift; their domain trust is a defensibility asset), not "team-as-resume" (logos and tenure without thesis-fit).

---

## 3. System prompt asks (most important — what the LLM must avoid + what it must do)

### Negative guidance (failure modes lifted from corpus + books)

- **Vanity metrics.** Signups, MAU, "page views" without conversion, GMV without take rate, "pipeline" without close rate. Every metric on the deck has to map to either revenue, retention, efficiency, or unit economics. If a metric does not, it's vanity and gets cut.
- **No defensibility story.** "We have a head start" / "first-mover advantage" / "network effects" without naming the mechanism. The defensibility section must answer the specific question: *what gets harder to replicate the longer we are in market?* and pick one or two patterns specifically (data, network, integration, domain), not all four vaguely.
- **Hockey stick without unit economics.** A growth chart pointing up with no CAC payback, no gross margin, no NRR underneath reads as growth-at-any-cost. Every traction slide has to be paired with the unit-economics underwriting.
- **TAM overclaim.** "$100B market" without a credible bottom-up build. Investors instinctively cut top-down TAM by 10x. The bottom-up TAM (target accounts × ACV × penetration) is the credibility frame.
- **"We'll figure GTM out later."** GTM motion is a defensibility moat in B2B SaaS — direct sales vs. PLG vs. partner-led has different unit economics, different scaling profile, and different defensibility patterns. Vague GTM signals to investors that the founders have not pressure-tested the business model.
- **Team-as-resume.** Logos and tenure without thesis-fit. The team slide has to answer "why us, specifically, for this market shift?" — not "we have impressive backgrounds."
- **Conflating the two decks.** Writing a board update with the emotional register of a fundraising deck (forward-looking narrative on every metric variance) infantilizes the board; writing a fundraising deck with the register of a board update (variance reporting on plan-vs-actual) kills investor momentum.
- **Inside-out language.** "We built X" / "Our platform delivers Y." The investor / board is the audience hero in their own decision; the company is the mentor providing visibility. Slide headlines should be customer-outcome or market-shift led, not company-built-it led.
- **Multiple Asks.** "We're raising $10M *and also* would love feedback / intros / partnerships." One Ask per deck. The raise is the raise; the rest goes in follow-up.
- **No-context board deck.** Diving into functional updates without first showing the metrics dashboard and the variance from plan. The board's first 60 seconds have to confirm the company is on track or honestly explain why not.

### Positive asks

- **Render the deck as a Sparkline** in the fundraising variant: market shift (what is) → broken old way (what is, deepened) → new category / wedge (what could be) → product as the wedge (what could be, made real) → traction proving the thesis (what could be, validated). Flat opens kill conviction in the first 90 seconds.
- **One thesis sentence, locked in pre-work.** "We believe [counterintuitive market thesis], and we are the team building [the category] that benefits when [the shift] happens." Both variants need this; the board update version compresses to: "We are executing on [the thesis] and [N] of [N] quarter goals are on track."
- **Inherit upstream artifacts when present.** The strategic narrative (03) seeds Slides 1-4 of the fundraising variant. The positioning statement (01) seeds Slide 5 (product / category) and Slide 8 (differentiation). The messaging framework (02) seeds the language register. Do not re-derive — apply.
- **Pull customer language and metric framing from the RAG corpus** when drafting the traction slide and the customer cohort. Buyer words and named-customer outcomes outperform marketer adjectives.
- **One planted S.T.A.R. moment, named in pre-work.** Most often a single metric chart that bends right (cohort retention, NRR > 130%, payback < 6 months) for fundraising; the inflection-point chart in the variance section for board. The line the partner / chair quotes in the post-meeting summary.
- **Single specific Ask.** Raise: amount, valuation framing (or "valuation discussion in person"), use-of-funds breakdown, named lead-investor profile if known. Board: the specific decision requested, the named accountability (who decides, who executes), the timeline.

### Open questions for the user audit

1. **Should the template support a "growth investor" sub-variant** (Series C+, where Rule of 40 / efficiency dominate over thesis)? Currently encoded as a pre-work investor-stage field — flexible enough, but the LLM may need explicit prompting that Slide 9-12 weights shift at growth stage.
2. **Should the board variant include a separate "executive summary" pre-read page** (a one-pager that ships to the board 48-72 hours before the meeting)? Currently included as Slide 1 of the board variant but not as a separate artifact. Could be a future thin variant.
3. **How tightly should defensibility map to positioning's "distinct capabilities"?** Currently the template asks the LLM to inherit positioning's distinct capabilities and translate them into investor-frame defensibility (data, network, integration, domain). This may force a re-derivation when positioning's capabilities are too product-feature-shaped to land as moats.

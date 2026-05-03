# Research — Launch Plan / GTM Brief

## Canonical sources (read FIRST)

- **The Go To Market Strategist** (Heidi Ueberroth) — primary structural source for the *strategic decisions* spine.
  - Card: `~/Documents/AbhishekR/Book Brain/The Go To Market Strategist.md`
- **The Pocket Guide to Product Launches** (Brenda Bucher) — primary structural source for the *launch execution* spine (tiers, RACI, rolling thunder, GTM plan components).
  - Card: `~/Documents/AbhishekR/Book Brain/The Pocket Guide to Product Launches.md`

## What the GTM Strategist book establishes

### Six Mission-Critical GTM Decisions
1. **Market** — beachhead segment selection
2. **Early Customers** — first adopters / reference accounts
3. **Product** — capabilities that drive adoption
4. **Pricing** — model aligned with value perception
5. **Positioning** — owned mental space (separate artifact `positioning_statement` — we *reference*, not duplicate)
6. **Growth** — channels and tactics that scale

These are described as **decisions you make once and execute against**, not a checklist. The book frames them as "the bridge between product excellence and commercial success."

### Special Ops principles (operational discipline layer)
Simplicity, Good Intelligence, Play on Strengths, Innovation, Security, Repetition, Surprise. Not all map to a launch brief — we extract three that matter for launch execution: Simplicity (channel focus over scattershot), Good Intelligence (readiness signal), Repetition (rolling thunder).

### North Star Metric / OKR structure
GTM brief needs **one primary success metric** plus 2-3 supporting KRs. Choosing "everything" = measuring nothing.

### Beachhead Strategy
Concentrate launch effort on one segment first; use as reference point before expanding. This shapes the **launch audience** section of the template — you launch for the beachhead, not for the TAM.

## What the Pocket Guide book establishes

### GTM Plan Framework (4 components)
1. Strategic Readiness — market validation, competitive positioning input
2. External Promotion — campaigns, channels
3. Sales Enablement — training and tools
4. Internal Communications — alignment and rollout

### Launch Stage Definitions (product-readiness gates)
Discovery → Alpha → Closed Beta → Open Beta → GA. Distinct from launch *tiers* (which size the GTM effort). Both belong in the brief.

### RACI Model
- Responsible — does the work
- Accountable — final decision-maker (one person per row)
- Consulted — provides input
- Informed — needs status updates

### Launch Tier Strategy
- **Tier 1** — high-impact: full orchestration (press, events, sales push, exec sponsorship)
- **Tier 2** — standard: marketing + sales support
- **Tier 3** — modest: docs + notification

### Rolling Thunder Momentum Strategy
Sequence announcements after launch day. The launch is not the moment — it's a sequence of moments. Pre-launch tease → launch peak → post-launch deep-dive → customer story → amplification.

### Bucher's central principle
*"A great product launch isn't a single moment — it's a carefully orchestrated sequence of moments that create sustained momentum and clear perception."* This is the negative-guidance engine for "treating launch day as the finish line."

---

## Corpus research (amplification)

Top citations from the query (10 chunks; full RAG response in `09-launch-plan-gtm-brief.json`):

1. **Pocket Guide to Product Launches p.23-24** (book) — direct echo of tier model and RACI; structural validation.
2. **PMA — "6 best practices to balance launches and adoption"** (Tier your launches) — practitioner amplification: **four-tier model** (T1/T2/T3/T4) with T4 reserved for bug fixes / pixel changes (Internal Slack post). **Net-new vs book's three-tier model.** We adopted the four-tier model because the corpus framing is sharper for B2B SaaS where most "launches" are minor and shouldn't burn announcement budget.
3. **Anna Wiggins (AMA)** — practitioner POV on tier scoring: yes/no question rubric (does it solve a new buyer pain? does it do something competitors can't? does it change customer workflows?). Counting trues removes politics from tier assignment. **Adopted as a sub-block under tier selection.**
4. **Amanda Groves (AMA)** — RACI specificity: PMM is *accountable* (not just responsible) for the launch as a whole, not just for messaging. "If you don't own the brief, you don't own the outcome." This sharpens Bucher's generic RACI.
5. **Wes Bush / productled.com** — channel prioritization discipline. Scattershot fails.
6. **Crossing the Chasm p.154** (book) — early-market framing for beachhead launches. Aligns with GTM Strategist's Beachhead Strategy.
7. **Neil Patel** — generic; not pulled into the template (corpus filler, no net-new).
8. **Stevie Langford / PMA — B2B messaging** — adjacent (messaging input to launch); referenced in pre-work as a prerequisite, not duplicated.

### Corpus net-new contributions adopted into the template
- **Four-tier model** (T1/T2/T3/T4) instead of book's three. T4 = bug fixes, internal Slack only.
- **Tier scoring rubric** (7 yes/no questions, count trues). Removes politics.
- **PMM accountable, not just responsible** — sharpened RACI line item.
- **Rolling thunder week-by-week template** (corpus gave specific weekly cadence: pre-launch tease 2-3 weeks out → launch day → week 2 webinar → week 3 customer story → week 4 paid amplification). Book described the pattern; corpus gave the executable cadence.
- **Decisions that must be locked before launch** — pricing/packaging, readiness gate, success metrics, channel prioritization. Corpus articulated this as a discrete checklist; books had it dispersed.

### Where book and corpus disagreed
- **Number of tiers.** Book says 3, corpus says 4. **Corpus wins** — T4 (Internal Slack only) is a real category in B2B SaaS that gets miscategorized as T3 in the three-tier model and burns announcement budget on pixel changes. Tier-2 rule allows merging mergeable practitioner POV; this is a clean merge that doesn't violate the book's intent (the book's T3 already implied minimal effort).
- **Where positioning sits.** Book says positioning is one of the six decisions (i.e., made *during* GTM planning). Corpus assumes positioning is upstream and locked. **Corpus wins for the brief** — the launch brief consumes positioning; it doesn't author it. The brief references the `positioning_statement` artifact as a prerequisite input.

### Corpus gaps
- One blog citation surfaced with broken metadata (`url: null, section_title: "Product launch tiers"`). Logged in `corpus-gaps.md` for next ingestion sweep. Did not block; the named book + PMA blog already covered tier framing.

---

## Template design decisions

**Authority hierarchy:** Pocket Guide drives the *execution skeleton* (tiers, RACI, rolling thunder, stage gates). GTM Strategist drives the *strategic spine* (six decisions, North Star, beachhead). Corpus amplifies with B2B SaaS specifics (four-tier model, scoring rubric, executable rolling-thunder cadence, pre-launch decision lockdown).

**This is the orchestration doc.** It references but does NOT duplicate downstream artifacts:
- Blog post copy → `launch_blog_post` (artifact 10)
- Press release → `launch_press_release` (11)
- Internal FAQ → `internal_launch_faq` (12)
- Internal deck → `internal_launch_deck` (13)
- Customer-facing deck → `customer_launch_deck` (14)
- Customer testimonial ask → `customer_testimonial_quote_ask` (15)

The brief lists which downstream artifacts the chosen tier requires. T1 = full set. T2 = reduced set. T3 = minimal set. T4 = essentially none.

**Tier-driven scope.** First decision in the brief is **tier selection** (with the scoring rubric). Tier determines artifact production scope downstream — different tier = different brief.

**Pre-work as Step 0** (matches the v2 pattern from positioning + messaging templates). Pre-work confirms: positioning locked? ICP locked? Beachhead defined? Product readiness stage? Without these, the brief is built on sand.

**Six GTM decisions condensed to five for the brief.** Positioning is removed (it's upstream input, not a decision made *in* the brief). Remaining: Market/Beachhead, Early Customers, Product Readiness, Pricing & Packaging, Growth/Channels. This is the launch-specific subset of the six decisions; the full six belong to a strategy doc, not a launch brief.

**RACI as a structured matrix, not prose.** Five default rows (PMM, Product, Sales/CS, Comms/PR, Demand Gen) with R/A/C/I per launch workstream. Forces the user to assign exactly one Accountable per row.

**Rolling thunder as a 4-week cadence template.** Week -2 through Week +4. User edits dates; structure stays. Corpus's executable cadence > book's general principle.

**Pre-launch decision lockdown checklist.** Four hard-to-reverse decisions listed as a gate: pricing, readiness, success metric, channel prioritization. If any are unlocked at T-1 week, the launch slips.

**Success metrics: one primary, 2-3 supporting.** GTM Strategist's North Star + OKR pattern applied to launch.

**Failure modes go in system prompt as negative guidance** (matches positioning + messaging + buyer-journey templates). Not in skeleton.

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work checklist | Both books + cross-artifact pattern | Prerequisites must be locked: positioning, ICP, beachhead, readiness stage. |
| Launch tier + scoring | Pocket Guide + corpus (PMA) | First decision; gates everything downstream. |
| Strategic context | GTM Strategist (Beachhead) | What we're launching, why now, beachhead segment, competitive moment. |
| Audience & positioning input | Cross-artifact | Names the personas + references locked positioning artifact. |
| GTM decisions (5) | GTM Strategist (six minus positioning) | Market/beachhead, early customers, product readiness, pricing & packaging, channels & growth. |
| Success metrics | GTM Strategist (North Star + OKRs) | One primary metric + 2-3 KRs. |
| Pre-launch decision lockdown | Corpus net-new | Pricing, readiness gate, primary metric, channel ranking — locked before T-1. |
| Rolling thunder cadence | Pocket Guide + corpus | Week -2 to Week +4 sequence. |
| RACI matrix | Pocket Guide + corpus (Groves AMA) | One Accountable per row; PMM accountable for the brief. |
| Downstream artifact scope | Boundary call | Which artifacts (10-15) get produced based on tier. |
| Risks & mitigations | Both + corpus failure modes | Live risks specific to this launch. |

## Sections excluded

- **Positioning components** (Distinct Capabilities, Best-Fit Accounts, Market Category) — upstream artifact `positioning_statement` referenced, not duplicated.
- **Messaging stack** — upstream artifact `messaging_framework` referenced.
- **Full battlecard / comparison matrix** — separate artifacts (16, 17).
- **Launch blog / PR / FAQ / decks** — separate artifacts (10-14). The brief *commissions* them; it doesn't write them.
- **Long-form ICP** — referenced as input from `icp` artifact (04).
- **Brand / tone of voice** — out of scope.

## System prompt failure modes (negative guidance)

Distilled from book + corpus, eight failure modes:

1. **Treating launch day as the finish line** — the launch is the starting gun. Rolling thunder runs 4 weeks past launch day. (Pocket Guide + corpus.)
2. **No champion in sales** — PMM launches, sales shrugs. Co-creation, not post-hoc training. (Corpus / Groves AMA.)
3. **No readiness gate** — feature ships before sales, CS, and support certify they can handle volume. (Corpus net-new.)
4. **All-channel scattershot** — equal-priority email + social + PR + events + in-app with a Tier 2 budget = thin coverage everywhere. Rank channels. (GTM Strategist Simplicity + corpus.)
5. **Tier inflation** — treating every release like a Tier 1. Buyer fatigue is real; market stops believing you when something actually matters. (Pocket Guide + corpus.)
6. **Politicized tier assignment** — letting the loudest stakeholder set the tier. Use the scoring rubric. (Corpus / Wiggins AMA.)
7. **Ambiguous accountability** — "everyone owns the launch" = no one owns it. Exactly one Accountable per RACI row. PMM is Accountable for the brief and the outcome, not just messaging. (Pocket Guide + corpus.)
8. **Vanity metrics** — measuring everything = learning nothing. Pick one primary success metric before launch. (GTM Strategist + corpus.)

Voice rule: Reference frameworks implicitly. Do not name-drop authors (Bucher, Ueberroth, Moore, Bush, etc.) in the output.

## Open questions for audit

- **Three-tier vs four-tier model.** Adopted four-tier (with T4 = bug fixes). The book uses three. Open for your call if you want to revert to three for simplicity.
- **Should success metrics be a separate artifact?** A launch-metrics dashboard could plausibly be its own thing. Currently embedded in the brief because launch metrics are tightly coupled to the launch decision; splitting would force the user to read two artifacts to understand what success looks like.
- **RACI default rows (5).** PMM, Product, Sales/CS, Comms/PR, Demand Gen. Some orgs add CS, Legal, Analyst Relations, Customer Marketing as separate rows. Default to 5; user can add rows.
- **Should rolling thunder cadence be tier-conditional?** A T3 launch doesn't need a 4-week thunder. Currently the cadence is rendered as the T1 default with a note that T2 trims to 2 weeks and T3 skips it. Could be more structurally enforced.
- **Corpus gap:** one blog citation surfaced without URL or author. Logged for next ingestion sweep. Did not block this template; the named book + PMA blog already covered tier framing.

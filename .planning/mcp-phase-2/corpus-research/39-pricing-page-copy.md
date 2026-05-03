# Artifact 39 — Pricing Page Copy: research synthesis

## Canonical books read

### Ramanujam — Monetizing Innovation
- **The 4 monetization failure types** (Ch.2): **Feature Shock** (too many features, customer overwhelmed, no perceived value), **Minivation** (under-engineered for WTP — leaves money on the table), **Hidden Gem** (high-WTP innovation killed by poor business model or org complacency), **Undead** (a product nobody asked for, dressed up after the fact). The pricing page is where Feature Shock and Hidden Gem most often surface in the wild — too many tiers / too many bullets, or the highest-value capability buried below a "Pro" tier.
- **Good / Better / Best (G/B/B) tiering** (Ch.6) — three tiers map to three WTP segments. Three is the sweet spot. Four is acceptable only when the fourth tier is a usage-volume tier (not a feature-tier). 5+ tiers = comparison paralysis.
- **WTP segmentation** — segment by needs + value perception + WTP, not by demographics or company size proxies. The "best for [persona]" line on each tier is the page's segmentation surface.
- **Customer Value-Based Pricing** (Ch.7) — price on the *quantified value the buyer gets*, not on cost-plus or competitor benchmarks. Competitors anchor expectations; they don't set price.
- **Behavioral Pricing Tactics** (Ch.11) — anchor tier (the un-pickable expensive tier) is not there to convert; it's there to make the middle tier feel reasonable. Decoy effect, price endings, annual vs monthly framing all live here.
- **Maintain Price Integrity** (Ch.12) — "Contact us" everywhere is a pricing-confidence failure, not a strategy. Use it for true enterprise customization, not as a default for every tier.

### Hormozi — $100M Offers
- **The Value Equation**: Perceived Value = (Dream Outcome × Perceived Likelihood of Achievement) / (Time Delay × Effort & Sacrifice). The pricing page is where the equation either visibly closes or doesn't. Each tier headline should express dream outcome + likelihood, not feature inventory.
- **Trim & Stack**: strip features that don't drive perceived value out of cheaper tiers; *stack* high-perceived-value differentiators into the middle and top tiers. The "what's NOT included" surface matters as much as what's included — buyers who can't see the trim feel manipulated when they hit the gate.
- **Problems & Solutions stack inside tiers** — each "Best for X" line should map to a constellation of related problems the persona faces, not a single feature.
- **Naming & wrapper strategy** — tier names ARE wrappers. "Solo / Team / Scale" wraps job-to-be-done; "Basic / Pro / Enterprise" wraps a hierarchy of payment. The corpus consensus (and Hormozi) say: pick wrappers that map to identity, not to capability level.

## Corpus citations (top 10)

1. PMA — B2B pricing and plans
2. PMA — Messaging your AI pricing model / brief history of software pricing models
3. Ella Berylo / PMA — What pricing model should you choose in 2026?
4. Kyle Poyar — The state of usage-based pricing / common pitfalls
5. Wes Bush — ProductLed: build a high-converting pricing page
6. Wes Bush — ProductLed: how to build a product-led pricing page
7. Maja Voje — The Go-To-Market Strategist (book, p.163, p.169)
8. Madhavan Ramanujam — Monetizing Innovation (book, p.243)
9. Wes Bush — ProductLed: B2B SaaS copywriting / persuasion above the fold

### What the corpus added beyond the books

- **Tier naming as identity, not capability** — corpus convergence on "Solo / Team / Scale" (job-to-be-done framing) over "Basic / Pro / Enterprise" (capability hierarchy). Identity tier names cause self-selection; capability tier names cause friction. Codified into the negative system prompt.
- **Gate on value signals, not cost signals** — the question to ask when feature-gating: "what feature, when used, signals the customer is ready to pay more?" That's your gate. SSO, audit logs, advanced roles, and integrations are classic value-signal gates because they signal organizational complexity, not just usage volume.
- **The middle tier is the page's job-to-be-done** — corpus consensus that the middle tier should feel like the obvious choice *before* the buyer reads the bullets. The high tier exists to anchor; the low tier exists to qualify out; the middle tier is where most revenue lives.
- **FAQ structure is objection-led, not logistics-led** — buyers ask "is this safe to buy?" while pages answer "how does billing work?". Standard objection set: data on cancel, plan changes, credit-card friction, value-metric clarity ("what counts as a user?"), seat math, contract length, refund policy, security/compliance.
- **"Hide the price" = pricing confidence failure** — using "Contact us" for every tier signals you don't trust your own pricing. Use only for genuine enterprise customization.
- **72% of innovation failures trace to monetization, not product** (Ramanujam, surfaced in corpus) — the canonical statistic that justifies treating the pricing page as a strategy artifact, not a marketing artifact.
- **Value-based pricing + feature-differentiated bundles outperform flat-rate by 30%+ in expansion revenue** — the page is where this structure becomes visible to the buyer.

### What the corpus contradicts / complicates

- Some practitioner blogs default to "Starter / Pro / Enterprise" naming. Corpus + book canon agree this is a generic-naming failure mode unless the brand has an explicit reason to stay generic. Skeleton enforces "tier name = identity / job, not capability level" with the generic option allowed only with stated rationale.
- Some usage-based pricing advocates push single-axis usage pricing as the future. Ramanujam + corpus complicate this: usage-based works when the value metric is intuitive (Segment's "active users" not "API calls"), fails when it's technical. Skeleton requires a packaging-strategy pre-work decision rather than assuming G/B/B.

## Design decisions

- **Skeleton order**: pre-work (packaging strategy lock + WTP bands + champion persona inheritance) → hero (one-line value reminder) → tier grid (3 tiers, fixed schema per tier) → comparison strip / feature matrix → FAQ (objection-led, 8-12 questions) → social proof → contact-sales bridge → footer CTA. Order mirrors how a serious buyer scans the page: tier → matrix → objections → proof → action.
- **Pre-work is gating, not optional** — explicit "STOP: do not draft pricing page copy until the packaging strategy review is complete" warning. Pricing page copy is downstream of monetization strategy; drafting copy first locks in a structure that then has to be rewritten when the strategy lands. The negative system prompt and skeleton both enforce this.
- **3-tier G/B/B as default, with explicit branch** — pre-work asks the user to confirm structural choice: G/B/B (3 tiers), G/B/B + Volume (4 tiers, fourth is usage), single tier, usage-based, or contact-sales. One structural option must be chosen before drafting; mixing produces incoherent pages.
- **Per-tier schema is fixed**: tier name (identity-led), value-statement headline (one sentence, one outcome), monthly + annual price (with anchor on annual saving), "best for [persona]" line, what's INCLUDED bullets, included usage limits, what's NOT INCLUDED at this tier (Hormozi trim discipline), primary CTA. The "not included" surface is mandatory — buyers who hit a hidden gate feel manipulated.
- **FAQ is objection-led, 8-12 questions** — standard objection set baked in (data on cancel, plan changes, credit-card requirement, value-metric definition, seat counting, annual vs monthly, contract length, refund/cancellation, security/compliance, custom-pricing trigger, plan downgrade, free-trial terms). Each Q is a real buyer objection; each A reduces friction or restates a tier benefit.
- **Comparison strip / feature matrix** is required as a tier-jumper aid — buyers comparing across tiers need a side-by-side. Not a 60-row matrix; a 12-20 row "what changes" matrix focused on the value-signal gates.
- **Negative system prompt is heavy and book-anchored** — calls out Feature Shock and Hidden Gem by their Ramanujam labels (in plain English, no name-dropping), Trim discipline by behavior, and the corpus failure modes (5+ tiers, generic capability-led naming, hidden gates, "Contact us" as default, no anchor tier, lead with feature counts).

### Differentiation from adjacent artifacts

- **vs. Landing Page Copy (35)** — LP is a single-objective conversion page (one CTA, one offer wrapper, AIDA arc). Pricing page is a multi-tier *self-selection* page where the visitor's job is to find their tier, not be persuaded into a single CTA. Different shape, different job. Pricing page inherits positioning and messaging like LP does, but its core structure is the tier grid, not the AIDA arc.
- **vs. Positioning Statement (1) / Messaging Framework (2) / Value Proposition Canvas (4)** — those are upstream strategic inputs the pricing page consumes. Skeleton requires inheriting (not re-deriving) the differentiated value, persona, and value statements.
- **vs. Comparison Matrix (competitor)** — the pricing-page comparison strip is *self-comparison across tiers*, not competitor comparison. Different artifact. The competitor comparison matrix is artifact 8 and should not be confused.

## Open questions

- Should the template include a "annual contract / multi-year discount" sub-block, or fold it into the per-tier schema? Currently folded into per-tier "monthly + annual price".
- A/B variant scaffolding for tier headlines (3 alt headlines per tier?) — currently 1 headline per tier. Trade-off: variant scaffolding is useful for mature teams but bloats the page for early-stage.
- Whether to require an explicit "decoy / anchor tier" callout in the highest tier. Currently implicit (the highest tier exists to anchor); could be made explicit in the schema.
- Free-trial vs. demo CTA routing on the cheapest tier — handled in landing-page-copy (35) and not duplicated here. The pricing page inherits the time-to-value decision rather than re-asking.

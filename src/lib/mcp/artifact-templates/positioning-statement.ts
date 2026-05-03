/**
 * Positioning Statement template for the generate_artifact MCP tool.
 *
 * Canonical source (read first per .planning/mcp-phase-2/methodology.md):
 *   April Dunford — Obviously Awesome 2nd ed (2026). Validation: Dunford —
 *   Sales Pitch (8-step storyboard). Adjacent: Moore — Crossing the Chasm
 *   (early-market); Ries — Play Bigger (category creation).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/01-positioning-statement.md
 *
 * Why this template diverges from the conventional "For [target] who [need],
 * our [product] is a [category] that [benefit], unlike [competitor]…" formula:
 * Dunford v2 explicitly critiques that sentence template — it assumes you
 * already know the answers, doesn't reveal better options, and nobody uses
 * the output. We follow v2's 5-component structure with renamed nomenclature
 * (Distinct Capabilities / Differentiated Value / Best-Fit Accounts) and
 * replace the sentence with the Sales Pitch test as validation.
 */

import type { ArtifactTemplate } from './types'

const POSITIONING_SYSTEM_PROMPT = `You are drafting a positioning statement — \
the internal strategic document that drives all downstream messaging. This is \
NOT a tagline or marketing copy. It is the proof that strategic thinking has happened.

Avoid these failure modes:
- Inside-out language ("we built X") — start from what the buyer would do without you
- Generic differentiators ("easy to use", "enterprise-grade", "AI-powered") — \
anything a competitor could lift verbatim is table stakes, not a Distinct Capability
- Vague Best-Fit definition — psychographic + situational specificity, not demographics
- Cake-as-lollipop trap — positioning what you set out to build, not what you actually built. \
If happy customers are using the product in unexpected ways, that's the signal
- Market-shifted-around-you trap — the world changed (new category emerged, buyer expectations \
shifted, an adjacent tool ate your job-to-be-done) but the positioning didn't. Re-check \
Competitive Alternatives against current buyer behavior, not last year's deck

Position for ONE champion persona — the buyer who leads the deal and recommends to the \
economic buyer. Other stakeholders are handled via objection responses, not by diluting \
the positioning to cover everyone.

If positioning a multi-product portfolio (suite, platform, family), pick ONE structural \
option before drafting: cascading (company = sum of products), lead-product (sell one \
first), product-family (any-order suite), or segment-specific (different buyers per \
product). Mixing options produces incoherent positioning.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const positioningStatementTemplate: ArtifactTemplate = {
  artifactType: 'positioning_statement',
  title: 'Positioning Statement',
  systemPromptFragment: POSITIONING_SYSTEM_PROMPT,
  // Skeleton order follows Dunford v2's strategic thinking order:
  // alternatives FIRST (differentiation is meaningless without an alternative),
  // then capabilities → value → who cares → what frame → validation.
  skeleton: `# Positioning Statement: [Product Name]

## Pre-work (decisions made before drafting)

- **Timing readiness:** [Do you have enough happy customers to see a pattern? If not, this is loose positioning — revisit when the pattern is clearer.]
- **What you're positioning:** [Single product / multi-product / platform / company. If multi-product, which structural option: cascading, lead-product, product-family, or segment-specific?]
- **Champion persona:** [The ONE buyer who leads the deal and sells internally to the economic buyer. Title, seniority, what they own, what makes them say yes.]
- **Excluded accounts:** [Outliers, biggest-but-weirdest customers, edge segments — explicitly removed from the exercise so they don't distort the pattern.]

## Competitive alternatives
[What would the champion actually do if [Product] didn't exist? Real alternatives — spreadsheets, internal builds, doing nothing, an adjacent tool repurposed — not just named competitors. List the top 2-4 alternatives and the specific gap each one leaves.]

## Distinct capabilities
[Capabilities [Product] has that the alternatives genuinely lack. Specific, demonstrable, defensible. If a competitor could plausibly match it in 2 quarters, it's a roadmap item, not a Distinct Capability. List 3-5.]

## Differentiated value
[For each Distinct Capability, the *business benefit* it enables — risk avoided, number moved, time saved, decision unlocked. NOT all the value [Product] delivers; specifically the value only [Product] can deliver. Cluster into 1-3 themes max — this is the core of all downstream messaging.]

## Best-fit accounts
[Characteristics of *companies* that care most about the differentiated value: buy quickly, don't grind on discounts, intuitively understand the value, refer others. Psychographic + situational + firmographic — not demographics. "Mid-market RevOps teams running on a Salesforce + 8 spreadsheets stack who just hired their first analytics lead" is best-fit. "B2B SaaS companies" is not.]

## Market category
[The competitive frame the champion uses to evaluate [Product]. A strategic choice, not a labeling exercise: pick a category where your strengths are *expected norms*, not differentiators. Wrong category = priced and judged on the wrong criteria.]

---

## Validation: the sales pitch test

[Can you build an 8-step sales narrative from this positioning that lands the differentiated value with the champion in 90 seconds?
1. Insight — the shift in the buyer's world
2. Old game — what stopped working
3. New game — the new winning approach
4. Promised land — what success looks like
5. Old-way obstacles — why the alternatives fall short
6. New-way features — your distinct capabilities
7. Proof — customer evidence
8. Ask — the next step

If you cannot build this from the positioning above, the positioning isn't done. Vague capabilities produce vague pitches.]
`,
}

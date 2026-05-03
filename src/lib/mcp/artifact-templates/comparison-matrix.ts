/**
 * Comparison Matrix template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Stratton — Punchy (Competitive Messaging Audit, VBF rule, BBQ Talk
 *   applied to row labels). Corpus carries roughly equal weight here:
 *   PMA practitioner blogs + Kyle Poyar (legal-claim discipline,
 *   surface split, dimension sourcing from win/loss + review-site +
 *   RFP teardown).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/17-comparison-matrix.md
 *
 * Why this artifact is distinct from the battlecard (artifact 16): the
 * battlecard is a per-competitor narrative document with talk tracks,
 * objections, and rep-facing context. The comparison matrix is a
 * multi-competitor table — rows = buyer-criterion dimensions, columns =
 * vendors + Us. Conflating them produces matrices that read like
 * battlecards (defensive, internal-tone) on public surfaces, and
 * battlecards that read like matrices (no narrative, no rep guidance)
 * internally.
 *
 * The template forces an upfront surface declaration (customer-facing
 * vs. internal) because the candor level, legal-review requirement, and
 * acknowledged-strength row are all surface-dependent.
 */

import type { ArtifactTemplate } from './types'

const COMPARISON_MATRIX_SYSTEM_PROMPT = `You are drafting a competitive \
comparison matrix — a multi-competitor table where rows are buyer-evaluation \
criteria and columns are vendors plus Us. This is NOT a battlecard (per-competitor \
narrative with talk tracks) and NOT a feature inventory. It is a positioning tool \
that helps a buyer answer "why you, not them?" using their own evaluation criteria.

Surface matters. Confirm in pre-work whether this matrix is:
- Customer-facing (public comparison page, RFP response, sales-deck slide a \
prospect will see) — high honesty bar, legal review required for any factual \
competitor claim, one acknowledged competitor strength is mandatory
- Internal (rep-facing battlecard appendix, sales-enablement scorecard) — \
candor allowed, can name specific demo-time reframes, no public legal exposure

Hold the candor level consistent across the entire matrix. Mixing produces \
output that reads as defensive on public surfaces and unprepared internally.

Avoid these failure modes:
- Gotcha tables — picking dimensions specifically because you win every row. \
Buyers see through this instantly and it destroys credibility on every claim, \
including the true ones
- Feature soup — 20+ row tables of API endpoints, export formats, and \
authentication methods. Long feature lists do not reduce buyer confusion; they \
create it. Cap at 5-8 dimensions
- Vendor-criteria framing — letting a competitor's marketing categories define \
the rows. If you're comparing on their dimensions, you're playing on their \
field. Dimensions come from buyer evaluation criteria (win/loss interviews, \
review-site teardowns, RFP questions), not from competitor websites
- Defamation-risk claims — saying a competitor "doesn't support" something they \
support, even in beta, creates legal exposure. Every factual claim about a \
competitor needs a verifiable source dated within 90 days
- Unsourced performance claims — "3x faster", "50% cheaper", "lowest latency" \
require a reproducible methodology. Puffery ("best-in-class", "industry-leading") \
is fine; specific numeric claims are not
- Surface confusion — internal-battlecard candor on a public page reads as \
defensive; public-page softness in an internal artifact leaves reps unprepared. \
Confirm surface in pre-work and hold candor consistent
- Cell content as raw verdict — pure ✓/✗ with no explainer reads as propaganda. \
Every cell that distinguishes vendors should carry one short clause of \
buyer-language reasoning
- Stale or invented pricing — listing competitor pricing without a dated source \
creates misrepresentation risk. Either skip price rows or commit to a refresh \
cadence

Required behaviors:
- Render exactly 5-8 dimensions and exactly 2-4 competitor columns plus an \
"Us" column. Treat "Doing nothing / status quo" as a valid competitor column \
when buyers genuinely consider it
- Source every dimension from at least one of: a win/loss interview, a \
review-site (G2/TrustRadius/Capterra) gap mentioned by buyers, or a lost-deal \
RFP question. Reject dimensions that fail this test
- On customer-facing matrices, include exactly one row where a competitor wins \
or matches, with a reframe of why it matters less for the ICP. Trust asymmetry: \
acknowledged weaknesses outperform perfect sweeps
- Pull buyer-language from the RAG corpus when filling cells — customer quotes, \
AMA transcripts, podcast snippets describing what was missing in competing \
products. Buyers' words outperform marketers' words even inside a table

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const comparisonMatrixTemplate: ArtifactTemplate = {
  artifactType: 'comparison_matrix',
  title: 'Comparison Matrix',
  systemPromptFragment: COMPARISON_MATRIX_SYSTEM_PROMPT,
  // Skeleton order: surface declaration → competitor selection → dimension
  // sourcing → matrix table (rows first, then cells) → acknowledged strength
  // (customer-facing only) → buyer-relevance validation → legal-claim audit.
  // Filling row-by-row (not column-by-column) keeps the buyer's evaluation
  // criterion as the unit of thought, not the vendor.
  skeleton: `# Comparison Matrix: [Product Name] vs. [Competitor Set]

## Pre-work (decisions made before drafting)

- **Surface:** [Customer-facing (public comparison page / RFP response / sales-deck slide a prospect will see) OR Internal (rep-facing battlecard appendix / sales-enablement scorecard). This choice gates the candor level, the legal-review requirement, and whether an acknowledged-competitor-strength row is mandatory. The same matrix cannot serve both surfaces honestly.]
- **Competitor selection:** [2-4 named competitors plus Us. Below 2 isn't a comparison; above 4 dilutes the page and starts naming alternatives the buyer didn't have on their list. Include "Doing nothing / status quo" as a column when buyers genuinely consider the spreadsheet they already use as the alternative.]
- **Dimension sourcing:** [List the source for each dimension before drafting. At minimum, populate one of: (a) win/loss interview themes — what criteria the buyer used internally; (b) review-site (G2/TrustRadius/Capterra) gaps that buyers describe in their own language; (c) lost-deal RFP questions — reverse-engineer evaluation criteria from the actual buying process. A dimension with no source is a vendor-feature, not a buyer-criterion.]
- **Positioning input:** [If a positioning statement exists for this product, the Competitive Alternatives + Distinct Capabilities seed the dimension list. Cell content for the Us column inherits the Differentiated Value language from that doc.]

---

## Matrix

| Dimension (buyer criterion) | Us | [Competitor 1] | [Competitor 2] | [Competitor 3 or "Status quo"] |
|---|---|---|---|---|
| **[Dimension 1 — buyer-language label, BBQ-Talk passing. Test: could a buyer use this row to explain their decision to a skeptical colleague? If not, rewrite or cut.]** | [✓ + one-line explainer in buyer language. Outcome-level, not capability-level. "Deploys in 30 seconds with no IDE required" beats "Supports zero-config setup".] | [Honest assessment with one-line explainer. Sourced from review-site, win/loss, or competitor's own docs. No defamation-risk claims.] | [Per Competitor 1.] | [Per Competitor 1. For "Status quo", describe what the buyer's current spreadsheet/manual process actually does.] |
| **[Dimension 2 — per Dimension 1.]** | [Per row 1.] | [Per row 1.] | [Per row 1.] | [Per row 1.] |
| **[Dimension 3 — per Dimension 1.]** | [Per row 1.] | [Per row 1.] | [Per row 1.] | [Per row 1.] |
| **[Dimension 4 — per Dimension 1.]** | [Per row 1.] | [Per row 1.] | [Per row 1.] | [Per row 1.] |
| **[Dimension 5 — per Dimension 1. This is the floor. Add up to 3 more if buyer-criterion-grounded.]** | [Per row 1.] | [Per row 1.] | [Per row 1.] | [Per row 1.] |

[Optional rows 6-8: add only if each is independently grounded in win/loss, review-site, or RFP sourcing. Stop at 8. Below 5 reads selective; above 8 reads as feature inventory.]

---

## Acknowledged competitor strength
[CUSTOMER-FACING SURFACE: required. Name one dimension where a competitor genuinely wins or matches Us, then reframe why it matters less for the ICP. Trust-page asymmetry: acknowledged weaknesses outperform perfect sweeps. Format: "[Competitor X] is stronger on [dimension] — [honest acknowledgement]. For [ICP], that matters less because [reframe grounded in the buyer's actual workflow / priority]." INTERNAL SURFACE: optional; include if reps need to know what they actually lose on so they can pre-empt the objection.]

---

## Buyer-relevance validation

- **Could the buyer use each row to explain the decision to a skeptical colleague?** [Mark any row that fails — those are vendor-features, not buyer-criteria, and should be cut or rewritten.]
- **BBQ Talk on row labels:** [Read each dimension label aloud as if explaining to a friend at a barbecue. Anything that needs jargon translation gets rewritten.]
- **Competitor-criteria check:** [Are any rows lifted from a competitor's own marketing categories? If yes, you're playing on their field — replace with criteria sourced from buyers.]
- **Sweep check:** [Do you win every single row? On customer-facing surfaces, this signals propaganda. Either acknowledge a real competitor strength (see section above) or remove dimensions that exist only to manufacture wins.]

---

## Legal-claim audit

[Required before any matrix is published on a customer-facing surface. Internal matrices are exempt from #6 only.]

1. **Sourced factual claims:** [Every factual claim about a competitor (feature support, SLA, integration, certification) has a verifiable source dated within 90 days. List source per cell.]
2. **Performance methodology:** [Any "Nx faster", "N% cheaper", "lowest latency" claims have a reproducible methodology you can defend. Document the methodology or remove the claim.]
3. **No "doesn't support" overstatements:** [Confirm no cell claims a competitor lacks a feature they have, even in beta or behind a feature flag. Defamation and false-advertising risk.]
4. **Puffery vs. verifiable:** [Subjective claims ("best-in-class support", "industry-leading reliability") are puffery and fine. Numeric or factual claims need verification. Re-read each cell against this line.]
5. **Pricing freshness:** [If pricing rows are included, every price is dated and a refresh cadence is set. Stale competitor pricing creates misrepresentation risk; consider removing pricing rows entirely.]
6. **Legal review:** [Any matrix going on a public URL with named competitors gets legal sign-off. Owner: [name]. Date: [date].]
`,
}

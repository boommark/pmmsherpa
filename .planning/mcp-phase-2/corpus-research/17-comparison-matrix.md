---
title: "Phase 2 Audit — 17 Comparison Matrix"
artifact: comparison_matrix
canonical_books:
  - "Punchy (Emma Stratton)"
status: drafted
template_path: src/lib/mcp/artifact-templates/comparison-matrix.ts
research_path: .planning/mcp-phase-2/corpus-research/17-comparison-matrix.md
---

# Phase 2 Audit — 17 Comparison Matrix

This is the audit doc for the Comparison Matrix template — the multi-competitor
table artifact that lives on landing pages, in sales decks, and inside RFP
responses. Three sections: what the canon and corpus actually said about
matrices specifically (vs. battlecards), the structural decisions, and the
system-prompt asks (the most important block, since matrices have the highest
legal-exposure surface area of any Phase 2 artifact).

---

## 1. Findings across canon and practitioners

### Why Punchy is the anchor — and where it stops

Punchy is the canonical book in the artifact map for this artifact, but the
book itself does not give you a "comparison matrix" framework. It gives you
the **Competitive Messaging Audit**, which is the upstream input: map what
each competitor leads with, identify the 3-5 category clichés they converge
on, find the unclaimed positioning territory. That audit produces the
*dimension list* the matrix is built from.

What Punchy contributes to this artifact:

- **Dimensions are positioning territory, not feature counts.** The audit
  surfaces *what competitors say*, not what they ship. A comparison matrix
  built from feature parity tables will lose to one built from message-level
  differentiation, because buyers compare evaluation criteria — not SKUs.
- **The unclaimed-territory rule.** If your matrix dimensions are the same
  rows every competitor in the category puts on their own comparison page,
  you've ceded the evaluation criteria. Pick rows where your differentiation
  is structurally legible.
- **VBF carries through.** Even inside a comparison row, the cell content
  should read as outcome-level, not capability-level. "30-second deploy"
  beats "supports zero-config setup" because the first is a buyer outcome
  and the second is a vendor capability.
- **BBQ Talk filter applies to row labels.** A dimension labelled "Schema
  introspection depth" fails BBQ. A dimension labelled "Tells you what's
  in your data without you having to set it up" passes.

What Punchy does NOT cover for this artifact:

- The customer-facing vs. internal split (matrices have this; messaging
  frameworks don't).
- Format-level decisions (number of dimensions, ✓/✗ vs. cell explainers,
  number of competitors per matrix).
- **Legal exposure on competitor claims** — the single biggest practitioner
  failure mode that Punchy cannot speak to because it's a publishing-risk
  question, not a craft question.

This is one of the artifacts where corpus carries roughly equal weight to
the book.

### What corpus added (the load-bearing additions)

The corpus query returned a single synthesized response with 10 citations.
Six PMA practitioner blogs, one Kyle Poyar substack on B2B contracts, one
Wes Bush productled.com piece on B2B SaaS growth blockers, plus generic
B2B-buyer chunks. The synthesized response is unusually clean for this
artifact — it directly maps onto the brief's failure-mode list — so the
audit decisions below cite it heavily.

Net-new contributions the book did not provide:

1. **Three deployment surfaces, three jobs.**
   - Public comparison page → trust-building for self-serve buyers Googling
     "[us] vs. [them]". Honesty bar is high; one or two acknowledged
     competitor strengths *increase* credibility on the rows you do win.
   - Sales deck slide → live-conversation anchor; rep can narrate.
   - RFP response → formal justification document; defensible, sourced.
   Same logic, different candor levels. **This split shapes the template's
   pre-work step 1.**

2. **Dimension sourcing — three reliable inputs.**
   - Win/loss interviews (what criteria buyers actually used)
   - Review-site filters (G2/TrustRadius reviews that describe what was
     *missing* in competitors → buyer-language gaps, not vendor-language
     features)
   - Lost-deal RFP questions (reverse-engineer evaluation criteria from
     the actual buying process)
   Output target: 5-8 dimensions that map to real buying decisions.
   *Test:* could a buyer use this row to explain their decision to a
   skeptical colleague?

3. **The legal exposure list — concrete, named claims.** The corpus draws
   the line clearly:
   - "3x faster" → factual claim, needs reproducible methodology you can
     defend in a courtroom
   - "Best-in-class support" → puffery, probably fine
   - "Competitor X has a 48-hour response SLA" → factual claim about a
     competitor, needs a source
   - "Competitor doesn't support feature Y" when they do, even in beta →
     defamation / false advertising risk
   This becomes a system-prompt failure mode block in its own right.

4. **The "5-8 dimensions" range.** Practitioner consensus across the corpus.
   Below 5 looks selective; above 8 dilutes into feature soup. Three is too
   few to be persuasive on a public page; ten is feature inventory.

5. **Trust-page asymmetry.** A matrix where you win every row signals
   propaganda. Acknowledging one competitor strength (then reframing why
   it matters less for your ICP) outperforms a perfect sweep on the
   public-page surface. **This contradicts the natural instinct on the
   internal battlecard surface, which is precisely why the surface split
   matters.**

### Where canon and corpus disagreed

There was no head-to-head conflict. The book is silent on the legal,
surface-split, and dimension-sourcing questions; the corpus is silent on
the upstream Competitive Messaging Audit logic. They compose. The merge
is clean.

The only soft tension: a few PMA blogs use "comparison chart" and
"battlecard" interchangeably. We do not. **A battlecard is a per-competitor
narrative document with talk tracks, objection handling, and rep-facing
context. A comparison matrix is a multi-competitor table with rows =
dimensions, columns = vendors.** Artifact 16 is the battlecard; this is
the table. The system prompt enforces this distinction.

### Where they merged

- **Dimensions = buyer criteria, not feature list.** Punchy frames this as
  positioning territory; the corpus frames it as buyer-justification
  language. Same conclusion, two roads. We use the corpus's three sourcing
  methods (win/loss, review-site filters, RFP questions) inside Punchy's
  upstream-audit logic.
- **Cell content stays VBF.** Punchy's outside-in rule applies to cells.
  The corpus's "could a buyer use this row to explain their decision"
  test is the BBQ Talk filter for matrix rows. Same test, different name.

---

## 2. Why we chose this template structure

### Structural decisions

**Pre-work Step 0: surface declaration.** Before any drafting, the template
forces a binary choice — customer-facing (public page / RFP) or internal
(sales-deck-slide / battlecard appendix). This is not optional. The same
matrix cannot serve both surfaces honestly. The choice gates the candor
level, the legal-review requirement, and the cell-content style.

**Pre-work Step 1: competitor selection.** 2-4 named competitors. Below 2
isn't a comparison; above 4 dilutes the page and starts naming alternatives
the buyer didn't have on their list. Include "Doing nothing / status quo"
as a column when relevant — many buyers' real comparison set includes the
spreadsheet they already use, not just other vendors.

**Pre-work Step 2: dimension sourcing.** Three required inputs, named
explicitly: win/loss interviews, review-site teardown, lost-deal RFP
questions. The skeleton prompts the user to populate at least one before
drafting dimensions. This is the corpus's strongest contribution and the
fix for the #1 failure mode (feature soup with no buyer relevance).

**The matrix itself: 5-8 dimensions × 2-4 competitors + Us.** Locked range,
not a free-text count. Below 5 reads selective; above 8 reads as feature
inventory. The skeleton renders a single markdown table with bracketed
prompts in every cell so the model fills it row-by-row, not column-by-column
(filling column-by-column produces vendor-centric framing; filling
row-by-row keeps the buyer's evaluation criterion as the unit of thought).

**Cell content: ✓/✗ + one-line explainer, not raw checkmarks.** Pure
✓/✗ tables read as gotcha. A short explainer in the *Us* column ("Yes —
deploys in 30 seconds with no IDE required") and a candid line in
competitor columns ("Limited — requires CLI install and config file")
gives the buyer reasoning, not just a verdict. Surface-dependent: the
public-page version expects two distinct cell formats — short label for
quick scan, expandable detail for the curious buyer.

**Mandatory "competitor strength" row on customer-facing matrices.** One
row where the user explicitly names a dimension a competitor wins on, with
a reframe of why it matters less for the ICP. This is counter-intuitive
and corpus-driven: trust-page asymmetry. The skeleton prompts for it on
the customer-facing surface and marks it optional (skip if it would
mislead reps) on the internal surface.

**Validation block: legal-claim audit.** Six explicit checks before
publishing:
1. Every factual claim about a competitor has a source dated within 90 days
2. Performance comparisons have a reproducible methodology
3. No "doesn't support" claims about features the competitor has even in
   beta
4. Puffery is fine; verifiable claims need verification
5. Pricing claims are dated (competitor pricing changes; stale pricing
   becomes a misrepresentation claim)
6. Legal review for any matrix going on a public URL with named competitors

This is a separate validation block from the buyer-relevance validation
because it has different reviewers (legal, not PMM) and different stakes.

### Trade-offs accepted

- **No feature-by-feature deep dive.** That's a battlecard appendix or
  spec-sheet artifact. The matrix stays at the buyer-criterion altitude.
- **No internal scoring / red-yellow-green.** Sales enablement teams
  sometimes use scored matrices for territory planning. Different artifact
  (sales-enablement scorecard, not in scope).
- **No price columns by default.** Optional row, but pricing matrices
  go stale fast and create misrepresentation risk. The skeleton flags it.
- **No "winner" callout per row.** Buyers should infer; vendors stating
  "Winner: Us" on every row triggers the gotcha-table failure mode.

### Section-to-source map

| Template section | Source |
|---|---|
| Pre-work: Surface declaration | Corpus (three-deployment-surfaces synthesis) |
| Pre-work: Competitor selection | Corpus + Punchy (positioning frame: include "doing nothing") |
| Pre-work: Dimension sourcing | Corpus (win/loss + review-site + RFP triangulation) |
| Matrix table (5-8 × 2-4 + Us) | Corpus (range); Punchy (cell content stays outside-in) |
| Cell content style (✓/✗ + explainer) | Corpus (gotcha-table failure mode prevention) |
| Acknowledged competitor strength row | Corpus (trust-page asymmetry, customer-facing only) |
| Buyer-relevance validation | Corpus + Punchy BBQ Talk applied to row labels |
| Legal-claim audit | Corpus (only canon-touching source for this) |

### What we excluded and why

- **Per-competitor narrative / talk tracks** — battlecard artifact (16)
- **Demo-script reframes** — demo_script artifact (20)
- **Objection handling on competitor mentions** — objection_handling artifact (22)
- **Win/loss insights as deliverable** — win_loss_insights artifact (07);
  this template *consumes* its output as upstream input
- **Positioning components** — positioning_statement artifact (01);
  this template *consumes* the Competitive Alternatives + Distinct
  Capabilities as the upstream input that seeds the dimension list

---

## 3. System prompt asks (most important section)

The system prompt is **failure-mode-heavy by design** (8 negatives, 4
positives) per the project-wide convention encoded in `types.ts`. For this
artifact the negative-guidance ratio is *especially* important because the
default model behavior on "build me a comparison table for product X vs.
competitor Y" is to scrape the competitor's marketing page and produce a
gotcha table — exactly the dominant failure mode.

### Negative-guidance lines

1. **"Gotcha tables — picking dimensions specifically because you win every
   row. Buyers see through this instantly and it destroys credibility on
   every claim, including the true ones."**
   - *Why:* The corpus's #1 failure mode. Models default to this because
     the pretraining corpus is full of vendor-authored comparison pages.
   - *Source:* Corpus (synthesized failure-mode block).

2. **"Feature soup — 20+ row tables of API endpoints, export formats, and
   authentication methods. Long feature lists do not reduce buyer
   confusion; they create it. Cap at 5-8 dimensions."**
   - *Why:* The structural counter to the engineering-team instinct to
     enumerate every capability.
   - *Source:* Corpus + Punchy (altitude rule).

3. **"Vendor-criteria framing — letting a competitor's marketing
   categories define the rows. If you're comparing on their dimensions,
   you're playing on their field. The dimensions should come from buyer
   evaluation criteria (win/loss interviews, review-site teardowns, RFP
   questions), not from the competitor's website."**
   - *Why:* The corpus's strongest sourcing rule. Without it, models
     scrape the competitor's site and reproduce their framing.
   - *Source:* Corpus.

4. **"Defamation-risk claims — saying a competitor 'doesn't support'
   something they support, even in beta, creates legal exposure. Every
   factual claim about a competitor needs a verifiable source dated
   within 90 days."**
   - *Why:* The corpus's load-bearing legal rule. Models do not default
     to this; they treat competitor capabilities as static facts.
   - *Source:* Corpus.

5. **"Unsourced performance claims — '3x faster', '50% cheaper', 'lowest
   latency' require a reproducible methodology. Puffery ('best-in-class',
   'industry-leading') is fine; specific numeric claims are not."**
   - *Why:* Distinct from #4 because the failure mechanism is different
     (not defamation but false advertising / misrepresentation).
   - *Source:* Corpus.

6. **"Surface confusion — using internal-battlecard candor on a public
   comparison page (reads as defensive, untrusted), or using public-page
   softness on an internal battlecard (leaves reps unprepared). Confirm
   the surface in pre-work and hold the candor level consistent across
   the matrix."**
   - *Why:* The single most-named failure mode after gotcha tables.
   - *Source:* Corpus.

7. **"Cell content as raw verdict — pure ✓/✗ with no explainer reads as
   propaganda. Every cell that distinguishes vendors should carry one
   short clause of buyer-language reasoning."**
   - *Why:* Models default to checkmark grids because they're token-cheap.
   - *Source:* Corpus + Punchy (outside-in cell content).

8. **"Stale or invented pricing — listing competitor pricing without a
   dated source creates misrepresentation risk. Pricing changes; a
   matrix that was accurate at publication and inaccurate three months
   later is still a problem. Either skip price rows or commit to a
   refresh cadence."**
   - *Why:* Specific pricing-claim sub-case of #4 that practitioners
     under-appreciate.
   - *Source:* Corpus (Kyle Poyar B2B contracts citation).

### Positive asks

1. **"Render exactly 5-8 dimensions and exactly 2-4 competitor columns
   plus an 'Us' column. Treat 'Doing nothing / status quo' as a valid
   competitor column when buyers genuinely consider it."**
   - *Why:* Locks the range structurally.

2. **"Source every dimension from at least one of: a win/loss interview,
   a review-site (G2/TrustRadius/Capterra) gap mentioned by buyers, or a
   lost-deal RFP question. Reject dimensions that fail this test."**
   - *Why:* The corpus's strongest sourcing rule, restated as positive
     guidance because it requires active corpus pull.

3. **"On customer-facing matrices, include exactly one row where a
   competitor wins or matches, with a reframe of why it matters less
   for the ICP. Trust asymmetry: acknowledged weaknesses outperform
   perfect sweeps."**
   - *Why:* The single most counter-intuitive rule. Without explicit
     positive guidance, models will not include this.

4. **"Pull buyer-language from the RAG corpus when filling cells —
   customer quotes, AMA transcripts, podcast snippets describing what
   was missing in competing products. Buyers' words outperform
   marketers' words even inside a table."**
   - *Why:* Carries Punchy's VBF rule into cell-level drafting.

### Why negative > positive for this artifact

Three reasons specific to comparison matrices:

1. The pretraining corpus is dominated by vendor-authored comparison
   pages, almost all of which are gotcha tables. Suppressing the failure
   prior requires explicit naming.
2. Legal-exposure failure modes are not visible in the output text —
   "Competitor X doesn't support OAuth" *looks* fine, but if it's wrong
   (or true only in a narrow sense) it creates exposure. Negative
   guidance encodes the publishability filter.
3. Surface confusion (public vs. internal) is structurally invisible to
   the model unless it's named.

---

## Open questions for audit

- **Should the surface declaration drive *two* skeletons (one
  customer-facing, one internal) or one skeleton with surface-dependent
  prompts?** Currently one skeleton, surface-aware prompts. Argument for
  two: candor levels differ enough that one prompt-set creates muddled
  output. Argument for one (chosen): prevents drift between surfaces and
  keeps the artifact composable.
- **Should we render the matrix as a markdown table or as a structured
  YAML the renderer converts to a table?** Currently markdown table. YAML
  would let downstream artifacts (landing_page_copy, sales_pitch_deck)
  programmatically lift rows. Defer to a Phase 3 decision once those
  composition patterns are real.
- **Acknowledged-competitor-strength row: required or optional?**
  Currently required on customer-facing, optional on internal. Some
  practitioners argue it should be required on internal too ("reps need
  to know what they actually lose on"). Punted to user audit.
- **Corpus gap:** the citation list returned `[blog] ?` for two PMA
  chunks with no URL — broken metadata. Logged in `corpus-gaps.md`. Did
  not block this template since the synthesized response carried the
  signal cleanly.

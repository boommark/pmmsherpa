/**
 * Win/Loss Insights Summary template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   No specific Book Brain canon — practitioner-owned discipline. Authority
 *   from PMA blogs (Maas, Haslam, Tengberg, Emmett, Ganpaul) and
 *   specialty-firm methodologies (Clozd, DoubleCheck, Anova).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/07-win-loss-insights.md
 *
 * Why this direction: Win/loss programs underdeliver because they ship one
 * layer of the three-layer deliverable (usually themes alone, or numbers
 * alone). The skeleton enforces all three structurally: segment-cut Numbers,
 * synthesized Themes, Verbatim Quotes. Recommendations are owner-tagged to
 * downstream artifacts (positioning, battlecard, ICP, roadmap, enablement)
 * so insights can't die in the deck. Failure-mode-heavy system prompt
 * because the entire discipline is bias suppression — selection bias,
 * confirmation bias, and asking-the-wrong-questions are the three traps.
 *
 * This is the AGGREGATED INSIGHTS deliverable, not raw transcripts and not
 * the interview guide. Distinct from case_study (37) which is a marketing
 * artifact built from the same buyer voice.
 */

import type { ArtifactTemplate } from './types'

const WIN_LOSS_INSIGHTS_SYSTEM_PROMPT = `You are drafting a Win/Loss Insights \
Summary — the strategic intelligence document that distills 20+ buyer interviews \
into themes, verbatim quotes, segment-cut numbers, and owner-tagged recommendations \
that change positioning, battlecards, ICP, roadmap, and enablement. This is NOT raw \
transcripts. This is NOT an interview guide. This is NOT a single deal post-mortem. \
It is the synthesized layer that drives downstream change.

Avoid these failure modes:
- Selection bias — interviewing only deals that reached formal decision and were \
logged in CRM. Misses early-stage losses, never-considered deals, deals that \
stalled and never closed-lost. The volume problem hides outside the CRM gate
- Confirmation bias — interviewing wins more than losses (warmer access) and asking \
validation questions ("did our messaging resonate?") instead of challenge questions \
("where did you lose confidence in us?"). The harder question is 10x more valuable
- Asking the wrong questions — feature/pricing focus when the actual decision \
drivers are organizational: champion couldn't build internal consensus, procurement \
surfaced a risk concern nobody addressed, the competitor's implementation story \
was more credible. Most deals are not lost on feature gaps
- Shipping only themes (no numbers, no verbatim quotes) — themes without segment \
cuts hide strategic signals; themes without quotes are editorialized opinion
- Shipping only numbers (no themes, no quotes) — win-rate dashboards without \
synthesized causal patterns leave the GTM team with data and no decision
- Themes that summarize ("buyer X said pricing was high") instead of patterning \
("price-to-value perception breaks down in mid-market deals when the economic \
buyer enters late stage"). Patterns are causal; summaries are not
- Insights without recommendations — themes that don't terminate in "what we'll \
change" and "who owns it" become wallpaper. Every theme must produce 1-2 \
owner-tagged recommendations
- Conflating product gaps with messaging gaps — "buyers who left say they had \
feature X and we didn't" is product. "Buyers who stayed say they almost left \
because they didn't know we had X" is messaging. Opposite fix. Sending roadmap \
budget to fix a marketing problem is the most expensive version of this mistake
- Skipping segment cuts — win rate without persona, deal size, competitor, and \
region cuts hides the strategic signal entirely
- One-and-done framing — single cycles don't move the needle. The artifact \
should signal cadence (quarterly default) and how prior-cycle themes are \
re-tested in the current cycle

Sample discipline: 20+ interviews minimum before patterns are trustworthy. \
Stratify across wins/losses, deal sizes, persona types (champion, economic \
buyer, IT/security), and loss stages (early ghosting vs. late-stage \
competitive loss). A discovery-stage loss tells a different story than a \
POC-stage loss.

Interviewer bias note: third-party interviewers consistently surface truths \
in-house teams cannot extract — buyers tell neutral parties what they will not \
say to anyone with relationship stake. If interviews were run in-house, name \
the bias explicitly in the Methodology section and flag the affected themes.

Reference frameworks implicitly. Do not name-drop authors, services, or \
specialty firms in the output.`

export const winLossInsightsTemplate: ArtifactTemplate = {
  artifactType: 'win_loss_insights',
  title: 'Win/Loss Insights Summary',
  systemPromptFragment: WIN_LOSS_INSIGHTS_SYSTEM_PROMPT,
  // Order: methodology (sample + stratification = the auditability layer) →
  // numbers (segment-cut win rates) → themes (synthesized causal patterns) →
  // verbatim quotes (the credibility + behavior-change layer) → recommendations
  // (owner-tagged) → downstream impact (the feeder relationships) → cadence
  // (single cycles don't compound). Three-layer deliverable enforced
  // structurally: ship all three layers or the artifact is incomplete.
  skeleton: `# Win/Loss Insights Summary: [Cycle / Quarter]

## Methodology snapshot

[Without this section, no insight below is auditable. Be specific.]

- **Sample size:** [Total interviews. Aim for 20+ before patterns are trustworthy.]
- **Stratification:** [Wins vs. losses count. Deal size buckets. Persona mix (champion / economic buyer / IT). Loss stage breakdown (discovery / mid-funnel / POC / late-stage competitive). If any axis is thin, name it as a sample limitation.]
- **Interviewer:** [Third-party (firm/contractor) or in-house. If in-house, name the relationship-stake bias and flag any themes most affected by it.]
- **Interview guide reference:** [Link to the guide. Confirm questions follow buyer journey, not your sales stages.]
- **Time window:** [Deals closed in this period.]
- **Excluded segments:** [Outliers, unusual deal types, or segments with insufficient data — explicitly removed so they don't distort patterns.]

## Layer 1 — Numbers (segment cuts)

[Win rate alone is uninformative. Cuts surface strategic vs. execution problems. If the program is too early for a statistical baseline, mark this as "small-sample qualitative" and skip the table — but do not skip the layer.]

- **Overall win rate:** [%]
- **By deal size:** [Bands. Note where rate diverges sharply — that's a strategic signal, not an execution one.]
- **By persona (champion type):** [Which champion profiles convert; which stall.]
- **By competitor:** [Win rate when each major alternative is in the deal.]
- **By region / segment / vertical:** [Where applicable.]
- **By loss stage:** [Discovery / mid-funnel / POC / late-stage. Tells you where deals die.]

[For each cut where rate diverges materially: one-sentence interpretation. Strategic problem, execution problem, or sample-size artifact?]

## Layer 2 — Themes (synthesized causal patterns)

[Four to six themes per cycle. Themes are *causal patterns*, not summaries. "Price-to-value perception breaks down in mid-market deals when the economic buyer enters late stage" — not "buyers said pricing was high." Rank by frequency × deal impact.]

### Theme 1: [Causal pattern, not feature complaint]
- **Where it shows up:** [Which segment, persona, deal stage, competitor context.]
- **Frequency:** [How many of the N interviews surfaced this — denominator matters.]
- **Deal impact:** [Estimated revenue at stake or deals lost to this pattern.]
- **Root-cause hypothesis:** [Product gap, messaging gap, sales-process gap, or org-readiness gap. Be honest about which.]
- **Anchor quote:** [One verbatim line from a buyer that captures the pattern. See Layer 3 for the full quote bank.]

### Theme 2: [...]
[Repeat structure.]

### Theme 3: [...]
### Theme 4: [...]
[3-6 themes total. Two is incomplete; seven dilutes signal.]

## Layer 3 — Verbatim quotes

[The most undervalued layer. A single specific buyer line moves sales behavior more than any slide deck. Pull 8-15 quotes, organized by theme. Each quote attributed by role + segment + win/loss only — never by name unless explicit consent.]

### On [theme 1 topic]
> "[Full verbatim quote.]"
> — [Role, segment, won/lost vs. competitor]

> "[Full verbatim quote.]"
> — [Role, segment, won/lost vs. competitor]

### On [theme 2 topic]
> "[...]"

[Continue for each theme. Include the standout quote that does NOT fit a theme but is too sharp to drop — flag as "outlier signal worth watching."]

## Recommendations (owner-tagged)

[Every theme produces 1-2 recommendations with explicit owners and downstream artifacts. Without owners, recommendations die in the deck.]

| # | Recommendation | Theme | Owner / Function | Downstream artifact | Priority |
|---|---|---|---|---|---|
| 1 | [Specific change, not "improve X"] | [#] | [Role / team] | [Positioning / Battlecard / ICP / Roadmap / Enablement / Pricing] | [P0 / P1 / P2] |
| 2 | [...] | | | | |
| 3 | [...] | | | | |

[Critical filter on each recommendation: is this a product gap or a messaging gap? Buyers who *left* citing missing feature X = product signal. Buyers who *stayed* saying they almost left because they didn't know X existed = messaging gap. Same surface symptom, opposite fix. Tag the recommendation accordingly.]

## Downstream impact

[The whole point of this artifact is what it changes elsewhere. Make the feeder relationships explicit so the consuming functions can pull what they need.]

- **Positioning statement:** [Which claimed differentiators landed in the buyer's room and which didn't. Where the gap between what we say and what buyers remember is widest. Specific revisions to push back to the positioning artifact.]
- **Battlecards:** [The verbatim objections each major competitor plants in the buyer's mind. The reframes that worked for the wins. Use buyer language, not product language.]
- **ICP refinement:** [Where wins clustered (best-fit pattern is reinforcing or shifting?). Where losses clustered (a segment to deprioritize, exclude, or re-qualify earlier?).]
- **Product roadmap:** [Product-gap signals only — separated from messaging-gap signals. Tied to revenue at stake from the Numbers layer.]
- **Sales enablement:** [Which verbatim quotes to surface in seller-facing assets. Which discovery questions reps should add. Which loss-stage handoff is leaking deals.]
- **Pricing / packaging (if applicable):** [Price-to-value patterns by segment. Discount-grinding signals from specific buyer profiles.]

## Cadence and re-test plan

[Single cycles don't compound. Programs running 2+ years see win-rate gains stack.]

- **Next cycle:** [Date. Same methodology, or what changes?]
- **Themes to re-test:** [Which prior-cycle themes are we explicitly testing for persistence or resolution this cycle?]
- **Sample-size targets next cycle:** [Where to stratify deeper; which thin axes to backfill.]

---

## Validation checks

- [ ] Sample size is 20+ OR explicitly flagged as "small-sample qualitative"
- [ ] Stratification across wins/losses, deal size, persona, loss stage is named
- [ ] Interviewer type (third-party vs. in-house) is named; bias acknowledged if in-house
- [ ] All three layers shipped: Numbers + Themes + Verbatim Quotes — not just one or two
- [ ] Themes are *causal patterns*, not single-quote summaries
- [ ] Each theme includes frequency (denominator), deal impact, and root-cause hypothesis
- [ ] At least 8 verbatim quotes with role + segment + win/loss attribution
- [ ] Every theme produces 1-2 owner-tagged recommendations with downstream artifact pointers
- [ ] Each recommendation tags product-gap vs. messaging-gap explicitly
- [ ] Downstream impact section names specific revisions for positioning, battlecard, ICP, roadmap, enablement
- [ ] No buyer named without explicit consent; quotes attributed by role/segment only
- [ ] Cadence + re-test plan named — not a one-and-done
`,
}

/**
 * Analyst Briefing Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Nancy Duarte — Resonate (used selectively: Frequency Tuning for the
 *   analyst's prior coverage; one-idea-per-slide; mentor stance reinterpreted
 *   as candid-expert-to-judge. NOT used: Hero's Journey, single S.T.A.R.
 *   moment — analysts are evaluators, not stage audiences). VandeHei/Allen/
 *   Schwartz — Smart Brevity (Core 4 applied at the briefing level — lede in
 *   the opening 2-3 min; Audience First; Short-Not-Shallow compression for
 *   proof points). Corpus (Tier 2) for AR-practitioner operational content:
 *   the three briefing types, the differentiation-with-proof rule, the
 *   evaluation-criteria-as-slide-titles rule, NDA hygiene, and the framing
 *   that an analyst briefing is a correction opportunity, not a presentation.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/33-analyst-briefing-deck.md
 *
 * Why this artifact diverges from artifact 24 (executive keynote): the keynote
 * is performance for a stage audience — single voice, Sparkline, S.T.A.R.
 * moment, threshold ask. The analyst briefing is conversation with an
 * evaluator audience — multi-presenter, plural specific proof points,
 * AR-style ask. Forcing keynote shape onto an analyst briefing produces a
 * sales pitch in disguise.
 *
 * Why this artifact diverges from artifact 19 (sales pitch deck): the sales
 * pitch is buyer-pain → product-fit → commercial close. The analyst briefing
 * is category-position → differentiation-with-proof → AR ask. Different
 * audience, different spine, different close.
 *
 * The single sharpest framing — adopted from the corpus — is the reframe:
 * "Analysts have talked to your top five competitors this month. They're not
 * looking for your story. They're looking for evidence that contradicts or
 * confirms the mental model they've already built about your category. The
 * briefing deck is a correction opportunity, not a presentation." Every
 * structural decision flows from that.
 */

import type { ArtifactTemplate } from './types'

const ANALYST_BRIEFING_DECK_SYSTEM_PROMPT = `You are drafting an analyst \
briefing deck — the deck a vendor presents in a scheduled 30-60 minute briefing \
with an industry analyst (Gartner, Forrester, IDC, GigaOm, Constellation, etc.) \
to influence Magic Quadrant / Wave / TechRadar placement and analyst inquiry \
response. The audience is an industry analyst, NOT a prospective customer, NOT \
an investor.

The single sharpest reframe: analysts have talked to your top five competitors \
this month. They are not looking for your story. They are looking for evidence \
that contradicts or confirms the mental model they have already built about \
your category. The briefing deck is a correction opportunity, not a \
presentation. Every structural decision flows from that.

The goal: get accurately classified in the right category, recognized for the \
right strengths, included in the right reports. The goal is NOT to close a \
deal, win an investment, or inspire a stage audience.

Avoid these failure modes:
- Sales pitch in disguise — every "differentiation" slide drifts toward \
buyer-pain → product-fit → commercial close. The analyst is an evaluator, not \
a buyer. If the deck reads like the sales pitch deck (artifact 19) with a \
different cover slide, the spine has collapsed. Test: read the slides without \
the cover. Could the analyst use it as a vendor-evaluation worksheet, or only \
as a marketing pitch?
- Lack of category fluency — using vendor-invented terminology when the \
analyst has a published category vocabulary. If the analyst calls the category \
"Sales Engagement Platforms" and the deck calls it "Revenue Acceleration \
Suites" without acknowledgment, vendor confidence collapses on slide 2. Use \
the analyst's term first; the vendor's preferred term, if different, is \
introduced explicitly as the vendor's reframe, not silently substituted.
- Don't surprise the analyst with category disagreement on their turf — if \
the vendor disagrees with the analyst's category definition, stage the \
disagreement after establishing the framing in the analyst's language. Never \
open by rejecting their map. The category-creation play (defining new \
evaluation criteria the incumbents were not built to satisfy) is legitimate \
but must be framed as a contribution to the analyst's thinking, not a \
correction of it.
- No proof points / no customer logos — claims without named customers + \
specific numbers + outcomes. "We're the only platform that does X" is a \
claim. "We're the only platform that does X, and here are three customers — \
[Logo A], [Logo B], [Logo C] — who used it to achieve [specific number] and \
[specific outcome]" is a proof point. Proof points move from the analyst's \
notes into their published research; claims do not.
- Single-customer-story S.T.A.R. shape — one dramatic transformation story \
instead of three plural specific proof points. Wrong shape for analyst \
audience. Stage S.T.A.R. is for keynotes; analyst briefings need plural \
evidence distributed across the deck, compressed to one sentence per proof \
point: named customer + specific number + outcome.
- No roadmap differentiation — describing roadmap items every vendor in the \
category already has shipped or is shipping. Wastes the NDA slot and burns \
the analyst's attention. The roadmap slide must surface what is actually \
differentiated; if the roadmap is parity work, say so honestly and cut the \
slide.
- Bad NDA hygiene — roadmap shown without explicit NDA flag on the slide and \
without a verbal NDA preface before the roadmap section. Failure here burns \
analyst relationships permanently. Every roadmap and forward-looking-metric \
slide must carry an "Under NDA — [date]" mark.
- Don't dodge known weaknesses — analysts respect candor and punish posturing. \
If the product has a gap the analyst will discover (and they will — they have \
talked to your competitors and your customers), name it, name how you are \
addressing it, and move on. "Stay positive" through a known weakness gets the \
vendor classified as marketer, not informant, and informants get included in \
reports. Marketers get cut.
- Reading slides verbatim — analyst briefings are conversational and the \
analyst will interrupt. Slides are reference scaffolding, not a script. Dense \
slide copy that gets read aloud collapses the conversation into a one-way \
pitch. One idea per slide, images and frameworks over text, presenter speaks \
around the slide.
- Marketing CTA at the close — "visit our booth, talk to your AE, sign up for \
beta" is a marketing action. The analyst briefing closes with an AR-style \
ask: "please consider us in [report]," "we'd value your feedback on \
[evaluation criterion]," "can we schedule an inquiry to go deeper on \
[topic]." One ask. AR action, not marketing action.

Positive asks:
- Render the deck as an 8-slide spine: company overview (the lede) → category \
framing (in the analyst's language) → market trend POV (the vendor's read on \
where the category is going) → solution overview against the analyst's \
evaluation criteria → customer evidence (three plural specific proof points) → \
competitive differentiation against analyst-coverage peers → roadmap (under \
NDA) → AR-style ask. The opening (slides 1-2) places the vendor on the \
analyst's mental map in the first 2-3 minutes — that is the lede. Without the \
lede up front, the analyst spends the briefing trying to figure out where the \
vendor fits, instead of evaluating the substance.
- Lock briefing type in pre-work — quarterly business update (relationship \
maintenance; lead with momentum: revenue growth, NRR, customer count above a \
meaningful ARR threshold), product update briefing (use cases and customer \
outcomes, not feature lists; beta customers with early results lead), or \
evaluation briefing (MQ / Wave / MarketScape — the highest-stakes type; title \
each slide with the exact agenda item from the analyst's evaluation guide; \
analysts have a checklist, leave breadcrumbs). The middle slides adapt to \
type; the opening and closing are stable.
- Read the analyst's prior coverage before drafting. Pre-work names the \
analyst firm, the specific analyst, the report being influenced, and what the \
analyst has already published. Without this, the briefing is generic and the \
analyst can tell within the first slide.
- Compress every customer proof point to one sentence: named customer + \
specific number + outcome. "[Company] used [capability] to reduce [metric] \
from [number] to [number] in [timeframe]." Three proof points beats one full \
case study slide.
- Frame competitive differentiation against the analyst's coverage peer set, \
not the vendor's win/loss competitors. The analyst evaluates the vendor \
against the cohort they cover, which is often different from the vendors the \
sales team competes against in deals. Pre-work names the coverage peer set \
explicitly.
- Inherit upstream artifacts when present: the positioning statement (01) \
seeds the category framing; the messaging framework (02) seeds the language \
register; the comparison matrix (15) seeds the competitive differentiation \
slide. Do not re-derive — apply.
- Treat the closing ask as an AR-style ask. The vendor is asking the analyst \
for consideration in a report or feedback on a criterion or an inquiry slot \
to go deeper. The analyst is not a buyer.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const analystBriefingDeckTemplate: ArtifactTemplate = {
  artifactType: 'analyst_briefing_deck',
  title: 'Analyst Briefing Deck',
  systemPromptFragment: ANALYST_BRIEFING_DECK_SYSTEM_PROMPT,
  // Skeleton renders pre-work first (briefing type, analyst-relations context,
  // NDA boundaries, category language, coverage peer set), then the 8-slide
  // spine. The spine's middle slides (4-7) adapt to the briefing type locked
  // in pre-work; the opening (1-3) and closing (8) are stable across all
  // three types.
  skeleton: `# Analyst Briefing Deck: [Vendor Name] — [Analyst Firm], [Date]

## Pre-work (lock these decisions before drafting a single slide)

- **Briefing type:** [Pick ONE — the middle slides adapt accordingly:
  - **Quarterly business update** — relationship maintenance with a current covering analyst. Lead with momentum.
  - **Product update briefing** — before a major launch (seed analyst reaction before public) or to bring a new analyst up to speed on the full offering. Lead with use cases and customer outcomes.
  - **Evaluation briefing (MQ / Wave / MarketScape / TechRadar)** — highest-stakes. The evaluation criteria exist before you walk in. Title each middle slide with the exact agenda item from the analyst's evaluation guide. They have a checklist; leave breadcrumbs.]
- **Analyst firm:** [Gartner / Forrester / IDC / GigaOm / Constellation / 451 Research / Omdia / other.]
- **Specific analyst(s) on the call:** [Name(s) and role(s). One lead analyst is typical; sometimes a research associate joins.]
- **Report being influenced:** [Name the specific report — e.g., "Gartner MQ for Sales Engagement Platforms 2026," "Forrester Wave for Customer Data Platforms Q3," "IDC MarketScape for B2B Marketing Automation." Without a named report, the briefing has no theory of change. If the briefing is general relationship maintenance with no specific report in scope, name that explicitly — it changes the closing ask.]
- **Analyst's prior coverage (read before drafting):** [What has this analyst already published about the vendor or the category? What positions have they taken on the category's evolution, the leading vendors, the unsolved problems? List 2-4 specific data points from their published research, blog posts, or webinars. Without this read, the briefing is generic.]
- **Category language (theirs, not yours):** [How does this analyst label the category in their published research? Use their term first in the deck. If the vendor has a different preferred term, decide now: are you using their term throughout (recommended), introducing yours as a reframe (legitimate, stage the reframe carefully on slide 2), or proposing a new category (high-risk, only viable if there is no MQ/Wave for the space yet)? Don't surprise the analyst with category disagreement on their turf.]
- **Coverage peer set (the analyst's, not yours):** [Who does the analyst evaluate the vendor against? This is the cohort they cover, often different from the vendors the sales team competes against in deals. List 4-6 named vendors. The competitive-differentiation slide compares against this set, not the win/loss set.]
- **NDA boundaries:** [What is being shared under NDA in this briefing? Standard scope: roadmap (specific features + dates), forward-looking metrics, unannounced customer wins, internal financial detail. The verbal NDA preface establishes the boundary before the relevant section; every NDA slide is flagged "Under NDA — [date]" on the slide itself. NDA hygiene is structural, not optional.]
- **Inherited upstream artifacts:** [Does a positioning statement (01) exist? It seeds the category framing. A messaging framework (02)? It seeds the language register. A comparison matrix (15)? It seeds the competitive differentiation slide. Do not re-derive — apply.]

---

## The deck (8-slide spine)

Slides support a 30-60 minute conversation. Analyst briefings are conversational — the analyst will interrupt. Slides are reference scaffolding, not a script. One idea per slide. Images and frameworks over dense text. Never read the slide aloud.

### Slide 1 — Company overview (the lede) (~3-5 min, including any inbound questions)
[Place the vendor on the analyst's mental map in 60 seconds. Four facts: (1) one-line description of what the vendor is, in the analyst's category language; (2) founding year + funding stage + last raise; (3) ARR / customer count / employee count (real numbers under NDA, or rounded numbers public-fact); (4) what changed since the last briefing if there was one — one sentence. NOT a logo wall, NOT a mission statement, NOT a founding-myth narrative. The analyst is placing you on a map; give them the coordinates.]

### Slide 2 — Category framing (in the analyst's language) (~3-5 min)
[Name the category using the analyst's published vocabulary. State the boundary — what is in the category, what is adjacent, what is excluded. If the vendor has a reframe (a different category name, a sub-category claim, an evaluation criterion the analyst has not yet adopted), introduce it here as a contribution to the analyst's thinking, not a correction. "We see this category as [analyst term]; one nuance we'd offer for your consideration is [reframe], because [reasoning grounded in customer behavior or market data]." For category-creation plays (no MQ/Wave exists yet for the space), the slide defines the problem before the solution and proposes evaluation criteria incumbents were not built to satisfy.]

### Slide 3 — Market trend POV (~3-5 min)
[The vendor's read on where the category is going. Two or three trends, each grounded in observed buyer behavior or named customer outcomes — not pundit prediction. This slide earns credibility: a vendor with a sharp, evidence-grounded view of category evolution is a more credible informant than one without. Trends should connect to (a) the analyst's published positions where they overlap, (b) the differentiation slides downstream. If the analyst has published a contrary view, acknowledge it — candor here pays off later.]

### Slide 4 — Solution overview against the analyst's evaluation criteria (~5-10 min)
[FOR EVALUATION BRIEFINGS (MQ / Wave / MarketScape): title this slide with the exact agenda item from the analyst's evaluation guide. If the evaluation has multiple criteria, this becomes 2-4 slides — one per criterion. Analysts have a checklist; leave breadcrumbs. Vendors who stray from the requested structure run out of time and miss critical criteria.

FOR QUARTERLY BUSINESS UPDATES: lead with momentum metrics. Revenue growth, NRR, customer count above a meaningful ARR threshold, two-three competitive wins (who you displaced, what the incumbent was, why the buyer chose you). Analysts will estimate these numbers anyway based on market signals; give them the real ones under NDA or they publish the wrong story.

FOR PRODUCT UPDATE BRIEFINGS: structure around use cases and customer outcomes, not feature lists. If you have beta customers with early results, lead with them. Analysts quote proof points in their research; give them quotable ones.]

### Slide 5 — Customer evidence (3 plural specific proof points) (~5-7 min)
[Three named customers. Each compressed to one sentence: named customer + specific capability used + specific number + specific outcome + timeframe. "[Company A] used [capability] to reduce [metric] from [number] to [number] in [timeframe]." NOT a logo wall (claims without numbers). NOT a single dramatic story (wrong shape — that is keynote S.T.A.R., not analyst evidence). NOT a quote slide without numbers. Plural, specific, compressed. The proof points are what move from the analyst's notes into their published research. Pick customers that demonstrate the differentiation claimed in slide 6 — slides 5 and 6 are tightly coupled.]

### Slide 6 — Competitive differentiation (against analyst-coverage peers) (~5-7 min)
[Compare the vendor against the analyst's coverage peer set named in pre-work — not against the vendor's win/loss competitors. Two-three points of differentiation, each backed by a customer proof point from slide 5 or a verifiable product capability. Format that works: a table or matrix with the analyst's coverage peers as columns, evaluation criteria from the analyst's published rubric as rows, the vendor's position called out. Avoid: vendor name-drops as enemies (combat register), generic differentiators ("easy to use," "AI-powered," "enterprise-grade" — every vendor in the category claims these), and disparagement of named competitors (analysts find this unprofessional). State what the vendor does that the named peers do not, with proof.]

### Slide 7 — Roadmap (under NDA) (~5-10 min)
[Flagged "Under NDA — [date]" on the slide. Verbal NDA preface established before this section. Surface what is genuinely differentiated, with rough timing (quarter or half, not exact dates). If a roadmap item is parity work that every competitor is shipping, say so honestly and cut the slide — wasting NDA on parity work burns the analyst's attention. Format: 3-5 bets, each with the customer problem it solves, the differentiation it creates, and rough timing. Connect bets to the market trend POV from slide 3 — the roadmap is the operational consequence of the market read.]

### Slide 8 — The ask (AR-style) (~2-3 min)
[ONE ask. AR action, not marketing action. Common asks:
- "Please consider [vendor] for inclusion in [specific report] — happy to share additional materials needed for the inclusion criteria."
- "We'd value your feedback on [specific evaluation criterion or category position] — what would strengthen our position in your view?"
- "Can we schedule an inquiry call to go deeper on [topic the analyst showed interest in]?"
- "Would you be open to a customer reference call with [named customer] to validate the [outcome / use case]?"
NOT: "visit our booth," "talk to your AE," "sign up for beta." Marketing CTAs collapse the analyst-relationship register.]

---

## Validation gates (run before sending the deck to the analyst)

[Three gates before final sign-off:

**1. Slide-titles-as-table-of-contents test.** Read just the slide titles in sequence, ignoring all body content. Do they tell a coherent story about the vendor's category position, evidence base, differentiation, and ask? Or do they read like a table of contents for a product manual? If the latter, rebuild the narrative layer before adding any more content. The analyst should be able to follow the briefing's logic from titles alone.

**2. Don't-sell test.** Read every slide. In each, ask: is the subject the analyst's evaluation, or the vendor's pitch? "We help marketers reduce CAC by 30%" sounds like analyst evidence but reads as a sales claim. "Three named customers reduced CAC by [specific number] using [capability], with the analyst's evaluation criterion of [criterion] satisfied because [reasoning]" reads as analyst evidence. If more than two slides outside slides 1, 5, 8 are subject-vendor (vs. subject-analyst-evaluation or subject-customer-outcome), the deck has drifted toward sales pitch. Rewrite.

**3. NDA-hygiene test.** Every slide containing roadmap detail, forward-looking metrics, unannounced customer wins, or internal financial detail must be flagged "Under NDA — [date]" on the slide itself. The verbal NDA preface must be established before the relevant section. If any NDA-scope content appears on a slide without the flag, fix it before sending — burned NDAs end analyst relationships.]

---

## Operational notes (for the briefing call itself)

[Not part of the deck, but tracked alongside it:

- **Time discipline.** 30 minutes is the standard analyst briefing slot; 45-60 is requested for evaluation briefings. Pace: ~3-5 min per slide on the 8-slide spine, leaving 5-10 min for analyst questions inside the slot. If the analyst interrupts heavily on slides 1-3 (which is common — they use the briefing to test their mental model early), compress slides 4-6 to recover time. NEVER compress slide 8 (the ask) — that is what the briefing is for.
- **Presenter roster.** 1-3 vendor presenters maximum. Standard: AR lead + product or CMO + occasionally CEO for strategic briefings. More than three vendors on the call dilutes signal.
- **Handoffs and Q&A.** Analyst questions go to the named owner of the relevant slide, not whoever speaks loudest. Pre-assign owners.
- **Post-briefing follow-up.** Within 48 hours: thank-you note, deck PDF (or PDF excluding NDA slides if requested), and a one-line confirmation of the closing ask. Schedule the next touchpoint immediately.]
`,
}

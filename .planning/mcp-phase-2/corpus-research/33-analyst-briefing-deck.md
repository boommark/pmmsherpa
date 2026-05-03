# Research — Analyst Briefing Deck (vendor briefing for industry analysts)

## Canonical sources (read FIRST)

- **Nancy Duarte — Resonate** — presentation craft. Used selectively: Frequency Tuning (analyst as a non-buyer audience with a fixed mental model and a stack of competitor briefings) and the prose-first / one-idea-per-slide rules. NOT used: Hero's Journey, S.T.A.R. moment as primary spine — analysts are not a stage audience to be moved emotionally; they are an evaluator audience to be informed precisely.
  - Card: `~/Documents/AbhishekR/Book Brain/Duarte - Resonate.md`
- **VandeHei/Allen/Schwartz — Smart Brevity** — compression. Analysts have already talked to your top five competitors this month; their attention is structurally short. Core 4 (Tease → Lede → Why It Matters → Go Deeper), Audience First, Short-Not-Shallow.
  - Card: `~/Documents/AbhishekR/Book Brain/Smart Brevity.md`
- **Corpus (Tier 2)** — AR-practitioner content (PMA blogs, Sharebird AMAs from analyst-relations practitioners). The corpus carries the operational structure books do not — the three briefing types, the evaluation-criteria checklist behavior, the "title each slide with the analyst's exact agenda item," the differentiation-with-proof rule.

## What the books establish (combined)

### Resonate — what carries over, what does not

- **Frequency Tuning carries over.** Analysts have an existing mental model of your category and your position in it before the briefing starts. The pre-work item *"the analyst's prior coverage"* is Frequency Tuning applied to analyst relations — read what they have already published before drafting a single slide. Without that read, the deck assumes a blank-slate audience that does not exist.
- **Audience-as-Hero / Mentor Stance — partially carries over, sharpened.** The analyst is not a hero on a transformation journey. The analyst is a *judge*. The vendor's stance is candid expert briefing the judge, not mentor leading a hero. The mentor-stance principle survives in the form *do not sell, do not posture* — analysts respect candor; vendors that "stay positive" through known weaknesses get classified as marketers, not informants.
- **S.T.A.R. moment — does NOT carry over as the spine.** A keynote has one planted dramatic beat; an analyst briefing has multiple proof points distributed across the deck. Forcing a single S.T.A.R. into an analyst briefing produces a sales-pitch shape. Customer evidence in an analyst briefing is *plural and specific* (named logo + number + outcome), not single and dramatic.
- **One idea per slide / images-over-text / never-read-the-slide carry over.** Universal slide discipline.

### Smart Brevity — the compression rule

- **Core 4 (Tease → Lede → Why It Matters → Go Deeper) applies at the *briefing as a whole*, not at each slide.** The opening 2-3 minutes of an analyst briefing must give the analyst the lede ("here is what we are, here is the category we play in, here is the one thing that has changed since we last spoke") so they can place you on their mental map immediately. Without the lede up front, the analyst spends the briefing trying to figure out where you fit, instead of evaluating what you said.
- **Audience First — sharper than usual.** Analysts have talked to your top five competitors this month. The deck must be drafted from inside their evaluation criteria, not from inside your roadmap. Title each slide with their exact agenda item if briefing for an evaluation (MQ, Wave, MarketScape).
- **Fog of Words.** Analysts are pattern-matchers; jargon collapses signal. Plain category language wins over invented internal terminology.
- **Short, not shallow.** Compression is the discipline, not abbreviation. Compressed proof points (named customer + specific number + outcome in one sentence) outperform full case studies in analyst contexts.

## Corpus research (operational amplification)

The corpus query returned a tight synthesized response (`33-analyst-briefing-deck.json`). Top citations: Jackie Palmer, Michele Nieberding, Elizabeth Grossenbacher, April Rassa, Sam Melnick, Raymond Hwang (all Sharebird AMAs from practitioners running analyst relations programs), plus PMA blogs `product-marketing-strategies-for-analyst-relations-2` and `what-is-analyst-relations-best-practices-and-key-metrics`. The synthesized chunk is unusually clean — this is a topic the AR practitioner community has converged on.

### What corpus added beyond the books

1. **Three briefing types, three different shapes.** The corpus is firm: an analyst briefing is not one artifact, it is three.
   - **Quarterly business update** — relationship maintenance. Lead with momentum (revenue growth, NRR, customer count above a meaningful ARR threshold). Analysts will estimate these numbers anyway; give them the real ones under NDA or they publish the wrong story. Two-three competitive wins (who you displaced). Focused roadmap preview.
   - **Product update briefing** — before a major launch, to seed analyst reactions before public; or to bring new analysts up to speed. Structure around use cases and customer outcomes, not feature lists. Beta customers with early results lead.
   - **Evaluation briefing (MQ / Wave / MarketScape)** — the highest-stakes type. The evaluation criteria exist before you walk in. Title each slide with the exact agenda item from their evaluation guide. Analysts have a checklist; leave breadcrumbs. Vendors who stray from the requested structure run out of time and miss critical criteria.
   - **Adopted as a forced pre-work choice.** The skeleton renders three branches off the same spine; the user picks one in pre-work.
2. **"Differentiation with proof" — the canonical AR phrase.** *"Not 'we're the only platform that does X' — that's a claim. What they want is 'we're the only platform that does X, and here are three customers who used it to achieve Y result.' The proof point is what moves from their notes into their published research."* Adopted as a system-prompt rule and as the dominant frame for the customer-evidence and differentiation slides.
3. **Category clarity — define the problem before you define your solution.** Where there is no Wave or MQ for your space yet, the vendor has more influence than they think. The corpus names the pattern: *teach the analyst how to measure value in your category, introduce evaluation criteria that incumbents weren't built to satisfy, and you shift from competing in their mental model to shaping it.* Drift did this with conversational marketing; Gainsight with customer success platforms. Adopted as a pre-work decision: are you positioning *into* an existing category (use their language) or *creating* a new one (define evaluation criteria first)?
4. **Slide-titles-as-table-of-contents test.** *"Read just your slide titles in sequence. Do they tell a coherent story? If they read like a table of contents for a product manual, rebuild the narrative layer before you add any content."* Adopted as a validation gate.
5. **The reframe: a briefing is a correction opportunity, not a presentation.** *"Analysts have talked to your top five competitors this month. They're not looking for your story. They're looking for evidence that contradicts or confirms the mental model they've already built about your category."* This is the single sharpest framing in the corpus and it changes the entire artifact's stance. Adopted as the opening line of the system prompt and the design principle for the whole template.
6. **Roadmap under NDA — the disclosure rule.** Analysts respect roadmap detail under NDA, but it must be flagged as such, and the deck must distinguish public-fact slides from NDA slides explicitly. NDA hygiene failure = analyst burned externally = vendor relationship damaged.
7. **The "ask" is not a sale.** The closing slide is an analyst-relations ask, not a marketing ask. Common asks: *"please consider us in [report]"*, *"we'd value your feedback on [evaluation criterion]"*, *"can we schedule an inquiry to go deeper on [topic]"*. Marketing CTAs ("visit our booth," "talk to your AE") are the failure mode.

### Where books and corpus diverged

- **S.T.A.R. moment.** Resonate would push for one planted dramatic beat. Corpus pushes for *plural specific proof points* distributed across the deck. **Corpus wins** for the analyst-briefing artifact specifically because the audience is an evaluator, not a stage audience. Single-S.T.A.R. shape collapses into sales-pitch shape in this context.
- **Hero's Journey.** Resonate's Hero/Mentor frame is wrong for this artifact. Analysts are judges, not heroes. **Corpus wins** — the stance is candid-expert-to-judge.
- **Smart Brevity Core 4 at slide level vs. briefing level.** The book applies Core 4 to a single message; the corpus implicitly applies it to the *whole briefing* (lede in the first 2-3 min, why-it-matters in the category-framing slide, go-deeper in the rest). Adopted the briefing-level application; per-slide Core 4 would be too granular.

### Where they merged

- **Frequency Tuning + analyst's prior coverage** — same discipline, sharper for analyst contexts. The pre-work item names the analyst, the firm, the report being influenced, and what the analyst has already published. Without all four, the deck is generic.
- **Audience First + briefing-as-correction-opportunity** — both books say *start from the audience*; corpus sharpens this into the specific reframe that the briefing exists to correct or confirm the analyst's pre-existing mental model.
- **Short-not-shallow + compressed proof points** — same compression discipline. Named customer + specific number + outcome in one sentence beats a full case study slide for analyst attention.

---

## Template design decisions

**The artifact is a deck spec, not a script.** Unlike artifact 24 (executive keynote) which is dual-format script + deck, an analyst briefing is delivered conversationally by 1-3 vendor presenters and includes Q&A throughout. The artifact specifies the *deck and what each slide must say*; the verbal delivery is improvisational against the deck spine. Rendering a full prose script would be over-engineered for this context.

**Spine = corpus-driven 8-slot skeleton, branch-aware on briefing type.** Pre-work locks the briefing type (quarterly / product update / evaluation). The skeleton's middle blocks adapt: an evaluation briefing titles slides per the analyst's evaluation criteria; a quarterly briefing leads with momentum; a product update structures around customer outcomes. The opening (company overview → category framing) and closing (roadmap under NDA → ask) are stable.

**Pre-work names: analyst firm, analyst, report being influenced, analyst's prior coverage, NDA boundaries.** These five items are non-negotiable. Without the analyst's prior coverage read, the briefing is generic. Without NDA boundaries explicit, NDA hygiene fails. Without the report being influenced named, the briefing has no theory of change.

**Category framing in the analyst's language, not the vendor's.** This is the single sharpest design rule in the artifact. If the analyst calls the category "Sales Engagement Platforms" and the vendor calls it "Revenue Acceleration Suites," the briefing uses the analyst's term. The pre-work asks for the analyst's category vocabulary explicitly. Disagreement on category — if needed — is staged after the framing is established, never imposed at the start. *"Don't surprise the analyst with category disagreement on their turf."*

**Customer evidence is plural and specific.** Three named customers (logo + number + outcome). Not one dramatic story. Not a logo wall without numbers. Not a quote slide. Compressed proof points — *"named customer + specific number + outcome in one sentence"* — adopted as the slide-level pattern.

**Competitive differentiation against analyst-coverage peers, not against the vendor's preferred competitors.** Analysts evaluate vendors against the cohort *they* cover, which is often different from the vendors the company sells against in deals. The pre-work asks: *who is the analyst's coverage peer set for this category?* That is the comparison set, not the win/loss comp set.

**Roadmap under NDA, with explicit flagging.** Roadmap slides are flagged "Under NDA — [date]" in the deck. The verbal preface establishes NDA. This is structural NDA hygiene; without it, analysts get burned and the relationship dies.

**Single AR-style ask, not a marketing CTA.** Common asks: *"please consider us in [report]"*, *"we'd value your feedback on [criterion]"*, *"can we schedule an inquiry to go deeper on [topic]"*. The system prompt suppresses marketing CTAs explicitly.

**Slide-titles-as-table-of-contents validation gate.** Read the slide titles in sequence. Do they tell a coherent story or read like a product manual TOC? Adopted from the corpus as a final-check gate.

**Boundary against artifact 19 (sales pitch deck).** Sales pitch ends in a commercial ask and is structured around the buyer's pain → product fit. Analyst briefing ends in an AR ask and is structured around category positioning + differentiation with proof. The two are easy to confuse and the system prompt suppresses sales-deck drift explicitly.

**Boundary against artifact 24 (executive keynote).** Keynote is performance, single voice, vision-led, ends in threshold ask. Briefing is conversational, multi-presenter, evaluator audience, ends in AR ask. Different audiences, different shapes.

**Boundary against artifact 31 (investor / board deck — if it exists).** Investor deck centers on financial growth, TAM, burn, NRR for capital allocation decisions. Briefing centers on category position and product credibility for evaluation reports. Some overlap on metrics (NRR), wholly different spine.

---

## Section-by-section rationale

| Skeleton block | Source | Why included |
|---|---|---|
| Pre-work: Briefing type (quarterly / product / evaluation) | Corpus (three-types rule) | Three different shapes; locked before drafting. |
| Pre-work: Analyst firm + analyst + report being influenced | Corpus + Resonate (Frequency Tuning) | No theory of change without it. |
| Pre-work: Analyst's prior coverage | Corpus + Resonate (Frequency Tuning) | Read what they've published; otherwise the briefing is generic. |
| Pre-work: NDA boundaries | Corpus (NDA hygiene) | Structural disclosure rule. |
| Pre-work: Category language (theirs) + agreement decision | Corpus (category clarity) | Use their language; stage disagreement carefully. |
| Pre-work: Coverage peer set | Corpus (analyst-coverage peers) | Comparison set is the analyst's, not the vendor's. |
| Slide 1: Company overview (lede) | Smart Brevity (Lede); corpus | Place the vendor on the analyst's mental map in 60 seconds. |
| Slide 2: Category framing (their language) | Corpus (category clarity); Resonate (Frequency Tuning) | Use the analyst's category vocabulary. |
| Slide 3: Market trend POV | Corpus | The vendor's view of where the category is going — earns credibility. |
| Slide 4: Solution overview against their evaluation criteria | Corpus (evaluation-checklist rule) | Title slide per their agenda item if evaluation briefing. |
| Slide 5: Customer evidence (3 named, plural, specific) | Corpus (differentiation-with-proof) | Named customer + specific number + outcome. |
| Slide 6: Competitive differentiation (analyst-coverage peers) | Corpus | Compare against the analyst's coverage cohort. |
| Slide 7: Roadmap (under NDA) | Corpus (NDA hygiene) | Flagged explicitly. |
| Slide 8: AR-style ask | Corpus (the ask is not a sale) | Single ask. AR action, not marketing action. |
| Validation: slide-titles-as-TOC test | Corpus | Read titles in sequence; story or product manual? |
| Validation: don't-sell test | Corpus + Smart Brevity | Read every slide — is the subject the analyst's evaluation, or the vendor's pitch? |
| Validation: NDA-hygiene test | Corpus | Roadmap slides flagged; verbal preface established. |

## Sections excluded

- **Per-slide Core 4 structure** — too granular; Core 4 applied at the briefing level (opening 2-3 min as lede) instead.
- **S.T.A.R. moment** — wrong shape for analyst audience; replaced with plural specific proof points.
- **Hero's Journey** — wrong audience model; analysts are judges, not heroes.
- **Sales talk track / discovery questions** — artifacts 21, 11; not part of analyst briefings.
- **Investor metrics (TAM, burn, ARR growth curves)** — investor deck artifact.
- **Operational AR program ops (cadence, account plans, inquiry tracking)** — separate workstream, not the briefing artifact.
- **Press / launch / customer event materials** — different artifacts.

## System prompt failure modes (negative guidance)

From book + corpus, distilled to 7 — analyst-specific:

1. **Sales pitch in disguise** — every "differentiation" slide drifts toward buyer-pain → product fit. The analyst is an evaluator, not a buyer.
2. **Lack of category fluency** — using vendor jargon when the analyst has a published category vocabulary. Confidence collapses.
3. **No proof points / no customer logos** — claims without named customers + specific numbers.
4. **Single-customer-story S.T.A.R. shape** — one dramatic story instead of three specific proof points. Wrong shape.
5. **No roadmap differentiation** — describing roadmap items every vendor in the category has. Wastes the NDA slot.
6. **Bad NDA hygiene** — roadmap revealed without explicit NDA flag, or NDA preface skipped.
7. **Don't dodge known weaknesses** — analysts respect candor; "stay positive" through a known gap = vendor classified as marketer, not informant.
8. **Don't surprise the analyst with category disagreement on their turf** — if you disagree with the analyst's category definition, stage the disagreement after establishing the framing in their language. Never start by rejecting their map.
9. **Reading slides verbatim** — analyst briefings are conversational; reading slides collapses the relationship.

## Open questions for audit

- **Should the three briefing types be three separate sub-templates or one branch-aware skeleton (current)?** Currently one skeleton with type-aware annotations on the middle slides. Argument for splitting: each type has a distinct shape and forcing one skeleton may underspecify each. Argument against (chosen): the opening (overview → category) and closing (roadmap → ask) are stable across all three; only the middle adapts. Splitting would triplicate scaffolding.
- **Should slide titles for evaluation briefings be auto-generated against a known evaluation framework (Gartner MQ criteria, Forrester Wave inclusion criteria) or left to the user?** Currently left to the user — the analyst's evaluation guide is the source of truth and varies per report. A future enhancement could ingest known criteria templates.
- **Should the artifact include suggested NDA preface language?** Currently not — NDA preface is verbal and varies by firm/relationship. Could add a one-line example.
- **Corpus gap:** No book chunks from analyst-relations-specific books surfaced (e.g., Duncan Chapple's analyst-relations playbook). The corpus is dominated by AR-practitioner AMA content. Logged for the next ingestion sweep.

Voice rule: Reference Duarte / Smart Brevity / AR practitioners implicitly. Do not name-drop authors in the output.

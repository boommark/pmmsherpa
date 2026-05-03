# Research — Win/Loss Insights Summary

## Canonical sources

Per `artifact-book-map.md`, this artifact has **no specific Book Brain canon**.
The discipline is operational: PMA practitioner blogs, Sharebird AMAs, and the
specialty firms (Clozd, DoubleCheck, Anova) own the methodology in current
practice. Adjacent books (Dunford on competitive analysis, Cagan on discovery)
did not surface in the corpus query, so no book cards triggered the
book-cards-first rule.

## What this artifact IS and ISN'T

- **IS:** the *aggregated insights* deliverable — themes + verbatim quotes +
  segment-cut numbers + recommendations, distilled from 20+ interviews per
  cycle. The strategic doc that drives downstream changes.
- **ISN'T:**
  - Raw interview transcripts (those are intermediate research artifacts)
  - The interview *guide* (a methodology asset, not a deliverable)
  - A single deal post-mortem (that's a sales debrief, not win/loss)
  - A customer case study (artifact 37) — case studies are *marketing*
    artifacts, win/loss is *intelligence*. Same buyer voice, opposite intent

## Downstream consumers (explicit)

The whole point of win/loss is what it changes elsewhere. The artifact must
make this composability legible:

- **Positioning statement (01)** — closes the gap between *claimed*
  differentiators and the differentiators buyers *actually remembered* in the
  decision room. Win/loss is the empirical check on positioning hypotheses.
- **Battlecard (16)** — buyer-language objections + competitor traps + what
  reframes actually worked. Win/loss is the only honest source of these;
  internal "we think they say X" guesses don't ship.
- **ICP (04) refinement** — best-fit pattern recognition. Wins cluster on
  segments where the pitch lands intuitively; losses cluster on segments
  where the buying motion was wrong. Both reshape the ICP.
- **Product roadmap** — the product-gap-vs-messaging-gap distinction is the
  most valuable signal. Win/loss is the earliest revenue-tied input into
  roadmap prioritization.
- **Sales enablement** — verbatim quotes are the highest-impact behavior-change
  asset for sellers. Single quote > slide deck.

## Corpus citations (top 10, all surfaced cleanly)

The query returned a coherent practitioner consensus — no book chunks, no
metadata gaps. Top sources:

1. **Willem Maas / PMA — "Selecting a Win/Loss Analysis Service"** —
   third-party-vs-in-house decision, what services actually deliver
2. **PMA — "Picking a Win/Loss Program to Meet Your Goals"** — lifecycle
   positioning, program maturity stages
3. **Divya Mulanjur — Sharebird AMA** — interview methodology specifics
4. **Anaud Ganpaul / PMA — "Science of Product Marketing,"** competitive +
   win/loss section
5. **Bill Emmett / PMA — Differentiating message via competitive intel** —
   "drive better win/loss mechanisms" step
6. **Brady Tengberg / PMA — Fueling revenue growth through win/loss**
7. **Bailey Haslam / PMA — "Win/loss isn't a priority but should be"** (cited
   twice — prioritization argument + in-house-interviewing failure mode)
8. **Willem Maas (again) — "What is a win/loss analysis service?"**
9. **PMA — generic "win/loss analysis" overview chunk**

## Key consensus across sources

### Interview methodology
- **20+ interviews minimum** before a pattern is trustworthy.
- **Stratify the sample**: wins + losses, deal sizes, persona types
  (champion / economic buyer / IT), loss stages (early ghosting vs.
  late-stage competitive loss). A discovery-stage loss tells a different
  story than a POC-stage loss.
- **Third-party interviewers outperform in-house** — buyers tell neutral
  parties things they will not say to anyone with relationship stake. The
  CRM "we went with the other vendor" hides the real reason ("your champion
  couldn't get internal buy-in"). If running in-house, name the bias.
- **Interview guide follows the buyer's journey, not your sales stages.**
  Trigger → people involved → discovery path → alternatives considered →
  momentum loss points → decision driver → "what would you tell a colleague"
  (the most revealing closer).

### Deliverable format — the three layers
Most programs ship only one of these. The complete summary has all three:

1. **Numbers (segment cuts)** — win rate by segment, persona, deal size,
   region, competitor. Surfaces strategic vs. execution problems
   ("60% under $50K, 25% over $200K" is strategy, not skill).
2. **Themes (synthesized patterns)** — 4-6 per cycle, ranked by frequency
   *and* deal impact. Themes are *causal patterns*, not single quotes:
   "price-to-value perception breaks down in mid-market deals when economic
   buyer enters late," not "buyer X said pricing was high."
3. **Verbatim quotes** — the most undervalued and highest-impact layer.
   A single specific buyer line moves sales behavior more than slides.

### Recommendations layer
Each theme should produce 1-2 explicit recommendations tagged by owner
(positioning, battlecard, roadmap, enablement, ICP). Without owners,
insights die in the deck.

## Failure modes (system-prompt-grade)

Distilled from corpus. The three big ones map to research-design discipline,
plus operational failure modes:

1. **Selection bias (most common, most invisible)** — only interviewing deals
   that reached a formal decision. Misses early-stage losses, never-considered
   deals, deals that stalled and never closed-lost. CRM-gated samples
   systematically miss the volume problem.
2. **Confirmation bias** — interviewing wins more than losses (warmer access)
   and asking validation questions ("did our messaging resonate?") instead of
   challenge questions ("where did you lose confidence?"). The harder question
   is 10x more valuable.
3. **Asking the wrong questions** — focusing on features and pricing when the
   actual decision drivers are organizational: champion couldn't build
   consensus, procurement surfaced a risk concern nobody addressed, the
   competitor's implementation story was more credible. Most deals are not
   lost on feature gaps.
4. **Themes without verbatim quotes** — synthesis without the buyer's literal
   words is editorialized opinion. Quotes are the credibility layer.
5. **Insights without recommendations** — themes that don't terminate in
   "what we'll change" become wallpaper. Owner + downstream artifact required.
6. **Skipping segment cuts** — win-rate without segment cuts hides the
   strategic signal. "We're winning 40% overall" tells you nothing about
   where to invest or pull back.
7. **One-and-done programs** — programs running 2+ years see win-rate jumps
   to ~84%; the insight compounds. Single cycles don't move the needle.
8. **Product-gap vs. messaging-gap conflation** — "buyers who left say they
   had feature X and we didn't" is product. "Buyers who stayed say they
   almost left because they didn't know we had X" is messaging. Same
   symptom, opposite fix. Conflating them sends roadmap budget to fix
   marketing problems.

## Template design decisions

**Authority hierarchy:** Practitioner consensus drives. No book canon
overrides. PMA/Sharebird agreement is the spine.

**Three-layer deliverable enforced structurally** — Numbers / Themes /
Verbatim Quotes are separate skeleton sections. The most common failure
("we shipped only themes" or "we shipped only numbers") is suppressed by
the skeleton itself.

**Methodology section as Step 0** — sample size, stratification, third-party
flag, interview guide reference. Without this section, the insights are
unauditable.

**Recommendations section is owner-tagged** — each theme produces 1-2
recommendations with explicit downstream artifact owners (positioning,
battlecard, ICP, roadmap, enablement). Closes the loop.

**Downstream impact section is required output, not optional** — the
artifact is a *feeder* doc; if it doesn't articulate what changes elsewhere,
it failed. Section structurally enforced.

**Failure-mode-heavy system prompt** — bias suppression is the entire
discipline of win/loss. Negative guidance carries more weight than positive
asks here than in any other Phase 2 artifact so far.

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Methodology snapshot | Corpus consensus (Maas, Haslam, Mulanjur) | Without sample/stratification/interviewer-type, insights are unauditable |
| Numbers (segment cuts) | Corpus (Tengberg, PMA "science of PMM") | Layer 1 of the three-layer model; surfaces strategic vs. execution problems |
| Themes | Corpus (Haslam, Emmett, Mulanjur) | Layer 2; the synthesis layer most programs ship alone |
| Verbatim quotes | Corpus (Mulanjur, PMA general) | Layer 3; the credibility + behavior-change layer |
| Recommendations (owner-tagged) | Corpus (Tengberg, Emmett) | Closes the loop into downstream artifacts |
| Downstream impact (positioning / battlecard / ICP / roadmap / enablement) | Boundary-call requirement | Makes feeder relationship legible |
| Validation checks | Methodology | Bias-mode self-audit |

## Sections excluded

- **Raw transcripts** — intermediate research, not deliverable
- **Interview guide** — methodology asset; reference link, not embedded
- **Per-deal post-mortems** — sales debrief artifact, different scope
- **Customer case studies** — artifact 37, marketing intent
- **CI / competitor profiles** — battlecard (16) territory; win/loss feeds it,
  doesn't duplicate it

## Open questions

- Should "Recommendations" be a top-level section or nested under each Theme?
  Chose top-level for cross-theme rollups; per-theme still possible inside.
- Should segment cuts have a fixed dimension list (size / persona / competitor /
  region) or be open? Chose seeded list with "add custom" — most teams default
  to size-only, missing persona/competitor cuts.
- Should the artifact require *both* a quantitative win-rate baseline and the
  qualitative interviews? Practitioner sources lean yes; small-sample
  early-stage SaaS programs may have no statistical baseline. Made the
  numbers section explicitly accept "small-sample qualitative" as a mode.

## Corpus metadata gaps

None to log. All 10 chunks returned with author + URL + source_type
populated. Not adding to `corpus-gaps.md`.

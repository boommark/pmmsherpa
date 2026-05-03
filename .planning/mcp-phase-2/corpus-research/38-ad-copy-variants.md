---
artifact: 38 — Ad Copy Variants
canonical_books:
  - Bly — The Copywriter's Handbook (4 U's, 8 headline types, you-orientation, AIDA)
  - Ogilvy — Ogilvy on Advertising (Big Idea, headline > body 5x, "positively good", repeat winners, do your homework)
tier_2_corpus: B2B paid social, search ads, performance copywriting practitioner patterns
adjacent_artifact: 25 — cold-email-sequence (also Bly-anchored copywriting craft)
---

# Research summary — 38 Ad Copy Variants

## Canonical book extraction

### Bly — The Copywriter's Handbook
- **4 U's** (Urgent, Unique, Useful, Ultra-specific) — score each headline 1-4 on each axis; aim for 3+ on at least three. Ultra-specific does the most lifting in paid ads.
- **Eight headline types** as a *variant menu*: direct, indirect, news, how-to, question, command, reason-why, testimonial. These are the rotation set for A/B variants.
- **You-orientation** — "You can…" beats "We help you…". Hard rule across all variants.
- **Headline as gateway** — 5x more people read headline than body; if headline didn't sell, 80% of spend is wasted.
- **Specific facts > superlatives** — "Replace 'utilize' with 'use'"; numbers > adjectives.

### Ogilvy — Ogilvy on Advertising
- **The Big Idea** — never write an ad without one. Five tests: did it make me gasp? do I wish I'd thought of it? is it unique? does it fit strategy? could it run for 30 years? *This becomes the artifact's pre-work gate.*
- **Headline > body 5x** — same headline-priority principle as Bly, validated independently.
- **Positively good principle** — make specific factual claims, don't claim "better than competitors". Comparative superlatives don't move buyers; specific numbers do.
- **Make the product the hero** — not the ad. Variants that win awards but don't sell are failures.
- **Repeat winners** — most teams change campaigns too soon. Once a variant wins clearly, run it until it actually wears out.
- **Do your homework** — read everything about the product before writing. Find the "one factual claim most likely to persuade".

## Corpus citations (top 10)

The corpus query returned a single high-density synthesized chunk citing 10 sources (Stevie Langford / PMA on B2B messaging ×5, Andy Beohar on A/B testing iteration, Lenny Rachitsky podcast, Neil Patel B2B paid ads ×2, Weinberg & Mares — Traction p.33). Key amplifications:

- **LinkedIn vs. Google are different buyer moments.** LinkedIn = interruption (need pain-naming, outcome-contrast, peer-credibility frames). Google = intent (match the search frame, then add a differentiator after the comma — category claim, number frame, objection pre-empt). *This drives the channel-pre-work block in the template.*
- **Five message angles that move B2B buyers**: speed-to-value, risk-removal, peer-proof, problem-specificity, outcome-specificity. The PMA corpus expands Bly's 8 headline types with B2B-specific angle vocabulary. The artifact uses 6 angle slots: pain-led, outcome-led, proof-led, contrarian, news/why-now, customer-quote (synthesizing the corpus angles + Bly's reason-why + Ogilvy's testimonial-as-Hathaway-style).
- **A/B test design failure mode**: testing too many variables at once. *One variable per test.* Test angles before words. Minimum 300-500 conversions per variant before calling. The artifact encodes this as the "expected variance hypothesis" requirement per variant — variants that differ only in punctuation/word order produce no learning.
- **Common failure modes** (corpus + book, triangulated):
  - "We" problem → flip to you-orientation (Bly).
  - Feature-as-benefit → name the outcome (Bly + Ogilvy).
  - Audience mismatch on LinkedIn → broad targeting kills B2B faster than bad copy. *Hard rule: don't mix audience personas across the test.*
  - Ad/landing-page scent break → the click is wasted if the LP doesn't fulfill the ad's promise. *Drives the "downstream artifact" pointer to landing-page-copy (35).*
- **Channel character limits** are practitioner table stakes the books don't cover — the template encodes them inline.

## Design decisions

- **6×8 matrix as a menu, 8-12 actual variants as output.** Bly's 8 headline types × 6 message angles = 48-cell matrix. Generating all 48 is noise; picking 8-12 strategic combinations is signal. Variants must explicitly name their (angle, headline-type) cell.
- **Big Idea is gate, not section.** Per Ogilvy, you don't write ads without one. The pre-work block requires a one-sentence Big Idea before any variant generation. If the Big Idea fails the 5-question test, stop and revisit positioning.
- **Each variant ships with a hypothesis.** "Variant B will outperform A on CTR because outcome-specific copy converts intent-stage Google traffic better than pain-led copy." If you can't write the hypothesis, the variant isn't testable — it's noise. This is the single biggest divergence from a generic ad-writer template.
- **Channel-locked pre-work.** LinkedIn variants follow interruption pattern (pain-naming, outcome-contrast, peer-credibility); Google variants follow intent pattern (category-match + differentiator). Mixing channels in one variant set produces incoherent learning.
- **Inline 4 U's score on each variant.** Forces the writer to actually run the test, not just claim they did.
- **Visual brief is one line, not a full creative spec.** This is a copy artifact, not a creative brief. Visual brief names the asset (photo / illustration / motion / chart) and the ONE thing it must communicate — then handed to the creative artifact downstream.
- **Negative-prompt failure modes encoded** (see SYSTEM_PROMPT): no trivial-wording variants, no variants without hypothesis, no Big-Idea-less ads, no generic CTAs ("Learn more"), no character-limit violations, no audience mixing.

## Excluded from this artifact

- Channel-specific bid strategy / targeting filter design — that's an ops artifact, not a copy artifact.
- Creative production specs (font, color, exact image) — handed to a downstream creative brief.
- Conversion / pixel / measurement plumbing — separate artifact.
- Long-form video/script ad copy — fundamentally different craft (and would dilute this template); covered indirectly by talk-track-pitch-script (21) and demo-script (20).

## Open questions for audit

- Should the artifact enforce a *minimum variant count for statistical power* (e.g. 8 variants minimum across 2 angles × 4 headline types)? Currently it's 8-12 as a guideline. Lean toward enforcing 8 minimum to prevent under-powered tests.
- Do we want to bake the corpus's "300-500 conversions per variant" rule into the validation checklist explicitly, or keep that for an ops/measurement artifact? Currently mentioned in passing — flag for review.
- The 6 angle slots collapse Bly's reason-why and Ogilvy's testimonial categories into one ("proof-led") and add "contrarian" + "news/why-now" not directly in either book — this is a synthesis call. Validate with user.

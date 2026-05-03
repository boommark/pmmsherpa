# Artifact 35 — Landing Page Copy: research synthesis

## Canonical books read

### Bly — The Copywriter's Handbook
- **The 4 U's Formula**: every headline scored on Urgent / Unique / Useful / Ultra-specific. Aim 3+ of 4 at strength 3+.
- **Eight Headline Types**: Direct, Indirect, News, How-To, Question, Command, Reason-Why, Testimonial. Direct, How-To, News, and Reason-Why are the workhorses for B2B LP heroes.
- **AIDA arc**: Attention → Interest → Desire → Action. Maps cleanly onto LP modules — hero (A), problem agitation (I), solution + benefits + proof (D), CTA (A).
- **You-Orientation**: every paragraph rewritten so reader-pronouns dominate. "If sentence has more 'we' than 'you', rewrite."
- **Headline as gateway**: 5x readership of headlines vs. body. If the headline fails, 80% of effort is wasted before the visitor scrolls.
- **Proof before price**, **specificity beats generality**, **one specific CTA**.

### Hormozi — $100M Offers
- **Value Equation**: Perceived Value = (Dream Outcome × Perceived Likelihood of Achievement) / (Time Delay × Effort & Sacrifice). LP copy is the visual surface where the equation either lands or doesn't.
- **Problems & Solutions Architecture**: enumerate every problem the buyer faces; stack solutions so the offer feels like a bargain. Maps to LP "benefit blocks" — each one solves a related problem, not a single feature.
- **Trim & Stack**: remove low-perceived-value items; stack named bonuses, guarantees, and risk-reducers.
- **Naming & wrapper**: the headline IS the offer wrapper. Strategic naming changes perception without changing substance.
- **Friction-reducers** ("no credit card required", named guarantee) belong above the fold per Hormozi's perceived-effort denominator.

## Corpus citations (top 10)

1. Bly — Copywriter's Handbook (book, p.240)
2. Neil Patel — B2B PPC / Landing Page Optimization for B2B Conversions
3. Wes Bush — ProductLed: Common SaaS SEO Mistakes to Avoid
4. PMA — A Beginner's Guide to Customer Acquisition / Landing Page Best Practices
5. Wes Bush — ProductLed: B2B SaaS Copywriting — The Art of Persuasion Above the Fold
6. PMA — SaaS conversion optimization is different
7. Wes Bush — ProductLed: Key Takeaways (B2B SaaS copywriting)
8. Stevie Langford / PMA — What is B2B messaging? / Prevalent pitfalls
9. Wes Bush — ProductLed: B2B customer acquisition strategy guide
10. Mark Schaefer — Common mistakes in the job seeker website

### What the corpus added beyond the books

- **"Three-second test"** — visitors decide in 3 seconds whether the page answers "what's in it for me?" — drives hero brevity discipline.
- **Contrast-state framing** ("12 hours → 2 hours") as the dominant value-prop pattern — operationalizes Hormozi's Value Equation as visible copy, not abstract math.
- **Logos do double duty** — trust + self-identification ("if it works for them, it works for me"). Pick logos that match the ICP's industry, not the most famous logos.
- **Specificity over volume in proof** — one named-VP testimonial with a metric beats five 5-star quotes.
- **Message-match continuity** (ad → LP → onboarding) — the most-ignored conversion lever; surfaced as a pre-work decision.
- **CTA friction** ("Request a demo" with a 10-field form) — the form length is a CTA decision, not a separate concern.
- **Free trial vs. demo** routing rule — depends on time-to-aha. <30 min → trial; longer → demo.

### What the corpus contradicts / complicates

- Some PMA-house copywriting blogs lean into "feature columns" or "what we do" framing. The corpus and books agree this is a failure mode, not a pattern. Skeleton enforces benefit-led blocks.
- Several thought-leader blogs over-rotate on "social proof everywhere". Corpus + Bly agree: proof has location discipline (above-the-fold logo bar, in-block metric, dedicated testimonial slot) — not a sprinkle.

## Design decisions

- **Skeleton order: AIDA expanded for LP modules** — pre-work → hero (A) → proof bar → problem agitation (I, Bly's "agitation before solution") → solution overview → 3-5 benefit blocks (each tagged with a 4 U's micro-test inline) → testimonial slot → feature deep-dives → objection handlers → secondary CTA → FAQ → footer CTA. Mirrors Bly's AIDA without naming it; mirrors Hormozi's Problems & Solutions stack inside the benefit blocks.
- **3 alt headlines + 4 U's scorecard inline** — forces the user to draft alternatives and grade them rather than ship the first try (Bly: "headlines are tested, not chosen").
- **Pre-work block** — page type (homepage / product / campaign), upstream artifacts consumed (positioning, messaging framework), one primary CTA, ad-to-LP message-match note.
- **Each benefit block has 4 U's inline check** — micro-test at point-of-write so the model can't write a vague benefit and move on.
- **Objection handlers as a real section, not buried in FAQ** — corpus signal that conversion is unlocked by naming and answering 3-5 specific objections (price, switching cost, security, "this won't work for our setup", time-to-value).
- **FAQ is conversion copy, not customer support** — used to handle late-stage objections after the primary persuasion is done. Each Q is a real buyer objection, each A reduces friction or restates a benefit.
- **Negative system prompt is heavy** — "we" copy, vague benefits ("best in class", "next-gen", "AI-powered"), buried CTA, headlines that fail any 4 U's, restating positioning as marketing hype. Negative guidance is more effective than positive for high-craft copy (consistent with positioning-statement.ts and launch-blog-post.ts patterns).

### Differentiation from adjacent artifacts

- **vs. Launch Blog Post (10)**: blog post is a one-time announcement piece structured by Smart Brevity Core 4 around a launch moment. LP copy is a permanent conversion-oriented page that lives on the site and runs continuously against paid + organic traffic. Different shape, different job, different constraints.
- **vs. Cold Email Sequence (25)**: sequence is 5 emails, day-spaced, escalating CTAs across the sequence. LP is one page, all modules co-present, single primary CTA repeated. Both inherit Bly's 4 U's but apply them at different cadences.
- **vs. Positioning Statement (1) / Messaging Framework (2)**: those are internal strategic docs. The LP is the consumer-facing surface that *renders* their output. The skeleton requires the LP to inherit (not re-derive) positioning and messaging — the LP is downstream by design.

## Open questions

- Form-length / CTA-friction guidance — currently a one-line note. Could expand to a proper sub-block if user wants.
- A/B variant scaffolding — should the template include a hero variant block (e.g., 3 alt headlines + 2 alt subheads + 2 alt CTAs)? Currently includes 3 alt headlines only. Trade-off: variant scaffolding is useful for mature teams but bloats the template for early-stage users.
- Whether to surface the Hormozi naming/wrapper move as a dedicated section (offer-name pattern) or fold it into hero pre-work. Currently folded in.

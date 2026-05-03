---
title: "Phase 2 Audit — 18 One-Pager / Solution Brief"
artifact: one_pager_solution_brief
canonical_books:
  - "Smart Brevity (VandeHei / Allen / Schwartz)"
  - "The Copywriter's Handbook (Bly)"
status: drafted, awaiting audit
template_path: src/lib/mcp/artifact-templates/one-pager-solution-brief.ts
research_path: .planning/mcp-phase-2/corpus-research/18-one-pager-solution-brief.md
---

# Phase 2 Audit — 18 One-Pager / Solution Brief

This is the audit doc for the One-Pager / Solution Brief template. It is meant to be read end-to-end. Three sections: what the canon and corpus said, why this structure, and the system-prompt asks (the load-bearing block).

The artifact is unusual in this collection: it is the most physically constrained Phase 2 deliverable (single page, ~250-400 words of body copy, often a PDF). Length is itself a craft constraint — the template enforces it structurally because nothing else will.

---

## 1. Findings across canonical books and practitioners

### What Smart Brevity said (the brevity discipline)

Smart Brevity is the canonical book for "what fits on a page when a busy person reads it." The relevant disciplines:

- **The Core 4 — TEASE → LEDE → WHY IT MATTERS → GO DEEPER.** The structural backbone for any one-screen / one-page communication. The TEASE pulls the right reader in (here: the headline + the problem); the LEDE delivers the news in one line (here: the solution sentence); the WHY IT MATTERS earns the reader's continued attention (here: the three benefits); GO DEEPER is optional context for those who want it (here: How It Works + Proof).
- **Audience-First Principle.** Every word must earn its place by serving the reader. For a sales-distributed one-pager, the "reader" is a prospect reading async, often forwarded by a sales rep — they did not opt in to read this. The 6-second test (would they keep reading after the first 6 seconds?) is the gate.
- **Fog of Words.** Default B2B copy creates fog. The one-pager is the densest fog risk in the artifact set because PMM teams treat it as "the one place we get to explain everything." Smart Brevity's posture: cut, don't add.
- **Short, Not Shallow.** Concision is not incompleteness. The discipline is the ranking — what *must* be on the page, not what *can* be.

Smart Brevity's central principle for this artifact: *if the prospect hasn't grasped the value before the fold (or before scroll one in PDF terms), the rest of the page does no work*. We treat the headline + problem + solution as that fold.

### What Bly said (the conversion craft)

Bly's *The Copywriter's Handbook* owns the line-level craft inside the structure. The relevant disciplines:

- **The 4 U's headline test — Urgent, Unique, Useful, Ultra-specific.** The headline does 80% of the work; five times more readers see the headline than the body. Aim for 3+ on at least three dimensions. We embed this test inside the Headline section and reference it again in the validation block.
- **Benefit-led copy / You-Orientation.** Bly is uncompromising: every paragraph addresses "you", not "we". The customer's outcome leads; the company's mechanism follows only if it earns its place. For a one-pager this is the single highest-leverage rule because feature-soup is the dominant failure mode.
- **CTA discipline.** "Copy is salesmanship in print." A one-pager without a specific CTA — singular, action-led, immediately doable — is salesmanship that forgot to ask for the order. Bly is unambiguous: one CTA, named action, no hedging.
- **Eight headline types — direct / news / how-to / question / reason-why / command / testimonial / indirect.** For B2B SaaS one-pagers, the highest-converting patterns are *News*, *How-To*, *Reason-Why*, and *Direct*. We surface those four in the template; the others are out of scope for this artifact.
- **Proof Before Price.** Build credibility (customer voice, named outcome, recognizable logo) before the CTA. Most one-pagers invert this — they ask for the demo before they earn the trust.

Bly's central principle for this artifact: *the page exists to make the prospect take one specific next action*. Strip everything that does not contribute to that action.

### What corpus added (top citations)

The corpus query (Tier-2 amplification) returned 10 citations with synthesis tightly aligned to the books:

1. **Dunford — Sales Pitch p.144** — Reinforces the "one CTA, prospect-on-their-journey" frame. The one-pager is a leave-behind that supports the next sales conversation, not a campaign asset.
2. **Bly — Copywriters Handbook p.310** — Direct echo of 4 U's and CTA discipline.
3. **Punchy (Klettke) p.5-6** — VBF-rule reinforcement: benefit-led copy, "could a competitor lift this verbatim" filter, three benefits as the lock.
4. **PMA — Bryony Pearce, "Your guide to sales enablement"** — Practitioner classification: solution brief is a leave-behind / async-distribution asset distinct from pitch deck (synchronous, presented), distinct from landing page (web, top-of-funnel acquisition), distinct from battlecard (internal-only, vs-competitor framing). This is the boundary call.
5. **PMA — Al Sargent, "To succeed in PMM, do less"** — The dual-purpose drift failure mode named directly. "If you try to make one asset serve sales and marketing, it will under-serve both." Adopted as the central failure mode in the system prompt.
6. **Weinberg — New Sales Simplified p.105** — Power Statement framing for the Solution sentence: "We help [persona] do [thing] so they can [result]." Adopted as the structural prompt for the Solution section.
7. **PMA — "Most effective sales assets"** — Customer proof is the highest-leverage section AND the most-skipped. Two practitioner blogs converge on this — adopted as a hard requirement in validation.
8. **PMA — health-tech blog, "Ways to move a deal forward"** — Reinforces the singular-CTA rule. Specifically calls out "Learn more, request a demo, or contact us" as a hedge that kills conversion. Used verbatim as a forbidden pattern in the system prompt.
9. **PMA — Rachel Nulman-Schapiro, "How to deliver a killer demo"** — Connects one-pager to demo asset chain: the one-pager hands off to the demo or trial, not vice versa. Used in the boundary discipline.
10. **Synthesized response (corpus + RAG)** — Four-pattern decomposition for "How It Works": connect-configure-go-live, name 3 steps max, concrete-sequential-fast. Adopted as the structural prompt for the How It Works section.

### Where the canon disagreed — and which won

There were no direct conflicts between Smart Brevity and Bly. They compose cleanly: Smart Brevity owns *what* and *in what order*; Bly owns *how each line lands*. The ratio is roughly 60% Smart Brevity (structure + brevity) / 40% Bly (headline craft + CTA + benefit-led discipline).

The one practitioner conflict worth noting:

**Should the one-pager include pricing?** PMA blogs are split. One camp argues including a starting price ("Starts at $X / month") increases qualified inbound by self-disqualifying. Another camp argues pricing belongs on the pricing page, not the one-pager — the one-pager exists to earn the next conversation, not to close the deal.

- **Decision: pricing teaser is OPTIONAL, not required.** The template renders an optional Pricing or Starting-Price line that the user can keep or remove based on their sales motion. PLG / self-serve products keep it; enterprise / sales-led motions remove it. This is set in pre-work.

### Where the canon merged

- **Headline failure modes.** Smart Brevity's "fog" + Bly's "could a competitor lift it verbatim" merge into one filter: a headline that names a category instead of a buyer outcome fails both tests.
- **Brevity / outcome-led pairing.** Smart Brevity's WHY IT MATTERS + Bly's benefit-led copy converge on "every benefit pairs a verb with a result; never an adjective with a noun" (e.g. "Reduce forecast errors by 40%" not "Accurate forecasting").
- **Validation gate.** Smart Brevity's read-aloud test + Bly's headline test + corpus practitioner test (the competitor-verbatim filter) merge into a single 8-item validation block at the bottom of the template.

---

## 2. Why we chose this template structure

### The structural decisions

**Skeleton = Smart Brevity Core 4, expanded for sales-enablement-leave-behind.** Pre-work → Headline (with 4 U's check) → Problem → Solution → 3 Benefits → How It Works → Customer Proof → optional Pricing teaser → CTA → optional Footer (logo / contact / version). Each block is rendered as a fixed section with bracketed inline prompts the LLM fills in. The Core 4 mapping:
- TEASE = Headline + Problem
- LEDE = Solution (one sentence)
- WHY IT MATTERS = the three Benefits
- GO DEEPER = How It Works + Customer Proof

**Pre-work as Step 0.** Five pre-work decisions made before drafting: audience (the ONE prospect persona), the single CTA, sales motion (PLG vs sales-led — affects pricing teaser), distribution channel (PDF leave-behind vs sales rep email attachment vs partner asset), and inputs from upstream artifacts (positioning, messaging framework). Skipping pre-work produces dual-purpose drift — the central failure mode.

**Three benefits, locked.** Identical to messaging framework discipline. "Three is complete; four becomes inventory; two feels incomplete." The skeleton enforces three.

**How It Works gets max 3 steps.** Corpus and book canon converge: enough to make the solution feel real, not enough to replace a demo. The skeleton renders three step blocks, with explicit "skip if not needed" guidance for steps 2 and 3.

**Customer Proof is non-optional.** The corpus is unambiguous: it's the single highest-leverage section and the most-skipped. The template renders it as a required section with two formats (named-customer quote OR named-outcome metric); the validation block hard-flags missing proof.

**Pricing teaser is OPTIONAL.** Driven by sales motion in pre-work. PLG keeps; sales-led removes.

**CTA is singular and required.** One action, decided in pre-work, not negotiable during drafting. The skeleton names four high-converting patterns and four forbidden hedges.

**Footer is metadata only.** Version / date / contact info / asset ID. Not body copy.

**Total body copy target: 250-400 words.** Genuinely a single page in PDF or letter format. The validation block enforces this.

### Trade-offs we accepted

- **No competitor comparison.** That's the comparison_matrix or battlecard artifact. Including it here pulls the one-pager toward dual-purpose drift.
- **No use-case-by-vertical breakouts.** A one-pager that tries to serve three verticals serves none. If multiple verticals matter, render multiple one-pagers (one per vertical).
- **No FAQ block.** That's a separate artifact (internal_launch_faq) or belongs on the website.
- **No SEO target query / meta description.** The one-pager is an offline / async-PDF / email-attachment asset, not a web page. Landing page (artifact 35) owns SEO.
- **Not a sales pitch deck (artifact 19).** The one-pager is a leave-behind, not a presentation. The deck is presented synchronously by a rep; the one-pager is read async by a prospect (often forwarded internally).
- **Not a partner enablement one-pager (artifact 27).** That's partner-facing; this is prospect-facing.

### Section-to-source map

| Template section | Source |
|---|---|
| Pre-work: Audience persona | Smart Brevity (Audience-First); Punchy (A+ Customer) |
| Pre-work: Single CTA | Bly (CTA discipline); corpus (Dunford Sales Pitch) |
| Pre-work: Sales motion | Corpus (PMA practitioner blogs) |
| Pre-work: Distribution channel | Corpus (PMA Bryony Pearce — sales enablement assets) |
| Pre-work: Upstream artifact inputs | Phase 2 architecture (compose with positioning + messaging) |
| Headline (with 4 U's check) | Bly (4 U's + 8 headline types); Smart Brevity (TEASE) |
| Problem | Smart Brevity (audience-first); corpus (BDF pattern) |
| Solution (one sentence) | Smart Brevity (LEDE); Weinberg Power Statement (corpus) |
| Three Benefits (verb + result) | Bly (benefit-led); Punchy (VBF + 3-benefit lock); Smart Brevity (WHY IT MATTERS) |
| How It Works (3 steps max) | Smart Brevity (GO DEEPER); corpus (3-step pattern) |
| Customer Proof | Corpus (PMA — most effective sales assets); Bly (proof before price) |
| Pricing teaser (optional) | Corpus (PMA practitioner split); decision = optional |
| CTA | Bly (CTA discipline); corpus (forbidden hedge phrases) |
| Footer (metadata) | Practitioner standard (sales asset versioning) |
| Validation checklist | Smart Brevity (read-aloud); Bly (4 U's); corpus (competitor-verbatim) |

### What we excluded and why

- **SEO / meta description** — landing page artifact owns this.
- **Detailed feature matrix / spec sheet** — comparison_matrix artifact owns this.
- **Competitor breakdown** — battlecard / comparison_matrix.
- **Internal launch context** — internal_launch_faq.
- **Partner co-sell context** — partner_enablement_one_pager (27) and joint_solution_brief (29).
- **Long-form case study** — case_study artifact (37). The one-pager pulls one quote / one metric, not the full story.
- **Demo script / talk track** — sales enablement artifacts 20, 21.

---

## 3. System prompt asks (most important section)

The system prompt is again **failure-mode-heavy** — 9 negative-guidance lines and 4 positive asks. Same rationale as the messaging framework: for high-craft documents, telling the model what NOT to do is more effective than positive guidance.

This artifact has more failure modes than most because it sits at the intersection of marketing and sales — the dual-purpose drift failure mode is uniquely sharp here. The corpus surfaced this directly (PMA — Sargent), and we encoded it as the central system-prompt rule.

### Negative-guidance lines

1. **"Dual-purpose drift — drafting an asset that is simultaneously a sales tool AND a marketing flyer. The two have different jobs and different readers. Pick: this is a sales-enablement leave-behind for a prospect who will read it async, often forwarded by a sales rep. The job is to earn the next conversation, not to explain the entire product, not to serve SEO, not to make the CEO proud at a trade show."**
   - *Why:* Central failure mode for this artifact, surfaced repeatedly in the corpus. Without explicit suppression, the model defaults to "comprehensive overview" mode.
   - *Source:* Corpus (PMA — Al Sargent); reinforced by Smart Brevity Audience-First.

2. **"Feature soup — listing capabilities without paired outcomes. Every benefit must be a verb-and-result, never an adjective-and-noun. 'Reduce forecast errors by 40%' beats 'Accurate forecasting.'"**
   - *Why:* The default failure when sales asks for "all the features on one page." Bly's benefit-led rule + Punchy's VBF directly suppress this.
   - *Source:* Bly (You-Orientation); Punchy (VBF Rule).

3. **"Missing the customer's problem — opening on the product / company / category instead of the buyer's situation. The headline and Problem section together must pass the test: would the prospect's CFO recognize this pain in their own language?"**
   - *Why:* Inside-out framing is the model's default. The one-pager amplifies this failure because PMM teams over-rotate on the product description in a length-constrained format.
   - *Source:* Smart Brevity (Audience-First); Bly (You-Orientation).

4. **"No proof, or proof postponed — a one-pager without a named customer quote, named-customer metric, or recognizable logo cluster reads as marketing. Customer proof is non-optional. If you do not have a quote, pull a metric. If you do not have a metric, pull a logo cluster from beta or design partners."**
   - *Why:* Corpus is unambiguous: highest-leverage section, most-skipped. Hard rule.
   - *Source:* Corpus (PMA — most effective sales assets); Bly (proof before price).

5. **"No clear CTA, or hedged multi-CTA — 'Learn more, request a demo, or contact us' is not a CTA, it is a shrug. One action. Specific. Named verb. Examples: 'Book a 20-minute demo', 'Start your 14-day trial', 'Read the [Customer] case study'."**
   - *Why:* Direct corpus quote. Singular CTA is the simplest highest-leverage discipline; the model defaults to options.
   - *Source:* Bly (CTA discipline); corpus (PMA health-tech blog).

6. **"Too dense — the one-pager that fits 1,200 words on the page reads as wallpaper, not communication. Body copy target: 250-400 words. Cut clutter ruthlessly. Every word does work, or it goes."**
   - *Why:* Smart Brevity's central discipline. Models default to filling the available space; explicit suppression keeps the page breathable.
   - *Source:* Smart Brevity (Short Not Shallow + Fog of Words).

7. **"Headline-as-category — 'AI-powered revenue intelligence platform' is not a headline; it is a category claim a competitor could lift verbatim. Headlines name the buyer's situation or outcome. Apply the competitor-verbatim test: if a direct competitor could run this exact headline, rewrite it."**
   - *Why:* Headlines do 80% of the work. Category-claim headlines are the dominant failure pattern in B2B SaaS one-pagers.
   - *Source:* Bly (4 U's, especially Unique); corpus (competitor-verbatim test).

8. **"How-It-Works as architecture diagram — three steps maximum, named in plain language, sequential, fast. Enough to make the solution feel real, not enough to replace a demo. If a step needs an architecture diagram to explain, it does not belong on the one-pager."**
   - *Why:* Failure mode where engineering-led teams over-explain mechanism. The one-pager is not a technical brief.
   - *Source:* Smart Brevity (GO DEEPER); corpus (3-step pattern).

9. **"Inside-out 'we' voice — every paragraph addresses 'you' and 'your team', not 'we' and 'our platform'. If a sentence has more 'we' than 'you', rewrite it. The leave-behind is read by the prospect, not by the company."**
   - *Why:* The model's training prior is dominated by company-authored copy. Active suppression at draft time.
   - *Source:* Bly (You-Orientation); Smart Brevity (Audience-First).

### Positive asks

1. **"Render exactly three benefits. Each benefit is a verb-and-result pair. Pull the three from the messaging framework's Differentiated Value themes if a messaging_framework artifact exists for this product."**
   - *Why:* Locks the structural rule and connects to upstream artifact composition.

2. **"Pull customer language from the RAG corpus when available — Sharebird AMAs, podcast snippets, customer interviews, sales call transcripts. Prospects respond to other buyers' words, not to marketers' phrasing."**
   - *Why:* PMM Sherpa's corpus has authentic buyer language. Without this prompt, the model defaults to marketing register.

3. **"Write the Solution sentence as a Power Statement: '[Product] helps [specific persona] do [specific thing] so they can [specific result]'. The prospect's boss should be able to repeat this sentence in a 9am meeting."**
   - *Why:* Concrete usability bar borrowed from Weinberg via the corpus. Forces simplicity, specificity, and business framing.

4. **"If the sales motion is enterprise / sales-led, omit the pricing teaser. If PLG / self-serve, include a starting-price line ('Starts at $X / seat / month') to self-qualify inbound. The decision is set in pre-work and does not change during drafting."**
   - *Why:* The one practitioner split that needed an explicit branch. Pre-work decision drives template behavior.

### Why negative > positive (9:4 ratio)

The one-pager has a denser failure-mode landscape than even messaging framework because it sits at the marketing/sales boundary. Every PMM team has a deeply-grooved default for this artifact (the "comprehensive overview"), and the model's training prior contains thousands of mediocre B2B SaaS one-pagers that exemplify all 9 failures. Negative guidance actively overrides the failure prior at the token level; positive guidance just sits alongside it.

---

## Open questions for audit

- **Should the Headline section render the 4 U's check as a structural sub-block (current) or as a validation-only check?** Current = structural. Argument for keeping: makes the test active during drafting, not just review. Argument against: bloats a section that should be one line.
- **Should "How It Works" be optional?** Some sales motions (highly technical buyer, integration-heavy product) need it; others (simple SaaS app, time-limited trial) don't. Currently required — three steps, with explicit "skip step 2 and step 3 if not needed" prompts. Open for your call.
- **Should the Footer (version / date / contact / asset ID) be in the template skeleton or out of scope?** Currently included as a "metadata only, not body copy" block. Argument for: real one-pagers have asset versioning for sales-rep distribution. Argument against: not craft-relevant.
- **No corpus gaps logged.** All 10 citations had clean metadata.

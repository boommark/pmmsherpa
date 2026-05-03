# Research — Launch Press Release (artifact 11)

## Canonical sources (read FIRST)

- **Smart Brevity (VandeHei / Allen / Schwartz)** — primary craft source for the inverted-pyramid lede, "audience first" discipline, and the brutal word-count posture. The Core 4 (TEASE → LEDE → WHY IT MATTERS → GO DEEPER) is the same psychology AP has run on for 100+ years; Smart Brevity is the modernized articulation. The book card lives at `~/Documents/AbhishekR/Book Brain/Smart Brevity.md`.
- **AP Stylebook conventions** — not in Book Brain as a card, but the press release format is a journalism format and AP style is the table-stakes mechanics layer (dateline, numerals, titles before/after names, dates without "th", `###` end mark). Treated as known craft canon, not re-derived.
- **Corpus** — Tier-2 amplification for B2B SaaS specifics, modern failure modes, and the 2026 reality that PR is a skeptically-viewed channel.

## What the canon establishes

### Press release as journalism format, not marketing format
A press release is not a blog post, not a sales asset, not a launch announcement post. It is a **structured news document written in the voice of a wire-service reporter**, intended to be either (a) reproduced verbatim by a journalist who is on deadline, or (b) used by a journalist as the source for their own story. The format conventions exist because editors and reporters know how to scan them.

The strict skeleton (every component has a fixed slot):
1. **FOR IMMEDIATE RELEASE** marker (or embargo notice if held)
2. **Headline** — one line, news-shaped, ~10-12 words
3. **Subhead** — one line, the one detail the headline couldn't carry
4. **Dateline** — `CITY, STATE, Month DD, YYYY —` flush with first line of lede
5. **Lede paragraph** — who, what, why, when. Every essential fact in 2-3 sentences
6. **Supporting paragraph 1** — context / market framing / why now (descending importance)
7. **Supporting paragraph 2** — mechanics, capability detail, scale numbers
8. **Executive quote** — strategic significance, not a restatement of the lede
9. **Customer or partner quote** — third-party validation with specific outcome
10. **Boilerplate** — "About [Company]" — 2-3 sentences with one credibility anchor
11. **`###`** — end-of-release mark (AP standard)
12. **Media contact** — name, title, email, phone

### Smart Brevity → press release mapping
- **TEASE = headline + subhead.** The headline must create stakes the journalist cares about, not generic intrigue.
- **LEDE = lede paragraph.** Smart Brevity's "deliver the key insight in the opening sentence" is exactly the AP lede principle. Who did what, why it matters, when, in 2-3 sentences.
- **WHY IT MATTERS = supporting paragraph 1.** Market context, the shift, the stake for the buyer. Smart Brevity makes this explicit; classic PR templates often skip straight to feature description.
- **GO DEEPER = supporting paragraph 2 + quotes.** Optional reading. Reporters who need it get it; those who don't, don't.

### Inverted pyramid (the structural law)
Most important fact first, least important last. Editors cut from the bottom. Journalists skim from the top. If a reader stops after sentence one, they should still have the news. If they stop after the lede paragraph, they have the whole story. Quotes and detail flesh it out for those who keep reading.

This is the load-bearing structural principle and overrides all "creative" instincts to build to a reveal, set up context first, or save the punchline.

---

## Corpus research (amplification only)

The corpus query returned a single high-quality synthesized response (the RAG layer rolled the 15 retrieved chunks into one structured answer). Citations attached were **weakly attributed to PR** specifically — Crossing the Chasm p.77, Sales Pitch p.129, Wes Bush copywriting blogs, Kyle Poyar substack, Stevie Langford on B2B messaging. None are dedicated PR sources. This is a corpus signal: **press release is under-represented as a discrete artifact** in PMM Sherpa's corpus, which itself reinforces the modern reality that the discipline has shifted toward launch blog (artifact 10) and announcement social as primary channels, with the press release relegated to a wire/media motion for tier-1 launches.

What the synthesized response added beyond the books:

1. **Five concrete failure modes** — marketing-copy headlines, no real news, vague boilerplate, missing or restated quotes, length over 600 words. Each is a per-line filter, sharper than Smart Brevity's general "fog" warning.
2. **Specific headline rewrites** — "Acme Revolutionizes the Future of Customer Engagement…" (bad) vs "Acme Raises $40M Series B to Expand AI-Powered Support Automation into Europe" (good). Net-new contribution: news-shape pattern (Subject + specific verb + specific number/scope + specific where/why-now).
3. **The "trade reporter independence" test** — *would a trade reporter at a relevant vertical publication find this independently interesting?* Sharper than "is this newsworthy?" Adopted as a system-prompt failure mode.
4. **The boilerplate-exposes-positioning insight** — "if you can't write two tight sentences about what your company does and for whom, your positioning work isn't done yet." This connects artifact 11 backward to artifact 01 (positioning) — the boilerplate is a positioning regression test.
5. **AP style mechanics** — spell out one through nine, numerals 10+, titles before names capitalized, no "10th" for dates, "10%" not "10 percent" in current AP. Adopted into the Validation block.
6. **Specificity is credibility** — "30% faster ticket resolution" beats "significant productivity gains". Adopted into the executive/customer quote prompts.

### Where book wins on conflict
No direct conflicts. Smart Brevity and the corpus synthesis agree: short, audience-first, lead with the news, kill the jargon. Smart Brevity's TEASE/LEDE/WHY/DEEPER becomes the structural overlay on top of the AP skeleton — the two are fully composable.

### Where corpus added net-new
- The five concrete failure modes (per-line filter form)
- The trade-reporter-independence test
- The boilerplate-as-positioning-regression-test framing
- The AP style mechanics list
- The specificity-is-credibility filter on quotes

### Where they merged
- "Audience first" (Smart Brevity) + "would a trade reporter find this independently interesting" (corpus) → one system-prompt rule: write for the reporter on deadline, not the internal exec who approved the launch.
- "Short, not shallow" (Smart Brevity) + "one page, 400-500 words" (corpus) → hard word-count target in the system prompt.

---

## Template design decisions

**Authority hierarchy:** Smart Brevity sets the brevity discipline and the audience-first frame. AP conventions set the mechanical structure. Corpus amplifies with B2B SaaS-specific failure modes and the AP style mechanics list. No conflicts — clean composition.

**Strict skeleton, no flex.** Unlike messaging or positioning where pre-work scaffolding is essential, the press release is a 100-year-old format. The skeleton renders all 12 components in fixed order. Reordering breaks the format; the template enforces it.

**Pre-work as Step 0.** Three pre-work items the model must answer before drafting:
1. *Is this real news?* — the "trade reporter independence" test. If it fails, the template surfaces a hard stop: "consider a launch blog instead (artifact 10)."
2. *Tier of launch (T1 / T2 / T3).* — Press release is appropriate for Tier 1 (industry-defining) and Tier 2 (significant, with media motion) launches. For Tier 3 / Tier 4, the artifact recommends skipping. This connects to artifact 09 (launch plan) tiering.
3. *News type.* — funding, product launch, executive hire, customer milestone, partnership, acquisition, certification. Each has slightly different lede emphasis; the template asks the user to name it so the lede prompt can shape accordingly.

**Word count target: 400-500 words, hard ceiling 600.** Stated in the system prompt and in the validation block. Smart Brevity discipline operationalized as a number.

**Headline pattern, not headline freedom.** The skeleton specifies the news-shape pattern: `[Subject] [specific verb] [specific scope/number] [where / why-now]`. Without this, models default to marketing-copy headlines.

**Quote rules, not quote freedom.** Two quotes only. Executive quote = strategic significance ("why this matters"), explicitly NOT a restatement of the lede. Customer/partner quote = specific outcome with a number or named situation, explicitly NOT generic satisfaction. Each prompt includes the bad-pattern example as negative guidance.

**Boilerplate as positioning regression test.** The boilerplate prompt explicitly references the positioning_statement artifact: if the user has one, the boilerplate is derived from its market category + best-fit accounts + one credibility anchor. If they don't, the prompt warns that boilerplate failure means positioning failure.

**End mark `###`.** Included literally in the skeleton — it is a real AP convention that signals end-of-release to wire services and reporters.

**No headline alternatives, no A/B variants.** This is a journalism document, not a marketing test artifact. One headline, one subhead, one lede.

**No SEO / keyword section.** The press release is for media and wire — the SEO version of "the announcement" is the launch blog (artifact 10), which has its own keyword/share treatment.

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work: news test, tier, type | Corpus (trade reporter test) + artifact 09 inheritance | Suppresses the #1 failure: drafting a press release for non-news. |
| FOR IMMEDIATE RELEASE marker | AP convention | Wire-service signal. |
| Headline | Smart Brevity TEASE + corpus pattern | One line, news-shaped. |
| Subhead | AP convention | Carries one detail the headline couldn't. |
| Dateline | AP convention | Wire-service expectation. |
| Lede paragraph | Smart Brevity LEDE + AP inverted pyramid | Who/what/why/when in 2-3 sentences. |
| Supporting paragraph 1 — why it matters | Smart Brevity WHY IT MATTERS | Stakes for the buyer / market context. |
| Supporting paragraph 2 — how it works | Smart Brevity GO DEEPER | Mechanics, scope, numbers. |
| Executive quote | AP convention + corpus | Strategic significance, not restated lede. |
| Customer/partner quote | AP convention + corpus | Third-party validation with specific outcome. |
| Boilerplate | AP convention + corpus (positioning regression) | What the company does, for whom, one credibility anchor. |
| `###` end mark | AP convention | Standard end-of-release signal. |
| Media contact | AP convention | Reporter follow-up. |
| Validation (AP mechanics + brevity + news test) | Corpus + Smart Brevity | Per-line filters, not generic "review pass." |

## Sections excluded

- **SEO / keyword block** — belongs to launch_blog_post, not press release.
- **Social copy variants** — belongs to launch_plan / launch_blog_post.
- **Headline A/B variants** — journalism format renders one headline.
- **Long-form product description** — supporting paragraph 2 caps it; deeper detail goes in fact sheet / media kit (separate artifacts not in scope).
- **Customer testimonial collection** — separate artifact (15: customer_testimonial_quote_ask).
- **Distribution plan / wire vs direct outreach decision** — belongs to launch_plan, not the artifact itself.

## System prompt failure modes (negative guidance)

From book + corpus, distilled to 8:

1. **Marketing-copy headlines** — "[Company] Revolutionizes / Transforms / Pioneers the Future of [Category]" is not news, it is a banner ad. News-shape pattern: `[Subject] [specific verb] [specific scope/number] [where/why-now].`
2. **No real news** — apply the trade-reporter-independence test: would a reporter at a relevant vertical publication find this independently interesting? If no, this should be a launch blog (artifact 10), not a press release.
3. **Vague boilerplate** — "leading provider of innovative solutions that help companies achieve their goals" tells a reporter nothing. Boilerplate must answer: what does the product do, who uses it, and one credibility anchor (named customers, ARR range, notable backers, certifications).
4. **Restated-lede executive quote** — "We're thrilled to announce this exciting new capability" is not a quote, it is filler. The exec quote exists to add strategic significance the news paragraph cannot carry.
5. **Generic customer satisfaction quote** — "[Product] has transformed the way we work" is not validation. Customer quote needs a specific outcome (a number, a named situation, a before/after).
6. **Length over 600 words** — supporting detail belongs in the fact sheet or media kit, not the release. Hard ceiling: 600. Target: 400-500.
7. **Building to a reveal** — inverted pyramid, not narrative arc. The full story must be in the lede; everything else is descending importance.
8. **Inside-out framing** — "we are excited to announce that we have built X" is the launch team's voice, not the reporter's voice. Press release voice is third-person, news-register, audience-first.

## 2026 reality check (open question for audit)

In 2026, press releases are skeptically viewed. Most B2B SaaS launches do not run a wire-service motion at all — the launch blog (artifact 10), CEO LinkedIn post, and category-relevant podcast are the primary discovery channels. PR Newswire / Business Wire distribution is increasingly seen as expensive table-stakes for funding announcements, M&A, and tier-1 launches with media targets, but is **not standard for product launches**.

**Recommendation:** the artifact's pre-work should default to recommending **skip unless** the launch is:
- **Tier 1** (industry-defining; named in artifact 09 launch plan tiering), OR
- **Tier 2 with explicit media motion** (named press targets, embargo strategy, reporter relationships), OR
- **Funding / M&A / executive hire / certification announcement** (categories that conventionally require a press release for legal or stakeholder reasons), OR
- **Public-company / regulated-industry context** where disclosure conventions require a release.

For Tier 3 / Tier 4 / standard product launches without media targets, the artifact's pre-work should recommend the user generate a launch blog (artifact 10) instead and skip this one. This recommendation is encoded in the pre-work prompts.

This is logged here for audit. The template is built; the question is whether the default posture should be "skip unless" (current) or "always available, user judgment" (alternative).

## Open questions for audit

- **Should the template render the FOR IMMEDIATE RELEASE marker, or assume the user adds it during distribution?** Current: rendered. Argument for keeping: it's part of the format and absent it the document doesn't read as a press release; argument against: distribution-stage detail. Kept rendered.
- **Should the dateline include a pre-filled placeholder city, or leave it generic?** Current: `[CITY, STATE]` placeholder with format examples. The user should fill the actual HQ city.
- **Should we offer two boilerplate variants (long / short)?** Current: one. Adding a second adds a decision the user doesn't need at this altitude — boilerplate length is dictated by total word count.
- **Should the executive quote include the exec's title at first reference?** Current: yes — "[Executive Name], [Title] at [Company], said:". AP convention is title-after-name (lowercase) for after-quote attribution; we use title-before-name (capitalized) on first reference.
- **Should the system prompt name "AP style" explicitly?** Current: yes — it's an industry term every PR practitioner knows; not name-dropping authors.

## Corpus gap logged

The corpus has weak dedicated coverage of press release as a discrete artifact. Citations attached to the synthesized PR response were tangential (Crossing the Chasm p.77, Sales Pitch p.129, B2B messaging blogs). No PRSA / PR Newswire / Cision / dedicated PR-craft sources surfaced. Logged separately in `corpus-gaps.md` as a Phase 2 finding. Workaround: book + AP conventions + practitioner-pattern synthesis carried this artifact; if the corpus grows dedicated PR sources later, re-evaluate.

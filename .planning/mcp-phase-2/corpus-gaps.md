# Corpus metadata gaps surfaced during Phase 2 template research

Findings here are observations, not blockers. Each gap is a candidate fix for
the next ingestion sweep.

## 1. Dunford "Obviously Awesome" — broken metadata

**Discovered:** 2026-05-01 during positioning template research.

**Symptom:** Corpus query for "What does Obviously Awesome say about positioning?" returns a chunk citation as `[book] ? p.129` — no `title`, no `author`, no `url`. Compare against `Sales Pitch` which surfaces correctly as `[book_sales] ? p.169 — https://www.amazon.com/s?k=Sales+Pitch-April+Dunford`.

**Impact:** RAG synthesis defaulted to PMA blog interpretations of positioning rather than Dunford's actual 2nd-edition framework (5 components, "Distinct Capabilities" / "Best-Fit Accounts" / "Differentiated Value" naming, explicit critique of the "For X who Y..." template). Templates grounded only in corpus output would inherit that bias.

**Suggested fix:** Re-ingest `obviously-awesome` (1st and 2nd edition if both are intended) with `documents.title`, `documents.author`, and `documents.url` populated. Confirm `source_type` is `book` (or a more specific tag like `book_pmm` to match the existing `book_sales` pattern).

**Workaround in Phase 2:** All template research reads the Obsidian Book Brain card first (`~/Documents/AbhishekR/Book Brain/[card].md`) and uses the corpus query for amplification only. See `methodology.md`.

## 2. ICP query — second `[book]` chunk with no metadata

**Discovered:** 2026-05-02 during ICP template research (artifact 04).

**Symptom:** Corpus query returned a `[book] ? p.67` citation with `author: null`, `url: null`, `section_title: null`. Likely an Obviously Awesome or Hormozi chunk on best-fit / market selection — both canonical for ICP — but unidentifiable from metadata.

**Impact:** Same pattern as gap #1. Synthesis defaulted to PMA-blog framings of ICP, which heavily overlap with Lenny Rachitsky's pain/budget/authority/timing pattern but miss Dunford v2's "buy quickly, don't grind on discounts, refer others, intuitively understand value" specific signals.

**Suggested fix:** Re-ingest the affected book(s) with `documents.title`, `documents.author`, `documents.url`, and `source_type` populated. Same as gap #1.

## 3. "The Go To Market Strategist" book — partial metadata

**Discovered:** 2026-05-02 during ICP template research (artifact 04).

**Symptom:** Corpus surfaces `[book] ? p.291 — https://www.amazon.com/s?k=The+Go+To+Market+Strategist` with `author: null`. URL identifies the book but author field is empty.

**Suggested fix:** Backfill `documents.author` for The Go To Market Strategist rows. Low-priority compared to gaps #1 and #2.

## 4. Some `[book]`-tagged chunks lack `source_type` discriminator

The `BOOK_INDEX.md` shows 64 books across categories (PMM, PM, Comms, Writing, Sales, Investment, etc.) but the corpus only consistently tags `book_sales`, `book_pm`, `book_communication`, `book_presentations` (added 2026-04). Books that haven't been reclassified still surface as bare `[book]` which:
- Doesn't help intent boosting in `applyIntentBoost()`
- Looks generic in citations

**Suggested fix:** Audit `documents` rows where `source_type = 'book'` and reclassify per the Book Brain index taxonomy.

## 5. Buyer journey query — Kalbach + Torres absent, Moore metadata partial

**Discovered:** 2026-05-02 during Buyer Journey Map template research (artifact 06).

**Symptom:** Corpus query for B2B SaaS buyer journey stages, the buyer-journey/customer-journey/sales-funnel boundary, and journey-mapping failure modes returned 10 citations: 1 book (Crossing the Chasm — `[book] ? p.154` with `author: null`) and 9 blogs (PMA + Neil Patel). No chunks from Kalbach's *Jobs to Be Done Playbook* (job map, five stages of value creation, Two Schools / Switch Technique buying-decision timeline), Moesta's *Demand-Side Sales* (the canonical "first thought / passive looking / active looking / deciding / satisfaction" timeline), or Torres's *Continuous Discovery Habits* (opportunity solution tree, proto-personas, interview snapshots) surfaced — even though Kalbach and Torres are explicitly the canonical books for this artifact and Moesta defines the 5-stage buying-decision timeline most often cited as "JTBD buyer journey."

**Impact:** Synthesis defaulted to PMA/Neil-Patel framings (Awareness / Consideration / Decision ≈ TOFU/MOFU/BOFU equivalence) rather than the JTBD demand-side timeline. Templates grounded only in corpus output would inherit that funnel-equivalence bias instead of the buyer-psychology lens.

**Suggested fix:**
- Re-ingest *The Jobs to Be Done Playbook* (Kalbach) — verify chunks for "Job Map", "Two Schools of JTBD", "Switch Technique", "Forces Analysis", "Five Stages of Value Creation" surface with `author`, `title`, `url` populated.
- Ingest *Demand-Side Sales 101* (Bob Moesta) if not already in corpus — the "first thought / passive looking / active looking / deciding / satisfaction" timeline lives here.
- Re-ingest *Continuous Discovery Habits* (Torres) — verify "opportunity solution tree", "proto-personas", "interview snapshots", "Mapping the Opportunity Space" chunks surface with author + title populated.
- Backfill `documents.author` for the Crossing the Chasm chunk surfaced as `[book] ? p.154`.

**Workaround in Phase 2:** Book cards read first from `~/Documents/AbhishekR/Book Brain/`; corpus output treated as practitioner-amplification (Awareness/Consideration/Decision overlay, B2B-SaaS specifics, multi-stakeholder dynamics) rather than canonical structure.

## 7. Andy Raskin material — no named-author citations

**Discovered:** 2026-05-02 during strategic-narrative template research (artifact 03).

**Symptom:** Corpus query for the Andy Raskin "strategic narrative" frame ("What is a strategic narrative for B2B SaaS in the Andy Raskin sense? ... old game/new game, promised land, stakes, named enemy") returns a coherent 5-component synthesis but **no citation is tagged with `author: "Andy Raskin"`**. Top citations are *The Go-To-Market Strategist* (3 chunks), *Loved* (Kaplan), *Sales Pitch* (Dunford, 3 chunks), Lenny Rachitsky podcast, PMA blog, and Moore. The synthesis text uses Raskin's distinctive vocabulary almost verbatim ("specific, named, undeniable thing," "promised land," "Yoda not Luke," "the world has changed because…") but the source attribution is missing.

**Impact:** The model is reconstructing Raskin's frame from second-hand applications (PMA, GTM Strategist book, Lenny podcast). Defensible for amplification, but PMM users asking "what does Andy Raskin say about strategic narrative?" cannot get a direct answer with author-attributed citations.

**Suggested fix:** Ingest Raskin's substack (`https://andyraskin.substack.com`) and his canonical "Greatest Sales Deck I've Ever Seen" Medium essay as a `substack` or `thought_leader_blog` source with `author: "Andy Raskin"` populated. The vocabulary is referenced enough across the rest of the corpus that adding the primary source would meaningfully improve attribution on this artifact and on any downstream messaging / launch-narrative artifact.

**Workaround in Phase 2:** Strategic narrative template synthesis used Dunford and Hall as canonical books (read first per methodology) and overlaid the 5-component vocabulary as practitioner Tier-2 amplification. See `.planning/mcp-phase-2/corpus-research/03-strategic-narrative.md`.

## 6. Messaging framework query — `[book] ? p.87` orphan chunk

**Discovered:** 2026-05-02 during messaging-framework template research (artifact 02).

**Symptom:** Corpus query for B2B SaaS messaging framework components and failure modes returned a top-10 chunk with `source_type = book`, `author: null`, `url: null`, `page_number: 87`. Synthesized content (the "So what?" → CFO-language extension) is consistent with Punchy or LOVED material on benefit translation but unidentifiable from metadata.

**Impact:** Low for this template. Punchy surfaced cleanly on p.5, p.18, p.70 with `url = https://www.amazon.com/s?k=Punchy` populated, and dominated synthesis. The orphan chunk slightly diluted citation auditability but did not redirect the framework choice.

**Suggested fix:** Same pattern as gaps #1 and #2 — backfill `documents.title`, `documents.author`, `documents.url` for the affected row. Likely candidate: `punchy` or `loved-rethinking-product-marketing`.

**Workaround in Phase 2:** Book Brain card read first; corpus used for amplification only.

## 7. Buyer persona query — `[book] ? p.59` orphan + 3 untitled blog chunks

**Discovered:** 2026-05-02 during Buyer Persona template research (artifact 05).

**Symptom:** Corpus query for B2B buyer persona frameworks, the four buyer roles, and persona failure modes returned 10 citations including: 1 `book` chunk at `p.59` with `author: null`, `url: null`, `section_title: null`; 1 `book_sales` chunk at p.66 (correctly attributed to Sales Pitch via URL); and 3 internal `blog` chunks with `url: null` and only `section_title` populated. The synthesized output was unusually well-aligned with Kalbach (job performer), Torres (proto-personas), and the four-role B2B taxonomy — but the underlying chunks for the canonical Kalbach/Torres/Cagan books did not surface as identifiable citations.

**Likely candidates** for the orphan `[book] ? p.59`: Kalbach JTBD Playbook (the chapter on Job Performer / Defining Value falls in this page range), Torres Continuous Discovery Habits (Chapter Four "Visualizing What You Know" introduces proto-personas around this depth), or Cagan Inspired (early chapters on the Four Risks). Unidentifiable from metadata alone.

**Impact:** Low for this template — synthesis was clean and Book Brain cards drove structure. But the consistent pattern across artifacts 01, 04, 05, 06 of canonical books surfacing as bare `[book]` chunks confirms this is a systemic ingestion-metadata issue, not artifact-specific.

**Suggested fix:** Same as gaps #1, #2, #5, #6 — backfill `documents.title`, `documents.author`, `documents.url` for affected book rows. Re-ingesting Kalbach JTBD Playbook, Torres Continuous Discovery Habits, and Cagan Inspired with full metadata would resolve gap #5 (artifact 06) and gap #7 (artifact 05) simultaneously.

**Workaround in Phase 2:** Book Brain cards read first; corpus used for amplification only.

## Artifact 17 (Comparison Matrix) — PMA blogs with missing URL/section metadata

**Discovered:** 2026-05-02 during comparison matrix template research (artifact 17).

**Symptom:** Two of the 10 returned citations had `url: null` and `section_title: null` (one labeled "2. Performance features", one labeled "The B2B buyer's struggle with technical products"). Likely PMA practitioner blogs given the surrounding citation pattern, but unidentifiable from metadata.

**Impact:** Low — the synthesized response was unusually clean and directly mapped onto the brief's failure-mode list. Did not block this template.

**Suggested fix:** Backfill `documents.url` for PMA blog rows missing the field. Verify the `source_type: blog` rows have a parseable parent doc.

**Workaround in Phase 2:** Synthesized text used in audit doc; raw chunk-level citation skipped where metadata was incomplete.

## Artifact 11 (Launch Press Release) — no dedicated PR-craft sources in corpus

**Discovered:** 2026-05-02 during launch press release template research (artifact 11).

**Symptom:** Corpus query for press release structure, AP style, inverted pyramid, and PR failure modes returned a single high-quality synthesized response (RAG layer rolled 15 retrieved chunks into one structured answer). The 10 attached citations were weakly attributed: Crossing the Chasm p.77, Sales Pitch p.129, Wes Bush copywriting blogs (productled.com), Kyle Poyar substack, Stevie Langford on B2B messaging, PMA blog on emerging-markets messaging. None are dedicated PR-craft sources (no PRSA, no PR Newswire / Business Wire / Cision documentation, no AP Stylebook, no dedicated PR practitioner books).

**Impact:** Medium. The synthesis itself was high-quality and clearly captured the canonical PR structure (12-component skeleton, inverted pyramid, AP mechanics, modern failure modes). But the citation backing was thin — the model is synthesizing PR best practices from adjacent communication / copywriting / messaging sources rather than PR-specific sources. For PR-skeptical 2026 reality framing, the corpus had no direct support; we drew that conclusion from practitioner-pattern reasoning.

**Likely root cause:** The Book Brain index has Smart Brevity and other communication-craft books, but no dedicated PR books (e.g., *The PR Style Guide*, *Spin Sucks*, AP Stylebook, *Tell to Win*). Practitioner blog corpus is dominated by PMA / Sharebird / productled / Lenny / Kyle Poyar — all valuable for PMM but none focused on PR-craft specifically.

**Suggested fix:** If PR craft is intended to be a corpus competence, ingest at least one dedicated PR source — e.g., a PRSA practitioner guide, *Spin Sucks* by Gini Dietrich, or a structured AP Stylebook subset. Otherwise the template carries the load via Book Brain (Smart Brevity) + AP conventions + practitioner synthesis, which is acceptable but means the corpus cannot independently validate PR claims.

**Workaround in Phase 2:** Smart Brevity Book Brain card + AP conventions (treated as industry table-stakes mechanics) + corpus synthesis carried this artifact. The template is opinionated enough (strict 12-component skeleton, 8 named failure modes) that corpus-citation thinness did not block drafting.

# Phase 2 — Artifact Templates: Completion Summary

**Date:** 2026-05-02
**Scope:** All 39 artifact templates for the `generate_artifact` MCP tool, built from book-cards-first methodology with corpus as Tier-2 amplification.

---

## Deliverables

| Layer | Count | Location |
|---|---:|---|
| Template TypeScript files | 39 | `src/lib/mcp/artifact-templates/[artifact-name].ts` |
| Corpus-research summaries | 39 | `.planning/mcp-phase-2/corpus-research/[NN]-[name].md` |
| Corpus-query JSON outputs | 39 | `.planning/mcp-phase-2/corpus-research/[NN]-[name].json` |
| Obsidian 3-section audit docs | 39 | `~/Documents/AbhishekR/PMM Sherpa/Phase 2 Templates/[NN]-[name].md` |
| Typecheck status | clean | `npx tsc --noEmit` returns 0 errors |

Every template implements the `ArtifactTemplate` interface from `src/lib/mcp/artifact-templates/types.ts`:

```ts
export interface ArtifactTemplate {
  artifactType: string
  title: string
  systemPromptFragment: string
  skeleton: string
}
```

The 39 template files contain pure template data — no registry/index file is wired into `tools.ts` yet. Wiring `generate_artifact` to consume these templates is a follow-up task.

---

## Methodology recap

Per `.planning/mcp-phase-2/methodology.md`:

1. **Identify canonical books** for the artifact via `~/Documents/AbhishekR/Book Brain/BOOK_INDEX.md`.
2. **Read the book card(s) FIRST** — extract named frameworks, failure modes, critiques of conventional approaches, memorable quotes.
3. **Run corpus query** for amplification (`scripts/corpus-query.ts`).
4. **Synthesize per Tier-2 reconciliation rule**: book wins on conflict; merge mergeable practitioner POV; corpus adds B2B specifics where it doesn't contradict.
5. **Build the template** — file header naming canonical sources, system-prompt fragment dominated by negative guidance, skeleton with bracketed prompts.
6. **Log corpus gaps** in `corpus-gaps.md`.
7. **Write Obsidian audit doc** in 3 sections: findings / structure rationale / system-prompt asks.

Foundational artifact 01 (positioning statement, Dunford v2) became the gold-standard reference every subsequent template was structured against.

---

## Artifact catalogue

| # | Artifact | Canonical books |
|---|---|---|
| 01 | Positioning statement | Dunford — Obviously Awesome v2 (primary); Dunford — Sales Pitch (validation); Moore — Crossing the Chasm; Ries — Play Bigger |
| 02 | Messaging framework | Punchy (VBF rule, So-What game, BBQ talk); Lauchengco — Loved (CAST messaging) |
| 03 | Strategic narrative | Dunford — Sales Pitch (8-step storyboard); Hall — Stories That Stick (value story); corpus (Andy Raskin lineage) |
| 04 | ICP | Dunford — Obviously Awesome v2 (Best-Fit Accounts); Hormozi — 100M Offers (market selection) |
| 05 | Buyer persona | Kalbach — JTBD Playbook (job performer + 5 stages); Torres — Continuous Discovery Habits; Cagan — Inspired (four risks) |
| 06 | Buyer journey map | Kalbach — JTBD Playbook (5 stages); Torres — Continuous Discovery |
| 07 | Win/loss insights | Corpus (PMA + Sharebird); 3-layer numbers/themes/quotes |
| 08 | Value prop canvas | Hormozi — 100M Offers (Value Equation); corpus (Strategyzer) |
| 09 | Launch plan / GTM brief | The Go-To-Market Strategist (six decisions); corpus (Pocket Guide tiers, RACI, rolling thunder) |
| 10 | Launch blog post | Smart Brevity (TEASE-LEDE); Bly — Copywriters Handbook (8 headlines); Zinsser — On Writing Well |
| 11 | Launch press release | Smart Brevity; corpus (PR best practices) |
| 12 | Internal launch FAQ | Smart Brevity; corpus |
| 13 | Internal launch deck | Duarte — Resonate; Illuminate (Torchbearer model) |
| 14 | Customer-facing launch deck | Duarte — Resonate; Donovan — How to Deliver a TED Talk |
| 15 | Customer testimonial / quote ask | Corpus (Sharebird customer marketing AMAs) |
| 16 | Battlecard | Punchy (competitive audit); corpus |
| 17 | Comparison matrix | Punchy; corpus |
| 18 | One-pager / solution brief | Smart Brevity; Bly — Copywriters Handbook |
| 19 | Sales pitch deck | Dunford — Sales Pitch (8-step storyboard); Duarte — Resonate |
| 20 | Demo script | Product Demos that Sell (seven sins, Big Bang, Macro-to-Micro); Dunford — Sales Pitch |
| 21 | Talk track / pitch script | Dunford — Sales Pitch; Voss — Never Split the Difference; Weinberg — New Sales Simplified |
| 22 | Objection handling | Voss — Never Split the Difference; Cialdini — Influence; Weinberg — New Sales Simplified |
| 23 | Discovery question set | Stanier — The Coaching Habit (seven questions); Voss; Weinberg |
| 24 | Executive keynote | Duarte — Resonate; Illuminate; Donovan — How to Deliver a TED Talk |
| 25 | Cold email sequence | Bly — Copywriters Handbook (4 U's, 8 headlines); Hormozi — 100M Offers |
| 26 | Partner pitch deck | Dunford — Sales Pitch (re-mapped for partner); Duarte — Resonate; corpus |
| 27 | Partner enablement one-pager | Punchy; Smart Brevity |
| 28 | Co-sell battlecard | Punchy; corpus (partner-GTM thin) |
| 29 | Joint solution brief | Smart Brevity; corpus (joint value proposition) |
| 30 | Partner-facing launch FAQ | Smart Brevity; corpus (channel conflict, deal reg) |
| 31 | Investor / board deck | Hoffman — Masters of Scale; Duarte — Resonate; corpus |
| 32 | Customer all-hands / QBR deck | Duarte — Resonate; Smart Brevity; corpus |
| 33 | Analyst briefing deck | Duarte — Resonate; Smart Brevity; corpus (Gartner / Forrester) |
| 34 | Blog post brief | Smart Brevity; Zinsser — On Writing Well; Bly — Copywriters Handbook |
| 35 | Landing page copy | Bly — Copywriters Handbook (4 U's, AIDA); Hormozi — 100M Offers (Value Equation) |
| 36 | Webinar deck | Duarte — Resonate; Donovan — How to Deliver a TED Talk; corpus (attention curve) |
| 37 | Case study | Hall — Stories That Stick (value story, three-act); corpus |
| 38 | Ad copy variants | Bly — Copywriters Handbook (8 headlines); Ogilvy on Advertising (Big Idea) |
| 39 | Pricing page copy | Ramanujam — Monetizing Innovation (G/B/B); Hormozi — 100M Offers (Trim & Stack) |

---

## Cross-artifact patterns adopted

Patterns that emerged consistently across the 39 templates and now form de facto Sherpa conventions:

- **Pre-work as Step 0.** Most templates open with a pre-work block that locks decisions before drafting (timing readiness, persona, scope, structural-option choice). This suppresses the LLM default of jumping straight to output.
- **Champion / single-persona discipline.** From Dunford v2 — position for ONE persona; handle other stakeholders in objection responses (artifact 22), not by diluting the artifact.
- **Negative-guidance-dominant system prompts** (typical 8:4 ratio of failure modes to positive asks; pricing page tightened to 11:4 because failure modes are denser; positioning statement runs ~6:2 because it is more constrained).
- **Sibling-boundary statements.** Each artifact whose scope overlaps with siblings explicitly resolves the boundary in the file header AND in the system prompt (e.g., 14 vs. 19 vs. 24 vs. 36 deck siblings; 15 vs. 37 customer-evidence siblings).
- **Validation gates in the skeleton**, not just the system prompt — explicit named tests the user can run before shipping.
- **Implicit author references.** Templates name canonical sources in the file header and audit doc but never in the artifact output. Users get the discipline; readers get the deliverable.

---

## Pending follow-up tickets for the founder

These items came out of the Phase 2 build and need your decision or authorization before they can move forward.

### 1. Schema migration to allow `book_pmm` source_type — needs your approval

The `documents.source_type` CHECK constraint currently rejects `book_pmm`, even though Book Brain Index uses that taxonomy and the corpus-gap report relies on it. Proposed migration in `corpus-gap-fix-report.md` §4.A. Required to retag ~21 PMM books currently sitting under generic `source_type='book'`. Non-destructive migration; no data backfill needed beyond the source_type retag.

### 2. Ingestion bug — URL pass-through

`scripts/ingest_documents.py:182-189` and `scripts/ingest_new_books.py:201-209` discard the URL generated by `BookProcessor.extract_metadata()`. Fix is one-liner per file: pass `url=doc.get("url")` to `insert_document()`. Backfill of existing rows is already complete (56 rows across 5 `book*` source types, audit log at `/tmp/corpus_backfill_audit.json`). Without the code fix, future ingestions will reintroduce the orphan pattern.

### 3. Net-new ingestion asks (no source files; DO NOT auto-fetch)

| Gap | Book / source | What's blocked |
|---|---|---|
| 5 | **Demand-Side Sales 101** (Bob Moesta) | Buyer persona (05) + buyer journey (06) JTBD canon thinner than ideal; Moesta is the canonical demand-side voice. Founder must supply source file or authorize procurement. |
| 7 | **Andy Raskin substack** + "Greatest Sales Deck" Medium essay | Strategic narrative (03) and partner pitch deck (26) fall back on Sherpa synthesis where Raskin's frameworks would be canonical. `scripts/scrape_substacks.py` exists; needs founder authorization for `https://andyraskin.substack.com` + the Medium essay URL. |

### 4. Obviously Awesome 1st edition — ingest or skip?

v2 is in the corpus; v1 source file exists at `kindle_scraper/output/PMM Books/Obviously Awesome.md` but is not ingested. Per gap report: founder decides whether v1 should be ingested as a separate document for historical context, or whether v2 alone is sufficient. Phase 2 templates use v2 throughout.

### 5. Partner-GTM ingestion sweep — known thin spot

Co-sell battlecard (28) and partner pitch deck (26) audits both flagged: no canonical partner-GTM books in corpus, no AWS ACE / AppExchange / Crossbeam / Reveal practitioner content, no hyperscaler co-sell motion patterns. Sherpa synthesis filled in over a thin corpus. If partner-GTM artifacts will see heavy use, this is the single largest ingestion gap. Founder authorization needed to identify and procure partner-GTM canon.

---

## What to do next

Recommended order:

1. **Wire `generate_artifact` MCP tool** to consume these templates. Build a registry/index file (`src/lib/mcp/artifact-templates/index.ts`) that re-exports all 39 `*Template` objects, then update `tools.ts` to look up templates by `artifactType` and inject `systemPromptFragment` + `skeleton` into the LLM call.
2. **Spot-audit 3-5 templates against live Sherpa output.** Pick a foundational one (01, 02, or 09), a craft-heavy one (19 or 24), and a copy artifact (35 or 39). Read the audit doc, then ask Sherpa to generate the artifact end-to-end and compare to the audit's structural expectations. Fix any gap that surfaces.
3. **Address corpus-gap follow-ups** (above 5 items) — schema migration and ingestion bug fix are quick wins; the net-new ingestion asks need source files.
4. **Track artifact usage** through Langfuse (per `surface:mcp` tagging convention) once the tool is live, to see which artifacts get pulled and which sit unused. Long-tail artifacts that never run can be deprioritized for future maintenance.

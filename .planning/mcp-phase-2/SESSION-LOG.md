# MCP Phase 2 — Session Log

Running log of what got built, decided, and deferred. Read this before resuming work; it's the fastest way to pick up where the last session left off.

---

## Session 2026-05-02 — Build all 39 artifact templates end-to-end

### What we set out to do
Operationalize the artifact catalogue (39 templates) for the `generate_artifact` MCP tool. Founder direction: book-cards-first methodology with corpus as Tier-2 amplification; book wins on conflict, merge mergeable practitioner POV. Build templates + system prompts + 3-section Obsidian audit docs in parallel waves using subagents. Plug corpus gaps in parallel where possible. Complete the whole phase end-to-end this session.

### What we shipped

**Templates (39 of 39):** every artifact in `artifact-book-map.md` has a typecheck-clean `.ts` file in `src/lib/mcp/artifact-templates/`. `npx tsc --noEmit` returns 0 errors. Each template implements the `ArtifactTemplate` interface (`artifactType`, `title`, `systemPromptFragment`, `skeleton`).

**Corpus research (39 of 39):** every artifact has a `[NN]-[name].md` synthesis + `[NN]-[name].json` raw query output in `.planning/mcp-phase-2/corpus-research/`.

**Obsidian audit docs (39 of 39):** every artifact has a 3-section audit doc (findings / structure rationale / system-prompt asks) at `~/Documents/AbhishekR/PMM Sherpa/Phase 2 Templates/[NN]-[name].md`.

**Consolidation:** `.planning/mcp-phase-2/PHASE-2-SUMMARY.md` lists the catalogue, cross-artifact patterns, and the 5 follow-up tickets for founder action.

**Corpus metadata fix:** 56 orphan rows across 5 `book*` source types backfilled with canonical title/author/url. Audit log at `/tmp/corpus_backfill_audit.json`. See `corpus-gap-fix-report.md` for full detail.

### How we got there

Built in three parallel waves of subagents, each agent handling one artifact end-to-end (read book card(s) → run corpus query → synthesize → build template → write audit doc):

- **Wave 0 (foundational, 02-06):** messaging framework, strategic narrative, ICP, buyer persona, buyer journey map. Established the methodology pattern; founder approved.
- **Wave 1 (07-17):** win/loss insights, value prop canvas, launch plan/GTM brief, launch blog post, launch press release, internal launch FAQ, internal launch deck, customer launch deck, customer testimonial ask, battlecard, comparison matrix. Plus parallel corpus-gap-fix agent (the one that backfilled 56 rows and identified the ingestion bug).
- **Wave 2 (18-28):** one-pager solution brief, sales pitch deck, demo script, talk track, objection handling, discovery question set, executive keynote, cold email sequence, partner pitch deck, partner enablement one-pager, co-sell battlecard. All landed clean.
- **Wave 3 (29-39):** joint solution brief, partner-facing launch FAQ, investor/board deck, customer all-hands/QBR deck, analyst briefing deck, blog post brief, landing page copy, webinar deck, case study, ad copy variants, pricing page copy. Templates all completed but **9 of 11 agents stream-timed-out before writing the Obsidian audit doc** — fixed by spawning narrow audit-doc-only agents that read the existing template + research and produced just the audit doc. Webinar-deck.ts itself was missing (one agent timed out earlier than detected); rebuilt directly from the corpus-research file.

Foundational artifact 01 (positioning statement, Dunford v2) became the gold-standard reference every subsequent template was structured against.

### Cross-artifact patterns that emerged

These now form de facto Sherpa conventions; future Phase 2 tweaks should respect them:

- **Pre-work as Step 0** in most templates — locks decisions before drafting (timing readiness, persona, scope, structural-option choice). Suppresses LLM default of jumping straight to output.
- **Champion / single-persona discipline.** From Dunford v2 — position for ONE persona; handle other stakeholders in objection handling (artifact 22), not by diluting.
- **Negative-guidance-dominant system prompts.** Typical 8:4 ratio of failure modes to positive asks; pricing page tightened to 11:4; positioning statement runs ~6:2.
- **Sibling-boundary statements.** Each artifact whose scope overlaps with siblings explicitly resolves the boundary in the file header AND in the system prompt (deck siblings 14/19/24/36 most heavily; customer-evidence 15/37; copy 10/34/35).
- **Validation gates in the skeleton**, not just the system prompt — explicit named tests the user runs before shipping.
- **Implicit author references** — templates name canonical sources in file header and audit doc, never in artifact output.

### Open follow-up tickets (founder action needed)

Full detail in `PHASE-2-SUMMARY.md` § "Pending follow-up tickets for the founder."

1. **Schema migration** to allow `book_pmm` source_type — proposed migration in `corpus-gap-fix-report.md` §4.A.
2. **Ingestion bug** — `scripts/ingest_documents.py:182-189` and `scripts/ingest_new_books.py:201-209` discard `url` from `BookProcessor.extract_metadata()`. One-line fix per file.
3. **Net-new ingestion authorizations:**
   - Demand-Side Sales 101 (Bob Moesta) — improves artifacts 05, 06.
   - Andy Raskin substack + "Greatest Sales Deck" Medium essay — improves artifacts 03, 26. `scripts/scrape_substacks.py` exists; needs URL authorization.
4. **Obviously Awesome 1st edition** — ingest as separate doc or skip (v2 alone)?
5. **Partner-GTM ingestion sweep** — known thin spot for artifacts 26, 28; needs source authorization.

### Recommended next steps (in order)

1. **Wire `generate_artifact` MCP tool** — build `src/lib/mcp/artifact-templates/index.ts` registry that re-exports all 39 `*Template` objects; update `src/lib/mcp/tools.ts` to look up templates by `artifactType` and inject `systemPromptFragment` + `skeleton` into the LLM call. This is the bridge between template data and live MCP usage.
2. **Spot-audit 3-5 templates against live Sherpa output.** Pick one foundational (01, 02, or 09), one craft-heavy (19 or 24), one copy artifact (35 or 39). Generate end-to-end and compare to audit-doc structural expectations.
3. **Ship corpus-gap follow-ups** — schema migration + ingestion bug fix are quick wins. Net-new ingestion needs source files.
4. **Add Langfuse `surface:mcp` tracking** for artifact usage once the tool is live; long-tail artifacts that never run can be deprioritized for maintenance.

### Decisions worth remembering

- **Tier-2 reconciliation rule was load-bearing.** Without it, agents would default to PMA-blog patterns over canonical books. The methodology doc made the rule explicit ("book wins on conflict, merge mergeable POV"), and every audit doc references it.
- **Foundational artifact 01 as gold standard.** Spawning subsequent agents with "read positioning-statement.ts as the structural quality bar" produced consistent style across all 39 templates without per-artifact micromanagement.
- **Stream timeouts on Wave 3** were the only methodology friction point. Cure: keep subagent task scope tight enough that the audit-doc step doesn't push past stream limits. Future waves should split research+template from audit-doc into two narrower agents if templates run long.
- **Corpus gap pattern wasn't artifact-specific.** Pattern across artifacts 01, 02, 04, 05, 06 of canonical books surfacing as bare `[book] ? p.X` chunks pointed to a single ingestion-script bug, not 5 separate gaps. Root-cause investigation paid off.
- **No registry/index file built.** Templates are pure data on disk; wiring `generate_artifact` to consume them is downstream work, deliberately deferred so this session could focus on template completeness.

---

## Session N+1 — [next session, fill in here]

[When the next session starts, prepend a new dated entry above. Keep the running log compact: what we set out to do, what shipped, what's open. The audit docs and PHASE-2-SUMMARY.md carry the deep detail; this log is for fast re-orientation.]

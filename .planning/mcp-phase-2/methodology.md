# Phase 2 template research methodology

For every artifact in the 39-item list, follow this sequence. Update this doc
if the sequence changes mid-phase.

## 1. Identify canonical books

Open `~/Documents/AbhishekR/Book Brain/BOOK_INDEX.md` and find the **Topic Cluster** that matches the artifact (e.g. "Positioning & Messaging" for a positioning statement; "Storytelling & Presentations" for a webinar deck or executive keynote).

Pick 1-3 books that are authoritative for that artifact. Default to:
- **Most recent edition** when multiple exist (e.g. Obviously Awesome v2 over v1)
- **Most cited / most named** in PMM practice (e.g. Dunford for positioning, Moore for early-market, Kaplan for PMM role)

## 2. Read the book card(s) FIRST

`Read ~/Documents/AbhishekR/Book Brain/[card].md` for each canonical book. Extract:
- The named framework / process / components
- Failure modes the author calls out
- Critiques of conventional approaches (Dunford explicitly critiques the "For X who Y" template; Hormozi explicitly critiques generic offers; etc.)
- Memorable quotes that capture the principle

Use the book card as the **authoritative structural source** for the template skeleton.

## 3. Run the corpus query for amplification

`./node_modules/.bin/tsx scripts/corpus-query.ts "tight question" > .planning/mcp-phase-2/corpus-research/[NN]-[artifact].json`

The corpus is for:
- B2B SaaS specificity (PMA blogs, Sharebird AMAs)
- Practitioner failure modes the books may not cover (live/recent)
- Examples and language patterns
- Triangulation: if 5 PMA blogs disagree with the book on a section, that's a signal worth weighing

The corpus is NOT for:
- Replacing the book canon when it disagrees
- Defaulting to PMA's house style when the book is sharper

## 4. Synthesize → research summary

Write `.planning/mcp-phase-2/corpus-research/[NN]-[artifact].md`:
- **Canonical book(s) read** — with key frameworks extracted
- **Corpus citations** (top 8-10) — what amplification surfaced
- **Design decisions** — what's in the template, what's excluded, why
- **Open questions** — what to flag for the user audit

## 5. Build the template

`src/lib/mcp/artifact-templates/[artifact-name].ts` — single file with:
- File header (corpus + book basis, the one big "why this direction" decision, audit-trail file pointer)
- `[ARTIFACT]_SYSTEM_PROMPT` constant — negative guidance from the book + corpus failure modes
- Exported `[artifact]Template: ArtifactTemplate` — markdown skeleton with bracketed prompts

## 6. Note any corpus gaps

If the corpus query missed a book that should have surfaced, or returned chunks with broken metadata, log it in `.planning/mcp-phase-2/corpus-gaps.md` for the next ingestion sweep.

## 7. Present to user for audit (foundational batch only)

For each of the 5 foundational artifacts, present:
- Files created (research + template)
- What the book card said (the canonical framework)
- What the corpus added or contradicted
- Template structure decisions with rationale
- Open questions specific to that artifact

After foundational batch is approved, batch the rest by tier without per-template walkthroughs (skip the verbose audit on Tier 4 / long-tail per the agreed Option A treatment).

# Corpus Gap Fix Report

**Date:** 2026-05-02
**Scope:** Metadata backfill on `documents` table for the gaps catalogued in `corpus-gaps.md`.
**Project:** Supabase `cfztsohetqiaudijlocj` (PMM Sherpa Pro)

---

## 1. What was investigated

**Pipeline (`pmmsherpa/scripts/`):**
- `ingest_documents.py` — primary pipeline. Books are processed by `processors/book_processor.py`, which extracts title/author from filename (`"Title - Author.md"` pattern) and generates an Amazon-search URL. **Bug confirmed:** the `ingest_books()` function inserts only `title`, `source_type`, `author`, `tags` and never passes `url` — so every book ingested by this script lost its generated URL.
- `ingest_new_books.py` — curated re-ingest for newer books (PM/Communication/Presentations/Sales). Passes explicit `title`, `author`, `source_type` but also never passes `url`.
- `book_processor.py` — sets `extract_metadata` correctly (title, author, url, tags) but the value is discarded by callers.

**Tables/columns inspected:** `documents.{id,title,author,url,source_type,source_file,tags}` and `chunks.{id,document_id,page_number}`. No null-title or null-`source_type` rows. No orphan chunks (NULL `document_id`).

**Schema constraint discovered:** `documents.source_type` has a CHECK constraint that currently allows: `book`, `book_pm`, `book_communication`, `book_sales`, `book_presentations`, `blog`, `blog_external`, `ama`, `podcast_pmm`, `substack`. **`book_pmm` is NOT in the allow-list** even though the gap report and existing taxonomy use it.

---

## 2. Orphan inventory (before fix)

| source_type | total | author NULL | url NULL |
|---|---:|---:|---:|
| `book` | 23 | 18 | 9 |
| `book_pm` | 10 | 1 | 10 |
| `book_communication` | 16 | 8 | 16 |
| `book_sales` | 3 | 1 | 2 |
| `book_presentations` | 4 | 0 | 4 |
| **Total** | **56** | **28** | **41** |

Notable orphans confirmed via `source_file`:

| id (prefix) | source_file → identified book | confidence |
|---|---|---|
| `326986a0` | `Crossing_the_Chasm_Geoffrey_Moore.md` → Crossing the Chasm (Moore) | high (gap #5) |
| `c07394c6` | `obviously awesome 2.md` → Obviously Awesome 2nd ed. (Dunford) | high (gap #1, #2) |
| `39f0beef` | `The Go To Market Strategist.md` → The Go-To-Market Strategist (Voje) | high (gap #3) |
| `6e16f65d` | `The_Jobs_To_Be_Done_Playbook.md` → JTBD Playbook (Kalbach) | high (gap #5, #7) |
| `582724e1` | `Inspired_Marty_Cagan.md` → Inspired (Cagan) | high (gap #7) |
| `53ab5e08` | `Sales_Pitch-April_Dunford.md` → Sales Pitch (Dunford) — `book_sales` row had author NULL despite URL working | high |

All 56 rows mapped 1:1 to a single source file; no ambiguous identification cases.

---

## 3. What was fixed

**Tier A — pure metadata backfill applied (Supabase REST UPDATEs via service role):**

- 33 curated UPDATEs setting canonical `title` + `author` per Book Brain Index (and `url` where missing). Payload audit log: `/tmp/corpus_backfill_audit.json`.
- 23 follow-up url-only UPDATEs to populate Amazon-search URLs on remaining `book_*` rows (using existing `title` + newly-set `author`).

**Verification (after fix):**

| source_type | total | author NULL | url NULL |
|---|---:|---:|---:|
| `book` | 23 | 0 | 0 |
| `book_pm` | 10 | 0 | 0 |
| `book_communication` | 16 | 0 | 0 |
| `book_sales` | 3 | 0 | 0 |
| `book_presentations` | 4 | 0 | 0 |

**Sample before/after for gap #5 (`[book] ? p.154` → Crossing the Chasm):**
```
BEFORE: {title: "Crossing the Chasm Geoffrey Moore", author: NULL, url: NULL, source_type: "book"}
AFTER:  {title: "Crossing the Chasm", author: "Geoffrey A. Moore",
         url: "https://www.amazon.com/s?k=Crossing+the+Chasm+Geoffrey+Moore", source_type: "book"}
```
Re-queried chunks at `page_number=154` for that doc — citation now resolves to the full triple.

Other notable fixes: Punchy → Joel Klettke; Loved → Martina Lauchengco; Obviously Awesome 2 → April Dunford; JTBD Playbook → Jim Kalbach; Inspired → Marty Cagan; Sales Pitch → April Dunford; The Trusted Advisor → David H. Maister + co-authors; Crucial Conversations → Patterson et al.

**No data deleted. No chunks re-embedded.** All operations idempotent (re-running produces no further changes).

---

## 4. What requires user action

### A. Source-type discriminator change BLOCKED by schema constraint

The Book Brain Index taxonomy (and gap #4 in the report) wants `source_type='book_pmm'` for ~21 books currently still tagged `book`. The CHECK constraint on `documents.source_type` rejects `book_pmm` (and any other unknown discriminator). **I did not extend the CHECK constraint** — that is a schema migration that needs founder approval.

**Proposed migration** (file: `supabase/migrations/023_extend_source_type_check.sql`):

```sql
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_source_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_source_type_check
  CHECK (source_type IN (
    'book', 'book_pmm', 'book_pm', 'book_communication', 'book_sales',
    'book_presentations', 'book_writing', 'book_investment',
    'blog', 'blog_external', 'ama', 'podcast_pmm', 'substack',
    'thought_leader_blog', 'newsletter'
  ));
```

After approval, run a follow-up UPDATE to retag all 23 `source_type='book'` rows to `book_pmm` (or `book_pm`/`book_writing` per Book Brain Index — proposed mapping is in `/tmp/corpus_backfill_audit.json` — search for `source_type` keys).

### B. Net-new ingestion (no source files locally — DO NOT auto-fetch)

| Gap | Book/source | Status |
|---|---|---|
| #5 | **Demand-Side Sales 101** (Bob Moesta) | **Not in corpus.** No source file at `kindle_scraper/output/`. Founder must supply or authorize procurement. |
| #7 | **Andy Raskin substack** + "Greatest Sales Deck" Medium essay | **Not in corpus.** Existing substack ingestion path (`scripts/scrape_substacks.py` — present in repo) supports new authors. Recommended URLs to authorize: `https://andyraskin.substack.com` (full feed) + `https://medium.com/firm-narrative/the-greatest-sales-deck-ive-ever-seen-4f4ef3391ba0`. |

### C. Re-ingest decisions deferred

- **Obviously Awesome 1st edition** is *not* in the corpus (only v2 — `obviously-awesome-2.md`). The 1st-edition source file (`Obviously Awesome.md`) exists at `kindle_scraper/output/PMM Books/`. Founder to decide whether v1 should be ingested as a separate document or whether v2 alone is sufficient (per gap #1 it noted "1st and 2nd edition if both are intended").

---

## 5. Recommended ingestion-pipeline improvements

1. **Fix the URL-drop bug in `ingest_books()`** (`scripts/ingest_documents.py:182-189`): pass `url=doc.get("url")` so the BookProcessor's generated URL actually persists. Same fix for `ingest_new_books.py:201-209`.
2. **Enforce metadata at ingestion time.** Add an assertion in `insert_document()` for `source_type IN ('book', 'book_pmm', ...)`: require non-null `title` and `author`; warn (don't fail) on missing `url`. This prevents future orphans.
3. **Add a NOT NULL or trigger-based check** on `documents.author` for any row with `source_type LIKE 'book%'`. Cheaper than an explicit migration and surfaces ingest bugs immediately.
4. **Backfill via re-ingest is unnecessary** for the metadata cases — the embeddings live in `chunks` and only the document-row metadata was wrong. Keep this as a Tier-A pattern for future gaps.
5. **Consider a `documents.source_type_v2` enum** with proper values from Book Brain Index taxonomy, used everywhere going forward. Today's CHECK list is ad-hoc.
6. **`update_corpus_counts.py`** should emit a warning when any `source_type='book*'` row has NULL author/url so future drift is caught in CI / cron.

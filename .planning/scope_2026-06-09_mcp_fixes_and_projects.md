# Scoping: MCP Performance, Codex Connector, Projects Feature

> Scoped 2026-06-09. Research complete; nothing built yet. Three workstreams, ordered by effort.

---

## Workstream 1 — Codex MCP connector (root cause CONFIRMED, small fix)

### Root cause (proven live on staging)

**Vercel's proxy rewrites IPv4 loopback literals (`127.0.0.0/8`) inside incoming query
strings to `localhost` before the handler reads `searchParams`.**

Evidence (all against the deployed staging code, 2026-06-09):

| Test | Result |
|---|---|
| Register `http://127.0.0.1:11111/callback`, authorize with byte-identical URI | **400** `redirect_uri not registered` |
| Register `http://localhost:33333/callback`, authorize same / different port | 302 ✓ (port fix works) |
| Register `http://localhost:11111/callback`, authorize with `http://127.0.0.1:11111/callback` | **302 ✓ — smoking gun: host arrived rewritten to `localhost`** |
| `127.0.0.2`, `http://127.0.0.1/cb` (no port) | 400 (whole /8 affected) |
| `[::1]`, public IP, percent-encoded digits (`%31%32%37`) | 302 (not rewritten; not a raw-byte WAF filter) |
| Same flow on local `next dev` | 302 ✓ (platform-level, not our code) |

DB rows in `mcp_clients` are byte-perfect (`md5` verified). The c0fdeaa fix
(RFC 8252 port-flexible matching) was necessary but insufficient:
`redirectUriEquals` still requires **equal hostnames** (`redirect-uri.ts:63`), and
Codex registers `127.0.0.1` which arrives at authorize-time as `localhost`.

Compounding issue: **the loopback fix only ever reached staging.** `origin/main`
is at `ab0aed6`; production (where the user's Codex config points —
`https://pmmsherpa.com/api/mcp`) has neither fix.

### Fix plan

1. `src/lib/mcp/redirect-uri.ts`: treat all loopback hosts (`127.0.0.0/8`, `::1`,
   `localhost`) as **equivalent**, not merely port-insensitive. RFC 8252 is about
   client identity, which PKCE already protects; host-class equivalence within
   loopback is safe and is what other providers do in practice.
   - Match rule for loopback: scheme + path + query equal, host ∈ loopback set, port ignored.
2. Token endpoint inherits the fix automatically (it uses `redirectUriEquals`).
   Note: POST bodies are NOT rewritten by Vercel, so token-time `redirect_uri`
   (body, still `127.0.0.1`) vs the authorize stash (rewritten to `localhost`)
   mismatches today — the same change fixes it.
3. Extend `src/lib/mcp/__tests__/redirect-uri.test.ts`: 127⇄localhost⇄::1
   cross-host cases, 127.0.0.2, no-port forms.
4. Callback redirect sanity: stash holds the rewritten `localhost` host; Codex
   listens on `127.0.0.1:<port>`. `localhost` resolves there, but if Codex's
   listener is picky, rewrite the redirect-back host to the client's registered
   host form. Verify in end-to-end test before deciding.
5. Ship staging → verify with real `codex mcp add` → merge to main (prod is the
   URL Codex actually uses).
6. Clean up stale test clients in `mcp_clients` (several `Codex*repro` rows from 6/9).

**Effort: ~half a day including e2e verification.**

---

## Workstream 2 — MCP slowness + auth persistence

### Latency: where ~13–15s per `ask_sherpa` goes (warm)

| Stage | Cost | Notes |
|---|---|---|
| Cold start | +"30s-ish" when idle | Warm cron removed (bdf5d20) — Hobby plan blocks sub-daily crons; `/api/warm` exists but nothing calls it |
| Query planner | ~1–2s | Runs every call (`planQueries`); cache only covers short queries (8515757) |
| Multi-query RAG | ~1–2s | N parallel embeds + `hybrid_search` RPCs |
| LLM TTFB | ~3s warm cache | Haiku 4.5 since 719e707; 1h prompt-cache TTL since bc36728, but ~40% calls still miss |
| LLM decode | ~8s for ~530 tok | Account tier measured at ~38–40 tok/s via `/api/diag/anthropic-speed` — likely org throttle |

`maxDuration = 60` on `/api/mcp` leaves no headroom for cold start + cold cache +
long generation → the observed timeouts.

### Fix plan (ranked by impact/effort)

Measured baseline: cold start is only ~2s (cold 2.7s vs warm 0.45s, measured
2026-06-10) — the pain is the serial warm path. Pro buys ~nothing directly;
the wins are architectural:

1. **Parallelize the planner out of the critical path** (~1.5–2s every call).
   Embed the raw query + fire a baseline `hybrid_search` CONCURRENTLY with
   `planQueries()`; when the planner returns, fetch only queries that differ and
   merge. For follow-up turns (`conversation_id` present), skip the planner and
   reuse prior intent.
2. **Cut decode time by cutting output** (~3–4s). At the throttled ~38–40 tok/s,
   100 output tokens ≈ 2.5s. Tighten the MCP system prompt toward concision; add
   a `depth: brief|full` param on ask_sherpa (~400 vs 2,048 tok). Separately:
   escalate the throttle with Anthropic support — 38–40 tok/s on Haiku is well
   below normal.
3. **Route simple intents to a faster model** (~3–5s on those calls). Planner
   already classifies intent: `general`/`guidance` → Gemini Flash (~150+ tok/s);
   `deliverable`/`review` stay on Haiku for voice fidelity. One branch in the
   provider factory.
4. **Cache warm on `initialize`**: fire a 1-token generation against the static
   system prompt when an MCP session initializes, so the first real call hits the
   1h prompt cache (~2–3s saved on the ~40% of calls that currently miss).
5. **Response cache for repeated queries**: short-TTL cache keyed on
   (normalized query, user) — MCP traffic is agent-driven and repetitive
   (159 sessions / 6 users in the 5/24 diagnostics); hits become ~200ms.
6. **Check Vercel↔Supabase region pairing**: functions are in `iad1`; if the
   Supabase project isn't `us-east-1`, every call pays cross-region latency 3–4×.
7. **Kill cold starts free**: external pinger (UptimeRobot/cron-job.org) hitting
   `/api/warm` every 5 min. No Pro needed (~2s, first request only).
8. **Raise `maxDuration`** on `/api/mcp` to 300 (Fluid allows this on Hobby);
   timeouts disappear as a symptom once the above land.
9. **Measure before/after in Langfuse** (`surface:mcp` tag) — p50/p95 per stage.

Expected: warm ask_sherpa ~13–15s → ~6–8s with 1+2+4; ~4–5s with model routing
on simple queries. NOT worth doing: edge runtime, separate MCP service,
retrieval rewrites (RAG is 1–2s and parallelizes away behind LLM work).

### Auth persistence

The server side is correct: `/oauth/token` issues Supabase access tokens
(~1h) **plus refresh tokens** and supports `grant_type=refresh_token`. Re-auth
prompts mean the refresh path is failing in practice. Hypotheses to verify (in order):

1. **Supabase refresh-token rotation + reuse detection**: Supabase rotates the
   refresh token on every use and revokes the family on reuse. If a client
   retries a refresh with the consumed token (flaky network, two Claude Code
   instances sharing a registration), the whole session is revoked → forced
   re-login. Check Supabase auth logs for `refresh_token_already_used`.
   Mitigation: enable Supabase's reuse interval grace, or decouple MCP tokens
   from raw Supabase sessions (mint our own opaque access tokens mapped to a
   server-side session row — bigger change, kills the problem permanently).
2. **Client never calls refresh**: add token-endpoint logging (grant_type,
   client_name, success/failure) so we can see per-client behavior instead of guessing.
3. Claude.ai connectors store tokens server-side per account (these were
   "set-and-forget" per 5/31 notes) — the recent regression reports are mostly
   Claude Code/Codex; consistent with rotation/reuse, not with claude.ai brokerage.

**Effort: 1–2 days including instrumentation and a decision on token strategy.**

---

## Workstream 3 — "Projects" feature (the ambitious one)

### Concept recap

User-defined Projects, each holding up to ~100 docs (PDF/PPTX/DOCX/text/pasted) —
brand voice, messaging frameworks, ICPs, past assets, guidelines. Conversations in
a project are constrained by this context while still drawing on the global 38K-chunk
PMM corpus. No context-stuffing of the whole corpus.

### Recommended architecture (validated against Claude.ai Projects & ChatGPT Projects)

Both incumbents use the same hybrid: stuff project knowledge in-context while small,
switch to RAG past a threshold. Copy that, with a tier model:

| Tier | What | Handling | Budget |
|---|---|---|---|
| 0 — Instructions | Free-text project instructions (voice rules, do/don'ts) | Verbatim in system prompt | ~2K tok |
| 1 — Pinned docs | User-flagged "always use" (brand voice, messaging house, ICP) — cap by tokens, not file count | Full text every prompt | ~20K tok |
| 2 — RAG corpus | Everything else | Chunked + embedded, retrieved per query | top-k 8–12 chunks |
| Synopses | 2–3 sentence Haiku summary of EVERY doc at upload | Concatenated as a corpus "table of contents" in the system prompt | ~3–5K tok |

Auto-promote: project total < ~20K tokens → skip RAG, stuff everything.

The synopsis layer is the differentiator: the model always knows what exists
("user has a Q3 launch deck, a battlecard for X…") without paying for the content.

### Ingestion pipeline

**Major head start: the LlamaParse attachment pipeline already exists.**
`/api/upload` (`src/app/api/upload/route.ts`) already does client→Supabase-Storage
direct upload (signed URL, no Vercel body-limit issue), file-type/size validation,
and kicks off an async LlamaParse job (`src/lib/llamaparse.ts` — `startJobFromUrl`
+ `pollUntilDone`); the chat route already polls jobs and reads `extracted_text`.
Projects ingestion reuses all of it — LlamaParse becomes the PRIMARY parser for
every format (PDF/PPTX/DOCX, including scanned docs), replacing the
unpdf/mammoth/officeparser stack entirely:

```
Client → Supabase Storage (existing signed-URL path)
  → project_documents row (status='processing')
  → LlamaParse job (existing startJobFromUrl; parsing runs OFF Vercel entirely)
  → on job completion (poll via cron or webhook):
     chunk ~500–800 tok, heading-aware, 10–15% overlap          ← new
     → contextual-retrieval preamble per chunk (Haiku + caching) ← new (~$0.80/project)
     → synopsis (Haiku)                                          ← new
     → embed (text-embedding-3-small, 512-dim)                   ← new
     → insert project_chunks; status='ready'
```

What remains is only the post-parse stage (chunk/contextualize/embed/synopsis),
which is fast (LLM+embedding API calls, no heavy parsing) and fits comfortably in
a normal function — so the Trigger.dev/Inngest queue drops from "required" to
"nice to have." v1: LlamaParse webhook (or a per-minute poll cron) triggers the
post-parse function with idempotent re-runs (delete chunks for doc_id before
insert). Cost note: LlamaParse is ~$1/1K pages — fine at current scale, revisit
if Projects sees heavy volume. This cuts the P1 estimate roughly in half.

### Retrieval per chat turn (in a project)

1. Embed query once; run in parallel:
   `project_hybrid_search(embedding, text, project_id, k=12)` (new RPC) +
   existing global `hybrid_search(k=8)`.
2. Keep sources in **separate prompt sections** — `<project_knowledge>` and
   `<pmm_knowledge>` — do NOT rank-fuse across corpora; they play different roles.
3. System prompt rule: project knowledge is authoritative for facts/voice/terminology
   about this company; global corpus supplies PMM methodology; on conflict, project wins.
4. Wrap project chunks as clearly-delimited reference data (prompt-injection defense —
   uploaded docs can contain adversarial instructions).

### Schema (new tables — do NOT touch the global `chunks` table/index)

```sql
projects           (id, user_id, name, instructions, total_token_count, created_at)
project_documents  (id, project_id, user_id, title, file_name, mime_type, storage_path,
                    tier 'pinned'|'rag', status 'processing'|'ready'|'failed', error_message,
                    synopsis, full_text, token_count, created_at)
project_chunks     (id, document_id, project_id, user_id, content, context_header,
                    section_title, page_number, token_count, embedding vector(512),
                    fts tsvector generated)
```

- Separate `project_chunks` table = global HNSW index untouched, clean cascade
  deletes, simple RLS.
- **v1 retrieval: exact scan** (B-tree on project_id, no HNSW) — per-project corpora
  are ≤ ~15K chunks; exact KNN there is single-digit ms with perfect recall. Add
  HNSW + `hnsw.iterative_scan = relaxed_order` (pgvector 0.8) only if a project
  exceeds ~50K chunks.
- RLS (`user_id = auth.uid()`) on all three tables; but chat uses the service-role
  client, so the **ownership check in the API route is load-bearing — test it explicitly**.
- Storage: private bucket, path `{user_id}/{project_id}/{doc_id}`, per-file cap ~25MB / 300 pages.

### Costs (non-issue)

100-doc project ≈ 800K tokens: embeddings ~$0.016, contextualization ~$0.80,
~5MB DB. Rate-limit re-processing so a churny user can't loop ingestion.

### Key risks

1. Parsing failures are the #1 support surface (scanned PDFs, image-only PPTX,
   password-protected files) → per-doc `failed` status + human-readable error +
   text-length sanity check.
2. Cross-tenant leakage via service-role client → explicit ownership tests; never
   let project chunks leak into non-project conversations.
3. Pinned-tier bloat → enforce cap by token count server-side.
4. Partial ingestion state → idempotent jobs, durable queue.

### Build phases

1. **P1 — Schema + upload + ingestion** (tables, signed uploads, parse/chunk/embed/synopsis, status UI)
2. **P2 — Project chat** (project selector, dual retrieval, tiered prompt assembly, citations from project docs)
3. **P3 — Management UX** (pin/unpin, re-upload, delete, token meter, failure surfacing)
4. **P4 — MCP surface** (project_id param on ask_sherpa/draft_artifact — the org-context moat for agents)

**Effort: ~2–3 weeks of focused build across the phases.**

### Open product decisions (need Abhishek)

- Plan gating: Projects as Starter-only? Project count / doc count per tier?
- Vercel Pro: no longer load-bearing for WS2 (cold start measured at ~2s; free
  pinger covers it) or WS3 (LlamaParse moves parsing off Vercel). Upgrade only if
  we want sub-daily crons / 800s functions for other reasons.
- LlamaParse completion signal: webhook vs per-minute poll cron (webhook preferred).

---

## Suggested sequencing

1. **WS1** (half day) — unblocks Codex users now; ship staging→main.
2. **WS2** (1–2 days) — pinger/Pro + planner skip + instrumentation; decide token strategy after logs.
3. **WS3** (2–3 wks) — phased; P1 can start in parallel with WS2's observation window.

---

## Workstream 4 — "Pro" $19.99/mo tier (PLANNED, not yet built)

> Added 2026-06-15. Projects is the gated, premium feature. Scoped and
> data-validated; awaiting go-ahead before build. Effort ≈ half a day,
> mostly Stripe plumbing.

### Data that drove the recommendation (pulled 2026-06-15)

- **320 free / 3 starter / 1 founder** users; 40 API-active in 30d; 115
  message-active in 90d.
- Messages/user/month: **p50 = 4, p90 = 16, p99 = 124, max ever = 311.** The
  current 200-message Starter cap almost never binds → generous caps cost
  almost nothing; their value is psychological headroom, not real spend.
- Unit costs: ask_sherpa ~$0.015, draft_artifact ~$0.036, full 100-doc project
  ingest ~$0.80, fixed infra ~$45/mo.
- `.planning/mcp_pricing_model.md` argued AGAINST a $20 *credit pack* (worse
  value than $5/100). A $20 *subscription with Projects* is a different product
  and is NOT in conflict — it matches the ChatGPT Plus / Claude Pro $20 anchor.

### Recommended structure

| | Free | Starter $9.99 | **Pro $19.99** |
|---|---|---|---|
| Web messages /mo | 10 | 200 | **500** |
| MCP credits /mo | 10 | 200 | **500** |
| **Projects** | — | — | **✓ 20 projects, 100 docs each** |
| Credit top-ups | ✓ | ✓ | ✓ |

### Positioning principles

- **Sell Pro as "Sherpa that knows *your* company" (Projects), not "more
  messages."** At p99=124 nobody needs more messages; caps are the supporting
  cast, not the hook.
- **Projects strictly Pro-only at launch.** A free/Starter teaser muddies the
  "$19.99 = Projects" anchor and adds gating complexity. Easier to loosen later
  than tighten. Consider letting free users *see* the Projects UI with an
  upgrade gate on creation (one `if`) so the feature is visibly demoable —
  activation/conversion is the real bottleneck (3 paying users), not packaging.
- **Margin** ≈ 85% for a typical Pro user (~$1–3 LLM + ~$1 ingest). Worst-case
  user maxing both caps ≈ $12–15 cost → floor never negative. Rate-limit doc
  re-processing to keep the ingest line honest.

### Optional sweeteners

- Annual **$199/yr** (2 months free) — fits the consultant/agency profile
  Projects attracts.
- Founding-member offer for the 3 existing Starter subs: first 3 months of Pro
  at $9.99 — near-zero cost, converts warmest users.

### Implementation surface (mapped 2026-06-15)

Add a `'pro'` value to the tier union + caps across ~9 files, one Stripe price +
env var, webhook price-ID→tier mapping, pricing-page card, and a gate in
`POST /api/projects` + the projects UI. Concrete touch points:

1. `src/types/database.ts:34` — `Profile.tier` union
2. `src/lib/constants.ts:34,39–43` — `UserTier` type + `getMonthlyLimitForTier()`; add `PRO_TIER_MONTHLY_LIMIT = 500`
3. `src/lib/mcp/credits.ts:25–26,50–53` — `monthlyLimitForPlan()`; add `MCP_PRO_MONTHLY_LIMIT = 500`
4. `src/app/api/cron/reset-monthly-credits/route.ts:37,44–47` — `effectivePlanForReset()` + `resetCapForPlan()`
5. `src/lib/usage-gate.ts:24` — tier union (already flexible)
6. `src/components/landing/PricingSection.tsx:25–55` — add Pro plan card
7. `src/app/(dashboard)/settings/billing/page.tsx` — CTA/upgrade logic for the new subscription tier
8. `src/app/api/webhooks/stripe/route.ts:126–142` — map Pro price ID → `tier='pro'` on `active`
9. New migration `supabase/migrations/<date>_add_pro_tier.sql` — widen tier CHECK constraint
10. **Projects gate** — `POST /api/projects` (and project-doc routes) require effective tier ∈ {pro, founder}; UI upgrade prompt on the Projects surface
11. Stripe: create $19.99/mo recurring price (TEST first) → `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` (+ TEST/LIVE env vars)

### Open decisions before build

- Confirm caps (500/500) and whether Starter survives unchanged (recommended: yes).
- Annual price + founding-member offer: in for v1 or later?
- Free-user "see but can't create" Projects teaser: yes/no.

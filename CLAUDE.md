# PMMSherpa - Claude Code Project Context

> **Read this file at the start of every session.**

## Token Efficiency

- **Use /fast mode** for routine edits, file reads, simple bug fixes. Same Opus model, shorter output.
- **Responses**: Terse, no preamble, no trailing summaries. Lead with the action or answer.
- **File reads**: Read only the lines you need (use `offset`/`limit`), not entire files.
- **Searches**: Use Glob/Grep directly for targeted lookups. Reserve Agent(Explore) for broad discovery.
- **Relevant MCP tools for this project**: `mcp__supabase-pro__*`, `mcp__perplexity__search`, `mcp__brave-search__*`. Ignore HubSpot, OneNote, Classroom, Model Armor, Meet, Forms, Keep, Airtable — they are not used here.

## Quick Start

```bash
cd /Users/abhishekratna/Documents/AOL\ AI/pmmsherpa
npm run dev        # Dev server at localhost:3000
npm run build      # Production build check
```

---

## Project Overview

AI-powered Product Marketing advisor with agentic RAG knowledge base (40,000+ chunks across 8 knowledge layers: 34 books, 583 podcast episodes, 827 PMA blogs, 23 substacks, 790 thought-leader blogs), multi-model LLM support, and real-time streaming. Hundreds of users across 100+ organizations.

- **Production**: https://pmmsherpa.com
- **Staging**: https://staging.pmmsherpa.com
- **GitHub**: https://github.com/boommark/pmmsherpa
- **Supabase**: Project "pmm-sherpa" (Pro) — https://supabase.com/dashboard/project/cfztsohetqiaudijlocj
- **Admin email**: abhishekratna@gmail.com

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router), TypeScript, Turbopack |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth (Google OAuth + email/password, profile completion gate) |
| Billing | Stripe Checkout ($9.99/mo Starter), webhooks, customer portal |
| LLM | Claude Opus 4.5, Claude Sonnet 4.5, Gemini 3 Pro, Gemini 2.5 Pro |
| Embeddings | OpenAI `text-embedding-3-small` (512 dim) |
| UI | Tailwind CSS v4 + shadcn/ui + Lucide icons, dark mode |
| State | Zustand (`src/stores/chatStore.ts`) |
| Email | Resend (domain: pmmsherpa.com) |
| Hosting | Vercel (auto-deploy on push) |

---

## Key Files

```
src/app/page.tsx                       # Landing page / homepage
src/app/api/chat/route.ts              # Main streaming chat endpoint (SSE)
src/app/api/access-request/route.ts   # Access request submission
src/components/chat/ChatContainer.tsx  # Chat orchestrator (main logic)
src/components/chat/ChatInput.tsx      # Input bar (model selector, research toggle)
src/components/chat/MessageBubble.tsx  # Message rendering (markdown, citations, actions)
src/lib/rag/retrieval.ts              # Hybrid search (70% semantic + 30% keyword)
src/lib/llm/provider-factory.ts       # LLM abstraction (Claude/Gemini)
src/lib/llm/system-prompt.ts          # PMM expert system prompt
src/stores/chatStore.ts               # Zustand state
src/lib/email/templates.ts            # Email templates
sherpa design/DESIGN.md               # Design system & branding guidelines
```

---

## Database (Supabase - Flytr)

```
profiles          — User profiles, theme, model pref, voice pref
conversations     — Chat sessions (title, model, timestamps)
messages          — Messages with citations (JSONB), expanded_research (JSONB)
documents         — Source metadata (book/blog/ama, author, url)
chunks            — Embedded text (512-dim vector, HNSW index)
usage_logs        — API usage: model, tokens, latency, user_id
access_requests   — Waitlist entries (email, LinkedIn, status)
```

Key function: `hybrid_search(query_embedding, query_text, match_count)`

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL            # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY       # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY           # Supabase service role (server only)
ANTHROPIC_API_KEY                   # Claude models
GOOGLE_API_KEY                      # Gemini models
OPENAI_API_KEY                      # Embeddings (+ optional TTS)
RESEND_API_KEY                      # Transactional email
PERPLEXITY_API_KEY                  # Web research (quick research mode)
LANGFUSE_PUBLIC_KEY                 # Langfuse tracing (project: PMMSherpa-MCP, US region)
LANGFUSE_SECRET_KEY                 # Langfuse tracing
LANGFUSE_BASEURL                    # https://us.cloud.langfuse.com
NEXT_PUBLIC_APP_URL                 # https://pmmsherpa.com (prod) / https://staging.pmmsherpa.com (staging)
```

Vercel token for CLI deploys: stored in `~/.vercel-token` (never commit tokens to git)

---

## Chat API Flow

```
User message → /api/chat
  1. Generate query embedding (OpenAI)
  2. Hybrid RAG search (Supabase pgvector)
  3. [Optional] Perplexity quick research in parallel
  4. Build prompt (system + RAG context + history)
  5. Stream LLM response via SSE
  6. Save message + citations to DB
```

SSE event types: `status` → `citations` → `text` (chunks) → `done` | `error`

---

## Signup Flow (Auto-Approve)

Users are auto-approved. No manual admin action needed.

**Email/password signup** (`/signup` → `/complete-profile`):
1. User signs up (name, email, password) → email confirmation link sent
2. User confirms email → redirected to `/complete-profile`
3. User provides LinkedIn URL + consent + selects plan
4. Profile marked `profile_completed = true` → user enters `/chat`
5. Admin gets notification email (name, email, LinkedIn, auth provider)

**Google OAuth** (`/signup` or `/login` → Google → `/complete-profile`):
1. User clicks "Continue with Google" → OAuth flow
2. Redirected to `/complete-profile` (LinkedIn + consent + plan)
3. Same steps 4-5 as above

**LinkedIn gate**: Middleware checks `profile_completed` on all protected routes (`/chat`, `/history`, `/saved`, `/settings`). Users without LinkedIn profile are redirected to `/complete-profile`.

---

## Git & Deploy Workflow

> **NEVER push directly to `main`. Always go through `staging` first.**

### Standard workflow
```bash
# 1. Create feature branch off staging
git checkout staging
git checkout -b feature/my-change

# 2. Build and test locally
npm run dev

# 3. Merge to staging and verify
git checkout staging
git merge feature/my-change
git push origin staging
# → auto-deploys to https://staging.pmmsherpa.com — test it there

# 4. When staging looks good, merge to main
git checkout main
git merge staging
git push origin main
# → auto-deploys to https://pmmsherpa.com
```

### Quick deploy commands
```bash
# Deploy current branch to staging preview
npx vercel --token $(cat ~/.vercel-token) --yes

# Deploy to production (only after staging verified)
npx vercel --token $(cat ~/.vercel-token) --prod --yes
```

### Branch structure
| Branch | URL | Purpose |
|--------|-----|---------|
| `main` | pmmsherpa.com | Production — live users |
| `staging` | staging.pmmsherpa.com | Staging — verify before prod |
| `feature/*` | Vercel preview URL | Dev — local + preview testing |

### After every ship to production
Update the Obsidian shipped features log:
```
~/Documents/AbhishekR/PMM Sherpa/Shipped Features.md
```
Add a row to the relevant table with: feature name, one-line description, and month/year. Keep it concise and human-readable.

---

## Common Tasks

```bash
# Add shadcn component
npx shadcn@latest add [component-name]

# Run knowledge ingestion
cd scripts && python ingest_documents.py

# Check Supabase schema / run SQL
# → https://supabase.com/dashboard/project/ogbjdvnkejkqqebyetqx

# Lint
npm run lint
```

---

## Observability (Phase 1, MCP plan)

- **Langfuse** is the system of record for LLM/RAG traces across all surfaces (web UI + MCP server). Project: `PMMSherpa-MCP` (US region). Dashboard: https://us.cloud.langfuse.com
- **Surface tagging convention**: every trace MUST set a `surface:*` tag via `LangfuseOtelSpanAttributes.TRACE_TAGS`. UI route uses `surface:web`. MCP server uses `surface:mcp`. Use the Langfuse tag filter to view traffic per surface; don't split into separate projects.
- `instrumentation.ts` registers OTel + Langfuse on Vercel boot. Don't remove the Braintrust `initLogger` — Braintrust is reserved for offline evals (Layer 4 voice scorer), Langfuse for runtime tracing. They coexist.
- `/api/chat` is wrapped in `startActiveObservation('sherpa.chat.request', ...)`. The active span gets `input`, `metadata` (userId, sessionId), and `output` set on it. Trace-level fields (name, userId, sessionId, tags, input, output) are populated via `setActiveTraceIO()` + `LangfuseOtelSpanAttributes` on `span.otelSpan`.
- The SSE `done` event includes `trace_id` (the OTel/Langfuse trace ID). Surface this to support so user reports can be correlated to a specific trace.
- AI SDK calls (`streamText` etc.) auto-trace via `experimental_telemetry: { isEnabled: true }`.
- Silent-failure signals live in `src/lib/observability/signals.ts` (skeleton — wired in Phase 3).

## Known Issues & Hard-Won Lessons

- **URL reading via native LLM tools is broken** — Anthropic `web_search` / Google `googleSearch` cannot reliably read a specific URL's content. Use Jina Reader (`r.jina.ai/URL`) or Firecrawl instead.
- **Perplexity deep research hangs** — Only use `sonar-pro` (quick research). Deep research mode removed.
- **Supabase history fetch order** — Must fetch with `ascending: false, limit: 10` then reverse, or you get the first 10 messages instead of the last 10.
- **Mobile safe-area** — iOS home indicator overlaps input; requires `env(safe-area-inset-bottom)` padding.
- **Voice (OpenAI Realtime)** — Code preserved but deactivated. Use native Web Speech API instead.

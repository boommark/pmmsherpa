# PMMSherpa - Claude Code Project Context

> **Read this file at the start of every session.**

## Quick Start

```bash
cd /Users/abhishekratna/Documents/AOL\ AI/pmmsherpa
npm run dev        # Dev server at localhost:3000
npm run build      # Production build check
```

---

## Project Overview

AI-powered Product Marketing assistant with RAG knowledge base (21,893 chunks from PMM books, PMA blogs, Sharebird AMAs), multi-model LLM support, and real-time streaming.

- **Production**: https://pmmsherpa.com
- **Staging**: https://staging.pmmsherpa.com
- **GitHub**: https://github.com/boommark/pmmsherpa
- **Supabase**: Project "Flytr" — https://supabase.com/dashboard/project/ogbjdvnkejkqqebyetqx
- **Admin email**: abhishekratna@gmail.com

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router), TypeScript, Turbopack |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth (email/password, ban-until-approved flow) |
| LLM | Claude Opus 4.5, Claude Sonnet 4.5, Gemini 3 Pro, Gemini 2.5 Pro |
| Embeddings | OpenAI `text-embedding-3-small` (512 dim) |
| UI | Tailwind CSS + shadcn/ui, dark mode |
| State | Zustand (`src/stores/chatStore.ts`) |
| Email | Resend (domain: pmmsherpa.com) |
| Hosting | Vercel (auto-deploy on push) |

---

## Key Files

```
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

## Access Request Flow

Direct signup disabled. Users request access → admin approves.

1. User fills form (name, email, password, LinkedIn URL, use cases)
2. Account created in Supabase Auth with `ban_duration: '876000h'`
3. Admin gets email → clicks link to Supabase Auth dashboard → clicks "Remove ban"
4. User can immediately log in with password set during signup

Admin approval URL: `https://supabase.com/dashboard/project/ogbjdvnkejkqqebyetqx/auth/users`

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

## Known Issues & Hard-Won Lessons

- **URL reading via native LLM tools is broken** — Anthropic `web_search` / Google `googleSearch` cannot reliably read a specific URL's content. Use Jina Reader (`r.jina.ai/URL`) or Firecrawl instead.
- **Perplexity deep research hangs** — Only use `sonar-pro` (quick research). Deep research mode removed.
- **Supabase history fetch order** — Must fetch with `ascending: false, limit: 10` then reverse, or you get the first 10 messages instead of the last 10.
- **Mobile safe-area** — iOS home indicator overlaps input; requires `env(safe-area-inset-bottom)` padding.
- **Voice (OpenAI Realtime)** — Code preserved but deactivated. Use native Web Speech API instead.

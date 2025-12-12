# PMMSherpa - Claude Code Project Context

> **Read this file at the start of every session to understand the project.**

## Quick Start

```bash
cd /Users/abhishekratna/Documents/AOL\ AI/pmmsherpa
npm run dev        # Start dev server at localhost:3000
npm run build      # Build for production
npx vercel --prod  # Deploy to production
```

## Project Overview

**PMMSherpa** is an AI-powered Product Marketing assistant that combines:
- **RAG Knowledge Base**: 15,985 chunks from 17 PMM books, 781 PMA blogs, 485 Sharebird AMAs
- **Dual LLM Support**: Claude Opus 4.5 (primary) and Gemini 2.5 Pro (alternate)
- **Streaming Responses**: Real-time SSE with status updates and citations

**Live URL**: https://pmmsherpa.vercel.app
**GitHub**: https://github.com/boommark/pmmsherpa

---

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 16 (App Router) | TypeScript, Turbopack |
| Database | Supabase PostgreSQL + pgvector | Project: Flytr |
| Auth | Supabase Auth | Email/password |
| Primary LLM | Claude Opus 4.5 | `claude-opus-4-5-20251101` |
| Alternate LLM | Gemini 2.5 Pro | `gemini-2.5-pro` |
| Embeddings | OpenAI | `text-embedding-3-small` (512 dim) |
| UI | Tailwind CSS + shadcn/ui | Dark mode supported |
| State | Zustand | `src/stores/chatStore.ts` |
| Hosting | Vercel | Auto-deploy on push to main |

---

## Key Files & Architecture

### API Routes
- `src/app/api/chat/route.ts` - Main streaming chat endpoint (SSE)

### Chat Components
- `src/components/chat/ChatContainer.tsx` - Main chat orchestrator
- `src/components/chat/MessageList.tsx` - Scrollable message list
- `src/components/chat/MessageBubble.tsx` - Individual messages with markdown
- `src/components/chat/ChatInput.tsx` - Input with send button
- `src/components/chat/SourceCitations.tsx` - Collapsible citation display
- `src/components/chat/StatusIndicator.tsx` - Loading status messages
- `src/components/chat/ModelSelector.tsx` - Claude/Gemini toggle

### RAG System
- `src/lib/rag/retrieval.ts` - Hybrid search (70% semantic + 30% keyword)
- `src/lib/rag/embeddings.ts` - OpenAI embedding generation

### LLM Integration
- `src/lib/llm/provider-factory.ts` - LLM provider abstraction
- `src/lib/llm/system-prompt.ts` - PMM expert system prompt

### Database
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/client.ts` - Browser Supabase client

### State Management
- `src/stores/chatStore.ts` - Zustand store for chat state

### Types
- `src/types/database.ts` - Database types (Citation, Message, etc.)
- `src/types/chat.ts` - Chat types (ChatMessage, RetrievedChunk, etc.)

---

## Database Schema (Supabase - Flytr Project)

### Core Tables
```sql
profiles          -- User profiles (extends auth.users)
conversations     -- Chat conversations with title, model
messages          -- Messages with content, citations, model
documents         -- Source document metadata
chunks            -- Embedded chunks with vector (512 dim)
usage_logs        -- API usage analytics
```

### Key SQL Functions
- `hybrid_search(query_embedding, query_text, match_count)` - Combined semantic + keyword search

### Important Notes
- pgvector extension enabled for embeddings
- HNSW index on chunks.embedding for fast similarity search
- RLS policies isolate user data

---

## Environment Variables

Required in `.env.local` and Vercel:
```bash
# Supabase (Flytr project)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# LLM Providers
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Embeddings
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://pmmsherpa.vercel.app
```

---

## Chat API Flow

```
User Message → POST /api/chat
    ↓
1. Generate query embedding (OpenAI)
    ↓
2. Hybrid search RAG (Supabase pgvector)
    ↓
3. Build prompt with system instructions + context
    ↓
4. Stream response (Claude/Gemini)
    ↓
5. SSE Events:
   - { type: "status", message: "Searching..." }
   - { type: "citations", citations: [...] }
   - { type: "text", content: "..." }
   - { type: "done" }
```

---

## SSE Streaming Format

The chat API uses Server-Sent Events:
```typescript
// Status update (shown during loading)
data: {"type": "status", "message": "Searching PMM knowledge base..."}

// Citations (sent before text)
data: {"type": "citations", "citations": [
  {"source": "Obviously Awesome", "author": "April Dunford", "source_type": "book", ...}
]}

// Text chunks (streamed)
data: {"type": "text", "content": "Here's how to..."}

// Completion
data: {"type": "done"}

// Error
data: {"type": "error", "message": "..."}
```

---

## Common Development Tasks

### Add a new shadcn/ui component
```bash
cd /Users/abhishekratna/Documents/AOL\ AI/pmmsherpa
npx shadcn@latest add [component-name]
```

### Run knowledge ingestion (if needed)
```bash
cd /Users/abhishekratna/Documents/AOL\ AI/pmmsherpa/scripts
python ingest_documents.py
```

### Check Supabase
- Dashboard: https://supabase.com/dashboard (Flytr project)
- Tables: profiles, conversations, messages, documents, chunks

### Deploy to production
```bash
git add -A && git commit -m "message" && git push origin main
# Vercel auto-deploys on push
```

---

## Known Issues & Fixes Applied

### Table Rendering
- **Issue**: Markdown tables showed as raw text
- **Fix**: Added `remark-gfm` plugin to ReactMarkdown in `MessageBubble.tsx`

### Scroll Issues
- **Issue**: Couldn't scroll through long responses
- **Fix**: Added `h-full`, `min-h-0`, `overflow-hidden` to flex containers in `MessageList.tsx` and `ChatContainer.tsx`

### Citations Not Displaying
- **Issue**: Citations weren't being set in messages
- **Fix**: Added `setCitations` action to chatStore, implemented handler in `ChatContainer.tsx`

### AMA Speaker Role Not Showing
- **Issue**: Sharebird AMA citations didn't show speaker name/job title
- **Fix**:
  - Updated `ama_processor.py` regex to parse `**Speaker:**` and `**Role:**` format
  - Updated 485 AMA documents in database with correct metadata
  - Added `speaker_role` column to all search functions (hybrid_search, match_chunks, keyword_search_chunks)
  - Updated TypeScript types (`Citation`, `RetrievedChunk`) to include `speakerRole`
  - Updated `SourceCitations.tsx` to display speaker role (e.g., "by Mike Greenberg, Director of Product Marketing at SurveyMonkey")

### Book Citations Missing Links
- **Issue**: Book citations had no links
- **Fix**: Added Amazon search URLs to all 16 books and updated `book_processor.py` to auto-generate URLs

---

## Pending Tasks / Future Improvements

1. **Debug slow chat response latency** - Initial response takes several seconds
2. **Add export functionality** - PDF/Markdown export of conversations
3. **Implement saved responses** - Star/bookmark individual responses
4. **Usage analytics dashboard** - Show token usage, query counts
5. **PMM operational tools** - Structured deliverable generators (battlecards, positioning canvas, etc.)

---

## Source Document Locations

```
Books: /Users/abhishekratna/Documents/Antigravity Projects/kindle_scraper/output/PMM Books
Blogs: /Users/abhishekratna/Documents/Antigravity Projects/PMA Scraper/output
AMAs:  /Users/abhishekratna/Documents/Antigravity Projects/Sharebird Scraper/output
```

---

## Project Structure

```
pmmsherpa/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login/Signup pages
│   │   ├── (dashboard)/      # Protected app pages
│   │   │   ├── chat/         # Chat interface
│   │   │   ├── history/      # Conversation history
│   │   │   ├── saved/        # Saved responses
│   │   │   └── settings/     # User settings
│   │   └── api/
│   │       └── chat/         # Streaming chat API
│   ├── components/
│   │   ├── chat/             # Chat UI components
│   │   ├── layout/           # Header, Sidebar
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── llm/              # LLM provider factory
│   │   ├── rag/              # RAG retrieval system
│   │   └── supabase/         # Database clients
│   ├── stores/               # Zustand state management
│   └── types/                # TypeScript types
├── scripts/
│   ├── ingest_documents.py   # Knowledge ingestion pipeline
│   └── processors/           # Document processors by type
└── supabase/
    └── migrations/           # Database schema migrations
```

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # Run ESLint

# Git
git status                     # Check changes
git add -A && git commit -m "" # Commit all
git push origin main           # Push (triggers Vercel deploy)

# Vercel
npx vercel                     # Deploy preview
npx vercel --prod              # Deploy production

# Supabase
npx supabase db push           # Push migrations
npx supabase gen types ts      # Generate TypeScript types
```

---

*Last updated: December 2024*

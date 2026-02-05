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
- **Multi-Model Support**: Claude Opus 4.5, Claude Sonnet 4.5, Gemini 3 Pro, Gemini 2.5 Pro (Thinking)
- **Web Search**: Provider-native web search (Anthropic web_search, Google googleSearch)
- **Streaming Responses**: Real-time SSE with status updates and citations

**Live URL**: https://pmmsherpa.com (custom domain)
**Vercel URL**: https://pmmsherpa.vercel.app
**GitHub**: https://github.com/boommark/pmmsherpa

---

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 16 (App Router) | TypeScript, Turbopack |
| Database | Supabase PostgreSQL + pgvector | Project: Flytr |
| Auth | Supabase Auth | Email/password |
| LLM (Anthropic) | Claude Opus 4.5, Claude Sonnet 4.5 | `claude-opus-4-5-20251101`, `claude-sonnet-4-5-20250929` |
| LLM (Google) | Gemini 3 Pro, Gemini 2.5 Pro (Thinking) | `gemini-3-pro-preview`, `gemini-2.5-pro` |
| Embeddings | OpenAI | `text-embedding-3-small` (512 dim) |
| UI | Tailwind CSS + shadcn/ui | Dark mode supported |
| State | Zustand | `src/stores/chatStore.ts` |
| Hosting | Vercel | Auto-deploy on push to main |

---

## Key Files & Architecture

### API Routes
- `src/app/api/chat/route.ts` - Main streaming chat endpoint (SSE)
- `src/app/api/access-request/route.ts` - Submit access request (public)
- `src/app/api/access-request/approve/route.ts` - Approve request, create user, send email (admin only)

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

### Email
- `src/lib/email/templates.ts` - Email templates (admin notification, user approval, welcome draft)

### Auth Pages
- `src/app/(auth)/login/page.tsx` - Login page with forgot password link
- `src/app/(auth)/request-access/page.tsx` - Access request form (replaces signup)
- `src/app/(auth)/set-password/page.tsx` - Password setup page (after approval)
- `src/app/(auth)/forgot-password/page.tsx` - Self-service password reset
- `src/app/auth/callback/route.ts` - Supabase auth callback handler

### Admin Pages
- `src/app/(admin)/admin/approve/page.tsx` - One-click approval confirmation page
- `src/app/(admin)/admin/requests/page.tsx` - Access requests management dashboard

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
access_requests   -- Waitlist/access requests (see Access Request Flow below)
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

# Email (Resend - for transactional emails)
RESEND_API_KEY=re_...

# Web Research (Perplexity)
PERPLEXITY_API_KEY=pplx-...

# App
NEXT_PUBLIC_APP_URL=https://pmmsherpa.com

# Vercel (for CLI deployments)
VERCEL_TOKEN=rQeCMwL63rT10pN5NpA2iBov
```

**Note**: Vercel token is stored locally in `.vercel-token.txt` (gitignored) for CLI deployments.

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

## Access Request Flow (Waitlist with Admin Approval)

**Important**: Direct signup is disabled. Users must request access and be approved by admin.

### User Flow (v3 - Password Upfront, Banned Until Approved)
```
1. User visits https://pmmsherpa.com → clicks "Get Started"
2. User fills out Request Access form:
   - Full Name (required)
   - Email (required)
   - Password + Confirm Password (required, min 8 chars)
   - Phone (optional)
   - Profession (optional)
   - Company (optional)
   - LinkedIn URL (required) - validated format: linkedin.com/in/username
   - Use Cases (multi-select checkboxes)
3. User submits → Account created IMMEDIATELY in Supabase Auth (but BANNED)
4. User sees "Thank you" confirmation with message that they can log in with their password once approved
5. Admin (abhishekratna@gmail.com) receives email notification with step-by-step approval instructions
6. Admin clicks "Approve in Supabase" → opens Supabase Auth dashboard filtered to user
7. Admin clicks "Remove ban" on user → user is now active
8. User receives approval email → can immediately log in with password they set during signup
```

### Key Implementation Details

**Password collected upfront**: Users provide their password when requesting access. The account is created immediately but BANNED until admin approves.

**Banned User Flow**:
- `supabase.auth.admin.createUser()` called with `ban_duration: '876000h'` (~100 years)
- User cannot log in until ban is removed
- Approval simply removes the ban with `ban_duration: 'none'`
- No password reset link needed - user already has their password

**Admin Approval via Supabase Dashboard**:
- Admin notification email links directly to Supabase Auth Users page
- URL: `https://supabase.com/dashboard/project/nhwcpjfjsjsslxuqpuoy/auth/users?search=${email}`
- Admin clicks user row → scrolls to "User banned until..." → clicks "Remove ban"
- This is simpler than the previous in-app approval flow (avoids auth issues)

**LinkedIn Validation**:
- Required field (not optional)
- Regex: `/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i`
- Validated on both client and server

**Admin Email**: abhishekratna@gmail.com (hardcoded in `src/lib/constants.ts`)

**Email Service**: Resend (domain: pmmsherpa.com, verified)

### Database: access_requests table
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  profession TEXT,
  company TEXT,
  linkedin_url TEXT NOT NULL,
  use_cases TEXT[],
  password_hash TEXT,  -- NULLABLE (not used - password goes directly to Supabase Auth)
  user_id UUID REFERENCES auth.users(id),  -- Links to the banned user created during request
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  approval_token UUID DEFAULT gen_random_uuid(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migrations Applied
- `005_access_requests.sql` - Created access_requests table
- `006_make_password_hash_nullable.sql` - Made password_hash nullable
- `011_add_user_id_to_access_requests.sql` - Added user_id column to link request to auth user

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

**Option 1: Using Vercel CLI** (Recommended)
```bash
# Quick deploy with token
npx vercel --token rQeCMwL63rT10pN5NpA2iBov --prod --yes

# Or set environment variable first
export VERCEL_TOKEN="rQeCMwL63rT10pN5NpA2iBov"
npx vercel --prod --yes
```

**Option 2: Git push (auto-deploy)**
```bash
git add -A && git commit -m "message" && git push origin main
# Vercel auto-deploys via GitHub integration (~2-5 minutes)
```

**Option 3: Deploy script** (requires local path fix)
```bash
./deploy.sh "commit message"
# Note: Script has hardcoded path, use Vercel CLI instead
```

**Vercel Token**: Stored in `.vercel-token.txt` (gitignored)
**Live URL**: https://pmmsherpa.com
**Dashboard**: https://vercel.com/dashboard

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

### Password Login Not Working After Approval
- **Issue**: Users couldn't log in with password they provided during signup (Supabase doesn't accept pre-hashed passwords)
- **Fix**: Completely removed password from signup. Users now set password AFTER approval via recovery link flow.

---

## Pending Tasks / Future Improvements

1. **Debug slow chat response latency** - Initial response takes several seconds
2. **Add export functionality** - PDF/Markdown export of conversations
3. **Implement saved responses** - Star/bookmark individual responses
4. **Usage analytics dashboard** - Show token usage, query counts
5. **PMM operational tools** - Structured deliverable generators (battlecards, positioning canvas, etc.)
6. **File upload in conversations** - Allow PDFs, docs, images in chat context

---

## Change Log

### December 13, 2025 - Perplexity Research Integration v2 (Parallel + Dropdown)

**Feature: Parallel RAG + Perplexity with Unified Dropdown**
Combines PMM knowledge base with real-time web research in parallel, synthesizing both into unified responses.

**UI Controls**:
- **Perplexity dropdown button** (indigo when active) - Single dropdown with three modes:
  - **Knowledge Base Only** (default) - RAG search only
  - **Quick Research** - RAG + Perplexity `sonar-pro` (month recency)
  - **Deep Research** - RAG + Perplexity `sonar-deep-research` (year recency)
- **Web Search globe toggle** (blue) - Provider-native web search (Anthropic/Google)

**Key Architecture Change**:
- **BEFORE**: Sequential (RAG → LLM → Perplexity enrichment post-response)
- **AFTER**: Parallel (RAG + Perplexity simultaneously → combined context → LLM synthesizes)

**Flow**:
```
User Message
    ↓
┌─────────────────┬─────────────────┐
│  RAG Search     │  Perplexity     │  ← Promise.all() parallel
│  (hybrid_search)│  (if enabled)   │
└────────┬────────┴────────┬────────┘
         │                 │
         └────────┬────────┘
                  ↓
         Combined Context
         (RAG + Web Research)
                  ↓
         LLM Synthesizes Response
                  ↓
         Streamed to User
         (with both citation types)
```

**Files Created**:
- `src/lib/llm/perplexity-client.ts` - Perplexity API client using OpenAI SDK
- `src/app/api/research/route.ts` - Research expansion endpoint (for on-demand)
- `src/components/chat/ExpandedResearch.tsx` - Research display component
- `src/components/icons/PerplexityIcon.tsx` - Custom Perplexity logo SVG (uses `currentColor`)

**Files Modified**:
- `src/stores/chatStore.ts` - Added `perplexityEnabled`, `deepResearchEnabled` state
- `src/types/chat.ts` - Added `WebCitation`, `ExpandedResearch` types
- `src/components/chat/ChatInput.tsx` - Replaced toggle buttons with Perplexity dropdown menu
- `src/components/chat/ChatContainer.tsx` - Added Perplexity flags in API call
- `src/components/chat/MessageBubble.tsx` - Added "Expand with Research" button
- `src/app/api/chat/route.ts` - **Major refactor**: Parallel RAG + Perplexity execution

**Parallel Execution Code** (route.ts):
```typescript
const ragPromise = retrieveContext({ query: searchQuery })
const perplexityPromise = perplexityEnabled
  ? conductResearch(searchQuery, undefined, {
      model: deepResearchEnabled ? 'sonar-deep-research' : 'sonar-pro',
      recencyFilter: deepResearchEnabled ? 'year' : 'month'
    }).catch(err => null)
  : Promise.resolve(null)

const [ragResult, perplexityResult] = await Promise.all([ragPromise, perplexityPromise])
```

**Environment Variable**:
- `PERPLEXITY_API_KEY` - Perplexity API key (added to Vercel)

---

**Feature 2: Enhanced Clipboard Copy**
Replaced simple copy button with dropdown menu supporting multiple formats.

**Copy Formats**:
- **Copy as Markdown** - Preserves all formatting
- **Copy as Plain Text** - Strips markdown syntax
- **Copy for Google Docs** - Rich HTML that pastes with formatting in Google Docs/Word

**Files Created**:
- `src/lib/utils/clipboard.ts` - Clipboard utility functions (`copyAsMarkdown`, `copyAsPlainText`, `copyForGoogleDocs`)

**Files Modified**:
- `src/components/chat/MessageBubble.tsx` - Replaced copy button with DropdownMenu, added copy format handlers

---

### December 13, 2025 - Mobile Chat Bug Fixes
**Problems Fixed**:
1. **Messages disappearing**: After assistant response completed, messages would disappear leaving only first response
2. **Auto-scroll not working**: Screen didn't scroll to show current question when user sent a message

**Root Causes**:
1. DB sync logic was overwriting local messages with stale/empty DB data during streaming
2. Scroll logic only triggered on user messages, didn't follow streaming assistant responses

**Solutions**:
1. Added guards in message sync to prevent DB overwrite when local messages are ahead of DB
2. Rewrote scroll behavior to auto-scroll during streaming and follow response as it grows

**Files Changed**:
- `src/components/chat/ChatContainer.tsx` - Message sync protection (lines 83-101, 120)
- `src/components/chat/MessageList.tsx` - New auto-scroll during streaming (lines 23-116)

### December 13, 2025 - Welcome Screen Mobile Optimization
**Changes**:
- Restructured welcome screen layout for better mobile experience
- Suggestions now appear directly above chat input (not at top of screen)
- Orb and greeting are centered vertically in remaining space
- Changed from 4 horizontal wrapped suggestions to 3 vertical stacked suggestions
- Updated suggestion questions to:
  1. "What is April Dunford's positioning framework?"
  2. "How can PMMs earn respect from PMs?"
  3. "What messaging strategies deliver success?"

**Layout Structure**:
- Top section: Orb + greeting (centered with `flex-1 justify-center`)
- Bottom section: Suggestion buttons (positioned just above ChatInput)
- Chat input remains fixed at the very bottom

**Files Changed**:
- `src/components/chat/ChatContainer.tsx` - Welcome screen layout restructure

### December 12, 2025 - Branding Update
**Changes**:
- Updated chat bubble and send button from black to teal-cyan gradient
- Updated PMMSherpa logo text to indigo-purple gradient (matching homepage)

**UI Updates**:
- User message bubbles: `bg-gradient-to-br from-teal-500 to-cyan-600`
- User avatar: Same teal-cyan gradient
- Send button: Teal-cyan gradient with hover state (`from-teal-600 to-cyan-700`)
- PMMSherpa text: `bg-gradient-to-r from-indigo-600 to-purple-600` (sidebar + header)

**Files Changed**:
- `src/components/chat/MessageBubble.tsx` - User bubble and avatar gradient
- `src/components/chat/ChatInput.tsx` - Send button gradient
- `src/components/layout/Sidebar.tsx` - Logo text gradient
- `src/components/layout/Header.tsx` - Logo text gradient

### December 12, 2025 - Chat History Bug Fix
**Problem**: Model says "I don't see any previous chat history" even though prior messages exist in conversation.

**Root Cause**:
- The conversation history was fetched with `.order('created_at', { ascending: true }).limit(10)` which gets the FIRST 10 messages, not the LAST 10
- Missing logging made debugging difficult

**Fix**:
- Changed to `.order('created_at', { ascending: false }).limit(10)` then reverse for chronological order
- Added comprehensive logging throughout the chat flow for debugging
- Added auth check in useConversations hook

**Files Changed**:
- `src/app/api/chat/route.ts` - Fixed history fetch order, added logging
- `src/lib/llm/provider-factory.ts` - Added logging to buildMessages
- `src/hooks/useConversations.ts` - Added auth check and logging

### December 12, 2025 - Model Configuration Update
**Changes**:
- Removed OpenAI models (gpt-4o, gpt-4o-mini) from configuration due to compatibility issues
- Simplified to Anthropic (Claude Opus 4.5, Claude Sonnet 4.5) and Google (Gemini 3 Pro, Gemini 2.5 Pro Thinking) only
- Added web search toggle in chat UI
- Implemented provider-native web search tools:
  - Anthropic: `anthropic.tools.webSearch_20250305()`
  - Google: `google.tools.googleSearch()`
- Maintained backward compatibility for existing database records with 'openai' model value

**Files Changed**:
- `src/lib/llm/provider-factory.ts` - Removed OpenAI models, imports, and handling
- `src/components/chat/ModelSelector.tsx` - Removed OpenAI from model groups
- `src/app/(dashboard)/settings/preferences/page.tsx` - Removed OpenAI from preferences
- `src/app/api/chat/route.ts` - Simplified web search tools (Anthropic + Google only)
- `src/lib/llm/system-prompt.ts` - Removed OpenAI provider handling
- `src/types/chat.ts` - Added 'openai' to ChatModelValue for backward compatibility

### December 12, 2025 - Access Request Flow v2 (Password After Approval)
**Problem**: Users couldn't log in because Supabase Auth doesn't accept pre-hashed passwords during user creation.

**Solution**: Completely redesigned the flow:
- Removed password fields from request access form
- Made LinkedIn URL mandatory (was optional)
- Added `/set-password` page for users to create password after approval
- Added `/forgot-password` page for self-service password reset
- Created `/auth/callback` route to handle Supabase recovery tokens
- Updated approval API to generate recovery link instead of using stored password
- Updated email templates to include password setup link

**Files Changed**:
- `src/app/(auth)/request-access/page.tsx` - Removed password fields, made LinkedIn required
- `src/app/api/access-request/route.ts` - Removed bcrypt, password hashing
- `src/app/api/access-request/approve/route.ts` - Generate recovery link, updated email
- `src/lib/email/templates.ts` - Added passwordSetupLink to approval email
- `src/app/(auth)/login/page.tsx` - Added forgot password link, changed signup to request-access

**Files Created**:
- `src/app/(auth)/set-password/page.tsx` - Password setup after approval
- `src/app/(auth)/forgot-password/page.tsx` - Self-service password reset
- `src/app/auth/callback/route.ts` - Supabase auth callback handler
- `supabase/migrations/006_make_password_hash_nullable.sql`

### December 11, 2025 - Access Request Flow v1
- Implemented waitlist/approval flow replacing direct signup
- Created access_requests table and migrations
- Added admin notification emails via Resend
- Created admin approval pages

### December 10, 2025 - Custom Domain & Email Setup
- Connected pmmsherpa.com custom domain to Vercel
- Set up Resend for transactional emails
- Verified pmmsherpa.com domain in Resend

### Earlier - Core Features
- RAG knowledge base with 15,985 chunks
- Dual LLM support (Claude Opus 4.5, Gemini 2.5 Pro)
- Streaming SSE responses with citations
- Chat interface with conversation history

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

### December 13, 2025 - Perplexity Research Persistence & Enhanced Copy
- **Perplexity Research Persistence**: Web research (expandedResearch) now saved to database with messages
- **Load from History**: Past conversations display citations and web research sections
- **Enhanced Copy**: All copy formats (Markdown, Plain Text, Google Docs) include citations and web research
- Database migration: `008_add_expanded_research.sql` - Added `expanded_research JSONB` column to messages table

**Files Modified**:
- `src/app/api/chat/route.ts` - Save expanded_research when persisting assistant messages
- `src/types/database.ts` - Added WebCitationDb, ExpandedResearchDb interfaces
- `src/components/chat/ChatContainer.tsx` - Map expanded_research from DB when loading conversations
- `src/components/chat/MessageBubble.tsx` - Pass citations/research to copy functions
- `src/lib/utils/clipboard.ts` - Format citations and web research in all copy formats

---

### December 13, 2025 - Settings Page Enhancements
- **Dark Mode Toggle**: Added appearance section with Light/Dark/System theme options
- **Avatar Upload**: Profile picture upload with Supabase storage integration
- **Profile Section in Sidebar**: User avatar and name now displayed at bottom of sidebar
- Database migration: `009_create_avatars_bucket.sql` - Created avatars storage bucket

**Files Created**:
- `src/components/providers/ThemeProvider.tsx` - Theme context provider with localStorage + DB sync
- `supabase/migrations/009_create_avatars_bucket.sql` - Storage bucket for avatars

**Files Modified**:
- `src/app/(dashboard)/settings/page.tsx` - Added Appearance and Avatar sections
- `src/components/layout/Sidebar.tsx` - Added user profile section with avatar
- `src/app/layout.tsx` - Added pre-hydration theme script to prevent flash

---

### December 13, 2025 - Mobile Spacing & Layout Fixes
Comprehensive mobile-first responsive fixes to ensure clean, professional rendering on all screen sizes.

**Problems Fixed**:
1. **Text overflow/spillover**: Long content was breaking layout boundaries on mobile
2. **Spacing too large**: Elements had excessive spacing on small screens
3. **Buttons too large**: Action buttons were oversized for mobile viewports
4. **Dark mode on mobile**: Theme toggle wasn't properly visible/accessible on mobile

**Solutions Applied**:
- Added intermediate `sm:` breakpoint classes for smoother responsive transitions
- Applied `overflow-hidden`, `break-words`, `min-w-0`, `truncate`, `line-clamp-2` for text overflow
- Reduced element sizes on mobile with patterns like `h-6 sm:h-7 md:h-8`
- Hidden text labels on mobile, showing only icons with `hidden sm:inline`

**Files Modified**:
- `src/components/chat/MessageBubble.tsx`:
  - Responsive gaps: `gap-2 sm:gap-2.5 md:gap-3`
  - Smaller avatars on mobile: `h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8`
  - Added overflow protection to message bubble and prose
  - Responsive table styling with negative margins on mobile
  - Action buttons with hidden text labels on mobile
  - Research button shows "Research" on mobile vs "Expand with Research" on desktop

- `src/components/chat/SourceCitations.tsx`:
  - Added `overflow-hidden` to Collapsible wrapper
  - Responsive trigger button sizing
  - Badge sizing reduced for mobile: `text-[8px] sm:text-[10px]`
  - Added `truncate` and `line-clamp-2` for long citation content

- `src/components/chat/ExpandedResearch.tsx`:
  - Responsive container margins and padding
  - Trigger button sizing with responsive classes
  - Added overflow protection throughout
  - Web sources button: "Sources" on mobile vs "Web Sources" on desktop

- `src/components/chat/FileUpload.tsx`:
  - Responsive button sizing: `h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10`

- `src/components/chat/ChatInput.tsx`:
  - Responsive container padding: `p-2 sm:p-3 md:p-4 lg:p-6`
  - Responsive button sizing for all action buttons
  - Responsive textarea sizing

- `src/components/providers/ThemeProvider.tsx`:
  - Fixed TypeScript type casting for Supabase profile theme query

---

### December 13, 2025 - Voice Capabilities (Basic)

**Features Added**:
1. **Voice Input (STT)**: Microphone button in ChatInput for dictating messages
   - Uses browser's native Web Speech API (SpeechRecognition)
   - Real-time partial transcripts shown in placeholder
   - Final transcript appended to input field
   - Purple styling with pulse animation when recording

2. **Voice Output (TTS)**: Speaker button on assistant messages
   - Uses browser's Web Speech API (SpeechSynthesis)
   - Click to start/stop playback
   - Volume2/VolumeX icons for state indication

**Files Created**:
- `src/hooks/useVoiceInput.ts` - Voice recording hook with Web Speech API
- `src/hooks/useVoiceOutput.ts` - TTS playback hook with Web Speech API
- `src/app/api/voice/token/route.ts` - JWT token endpoint (for future Speechmatics use)

**Files Modified**:
- `src/components/chat/ChatInput.tsx` - Added microphone button (purple, right side)
- `src/components/chat/MessageBubble.tsx` - Added speaker button to action row

---

### December 13, 2025 - Mobile Action Buttons & Safe Area Fixes

**Problems Fixed**:
1. **Copy/Listen buttons not visible on mobile**: Buttons only appeared on hover (desktop-only behavior)
2. **Input area cut off at bottom**: iOS home indicator overlapping chat input

**Solutions**:
1. Changed opacity classes from hover-only to always-visible on mobile:
   - `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`
2. Added iOS safe-area support:
   - `pb-[max(0.5rem,env(safe-area-inset-bottom))]` in ChatInput
   - `viewportFit: "cover"` in layout.tsx viewport config

**Files Modified**:
- `src/components/chat/MessageBubble.tsx` - Action buttons always visible on mobile
- `src/components/chat/ChatInput.tsx` - Safe area bottom padding
- `src/app/layout.tsx` - Viewport configuration for iOS safe areas

---

### December 13, 2025 - Hybrid Voice Dialog with OpenAI APIs

**Major Upgrade**: Full voice conversation mode using OpenAI Whisper + TTS

**Architecture**:
```
User Speech → MediaRecorder → Whisper STT → Claude/RAG Pipeline → TTS → Audio Playback
```

This hybrid approach preserves the RAG knowledge base (unlike OpenAI Realtime API which bypasses it).

**Features Added**:
1. **Hybrid Voice Dialog**: Phone button in ChatInput launches full-screen voice conversation
   - Recording → Whisper transcription → Claude/RAG → OpenAI TTS response
   - Visual states: Connecting → Listening → Processing → Generating → Speaking
   - User can tap "Done speaking" to manually end recording
   - Conversation messages sync to chat history

2. **Voice Preference Settings**: Settings → Preferences → Voice Settings
   - 10 OpenAI TTS voices: Nova, Alloy, Echo, Fable, Onyx, Shimmer, Ash, Ballad, Coral, Sage
   - Preview button to hear voice before selecting
   - Preference saved to user profile

**Files Created**:
- `src/hooks/useHybridVoiceDialog.ts` - Main hook for hybrid voice flow (STT→Claude→TTS)
- `src/hooks/useVoiceDialog.ts` - OpenAI Realtime API hook (for future use)
- `src/components/chat/VoiceDialogOverlay.tsx` - Full-screen voice conversation UI
- `src/app/api/voice/transcribe/route.ts` - Whisper STT endpoint
- `src/app/api/voice/speak/route.ts` - OpenAI TTS endpoint
- `src/app/api/voice/realtime-token/route.ts` - Ephemeral token for Realtime API
- `supabase/migrations/010_add_voice_preference.sql` - Voice preference column

**Files Modified**:
- `src/components/chat/ChatInput.tsx` - Added Phone button for voice dialog, useHybridVoiceDialog
- `src/app/(dashboard)/settings/preferences/page.tsx` - Voice selection UI with preview
- `src/types/database.ts` - Added TTSVoice type and voice_preference to Profile

**Database Changes**:
- Added `voice_preference` column to `profiles` table (TEXT, default 'nova')
- Check constraint for valid voice values

**Cost Notes**:
- Whisper: $0.006/minute
- TTS (tts-1): $0.015/1K characters

---

### December 13, 2025 - Homepage Messaging Refresh

**Major Update**: Refreshed all marketing copy across the platform to better capture PMMSherpa's value proposition as a "second brain for product marketing."

**Key Messaging Changes**:
- **Hero Headline**: "Your Second Brain for Product Marketing" (previously "Your AI-Powered Product Marketing Assistant")
- **Badge**: "Where PMM Legends Meet Frontier AI" (previously "Powered by Claude Opus 4.5 & Gemini")
- **Subheadline**: "Expert knowledge. Real-time research. Voice conversations."
- **CTA**: "Think Clearly. Ship Faster."

**Guidelines Applied**:
- NO author names (April Dunford, etc.) or book titles (copyright discretion)
- Numbers ARE okay for credibility (e.g., "1,200+ expert resources")
- Focus on capability and value, not underlying source details

**Capabilities Section Redesign**:
- Replaced specific source counts (17 books, 781 blogs, 485 AMAs) with capability cards:
  - "1,200+ Expert Resources" - Positioning, messaging, and GTM frameworks
  - "Live Market Intelligence" - Real-time competitive insights via Perplexity
  - "Voice & Text" - Conversations that adapt to you

**Features Grid Updated**:
- Strategic Foundation, Positioning & Messaging, Go-to-Market Planning
- Ready-to-Use Outputs, Customer Intelligence, Talk or Type

**Animated Gradient Effect**:
- "Product Marketing" text now has animated gradient effect (shifting indigo-purple)
- CSS keyframes added for `gradient-shift` animation

**Files Modified**:
- `src/app/page.tsx` - Hero, capabilities, features, CTA sections
- `src/app/globals.css` - Added gradient animation keyframes
- `src/app/(auth)/request-access/page.tsx` - Updated subtitle messaging
- `src/lib/email/templates.ts` - Aligned email copy with new messaging

---

### December 14, 2025 - Voice Dialog Fixes & Stop/Edit/Regenerate Features

**Voice Dialog Bug Fixes**:
1. **SSE Parsing Fixed**: Chat API response parsing now correctly handles SSE format in useHybridVoiceDialog
   - Fixed: Response lines prefixed with `data: ` now properly parsed
   - Fixed: Handles `type: 'done'` event to complete response

2. **Duplicate Message Prevention**:
   - Messages from voice dialog no longer duplicated in conversation

**New Chat Control Features**:

1. **Stop Streaming Button**:
   - Red/orange stop button appears during AI response generation
   - Allows users to immediately cancel an in-progress response
   - Uses AbortController to cleanly abort fetch request
   - Gracefully handles abort without showing error toast

2. **Edit User Messages**:
   - Edit button on user messages puts content back in input field
   - Message index tracked for regeneration

3. **Regenerate from Edit**:
   - When user sends edited message, all subsequent messages are removed
   - New response generated from the edited prompt
   - Uses `removeMessagesFromIndex` from chatStore

**Implementation Details**:

- `AbortController` stored in Zustand store for cross-component access
- `editingMessageIndexRef` tracks which message is being edited
- `messageIndex` prop added to MessageBubble for edit tracking

**Files Modified**:
- `src/stores/chatStore.ts` - Added `abortController`, `setAbortController`, `abortStreaming` actions
- `src/components/chat/ChatInput.tsx` - Stop button (Square icon), conditional render with send button
- `src/components/chat/ChatContainer.tsx` - AbortController in fetch, AbortError handling, edit regeneration logic
- `src/components/chat/MessageBubble.tsx` - Added `messageIndex` prop, updated `onEditPrompt` signature
- `src/components/chat/MessageList.tsx` - Pass `messageIndex` to MessageBubble
- `src/hooks/useHybridVoiceDialog.ts` - Fixed SSE parsing for voice dialog

**UI Flow**:
```
User typing → Send button (purple gradient)
AI streaming → Stop button (red/orange gradient)
Edit message → Content in input → Send → Messages truncated → Regenerate
```

---

### December 15, 2025 - Voice Simplification & Mobile Fixes & Intelligent Web Search

**Task 1: Removed OpenAI Realtime Voice Mode**
- Removed Phone icon from ChatInput
- Removed `useHybridVoiceDialog` hook import and usage
- Removed `VoiceDialogOverlay` component import
- Removed `useProfile` hook import
- OpenAI voice code preserved in codebase for future use, just deactivated

**Task 2: Restored Native STT/TTS with Web Speech API**
- Rewrote `useVoiceInput.ts` to use native Web Speech API (SpeechRecognition)
  - Uses `window.SpeechRecognition || window.webkitSpeechRecognition`
  - Real-time partial transcripts with `onPartialTranscript` callback
  - Continuous mode with interim results
- Rewrote `useVoiceOutput.ts` to use native Web Speech API (SpeechSynthesis)
  - Preferred voice selection: Samantha, Karen, Daniel, Google US English
  - Falls back to first available voice
  - Strips markdown formatting before speaking

**Task 3: Fixed Mobile Rendering Issues**
- Fixed table overflow in `MessageBubble.tsx`:
  - Added `max-w-[calc(100vw-4rem)]` to table wrapper
  - Added `table-fixed` to table element
  - Added `break-words` to th/td cells
  - Added `sm:max-w-full` for larger screens

**Task 4: Intelligent Web Search Auto-Invocation**
- Created `src/lib/utils/search-detection.ts` with:
  - URL detection regex: `https?://[^\s<>\"{}|\\^`[\]]+`
  - Research triggers: 'search for', 'latest', 'recent', 'current', 'news', 'competitor analysis', etc.
  - PMM-specific triggers: 'competitive analysis', 'market trends', 'pricing page', 'gtm strategy', etc.
  - Question detection: 'what is the latest', 'how much does', 'where can i find', etc.
- Updated `ChatContainer.tsx`:
  - Imports `shouldAutoEnableWebSearch` utility
  - Auto-detects URLs and research queries in user messages
  - Enables web search automatically without affecting manual toggle
  - Logs auto-enable reason (url/research_trigger/question)

**Files Created**:
- `src/lib/utils/search-detection.ts` - Web search auto-detection utility

**Files Modified**:
- `src/components/chat/ChatInput.tsx` - Removed Phone icon, voice dialog, profile hook
- `src/hooks/useVoiceInput.ts` - Rewrote for native Web Speech API
- `src/hooks/useVoiceOutput.ts` - Rewrote for native SpeechSynthesis
- `src/components/chat/MessageBubble.tsx` - Fixed mobile table overflow
- `src/components/chat/ChatContainer.tsx` - Added intelligent web search auto-invocation

---

### December 15, 2025 - Access Request Flow v3 (Password Upfront, Banned Until Approved)

**Major Redesign**: Simplified the access request flow to collect password upfront and use Supabase banning mechanism.

**Problem with Previous Flow**:
- Users set password AFTER approval via recovery link
- Admin approval page required authentication (caused "Unauthorized" errors when clicked from email)
- Complex multi-step process with potential points of failure

**New Flow**:
1. User provides password during access request
2. Account created immediately with `ban_duration: '876000h'` (~100 years ban)
3. Admin gets email with direct link to Supabase Auth dashboard
4. Admin clicks "Remove ban" on user in Supabase UI
5. User can immediately log in with their password

**Benefits**:
- Simpler approval process (just remove ban in Supabase)
- No auth issues (admin already logged into Supabase dashboard)
- User already has their password - no recovery link needed
- Clearer admin notification email with step-by-step instructions

**Files Modified**:
- `src/app/(auth)/request-access/page.tsx` - Added password fields, confirmation message updated
- `src/app/api/access-request/route.ts` - Creates banned user immediately, links user_id to request
- `src/app/api/access-request/approve/route.ts` - Simplified to just unban user
- `src/lib/email/templates.ts` - Updated admin email with step-by-step Supabase approval instructions

**Database Migration**:
- `011_add_user_id_to_access_requests.sql` - Added `user_id` column to link access_requests to auth.users

---

### December 17, 2025 - Conversation Rename Feature

**Feature**: Users can now rename conversations in both the sidebar and history page.

**How It Works**:
- **Sidebar**: Hover over a conversation → click the Pencil icon → edit inline → press Enter to save or Escape to cancel
- **History Page**: Click the Pencil icon next to any conversation → edit inline → press Enter to save or Escape to cancel
- Renamed titles persist to the database via the existing `updateConversation` function

**UI Details**:
- Inline editing with Input component
- Check (green) and X (red) buttons for save/cancel
- Auto-focus and select-all when editing starts
- Keyboard shortcuts: Enter to save, Escape to cancel
- onBlur also saves changes

**Files Modified**:
- `src/components/layout/Sidebar.tsx` - Added rename state, inline editing UI with Pencil/Check/X icons
- `src/app/(dashboard)/history/page.tsx` - Added rename state, inline editing UI with Pencil/Check/X icons

**No Database Changes Required**: Uses existing `updateConversation` function which updates the `title` column in `conversations` table.

---

### February 5, 2026 - UX/UI Quick Wins - Design System Improvements

**Feature**: Implemented 5 high-impact, low-effort design improvements to enhance accessibility, usability, and visual polish.

**Quick Wins Implemented**:

1. **Focus Visible Styles** (globals.css)
   - Added teal outline (2px) for keyboard navigation
   - Separate dark mode focus styles
   - Respects `prefers-reduced-motion` for accessibility
   - Improves WCAG compliance

2. **Button Touch Targets** (button.tsx)
   - Minimum 44x44px touch targets for mobile accessibility
   - Updated all button size variants:
     - `default`: min-h-[44px]
     - `sm`: min-h-[36px]
     - `lg`: min-h-[48px]
     - `icon`: min-h-[44px] min-w-[44px]

3. **Mobile Table Overflow Fix** (MessageBubble.tsx)
   - Improved horizontal scroll wrapper for tables
   - Better max-width calculation: `max-w-[calc(100vw-5rem)]`
   - Added rounded border and overflow protection
   - Tables now fully readable on all screen sizes

4. **Loading Skeleton Loaders** (NEW: skeleton-message.tsx, MessageList.tsx)
   - Created `SkeletonMessage` component with pulse animation
   - Displays during AI response generation
   - Shows alongside StatusIndicator for better visual feedback
   - Compact variant available for tight spaces

5. **Enhanced Empty State** (ChatContainer.tsx)
   - Added feature badges: Expert Knowledge, Real-time Research, Voice & Text
   - Improved suggested prompts with icons (Target, Users, Sparkles)
   - Added "Try asking about:" label for clarity
   - Icon animations on hover (scale-110 transform)
   - Better mobile/desktop responsive sizing

**Performance Improvements**:
- Added `will-change: background-position` to gradient animation
- Added GPU acceleration with `transform: translateZ(0)`
- Smooth scroll behavior with motion preference detection

**Files Created**:
- `src/components/ui/skeleton-message.tsx` - Loading placeholder component

**Files Modified**:
- `src/app/globals.css` - Focus styles, smooth scroll, animation optimizations
- `src/components/ui/button.tsx` - Touch target improvements
- `src/components/chat/MessageBubble.tsx` - Table overflow fixes
- `src/components/chat/MessageList.tsx` - Skeleton loader integration
- `src/components/chat/ChatContainer.tsx` - Enhanced empty state with badges and icons

**Accessibility Improvements**:
- WCAG AA compliant focus indicators
- Touch-friendly button sizes (44px minimum)
- Reduced motion support
- Better loading state feedback

**Testing**:
- ✅ Dev server runs without errors
- ✅ Production build compiles successfully
- ✅ No TypeScript errors
- ✅ All changes tested locally

---

*Last updated: February 5, 2026 - UX/UI Quick Wins****

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

## Access Request Flow (Waitlist with Admin Approval)

**Important**: Direct signup is disabled. Users must request access and be approved by admin.

### User Flow
```
1. User visits https://pmmsherpa.com → clicks "Get Started"
2. User fills out Request Access form:
   - Full Name (required)
   - Email (required)
   - Phone (optional)
   - Profession (optional)
   - Company (optional)
   - LinkedIn URL (required) - validated format: linkedin.com/in/username
   - Use Cases (multi-select checkboxes)
3. User submits → sees "Thank you" confirmation
4. Admin (abhishekratna@gmail.com) receives email notification
5. Admin clicks "Approve Access" link → opens admin confirmation page
6. Admin confirms → account created in Supabase Auth
7. User receives approval email with "Set Up Your Password" button
8. User clicks link → redirected to /set-password page
9. User creates password → logged in automatically → redirected to /chat
```

### Key Implementation Details

**No password during signup**: Users don't provide a password when requesting access. They set it AFTER approval via a recovery-type link.

**Password Setup Flow**:
- Approval API calls `supabase.auth.admin.generateLink({ type: 'recovery', ... })`
- Link redirects to `/auth/callback?redirect_to=/set-password`
- Auth callback verifies OTP token and creates session
- `/set-password` page lets user create their password
- Password requirements: 8+ chars, uppercase, lowercase, number

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
  password_hash TEXT,  -- NULLABLE (not used in new flow)
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

*Last updated: December 13, 2025 - Mobile Spacing *Last updated: December 13, 2025 - Mobile Spacing & Layout Fixes* Layout Fixes**

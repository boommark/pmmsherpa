# PMMSherpa

**Your AI-powered Product Marketing Assistant**

PMMSherpa is a universal product marketing agent that combines expert knowledge from 1,283 PMM documents with the ability to generate actionable deliverables like positioning statements, messaging frameworks, launch plans, and competitive battlecards.

## Live Demo

**Production URL:** [https://pmmsherpa.vercel.app](https://pmmsherpa.vercel.app)

## Features

- **RAG-Powered Knowledge Base**: Access insights from 17 PMM books, 781 PMA blogs, and 485 Sharebird AMAs
- **Dual LLM Support**: Switch between Claude Opus 4.5 and Gemini 2.5 Pro
- **Real-time Streaming**: Responses stream in real-time with status updates
- **Source Citations**: Every response includes cited sources with author, title, and page references
- **Conversation History**: Persistent chat history stored in Supabase
- **User Authentication**: Secure email/password authentication

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 (App Router) |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth |
| Primary LLM | Claude Opus 4.5 |
| Alternate LLM | Gemini 2.5 Pro |
| Embeddings | OpenAI text-embedding-3-small (512 dimensions) |
| Streaming | Vercel AI SDK |
| UI | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |

## Knowledge Base

| Source | Count | Description |
|--------|-------|-------------|
| PMM Books | 17 | Industry-leading product marketing books |
| PMA Blogs | 781 | Product Marketing Alliance blog articles |
| Sharebird AMAs | 485 | Expert Q&A sessions from PMM leaders |
| **Total Chunks** | **15,985** | Embedded and indexed for semantic search |

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

## Database Schema

### Core Tables

- **profiles** - User profiles (extends auth.users)
- **conversations** - Chat conversations with metadata
- **messages** - Individual messages with citations
- **documents** - Source document metadata
- **chunks** - Embedded text chunks with vectors
- **usage_logs** - API usage analytics

### Key Features

- pgvector extension for 512-dimensional embeddings
- HNSW index for fast similarity search
- Hybrid search (70% semantic + 30% keyword)
- Row Level Security (RLS) for data isolation

## RAG Pipeline

1. **Query Enhancement**: Expand PMM acronyms and add context
2. **Embedding**: Generate query embedding via OpenAI
3. **Hybrid Search**: Combined semantic + BM25 keyword search
4. **Context Assembly**: Top 8 chunks within token budget
5. **Citation Extraction**: Source attribution with author/title/page

## Environment Variables

```bash
# Supabase
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

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+ (for ingestion scripts)
- Supabase account
- API keys for Anthropic, Google, and OpenAI

### Installation

```bash
# Clone the repository
git clone https://github.com/boommark/pmmsherpa.git
cd pmmsherpa

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

### Knowledge Ingestion

```bash
# Install Python dependencies
pip install openai supabase python-dotenv tiktoken

# Run ingestion pipeline
cd scripts
python ingest_documents.py
```

## API Endpoints

### POST /api/chat

Streaming chat endpoint with RAG retrieval.

**Request:**
```json
{
  "message": "Help me create a positioning statement",
  "conversationId": "uuid",
  "model": "claude"
}
```

**Response (SSE):**
```
data: {"type": "status", "message": "Searching PMM knowledge base..."}
data: {"type": "citations", "citations": [...]}
data: {"type": "text", "content": "Here's a positioning..."}
data: {"type": "done"}
```

## Deployment

The app is deployed on Vercel with automatic deployments on push to `main`.

```bash
# Deploy to production
npx vercel --prod
```

## PMM Capabilities

### Advisor Mode
- Answer PMM strategy questions
- Explain frameworks and methodologies
- Provide expert insights from knowledge base

### Executor Mode (Deliverables)
- **Positioning**: Canvas, elevator pitch, value proposition
- **Messaging**: Framework, differentiation matrix, taglines
- **GTM Strategy**: Launch plans (T1-T4), bullseye analysis
- **Competitive Intel**: Battlecards, objection handlers
- **Sales Enablement**: Deck outlines, one-pagers, FAQs
- **Research**: Interview guides (Mom Test), JTBD analysis

## License

Private - All rights reserved.

## Author

Built by [Abhishek Ratna](https://github.com/boommark)

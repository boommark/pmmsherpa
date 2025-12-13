# PMMSherpa Monetization: Feature Expansion Plan

## Executive Summary

Based on analysis of the current codebase and PMM tool market research, here are high-value features that would make PMMSherpa financially appealing to PMM professionals, along with required libraries/tools.

---

## Table of Contents
1. [Market Context](#market-context)
2. [Recommended Features](#recommended-features-priority-order)
3. [Video Capabilities](#video-capabilities-massive-opportunity)
4. [Additional Market Capabilities](#additional-pmm-capabilities)
5. [Multi-Agent Architecture](#multi-agent-architecture)
6. [APIs & Services Required](#comprehensive-api--service-catalog)
7. [Technical Implementation](#technical-implementation-requirements)
8. [Monetization Model](#monetization-model-suggestion)
9. [Implementation Phases](#implementation-phases)

---

## Market Context

### What PMMs Currently Pay For
- **Competitive Intelligence**: Crayon, Klue ($15,000-$20,000/year)
- **AI Battlecard Tools**: [Ignition](https://www.haveignition.com/), [BattleCard.ai](https://battlecard.ai/), [1up.ai](https://1up.ai/blog/sales-battlecards/)
- **AI Writing**: Jasper ($49/month for 50K words)
- **GTM Planning**: [ClickUp](https://clickup.com/p/features/ai/go-to-market-plan-generator), [Beam.ai](https://beam.ai/tools/go-to-market-gtm-strategy)
- **Message Testing**: Wynter (per-test pricing)
- **PMM Education**: PMA membership ($1,295+ for summits)

### PMMSherpa's Unique Advantage
- **15,985 curated PMM knowledge chunks** from authoritative sources
- **Expert voices** from 485 Sharebird AMAs with speaker attribution
- **Framework knowledge** from 17 PMM books
- **Current trends** from 781 PMA blog articles

---

## Video Capabilities (Massive Opportunity)

Video is indeed a massive market. Here's how PMMSherpa could leverage AI video generation:

### PMM Video Use Cases

| Video Type | PMM Use Case | Value Proposition |
|------------|--------------|-------------------|
| **Product Demo Videos** | 60-90 sec feature walkthroughs | Replace expensive video production |
| **Explainer Videos** | How product solves problems | Animated or avatar-led |
| **Customer Testimonial Style** | AI-generated success story narration | Scale social proof |
| **Sales Enablement Videos** | Custom demos per prospect | Personalization at scale |
| **Internal Training** | Product knowledge for sales teams | Onboarding acceleration |
| **Launch Announcement** | Product release communications | Quick turnaround |
| **Competitive Positioning** | "Why us vs them" videos | Sales tool |

### Video API Options

| Platform | Best For | Pricing | API |
|----------|----------|---------|-----|
| [**HeyGen**](https://www.heygen.com/api-pricing) | Avatar-led explainers, personalization | $99/mo (100 credits) | Yes |
| [**Synthesia**](https://www.synthesia.io/) | Corporate training, product demos | $29/mo (10 min) | Creator+ |
| [**Runway**](https://docs.dev.runwayml.com/guides/pricing/) | Creative/cinematic content | $15/mo (625 credits) | Yes |
| [**D-ID**](https://www.d-id.com/) | Quick personalized outreach | Pay-per-use | Yes |

### Recommended Video Features for PMMSherpa

**Tier 1: Script Generation (Low cost, high value)**
- Generate video scripts from positioning/messaging
- Export as teleprompter-ready format
- Include shot suggestions, B-roll notes

**Tier 2: AI Video Generation (API integration)**
- Integration with HeyGen/Synthesia APIs
- Generate avatar-led product explainers
- Auto-create from battlecard content
- Multi-language support (175+ languages via HeyGen)

**Tier 3: Interactive Video Demos**
- Clickable product walkthroughs
- Branching narratives based on viewer choices
- Embedded in sales sequences

### Video Implementation Approach
```
User creates Positioning Canvas
    ↓
"Generate Explainer Video" button
    ↓
PMMSherpa generates video script + shot list
    ↓
(Optional) Send to HeyGen API → Avatar video
    ↓
Download MP4 or share link
```

---

## Additional PMM Capabilities

### 1. Win-Loss Analysis Platform
**Why**: PMMs own win-loss but lack tools. [Clozd](https://www.clozd.com/) charges enterprise prices.

**Features:**
- Interview guide generator (already planned)
- AI interview analysis (upload call recordings)
- Pattern detection across wins/losses
- Auto-generate insights reports
- Feed insights back into battlecards

**APIs needed:**
- [Deepgram](https://deepgram.com/) or [AssemblyAI](https://www.assemblyai.com/) - Transcription
- Existing Claude/Gemini - Analysis

### 2. Presentation/Deck Generator
**Why**: Every PMM creates decks. [Gamma.app](https://gamma.app/) has 250M+ presentations generated.

**Features:**
- Generate pitch deck from positioning
- Sales deck from battlecard
- Launch deck from GTM plan
- Export to PPTX/Google Slides/PDF

**APIs needed:**
- [Gamma API](https://gamma.app/) (via Zapier integration)
- OR [Presenton](https://github.com/presenton/presenton) (open-source, self-hosted)
- OR build with `pptxgenjs` library

### 3. Product Marketing Asset Generator
**Why**: PMMs constantly create one-pagers, case studies, data sheets.

**Features:**
- One-pager generator (from positioning + features)
- Case study builder (customer + results → formatted doc)
- Data sheet creator
- Branded PDF output

**APIs needed:**
- `@react-pdf/renderer` for PDF
- Image generation for visuals ([DALL-E 3](https://platform.openai.com/docs/guides/images): $0.04/image)

### 4. Competitive Intelligence Monitoring
**Why**: [Crayon](https://www.crayon.co/)/[Klue](https://klue.com/) cost $15-20K/year.

**Features:**
- Track competitor websites for changes
- Monitor pricing page updates
- News/PR monitoring
- Auto-update battlecards when intel arrives

**APIs needed:**
- Web scraping (Apify actors, or custom)
- News APIs (NewsAPI, Google News)
- Existing web search (already have)

### 5. Customer Research Hub
**Why**: Research is core PMM work but scattered across tools.

**Features:**
- Interview recording upload + transcription
- AI-powered theme extraction
- Persona builder from interview data
- JTBD framework extraction
- Quote library for messaging

**APIs needed:**
- [AssemblyAI](https://www.assemblyai.com/) ($0.37/hour transcription)
- OR [Deepgram](https://deepgram.com/) ($0.25/hour)
- Existing RAG for storing/searching quotes

### 6. Message Testing Simulator
**Why**: [Wynter](https://wynter.com/) charges per test. AI can simulate.

**Features:**
- Input: messaging variants
- AI simulates buyer personas responding
- Predict which message resonates
- A/B test suggestions

**Implementation**: Prompt engineering with persona simulation

---

## Multi-Agent Architecture

### Why Multi-Agent for PMMSherpa?

A multi-agent system would be beneficial because PMM work involves **multiple specialized tasks** that benefit from different "expert" perspectives:

| Agent Role | Specialty | When Activated |
|------------|-----------|----------------|
| **Strategist Agent** | Positioning, differentiation, market analysis | "Help me position this product" |
| **Writer Agent** | Messaging, copy, scripts | "Write a tagline" |
| **Researcher Agent** | Competitive intel, market data, citations | "What are competitors doing?" |
| **Analyst Agent** | Win-loss patterns, data interpretation | "Analyze these interviews" |
| **Builder Agent** | Structured deliverable generation | "Create a battlecard" |
| **Critic Agent** | Quality review, challenge assumptions | Internal review before output |

### Framework Recommendation: **LangGraph**

Based on [framework comparisons](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen):

| Framework | Pros | Cons | Best For |
|-----------|------|------|----------|
| [**LangGraph**](https://langchain-ai.github.io/langgraph/) | Fine control, stateful, composable | Steeper learning curve | Complex workflows with state |
| [**CrewAI**](https://www.crewai.com/) | Easy role-based setup, fast prototyping | Less control | Quick MVP, simple flows |
| [**AutoGen**](https://microsoft.github.io/autogen/) | Enterprise-grade, Microsoft backing | Complex setup | Enterprise environments |

**Recommendation**: Start with **CrewAI** for rapid prototyping, migrate to **LangGraph** for production if needed.

### Proposed Agent Architecture for PMMSherpa

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                        │
│         (Routes requests, manages conversation)              │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│  STRATEGIST     │ │  RESEARCHER │ │  BUILDER        │
│  - Positioning  │ │  - RAG search│ │  - Battlecards  │
│  - GTM strategy │ │  - Web search│ │  - Canvases     │
│  - Segmentation │ │  - Competitor│ │  - Decks        │
└────────┬────────┘ └──────┬──────┘ └────────┬────────┘
         │                 │                  │
         └────────────┬────┴──────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  CRITIC AGENT │
              │  - QA review  │
              │  - Fact check │
              │  - Challenge  │
              └───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │    OUTPUT     │
              │  (Deliverable)│
              └───────────────┘
```

### Agent Workflow Examples

**Example 1: Battlecard Generation**
```
User: "Create a battlecard for [competitor]"
    ↓
Orchestrator → Routes to Researcher + Strategist
    ↓
Researcher Agent:
  - Searches RAG for competitor mentions
  - Web search for latest competitor news
  - Gathers pricing, features, weaknesses
    ↓
Strategist Agent:
  - Analyzes differentiation angles
  - Identifies win themes
  - Suggests objection handlers
    ↓
Builder Agent:
  - Structures into battlecard format
  - Generates JSON output
    ↓
Critic Agent:
  - Reviews for accuracy
  - Challenges weak arguments
  - Suggests improvements
    ↓
Final Battlecard Output
```

**Example 2: Positioning Canvas**
```
User: "Help me position [product] for [market]"
    ↓
Orchestrator → Routes to Strategist
    ↓
Strategist Agent:
  - Asks clarifying questions (target customer, alternatives)
  - Searches RAG for positioning frameworks
  - Proposes positioning approach
    ↓
Critic Agent:
  - Challenges: "Is this differentiated enough?"
  - Suggests alternatives
    ↓
Builder Agent:
  - Generates structured Positioning Canvas
    ↓
Output with rationale
```

### Implementation Complexity

| Approach | Complexity | Time | Recommendation |
|----------|------------|------|----------------|
| **Single LLM + Prompts** | Low | 1-2 weeks | Start here |
| **CrewAI Multi-Agent** | Medium | 3-4 weeks | Phase 2 |
| **LangGraph Stateful** | High | 6-8 weeks | Phase 3 (if needed) |

**Recommendation**: Start with single LLM + specialized prompts per deliverable type. Add multi-agent orchestration in Phase 2 when complexity demands it.

---

## Comprehensive API & Service Catalog

### Core Infrastructure

| Service | Purpose | Pricing | Priority |
|---------|---------|---------|----------|
| [**Stripe Billing**](https://stripe.com/billing) | Subscriptions + usage-based billing | 0.5% of billing volume | High |
| [**Supabase**](https://supabase.com/) | Database, auth, storage | Already using | - |
| [**Vercel**](https://vercel.com/) | Hosting | Already using | - |
| [**Resend**](https://resend.com/) | Transactional email | Already using | - |

### AI/LLM Services

| Service | Purpose | Pricing | Priority |
|---------|---------|---------|----------|
| [**Anthropic Claude**](https://www.anthropic.com/) | Primary LLM | Already using | - |
| [**Google Gemini**](https://ai.google.dev/) | Secondary LLM | Already using | - |
| [**OpenAI Embeddings**](https://platform.openai.com/) | Vector embeddings | Already using | - |
| [**OpenAI DALL-E 3**](https://platform.openai.com/docs/guides/images) | Image generation | $0.04-0.08/image | Medium |

### Video Generation

| Service | Purpose | Pricing | Priority |
|---------|---------|---------|----------|
| [**HeyGen API**](https://www.heygen.com/api-pricing) | Avatar explainer videos | $99/mo (100 credits) | Medium |
| [**Synthesia API**](https://www.synthesia.io/) | Corporate/training videos | Custom pricing | Low |
| [**Runway API**](https://docs.dev.runwayml.com/) | Creative video generation | $15/mo + credits | Low |

### Document/Presentation

| Service | Purpose | Pricing | Priority |
|---------|---------|---------|----------|
| [**Gamma API**](https://gamma.app/) | Slide deck generation | Via Zapier | Medium |
| [**Google Docs API**](https://developers.google.com/docs/api) | Export to Google Docs | Free | Medium |
| `pptxgenjs` | PowerPoint generation | Free (library) | High |
| `@react-pdf/renderer` | PDF generation | Free (library) | High |

### Transcription/Audio

| Service | Purpose | Pricing | Priority |
|---------|---------|---------|----------|
| [**AssemblyAI**](https://www.assemblyai.com/) | Interview transcription | $0.37/hour | Medium |
| [**Deepgram**](https://deepgram.com/) | Real-time transcription | $0.25/hour | Medium |

### Competitive Intelligence

| Service | Purpose | Pricing | Priority |
|---------|---------|---------|----------|
| [**Apify**](https://apify.com/) | Web scraping actors | Pay-per-use | Low |
| [**NewsAPI**](https://newsapi.org/) | News monitoring | Free tier available | Low |
| **Firecrawl** | Website change monitoring | Self-hosted | Low |

### Multi-Agent Frameworks

| Framework | Purpose | Pricing | Priority |
|-----------|---------|---------|----------|
| [**CrewAI**](https://www.crewai.com/) | Multi-agent orchestration | Free (library) | Phase 2 |
| [**LangGraph**](https://langchain-ai.github.io/langgraph/) | Stateful agent graphs | Free (library) | Phase 3 |

---

## Recommended Features (Priority Order)

### Tier 1: High-Impact, Quick Wins (1-2 weeks each)

#### 1. **Structured Deliverable Generators**
**Why**: This is THE missing feature. System prompt promises it, users expect it.

**Deliverables to build:**
- Positioning Canvas (April Dunford style)
- Sales Battlecard Generator
- Messaging Framework Matrix
- Value Proposition Builder
- Elevator Pitch Generator

**How it works:**
- User fills guided form OR describes in chat
- AI generates structured JSON output
- Renders as editable template
- Export to PDF/Markdown/Google Docs

**Libraries needed:**
- `zod` - Schema validation (already likely in project)
- Anthropic/OpenAI tool use for structured outputs
- `@react-pdf/renderer` - PDF generation (lightweight, React-native)

#### 2. **Export Functionality**
**Why**: Users need to use deliverables outside the app.

**Export formats:**
- PDF (branded, professional)
- Markdown
- Google Docs (via API)
- Copy as formatted text

**Libraries needed:**
- `@react-pdf/renderer` - Declarative PDF in React
- OR `puppeteer` for pixel-perfect HTML→PDF (heavier)
- `googleapis` - Google Docs export

#### 3. **Knowledge Base Browser/Search**
**Why**: Let users explore the 15,985 chunks directly.

**Features:**
- Search by author, book, topic
- Filter by source type (book/blog/AMA)
- Browse AMA speakers by role/company
- Save favorite sources

**Libraries needed:**
- None new - use existing Supabase search functions
- Add UI components only

---

### Tier 2: Differentiation Features (2-4 weeks each)

#### 4. **Competitive Battlecard Generator**
**Why**: Battlecards boost win rates 50-60%. High willingness to pay.

**Features:**
- Input: Your product + 1-3 competitors
- Output: Structured battlecard with:
  - Strengths/weaknesses matrix
  - Objection handlers
  - Win/loss talking points
  - Pricing comparison
- Web search integration for live competitor data
- Auto-refresh capability

**Libraries needed:**
- Existing web search (Anthropic/Google)
- Structured output schemas
- PDF export

#### 5. **GTM Launch Planner**
**Why**: Every PMM needs launch plans. Currently done in spreadsheets.

**Features:**
- Guided questionnaire (product, audience, goals)
- AI generates T1-T4 timeline
- Milestone tracking
- Checklist generation
- Export to project management tools

**Libraries needed:**
- Date/timeline libraries (`date-fns`)
- Potentially Gantt chart component

#### 6. **Interview Guide Generator (Mom Test style)**
**Why**: Customer research is core PMM work. Hard to do well.

**Features:**
- Input: Research goals, customer segment
- Output: Structured interview script
- Non-leading question generation
- Follow-up prompts
- Export as PDF/doc

---

### Tier 3: Premium/Enterprise Features

#### 7. **Custom Knowledge Base**
**Why**: Enterprise teams want their own content indexed.

**Features:**
- Upload company docs (PDFs, docs, presentations)
- Index with same RAG pipeline
- Private knowledge + public PMM knowledge
- Team sharing

**Libraries needed:**
- `pdf-parse` or `pdf.js` - PDF text extraction
- `mammoth` - Word doc extraction
- Existing embedding pipeline

#### 8. **Team Workspaces**
**Why**: PMM teams collaborate. Individual tool → team tool = higher ACV.

**Features:**
- Shared conversations
- Shared deliverable library
- Team admin controls
- Usage analytics per team

#### 9. **API Access**
**Why**: Power users want programmatic access.

**Features:**
- REST API for deliverable generation
- Webhook support
- Rate limiting by tier

#### 10. **Integrations**
**Why**: PMMs live in other tools.

**Targets:**
- Notion (export deliverables)
- Google Workspace (Docs, Slides)
- Slack (share insights)
- Salesforce (battlecard delivery)

---

## Technical Implementation Requirements

### Libraries to Add

| Library | Purpose | Size | Priority |
|---------|---------|------|----------|
| `@react-pdf/renderer` | PDF generation | ~500KB | High |
| `zod` | Schema validation | ~50KB | High (may exist) |
| `date-fns` | Date handling | ~30KB | Medium |
| `pdf-parse` | PDF text extraction | ~200KB | Medium |
| `mammoth` | Word doc extraction | ~100KB | Medium |
| `googleapis` | Google Docs export | ~varies | Low |

### Database Schema Additions

```sql
-- Deliverables table
CREATE TABLE deliverables (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL, -- 'positioning', 'battlecard', 'messaging', etc.
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured deliverable data
  conversation_id UUID REFERENCES conversations,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom documents (for enterprise)
CREATE TABLE custom_documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  team_id UUID, -- Future: team workspaces
  title TEXT NOT NULL,
  source_type TEXT DEFAULT 'custom',
  file_path TEXT,
  raw_content TEXT,
  is_indexed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints to Add

```
POST /api/generate-deliverable
  - type: 'positioning' | 'battlecard' | 'messaging' | 'gtm-plan' | 'interview-guide'
  - inputs: { ...type-specific fields }
  - returns: structured JSON + conversation_id

POST /api/export
  - deliverableId: UUID
  - format: 'pdf' | 'markdown' | 'gdocs'
  - returns: file URL or redirect

GET /api/knowledge/search
  - query: string
  - filters: { sourceType, author, dateRange }
  - returns: documents with metadata

POST /api/knowledge/upload (Premium)
  - file: multipart
  - returns: document_id, processing status
```

---

## Monetization Model Suggestion

### Free Tier
- 50 messages/month
- Basic chat with RAG
- 3 saved responses

### Pro ($29-49/month)
- Unlimited messages
- Deliverable generators (positioning, messaging, battlecards)
- PDF export
- Knowledge base browser
- Unlimited saved responses

### Team ($99-199/month per seat)
- Everything in Pro
- Team workspaces
- Shared deliverable library
- Custom document upload (limited)
- Admin analytics

### Enterprise (Custom)
- Unlimited custom documents
- API access
- SSO/SAML
- Dedicated support
- Custom integrations

---

## Implementation Phases (Revised)

### Phase 1: Core Deliverables (Week 1-3)
**Goal**: Transform from chat-only to deliverable-generating platform

- [ ] Add structured output schemas (Zod) for deliverables
- [ ] Create `/api/generate-deliverable` endpoint
- [ ] Build **Positioning Canvas** generator (UI + structured output)
- [ ] Build **Sales Battlecard** generator
- [ ] Add PDF export with `@react-pdf/renderer`
- [ ] Knowledge base browser/search UI

### Phase 2: Expanded Deliverables + Monetization (Week 4-6)
**Goal**: Full deliverable suite + revenue capability

- [ ] **Messaging Framework** generator
- [ ] **GTM Launch Planner** with timeline
- [ ] **Interview Guide** generator (Mom Test style)
- [ ] **Video Script** generator (Tier 1 video)
- [ ] **Stripe integration** for usage-based billing
- [ ] Export to Google Docs/PPTX

### Phase 3: Multi-Agent + Advanced Features (Week 7-10)
**Goal**: Smarter orchestration + premium capabilities

- [ ] Implement **CrewAI multi-agent** architecture
- [ ] Add **Critic Agent** for deliverable QA
- [ ] **Presentation/Deck generator** (pptxgenjs or Gamma)
- [ ] **One-pager/Case Study** generators
- [ ] Custom document upload + indexing
- [ ] Team workspaces (basic)

### Phase 4: Video + Research Hub (Week 11-14)
**Goal**: High-value premium features

- [ ] **HeyGen API integration** for avatar videos
- [ ] **Interview transcription** (AssemblyAI/Deepgram)
- [ ] **Win-loss analysis** from uploaded recordings
- [ ] **Quote library** from research
- [ ] **Message testing simulator**

### Phase 5: Enterprise (Week 15+)
**Goal**: Enterprise-ready platform

- [ ] **LangGraph migration** (if needed for complexity)
- [ ] **Competitive intelligence monitoring**
- [ ] **API access** for power users
- [ ] **SSO/SAML** authentication
- [ ] Advanced analytics dashboard
- [ ] White-label options

---

## Decision Framework: What to Build First

### High Value + Low Effort (Do First)
| Feature | Why |
|---------|-----|
| Positioning Canvas | April Dunford framework, core PMM need |
| Sales Battlecard | 50-60% win rate improvement, high WTP |
| PDF Export | Users need to use deliverables |
| Video Scripts | Instant value without video API cost |

### High Value + Medium Effort (Do Next)
| Feature | Why |
|---------|-----|
| Messaging Framework | Core PMM deliverable |
| Stripe Billing | Enable monetization |
| GTM Launch Planner | High demand, unique offering |
| Deck Generator | Every PMM creates decks |

### High Value + High Effort (Do Later)
| Feature | Why |
|---------|-----|
| HeyGen Video Integration | Premium differentiator |
| Multi-Agent System | Better quality outputs |
| Win-Loss Analysis | Enterprise feature |
| Custom Knowledge Base | Enterprise feature |

---

## Questions for You

Based on this research, here are the key decisions to make:

### 1. **Starting Point - Which deliverables first?**
My recommendation: **Positioning Canvas + Battlecard + PDF Export**
- These are highest value, most requested
- Battlecards alone can justify $49+/month subscription
- Do you agree, or would you prioritize differently?

### 2. **Video Strategy**
Three options:
- **A) Script-only** (Week 2) - Generate video scripts, users record themselves. Low cost, immediate value.
- **B) HeyGen integration** (Week 8+) - Full AI avatar videos. $99/mo API cost, premium feature.
- **C) Skip video** - Focus on documents only

Which approach interests you?

### 3. **Multi-Agent Architecture**
- **Start simple**: Single LLM with specialized prompts (faster, easier)
- **Go multi-agent early**: CrewAI from the start (better quality, more complex)

I recommend starting simple and adding multi-agent in Phase 3. Agree?

### 4. **Monetization Model**
Options:
- **Freemium**: Free chat (50 msg/mo), Pro ($29-49/mo) for deliverables
- **Usage-based**: Pay per deliverable generated ($2-5 each)
- **Hybrid**: Base subscription + usage overage (like OpenAI)

Which aligns with your vision?

### 5. **Enterprise Features Priority**
These are high-effort but high-revenue:
- Custom document upload (bring your own content)
- Team workspaces
- Win-loss analysis from recordings
- Competitive intelligence monitoring

Which, if any, are must-haves for your roadmap?

### 6. **Timeline Preference**
- **Fast MVP** (4-6 weeks): Core deliverables + billing, ship and iterate
- **Complete v1** (10-12 weeks): Full deliverable suite + video + multi-agent
- **Enterprise-ready** (16+ weeks): All features including team/enterprise

What's your target?

### 7. **Budget for External APIs**
Some features require paid APIs:
- HeyGen video: ~$99/mo
- AssemblyAI transcription: ~$0.37/hour
- Stripe: 0.5% of revenue

Are these acceptable costs to pass through to users?

---

## Summary: My Recommendations

Based on the research, here's what I'd build:

**Phase 1 (Weeks 1-3): Ship Core Value**
1. Positioning Canvas generator
2. Sales Battlecard generator
3. PDF export
4. Stripe billing (Pro tier at $39/mo)

**Phase 2 (Weeks 4-6): Expand + Differentiate**
5. Messaging Framework
6. Video Script generator
7. GTM Launch Planner
8. Knowledge base browser

**Phase 3+ (Weeks 7+): Premium/Enterprise**
9. Multi-agent with CrewAI
10. HeyGen video integration
11. Interview transcription + analysis
12. Team workspaces

This approach:
- Gets to revenue quickly (Week 3)
- Validates market before big investments
- Builds moat with unique PMM-specific tools
- Scales to enterprise over time

---

## Sources

- [Ignition - AI PMM Software](https://www.haveignition.com/)
- [1up.ai - Sales Battlecards](https://1up.ai/blog/sales-battlecards/)
- [BattleCard.ai](https://battlecard.ai/)
- [ClickUp GTM Generator](https://clickup.com/p/features/ai/go-to-market-plan-generator)
- [React-PDF Comparison](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)
- [AI Structured Outputs Guide](https://agenta.ai/blog/the-guide-to-structured-outputs-and-function-calling-with-llms)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)

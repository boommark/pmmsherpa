# PMM Sherpa Knowledge Corpus

**Supabase project:** Flytr (`ogbjdvnkejkqqebyetqx`)
**Embedding model:** OpenAI `text-embedding-3-small` (512 dims)
**Search:** Hybrid (70% semantic + 30% keyword via `hybrid_search()`)
**Last updated:** 2026-04-07
**Total:** ~2,248 documents, ~28,132 chunks

---

## Layer 1: Books (Frameworks & Theory)

**source_type:** `book` | **Documents:** 31 | **Chunks:** 7,210

| Title | Author | Topic |
|---|---|---|
| Obviously Awesome (2nd ed.) | April Dunford | Positioning |
| Sales Pitch | April Dunford | Sales storytelling |
| 22 Immutable Laws of Marketing | Al Ries & Jack Trout | Marketing laws |
| Crossing the Chasm | Geoffrey Moore | Technology adoption |
| Inside the Tornado | Geoffrey Moore | Hypergrowth market strategies |
| Go-to-Market Strategist | Maja Voje | GTM strategy |
| Building a StoryBrand | Donald Miller | Messaging framework |
| Hooked | Nir Eyal | Habit-forming products |
| Laws of Human Nature | Robert Greene | Psychology |
| Never Split the Difference | Chris Voss | Negotiation |
| Influence | Robert Cialdini | Persuasion |
| The Trusted Advisor | David Maister | Consulting relationships |
| Managing the Professional Service Firm | David Maister | Services management |
| Stories That Stick | Kindra Hall | Storytelling |
| Inspired | Marty Cagan | Product management |
| Traction | Gabriel Weinberg | Growth channels |
| Play Bigger | Al Ramadan et al. | Category design |
| The Copywriter's Handbook | Robert Bly | Copywriting |
| The Jobs To Be Done Playbook | Jim Kalbach | JTBD framework |
| Loved: Rethinking Product Marketing | Martina Lauchengco | PMM role definition |
| MisUnderstood PMM | Richard King | PMM career |
| Product Demos that Sell | Steli Efti | Demo craft |
| Punchy | Michael Mackenzie | Concise communication |
| Smart Brevity | Jim VandeHei et al. | Business writing |
| The Pocket Guide to Product Launches | Mary Sheehan | Launch playbook |
| Monetizing Innovation | Madhavan Ramanujam | Pricing & willingness-to-pay |
| Marketing 4.0 | Philip Kotler | Traditional to digital marketing |
| Communication Books (5) | Various | Conversations, office politics, leadership |

**Removed (2026-04-07 audit):** Obviously Awesome 1st ed. (superseded), How to Become a People Magnet (self-help, not PMM), Games People Play (tangential psychology), Becoming Bulletproof (personal security, not PMM)

**Chunking:** Split by `--- Page N ---` markers, paragraph-split with 150-token overlap. Target: 1000 tokens, max: 1200.

---

## Layer 1b: Product Management Books (Product Strategy)

**source_type:** `book_pm` | **Documents:** 3 | **Chunks:** 609

| Title | Author | Topic |
|---|---|---|
| Hook Point | Brendan Kane | Attention capture, content hooks |
| Product Leadership | Richard Banfield | PM team building, product org |
| The Mom Test | Rob Fitzpatrick | Customer discovery, user research |

**Retrieval:** Surfaces under "### Product Strategy" section, separate from PMM frameworks. Future home for additional PM and sales books as corpus evolves toward GTM Sherpa.

**Chunking:** Same as Layer 1 books.

---

## Layer 1c: Podcasts (3 source types)

YouTube transcript ingestions from product leaders, marketers, and GTM experts. Three-way classification:

### podcast_pm — Product Strategy Conversations
**Documents:** 118 (pending ingestion) + 42 (already ingested) | **Chunks:** ~1,539 (existing) + ~2,700 (pending)

Product management episodes from Lenny's Podcast: product strategy, leadership, team building, product vision, roadmaps, scaling.

Notable: Marty Cagan (SVPG), Brian Chesky (Airbnb), Yuhki Yamashita (Figma CPO), Claire Hughes Johnson (Stripe), Hamilton Helmer (7 Powers), Richard Rumelt (Good Strategy Bad Strategy), Stewart Butterfield (Slack)

### podcast_pmm — GTM & Marketing Conversations
**Documents:** 357 (pending ingestion) | **Chunks:** ~5,000 (pending)

- **Lenny's GTM episodes (90):** April Dunford (positioning), Andy Raskin (strategic narrative), Elena Verna (PLG, 4 episodes), Madhavan Ramanujam (pricing), Christopher Lochhead (category design), Rory Sutherland (marketing psychology), Seth Godin, Emily Kramer (MKT1), Sean Ellis (growth hacking)
- **PMA episodes (267):** Pure product marketing — positioning, messaging, CI, sales enablement, GTM strategy, pricing, personas, product launches, win-loss analysis

### podcast_ai — AI Product & GTM Insights
**Documents:** 66 (pending ingestion) | **Chunks:** ~1,500 (pending)

AI-specific episodes that surface only on AI-related queries. AI product strategy, AI PMs, AI-native companies, AI adoption, AI GTM.

Notable: Kevin Weil (OpenAI CPO), Mike Krieger (Anthropic CPO), Tomer Cohen (LinkedIn CPO on AI disruption), Paul Adams (Intercom CPO on AI strategy), Julie Zhuo (managing AI), Aman Khan (becoming an AI PM)

**STATUS: 541 episodes classified, pending OpenAI embedding quota refresh. Run `python3 ingest_podcasts.py` when quota available.**

**Chunking:** Custom transcript chunker — paragraph-splitting at ~600 tokens with sentence-level fallback. Do NOT use blog_processor (exceeds 8K OpenAI embedding limit on wall-of-text transcripts).

**Retrieval:** Surfaces under "### Product & GTM Conversations" section.

---

## Layer 2: Sharebird AMAs (Practitioner Experience)

**source_type:** `ama` | **Documents:** 532 | **Chunks:** 2,350

Practitioner Q&A from PMMs at Salesforce, Adobe, Shopify, Atlassian, Twilio, Toast, HubSpot, Figma, and 500+ others. Covers positioning, competitive intel, launches, pricing, stakeholder management, career growth.

**Chunking:** Q&A pairs kept atomic, packed up to 600 target tokens (max 800).

---

## Layer 3: PMA Blogs (Tactical Guides)

**source_type:** `blog` | **Documents:** 827 | **Chunks:** 11,016

**Cleaned (2026-04-07 audit):** Removed 86 docs — duplicate articles (3x ingestions from overlapping scrape batches), junk entries (".Md" broken files), and PMA self-promotion pages (ambassador programs, influencer listicles, partner perks).

Product Marketing Alliance editorial content: how-to playbooks, templates, competitive analysis guides, launch checklists, messaging frameworks, expert interviews.

**Chunking:** Split by markdown headers (H1-H3), paragraph-split within sections. Target: 800 tokens, max: 1000, overlap: 100 tokens.

---

## Layer 4: Substacks

**source_type:** `substack` | **Documents:** 23 | **Chunks:** 117

Newsletter content from PMM practitioners. Same chunking as PMA blogs.

---

## Layer 5: Marketing Thought Leaders (added 2026-04-07)

**source_type:** `blog_external` | **Documents:** 790 | **Chunks:** 5,291

Curated from 1,594 scraped articles. Classified by topic relevance — only 30% (483) passed the quality filter. Scraped via free RSS feed pagination (zero API cost). Ingested 2026-04-07.

| Author | Documents | Chunks | Topics Kept | Topics Excluded |
|---|---|---|---|---|
| **Ann Handley** | 173 | 508 | Writing craft, voice, content strategy, AI+writing, marketing authenticity | Gift guides, personal essays, holiday posts |
| **Mark Schaefer** | 253 | 1,293 | Marketing strategy/philosophy, community, thought leadership, AI+marketing, attention economy | Personal travel, holiday stories, book promos |
| **Neil Patel** | 54 | 1,052 | AI+marketing, measurement/analytics, growth/ABM, marketing strategy | SEO how-tos, platform tutorials, tool reviews, basic explainers |
| **Geoffrey Moore** | 2 | 7 | AI adoption lifecycle (Crossing the Chasm applied to agentic AI), customer outcomes & stakeholder mapping | Manual picks from Obsidian web clips |
| **Mari Smith** | 1 | 7 | AI as catalyst for human transformation | Facebook tactics, social scoop roundups, platform-specific content |
| **Kyle Poyar** | 140 | 769 | SaaS pricing, packaging, PLG benchmarks, usage-based models, expansion revenue, GTM economics | Substack meta-posts, announcements |
| **Elena Verna** | 61 | 298 | PLG strategy, growth loops, retention, product-led sales, monetization, activation | Career/personal posts, paywalled snippets |
| **Wes Bush** | 106 | 1,417 | PLG frameworks, self-serve onboarding, freemium/trial strategy, conversion, product-qualified leads | — |

**Scraper location:** `/Users/abhishekratna/Documents/AOL AI/marketing-thought-leader-scrapes/`
**Classifier manifest:** `ingest_manifest.json` (483 ingest, 1,113 skip)
**Ingestion script:** `ingest_to_pmmsherpa.py`

**Retrieval integration:** `formatContextForPrompt()` in `src/lib/rag/retrieval.ts` groups these under "### Marketing Thought Leaders" section, separate from PMA blogs.

**Chunking:** Same as PMA blog processor (target 800 tokens, max 1000, overlap 100).

### Pending
- **SparkToro (Rand Fishkin):** 452 articles. RSS has snippets only — requires Jina Reader (~1.8M tokens, within free tier). Not yet scraped.
- **Greg Kihlstrom:** 300 articles. Deferred — his robots.txt explicitly blocks AI bots.
- **Neil Patel expansion:** Currently capped at 500 most recent. Full archive is 1,500+ via RSS pagination.
- **Mark Schaefer expansion:** Currently capped at 500 most recent. Full archive is 2,667.

---

## Ingestion Pipeline

| Step | Tool | Cost |
|---|---|---|
| Discovery | Sitemap XML parsing | Free |
| Content fetch (most blogs) | RSS `?paged=N` pagination | Free |
| Content fetch (SparkToro) | Jina Reader `r.jina.ai` | 10M free tokens |
| Classification | `classify.py` keyword matching | Free |
| Chunking | tiktoken `cl100k_base`, 800-token target | Free |
| Embedding | OpenAI `text-embedding-3-small` (512 dim) | ~$0.02 per 1M tokens |
| Storage | Supabase pgvector (HNSW index) | Included in plan |

**To add new content:** Add blog config to `config.yaml` → run `scrape.py` → run `classify.py` → review `ingest_manifest.json` → run `ingest_to_pmmsherpa.py`.

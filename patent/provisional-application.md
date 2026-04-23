# Provisional Patent Application

## Title of Invention

**System and Method for Domain-Specialized Retrieval-Augmented Generation Using Multi-Query Planning, Source-Type-Aware Context Layering, and Adaptive Multi-Source Fusion**

---

## Inventor

**Name:** Abhishek Ratna
**Address:** 110 194th Pl SW, Bothell, WA 98012
**Citizenship:** India, United States Permanent Resident

---

## Cross-Reference TO RELATED APPLICATIONS

Not applicable.

---

## FIELD OF THE INVENTION

The present invention relates to artificial intelligence systems for domain-specialized information retrieval and natural language generation. More specifically, the invention relates to a retrieval-augmented generation (RAG) system that employs a multi-query planning stage driven by a lightweight language model, a parallel multi-source retrieval architecture with hybrid semantic-keyword search, source-type-aware context layering for structured knowledge presentation, per-section token budget management, and adaptive web research augmentation to produce expert-quality responses within a specialized professional domain.

---

## BACKGROUND OF THE INVENTION

Retrieval-augmented generation (RAG) systems enhance large language model (LLM) outputs by providing relevant retrieved context from external knowledge bases. Existing RAG implementations suffer from several limitations:

1. **Single-query retrieval limitation.** Conventional RAG systems convert the user's input into a single embedding vector and perform a single retrieval pass. This approach fails to capture the multi-dimensional nature of complex professional queries that may require information spanning theoretical frameworks, practitioner experience, and tactical implementation guidance simultaneously.

2. **Flat context presentation.** Existing systems present retrieved chunks as an undifferentiated list, losing the epistemic provenance of each chunk. A passage from a foundational textbook, a practitioner's firsthand account, and a tactical blog post all carry different types of authority, yet conventional systems treat them identically.

3. **Inefficient context window utilization.** Current systems lack principled mechanisms for allocating finite context window capacity across multiple information sources (conversation history, retrieved knowledge, web research, user-provided URLs, file attachments), often leading to context overflow or suboptimal allocation.

4. **Static retrieval decisions.** Conventional systems either always or never augment retrieval with web search, lacking an intelligent mechanism to determine when external web research would add value versus when the internal knowledge base is sufficient.

5. **Domain-agnostic query processing.** General-purpose RAG systems do not account for domain-specific terminology, acronyms, and conceptual relationships that affect retrieval quality in specialized professional fields.

---

## SUMMARY OF THE INVENTION

The present invention provides a system and method for domain-specialized retrieval-augmented generation that addresses the above limitations through five interconnected innovations:

**A. Intelligent Multi-Query Planning.** A lightweight language model (distinct from the primary generation model) analyzes the user's query in the context of conversation history, URL content, and file attachments to generate multiple semantically diverse retrieval queries, each targeting a different dimension of the knowledge space. The planner simultaneously classifies user intent and determines whether web research augmentation is warranted.

**B. Multi-Query Parallel Retrieval with Deduplication.** The generated queries are executed in parallel against a hybrid search system combining semantic vector similarity and keyword matching with configurable weighting. Results are deduplicated at the chunk level, retaining the highest relevance score for each unique chunk, and the top-K results across all queries are selected.

**C. Source-Type-Aware Context Layering.** Retrieved chunks are grouped by their epistemic source type (e.g., theoretical frameworks, practitioner experience, tactical guides) and presented to the generation model as structured, labeled knowledge layers rather than a flat list. This preserves the provenance and authority type of each piece of knowledge.

**D. Token-Budgeted Multi-Source Context Assembly.** A context assembly module allocates fixed token budgets to each information source (conversation history, RAG-retrieved knowledge, scraped URL content, web research results, file attachments) and applies truncation strategies within each budget, ensuring optimal utilization of the generation model's context window.

**E. Domain-Specific Query Expansion.** A terminology expansion module enriches user queries with domain-specific expansions of acronyms and abbreviations before embedding generation, improving retrieval recall for specialized professional queries.

---

## DETAILED DESCRIPTION OF THE INVENTION

### 1. System Architecture Overview

The system comprises the following major components, operating in a three-phase pipeline architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INPUT                               │
│  (message + conversation_id + model_selection + attachments) │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   PHASE 1   │  Parallel Input Gathering
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
     ┌────────────┐ ┌───────────┐ ┌──────────┐
     │ Conversation│ │    URL    │ │Attachment │
     │  History    │ │  Scraper  │ │ Processor │
     │  Retrieval  │ │           │ │           │
     └──────┬─────┘ └─────┬─────┘ └─────┬────┘
            │             │              │
            └──────┬──────┘──────────────┘
                   │
            ┌──────▼──────┐
            │   PHASE 2   │  Query Planning + Parallel Retrieval
            └──────┬──────┘
                   │
            ┌──────▼──────┐
            │   QUERY     │  Lightweight LLM analyzes full context
            │   PLANNER   │  → 2-3 RAG queries + web research decision
            └──────┬──────┘
                   │
          ┌────────┼────────┐
          ▼                 ▼
  ┌───────────────┐  ┌──────────────┐
  │  Multi-Query  │  │   Adaptive   │
  │  Hybrid RAG   │  │ Web Research │
  │  Retrieval    │  │  (if needed) │
  └───────┬───────┘  └──────┬───────┘
          │                 │
          └────────┬────────┘
                   │
            ┌──────▼──────┐
            │   PHASE 3   │  Context Assembly + Generation
            └──────┬──────┘
                   │
            ┌──────▼──────────────────────────┐
            │  TOKEN-BUDGETED CONTEXT ASSEMBLY │
            │                                  │
            │  ┌──────────────────────────┐    │
            │  │ Conversation History     │ 12K│
            │  │ RAG Context (layered)    │  8K│
            │  │ URL Content              │  8K│
            │  │ Web Research             │  4K│
            │  │ Attachments              │  6K│
            │  └──────────────────────────┘    │
            └──────────────┬───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  SOURCE-TYPE │
                    │  AWARE       │
                    │  CONTEXT     │
                    │  LAYERING    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  STREAMING  │
                    │  LLM        │
                    │  GENERATION │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   SSE       │
                    │   OUTPUT    │
                    │   STREAM    │
                    └─────────────┘
```

### 2. Phase 1: Parallel Input Gathering

Upon receiving a user request containing a text message, an optional conversation identifier, a model selection, and optional file attachments, the system initiates three parallel operations:

**2.1 Conversation History Retrieval.**
The system retrieves the most recent messages from the identified conversation from a database, ordered by creation time in descending order with a configurable limit (e.g., 10 messages). The results are reversed to chronological order and then subjected to a token-budget-aware truncation algorithm:

```
function truncateHistory(history, tokenBudget):
  charBudget = tokenBudget × 4  // approximate token-to-character ratio
  totalChars = 0
  result = []
  for i = history.length - 1 to 0:  // walk backwards from most recent
    msgChars = history[i].content.length
    if totalChars + msgChars > charBudget: break
    totalChars += msgChars
    result.prepend(history[i])
  return result
```

This ensures that the most recent conversational context is preserved within the allocated token budget, with older messages dropped first.

**2.2 URL Content Extraction.**
The system detects URLs in the user's message using pattern matching, extracts up to a configurable maximum number of URLs (e.g., 3), and scrapes each URL's main content in parallel using an external scraping service. The scraped content is truncated to the URL token budget allocation.

**2.3 Attachment Processing.**
File attachments are processed to extract text content, with each attachment's extracted text labeled with the file name. The combined attachment context is truncated to the attachment token budget allocation.

### 3. Phase 2: Intelligent Query Planning and Parallel Retrieval

**3.1 The Query Planner.**

The query planner is a central innovation of this system. It employs a lightweight, fast language model (distinct from and smaller than the primary generation model) to analyze the full context of the user's request and produce a structured query plan.

The planner receives as input:
- The user's current message
- Recent conversation history (last N turns, with content truncated for efficiency)
- A preview of scraped URL content (first M characters)
- A preview of attachment content (first M characters)

The planner is instructed with a detailed system prompt that encodes knowledge of the system's knowledge base composition, including:
- The types of sources available (e.g., foundational books, practitioner interviews, tactical articles)
- What the knowledge base is strong on (frameworks, war stories, templates, career guidance)
- What the knowledge base does NOT contain (current market data, real-time competitive intelligence, live benchmarks)

The planner produces a structured output containing:

**(a) 2-3 RAG Queries:** Each query targets a DIFFERENT dimension of knowledge relevant to the user's request. For example, for a query about "how to position an AI product," the planner might generate:
- Query 1: "AI product positioning framework category design" (targeting theoretical frameworks)
- Query 2: "positioning AI product practitioner experience real-world example" (targeting practitioner accounts)
- Query 3: "AI product launch go-to-market messaging strategy" (targeting tactical guides)

The planner is specifically instructed to:
- NOT generate near-duplicate queries
- NOT simply rephrase the user's message
- Extract underlying professional domain concepts
- Target different knowledge types per query
- Strip conversational filler from queries
- Incorporate context from conversation history, URLs, and attachments

**(b) Web Research Decision:** The planner determines whether to invoke external web search based on:
- YES triggers: specific companies/competitors mentioned, current market data needed, recent events referenced, pricing/benchmarks requested, references to recent time periods
- NO triggers: questions about frameworks/methodology, deliverable/template requests, career advice, reviewing user's own work, conceptual questions the knowledge base covers well
- When YES, the planner generates a web search query optimized for information the knowledge base cannot provide

**(c) Intent Classification:** One of {guidance, deliverable, review, career, general}

**(d) Context Summary:** A one-sentence summary of the user's situation and need

**3.2 Multi-Query Parallel Hybrid Retrieval.**

The RAG queries from the query plan are executed in parallel. Each query goes through the following process:

**3.2.1 Domain-Specific Query Expansion.**
Before embedding generation, each query is processed through a domain-specific expansion module that:
- Detects domain acronyms and abbreviations in the query text (e.g., "PMM", "GTM", "JTBD", "ICP", "PLG", "CAC", "LTV", "NPS", "B2B", "SaaS")
- Appends the full expansion to the query string (e.g., "PMM" → appends "product marketing manager")
- This enrichment improves embedding quality for domain-specific queries where acronyms may not have strong representation in the embedding model's training data

**3.2.2 Embedding Generation.**
The expanded query is converted to a dense vector embedding using a text embedding model with a specified dimensionality (e.g., 512 dimensions).

**3.2.3 Hybrid Search Execution.**
Each query embedding is submitted to a hybrid search function that combines:
- **Semantic similarity search** using vector distance (e.g., cosine similarity) against stored chunk embeddings, weighted at a configurable factor (e.g., 0.7)
- **Keyword matching** using full-text search against the original chunk text, weighted at a complementary factor (e.g., 0.3)

The hybrid search returns chunks with a combined score above a configurable threshold (e.g., 0.4), up to a configurable per-query limit (e.g., 6 chunks).

Each returned chunk contains:
- Content text
- Combined relevance score
- Document metadata (document ID, title, source type, author, page number, section title)
- Source-specific metadata (speaker role for interviews, question text for Q&A content, URL for web sources)

**3.2.4 Cross-Query Deduplication and Ranking.**
Results from all parallel queries are merged using a chunk-level deduplication algorithm:

```
chunkMap = new Map()
for each result in allQueryResults:
  for each chunk in result.chunks:
    existing = chunkMap.get(chunk.id)
    if not existing OR chunk.score > existing.score:
      chunkMap.set(chunk.id, chunk)

// Sort by score descending and take top K
finalChunks = chunkMap.values()
  .sort(by score descending)
  .slice(0, topK)
```

This ensures that chunks appearing in multiple query results are retained with their highest relevance score, and the final set represents the best-matching chunks across all query dimensions.

**3.3 Adaptive Web Research (Parallel with RAG).**

When the query planner determines that web research is needed, an external web search is executed in parallel with the RAG retrieval. The web search uses the planner's optimized query and returns:
- Synthesized web content
- Web citations (title, URL, date, snippet)
- Related follow-up questions

The web research result is truncated to its allocated token budget.

### 4. Phase 3: Source-Type-Aware Context Assembly and Streaming Generation

**4.1 Source-Type-Aware Context Layering.**

This is a key innovation. Rather than presenting retrieved chunks as a flat list, the system groups them by their epistemic source type and presents them as labeled knowledge layers:

```
Layer 1: "Frameworks & Theory"
  - Chunks from foundational books and theoretical sources
  - Each labeled with: document title, author, page number

Layer 2: "Practitioner Experience"
  - Chunks from practitioner interviews and Q&A sessions
  - Each labeled with: speaker name, role/company, original question

Layer 3: "Tactical Guides & Case Studies"
  - Chunks from how-to articles, case studies, and tactical content
  - Each labeled with: article title, publication source
```

Each chunk within a layer is formatted with its source attribution:
```
[Source N] "Document Title" by Author (Role) (Page X / Source Type)
[chunk content]
```

This layered presentation enables the generation model to:
- Distinguish between theoretical knowledge and practical experience
- Weigh different types of evidence appropriately
- Synthesize across knowledge layers when constructing responses
- Provide appropriate attribution based on source authority

**4.2 Token-Budgeted Multi-Source Context Assembly.**

The system assembles the final context from multiple sources, each allocated a specific token budget:

| Source | Token Budget | Character Budget (approx.) |
|--------|-------------|---------------------------|
| Conversation History | 12,000 | 48,000 |
| RAG-Retrieved Context | 8,000 | 32,000 |
| Scraped URL Content | 8,000 | 32,000 |
| Web Research Results | 4,000 | 16,000 |
| File Attachments | 6,000 | 24,000 |

Each source is independently truncated to its budget before assembly. The truncation algorithm:
```
function truncateToTokenBudget(text, tokenBudget):
  charBudget = tokenBudget × 4
  if text.length <= charBudget: return text
  return text.slice(0, charBudget) + "\n\n[Content truncated to fit context window]"
```

The assembled context is structured as:
1. Source-type-layered RAG context (Section 4.1)
2. Web research context with citation list (if available)
3. Attachment content with file labels (if available)

The scraped URL content is injected into the system prompt separately, ensuring the generation model treats it as primary context provided by the user.

**4.3 Streaming Response Generation.**

The assembled context, system prompt (incorporating domain expertise instructions and model-specific directives), conversation history, and user message are provided to the selected generation model. The response is streamed to the client using Server-Sent Events (SSE) with the following event types:

1. `status` events — progress updates during retrieval and generation phases
2. `citations` events — RAG citation metadata sent before the response text
3. `expandedResearch` events — web research data with web citations (when applicable)
4. `text` events — incremental response text chunks
5. `done` event — signals completion

### 5. Knowledge Base Structure

The system operates on a knowledge base stored in a relational database with vector extensions, comprising:

**Documents table:** Metadata for each source document including title, source type (book/blog/ama), author, speaker role, and URL.

**Chunks table:** Text segments derived from documents, each stored with:
- Content text
- Vector embedding (512-dimensional)
- Context header for hierarchical document navigation
- Page number (for book sources)
- Section title
- Question text (for Q&A/interview sources)
- Token count

The chunks table is indexed using an HNSW (Hierarchical Navigable Small World) vector index for efficient approximate nearest neighbor search.

**Hybrid search function:** A database function that:
1. Computes semantic similarity between the query embedding and chunk embeddings
2. Computes keyword relevance using full-text search
3. Combines scores with configurable weighting: `combined_score = (semantic_weight × vector_similarity) + ((1 - semantic_weight) × keyword_relevance)`
4. Returns chunks above the threshold, ordered by combined score

### 6. Multi-Model Provider Abstraction

The system supports multiple LLM providers through a unified abstraction layer:
- A model configuration registry mapping provider keys to model IDs, display names, capability flags (thinking mode, web search support), and provider-specific parameters
- A model factory that instantiates the appropriate provider client based on selection
- A message builder that constructs the system prompt with retrieved context, model-specific instructions, and conversation history in the format required by each provider
- A separate lightweight model designated for internal system tasks (query planning) that is not exposed to end users, optimizing for speed and cost on planning operations

---

## CLAIMS

(Note: Formal claims will be drafted in the non-provisional application. The following represent the primary inventive concepts disclosed herein.)

1. A computer-implemented method for domain-specialized retrieval-augmented generation, comprising:
   (a) receiving a user query along with associated context including conversation history, URL references, and file attachments;
   (b) processing the user query and associated context through a first language model to generate a query plan comprising a plurality of semantically diverse retrieval queries, each targeting a different dimension of a domain knowledge space;
   (c) executing the plurality of retrieval queries in parallel against a hybrid search system combining semantic vector similarity and keyword matching;
   (d) deduplicating retrieved results across queries at the chunk level, retaining the highest relevance score for each unique chunk;
   (e) grouping the deduplicated results by source type into structured knowledge layers;
   (f) assembling the layered results with other context sources according to per-source token budgets; and
   (g) generating a response using a second language model provided with the assembled layered context.

2. The method of claim 1, wherein step (b) further comprises the first language model determining whether external web research is warranted based on analysis of what the internal knowledge base can and cannot provide for the given query.

3. The method of claim 1, wherein the retrieval queries in step (c) are each preprocessed through a domain-specific query expansion module that detects and expands domain acronyms and abbreviations before embedding generation.

4. The method of claim 1, wherein the structured knowledge layers in step (e) comprise at least: a theoretical frameworks layer, a practitioner experience layer, and a tactical guidance layer, each preserving source attribution metadata.

5. The method of claim 1, wherein the first language model used for query planning is a lightweight model distinct from and smaller than the second language model used for response generation.

6. A system for domain-specialized information retrieval and response generation, comprising:
   (a) a query planning module employing a lightweight language model to analyze user input in context and produce multiple semantically diverse retrieval queries and an adaptive web research decision;
   (b) a parallel hybrid retrieval module executing the queries against a knowledge base using combined semantic and keyword scoring with cross-query deduplication;
   (c) a source-type-aware context layering module that groups retrieved knowledge by epistemic source type;
   (d) a token-budgeted context assembly module that allocates and enforces per-source token limits across conversation history, retrieved knowledge, web content, web research, and file attachments; and
   (e) a streaming generation module that produces responses using the assembled layered context via server-sent events.

---

## ABSTRACT

A system and method for domain-specialized retrieval-augmented generation (RAG) that improves upon conventional single-query, flat-context RAG systems. The invention employs a lightweight language model as a query planner to decompose user queries into multiple semantically diverse retrieval queries targeting different knowledge dimensions, while simultaneously determining whether web research augmentation is warranted. Retrieved chunks undergo cross-query deduplication and are organized into source-type-aware knowledge layers (theoretical frameworks, practitioner experience, tactical guides) that preserve epistemic provenance. A token-budgeted context assembly module allocates finite context window capacity across multiple information sources. Domain-specific query expansion enriches queries with professional terminology before embedding generation. The system produces streaming responses via a primary generation model provided with structured, layered, and budget-optimized context, yielding more comprehensive and accurately sourced outputs than conventional flat RAG approaches.

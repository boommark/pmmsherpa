# MCP Phase 1.5 Research: query_pmm_sherpa & validate_artifact

## Executive Summary

Both tools reuse the existing `/api/chat` pipeline non-streaming. `query_pmm_sherpa` is high-leverage: it wraps the full RAG → system prompt → LLM → voice stack into a function callable from any MCP client, making Sherpa available everywhere. `validate_artifact` follows a simpler pattern: classify → retrieve rubric context → critique prompt.

**Recommended architecture:** Extract a shared `runSherpaChat()` helper in `src/lib/mcp/helpers.ts` that encapsulates query planning, multi-query RAG, system prompt assembly, and non-streaming LLM call. Both tools invoke this helper with different system prompts or post-processing.

---

## Key Findings

### 1. Chat Pipeline Reusability (src/app/api/chat/route.ts:286–844)

The pipeline is modular and almost entirely reusable non-streaming:

| Phase | Reusable? | Notes |
|-------|-----------|-------|
| Query planning (line 487) | ✅ Yes | `planQueries()` from `src/lib/rag/query-planner.ts` — takes message, history, scraped content, attachments. Returns RAG queries + web research decision. **No streaming needed.** |
| Multi-query RAG (line 510) | ✅ Yes | `multiQueryRetrieve(queries, topK, userId, intent)` from `src/lib/rag/retrieval.ts`. Returns `{ chunks, totalTokens }`. **No streaming dependency.** |
| System prompt assembly (line 645) | ✅ Yes | `buildMessages(message, context, model, history)` from `src/lib/llm/provider-factory.ts` calls `getSystemPromptParts()` from `src/lib/llm/system-prompt.ts`. **Works non-streaming.** |
| LLM call (line 698) | ✅ Partial | Uses `streamText()` from AI SDK. For MCP, replace with `generateText()` (same SDK, no stream). Takes same model + messages + system prompt. |
| Citation extraction (line 549) | ✅ Yes | `extractCitations(chunks)` in `src/lib/rag/retrieval.ts` returns array of `Citation` objects. |

**Tight coupling to SSE streaming:** Only in lines 258–280 (stream setup) and 754–769 (text streaming loop). Everything else is pure async logic.

### 2. Exact Function Signatures Needed

**RAG retrieval:**
```typescript
multiQueryRetrieve(
  queries: string[],
  topK: number = 10,
  userId?: string,
  intent?: QueryPlan['intent']  // 'guidance' | 'deliverable' | 'review' | 'career' | 'general'
): Promise<RetrievalResult>

// Returns:
{ chunks: RetrievedChunk[], totalTokens: number }

// Citations from chunks:
extractCitations(chunks: RetrievedChunk[]): Citation[]
```

**System prompt:**
```typescript
getSystemPromptParts(
  retrievedContext: string,
  modelName: ModelProvider,
  scrapedUrlContent?: string
): { staticPart: string; dynamicPart: string }
```

**LLM (non-streaming):**
```typescript
// Replace streamText with:
import { generateText } from 'ai'

const result = await generateText({
  model: llmModel,
  messages: [...systemMessages, ...allMessages],
  maxOutputTokens: 8192,
  temperature: 0.7,
  // ... same provider options ...
})

// result.text contains final response
// result.usage has { inputTokens, outputTokens }
```

**Model retrieval:**
```typescript
getModel(provider: ModelProvider)  // Returns LanguageModel from AI SDK
```

**Query planning:**
```typescript
planQueries(input: {
  message: string
  conversationHistory?: Array<{ role, content }>
  scrapedUrlContent?: string
  attachmentContext?: string
}, userId: string): Promise<QueryPlan>

// Returns:
{
  ragQueries: string[],
  webResearch: { needed, query, reason },
  webSearch: { needed, query, reason },
  intent: 'guidance' | 'deliverable' | 'review' | 'career' | 'general',
  contextSummary: string
}
```

### 3. Output Format & structuredContent

The `/api/chat` endpoint returns citations and expanded research in SSE events (lines 719–737). For MCP, both tools should return `structuredContent` to match `searchCorpusTool`:

```typescript
// search_corpus returns (lines 165–184):
{
  content: [{ type: 'text', text: formattedStr }],
  structuredContent: {
    chunks: [{
      id, content, similarity,
      source: { type, title, author, url, page_number, section_title, speaker_role, question }
    }]
  }
}
```

**For query_pmm_sherpa:**
```typescript
{
  content: [{ type: 'text', text: finalResponse }],
  structuredContent: {
    response: finalResponse,
    citations: Citation[],  // from extractCitations(chunks)
    chunks: RetrievedChunk[],  // for debugging/transparency
    usage: { inputTokens, outputTokens }
  }
}
```

**For validate_artifact:**
```typescript
{
  content: [{ type: 'text', text: critiqueSynthesis }],
  structuredContent: {
    critique: critiqueSynthesis,
    gaps: string[],  // key gaps found
    principles_cited: string[],  // PMM principles used in review
    recommendations: string[],  // actionable next steps
    confidence: 0.0–1.0  // how confident the review is
  }
}
```

### 4. usage Gating (src/app/api/chat/route.ts:154–254)

**MCP calls DO count against the monthly limit.** The gate check happens at the beginning of `/api/chat` and blocks before LLM.

For MCP tools, gate the same way:
1. Fetch user's tier and current message count (lazy-reset first if period has passed)
2. Check `messages_used_this_period >= getMonthlyLimitForTier(tier)`
3. If hit, return error before calling LLM
4. After successful response, call `supabase.rpc('increment_messages_used', { p_user_id })`

**Constants** (src/lib/constants.ts):
- `FREE_TIER_MONTHLY_LIMIT = 10`
- `STARTER_TIER_MONTHLY_LIMIT = 200`
- `Founder = Infinity` (bypass)

The gate logic is at lines 164–211 in route.ts. Extract it to `src/lib/usage-gate.ts` and reuse in MCP.

### 5. Artifact Classification & Rubric Retrieval

**No existing artifact classification logic.** Will build from scratch.

v1 artifact types (from tool schema):
- `positioning` — positioning statement, positioning brief, value prop
- `messaging` — messaging framework, messaging pillars, elevator pitch
- `launch_plan` — go-to-market plan, launch playbook, launch brief
- `other` — fallback (sales pitch, battle card, customer research, etc.)

**Rubric retrieval strategy:**
1. Classification: LLM classifies artifact type + extracts key themes (1–2 themes per type)
2. RAG query: `"[artifact_type] best practices" + themes` → retrieve rubric chunks
3. Example query for positioning: `"positioning statement framework audience value proposition competitive context"`
4. Retrieve ~12–15 chunks (higher topK since we're looking for rubric, not answers)
5. Run critique prompt against artifact + rubric chunks

**No pre-built "rubric" table exists.** The knowledge base itself IS the rubric — position statements, messaging frameworks, launch case studies, etc. are all mixed in the chunks. Query the same way `search_corpus` does.

### 6. Tracing & Observability

**Both tools are wrapped in `startMcpObservation()`** (src/lib/mcp/tracing.ts:38–71).

Pattern (already used by `searchCorpusTool` handler):
```typescript
return startMcpObservation(
  `mcp.tool.query_pmm_sherpa`,  // or validate_artifact
  {
    userId: ctx.auth.userId,
    sessionId: ctx.session.id,
    toolName: 'query_pmm_sherpa',
    input: { query, model, ... },
    metadata: { tagNames: ['surface:mcp'] }  // inherited from span setup
  },
  async (span) => {
    // tool logic here
    
    // Update span with output
    span.update({
      output: finalResult,
      metadata: { ... extra tracking ... }
    })
    setActiveTraceIO({ input, output: finalResult })
    
    return result
  }
)
```

**Nested LLM calls auto-trace** via `experimental_telemetry: { isEnabled: true }` in AI SDK. OTel propagation is handled by Langfuse integration in `instrumentation.ts`.

**Trace naming convention:**
- `mcp.tool.query_pmm_sherpa` — outer span for the tool handler
- `generateText` → auto-traced by AI SDK as a child span
- Both rolled up under the same trace ID for Langfuse correlation

### 7. Web Research & Citations

**query_pmm_sherpa does NOT do Perplexity research** — only RAG. To keep scope tight, assume v1 only uses the knowledge base. If user asks for current market data, RAG will return less-relevant results, which is fine.

**Rationale:** Web research adds latency and complexity. v1 focuses on Sherpa's unique value: deep PMM knowledge. Web research can be v1.5 feature.

**Citation format:** Use same `Citation` type as `/api/chat`. Currently stored as JSONB in `messages.citations`:
```typescript
export interface Citation {
  source: string
  source_type: SourceType
  author: string | null
  url: string | null
  page_number: number | null
  section_title: string | null
  question: string | null
  speaker_role: string | null
}
```

### 8. Edge Cases & Error Handling

| Case | Handling |
|------|----------|
| **0 RAG chunks found** | Don't call LLM. Return error: "No relevant knowledge found." This is a signal the query is outside Sherpa's domain. |
| **RAG returns 0.3 similarity chunks** | Still call LLM (may synthesize). Log a warning in observability. Chunk quality is lower but not a hard failure. |
| **LLM API error (timeout, rate limit, invalid key)** | Catch in `generateText()`, return `{ content: [{ type: 'text', text: 'LLM service unavailable' }], isError: true }`. Log to Langfuse. |
| **User hits monthly limit** | Return before RAG/LLM. Error message mirrors `/api/chat` (line 240–248). Client gets structured error response. |
| **Artifact too large (>20K chars)** | Schema already caps at 20K. Truncate gracefully if needed. |
| **Unknown artifact_type** | Treat as `'other'`. Run generic review without type-specific rubric. |

### 9. File-by-File Change Summary (No Implementation)

**Create:**
1. `src/lib/mcp/helpers.ts` — `runSherpaChat()` helper wrapping the pipeline
2. `src/lib/usage-gate.ts` — Extract & reuse gating logic from route.ts
3. `.planning/mcp-phase-1.5/RESEARCH_query_pmm_sherpa.md` — This brief

**Edit:**
1. `src/lib/mcp/tools.ts` — Replace two `notImplemented()` stubs with real handlers
2. `src/app/api/chat/route.ts` — Extract gating logic to usage-gate.ts (optional, can be done v1.5 or v2)

**No database schema changes needed.** Citations already JSONB in `messages` table.

### 10. Open Questions for Build Phase

1. **Query planner intent classification:** For `validate_artifact`, should we force `intent: 'review'`, or let the planner decide? (Probably force it — we always want review-focused RAG boosts.)

2. **Artifact source types boost:** The planner has `INTENT_BOOSTS` for each intent + source type combo (e.g., 'review' boosts AMA, blog, books). Should artifact validation use intent='review' boost, or add a new artifact-specific boost (e.g., boost 'positioning' book excerpts when reviewing positioning)?

3. **Conversation history in MCP:** `query_pmm_sherpa` schema allows `conversation_id`. Should we fetch history from the database, or expect the client to pass full history in the request? (Recommend: fetch from DB if conversationId provided, else use empty history.)

4. **Model selection:** Both tools accept `model` param (enum: 'opus', 'sonnet', 'gemini-pro'). **Current MODEL_CONFIG only has 'claude-sonnet' and 'gemini-3-pro'** — no Opus. Do we add Opus, or hardcode Sonnet for MCP v1? (Recommend: hardcode Sonnet for now, allow model selection in v1.5.)

5. **Critique depth:** For `validate_artifact`, is "find gaps + give feedback" sufficient, or do we want a scoring rubric (e.g., "positioning clarity: 7/10, differentiation: 5/10")? (Recommend: skip scoring v1, just critique + recommendations.)

6. **Claude Desktop UI compatibility:** MCP spec allows `structuredContent` but Claude Desktop may not render it. Should we mirror the format used by search_corpus (text + structured together), or are we OK with structured-only output? (Recommend: always include text in `content[0]`, let Desktop decide what to show.)

---

## Architecture Recommendation

### Single `runSherpaChat()` Helper

**Location:** `src/lib/mcp/helpers.ts`

**Signature:**
```typescript
interface RunSherpaChatInput {
  message: string
  model: ModelProvider
  userId: string
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  // Optional overrides for testing/special cases:
  customSystemPromptOverride?: string
  skipWebResearch?: boolean
}

async function runSherpaChat(input: RunSherpaChatInput): Promise<{
  text: string
  citations: Citation[]
  chunks: RetrievedChunk[]
  usage: { inputTokens: number; outputTokens: number }
}>
```

**What it does:**
1. Call `planQueries()`
2. Call `multiQueryRetrieve()`
3. Call `buildMessages()`
4. Call `generateText()` (non-streaming)
5. Return text + citations + usage

**Both tools wrap this:**

**query_pmm_sherpa handler:**
- Parse args (query, model, conversation_id)
- Fetch conversation history if provided
- Call `runSherpaChat()`
- Return text + structured citations/chunks

**validate_artifact handler:**
- Parse args (artifact_text, artifact_type, context)
- Classify artifact + extract themes
- Query RAG for rubric chunks
- Assemble critique system prompt
- Call `runSherpaChat()` with custom system prompt
- Parse response for gaps/recommendations
- Return critique + structured output

---

## Summary of Reusability

- ✅ **RAG pipeline**: 100% reusable (retrieveContext, multiQueryRetrieve, formatContextForPrompt, extractCitations)
- ✅ **System prompt assembly**: 100% reusable (buildMessages, getSystemPromptParts)
- ✅ **Query planning**: 100% reusable (planQueries)
- ✅ **LLM invocation**: 95% reusable (switch streamText → generateText)
- ✅ **Usage gating**: ~80% reusable (same logic, extract to shared function)
- ✅ **Tracing**: 100% reusable (startMcpObservation pattern already established)
- ✅ **Citations**: 100% reusable (Citation type already defined)

**Total effort to implement:** Extract 1 helper, update 2 tool stubs. No schema changes. No LLM retrain. Low risk.

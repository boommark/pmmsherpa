# PMM Sherpa MCP — Token Economics

**Source:** Langfuse `surface:mcp` traces (342 total, 125 are LLM tool calls; 217 are transport spans). Pulled 2026-05-07. Pricing constants: Sonnet 4.6 ($3 in / $15 out / $3.75 cache-create / $0.30 cache-read per M); OpenAI text-embedding-3-small ($0.02/M).

## Headline cost-per-call

| Tool | Avg cost/call | p50 | p95 |
|---|---|---|---|
| **ask_sherpa** | **$0.0152** | $0.0122 | $0.0350 |
| **draft_artifact** | **$0.0357** | $0.0324 | $0.0448 |
| **get_feedback** | **$0.0123** | $0.0112 | $0.0216 |

(Filtered to traces where the LLM actually ran — `totalCost > 0`. Older `query_pmm_sherpa` / `validate_artifact` traces with zero cost are pre-LLM tool versions and are excluded.)

Embedding cost per call is rounding error: ~150 tokens × $0.02/M = **$0.000003** (3 nano-dollars). It does not move the needle.

## Detailed table

| Tool | n | Avg uncached in | Avg cache-create | Avg cache-read | Avg output | Cache hit rate | Avg LLM cost | p50 cost | p95 cost |
|---|---|---|---|---|---|---|---|---|---|
| ask_sherpa | 18 | 0 | ~2,300 | ~3,300 | 530 | 60% | $0.0152 | $0.0122 | $0.0350 |
| draft_artifact | 3 | 1,440 | 0 | 5,538 | 1,980 | 100% | $0.0357 | $0.0324 | $0.0448 |
| get_feedback | 12 | 0 | 0 | 5,538 | 810 | 100% | $0.0123 | $0.0112 | $0.0216 |

Cached prefix is a stable **~5,538 tokens** across all three tools (system prompt + RAG context + tool schema). Cache reads cost essentially nothing ($1.66 per 1M tokens at 0.30/M is the input itself); the only meaningful prefix expense is the **first call in a 5-minute window**, which pays the cache-creation premium ($3.75/M → $0.021 per cold call just for the prefix).

## What dominates cost

**Output tokens dominate every cached call.** On a typical cached `ask_sherpa` call (~700 output tokens), output is $0.0105 of $0.0122 total — **86%**. The cache-read of 5,538 tokens contributes $0.0017 (14%). For `draft_artifact`, output is even more dominant: 2,000 output tokens at $15/M = $0.030, which is 84% of the $0.0357 average.

**Cache misses double cost.** Of the 18 `ask_sherpa` traces, 6 had cache_creation (cold-prefix cost ~$0.021 extra). The p95 of $0.035 is entirely a cold-cache call. Keeping cache warm via the 1-hour beta header would compress p95 toward p50.

**Embeddings are free.** OpenAI text-embedding-3-small at 150 tokens/call is below 5 nano-dollars — ignore in pricing math.

## Anomalies

- `ask_sherpa` cold-cache calls (~33% of sample) cost 2-3x warm calls — biggest pricing variable. Consider cache-warming on session start.
- `draft_artifact` only has n=3 traces. p95 of $0.0448 is one call with 4,130 uncached input tokens (a long user prompt). Real-world avg likely tracks $0.030-0.040.
- `get_feedback` is cheapest because outputs are short (~600-1,300 tokens, structured JSON-ish feedback).
- One outlier `query_pmm_sherpa` call cost $0.0282 (cold cache + 393 output) — within expected variance.

## Pricing implications (back-of-envelope)

- Median MCP session = 1 ask_sherpa + 1 get_feedback + 0.3 draft_artifact ≈ **$0.038/session**.
- 1,000 calls/month per power user = ~$15-25/month at current cost. Sustainable at $9.99 Starter only if calls are throttled or weighted (draft_artifact is 2-3x ask_sherpa).
- Recommend per-tool unit accounting in pricing model rather than flat call cap.

## Caveats

- Sample is small for `draft_artifact` (n=3) — re-run after more usage.
- Token detail came from 22 observation pulls (Langfuse rate limits blocked full pull); aggregate `totalCost` is from all 33 LLM-active traces.
- "Cache hit rate" measured on observations only (n=19); session-level rate may differ.

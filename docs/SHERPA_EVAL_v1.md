# Sherpa Eval v1 — Benchmark Plan

> **Status:** Design approved 2026-04-16. Implementation pending.
> **Owner:** Abhishek
> **Source:** Synthesis of research from Gemini + Claude, review of pmmsherpa codebase, web research on RAGAS / LLM-as-judge / HELM / golden datasets.

---

## 0. TL;DR

Build a 4-layer benchmark that compares **PMM Sherpa** against vanilla frontier LLMs **and** an agentic marketing baseline (Jasper or Copy.ai). Leverage the Braintrust infrastructure already wired into prod. Publish the methodology publicly as a positioning moat.

Measure 7 metrics across 35 prompts × 5 systems with ensemble LLM-as-judges, confidence intervals, and operationalized rubric anchors. Ship over a weekend.

---

## 1. Why this plan (what prior research missed)

### Gemini's plan — what we kept, what we cut

| Kept | Cut (and why) |
|---|---|
| Domain-specific pillars, not a single quality score | "Value-to-Feature Ratio," "Buzzword Density," "CTA Alignment" — none operationalized |
| RAGAS Faithfulness + Answer Relevancy | Human Edit Distance — infeasible for a weekend (needs 10 PMMs to attempt to publish) |
| Golden Set of ~20 prompts with ideal human responses | GEO (Generative Engine Optimization) Score — off-thesis; Sherpa advises humans, not generates AI-search content |
| — | Missed Sherpa's actual moat: citation faithfulness against a curated corpus |
| — | No LLM-as-judge bias mitigation (position bias, verbosity bias, self-preference) |

### Claude's plan — what we kept, what we added

| Kept | Added |
|---|---|
| 4-layer structure | Comparison against **agentic marketing systems** (Jasper / Copy.ai), not just vanilla LLMs |
| 3 vanilla baselines incl. GPT-5 + search | LLM-as-judge hygiene: ensemble judges, pairwise for comparison, position randomization, CIs |
| Publish methodology as positioning | Leverage **existing Braintrust infrastructure** instead of treating observability as new work |
| Weekend schedule | **Mode-aware rubrics** — PMM Sherpa has 3 voice registers (advisory / written artifact / spoken artifact) that must be judged differently |
| | **Operationalized rubric anchors** — every 1-5 metric has concrete anchor examples at 1/3/5 |

---

## 2. What pmmsherpa already has (leverage, don't rebuild)

1. **Braintrust wired into prod** ([src/app/api/chat/route.ts:15,737-761](../src/app/api/chat/route.ts)) — every turn logs input, output, RAG chunks, queries used, web research flag, latency, tokens, citations. Project: `PMMSherpa`.
2. **Three evaluable pipeline stages** (not a monolithic black box):
   - **Query planner** ([src/lib/rag/query-planner.ts](../src/lib/rag/query-planner.ts)) — Flash Lite → intent + 2-3 RAG queries + web-research decision
   - **Multi-query retrieval** ([src/lib/rag/retrieval.ts](../src/lib/rag/retrieval.ts)) — parallel hybrid search, dedup, grouping by source type
   - **Generation** with Layer 4 voice system prompt ([src/lib/llm/system-prompt.ts](../src/lib/llm/system-prompt.ts))
3. **8 source types** tagged per chunk (`book`, `book_pm`, `ama`, `blog`, `blog_external`, `podcast_pm`, `podcast_pmm`, `podcast_ai`) — enables **citation coverage** metric
4. **Three voice modes** detected at runtime — rubrics must branch on mode
5. **25K+ chunks / 1,983 docs** — enough signal for retrieval recall honestly
6. **No eval dataset or scorers yet** — greenfield on top of good infra

---

## 3. Core thesis

> Against both vanilla frontier LLMs and agentic marketing stacks, PMM Sherpa produces answers that are (a) more faithful to named PMM sources, (b) more specific and actionable, and (c) more mode-appropriate — at comparable or better latency.

---

## 4. The 4 benchmark layers

| Layer | What it proves | Audience | Automation |
|---|---|---|---|
| **L1. Pipeline RAG evals** (RAGAS) | Retrieval isn't garbage | ML buyers, investors | Full |
| **L2. Output quality rubric** (LLM-as-judge ensemble) | Answers are PMM-grade | PMMs, buyers | Full |
| **L3. Head-to-head** (5 systems) | Sherpa beats alternatives | Everyone | Full + 3 showcase examples |
| **L4. Live traffic proxy metrics** (Braintrust) | Real users find value | Investors, power users | Passive, from prod |

---

## 5. The systems being compared (9 total — decided 2026-04-16)

| # | System | Category | Baseline claim it refutes | Access |
|---|---|---|---|---|
| 1 | **GPT-5 vanilla** | Vanilla frontier | "Just use ChatGPT" | API |
| 2 | **Claude Opus 4.6 vanilla** | Vanilla frontier | "It's just the base model doing the work" | API |
| 3 | **GPT-5 + web search** | Vanilla + tools | "Use ChatGPT with browsing" | API |
| 4 | **Jasper (PMM workflow)** | Commercial agentic | "The brand-name AI marketing tool already does this" | 7-day trial |
| 5 | **Writer.com** | Commercial agentic | "The architecturally-closest AI tool does this" | Free trial |
| 6 | **Custom GPT + 7 PMM books** | DIY RAG on OpenAI | "Upload the books to ChatGPT yourself" | ChatGPT Plus / OpenAI Assistants API |
| 7 | **Gemini Gem + 7 PMM books** | DIY RAG on Google | "Use a Gem with the books uploaded" | Gemini API + file attachment |
| 8 | **Claude Project + 7 PMM books** | DIY RAG on Anthropic | "Use a Claude Project with the books uploaded" | Claude API + documents |
| 9 | **PMM Sherpa (prod)** | The hypothesis | — | Own `/api/chat` |

**DIY baselines book pack** (same 7 books uploaded to systems 6-8):
1. April Dunford — *Obviously Awesome*
2. April Dunford — *Sales Pitch*
3. Geoffrey Moore — *Crossing the Chasm*
4. Donald Miller — *Building a StoryBrand*
5. Al Ries & Jack Trout — *22 Immutable Laws of Marketing*
6. Maja Voje — *GTM Strategist*
7. Al Ramadan et al. — *Play Bigger*

This set tests "what if a motivated PMM uploaded the canonical PMM library themselves?" — the cheapest realistic alternative to buying Sherpa.

**Methodology note — systems 6-8:** These are consumer UI products. To ensure the benchmark tests the actual product a buyer would use (not an API approximation), we test against the **real UIs** — actual Custom GPT, actual Gemini Gem, actual Claude Project.

**Setup (one-time, manual, ~30 min each):**
1. Create Custom GPT in ChatGPT — upload 7 books, set PMM advisor instructions
2. Create Gemini Gem — same books, same instructions
3. Create Claude Project — same books, same instructions

**Running prompts — hybrid approach:**
1. Try browser automation first (`/browse` or `/connect-chrome` with imported cookies)
2. Fall back to semi-automated clipboard workflow if browser automation is fragile
3. API adapters kept as fast-iteration path for development re-runs, but published v1.1 numbers come from real UIs

**Why not API simulation:** Assistants API file_search ≠ Custom GPT retrieval. Gemini API file attachment ≠ Gem grounding. Claude API documents ≠ Project knowledge retrieval. A skeptic would catch this.

**Alternates considered and cut:** Copy.ai (less differentiated than Writer), HubSpot Breeze (agent suite, not a single advisor), Gong/Regie (sales-email-focused).

---

## 6. The prompt set — 35 prompts, 4 tiers

Each prompt carries metadata: `tier`, `mode`, `expected_sources[]`, `reference_answer`, `required_facts[]`.

- **Tier 1 — Framework knowledge (10)** — named framework questions, concept definitions. Advisory mode.
- **Tier 2 — Applied advisory (10)** — situational advice, mode-detecting questions. Advisory mode.
- **Tier 3 — Deliverables (10)** — positioning statement, messaging hierarchy, battlecard, launch plan, PRD→narrative, win/loss guide, analyst briefing, pricing page copy, teardown, objection script. Written artifact mode.
- **Tier 4 — Edge cases (5)** —
  - Current market data (tests web research trigger)
  - Subtly misapplied framework (does Sherpa correct it?)
  - Talk track (tests spoken-artifact mode)
  - Review/critique ("is this positioning statement good?")
  - Career advice (tests intent classification)

---

## 7. The scorers — 7 metrics

| # | Metric | Type | What it answers |
|---|---|---|---|
| 1 | **Context Precision** | RAGAS auto | Did retrieval fetch the right chunks? |
| 2 | **Faithfulness to corpus** | RAGAS auto | Are answer claims grounded in retrieved context? |
| 3 | **Citation accuracy** | Programmatic | Do cited authors/books exist in corpus? Does content match real chunks? **(Moat metric.)** |
| 4 | **Framework fidelity** (1-5) | LLM judge ensemble | Correctly applies named PMM frameworks vs generic advice? |
| 5 | **Specificity / Actionability** (1-5) | LLM judge ensemble | Can a PMM execute tomorrow? |
| 6 | **Voice quality — Layer 4 adherence** (1-5) | LLM judge ensemble | Conversational discovery, grounded references, no AI tells |
| 7 | **Mode match** (binary + LLM explanation) | Hybrid | Right voice register for the requested mode? |

**Cut from prior research:**
- Buzzword density, Value-to-Feature ratio, GEO score (Gemini) → folded into metric 6 or off-thesis
- Human Edit Distance (Gemini) → infeasible
- Anti-genericness, source attribution binary (Claude) → folded into 3 and 6

---

## 8. LLM-as-judge hygiene (the credibility firewall)

- **Ensemble judges:** Claude Opus 4.6 + GPT-5 score each output. Report Cohen's kappa inter-judge agreement.
- **Anchored rubrics:** every 1-5 metric includes concrete score anchors at 1 / 3 / 5 with 2 examples each.
- **Pairwise for comparison layer (L3):** Sherpa vs each baseline, **position randomized** — more stable than pointwise (Zheng et al.).
- **Pointwise for absolute quality tracking (L2):** only for regression detection over time.
- **95% bootstrap CIs** on all aggregates. 4.2 vs 3.8 with overlapping CIs is not a win.
- **No self-preference:** never use only Claude to judge Claude outputs.

---

## 9. L4 — Live traffic proxy metrics (free, from Braintrust)

Already logging these. Surface as buyer-facing:
- **Citation rate** — % of prod responses that cite a named author/framework
- **Web research trigger accuracy** — human-sample 50 prompts flagged `webResearch.needed`, measure how many actually benefited
- **Latency p50 / p95** — show it's not a laggy academic toy
- **Retry / regeneration rate** — proxy for quality dissatisfaction

---

## 10. What gets published (v1.1 — after internal v1 iteration)

**Ship plan:** internal v1 this weekend (private validation run + rubric tuning); publish v1.1 as public landing page after one iteration cycle.

Landing page at `pmmsherpa.com/eval`:

1. **Headline radar chart** — 6 systems × 7 metrics
2. **5 side-by-side showcase examples** — one per buyer objection:
   - **Framework application** — "Apply Crossing the Chasm to dev tools" (vanilla = generic adoption ladder; Sherpa = bowling pin with Moore reference)
   - **Current competitive intel** — "How is [real competitor] positioning against X?" (vanilla = training-data guess; Sherpa = Perplexity + Brave fresh fetch + framework lens)
   - **Deliverable quality** — "Write a battlecard for [scenario]" (vanilla = generic template fill; Sherpa = PMA structure + cited Dunford/Klue principles)
   - **Voice / mode** — "Give me a talk track for my launch keynote" (vanilla = essay prose; Sherpa = spoken-artifact mode with pause cues)
   - **Review / critique** — "Here's my positioning statement, critique it" (vanilla = sycophancy; Sherpa = Dunford 5-component audit)
3. **Methodology + raw data** — published prompts, rubric anchors, judge prompts, every score, every output
4. **Reproducibility repo** — public GitHub so anyone can rerun

This is the Anthropic / OpenAI model-card playbook applied to vertical AI. Nobody in PMM tooling does this.

---

## 11. Weekend implementation plan

### Saturday AM — Dataset (4h)
1. Write 35 prompts with metadata (tier, mode, expected_sources, required_facts, reference_answer)
2. Write rubric anchors for metrics 4-7 (score 1/3/5, 2 examples each)
3. Register dataset in Braintrust (`PMMSherpa` project → new dataset `sherpa-eval-v1`)

### Saturday PM — Harness (4h)
- New dir: `pmmsherpa/evals/`
- `run_systems.py` — orchestrator that runs 35 prompts through all 9 systems, stores outputs to `reports/v1/raw_outputs.jsonl`
- **API adapters (6 systems):** GPT-5 vanilla, Claude Opus vanilla, GPT-5 + search, Jasper, Writer, Sherpa `/api/chat` with `eval_flag`
- **Browser runner (3 DIY systems):** Custom GPT, Gemini Gem, Claude Project — uses real UIs via browser automation (`/browse` or `/connect-chrome` with imported cookies). Falls back to semi-automated clipboard workflow if automation is fragile.
- **One-time setup:** Create the 3 DIY workspaces (Custom GPT, Gem, Project) with 7-book pack + PMM advisor instructions

### Sunday AM — Scoring (4h)
- `score_ragas.py` — Context Precision + Faithfulness on Sherpa retrieval traces
- `score_citations.py` — regex for named authors/books, verify existence via Supabase, check chunk content match
- `score_judges.py` — Claude Opus + GPT-5 ensemble; pointwise for L2, pairwise for L3
- Aggregate with bootstrap CIs

### Sunday PM — Scorecard (4h)
- Radar chart (recharts or plotly)
- 3 side-by-side comparison cards
- Raw data downloads (JSON + CSV)
- Publish to `/eval` route

---

## 12. File structure proposal

```
pmmsherpa/
├── evals/
│   ├── prompts/
│   │   └── sherpa-eval-v1.yaml        # 35 prompts + metadata
│   ├── rubrics/
│   │   ├── framework_fidelity.md
│   │   ├── specificity.md
│   │   ├── voice_quality.md
│   │   └── mode_match.md
│   ├── harness/
│   │   ├── run_systems.py
│   │   ├── adapters/
│   │   │   ├── claude.py
│   │   │   ├── openai.py
│   │   │   ├── openai_search.py
│   │   │   ├── jasper.py
│   │   │   └── sherpa.py
│   │   └── braintrust_upload.py
│   ├── scorers/
│   │   ├── score_ragas.py
│   │   ├── score_citations.py
│   │   └── score_judges.py
│   └── reports/
│       └── v1/
│           ├── raw_outputs.jsonl
│           ├── scores.csv
│           └── aggregates.json
└── src/app/eval/
    └── page.tsx                       # public landing page
```

---

## 13. Success criteria for v1

- Sherpa wins on **Citation accuracy** by ≥30 pts vs all baselines
- Sherpa wins on **Framework fidelity** and **Specificity** with non-overlapping 95% CIs
- Sherpa wins on **Voice quality** with non-overlapping CIs
- Latency p95 within 2x of GPT-5 vanilla (the retrieval tax is visible but not prohibitive)
- Publishable results even if Sherpa loses on one axis — transparency is the positioning

---

## 14. Decisions log (resolved 2026-04-16)

| Question | Decision |
|---|---|
| Agentic competitor | **Jasper** + **Writer.com** commercial agentic, plus **Custom GPT / Gemini Gem / Claude Project** DIY RAG baselines — 5 agentic/custom systems in total |
| Agentic access | Sign up for Jasper 7-day trial + Writer free trial; DIY baselines automated via Assistants API / Gemini API / Claude API with files |
| Reference answers | **Seed from Sherpa, then edit.** Fastest path; acknowledged risk = mild bias toward Sherpa-shaped answers, mitigated by user edit pass |
| Public vs internal v1 | **Internal v1 this weekend → publish v1.1** after one iteration cycle |
| Landing page examples | **All 5** (framework / competitive intel / deliverable / voice mode / review). One per buyer objection |

## 15. Cost estimate

- 35 prompts × 9 systems × ~2K input + 1.5K output = ~1.1M tokens per full run
- Expected cost per full eval run: **~$50-75** across all systems (GPT-5 × 3 variants, Claude Opus × 2 variants, Gemini × 2 variants, Writer/Jasper trial = free)
- Judge pass: 35 × 9 × 2 judges × ~3K tokens = ~1.9M judge tokens ≈ **$25-40**
- DIY baselines file-upload one-time cost (~7 books × ~350K tokens each = ~2.5M tokens embedded/indexed per platform, largely free within file-search tiers)
- **Per full eval: ~$75-115.** Acceptable.

---

## 16. References

- [RAGAS metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/)
- [LLM-as-judge guide (Evidently)](https://www.evidentlyai.com/llm-guide/llm-as-a-judge)
- [Judging LLM-as-a-Judge (Zheng et al.)](https://arxiv.org/abs/2306.05685)
- [Position bias in rubric-based scoring (2026)](https://arxiv.org/html/2602.02219)
- [HELM](https://crfm.stanford.edu/helm/) / [HELM Enterprise](https://github.com/IBM/helm-enterprise-benchmark)
- [Golden dataset best practices](https://www.getmaxim.ai/articles/building-a-golden-dataset-for-ai-evaluation-a-step-by-step-guide/)
- [Practical LLM evaluation guide (arXiv 2025)](https://arxiv.org/html/2506.13023v1)
- [Cameron Wolfe — Using LLMs for evaluation](https://cameronrwolfe.substack.com/p/llm-as-a-judge)
- [Jasper State of AI in Marketing 2026](https://www.prnewswire.com/news-releases/new-jasper-research-shows-ai-is-now-core-to-marketing-with-scale-and-governance-emerging-as-top-barriers-302671894.html)

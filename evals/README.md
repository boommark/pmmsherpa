# Sherpa Eval v1

Benchmark suite comparing **PMM Sherpa** against vanilla LLMs, commercial agentic marketing tools, and DIY RAG baselines.

**Design doc:** [docs/SHERPA_EVAL_v1.md](../docs/SHERPA_EVAL_v1.md)
**Status:** Prompts and rubrics drafted 2026-04-16. Harness pending.

---

## Directory structure

```
evals/
├── README.md                           # This file
├── prompts/
│   └── sherpa-eval-v1.yaml            # 35 prompts, 4 tiers, with metadata
├── rubrics/
│   ├── framework_fidelity.md          # Metric 4 (1-5, LLM judge)
│   ├── specificity.md                 # Metric 5 (1-5, LLM judge)
│   ├── voice_quality.md               # Metric 6 (1-5, LLM judge)
│   └── mode_match.md                  # Metric 7 (PASS/FAIL, LLM judge)
├── harness/                            # [pending]
│   ├── run_systems.py                 # Orchestrator — runs all prompts through all systems
│   ├── run_browser.py                 # Browser runner for DIY systems (Custom GPT, Gem, Project)
│   ├── clipboard_fallback.py          # Semi-auto clipboard workflow if browser automation fails
│   └── adapters/                      # API adapters (6 systems)
│       ├── sherpa.py                  # Calls PMM Sherpa /api/chat directly
│       ├── openai_vanilla.py          # GPT-5 via OpenAI API, no tools
│       ├── openai_search.py           # GPT-5 via OpenAI API + web search tool
│       ├── claude_vanilla.py          # Claude Opus 4.6 via Anthropic API
│       ├── jasper.py                  # Jasper API (or headless browser fallback)
│       └── writer.py                  # Writer API
├── browser/                            # [pending] Browser automation for DIY baselines
│   ├── setup_workspaces.md            # Instructions to create Custom GPT / Gem / Project
│   ├── chatgpt_runner.py              # Navigate Custom GPT, paste prompt, capture response
│   ├── gemini_runner.py               # Navigate Gemini Gem, paste prompt, capture response
│   └── claude_runner.py               # Navigate Claude Project, paste prompt, capture response
├── scorers/                            # [pending]
│   ├── score_ragas.py                 # Metrics 1-2 (RAGAS auto)
│   ├── score_citations.py             # Metric 3 (programmatic)
│   └── score_judges.py                # Metrics 4-7 (LLM-as-judge ensemble)
└── reports/                            # [output]
    └── v1/
        ├── raw_outputs.jsonl
        ├── scores.csv
        └── aggregates.json
```

---

## The 9 systems being compared

| # | System | Category |
|---|---|---|
| 1 | GPT-5 vanilla | Vanilla frontier |
| 2 | Claude Opus 4.6 vanilla | Vanilla frontier |
| 3 | GPT-5 + web search | Vanilla + tools |
| 4 | Jasper (PMM workflow) | Commercial agentic |
| 5 | Writer.com | Commercial agentic |
| 6 | Custom GPT + 7 PMM books | DIY RAG (OpenAI Assistants API) |
| 7 | Gemini Gem + 7 PMM books | DIY RAG (Gemini API + files) |
| 8 | Claude Project + 7 PMM books | DIY RAG (Claude API + documents) |
| 9 | PMM Sherpa (prod) | Hypothesis |

**DIY baselines (6-8) use real UIs, not API approximations.** Each requires one-time manual setup — create the Custom GPT / Gem / Project and upload the 7-book pack. See `browser/setup_workspaces.md` for instructions.

**DIY book pack (7 books, same set for all DIY baselines):**
Dunford *Obviously Awesome* · Dunford *Sales Pitch* · Moore *Crossing the Chasm* · Miller *Building a StoryBrand* · Ries & Trout *22 Immutable Laws* · Voje *GTM Strategist* · Ramadan et al. *Play Bigger*

---

## The 7 metrics

| # | Metric | Type | Range |
|---|---|---|---|
| 1 | Context Precision | RAGAS auto | 0.0-1.0 |
| 2 | Faithfulness to corpus | RAGAS auto | 0.0-1.0 |
| 3 | Citation accuracy | Programmatic | 0.0-1.0 |
| 4 | Framework fidelity | LLM judge ensemble | 1-5 |
| 5 | Specificity / Actionability | LLM judge ensemble | 1-5 |
| 6 | Voice quality (Layer 4) | LLM judge ensemble | 1-5 |
| 7 | Mode match | LLM judge (binary) | PASS/FAIL |

---

## Running the eval (once harness is built)

```bash
# Step 1a — Run API-based systems (6 systems, automated, ~20 min)
python harness/run_systems.py --prompts prompts/sherpa-eval-v1.yaml --out reports/v1/

# Step 1b — Run DIY baselines via browser (3 systems)
# Option A: browser automation (try first)
python harness/run_browser.py --prompts prompts/sherpa-eval-v1.yaml --out reports/v1/

# Option B: semi-automated clipboard fallback (if browser automation is fragile)
python harness/clipboard_fallback.py --prompts prompts/sherpa-eval-v1.yaml --out reports/v1/
# ^ puts each prompt on clipboard, you paste into UI, copy response, script captures it

# Step 2 — Score outputs across all 7 metrics
python scorers/score_ragas.py --run reports/v1/
python scorers/score_citations.py --run reports/v1/
python scorers/score_judges.py --run reports/v1/ --rubrics rubrics/

# Step 3 — Aggregate with 95% bootstrap CIs
python scorers/aggregate.py --run reports/v1/ --out reports/v1/aggregates.json

# Step 4 — View the scorecard
open reports/v1/scorecard.html
```

---

## Judge hygiene (the credibility firewall)

- **Ensemble:** Claude Opus 4.6 + GPT-5 judge every output independently. Report Cohen's kappa.
- **Pointwise** for metrics 4-6 (absolute quality tracking), **pairwise** for L3 system comparisons with position randomization.
- **Anchored rubrics:** every 1-5 metric has concrete score anchors at 1 / 3 / 5 — see `rubrics/*.md`.
- **95% bootstrap CIs** on all aggregates. Non-overlapping CIs required to claim a win.
- **Never self-judge:** Claude-generated outputs must be judged by both Claude and GPT to guard against self-preference.

---

## References

See [docs/SHERPA_EVAL_v1.md](../docs/SHERPA_EVAL_v1.md) for full design rationale and research citations.

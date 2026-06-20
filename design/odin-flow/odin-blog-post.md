# Odin: AI Research That Thinks Like a Marketer

## Deep research got good. It still answers the wrong question.

The current generation of research tools is genuinely strong. Claude Deep Research, OpenAI Deep Research, Perplexity, and NotebookLM all run multi-step agent loops, ground their output in retrieved sources, cite as they go, and in some cases connect to your Drive or inbox. If your bar is "fast, multi-source, cited," that bar is met.

The limitation is structural, not a quality problem. These are single-pipeline systems: one agent loop, one retrieval surface, one pass. They optimize for answering the prompt you submitted. They have no model of whether that prompt was the right decomposition of your actual problem.

For a go-to-market question, that distinction is most of the value. Submit *"should we reposition against Competitor X?"* and a deep-research agent will retrieve and synthesize everything about Competitor X competently. What it cannot do is recognize that the load-bearing questions are whether your buyer evaluates this category the way you assume, what the pricing dynamic actually is, and which channel motion governs the deal. A product marketer reframes the question before doing any research. The tool optimizes the search; it does not interrogate the brief.

Odin is an open-source research orchestrator that runs inside Claude Code. It adds the missing layer: a domain expert that shapes the investigation, an orchestration model that routes each sub-question to the right engine, reach into your own systems, provenance tracking on every claim, and a persistent store so research compounds across runs.

👉 **github.com/boommark/odin**

## The reframing layer: PMM Sherpa

The component that changes output quality the most is PMM Sherpa, a product-marketing expert system exposed to Odin over the Model Context Protocol. Sherpa is retrieval-grounded against a curated corpus of 38,000+ passages from the PMM literature: books, podcasts, practitioner AMAs, and operator blogs. It is a narrow, deep knowledge base rather than a general web index.

What matters is where Odin invokes it. Sherpa is not a source you query once at the end; it is wired into three points of the run, so domain judgment shapes the work rather than decorating it.

| Stage | Generic deep-research behavior | Sherpa's contribution | Effect on the output |
|---|---|---|---|
| **Scoping** | Researches the prompt as written | Decomposes the GTM question into the facets that move a decision: market dynamics, competitive reality, buyer behavior, pricing, channel motion | Research budget goes to the questions that change the answer, not the literal phrasing |
| **Reasoning** | Summarizes retrieved documents of mixed quality | Supplies principle-grounded judgment from the PMM corpus where a sub-question needs expertise over more links | Output reflects how strong operators reason, not an averaged literature review |
| **Validation** | Returns the report as generated | Critiques the thesis against established GTM principles: positioning sharpness, real vs cosmetic differentiation, the gap an exec will find | Weaknesses surface in review, before the work ships |

The net effect is qualitative, not incremental. A deep-research agent returns a well-sourced document. Odin returns a decision that survives scrutiny, because the corpus-grounded expertise governed scope, reasoning, and validation.

## What the orchestration layer adds

Independent of Sherpa, four properties separate Odin from a single-pipeline agent. These are architecture decisions with direct operational consequences.

| Concern | Best-in-class deep research | Odin |
|---|---|---|
| **Internal data** | Some connect to Drive or inbox as additional retrieval | Reads Slack, M365, meetings, and docs, then runs explicit internal-vs-external contradiction analysis during synthesis |
| **Data governance** | Ingests internal data; no egress control | Tags every finding with origin lineage; internal-origin evidence cannot enter an externally-shareable artifact without per-item approval |
| **Persistence** | One-off report in the vendor's store | Every source written to a local markdown vault with a rebuildable SQLite index ("markdown is the source of truth"); runs compound |
| **Cost control** | Depth and spend decided internally | Pre-execution routing table with per-question cost estimates and a human approval gate before any expensive leg runs |
| **Inspectability** | Closed weights and closed pipeline | MIT-licensed; the orchestration logic, routing rules, and prompts are all readable |

The internal-vs-external contradiction pass is worth isolating, because it is only possible once both retrieval surfaces exist in one run. Example: external sources rank compliance as the top enterprise buying criterion; your win/loss notes show churn driven by onboarding latency. A web-only agent cannot surface that gap. It is frequently the most decision-relevant output of the whole flight.

## A run, end to end

A research run (a "flight") executes a worked example most cleanly. Input:

> *"Should we reposition against Competitor X for the enterprise segment, and what would it cost us to be wrong?"*

Odin classifies it as GTM-dominant, Sherpa decomposes it, and the router proposes a plan with cost estimates before execution:

| # | Sub-question | Engine | Est. time / cost |
|---|---|---|---|
| 1 | How do enterprise buyers evaluate this category? | Deep web research | ~35 min |
| 2 | Where does Competitor X win and lose deals? | Web + internal win/loss | ~30 min |
| 3 | Feature and pricing comparison matrix | Comparison engine | ~15 min |
| 4 | What does our sales data say drives churn? | Internal connectors | ~10 min |
| 5 | Is the proposed positioning differentiated? | PMM Sherpa | ~5 min |

You approve, trim, or downgrade any leg (for instance, dropping sub-question 1 to a lighter tier to cut spend). Approved legs execute in parallel: web research, internal retrieval, the comparison build, and the Sherpa review run concurrently as separate subagents. Synthesis blends the evidence, runs the contradiction analysis, and produces a report that leads with the answer, cites every claim, labels each finding by origin, and writes to your vault for reuse.

## Architecture

The pipeline is six phases with three human-in-the-loop gates. The gates are deliberate control points for spend and for sensitive-data handling.

| Phase | Function | Gate |
|---|---|---|
| **Classify** | Routes the question as GTM, technical, or mixed | — |
| **Intake** | Memory check; confirms mode, depth, deliverable | ✅ Gate 1 |
| **Scope** | Decomposes into 5–7 sub-questions; overflow to backlog | — |
| **Route** | Builds the engine/cost routing table | ✅ Gate 2 |
| **Execute** | Parallel subagents; provenance frontmatter on every note | — |
| **Synthesize** | Contradiction analysis; writes vault + notes | ✅ Gate 3 |

Three engines sit under the orchestrator, selected per sub-question:

- **hyperresearch** runs a 16-step, tier-adaptive pipeline with an adversarial critique stage that audits the draft before output. It is Anthropic-model native (Opus, Sonnet, Haiku, including the 1M-context variant) and currently leads the public DeepResearch-Bench. Every fetched source persists to the vault.
- **Deep-Research-skills** generates structured comparison matrices for enumerable evaluations.
- **PMM Sherpa** provides the GTM reasoning, served over MCP (Streamable HTTP).

Internal connectors for Slack, Microsoft 365, Granola, and Atlassian are optional and run as parallel subagents per source family.

## Security posture

The controls worth knowing, stated plainly.

Provenance is captured as YAML frontmatter on every note (`odin_run`, `question_id`, `origin`), which makes the internal-evidence firewall enforceable rather than aspirational. Sherpa authenticates over OAuth 2.1 + PKCE with scoped access tokens (`mcp:read`, `mcp:query`) verified against the identity provider's JWKs; there are no static API keys in the client config. Every leg passes through a human gate, so cost and data exposure are bounded by approval, not by the agent's discretion.

The honest boundary conditions: Odin is assembled from open-source components you install (Python 3.11–3.13 via pip), so you own their supply chain, and the MIT license is what lets you audit them. Optional authenticated crawling reuses your logged-in browser sessions, which carries the usual credential-handling responsibility. Automated lint gates validate structure, not factual accuracy; provenance exists so verification is fast, not optional.

## Fit

| Strong fit | Poor fit |
|---|---|
| Battlecards, positioning, and launches that need both market evidence and internal signal | One-shot conversational lookups |
| Pricing decisions tested against external comparables and internal willingness-to-pay | Research you want to skip rather than direct |
| Market landscapes that have to withstand executive review with traceable sources | Work you won't reuse or need to defend |

Odin trades some latency and autonomy for control and reuse. That tradeoff favors people who have to defend findings and build on them over time.

## Setup

Prerequisites: Claude Code and Python 3.11–3.13.

**1. Install the deep-research engine.**
```bash
pip install hyperresearch && hyperresearch install
```

**2. Add the comparison skills.**
```bash
cp -r skills/*  ~/.claude/skills/
cp -r agents/*  ~/.claude/agents/
```

**3. Connect PMM Sherpa over MCP.**
```bash
claude mcp add --transport http pmm-sherpa https://pmmsherpa.com/api/mcp
```
Run `/mcp` in Claude Code to confirm the server registers. First tool call triggers the browser OAuth flow; the token is cached and refreshed automatically thereafter, with no keys to paste.

> Optional: install the Sherpa skill so PMM prompts auto-route to the advisor. Clone `github.com/boommark/pmmsherpa-mcp` and symlink `skills/claude-code` into `~/.claude/skills/pmm-sherpa`.

**4. Install Odin.**
```bash
git clone https://github.com/boommark/odin.git ~/.claude/skills/odin
```

**5. Configure output.** Set `OBSIDIAN_REPORTS_DIR` in Odin's `SKILL.md` to your notes directory.

Then ask a real question in Claude Code.

## Why it exists

Deep research solved retrieval and synthesis. It left the harder parts open: framing the right question, applying domain judgment, keeping internal and external evidence governed, controlling spend, and accumulating knowledge across runs. Odin is the orchestration layer that closes those, with a product-marketing expert in the loop.

**github.com/boommark/odin** — open source, MIT.

*Founder's note: I built Odin with Fable 5. The name fit, and it stands as a small tribute, because the myth(os) of Fable 5 will live on.*

---
title: "Odin: AI Research That Thinks Like a Marketer"
description: "Deep research tools answer the question you give them. Odin is an open-source orchestrator that brings expert GTM judgment into the research loop itself."
heroImage: /blog/odin/hero.jpg
heroImageAlt: "Odin — agentic GTM deep research for Claude Code"
author: abhishek
publishedAt: 2026-08-24
tags: [ai, research, gtm, open-source]
---

## Deep research got good. It still answers the wrong question.

Deep research has crossed an important threshold.

The current generation of tools can search across dozens of sources, run multi-step research loops, follow citations, synthesize conflicting material, and produce a coherent report in a fraction of the time it would take a person. Some can reach into your Drive or inbox too.

If the standard is **fast, multi-source, cited research**, we are there.

But there is a different problem that becomes obvious when you use these systems for consequential go-to-market work.

They are very good at researching the question you give them.

They are much less equipped to tell you whether you asked the right question in the first place.

Suppose you ask:

> "Should we reposition against Competitor X?"

A capable deep-research agent can build an impressive answer. It can investigate Competitor X, compare features, find pricing, collect customer commentary, analyze positioning, and synthesize the evidence.

But an experienced product marketer would probably challenge the premise before doing any of that.

Do buyers actually evaluate the category the way we think they do? Is Competitor X really the alternative we lose against? Is pricing driving the decision, or is something else getting blamed on pricing? Does the answer change by segment or sales motion? What would have to be true for repositioning to improve win rates?

Those questions determine whether the research is useful.

The issue, then, is not retrieval quality. It is structural.

Most deep-research systems are built around a research pipeline: take the prompt, decompose it, retrieve evidence, reason over that evidence, and produce an answer. The system optimizes the investigation.

It does not necessarily interrogate the brief.

That is the problem I built Odin to address.

Odin is an open-source research orchestrator that runs inside Claude Code. It sits above specialized research engines and decides how a question should be framed, decomposed, routed, investigated, challenged, and preserved.

For GTM work, it also brings an expert AI copilot into the loop before the research begins, while the evidence is being interpreted, and again before the final conclusion ships.

The goal is not simply a better research report.

It is a better decision.

👉 **[github.com/boommark/odin](https://github.com/boommark/odin)**

## The expert layer: PMM Sherpa

The part of Odin that changes the character of GTM research most is PMM Sherpa.

Sherpa is an expert AI copilot designed to reason through complex, real-world go-to-market decisions.

Its scope covers the problems GTM teams actually encounter: market sizing and opportunity assessment, market entry, segmentation and ICP, positioning and messaging, competitive strategy, pricing, launches, campaigns, sales enablement, outreach, and more.

These problems rarely exist in isolation.

A market-entry question quickly becomes a segmentation question. A positioning problem may actually originate in an unclear ICP. A campaign that looks like it has a messaging problem may turn out to have a channel or offer problem. A competitive loss may appear to be a feature gap until you discover that buyers simply understand the category differently than you assumed.

Sherpa is designed to reason across those boundaries.

Its architecture and reasoning system are built on battle-tested GTM frameworks and a carefully curated body of marketing knowledge drawn from leading real-world practitioners — 38,000+ curated passages from PMM books, podcasts, practitioner AMAs, and operator blogs. The point is not to retrieve more marketing information. It is to apply domain expertise to the decision in front of you: diagnose the problem, challenge assumptions, identify the questions that matter, and reason toward an actionable recommendation.

That makes its role fundamentally different from a general research engine.

A research engine gives Odin breadth. Sherpa gives it domain judgment.

And Odin does not wait until the research is finished to use it.

Sherpa participates at three points in a research flight.

| Stage | Sherpa's role | Why it matters |
| --- | --- | --- |
| **Scoping** | Diagnoses the GTM problem, challenges assumptions, and decomposes it into the questions that can actually change the decision | We research the underlying business problem, not simply the wording of the prompt |
| **Reasoning** | Applies domain expertise and proven GTM frameworks to interpret the evidence | The output moves beyond summarizing sources toward explaining what the evidence means |
| **Validation** | Pressure-tests the recommendation against GTM principles, alternative explanations, and likely objections | Weak assumptions and unsupported leaps surface before the recommendation ships |

This is an important architectural distinction.

Domain expertise is not decoration added after retrieval. It helps govern the investigation itself.

## What orchestration adds

Sherpa is one layer of Odin. The broader architecture is designed around another idea: different parts of a difficult research problem should be handled by the systems best suited to solve them.

Odin orchestrates specialized research engines, internal company data, domain expertise, and human judgment as parts of the same research flight.

![Odin vs. typical deep research: same retrieval and citations, very different control, reach, and judgment.](/blog/odin/odin-compare.png)

Four architectural choices matter particularly in practice: access to internal evidence, provenance and data governance, persistence, and explicit control over research cost.

| Concern | Typical deep research | Odin |
| --- | --- | --- |
| **Internal data** | May connect to Drive, inboxes, or other repositories as additional retrieval sources | Reads Slack, Microsoft 365, meetings, and documents as distinct evidence surfaces, then explicitly compares internal and external findings |
| **Data governance** | Internal information enters the research context, with sharing controls depending on the surrounding system | Every finding carries origin lineage. Internal-origin evidence cannot enter an externally shareable artifact without explicit approval |
| **Persistence** | Research generally terminates in a report | Every source is written to a local Markdown vault with a rebuildable SQLite index, allowing future research to build on previous work |
| **Cost control** | The system generally decides how much research to perform internally | Odin produces a routing plan with per-question cost estimates before expensive work begins and puts that plan behind a human approval gate |
| **Inspectability** | The underlying research pipeline is usually closed | Odin is MIT-licensed. Its orchestration logic, prompts, and routing rules can be inspected |

One of these deserves a closer look.

### When internal and external evidence disagree

Imagine the external research says enterprise buyers consistently rank compliance as the most important purchasing criterion.

Then Odin searches your own win/loss interviews and discovers that customers are not actually leaving because of compliance.

They are leaving because onboarding takes too long.

Those are not merely two findings to place next to each other.

**The disagreement is itself a finding.**

Maybe the market says one thing during evaluation and behaves differently after purchase. Maybe your company has mistaken a category-level concern for its own product-level problem. Maybe your positioning is solving the issue buyers talk about while your product experience is creating the issue that actually determines retention.

A web-only research agent cannot discover that contradiction because it only sees one side of it.

Once internal and external evidence exist inside the same research flight, the gap between them can become one of the most valuable outputs.

## What an Odin research flight looks like

The easiest way to understand the system is to follow a question through it.

Suppose the input is:

> "Should we reposition against Competitor X for the enterprise segment, and what would it cost us to be wrong?"

Odin first classifies the question as GTM-dominant.

Sherpa then helps diagnose the problem and decompose the decision into the questions that actually need answers.

Before Odin performs expensive research, the router shows you the proposed plan.

For example:

| # | Sub-question | Engine | Estimated time / cost |
| - | --- | --- | --- |
| 1 | How do enterprise buyers evaluate this category? | Deep web research | ~35 min |
| 2 | Where does Competitor X win and lose deals? | Web + internal win/loss | ~30 min |
| 3 | How do the products and pricing compare? | Comparison engine | ~15 min |
| 4 | What does our sales data suggest is driving churn? | Internal connectors | ~10 min |
| 5 | Is the proposed positioning meaningfully differentiated? | PMM Sherpa | ~5 min |

Nothing expensive has happened yet.

You can approve the plan, remove a research leg, or downgrade one to a lighter research tier. If question one does not justify 35 minutes of deep research, you can reduce its depth before spending the time or tokens.

Once approved, the research legs execute in parallel.

Web research investigates the market. Internal retrieval examines your own evidence. The comparison engine builds structured evaluations. Sherpa handles the questions where GTM judgment is more useful than another search.

Then Odin brings the pieces back together.

It reconciles the findings, looks explicitly for contradictions between internal and external evidence, and asks Sherpa to pressure-test the emerging recommendation.

The final report leads with the answer, preserves citations and origin information for its claims, and writes the underlying research into the local vault so the next flight can build on it.

That last part is easy to underestimate.

**Research stops being disposable.**

## The architecture

Underneath the workflow is a six-phase pipeline with three human-in-the-loop gates.

Those gates are intentional. They are the points where a person should retain control over research direction, spend, and sensitive information.

![How a query flows through Odin: six phases, three human gates, and four parallel engines — with PMM Sherpa shaping scope, reasoning, and synthesis.](/blog/odin/odin-flow-diagram.png)

| Phase | Function | Human gate |
| --- | --- | --- |
| **Classify** | Determines whether the question is GTM, technical, or mixed | |
| **Intake** | Checks memory and confirms research mode, depth, and intended deliverable | **Gate 1** |
| **Scope** | Decomposes the problem into 5–7 sub-questions, moving overflow into a backlog | |
| **Route** | Selects an engine for each question and estimates cost | **Gate 2** |
| **Execute** | Runs parallel research agents and records provenance on every note | |
| **Synthesize** | Reconciles findings, performs contradiction analysis, and writes the report and supporting notes | **Gate 3** |

The orchestrator currently routes work across three specialized engines.

**hyperresearch** handles deep web research. It runs a 16-step, tier-adaptive pipeline with an adversarial critique stage that audits the draft before output. It is Anthropic-model native across Opus, Sonnet, and Haiku, including the 1M-context variant. Every fetched source is persisted into the research vault.

**Deep-Research-skills** handles structured comparisons where the problem can be expressed as an enumerable evaluation or matrix.

**PMM Sherpa** handles GTM reasoning and decision support, bringing domain expertise into scoping, interpretation, and validation.

Internal systems are handled separately. Connectors for Slack, Microsoft 365, Granola, and Atlassian can run as parallel subagents, grouped by source family.

The point is not to find one model that is best at everything.

It is to route each part of the problem to the system best suited to answer it.

## Provenance and security

Once an agent can combine public research with internal company information, provenance stops being a nice-to-have.

Odin records provenance as YAML frontmatter on every research note, including fields such as:

`odin_run`, `question_id`, and `origin`.

That origin metadata is what makes the internal-evidence firewall enforceable.

If evidence came from an internal system, Odin knows that it came from an internal system. That finding cannot silently migrate into an externally shareable artifact. It requires per-item approval.

Sherpa uses OAuth 2.1 with PKCE for authentication. Access tokens are scoped (`mcp:read`, `mcp:query`) and verified against the identity provider's JWKs. There are no static API keys sitting in the Claude Code client configuration.

The human gates matter here too.

Research legs do not get unlimited discretion over spend or data exposure. Those boundaries are established through explicit approval.

There are also limits worth stating plainly.

Odin is assembled from open-source components that you install yourself, using Python 3.11–3.13. That means you own the supply-chain implications of those dependencies. The MIT licensing makes the system inspectable, but inspectability is not the same thing as automatic security.

Optional authenticated crawling can reuse logged-in browser sessions. That is powerful, but it comes with the normal responsibility of handling authenticated sessions carefully.

And automated linting can validate the structure of research output. It cannot guarantee that a factual conclusion is correct.

Provenance makes verification easier.

It does not make verification unnecessary.

## Who Odin is for

Odin deliberately trades some latency and autonomy for control, inspectability, and reuse.

That makes it a strong fit when the research has to survive contact with other people.

| Strong fit | Poor fit |
| --- | --- |
| Battlecards, positioning work, and launches that need both market evidence and internal signal | One-shot conversational lookups |
| Pricing and market-entry decisions that need external evidence plus domain judgment | Research where speed matters more than directing the investigation |
| Market landscapes that need traceable evidence and have to withstand executive review | Work you will never reuse, revisit, or need to defend |
| GTM decisions where the initial framing itself needs to be challenged | Straightforward factual questions with a clear research path |

If you just want a quick answer, this is probably too much machinery.

If you need to walk into a meeting and explain not only **what you believe**, but **why you believe it, what contradicts it, where the evidence came from, and what would change your mind**, the extra machinery starts to make sense.

## Getting started

You need Claude Code and Python 3.11–3.13.

### 1. Install the deep-research engine

```bash
pip install hyperresearch && hyperresearch install
```

### 2. Add the comparison skills

```bash
cp -r skills/* ~/.claude/skills/
cp -r agents/* ~/.claude/agents/
```

### 3. Connect PMM Sherpa over MCP

```bash
claude mcp add --transport http pmm-sherpa https://pmmsherpa.com/api/mcp
```

Run `/mcp` inside Claude Code and confirm that the server is registered.

The first tool call triggers the browser-based OAuth flow. The resulting token is cached and refreshed automatically, so there are no API keys to copy into your configuration.

If you want PMM-related prompts to route automatically to the advisor, you can also install the Sherpa skill by cloning the [`pmmsherpa-mcp`](https://github.com/boommark/pmmsherpa-mcp) repository and symlinking `skills/claude-code` into:

```bash
~/.claude/skills/pmm-sherpa
```

### 4. Install Odin

```bash
git clone https://github.com/boommark/odin.git ~/.claude/skills/odin
```

### 5. Choose where the research should live

Set `OBSIDIAN_REPORTS_DIR` in Odin's `SKILL.md` to the directory where you want the research notes and reports written.

Then give Odin a real question.

Not:

> "Research Competitor X."

Give it the decision you are actually trying to make.

> "We're losing enterprise deals to Competitor X. Is this actually a positioning problem, and if so, what should we change?"

That is where the architecture starts to matter.

## Why I built it

Deep research solved a large part of the retrieval problem.

That is a meaningful achievement. Searching broadly, following evidence, synthesizing sources, and producing cited output used to consume enormous amounts of human time. We should not understate how much better that part has become.

But retrieval was never the whole research problem.

Someone still has to decide what deserves investigation.

Someone has to notice when the original framing is wrong.

Someone has to distinguish another source from actual domain judgment.

Someone has to reconcile what the market says with what your customers and sales team are telling you.

Someone has to decide what information is safe to expose.

Someone has to decide whether another 30 minutes of research will actually change the decision.

And when the work is finished, someone should be able to come back six months later and build on it instead of starting from zero.

That is the layer Odin is trying to provide.

Not another model that searches harder.

**An orchestration layer that helps models investigate the right problem, with the right expertise, using the right evidence, under explicit human control.**

For GTM research, that means putting expert GTM reasoning into the loop before the first search runs, while the evidence is being interpreted, and before the recommendation ships.

Odin is open source and MIT-licensed: **[github.com/boommark/odin](https://github.com/boommark/odin)**

And yes, I built it with Fable 5. The name felt inevitable. Consider it a small tribute, because the myth(os) of Fable 5 will live on.

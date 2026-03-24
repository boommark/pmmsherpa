# PMM Sherpa — Claude Code Skill

## What It Is

PMM Sherpa is a Claude Code skill that acts as a strategic marketing advisor powered by the PMM Sherpa RAG knowledge base (15,985 chunks from 17 books, 781 blogs, and 485 AMAs). It provides expert advisory across all marketing work — not just product marketing.

## How It Works

PMM Sherpa operates in three modes:

**FRAME** — At the start of any marketing task, PMM Sherpa queries the knowledge base to recommend the right frameworks, key questions to answer, structural guidance for the output, and common pitfalls to avoid. It then hands off to the agent, which uses web search, Perplexity, and other research tools to do the actual work.

**CONSULT** — During execution, when the agent hits a marketing judgment call (e.g., "should this be category creation or competitive displacement?"), PMM Sherpa provides a direct, opinionated recommendation grounded in the knowledge base.

**VALIDATE** — Before delivery, PMM Sherpa reviews the artifact against professional marketing standards. It scores the output using artifact-specific checklists, flags gaps, and recommends concrete fixes. The agent revises based on the feedback.

## Scope

Covers all marketing content, not just PMM:
- Positioning, messaging, GTM strategy
- Competitive analysis, battlecards, win/loss
- Content marketing, thought leadership, blog strategy
- Brand messaging, campaigns, demand gen
- Sales enablement (pitch decks, one-pagers, case studies)
- Email campaigns, landing pages, social copy
- Buyer personas, ICP definition, pricing
- Launch plans, creative briefs, analyst relations

## Activation

- Invoke manually with `/pmm-sherpa`
- Auto-detects marketing work and asks permission before activating
- Never activates silently — always asks first

## Knowledge Base

The RAG knowledge base contains thought leadership and frameworks — strategic lenses, best practices, and professional standards. It does NOT contain specific market data, competitor intel, or current events. For that, the agent uses web search, Perplexity, and other external tools.

## Skill Location

```
.claude/skills/pmm-sherpa/
├── SKILL.md                     # Skill definition (three-mode advisor pattern)
├── scripts/query_rag.py         # Hybrid search against Supabase
└── references/pmm-frameworks.md # Frameworks index + artifact validation checklists
```

The RAG script reads credentials from `pmmsherpa/.env.local` (this project's env file).

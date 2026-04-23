# PMM Sherpa: Pricing, Security & Enterprise Strategy

**Date:** 2026-04-06
**Status:** Research complete, ready for decision

---

## Context

PMM Sherpa is live with hundreds of users, currently free. It costs ~$1,300-3,900/mo at scale across 9 external services (Claude, Gemini, Perplexity, OpenAI embeddings, Brave Search, Jina, Firecrawl, LlamaParse, ElevenLabs). Historical data: 351 calls = $13.44 total, ~$0.04/call average. We need a paid tier structure, security hardening, and an enterprise roadmap.

---

## 1. Competitive Landscape

| Tool | Individual | Pro/Team | Enterprise |
|------|-----------|----------|-----------|
| ChatGPT Plus | $20/mo | $100-200/mo (Max) | Custom |
| Claude Pro | $20/mo | $100-200/mo (Max) | Custom |
| Perplexity Pro | $20/mo | $200/mo (Max) | Custom |
| Jasper | $49/mo (Creator) | $69/mo (Pro) | $6K-63K/yr |
| Copy.ai | Free (2K words) | $49/mo | $249/mo (5 seats) |
| Writer | $18/user/mo | Custom | $75K-250K/yr |

Generic AI tools cluster at $20/mo. Domain-specific tools command $49-69/mo. PMM Sherpa is domain-specific with deeper expertise than any competitor.

---

## 2. Pricing Tiers

### Free Tier
**Price:** $0 | **Limit:** 5 conversations/month

- Full access to PMM knowledge base
- Claude Sonnet model only
- No web research (Perplexity/Brave disabled)
- No file uploads, no conversation history
- Watermark on exported artifacts

**Why 5 not 3:** Free-to-paid conversion averages 0.5-2%. At 3 conversations, users don't hit enough complexity to see the value gap.

### Sherpa Explorer — $19/mo

- Unlimited conversations
- Full model access (Claude + Gemini)
- Web research enabled (Perplexity, Brave)
- File uploads + URL scraping
- Conversation history
- 3 active projects
- Voice TTS, export artifacts

**Why $19 not $9.99:** Vertical AI tools reach 80% of SaaS contract values. At $9.99, we position below Writesonic ($19). The PMM knowledge base alone is worth more.

### Sherpa Studio — $39/mo

- Everything in Explorer, plus:
- Unlimited projects
- Memory graph (Sherpa remembers brand, positioning, competitors across sessions)
- Connectors: Google Docs, Notion, Slack (read-only)
- Brand voice training (upload style guide, past content)
- Advanced artifacts with brand context
- Claude Code / Claude Desktop skill unlock
- Priority model access

### Sherpa Army — $99/mo

- Everything in Studio, plus:
- Multi-agent workflows (role-play, positioning war rooms, PM-PMM alignment)
- Meeting companion (auto-listens, builds memory graph)
- Presentation builder
- Interview prep (mock interviews)
- Artifact publishing (PDFs, shareable links)
- API access (2K credits/mo)
- Team features (up to 3 seats)

### Enterprise — Custom ($200-400/user/mo)

- Dedicated context graph
- Unlimited integrations (Gong, Slack, Fireflies, Google Docs)
- SSO/SAML
- SOC 2 report
- Optional Obsidian vault access
- SLA

### API — $49-499/mo (credit-based)

| Tier | Credits/mo | Price |
|------|-----------|-------|
| Starter | 500 | $49/mo |
| Growth | 2,000 | $149/mo |
| Scale | 10,000 | $499/mo |

---

## 3. Unit Economics

| Scenario | Calls/mo | Cost | At $19/mo | At $39/mo | At $99/mo |
|----------|---------|------|-----------|-----------|-----------|
| Light user | 30 | $1.20 | 94% margin | 97% margin | 99% margin |
| Heavy user | 100 | $4.00 | 79% margin | 90% margin | 96% margin |
| Power user | 300 | $12.00 | 37% margin | 69% margin | 88% margin |

Economics are strong across all tiers. Even power users at $19/mo are profitable.

---

## 4. Claude Code/Desktop Skill Strategy

Current marketplace is entirely free and open-source. No formal monetization from Anthropic.

**Strategy:**
1. Publish free "PMM Sherpa Lite" skill on public marketplace (top-of-funnel)
2. Gate full skill behind PMM Sherpa subscription (authenticates via API key)
3. Include with Studio ($39) and Army ($99). Don't sell standalone.

**Technical:** Skill's SKILL.md calls our API endpoint. User stores their PMM Sherpa API key in Claude Code settings. Backend validates key, checks tier, returns appropriate response depth.

---

## 5. Security & IP Protection

### Prompt Exfiltration (URGENT)

PMM Sherpa currently has zero defenses. System prompt (229 lines), query planner prompt (lists all 17 book titles, KB structure), and RAG architecture are all exposed.

| Priority | Defense | Effort | Impact |
|----------|---------|--------|--------|
| P0 | Sandwich defense in system prompt | 30 min | Blocks naive attacks |
| P0 | Remove book titles from query planner prompt | 1 hr | Protects KB structure |
| P1 | Input scanning regex in chat route | 2-3 hrs | Blocks common patterns |
| P1 | Canary token + output scanning | 1-2 hrs | Detects leakage |
| P2 | Output filtering for prompt fragments | 3-4 hrs | Catches sophisticated attacks |
| P3 | Google Model Armor integration | 4-6 hrs | Professional-grade |

### Screenshot Replication Risk: LOW-MEDIUM

| Element | Risk | Why |
|---------|------|-----|
| Voice/personality | MEDIUM | RPE can approximate with ~10-20 examples |
| Knowledge base (21,893 chunks) | LOW | Impossible to reconstruct from screenshots |
| RAG architecture | LOW | Invisible in output |
| Overall replication | LOW-MEDIUM | Someone could build a "PMM chatbot" but not match depth |

**The real moat:** Curated data (21,893 chunks), retrieval sophistication (multi-query, hybrid search, three-layer assembly), and accumulating interaction data over time.

---

## 6. Enterprise Context Graph Architecture

### Recommended: Hybrid

Supabase pgvector for AI retrieval + Obsidian as optional human-browsing layer.

```
Source APIs (Gong, Fireflies, Slack, Google Docs)
    |
    v
n8n Webhook Orchestrator (existing VPS)
    |
    v
Markdown Converter (YAML frontmatter: source, project, participants, org_id)
    |
    v
Two parallel writes:
  1. Supabase customer_chunks table (always - AI retrieval)
  2. CouchDB/Obsidian vault (optional premium - human browsing)
    |
    v
Embedding Pipeline (OpenAI text-embedding-3-small, triggered by insert)
```

### Query Routing

Query planner extended with routing decision: `pmm_only`, `customer_only`, or `both`. LLM receives three context layers:
1. PMM Frameworks & Theory (shared KB)
2. Your Organization's Context (per-org, RLS-isolated)
3. Current Market Intelligence (Perplexity/Brave)

### Data Isolation

- RLS policies: every query filtered by `org_id` at Postgres level
- Application-layer: `customer_hybrid_search()` requires `org_id` parameter
- Never mix customer and shared KB in same search call
- Cost: ~$2-3/mo per tenant

### Obsidian as Optional Premium

Most enterprise customers won't use Obsidian desktop. Position as "Browse your AI's memory" for power users. Real value is in retrieval, not storage format.

---

## 7. API Design

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/chat` | Chat with PMM expertise + customer context |
| `POST /v1/artifacts` | Generate positioning docs, battlecards, briefs |
| `POST /v1/analyze` | Competitive/market analysis |
| `POST /v1/context` | Ingest customer context |

**Security:** API is a proxy, not a pass-through. System prompt, RAG architecture, and KB structure never travel to client. Input validation + output filtering + rate limiting.

---

## 8. Free Tier Conversion Strategy

- **Free -> Explorer target:** 5-8%
- **Explorer -> Studio target:** 15-20%
- **Activation trigger:** User completes first real artifact (positioning doc, battlecard)
- **Key gate:** Memory. Free/Explorer start from scratch every conversation. Studio remembers everything. Once someone uses memory for a week, they never go back.

---

## 9. Implementation Roadmap

| Phase | Timeline | Ships |
|-------|----------|-------|
| 1. Monetization | 2-3 weeks | Stripe billing, free tier limits, Explorer + Studio |
| 2. Security | 1-2 weeks | Sandwich defense, input scanning, canary tokens |
| 3. Memory Graph | 4-6 weeks | customer_chunks table, per-org context, query routing |
| 4. Integrations | 4-6 weeks | n8n pipeline (Gong, Fireflies, Slack, Google Docs) |
| 5. API | 3-4 weeks | REST API, credit metering, rate limiting |
| 6. Enterprise | 6-8 weeks | SSO, encryption, SOC 2 prep, Obsidian sync |

---

## 10. Competitive Moat

Three layers, each reinforced by pricing:

1. **Knowledge base (21,893 curated chunks)** — Free tier showcases it. Every tier benefits. Cannot be screenshotted or replicated.
2. **Memory graph (Studio+)** — Gets sharper with every interaction. Switching cost increases weekly. Key retention mechanism.
3. **Workflow integration (Army+)** — Meeting companion, multi-agent, presentations embed Sherpa into daily work. Highest switching cost.

**Pricing reinforces the moat:** Free shows the expertise. Explorer lets you do real work. Studio makes it personal. Army makes it indispensable.

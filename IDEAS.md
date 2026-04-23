# PMM Sherpa — Product Ideas Log

Running log of product ideas, feature concepts, strategic directions, and automation explorations for PMM Sherpa. This is the canonical place to capture ideas — write freely, no structure required beyond timestamping.

> **Convention:**
> - New idea explorations get an H2 date header (`## YYYY-MM-DD — Title`) and are prepended to the **top** of this file (newest on top).
> - **Every new entry must be mirrored to the Obsidian running log at** `~/Documents/AbhishekR/PMM Sherpa/Product Ideas.md` — prepend the same entry to the top there too (below the intro/convention block). Obsidian is the durable second brain; this file is the in-project copy.
> - Claude Code sessions should **not** front-load this file at session start. Read it **on demand** when a new idea exploration begins, a new feature build begins (to pull up past research), or the user asks about prior thinking on a topic.
> - You can write to this file directly anytime — Claude Code sessions will pick up new entries on next read.
>
> **Auto-write rule (enforced via `CLAUDE.md`):** Claude Code sessions MUST proactively write substantive idea explorations to this file **without being asked**. A substantive exploration = research + recommendations on a new product direction, feature concept, pricing move, GTM/growth experiment, positioning shift, or strategic decision — typically >300 words of advisory output grounded in multiple research tool calls. Quick Q&A, one-shot edits, and bug fixes don't count. Structure each entry with: **Context**, core recommendations, open questions, ship order (if applicable), sources consulted. See `CLAUDE.md` for full rules.

---

## 2026-04-17 — Organizational Context Layer + RAG Differentiation Analysis (BL-038)

**Context:** Client (Manish/Hushh) challenged why PMM Sherpa's RAG beats vanilla Claude/GPT. Led to a three-part analysis: (1) why RAG beats world knowledge, (2) what business problem Sherpa solves for individual users vs AI agents, (3) how to architect an organizational context layer alongside the shared corpus.

**Core recommendations:**

1. **RAG differentiation is real but the framing matters.** PMM Sherpa's RAG is not fact retrieval — it's a curated reasoning scaffold. The corpus provides 38K chunks of editorially curated, practitioner-grade knowledge. Claude's training data is the compressed average of the internet; Sherpa retrieves the specific chapters and war stories that change how you think. Detailed analysis saved to `docs/RAG_DIFFERENTIATION.md` and Obsidian.

2. **Two business problems, two markets.** Individual users: PMMs make high-stakes decisions without access to accumulated discipline wisdom ($500/hr advisor, on demand). AI agents: agents generate marketing output without strategic judgment — Sherpa becomes the PMM expertise layer any agent calls into via API/MCP.

3. **Org context layer architecture: Karpathy Wiki + Vector RAG hybrid.**
   - Karpathy's [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) is perfect for per-tenant org knowledge (right scale, auto-maintenance). LLM maintains interlinked wiki pages from raw sources — one new doc touches 10-15 pages.
   - Sherpa's shared corpus stays as vector RAG (38K chunks, too large for wiki).
   - Graph edges added incrementally where relationship density justifies (personas→segments→competitors).
   - Auto-ingestion from calls, docs, emails, CRM via n8n queue → LLM processing → wiki + vector store.

4. **Storage: start vector, add graph later.** 2026 consensus is hybrid (80% vector, 15% graph, 5% agentic). Graph RAG lifts accuracy 35% on multi-entity queries but adds complexity. Ship vector MVP first, observe real relationship patterns, then add edges.

**Build sequence:** Upload+vector MVP → LLM wiki layer → auto-ingestion connectors → relationship graph → MCP/API for agents.

**Open questions:**
- Tier gating: how much org storage per pricing tier?
- LLM cost for wiki maintenance at scale (each ingestion = LLM call to update 10-15 pages)
- LiveSync integration vs standalone Supabase storage for the org wiki

**Sources:**
- [Karpathy LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Graph RAG vs Vector RAG — Couchbase](https://www.couchbase.com/blog/graph-rag-vs-vector-rag/)
- [RAG vs Knowledge Graphs 2026 — Techment](https://www.techment.com/blogs/rag-vs-knowledge-graphs-2026/)
- [Meeting Notes Knowledge Graph — CocoIndex](https://cocoindex.io/blogs/meeting-notes-graph)
- [NN/G AI information seeking](https://www.nngroup.com/articles/ai-information-seeking-keyword-foraging/)

**Full architecture doc:** Obsidian `PMM Sherpa/Organizational Context Layer — Architecture Vision.md`
**RAG differentiation doc:** `docs/RAG_DIFFERENTIATION.md` + Obsidian `PMM Sherpa/Why RAG Beats World Knowledge — PMM Sherpa Differentiation.md`

---

## 💡 Idea Backlog

Running capture of rough ideas awaiting structured exploration. Rows flip from 🔴 → 🟢 once a dated exploration entry is written.

**Status legend:** 🔴 Not explored · 🟡 In progress / partial · 🟢 Explored · ✅ Shipped · ❌ Rejected

**Categories:** `product` · `pricing` · `gtm` · `positioning` · `automation` · `tech` · `ingestion` · `integration` · `infra` · `personal`

**Workflow:**
1. **Capture:** Drop new rough ideas as new rows at the bottom of this table (next `BL-ID`). One-line description is enough — Claude Code will also add ideas here automatically when you paste rough idea lists.
2. **Explore:** Say "explore BL-XXX" (or "explore these: BL-XXX, BL-YYY, BL-ZZZ"). Claude will:
   - Do structured feasibility research (build approach, tools, dependencies, costs, risks)
   - Run a GTM evaluation via the `/pmm-sherpa` skill (fit with corpus, positioning angle, audience, pricing hook, competitive context)
   - Write a timestamped exploration entry at the top of this file (auto-write rule)
   - Flip the backlog row status to 🟢 with the entry date in the **Explored** column
   - Mirror everything to the in-project copy
3. **Decide:** After exploration, promote to the roadmap (ship) or mark ❌ rejected with a one-line reason.

| ID     | Idea                                                                                         | Category              | Status | Explored   | Notes                                                                                       |
| ------ | -------------------------------------------------------------------------------------------- | --------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------- |
| BL-001 | Test codebase with Codex CLI as second-opinion reviewer                                      | tech                  | 🔴     | —          | Compare Codex vs Claude for code review quality on PMM Sherpa repo                          |
| BL-002 | Evaluate Conductor OSS for orchestration ([docs](https://docs.conductor-oss.org/index.html)) | tech                  | 🔴     | —          | One of three orchestration libraries to benchmark                                           |
| BL-003 | Evaluate AgentSpan ([agentspan.ai](https://agentspan.ai/))                                   | tech                  | 🔴     | —          |                                                                                             |
| BL-004 | Evaluate Temporal for AI workflows ([temporal.io](https://temporal.io/solutions/ai))         | tech                  | 🔴     | —          | Durable execution for long-running agents                                                   |
| BL-006 | Personalized daily AI-industry newsletter for VP-level positioning + politics                | personal / gtm        | 🔴     | —          | "How to position, launch confidently, reinvent daily workflow" — research right sources     |
| BL-007 | Homepage chat embed — next message gates to account creation                                 | gtm                   | 🔴     | —          | Acquisition hook on the marketing site                                                      |
| BL-010 | Rebrand to GTM Sherpa with RAG+frontier-model advisory narrative                             | positioning           | 🔴     | —          | Includes fine-tuning-vs-RAG messaging angle                                                 |
| BL-011 | PDF outputs — blogs, essays, long-form deliverables                                          | product               | 🔴     | —          | Export polished artifacts                                                                   |
| BL-012 | Build visual assets inspired by Mutiny ([mutinyhq.com](https://www.mutinyhq.com/))           | product               | 🔴     | —          | Benchmark for landing page personalization                                                  |
| BL-013 | Fine-tune Gemma 4 on real-world PMM assets + pair with skills for multi-agent                | tech                  | 🔴     | —          | Ownership angle vs cost/quality regression risk                                             |
| BL-015 | Narrow positioning to founder-specific (drop extra personas)                                 | positioning           | 🔴     | —          | "3 is too many personas"                                                                    |
| BL-016 | Complete skills for visual campaign assets and artefacts                                     | product               | 🔴     | —          |                                                                                             |
| BL-019 | Screenshot-to-paste input support                                                            | product               | 🔴     | —          | Low-lift input expansion                                                                    |
| BL-020 | "PMM Under Fire" mode — defend ideas, drive stakeholder cohesion (leaders + PM + sales)      | positioning / product | 🔴     | —          | Could become a system prompt mode + landing page use case                                   |
| BL-021 | RAG coverage expansion — writing tips, ebooks, whitepapers, diagrams, one-pagers             | product               | 🔴     | —          | Beyond current book/blog/AMA source types                                                   |
| BL-022 | LinkedIn + X scraping — company leaders, evangelists, partner/customer reactions             | ingestion             | 🔴     | —          | PhantomBuster vs Perplexity tradeoff to evaluate                                            |
| BL-023 | Long conversations + transcript paste handling                                               | product               | 🔴     | —          | UX for large inputs                                                                         |
| BL-024 | Context compaction strategy for long chats                                                   | tech                  | 🔴     | —          | Prevent context-window exhaustion                                                           |
| BL-026 | Self-learning — feedback loops that make Sherpa sharper over time                            | tech                  | 🔴     | —          | Rating + corpus curation + prompt evolution                                                 |
| BL-027 | Beautiful voice mode for career consultation (ElevenLabs)                                    | product               | 🔴     | —          | Voice picks: Eddie, Sterling, Hale, Elizabeth, Ava, Jon, Zara                               |
| BL-028 | LlamaParse + Firecrawl for web scraping + doc parsing                                        | ingestion             | 🔴     | —          |                                                                                             |
| BL-030 | Gamma + Google Drive connectors                                                              | integration           | 🔴     | —          | Bring in files from common sources                                                          |
| BL-031 | Context graph + Granola meeting integration                                                  | product               | 🔴     | —          | Evolving client dossier from meetings                                                       |
| BL-032 | GTM Council — multi-book personas for role-play (pitches, negotiations)                      | product               | 🔴     | —          | Uses Voss, Cialdini, Greene, Moore etc. as a debate panel                                   |
| BL-033 | Deep Research mode (multi-step agentic research)                                             | product               | 🔴     | —          | Proper agentic research vs current Perplexity quick mode                                    |
| BL-034 | Image generation for visual deliverables                                                     | product               | 🔴     | —          | One-pagers, infographics, social cards                                                      |
| BL-035 | iOS + Android mobile apps                                                                    | product               | 🔴     | —          | Mobile-native expansion                                                                     |
| BL-036 | PostHog analytics + billing instrumentation                                                  | infra                 | 🔴     | —          | Observability + product analytics foundation                                                |
| BL-009 | Premium features bundle — voice mode, reminders, Projects                                    | product               | 🟡     | —          | Voice mode tracked separately at BL-027                                                     |
| BL-014 | Ship PMM Sherpa as a Claude Code skill + monetize                                            | gtm                   | 🟢     | 2026-04-11 | Explored: build as MCP server first (reaches Claude Code + 5 other surfaces), wrap with Skill — see _Distribution architecture_ entry |
| BL-018 | Build Claude skill (Anthropic app) with subscription or per-token pricing                    | gtm / pricing         | 🟢     | 2026-04-11 | Explored: Skill is voice wrapper, billing lives at MCP layer — see _Distribution architecture_ entry |
| BL-029 | Daily scrape + insights pipeline                                                             | automation            | 🟡     | 2026-04-10 | Partially covered by Sherpa Digest in _Automation Stack_ entry                              |
| BL-008 | Tier ladder with $12.99 chats + $39.99 projects + $99.99 creator                             | pricing               | 🟢     | 2026-04-10 | Evolved into Starter $11.99 / Explorer $19 / Studio $39 / Army $99 — see _Pricing_ entry    |
| BL-025 | Grand product vision — Sherpa Explorer / Studio / Army tier architecture                     | product               | 🟢     | 2026-04-10 | Locked in _Pricing_ entry                                                                   |
| BL-005 | Install n8n-as-code + build automation workflows on self-hosted n8n                          | automation            | ✅      | 2026-04-10 | Done; see _Growth & Outreach Automation Stack_ entry                                        |
| BL-017 | ~~Gemma 4 local fine-tune on personal data~~                                                 | tech                  | ❌      | —          | Author rejected in original list                                                            |
| BL-037 | Automated research report and intelligence gathering form LinkedIn and YouTubr |  | 🔴 | — |  |
| BL-038 | Organizational context layer — per-tenant knowledge graph alongside Sherpa corpus | product / tech | 🟢 | 2026-04-17 | Explored: Karpathy Wiki for org layer + vector RAG for shared corpus + incremental graph edges. Full architecture in Obsidian. See dated entry above. |
| BL-039 | Cloudflare + bot protection — rate limiting, Turnstile CAPTCHA, security headers | infra | 🔴 | — | Revisit after launch reset. Current state: no rate limiting, no CAPTCHA, no WAF. Manual approval gate is stopgap. Quick wins identified: Turnstile on access-request, per-IP rate limit on /api/chat, security headers in vercel.json. |

---

## 2026-04-11 — Distribution architecture: MCP + Skills + ChatGPT App, one backend

**Context:** Revisiting the MCP angle from the 2026-04-10 pricing entry. User feedback from PMM Sherpa users keeps surfacing the same friction — they don't want to switch tools. They live in Claude Desktop, Claude Code, ChatGPT, Cursor, and Notion. Asking them to come to pmmsherpa.com is asking them to change a habit. Strategic question: is MCP the right architecture, should we build Claude Skills instead, should we ship a ChatGPT GPT, all of the above, and how do we charge for any of it? Advisory produced via the `/pmm-sherpa` skill (RAG across Ramanujam, Kyle Poyar, Voje, Lauchengco, Weinberg, PMA blogs) plus web research across 20+ primary sources (Anthropic, OpenAI, Google, Stripe, Linear, Notion, HubSpot, Forrester, Superhuman, a16z, Metronome, Finout, Jan–April 2026 MCP/Skills announcements).

### The 2026-04-10 pricing entry still stands. The architecture around it needs refinement.

The credit-pack + metered pricing logic is right. The architecture was half-baked — "MCP server as the second interface" framed the whole thing as a Claude Code power-user play. In reality, MCP + Claude Skills + ChatGPT Apps SDK now give one backend access to **6+ distribution surfaces**, and that changes the economics.

### The research changed three things I thought I knew

**1. MCP is no longer the Claude-only play.** Anthropic donated MCP to the Agentic AI Foundation (Linux Foundation) in December 2025. OpenAI, Google, Microsoft all support it. The ChatGPT Apps SDK launched at DevDay October 2025 and **is MCP-compatible under the hood**. 6,400+ MCP servers registered in the Anthropic Registry by February 2026. **A single remote MCP server now reaches Claude Desktop, Claude Code, Cursor, Windsurf, Zed, VS Code, Raycast, Gemini CLI, ChatGPT Apps, and any client that lands next week.** One build, many surfaces.

**2. Claude Skills are not a competitor to MCP. They're the voice layer on top of it.** Anthropic's own framing: "MCP handles connectivity. Skills teach Claude how to use it well." Skills are markdown + scripts + templates that inject into Claude's context via progressive disclosure. They can call an MCP server. The clean pattern is:

- **MCP server** owns auth, RAG retrieval, citations, billing.
- **Claude Skill** owns voice, workflow, the "second brain" framing, the Layer 4 anti-slop system prompt.
- **Skill calls MCP.**

Anthropic launched the Claude Marketplace in limited preview on **March 6, 2026** with Snowflake, GitLab, Harvey, Rogo, Replit, Lovable — and **takes 0% commission at launch**. Enterprises with committed Claude API spend can apply it to third-party Claude-powered apps. This is the most builder-friendly AI marketplace economics on the board. Apple's 30%, nowhere in sight.

**3. Skip Gemini. ChatGPT is essentially free through MCP anyway.** Gemini Gems can't call arbitrary external APIs. The path into Google is Vertex AI Agent Builder, which is an enterprise motion. Not Day 1. ChatGPT Apps SDK is MCP-compatible, which means a well-built remote MCP server is 80% of the way to being a ChatGPT App — just needs a manifest and OpenAI OAuth redirect. **Skip Gemini Day 1, get ChatGPT for near-free via the MCP adapter.**

### The architecture: one backend, three adapters, six+ surfaces

```
                    ┌─── MCP server (OAuth 2.1, Streamable HTTP)  ─┐
                    │    reaches: Claude Desktop, Claude Code,     │
                    │    Cursor, Windsurf, Zed, VS Code, Raycast,  │
                    │    Gemini CLI                                │
                    │                                              │
 Auth + RAG backend ├─── Claude Skill ──────────────────────────── │
 (Supabase + Vercel │    voice + workflow wrapper around MCP       │
 + Stripe metered)  │    distributed via claudemarketplaces.com    │
                    │    + Claude Marketplace (enterprise preview) │
                    │                                              │
                    └─── ChatGPT App (Apps SDK, MCP-compatible) ───┘
                         external checkout for billing, same backend
```

Linear, Notion, HubSpot, Stripe, Atlassian, and Granola have converged on exactly this pattern. Granola raised $125M Series C at a $1.5B valuation in 2026 on one thesis: "be the context layer across all AI clients." That's the north star, not Jasper's standalone UI play (which bled share to embedded AI in 2024–2025).

### Corpus voice on why this is the right call

**Gabriel Weinberg, *Traction*, Ch. 20 — Existing Platforms.** Weinberg documented this in 2014 as one of 19 traction channels: "Web sites, apps, or networks with huge numbers of users you can potentially leverage to get traction." The Anthropic MCP Registry is an existing platform with 6,400 servers and growing. Claude Marketplace is an existing platform with 1M+ Claude.ai users. ChatGPT App Directory is an existing platform with 800M weekly active users. **The playbook maps directly to 2026 AI distribution surfaces.** Don't build a new beach. Ride the wave to where the surfers already are.

**Kyle Poyar, *From Selling Access to Selling Work* (Growth Unhinged).** Poyar's killer math: subscription SaaS captures 10–15% of economic value delivered to customers. Success-based billing captures 20–30% because there's a more direct correlation between product and result. **The bigger your value-capture margin, the bigger the pricing power** — which means you can afford to be embedded inside Claude Code or ChatGPT as a per-call product and still make real money. Per-seat SaaS could never have afforded this.

**Madhavan Ramanujam, *Monetizing Innovation*.** Ramanujam's "don't rush to usage just because" framework is directly on point. His criteria for when usage-based pricing makes sense:

- Low commit / less friction (true: a PMM tries a query inside Claude Code and doesn't want to subscribe upfront)
- Variable usage month over month (true: PMMs run 80 queries during launch crunch, 2 queries during shipping weeks)
- Transparency and fairness demanded (true: developer audiences in Cursor and Claude Code expect per-call pricing clarity, not seat math)

Ramanujam's Optimizely case applies directly: Optimizely priced per user until they realized users had nothing to do with value. MUVs (monthly unique visitors) correlated with customer outcomes, so they moved there and revenue followed. **For PMM Sherpa, the analogous metric is completed advisory queries**, not seats and not raw tokens. "Michelin charges for miles driven, not tires shipped."

**Martina Lauchengco, *Loved***, Ch. on pricing: the metric must be **easily measurable**, understandable by a CFO, and aligned with value. **1 credit = 1 advisory query** passes all three. Don't fragment by complexity the way Clay does (1 credit vs 75 depending on operation) — Clay's customers are operators who speak in credits. PMM Sherpa customers are PMMs and founders who want the answer, not a complexity taxonomy.

**Maja Voje, *The Go-to-Market Strategist*.** Value-based pricing with feature-differentiated bundles outperforms other SaaS pricing models by 30%+ in expansion revenue. The hybrid Starter subscription + credit pack model from the 2026-04-10 entry is value-based. Keep it.

**PMA Blog, "How to communicate your AI pricing model."** Usage-based pricing "directly ties cost to the value the customer receives." The storytelling frame for PMM Sherpa's MCP pricing is not "pay per call" — it's "pay per advisory query completed." Sell the outcome, not the infrastructure.

### Pricing: refined with real 2026 benchmarks

The 2026-04-10 entry landed at $15 / $49 / $149 credit packs (effective $0.075–$0.15 per query) and $0.20/query pay-as-you-go. Research confirms this is approximately right with one adjustment.

**The real 2026 benchmark for "reasoning over proprietary data" has stabilized:**

| Product | Per-query cost | Category |
|---|---|---|
| Exa Search | ~$0.007 | Dumb retrieval |
| Perplexity Sonar base | $0.01–$0.02 | Cheap chat |
| Clay Data Credit | ~$0.05 | Simple enrichment |
| Tavily Research | $0.12–$2.00 | Credit-weighted deep search |
| **Perplexity Sonar Deep Research** | **$0.41** | **The comp: deep reasoning over web** |
| Intercom Fin | $0.99 per resolution | Outcome-based |

**PMM Sherpa's defensible position:** price **below** Perplexity Sonar Deep Research while offering **higher-signal proprietary output** grounded in 38K chunks no competitor has. Land at **$0.20–$0.25 per deep query** for pay-as-you-go. Keep the credit pack effective rate at $0.075–$0.15 for bulk commitment. The 2026-04-10 pack prices stand.

**One adjustment — Army tier MCP allowance.** 500 credits/mo inside the $99 Army tier was aggressive. Drop to **300 credits/mo** for unit-economics headroom. Implied bundled price $0.33/credit vs external $0.20 PAYG floor and $0.15 pack floor. The ~40% premium on bundled credits is deliberate — bundling is convenience, not discount. Subscribers get the security of a ceiling, not a per-unit markdown.

### The "don't make me switch tools" data is now decisive

Your users keep telling you this. The 2026 research just confirmed what they've been saying:

- **82% daily AI adoption inside familiar surfaces** (email, calendar, messaging) vs **65% for standalone chatbots**. (Superhuman, *State of AI Adoption Trends*, 2026.)
- **93% of professionals say AI is essential. Only 20% say it's deeply integrated into their company's tools.** The #1 implementation blocker is integration. Not budget. Not motivation. **Integration.** (Notion, *Everyone Wants AI, That Isn't Enough*.)
- **$450B/year lost to context switching** in the US economy. Knowledge workers switch apps every 40 seconds (~720 switches/day). 23 minutes 15 seconds to fully refocus after an interruption (UC Irvine).
- **Warp** grew from $1M ARR every 300+ days to $1M every 5–6 days after embedding AI in the terminal. **Revenue up 19x year over year.** 40–50% of programming tasks completed via AI prompting inside Warp.
- **Granola** raised $125M Series C at $1.5B valuation on one thesis: "be the context provider across all AI clients."
- **JetBrains** published a Feb 2026 blog titled, literally, "AI tool switching is stealth friction — beat it at the access layer."

The standalone pmmsherpa.com web app is not dead, but it should be **repositioned as the billing + onboarding + admin console**, not the primary usage surface. Daily usage happens inside Claude, ChatGPT, Cursor, Raycast. This is the Linear/Notion/HubSpot/Granola/Warp pattern. It is not the Jasper pattern.

### Revised ship order

**Phase 1 — Ship the MCP server (2 weeks)**
1. Build remote MCP server on existing Supabase/Vercel backend. Streamable HTTP transport, OAuth 2.1 with PKCE required, Client ID Metadata Documents (CIMD) for registration. Use WorkOS or Clerk for OAuth provider (WorkOS has the strongest MCP-specific auth docs per TrueFoundry case study).
2. Expose 2–3 tools to start: `query_pmm_sherpa` (deep advisory), `search_corpus` (lookup-only), optionally `validate_artifact` (review mode).
3. **Free during beta.** Instrument usage per user. Register in the Anthropic MCP Registry.

**Phase 2 — Ship the Claude Skill (1 week)**
4. Package PMM Sherpa's existing voice + workflow + Layer 4 anti-slop system prompt as a Skill.
5. Skill calls the MCP server under the hood (separation of concerns: Skill owns voice, MCP owns data + auth).
6. Publish to `github.com/anthropics/skills` community repo + `claudemarketplaces.com` + `skillsmp.com`.
7. **Apply for Claude Marketplace** (limited preview, 0% commission). Strongest enterprise distribution channel on the board in April 2026.

**Phase 3 — Ship the ChatGPT App (1 week)**
8. Repackage the MCP server as a ChatGPT App via Apps SDK. Mostly a manifest + OpenAI OAuth redirect.
9. Use external checkout for billing. ACP (Agentic Commerce Protocol, Stripe + OpenAI co-built) as the frontier alternative for in-chat checkout.
10. Submit to the ChatGPT App Directory.

**Phase 4 — Turn billing on (1 week)**
11. Stripe metered billing: $0.20–$0.25/query pay-as-you-go.
12. Credit packs: $15 (100) / $49 (500) / $149 (2,000) — unchanged from 2026-04-10 entry.
13. Web subscription bundled allowances: Free 0 / Starter $11.99 → 0 / Explorer $19 → 20 / Studio $39 → 100 / **Army $99 → 300** (down from 500).
14. Grandfather beta users with 100 free credits on billing launch day.

**Phase 5 — Reposition the web app (ongoing)**
15. New marketing home page copy: "PMM Sherpa inside Claude, ChatGPT, and wherever you already work."
16. Primary CTAs: **"Install in Claude Code"** and **"Install in ChatGPT"**, not "Sign up."
17. Web chat remains for free tier onboarding and for the ~20% of users who prefer a dedicated UI.

**Total shipping time: ~5 weeks of focused work.**

### Open questions to resolve before locking

1. **Claude Marketplace enterprise pipeline.** 0% commission now — does Anthropic add commission later? Apply for the preview this month while economics are friendly. Who are the first 3 enterprise targets? Suggestion: run the 164-person user list from yesterday's outreach and see which companies have 3+ users. Those are the organic enterprise signals.
2. **MCP auth provider.** WorkOS vs Clerk vs self-hosted Supabase OAuth. WorkOS has the strongest MCP-specific docs and per-user token refresh. Decide in week 1 of Phase 1.
3. **Credit unit semantics.** Keep 1 credit = 1 query regardless of complexity? **Recommendation: yes, flat.** Lauchengco's "must be easily measurable" principle wins over precision. Accept the margin variance.
4. **Does the web app eventually become fully free?** If Claude Marketplace / ChatGPT Apps become the primary revenue channel, maybe pmmsherpa.com flips to unlimited free chat (no projects, no memory) and revenue flows entirely through MCP credits + enterprise seats. Needs customer interview validation — use Voje's Van Westendorp or Gabor-Granger on the 15–30 most engaged users from testimonial email replies.
5. **Free-during-beta window length.** 4 weeks hard cap. Indefinite free trains users to expect free and kills credit-pack conversion.
6. **Existing $11.99 Starter vs MCP-only strategy.** If MCP + Marketplace becomes the primary channel, does $11.99 Starter even ship? Probably yes — it captures price-sensitive users who want a web UI with modest usage, and it pre-dates the MCP shift. But it should not be the strategic centerpiece. Validate against a 10-customer interview round before shipping the Starter tier.

### What NOT to do

- **Don't build a Gemini Gem.** No external API path, no monetization, wrong surface. Re-evaluate in 6 months if Google adds MCP connector support to Gems.
- **Don't ship the MCP server as a free indefinite loss leader.** 4-week beta window max.
- **Don't fragment credit accounting.** 1 credit = 1 query.
- **Don't price above Perplexity Sonar Deep Research ($0.41).** Ceiling for per-query products in 2026 unless you have enterprise account management behind it.
- **Don't skip OAuth 2.1 + PKCE.** Mandatory per Nov 2025 MCP spec. Skipping blocks enterprise buyers and raises security flags in Claude Marketplace review.
- **Don't lead PMM Sherpa marketing with "our web app."** Lead with "inside Claude / inside ChatGPT / inside Cursor." That framing is the whole value proposition.

### Sources consulted

**Corpus RAG (via `/pmm-sherpa` skill):**
- Kyle Poyar, *From Selling Access to Selling Work* (Growth Unhinged Substack) — value capture math
- Madhavan Ramanujam, *Monetizing Innovation*, p.266+ — subscription vs usage decision framework, Optimizely MUV case
- Martina Lauchengco, *Loved: Rethinking Product Marketing*, p.126 — pricing metric must be measurable + CFO-understandable
- Maja Voje, *The Go-to-Market Strategist*, p.169, p.187 — value metric framework, WTP testing (Van Westendorp, Gabor-Granger)
- Gabriel Weinberg, *Traction*, Ch. 20 — Existing Platforms as a traction channel
- PMA Blog, "How to communicate your AI pricing model" — usage-based is current default for outcome alignment
- PMA Blog, "The state of usage-based pricing" — hybrid subscription + metered now dominant

**Web research (primary sources, April 2026):**
- Anthropic Claude Marketplace launch announcement (March 6, 2026) — SiliconANGLE, VentureBeat, PYMNTS
- Anthropic MCP Registry preview (Sept 8, 2025); 6,400+ servers as of Feb 2026 — Pento, Nevermined
- Model Context Protocol specification Nov 25, 2025 — modelcontextprotocol.io
- MCP Authorization spec (OAuth 2.1 + PKCE + CIMD) — modelcontextprotocol.io
- Anthropic donates MCP to Agentic AI Foundation (Dec 2025) — TechCrunch
- Anthropic "Extending Claude with Skills and MCP" positioning essay — claude.com/blog
- OpenAI ChatGPT Apps SDK launch at DevDay (Oct 2025) + monetization docs
- x402 + Stripe Machine Payments Protocol launch (March 18, 2026) — WorkOS
- Linear, Notion, HubSpot, Atlassian, Stripe remote MCP implementations
- Perplexity Sonar Deep Research pricing ($0.41/query typical) — Finout April 2026
- Exa, Tavily, Brave, Firecrawl, Clay, Apify current pricing pages
- Granola Series C announcement ($125M, $1.5B valuation) — context layer thesis
- Superhuman "State of AI Adoption Trends" — 82% vs 65% embedded vs standalone
- Notion, "Everyone Wants AI, That Isn't Enough" — 93% want / 20% have integrated
- Warp First Round Review case study — 19x revenue growth from terminal-embedded AI
- JetBrains blog (Feb 2026), "AI tool switching is stealth friction"
- a16z, "Notes on AI Apps in 2026"; Stratechery 2026 AI essays
- WaymakerOS, $450B context-switching cost
- Forrester + SaaStr/Gartner, 15.2% enterprise software spend growth 2026
- Metronome, "2026 trends from cataloging 50 AI pricing models"
- Internal: 2026-04-10 pricing entry (immediately below this one)

### Backlog updates

- **BL-014** (Ship PMM Sherpa as Claude Code skill + monetize) → 🟢 explored 2026-04-11. Resolution: build as MCP server first (reaches Claude Code plus 5 other surfaces), wrap with Skill for Anthropic-native distribution, expose for ChatGPT via Apps SDK.
- **BL-018** (Build Claude skill with subscription/per-token) → 🟢 explored 2026-04-11. Resolution: Claude Skill is the voice wrapper, not the billing primitive. Billing lives at the MCP server layer via Stripe metered + credit packs.

---

## 2026-04-10 — Pricing: $11.99 Starter tier + MCP consumption model

**Context:** Evaluating a $11.99 paid tier and a consumption-priced MCP server. Stripe billing account ready. Advisory produced via the `/pmm-sherpa` skill — RAG queries across Ramanujam, Kyle Poyar, Lauchengco, PMA blogs, plus Perplexity research on MCP monetization landscape and current API pricing benchmarks.

### The real question behind both decisions

Two different pricing questions that feel related but have different answers. The web tier is a **packaging** question — how to build a ladder that invites people in cheap, then earns more as they get value. The MCP server is a **metric** question — what's the unit of consumption, and does it match the value customers get.

Ramanujam's Optimizely case: they priced per user until they realized users had nothing to do with value. MUVs (monthly unique visitors) correlated with customer outcomes, so they moved there, and revenue followed. "Michelin charges for miles driven, not tires shipped." Keep that idea close. It decides both of these.

### Recommendation 1: $11.99 as a Starter tier INSERTED below Explorer, not replacing it

Two versions of this move go to very different places:

- **Version A (risky):** replace the $19 Explorer with $11.99. Captures volume but undermines the ladder. Trains the market to anchor low. Upgrading to $39 Studio feels like a 3.3x leap instead of 2x. Puts PMM Sherpa in head-to-head with Claude Pro / ChatGPT Plus ($20 each) — a fight to avoid.
- **Version B (commit to this):** keep Explorer at $19 and insert $11.99 as a **Starter** tier below it. Starter solves a different problem: capturing price-sensitive PMMs who want more than 5 free conversations but aren't ready to make Sherpa their daily driver yet.

**Proposed ladder:**

| Tier | Price | Unlocks | Monthly call cap |
|---|---|---|---|
| Free | $0 | Quality showcase | 5 conversations |
| **Starter** | **$11.99** | Unlimited-feel, Claude model only, no projects, no memory | **100 conversations (soft cap)** |
| Explorer | $19 | Projects, memory, Gemini, web research, file upload | Unlimited |
| Studio | $39 | Everything + connectors + brand voice + unlimited projects | Unlimited |
| Army | $99 | Everything + multi-agent + meeting companion + MCP credit allowance | Unlimited |

**Starter cap rationale (unit economics):** at ~$0.04/call average, 30 calls costs $1.20 (90% margin), 100 calls costs $4 (67% margin), 300 calls costs $12 (breakeven/loss). Starter needs a 100-conversation ceiling. Position as "more than enough for individual use" — let power users self-select into Explorer. Linear uses this exact wall at their $8/seat tier to push teams into $14 Business.

**Explorer differentiation (critical):** projects + memory are the compounding value gates. Kyle Poyar calls this "the stickiness gate" — once a user has built up context and memory, the switching cost rises every week, and Explorer becomes the natural home.

**Tension to acknowledge:** $11.99 is close enough to $9.99 that some will read it as "cheap SaaS." Alternatives: $12 flat (no .99) or $14. Hold at $11.99 because the decoy effect (middle option adoption increases 35-50% when flanked correctly) is strongest when spreads feel meaningful — $11.99 → $19 reads more meaningful than $14 → $19.

### Recommendation 2: MCP server = hybrid (credit packs + pay-as-you-go), bundled into web tiers

**Landscape check (Perplexity research, Apr 2026):**
- No MCP servers are charging for consumption through the MCP protocol itself today. Examples that exist (altFINS, ScrapingBee) are subscriptions with credit allowances, not per-call billing.
- Anthropic's MCP Registry roadmap hints at metering — nothing shipped. Early but not reckless.
- altFINS pattern: Hobbyist $39/mo (100k credits), Startup $99/mo (300k), Standard $299/mo (1M), Professional $699/mo (3M).
- Corpus agrees with direction: PMA blog "From Features To Outcomes" names hybrid (base fee + consumption) as the emerging norm. Clay uses credits with complexity weighting. Intercom Fin uses $0.99 per successful resolution as an add-on.

**Value per MCP call is higher than a search API.** Perplexity Sonar: ~$1 per 1M input tokens. Exa/Tavily: $0.005-$0.025 per query. Those are "dumb" tools (single retrieval). A PMM Sherpa MCP call does query planning, 2-4 parallel RAG queries across 9 corpus layers, and LLM synthesis. Cost per "smart query" ≈ $0.025. Value per query is an order of magnitude higher because output isn't raw chunks — it's reasoning grounded in 38K chunks of PMM wisdom. **Don't price it like a search API. Price it like domain expertise on tap.**

**Proposed MCP pricing:**

**Credit packs (one-time, no subscription needed):**

| Pack | Credits | Price | Effective per-query |
|---|---|---|---|
| Taste | 10 | Free trial grant | — |
| Starter | 100 | **$15** | $0.15 |
| Pro | 500 | **$49** | $0.098 |
| Scale | 2,000 | **$149** | $0.0745 |

**Pay-as-you-go:** $0.20/query via Stripe metered billing (native support, small integration).

**Web subscription MCP allowances (the hybrid bundling):**

| Web tier | MCP credits included / month |
|---|---|
| Free | 0 |
| Starter $11.99 | 0 |
| Explorer $19 | 20 |
| Studio $39 | 100 |
| Army $99 | 500 |

**Design decisions:**
- **1 credit = 1 MCP query.** Don't fragment by complexity like Clay does (1 credit vs 75). Clay's customers are operators who understand the distinction. PMM Sherpa customers (PMMs, PMs, founders) want the answer and don't care how many parallel RAG queries ran underneath. Margin still works: $0.15/credit against $0.025 cost.
- **Web users can upgrade tier OR buy credit packs** to access MCP. Expansion revenue from two directions.
- **MCP-first users (Claude Code power users) can stay outside the web entirely.** Credit packs monetize them without forcing a subscription.

### How the two decisions connect

Not two products. **One product with two interfaces.** Web app for chat UI. MCP server for "PMM Sherpa inside whatever tool you already use."

Pricing reflects that:
- Studio subscriber shouldn't start over to use the MCP — gets 100 credits bundled.
- Developer who buys $49 pack but never opens the web app still has a real reason to upgrade to Explorer later (memory + projects are valuable in the web UI in ways they aren't via MCP).

**Unifying frame:** selling access to PMM Sherpa's advisory intelligence, **metered by consumption, packaged by interface**. Ramanujam would approve. Value metric = advisory queries completed. Packaging tier = which interface and how much context you bring.

### Ship order

Three decisions in sequence. Don't try to ship all at once.

1. **Ship Starter $11.99 first.** Lowest-risk, clearest revenue path. Infrastructure already exists (Supabase, Stripe, Claude Sonnet). Only new work: 100-conversation soft cap logic + new Stripe product. 1 week of dev. Validate $11.99 converts against $19 before touching MCP.
2. **Ship MCP server free during beta.** Anthropic-approved playbook for new MCP servers. Banner: "free during beta, will transition to credits on [date]." Measure real usage for 2-4 weeks before attaching a price.
3. **Credit pack billing layer last.** Launch credit packs the day beta ends. Stripe metered + one-time charges handle both subscription bundles and pack purchases. Grandfather beta users with a 50-credit grant — costs almost nothing, converts better than a cold "now pay us" email.

### Open questions (answer before locking prices)

Three things the corpus flagged that might change the numbers:

1. **Is the Free tier actually good enough?** Kyle Poyar's refrain from the RAG results: most PLG companies gate too aggressively at Free, killing conversion. 5 conversations may be too few to hit the "oh, this thing understands PMM differently" moment. Test 10 free conversations. Extra 5 costs ~$0.20 per user. Could double free-to-paid rate.
2. **What's the real willingness-to-pay ceiling?** Ramanujam's book is about asking the question you haven't asked yet. Talk to 20 PMMs who already love PMM Sherpa. Ask "what would you pay for unlimited access." Distribution is likely higher than $19 for the top half. Opens a Starter $11.99 + Explorer $29 split with a more obvious Studio upgrade path.
3. **Is the MCP customer the same as the web customer?** If MCP buyers are Claude Code power users (developers, technical founders, PMMs in terminals), they'll tolerate higher prices per query. If they're the same PMMs paying $19 for the web, they'll feel double-charged. Decide before bundling — changes whether the Explorer 20-credit allowance is a hook or a distraction.

### Stripe implementation notes

- **Products to create:** Starter ($11.99 recurring), Explorer ($19 recurring), Studio ($39 recurring), Army ($99 recurring), MCP credit packs ($15 / $49 / $149 one-time).
- **Metered billing** for pay-as-you-go MCP at $0.20/query. Stripe's native support for usage records via API.
- **Customer portal** for self-service tier changes and credit pack purchases.
- **Usage recording** for Starter tier soft cap enforcement (count conversations per billing period, block or upsell at 100).

### Sources consulted
- Ramanujam, *Monetizing Innovation* (Optimizely MUV case, willingness-to-pay framework, price integrity)
- Kyle Poyar, *Growth Unhinged* (PLG pricing, "stop gating features that make customers successful," usage-based pricing 2.0, state of usage-based pricing)
- Martina Lauchengco, *Loved* (per-seat vs usage-based pricing tradeoffs, "cheap vs best" psychological spectrum)
- Maja Voje, *The Go-to-Market Strategist* (value metrics framework)
- PMA Blog: "From Features To Outcomes — The New Rules Of AI Pricing" (hybrid base+consumption is becoming norm)
- PMA Blog: "How to build a winning API monetization strategy"
- Perplexity research (Apr 2026): MCP monetization landscape, altFINS/ScrapingBee credit models, Anthropic MCP Registry roadmap
- Internal pricing roadmap doc (`PMM Sherpa - Pricing & Strategy Roadmap.md`) for current tier thinking and unit economics baseline

---

## 2026-04-10 — Growth & Outreach Automation Stack (n8n + PMM Sherpa RAG)

**Context:** n8n upgraded to 2.15.1 on Hostinger; `n8nac` (n8n-as-code CLI) deployed globally on Mac and VPS. Web research done on 2026 growth/outreach/newsletter automation patterns (Kyle Poyar, Elena Verna, Clay, Smartlead, beehiiv, HeyReach, Lenny, Morning Brew, The Rundown AI, TLDR AI). Goal: build automations on top of PMM Sherpa's 38K-chunk corpus that make the moat visible to audiences.

### Strategic framing
PMM Sherpa's moat is the **38,213-chunk corpus across 9 layers** (34 books, 583 podcasts, 532 Sharebird AMAs, 827 PMA blogs, 23 substacks, 790 thought leader posts from Kyle Poyar/Elena Verna/Wes Bush/Ann Handley/Mark Schaefer/Neil Patel) + Layer 4 anti-slop voice. Every competing AI marketing newsletter/reply bot writes from the same generic GPT prior. PMM Sherpa is the only automation stack that can produce content grounded in April Dunford Ch.4, Monetizing Innovation's price fences, Wes Bush's PLG loops — with actual citations. Every automation below calls the RAG brain and makes that defensibility public.

**2026 research insights driving the design:**
- Signal density beats volume; reply rates on signal-triggered outbound are 15–25% vs 1–3% for generic cold.
- LinkedIn's 2026 ML classifiers detect AI-generated comments with 97% accuracy — human approval gates are mandatory.
- No AI newsletter above 100K subs is fully automated; top newsletters have a human editorial layer. Layer 4 voice = taste as code.
- Kyle Poyar calls "personal emails from founders" the biggest untapped pipeline source of 2026.
- Product Hunt 2026 algo now weights comments 4x more than upvotes.
- Post-funding (Series A/B) is the highest-intent SaaS buying window; wait 2–4 weeks after announcement.

### Flagship: "Sherpa Digest — State of PMM" (automated weekly newsletter)

The highest-leverage first build. Every claim in every issue is backed by a specific book chapter, podcast timestamp, or practitioner AMA from the corpus.

**Source signals (n8n cron Monday 6am):**
- Lenny's new episode (RSS)
- PMA new blog post (RSS)
- Kyle Poyar, Elena Verna, Wes Bush, Ann Handley, Mark Schaefer substacks (RSS)
- New Sharebird AMAs (scrape)
- Product Hunt top SaaS launches of the week (PH API)
- Crunchbase/Harmonic Series A-C B2B SaaS announcements
- r/ProductMarketing top weekly thread (Reddit API)

**Pipeline:**
1. Collect all week's signals → Claude scores for newsworthiness
2. For top 7, call PMM Sherpa `/api/rag-synthesize` — corpus retrieves relevant book chapters, past podcast quotes, AMAs that contextualize the signal
3. Synthesize into Layer-4-voice blurbs
4. Render beehiiv-compatible HTML
5. Slack approval gate → send via beehiiv
6. Auto-post top 3 as LinkedIn posts, top 1 as X thread

**Sections:**
- **This Week in PMM** — 3 signals with corpus-backed analysis
- **Frameworks Collide** — one tension (e.g. category design vs narrow positioning), what Moore/Dunford/Lochhead each say
- **Reader Q of the Week** — from Sharebird/Reddit, answered with corpus
- **Launch Autopsy** — one PH launch scored against Mary Sheehan's launch playbook
- **Hidden Gem** — one surprising chunk only the corpus long-tail would surface
- **Signal Watch** — one automation pattern to steal

**Growth engine:** beehiiv referral program + SparkLoop + swaps with Growth Unhinged / Kyle Poyar / PMM Made Simple / PMA newsletter. Each issue is top-of-funnel to the paid tier (Stripe ships soon).

### 10 Companion Automations (ranked by leverage)

1. **Approved Reply Engine** — Trigify watches 15 target PMM accounts (April Dunford, Kyle Poyar, Emily Kramer, Elena Verna, Wes Bush, Anthony Pierri, Claire Suellentrop). On new post: RAG PMM Sherpa → 3-sentence substantive reply → Slack/Telegram approval → post via LinkedIn API. Human gate beats LinkedIn's AI-slop detector because replies are corpus-grounded.

2. **Hiring Signal → Corpus Outbound** — Clay/TheirStack monitors "Product Marketing Manager", "Head of PMM", "first PMM hire" postings. Enrich hiring manager via Apollo → RAG PMM Sherpa for company's stage/category (Series A → Moore's Chasm + Dunford; PLG → Wes Bush; enterprise → Maja Voje) → cold email with corpus-cited frameworks → Smartlead rotates 5–15 warmed inboxes. Ships after Stripe billing goes live.

3. **New Episode → Instant Carousel** — Lenny/PMA RSS fires → pull transcript → RAG corpus for referenced frameworks → generate LinkedIn carousel "5 frameworks [Guest] referenced in this week's episode, and where to go deeper" → render via Bannerbear/Canva API → Typefully schedules → tags host/guest. Borrows their audience while positioning PMM Sherpa as the companion brain to every PMM podcast.

4. **Question Hunter** — Monitors r/ProductMarketing, Sharebird new questions, LinkedIn PMM Q's. Classify signal strength → RAG corpus → draft reply with 2-3 citations → Telegram approval → post from your own account. You already have 532 AMAs in the corpus — act like the incumbent expert.

5. **Podcast Guest Booking Engine** — Podscan/Listen Notes finds 20 PMM podcasts → RAG corpus for topic angles tied to their audience (from their past episodes via Podscan) → draft personalized pitch with framework gaps → Smartlead from personal inbox (Kyle Poyar's personal email pattern, 30–50% reply rates). Every podcast = PMM Sherpa demo to 5–50K PMMs.

6. **AI-Slop Antidote** — Monitors X+LinkedIn for posts on "AI slop", "AI content authenticity". Verify ICP → RAG corpus (you have 173 Ann Handley + 253 Mark Schaefer posts) → reply that cites their own past work + Layer 4 voice philosophy. Positions PMM Sherpa as the anti-slop AI. Ann and Mark will notice being cited back to themselves.

7. **Framework Collision Engine** — 3x/week LinkedIn posts. Pick a PMM tension (category design vs positioning, freemium vs free trial, outbound vs PLG) → RAG corpus for what 3–5 books/practitioners say → synthesize contradiction and resolution → schedule via Publer. Impossible for competitors without the corpus.

8. **Launch Week Whisperer** — PH API finds daily SaaS launches in PMM-adjacent categories. RAG Mary Sheehan + PMA launch chunks → substantive comment with specific framework suggestion → DM founder offering free PMM Sherpa access. PH 2026 algo weights comments 4x; converts to trials.

9. **Funding Round Framework Drop** — Harmonic/Crunchbase webhook on B2B SaaS Series A–C. Wait 2–4 weeks → enrich CMO/Head of Marketing → RAG corpus for stage-appropriate playbook → cold email with specific frameworks → Smartlead. Highest-intent SaaS buying window.

10. **Reply Classifier + Router** — Smartlead webhook on replies. Claude classifies (interested / not now / wrong-person / OOO / hostile) → interested routes to inbox with corpus-primed response draft → not-now adds 90-day dormancy → wrong-person auto-asks for intro → OOO extracts return date. Recovers 20–30% of otherwise-lost replies.

### Prioritized build sequence

**Phase 1 — Distribution moat (next 2 weeks)**
1. Sherpa Digest newsletter MVP (3 sections, manual approval, beehiiv)
2. Framework Collision posts (#7) — cheapest content engine
3. Approved Reply Engine (#1) — quick signal capture

**Phase 2 — Pipeline (after Stripe billing ships)**
4. Hiring Signal Outbound (#2)
5. Reply Classifier (#10)
6. Question Hunter (#4)

**Phase 3 — Audience expansion**
7. New Episode Carousel (#3)
8. Podcast Guest Booking (#5)
9. Launch Week Whisperer (#8)
10. AI-Slop Antidote (#6)

### Architecture primitive

All 11 workflows share one primitive: **expose PMM Sherpa's RAG as `POST /api/rag-synthesize`** that takes `{signal, task, sections}` and returns corpus-grounded structured output (bypassing the chat SSE stream). Build it once, reuse everywhere. The moat isn't n8n — it's that one endpoint.

### Dependencies / open questions

- Stripe billing integration (already in active projects) — blocks phase 2
- Trigify account for LinkedIn signal watching (or DIY via LinkedIn API + residential proxies)
- beehiiv account + referral program setup
- Decision: Claude Sonnet vs Opus for automation-side synthesis (latency vs quality tradeoff)
- Decision: one shared automation workspace in n8n or one per workflow file
- PMM Sherpa API key scoping — automations need a service-account key distinct from user chat

### Source
Session 2026-04-10 — web research on 2026 growth/outreach/newsletter patterns + PMM Sherpa corpus synthesis. Research sources include Kyle Poyar (Growth Unhinged 2025–2026), Elena Verna (Racecar Framework), Clay University, Smartlead/Amplemarket/Instantly deliverability guides, beehiiv/SparkLoop growth playbooks, HeyReach case studies, and 8 top AI newsletters (Rundown, TLDR AI, Superhuman AI, Ben's Bites, Neuron, Lenny's, Growth Unhinged, Morning Brew).

---

## Legacy ideas (pre-2026-04-10)

Ideas captured in earlier sessions — originally sourced from Obsidian `Product Ideas.md`, plus OneNote and PDF export notes dating back to Dec 2025. Most are from Session 2026-03-24 (extensive RAG/KB/onboarding strategy session) and Session 2026-03-25 (pricing elevated to pre-launch). Kept in this section for on-demand reference when building or revisiting old threads.

### Quick bullets (loose capture)

- test codebase with codex
- Three orchestration libraries to evaluate:
	- https://docs.conductor-oss.org/index.html
	- https://agentspan.ai
	- https://temporal.io/solutions/ai
- Install https://github.com/EtienneLescot/n8n-as-code and start building automations (market research to Google Docs) ✅ **DONE 2026-04-10**
- VP-level mandate
	- managing politics
	- keep up with the developments in this space. AI changes so quickly. how do we position. or how to launch confidently (Personalized daily newsletters). Research the right sources
	- Reinvent the way i work on a daily basis and tools i use. how i do my job and adopt in new ways
- Homepage embed — one that requires account creation for next chat
- Free tier 3 chats / 3 turns per month → $12.99 for chats, $39.99 for projects + templates + voice, $99.99 for creator/meeting assistant/context graph/connectors/auto-execute
- Premium features — voice mode, reminders, Projects
- Update branding to GTM Sherpa? Showcase advisory advantage of RAG + frontier model vs fine-tuning generic skills
- PDF outputs — blogs, essays, and more
- Create assets like Mutiny (https://www.mutinyhq.com)
- Fine-tune Gemma 4 with real-world assets and pair it with skills for inferencing and multi-agent
- Make it a skill in Claude Code and monetize it
- Make it founder-specific and they will really value this — 3 is too many personas
- Complete skills to create visual campaign assets and artefacts
- ~~Gemma 4 to fine-tune and run locally on your data~~
- Build Claude Code skill + Claude skill and charge for subscription or per-token consumption
- Screenshot to paste
- Imagine the PMM is under fire. They have to logically defend their ideas, feel confident, and not be a jerk — explain it as not just for PMM understanding but for driving cohesion with stakeholders (confidence with leaders, aligned with PM and sales)
- Chunking and RAG — advice, writing tips, actual ebooks, whitepapers, diagrams, one-pagers
- LinkedIn scrapes — PhantomBuster vs Perplexity, why? LinkedIn and X hold the keys to what's happening now. Scrape top company leaders and evangelists, see what they're talking about, and whether there are non-company reactions (partners, customers)
- Long conversations and pasting in transcripts
- Compaction?
- Grand product vision — **Sherpa Explorer** ($9.99, adds projects), **Sherpa Studio** ($29.99, connectors, memory graph for long-running projects), **Sherpa Army** (multi-agent, role playing, critiquing, preparing presentations and interviews, meeting companion that auto-listens and builds memory graph, creator can publish artifacts)
- Self-learning — make it better and sharper
- LlamaParse and Firecrawl for web scraping and document parsing
- Beautiful voice mode for career consultation — voice picks: Eddie, Sterling, Hale, Elizabeth, Ava, Jon, Zara
- Daily scrape and insights
- Gamma connector and Drive connector to bring in files
- Context graphs and Granola integration
- GTM Council — multiple books for personas and psychology, role-play for pitches and negotiations
- Deep Research sorely needed
- Image Generation
- iOS and Android app
- PostHog or similar analytics + billing

### Voice Mode #critical
- **Core idea:** Users operate at the speed of thought. Give them the ability to engage via voice. Respond with ElevenLabs. Have an orb and dictation graph like Claude.

### Intelligent RAG Query Engine (Context-Aware Retrieval) #critical
- **Core idea:** Replace the current "raw message as RAG query" approach with an LLM-powered query planner that reads ALL inputs before generating targeted retrieval queries. This is the single most important quality lever in PMM Sherpa — it defines whether users get mediocre chunks or exactly the right knowledge.
- **The problem today:** RAG uses the raw user message as the search query. "Summarize this article: https://..." generates a useless query. Multi-faceted questions get one embedding that can't capture all dimensions. Conversation context is ignored. URL content isn't used to inform retrieval.
- **New architecture:**
  1. **Phase 1 — Gather inputs** (parallel): URL scraping, attachment text, conversation history
  2. **Phase 2 — Query planning** (Gemini 2.5 Flash Lite): Reads all inputs, understands the knowledge base shape, generates 2-3 targeted RAG queries + a complementary Perplexity query (if enabled). Each RAG query targets a different knowledge dimension.
  3. **Phase 3 — Parallel retrieval:** 2-3 RAG searches + Perplexity run in parallel
  4. **Phase 4 — Assemble + generate:** Deduplicate chunks, structure context by knowledge layer (theory → practitioner → tactical → web → user content), feed to main LLM
- **Key design decisions:**
  - **Gemini 2.5 Flash Lite** as query planner ($0.10/M input, ~100-150ms latency, free tier available)
  - **Query planner knows the KB shape** — prompt describes the three source types (17 books, 540 AMAs, 847 PMA articles) and their strengths, so queries target the right layer
  - **KB is not just frameworks** — it contains practitioner war stories, craft knowledge (copywriting, storytelling, negotiation), strategic thinking, templates, case studies, career guidance. Queries must surface all dimensions, not just "find the framework"
  - **Auto-Perplexity intelligence** — Flash Lite decides when web research is needed (competitor questions, current market data, recent news, pricing intel) vs. when the KB is sufficient. Perplexity toggle removed from UI entirely. User sees status messages like "Searching knowledge base and fetching current market data via Perplexity..." making the experience feel intelligent and transparent.
  - **No DB changes needed** — same `hybrid_search()` function, just called 2-3x with smarter inputs
  - **+150ms total latency** — only the Flash Lite call is additive; everything else is parallel
- **Example transformations:**
  - "Summarize this article: https://..." → reads article → generates queries about the article's core PMM concepts
  - "How should I position against Gong?" → RAG: positioning frameworks + competitive methodology; Perplexity: Gong's current market position and pricing
  - [After 5 msgs about PLG dev tools] "Help with the battlecard" → queries include PLG + dev tools context from history
- **Why this is critical:** Every feature downstream (tone, deliverable quality, citation relevance, advisor credibility) depends on retrieving the right knowledge. This is the foundation.
- **Files to change:** New `query-planner.ts`, update `retrieval.ts` (multi-query + dedup + structured formatting), update `route.ts` (reorder pipeline phases), update `provider-factory.ts` (add Flash Lite config)
- Source: Session 2026-03-24 — extensive knowledge base analysis + RAG strategy design session

### Output Tone & Voice Refinement #high
- **Core idea:** Final output should sound like a professional PM or senior marketer — clear, warm, relatable, and technically precise. Not generic AI, not overly formal, not consultant-speak.
- **Approach:** System prompt tuning with calibration examples. Will provide before/after examples to define the target voice.
- **Depends on:** Intelligent RAG Query Engine (better retrieval → better raw material → better tone)
- Source: Session 2026-03-24

### Onboarding: Frame / Consult / Validate / Career #high
- **Core idea:** Reorganize homepage and in-product welcome screen around 4 use case pillars that map to how PMMs actually work
- **4 pillars:**
  - **Frame** — "Start a new initiative right" (blank-page moments, positioning, GTM planning)
  - **Consult** — "Get an expert opinion fast" (judgment calls mid-project, stuck on a decision)
  - **Validate** — "Check my work before I ship" (review deliverables against professional standards)
  - **Career** — "Level up as a PMM" (skill gaps, transitions, career advice)
- **In-product:** Welcome/empty state shows 4 clickable tiles, each with an example starter prompt
- **Homepage:** New section leading with outcomes, not modes — "Frame it. Get advice. Validate it. Grow." with real example prompts + output snippets per pillar
- **YouTube tutorials:** 4 videos (one per mode) using real past chats as demos
- **Non-PMM angle:** Framing must translate to outcomes, not jargon — relatable to PMs, GTM leads, content marketers
- Source: Session 2026-03-24

### Action Bar Simplification #high
- **Core idea:** Kill the cluttered Perplexity dropdown (3 modes) + globe web search toggle. Replace with a single Research toggle (Perplexity icon)
- **New behavior:** Off = RAG only. On = RAG + Perplexity quick research (`sonar-pro`)
- **Remove entirely:** Deep research mode (broken), provider-native web search tools (Anthropic/Google), auto web search detection
- **Result:** Clean, obvious two-state input bar
- Implementation: Delete `deepResearchEnabled` from chatStore, simplify to plain boolean, clean up `api/chat/route.ts`
- Source: Session 2026-03-24

### URL Scraping via Jina Reader + Firecrawl #high
- **Core idea:** When user pastes a URL, actually fetch and read its content instead of routing to broken native LLM web search tools
- **Plan:** Extract URL from message → fetch via Jina Reader (`r.jina.ai/URL`, free, no API key) → inject clean markdown into LLM context alongside RAG results
- **Fallback:** Firecrawl API for JS-heavy pages or paywalled content (free tier: 500 pages/mo)
- Native LLM tools (Anthropic web_search, Google googleSearch) failed in testing — do not use for URL reading
- Remove URL auto-detection from `search-detection.ts` which currently routes to broken native tools
- Source: Session 2026-03-24

### Sandbox / Staging Environment ✅ DONE 2026-03-24
- **Core idea:** Safe place to test all changes before pushing to production
- **Shipped:** `staging` branch created, `staging.pmmsherpa.com` live on Vercel, all env vars copied to preview scope
- **Workflow:** `feature/*` → `staging` (verify at staging.pmmsherpa.com) → `main` (production)
- Pre-push git hook blocks accidental direct pushes to `main`
- GitHub branch protection: force-push to main disabled
- CLAUDE.md slimmed to ~2.5KB with staging-first workflow baked in as default
- Commit: `a37e80a` on main
- Source: Session 2026-03-24

### Telemetry & Admin Analytics Dashboard #high
- **Core idea:** Product owner visibility into usage — conversations per user, API calls, token consumption, model distribution, active users
- **`usage_logs` table already exists** with model, tokens, latency, endpoint, user_id — just needs a UI
- **Build:** `/admin/analytics` page (admin-only, same auth pattern as existing admin pages) showing:
  - Total conversations (all time + last 30 days)
  - Total tokens by model
  - Per-user breakdown: conversations, messages, tokens
  - DAU/WAU table
  - Model usage distribution
- First step: audit whether `usage_logs` is actually being written on every chat call
- Source: Session 2026-03-24

### Granola → Obsidian Auto-Sync Pipeline #high
- **Core idea:** Use Granola API to automatically push meeting transcripts into Obsidian as markdown notes with correct meta tags (date, attendees, project, client, topic)
- Every meeting ends → notes auto-appear in Obsidian → immediately available to PMM Sherpa's RAG
- No manual effort — meeting happens, knowledge grows
- Meta tags enable filtering by client, project, meeting type
- Related: Technical Roadmap — Granola API integration
- Source: Session 2026-03-24

### Client Context Graph #high
- **Core idea:** Build a context graph layer where ongoing meetings (via Granola) are stored as an evolving project dossier per client
- PMM Sherpa has a living graph of all meetings, decisions, feedback, and action items per client
- Enables: "What did we decide with Client X about pricing in February?" or "What feedback has this client given across all touchpoints?"
- This context layer is the moat — it compounds over time and becomes irreplaceable
- Graph connects: meetings → decisions → feedback → action items → outcomes
- Critical for scaling consulting and multi-client work without losing context
- Related: Vision & Strategy — ongoing project dossier for expanding knowledge
- Source: Session 2026-03-24

### Firecrawl URL-to-Markdown Capture #medium
- **Core idea:** Anytime you find inspiration (tone of voice, writing style, design, competitive examples), run Firecrawl CLI to convert the URL + images into a clean markdown file
- Saved into Obsidian vault in a dedicated `References/` or `Inspiration/` folder
- Available to Claude Code for future dev work — no hunting for links again
- Could be triggered via: CLI command, Obsidian plugin, or n8n workflow
- Captures: full page content, images (downloaded locally), metadata (date captured, source URL, tags)
- Use cases: competitor teardowns, design inspiration, writing style references, framework examples
- Source: Session 2026-03-24

### Voice & Phone Access #high
- Give PMM Sherpa a phone number — call it to get work done (inspired by Deepgram/Deepclaw)
- Fine-tune 8b model + Nvidia Personaplex so you can talk to Sherpa hands-free
- ElevenLabs API for voice assistant in Sherpa
- "Grady likes to chat back and forth with Grok. Hands-free." — voice-first UX is a real user desire
- Source: PDF Mar 16, Mar 21; OneNote PMM Sherpa Ideas 2/20

### Conversation Assistant / Real-Time Copilot #high
- Real-time call transcription with on-screen prompts, questions, and recommendations
- Leo's listening mode — asks for analysis and provides directional cues
- RPG-style interaction: deny it or agree to it
- Source: PDF Mar 18

### Ongoing Scrape + Update + UI Refresh #high
- Automated scrapes across PMA, Sharebird, and other identified sources plus ingestion
- Auto-update number of knowledge sources and chunks on UI
- Daily syncs

### API Product / MCP Server #high
- PMM Sherpa as API product (MCP server, API key)
- Make PMM Sherpa a skill for Claude, OpenClaw, and ChatGPT
- Prove why its RAG is superior to native projects — that's the win
- Source: PDF Mar 21, Mar 16

### Standalone Background Agent #high
- Accepts emails and Slack messages, works in the background (long-running)
- Automation logic to invoke PMM Sherpa on Loom calls, Slacks, Confluence summaries
- Source: PDF Mar 16, Dec 20

### Virtual Product Marketer (Full Agent) #high
- Move PMM Sherpa into OpenClaw; give it voice and chat abilities plus long-form content
- Agents: RAG, web research, creation skills, templates in Google Drive, writing style
- Learning brand voice, tone, style
- Research agent: G2, Reddit, HackerNews, product analysis, YouTube video analysis
- Source: PDF Mar 16

### Categorized Knowledge Chunks #medium
- PMM Sherpa categorize chunks into positioning, pricing, messaging, etc.
- Needs to recognize if it needs marketing insight or only to perform tasks
- Doesn't read websites properly; doesn't need to read knowledge base unless it's a marketing question
- Source: PDF Mar 21; OneNote Quick Notes

### Content Engine Integration #medium
- Self-running content engine with how-to and marketing thoughts
- Content creation agent for blog, social, Substack, LinkedIn
- Distribution via Blotato (blotato.com)
- Email sequences inviting signups
- Source: PDF Mar 16

### Sandbox & Demo Environment #medium
- Sandbox environment for new users to try
- Better on-screen messages
- Sample prompts and starter prompts
- Onboarding video + doc + UX tweaks for use cases + token counts + evals
- Source: PDF Mar 21

### Decision Engine for Agentic Marketing #medium
- Memory, latency, throughput, tool calls
- LlamaIndex + Groq for reasoning and throughput
- Context graphs that always work and never create slop
- Target: agencies, developers
- Source: PDF Mar 16

### Pricing & Monetization #critical ← PRE-LAUNCH
- **Elevated to pre-launch priority (2026-03-25)**
- Three must-ship items before opening access:
  1. **Usage limits & free tier** — Define free conversation cap per user. Conversation counting, limit enforcement, upgrade prompts. Decision needed: per-day limit vs. total lifetime vs. rolling window.
  2. **Stripe billing integration** — Stripe API key available. Pricing tiers, checkout flow, subscription management, webhook handling. Integrate with Supabase profiles (plan field, subscription status, billing period).
  3. **Consumption analytics** — Conversations per user, tokens consumed by model, cost tracking, free-to-paid conversion rate. Build on existing `usage_logs` table + admin dashboard.
- Previous notes: Token counter and telemetry, RAG token context window limits, user session limits
- Consider making PMM Sherpa a paid Claude skill or ChatGPT plugin (future)
- Source: PDF Mar 21; OneNote Dec 29; Session 2026-03-25
- **Update 2026-04-10:** Detailed tier ladder + MCP consumption model now captured as the current 2026-04-10 pricing entry at top.

### Onboarding Flow #medium
- Homepage and entry screen: use cases are Frame, Consult, Validate (career consult)
- Update homepage and use it in your pills
- Helpful tooltips — study what people are prompting, will they pay, why/why not
- Contact me or office hours / leave feedback / walk me through it
- Ungate access
- Source: PDF Mar 21

### Knowledge Expansion #medium
- Include blog theproductmarketer.com as source
- Expand to LinkedIn and X links
- Ongoing project dossier for expanding knowledge
- Preferred knowledge sources per user
- Update with Robert Kaminski and Anthony Pierri's content on positioning and homepage design
- Source: OneNote PMM Sherpa Ideas 2/20; PDF Mar 21

### Tone & Style Refinement #low
- Change tone to be more polished and Claude-like
- Responses should have rationale, discussion points, and outcome
- System prompt: simple, clear, authoritative, and friendly
- Agent that sounds human, clear, simple, and pithy — Jess likes simplicity
- Source: OneNote PMM Sherpa Ideas; PDF Mar 1

### Evals & Quality #low
- Evals important for reliability — energy is still in prompt or skill
- Generic Claude vs PMM Sherpa one — measure the difference
- Quality of evals
- Source: PDF Mar 21

### Telemetry #low
- Token consumption, conversations, length of threads, return behavior
- Source: PDF Mar 21

### TAM Expansion #low
- TAM may not be professional marketers — PMs and anyone in GTM
- Consider renaming to MarketingSherpa? How to migrate brand
- Entry-level PMMs who didn't have guidance — not just wisdom but templates to get going
- Seasoned PMMs save time wading through docs to focus on dealing with people
- Source: OneNote Discovery 3/20; Dec 29

### N8N Workflows #low
- N8N workflows for email, project knowledge, tone of voice
- Basics: billing, contracts, invoicing, reminders
- Source: PDF Mar 16 (superseded by 2026-04-10 automation stack above)

### Figma MCP + New UI #low
- Figma MCP and new UI?
- Source: PDF Mar 21


# Cold Email & Outbound Tools Analysis for PMM Sherpa
**Date:** 2026-04-07
**Goal:** Find the best API-first tools to build an always-on outbound engine orchestrated by Claude Code + n8n

---

## 1. All Tools from the Mailforge Article (11 Tested)

| Tool | Type | Starting Price | API | MCP Server | n8n Node | Multi-Channel |
|------|------|---------------|-----|------------|----------|---------------|
| **Instantly.ai** | Sending + Leads | $37/mo | V2 REST (excellent) | Yes (38 tools) | Community | Email only |
| **Smartlead.ai** | Sending + Agency | $39/mo | V1 REST (116+ endpoints) | Yes (113 tools) | Community | Email, LinkedIn, SMS |
| **Saleshandy** | Sending + Leads | $36/mo | REST + Swagger | Yes (42 tools) | Via Make | Email only |
| **Lemlist** | Multichannel | $69/mo | REST (mature) | No | Yes (native, 46 triggers + 15 actions) | Email, LinkedIn, WhatsApp, Calls |
| **Salesforge** | Sending + Agency | $48/mo | Limited | No | No | Email, LinkedIn |
| **Woodpecker** | Sending + LinkedIn | $29/mo | REST + Webhooks | No | Yes (native) | Email, LinkedIn |
| **Reply.io** | Multichannel + AI SDR | $99/user/mo | V1+V2 REST | No | Yes (native) | Email, LinkedIn, SMS, Calls, WhatsApp |
| **Apollo.io** | Data + Sending | $59/user/mo (Free tier) | REST (comprehensive) | Community | Community | Email, LinkedIn, Calls |
| **Snov.io** | All-in-one | $39/mo | REST + Webhooks | No | Community | Email, LinkedIn |
| **GMass** | Gmail-based | $18/mo | Very limited | No | No | Email only |
| **Mailforge** | Infrastructure only | $2-3/mailbox/mo | No sequencing API | No | No | N/A (infra only) |

### Also Mentioned (Mailforge Ecosystem)
- **Infraforge** -- Dedicated IP infrastructure
- **Warmforge** -- Deliverability/warmup (included with Salesforge)
- **Primeforge** -- Google & MS365 infrastructure
- **Leadsforge** -- Lead search engine

---

## 2. Top Recommendations Ranked by API/Automation Quality

### TIER 1: Best for Claude Code Orchestration

#### #1 Smartlead.ai -- RECOMMENDED PRIMARY
- **API Quality:** 9/10 -- 116+ REST endpoints covering campaigns, leads, accounts, sequences, analytics, webhooks
- **MCP Server:** Official, 113 tools via `LeadMagic/smartlead-mcp-server` on GitHub. Zero-config NPX install. Works with Claude Desktop and Claude Code.
- **Why it wins:** Most comprehensive MCP implementation in cold email. Five automation tiers: native sequences > enrichment integrations > REST API > MCP server > SmartAgents. The MCP layer means Claude Code can directly create campaigns, manage leads, check deliverability, and pull analytics without HTTP plumbing.
- **Key API endpoints:** Campaign CRUD, lead lifecycle management, email account management, deliverability diagnostics, analytics queries, webhook automation
- **Webhooks:** Real-time event notifications for replies, bounces, opens, clicks
- **Pricing:** Basic $39/mo (6,000 emails), Pro $94/mo (150K emails), Custom $174/mo+
- **Limitation:** No built-in lead database (pair with Apollo or Clay)

#### #2 Instantly.ai -- STRONG ALTERNATIVE
- **API Quality:** 8.5/10 -- V2 REST API (V1 deprecated Jan 2026). Interactive docs. Bearer token auth.
- **MCP Server:** Community-built, 38 tools. Python-based. Launched March 2026.
- **Key API endpoints:** Campaign create/manage, lead lists, inbox placement tests, webhooks for all events (sent, opened, clicked, replied, bounced, unsubscribed, campaign completed, account error)
- **Lead Database:** 450M+ B2B contacts built-in (major advantage)
- **Pricing:** Growth $37/mo (1,000 leads), Hypergrowth $97/mo (25K leads, **API access requires this tier**)
- **Limitation:** API access gated to $97/mo Hypergrowth plan. Fewer MCP tools than Smartlead.

#### #3 Saleshandy -- BUDGET OPTION WITH MCP
- **API Quality:** 7.5/10 -- Swagger-documented REST API at `open-api.saleshandy.com/api-doc/`
- **MCP Server:** Available on Smithery, 42 tools covering sequences, prospects, email verification, A/B tests, analytics
- **Pricing:** Starter $36/mo (affordable entry), Pro $99/mo
- **Limitation:** Smaller MCP tool surface than Smartlead. Email-only channel.

### TIER 2: Best for Specific Capabilities

#### #4 Lemlist -- Best n8n Integration (No MCP)
- **API Quality:** 7/10 -- Mature REST API with Basic auth
- **n8n:** Native node with 46 triggers + 15 actions (best n8n support in the category)
- **Multi-channel:** Email + LinkedIn + WhatsApp + Calls
- **Why consider:** If n8n is the orchestration hub (not Claude Code directly), Lemlist has the richest native integration
- **Pricing:** $69/mo (Email Pro), $99/mo (Multichannel Expert)

#### #5 Apollo.io -- Best Lead Data + Free Tier
- **API Quality:** 8/10 -- Comprehensive REST API at `api.apollo.io/api/v1`. People search, enrichment, sequences, accounts.
- **Lead Database:** 210M+ contacts, 35M+ companies (industry-leading)
- **Free Tier:** Generous free plan with limited credits
- **Why consider:** Unmatched for prospecting data. Combine with Smartlead/Instantly for sending.
- **Pricing:** Free plan available; Basic $59/user/mo; Pro $99/user/mo

#### #6 Woodpecker -- Best Webhook Architecture
- **API Quality:** 7/10 -- REST API + well-documented webhook system with exponential backoff retry
- **n8n:** Native node available
- **Webhooks:** Batching mechanism (groups events, max 100 per payload), subscribe up to 5 URLs per event
- **Pricing:** Starter $29/mo (affordable)

### TIER 3: Powerful but Expensive or Limited API

#### #7 Reply.io
- Good multichannel (email/LinkedIn/SMS/calls/WhatsApp) with AI SDR "Jason"
- API V1+V2 but documentation less comprehensive than Smartlead/Instantly
- **Expensive:** Real multichannel costs ~$187/user/mo. AI SDR from $500/mo.
- Better suited for teams with budget, not solo/startup operator

#### #8 Snov.io
- Decent all-in-one (leads + email + CRM)
- API with webhooks for campaign events
- **Limitation:** Weak LinkedIn automation, basic reporting, niche data gaps

#### #9 Salesforge / GMass
- Salesforge: Limited API, no MCP, no n8n -- skip for automation use case
- GMass: Gmail-only, minimal API -- skip entirely

---

## 3. Supplementary Tools by Category

### Email Infrastructure & Deliverability

| Tool | Purpose | API | Pricing | Notes |
|------|---------|-----|---------|-------|
| **Mailforge** | Domain/mailbox provisioning | No API for sequencing | $2-3/mailbox/mo, ~$14/yr per domain | Fast setup, optimized deliverability. Use for infra, not sending. |
| **Mailreach** | Warmup + reputation monitoring | Yes (developer-friendly) | $25/inbox/mo ($20 annual) | Best standalone warmup API. Includes deliverability tests + blacklist monitoring. |
| **Warmbox** | Warmup | API on Max plan ($99/mo) | $19-99/mo per inbox | Expensive per-inbox. Only Max plan has API. |
| **Warmup Inbox** | Warmup | Limited | $9-15/mo per inbox | Budget warmup option |

**Recommendation:** If using Smartlead or Instantly, their built-in warmup is sufficient. Mailforge for cheap domain/mailbox provisioning. Mailreach only if you need standalone warmup API.

### Lead Enrichment & Prospecting Data

| Tool | API Quality | Enrichment Depth | Pricing | Best For |
|------|------------|-----------------|---------|----------|
| **Apollo.io** | 8/10 | 210M+ contacts | Free tier, then $59/user/mo | Best value for combined prospecting + data |
| **Clay.com** | 8/10 (gated to $495/mo) | 150+ data sources, waterfall enrichment | Free (100 credits), Launch $185/mo, Growth $495/mo | Deepest enrichment (Claygent AI agent). HTTP API only on Growth plan. |
| **Snov.io** | 6/10 | Email finder + verification | $39/mo | Budget email finding |
| **Lusha** | 7/10 | Direct dials + emails | Contact for pricing | Quick lookups |
| **Cognism** | 7/10 | GDPR-verified, strong in EU | Enterprise pricing | International/EU targeting |

**Recommendation:** Apollo.io free tier for initial prospecting. If PMM Sherpa scales, Clay Growth ($495/mo) for waterfall enrichment is the power play -- but expensive. Start with Apollo.

### AI Email Personalization

| Tool | Approach | API | Pricing | Notes |
|------|----------|-----|---------|-------|
| **Claude (PMM Sherpa skill)** | Custom AI copywriting | Native (you control it) | Already paid for | YOUR MOAT. Use PMM Sherpa's voice + PMM expertise for personalization. |
| **Lavender.ai** | Real-time email coaching | Limited | $29/mo/user | More for manual sellers, not API automation |
| **Clay Claygent** | AI prospect research | Via Clay API | $185-495/mo | Deep research per prospect |
| **Regie.ai** | Full sequence generation | Limited | $180/user/mo (10 seat min) | Too expensive, enterprise-focused |

**Recommendation:** Claude Code IS your personalization engine. The PMM Sherpa skill already has product marketing domain expertise. No need for Lavender or Regie -- they add cost without API value.

---

## 4. Recommended Architecture: Claude Code + n8n + Outbound Stack

### The "Always-On Agent" Stack

```
BRAIN LAYER (Claude Code)
    |
    |-- PMM Sherpa skill (writes emails with PMM expertise)
    |-- Smartlead MCP Server (113 tools, direct campaign control)
    |-- Apollo API (prospect research + enrichment)
    |-- HubSpot MCP (CRM, you already have this connected)
    |
ORCHESTRATION LAYER (n8n on Hostinger VPS)
    |
    |-- Webhook receivers (Smartlead events: replies, opens, bounces)
    |-- Scheduled triggers (daily: check analytics, optimize)
    |-- Conditional routing (interested -> CRM, bounced -> remove, etc.)
    |-- Claude Code API calls (for AI-powered follow-up decisions)
    |
EXECUTION LAYER
    |
    |-- Smartlead (email sending, warmup, rotation, sequences)
    |-- Mailforge (domain/mailbox infrastructure, $2-3/mailbox)
    |-- Apollo.io (lead database, 210M+ contacts)
    |
TRACKING LAYER
    |
    |-- HubSpot (deal pipeline, contact lifecycle)
    |-- Supabase (campaign performance data, custom analytics)
```

### Data Flow: End-to-End Sequence

```
1. PROSPECT IDENTIFICATION
   Claude Code -> Apollo API -> search by title:"Product Marketing Manager"
                                + company size + industry filters
   Apollo returns: name, email, company, role, LinkedIn URL

2. ENRICHMENT & QUALIFICATION
   Claude Code -> Apollo enrichment (or Clay if scaled)
   -> company technographics, recent funding, job changes
   -> Claude scores lead fit based on PMM Sherpa ICP

3. PERSONALIZATION
   Claude Code + PMM Sherpa skill:
   -> reads prospect's company context
   -> generates personalized cold email using PMM domain expertise
   -> creates 3 variants (A/B/C) with different angles
   -> writes full 4-step sequence (initial + 3 follow-ups)

4. CAMPAIGN LAUNCH
   Claude Code -> Smartlead MCP:
   -> create_campaign(name, settings)
   -> add_leads_to_campaign(leads, custom_variables)
   -> set_sequence_steps(emails, delays)
   -> activate_campaign()

5. REAL-TIME MONITORING (n8n)
   Smartlead webhook -> n8n:
   -> reply_received: classify intent (interested/not now/unsubscribe)
   -> email_opened: track engagement scoring
   -> email_bounced: remove lead, flag domain issue
   -> link_clicked: high-intent signal -> notify immediately

6. INTELLIGENT FOLLOW-UP
   n8n -> Claude Code API:
   -> "This prospect replied: [reply text]. Generate contextual response."
   -> Claude reads reply, crafts human-sounding response
   -> n8n -> Smartlead API: send_reply()

7. PIPELINE MANAGEMENT
   n8n -> HubSpot MCP:
   -> interested leads -> create/update HubSpot contact + deal
   -> set lifecycle stage, assign follow-up tasks
```

### Specific API Endpoints That Enable This

**Smartlead MCP Tools (key ones for the agent):**
- `create_campaign` -- programmatic campaign creation
- `add_leads_to_campaign` -- bulk lead import with custom variables
- `update_campaign_sequence` -- modify email steps dynamically
- `get_campaign_analytics` -- real-time performance data
- `get_lead_status` -- check individual lead engagement
- `create_webhook` -- subscribe to events (replies, opens, bounces)
- `send_email` -- trigger individual emails outside sequences
- `get_email_account_health` -- deliverability monitoring
- `pause_campaign` / `resume_campaign` -- dynamic campaign control

**Instantly API V2 (if using Instantly instead):**
- `POST /api/v2/campaign` -- create campaign
- `POST /api/v2/lead` -- add leads
- `GET /api/v2/campaign/{id}/analytics` -- performance data
- `POST /api/v2/webhook` -- subscribe to events
- Webhook events: `email_sent`, `email_opened`, `email_link_clicked`, `reply_received`, `email_bounced`, `lead_unsubscribed`, `campaign_completed`, `account_error`

**Apollo API:**
- `POST /api/v1/mixed_people/search` -- find prospects by filters
- `POST /api/v1/people/match` -- enrich known contacts
- `POST /api/v1/contacts` -- create contacts in Apollo
- `GET /api/v1/emailer_campaigns` -- manage sequences

**n8n Webhook Nodes:**
- `Webhook` trigger node -- receives Smartlead/Instantly events
- `HTTP Request` node -- calls Claude Code API for AI decisions
- `Smartlead` / `Lemlist` nodes -- native integrations
- `HubSpot` node -- CRM updates
- `Supabase` node -- log analytics data

---

## 5. Pricing Comparison: Recommended Stack

### Option A: Budget Stack ($120-180/mo)

| Component | Tool | Monthly Cost |
|-----------|------|-------------|
| Sending Platform | Smartlead Basic | $39/mo |
| Email Infrastructure | Mailforge (5 domains, 10 mailboxes) | ~$15/mo |
| Lead Data | Apollo.io Free Tier | $0 |
| Warmup | Included in Smartlead | $0 |
| Orchestration | n8n (self-hosted on Hostinger) | $0 (already running) |
| AI Brain | Claude Code (Max subscription) | Already paid |
| CRM | HubSpot Free | $0 |
| **TOTAL** | | **~$54/mo + existing costs** |

### Option B: Growth Stack ($200-400/mo)

| Component | Tool | Monthly Cost |
|-----------|------|-------------|
| Sending Platform | Smartlead Pro | $94/mo |
| Email Infrastructure | Mailforge (10 domains, 20 mailboxes) | ~$30/mo |
| Lead Data | Apollo.io Basic | $59/mo |
| Warmup | Included in Smartlead | $0 |
| Orchestration | n8n (self-hosted) | $0 |
| AI Brain | Claude Code | Already paid |
| CRM | HubSpot Free/Starter | $0-20/mo |
| **TOTAL** | | **~$183-203/mo** |

### Option C: Scale Stack ($500+/mo)

| Component | Tool | Monthly Cost |
|-----------|------|-------------|
| Sending Platform | Smartlead Custom | $174/mo |
| Email Infrastructure | Mailforge (20+ domains) | ~$50/mo |
| Lead Data | Clay Launch + Apollo | $185 + $59 = $244/mo |
| Warmup | Included | $0 |
| Orchestration | n8n (self-hosted) | $0 |
| AI Brain | Claude Code | Already paid |
| CRM | HubSpot Starter | $20/mo |
| **TOTAL** | | **~$488/mo** |

### My Recommendation: Start with Option A, Graduate to B

Start with Smartlead Basic ($39) + Mailforge ($15) + Apollo Free + n8n + Claude Code. This gives you the full agent architecture for ~$54/mo on top of what you already pay. Scale to Option B when you see traction.

---

## 6. Tools to Avoid (and Why)

### Hard Avoid
- **GMass** -- Gmail-only, no real API, no automation potential. Dead end.
- **Salesforge** -- No MCP, no n8n, limited API. Locked ecosystem. The "Agent Frank" add-on is $499/mo for something Claude Code does natively.
- **Regie.ai** -- $180/user/mo with 10-seat minimum ($1,800/mo floor). Enterprise pricing, no startup viability. Claude Code replaces this entirely.

### Avoid for Now (Revisit at Scale)
- **Reply.io** -- Good multichannel but real cost is $187/user/mo. Overkill for initial outbound. Revisit if you need SMS + calls at scale.
- **Clay.com** -- HTTP API gated to $495/mo Growth plan. The enrichment is extraordinary but premature at startup stage. Start with Apollo, add Clay when CAC math justifies it.
- **Warmbox** -- API only on $99/mo Max plan. Smartlead and Instantly include warmup. No need for standalone warmup tool.
- **Lavender.ai** -- Manual email coaching tool. Claude Code + PMM Sherpa skill is a superior, API-native personalization engine for this use case.

### Watch List (Emerging)
- **Lemlist** -- No MCP server yet but best n8n native integration (46 triggers). If they ship an MCP server, becomes very competitive. Currently lacks the programmatic depth of Smartlead.
- **Woodpecker** -- Excellent webhook architecture (batching, retry) but smaller ecosystem. Good backup option at $29/mo.

---

## 7. Key Insight: The MCP Advantage

The landscape shifted dramatically in early 2026 with MCP server launches from Smartlead (113 tools), Saleshandy (42 tools), and Instantly (38 tools). This means:

1. **Claude Code can directly operate your cold email platform** -- no HTTP wrapper code needed
2. **Natural language campaign management** -- "Create a campaign targeting VP Marketing at Series B SaaS companies" becomes a single Claude Code instruction
3. **Real-time diagnostics** -- "Why is my open rate dropping?" gets answered by Claude querying live analytics via MCP

**Smartlead's MCP server is the most mature** with 113 tools across six categories. This is why it is the top recommendation -- the MCP layer reduces integration time from days to minutes.

### Setup (5 minutes)
```json
// In .claude/settings.json or Claude Desktop config
{
  "mcpServers": {
    "smartlead": {
      "command": "npx",
      "args": ["-y", "@leadmagic/smartlead-mcp-server"],
      "env": {
        "SMARTLEAD_API_KEY": "your-api-key"
      }
    }
  }
}
```

---

## 8. Implementation Roadmap

### Week 1: Infrastructure
- [ ] Buy 5 domains via Mailforge (~$70 one-time)
- [ ] Set up 10 mailboxes via Mailforge ($20-30/mo)
- [ ] Create Smartlead account (Basic $39/mo)
- [ ] Connect mailboxes to Smartlead, start warmup (2-3 weeks)
- [ ] Install Smartlead MCP server in Claude Code

### Week 2: Lead Pipeline
- [ ] Create Apollo.io free account
- [ ] Define ICP filters: Product Marketing Managers, Heads of Marketing, Founders at B2B SaaS companies (10-200 employees)
- [ ] Build initial prospect list (500-1000 leads)
- [ ] Set up n8n webhook workflows on Hostinger VPS

### Week 3: Content & Sequences (During Warmup)
- [ ] Use PMM Sherpa skill to draft 3 email sequence templates
- [ ] A/B variants per step (PMM expertise angle vs pain-point angle vs social proof)
- [ ] Create Claude Code automation script: prospect -> personalize -> load to Smartlead

### Week 4: Launch
- [ ] Mailboxes warmed (after 2-3 weeks)
- [ ] Launch first campaign via Claude Code + Smartlead MCP
- [ ] n8n webhooks active: reply classification, CRM updates, bounce handling
- [ ] Daily: Claude Code reviews analytics, suggests optimizations

### Ongoing: The Always-On Agent
- Claude Code monitors campaign health via MCP
- n8n routes events in real-time
- Claude writes follow-ups contextually
- Weekly: Claude generates performance report, recommends ICP refinements

---

*Analysis produced by Claude Code for PMM Sherpa outbound strategy. Tools and pricing verified as of April 2026.*

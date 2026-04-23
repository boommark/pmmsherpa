# PMM Sherpa Remote MCP Server — Technical Research Report

**Date**: April 15, 2026
**Purpose**: Architecture decisions for building a remote MCP server that serves Claude Desktop, Claude Code, Cursor, ChatGPT, and other AI clients.

---

## Table of Contents

1. [Transport & Hosting](#1-transport--hosting)
2. [Authentication (OAuth 2.1)](#2-authentication-oauth-21)
3. [ChatGPT Apps SDK Compatibility](#3-chatgpt-apps-sdk-compatibility)
4. [Claude Skills + MCP Integration](#4-claude-skills--mcp-integration)
5. [Performance & Caching](#5-performance--caching)
6. [Security Best Practices](#6-security-best-practices)
7. [Billing/Metering Integration](#7-billingmetering-integration)
8. [Recommended Architecture for PMM Sherpa](#8-recommended-architecture-for-pmm-sherpa)

---

## 1. Transport & Hosting

### Current MCP Transport Spec

The MCP specification (2025-03-26) defines two standard transports:

1. **stdio** — Client launches server as subprocess. Local only. Used by Claude Desktop for local MCP servers.
2. **Streamable HTTP** — The server operates as an independent process handling multiple client connections via HTTP POST and GET. This **replaced the old HTTP+SSE transport** from the 2024-11-05 spec.

**Streamable HTTP is the recommended transport for all remote MCP servers in 2026.**

Key Streamable HTTP mechanics:
- Server exposes a single MCP endpoint (e.g., `https://pmmsherpa.com/mcp`) supporting POST and GET
- Client sends JSON-RPC messages via POST with `Accept: application/json, text/event-stream`
- Server can respond with either `application/json` (single response) or `text/event-stream` (SSE stream for long-running operations)
- Session management via `Mcp-Session-Id` header (optional but recommended)
- Resumability via SSE event IDs and `Last-Event-ID` header
- Origin header validation is REQUIRED to prevent DNS rebinding attacks

### How Production Companies Host Their MCP Servers

| Company | Approach | Key Details |
|---------|----------|-------------|
| **Notion** | Self-hosted remote server | Streamable HTTP + SSE fallback. Code-gen pipeline converts OpenAPI schemas to Zod. OAuth one-click flow. AI-first tool design (not 1:1 API mapping). Uses Notion-flavored Markdown for token efficiency. |
| **HubSpot** | Remote MCP server | Bridge allowing authorized LLMs to connect to specific HubSpot accounts. Real-time CRM data access. |
| **Stripe** | Official MCP server + `@stripe/token-meter` | Provides both MCP server for payment operations and a metering package for usage-based billing. |
| **Linear** | GraphQL-based MCP server | Part of the open-source `mcp-pool` monorepo pattern with shared OAuth infrastructure. |

**Key insight from Notion**: They host their own server to enable "rapid iteration — ship improvements without requiring users to download updated packages." This is the right model for PMM Sherpa.

### Hosting Platform Comparison

| Platform | Cold Start | Session/State | Best For | Price |
|----------|-----------|---------------|----------|-------|
| **Vercel** | ~250ms (Fluid Compute) | Stateless (needs Redis) | Next.js MCP servers, `mcp-handler` package | Free hobby, $20/mo Pro |
| **Railway** | Zero (always-on) | Native Redis one-click | Stateful servers, SSE-heavy | $5/mo hobby |
| **Fly.io** | 100-500ms (suspend) | No managed Redis | Cost optimization, edge | ~$2/mo |
| **Cloud Run** | Variable | Stateless | Docker containers, auto-scale | Pay-per-use |
| **Cloudflare Workers** | Near-zero | Durable Objects | Edge, low-latency | Pay-per-request |

### Can You Use Vercel Serverless?

**Yes, but with caveats.** Vercel ships the official `mcp-handler` package (formerly `@vercel/mcp-adapter`) that makes it trivial to add MCP endpoints to Next.js apps. Companies like Zapier, Vapi, and Composio host production MCP servers on Vercel.

Gotchas for Vercel:
- 4.5 MB body limit
- DDoS protection can rate-limit MCP client connections (429 errors) — add WAF bypass for `/api/mcp`
- Edge Runtime incompatible with full SDK transport — must use Node.js runtime
- Stateless by design — need external Redis (Upstash) for sessions
- Max duration: 60s on Hobby, 800s with Fluid Compute on Pro

**For PMM Sherpa's RAG workload (embedding + vector search + LLM call), Vercel Pro with Fluid Compute (800s max duration) or Railway (zero cold starts + native Redis) are the best choices.**

### Latency: Serverless vs Persistent

- Serverless (Vercel): ~250ms cold start, but once warm, sub-100ms routing. RAG calls that take 2-5 seconds are fine.
- Persistent (Railway): Zero cold starts. Better for maintaining vector DB connections and embedding model warmth.
- For a RAG-heavy product like PMM Sherpa, **persistent hosting (Railway or Cloud Run) is marginally better** due to connection pooling and no cold start penalty on first call after idle.

### Recommendation for PMM Sherpa

**Primary: Vercel (Next.js + `mcp-handler`)** if the web app is already on Vercel. Add the MCP endpoint as a route.
**Alternative: Railway** if you want zero cold starts and native Redis for session/cache.

---

## 2. Authentication (OAuth 2.1)

### What the MCP Spec Requires

The MCP authorization spec is based on OAuth 2.1 (draft-ietf-oauth-v2-1-13) and requires:

1. **Protected Resource Metadata** (RFC 9728): Server MUST expose `/.well-known/oauth-protected-resource` or return it via `WWW-Authenticate` header on 401 responses. This tells clients where the authorization server lives.

2. **Authorization Server Metadata**: The auth server MUST publish discovery at `/.well-known/oauth-authorization-server` (RFC 8414) or OpenID Connect Discovery.

3. **PKCE (S256)**: All clients MUST use PKCE with S256 code challenge method. Servers MUST advertise `code_challenge_methods_supported` including `S256`.

4. **Client Registration** (three options, in priority order):
   - **Client ID Metadata Documents (CIMD)**: Client uses an HTTPS URL as `client_id` pointing to a hosted JSON metadata document. This is the newest and preferred approach (added to MCP spec Nov 2025).
   - **Pre-registration**: Hardcoded client credentials for known clients.
   - **Dynamic Client Registration (DCR)**: Clients auto-register via POST `/register`. Required by ChatGPT currently.

5. **Resource Indicators** (RFC 8707): Clients MUST include `resource` parameter in auth and token requests to bind tokens to the specific MCP server.

6. **Token validation**: Server MUST validate issuer, audience, expiration, and scopes on every request.

### Auth Provider Comparison for PMM Sherpa

| Provider | MCP Support | How It Works | Effort | Cost |
|----------|-------------|-------------|--------|------|
| **Supabase Auth** | Native OAuth 2.1 server | Supabase becomes your OAuth provider. Discovery endpoint auto-configured. DCR supported. RLS policies apply to MCP clients. | Low (if already on Supabase) | Included in Supabase plan |
| **WorkOS AuthKit** | Purpose-built MCP auth | Acts as OAuth 2.1 authorization server. Supports CIMD + DCR. JWT verification via JWKS. Standalone Connect for existing auth. | Medium | Free tier available, paid for SSO |
| **Clerk** | `@clerk/mcp-tools` package | OAuth 2.0 authorization server for MCP. Handles DCR automatically. Pre-built middleware for token verification. | Low-Medium | Free tier, $25/mo Pro |
| **Auth0/Okta** | Standard OAuth 2.1 | Configure as authorization server. Manual DCR setup. Proven at enterprise scale. | Medium-High | Free tier, paid for prod |
| **Custom (roll your own)** | Full control | Build OAuth endpoints manually. Most work but most flexibility. | High | Infrastructure cost only |

### Supabase Auth as OAuth Provider (Best Fit for PMM Sherpa)

Since PMM Sherpa already uses Supabase, this is the lowest-friction path:

1. Enable OAuth 2.1 server in Supabase project settings
2. MCP clients auto-discover config from `https://<project-ref>.supabase.co/.well-known/oauth-authorization-server/auth/v1`
3. Enable Dynamic Client Registration in Authentication settings (required for ChatGPT)
4. RLS policies automatically apply to MCP-authenticated requests
5. Automatic refresh token rotation and expiration management

**Key caveat**: Dynamic registration allows ANY MCP client to register. Mitigate by requiring user approval, monitoring registered clients, and validating redirect URIs.

### Per-User API Keys vs OAuth Tokens

For a SaaS like PMM Sherpa, support both:

- **OAuth 2.1 tokens**: Primary path for Claude Desktop, Cursor, ChatGPT. User authenticates via browser, gets tokens.
- **API keys**: For programmatic access (n8n, custom scripts). Generate from PMM Sherpa dashboard. Store hashed in database. Include rate limits and expiry. Map to user for billing.

Implementation pattern:
```
// Middleware pseudocode
if (request.headers.authorization?.startsWith('Bearer ')) {
  // OAuth token path — validate JWT via JWKS
  user = await validateOAuthToken(token);
} else if (request.headers['x-api-key']) {
  // API key path — lookup hashed key in database
  user = await validateApiKey(apiKey);
} else {
  return 401;
}
```

### Simplest Production-Ready Auth Approach

**Use Supabase Auth's built-in OAuth 2.1 server.** You already have users in Supabase. It handles:
- Discovery endpoints (automatic)
- PKCE enforcement (built-in)
- DCR (configurable)
- Token issuance and refresh (automatic)
- User identification (maps to existing Supabase user)

Only additional work: expose `/.well-known/oauth-protected-resource` from your MCP server pointing to Supabase's authorization server.

---

## 3. ChatGPT Apps SDK Compatibility

### How Compatible is MCP with ChatGPT Apps?

ChatGPT fully implements the MCP standard and adds extensions for rich UI. An MCP server that works with Claude Desktop/Cursor will work with ChatGPT for tool calls. ChatGPT adds optional UI capabilities on top.

### What ChatGPT Specifically Requires

1. **OAuth 2.1 with PKCE + DCR**: ChatGPT registers a fresh OAuth client each time it connects via Dynamic Client Registration. Your auth server MUST support DCR (Supabase does).

2. **`code_challenge_methods_supported` in metadata**: ChatGPT refuses to proceed if PKCE support can't be confirmed. Supabase includes this automatically.

3. **mTLS client certificate**: ChatGPT presents an OpenAI-managed client certificate during TLS connections. SAN: `mtls.connectors.openai.com`. This is for ChatGPT identification (separate from user OAuth).

4. **Protected Resource Metadata**: Expose at `/.well-known/oauth-protected-resource` with `resource`, `authorization_servers`, and `scopes_supported`.

5. **Tool annotations**: ChatGPT uses three required hints per tool:
   - `readOnlyHint`: true for retrieval-only tools
   - `openWorldHint`: false for bounded targets
   - `destructiveHint`: true for irreversible operations

### Additional Work for ChatGPT App Features

If you want rich UI (not just text responses), ChatGPT extends MCP with:

- **UI resource templates**: Register HTML templates with MIME type `text/html;profile=mcp-app`
- **Structured content**: Tools return `structuredContent` (JSON for widget + model), `content` (Markdown for model), `_meta` (large data for widget only)
- **Domain/CSP configuration**: Required for app submission

**For PMM Sherpa's initial launch, skip the UI extensions.** Standard MCP tools returning text content will work perfectly across all clients. Add ChatGPT-specific UI later for premium experience.

### Auth Differences for OpenAI's OAuth Flow

| Aspect | Standard MCP | ChatGPT Specific |
|--------|-------------|-----------------|
| Client registration | CIMD preferred | DCR required |
| Client identification | Optional | mTLS certificate |
| Redirect URI | Varies | `https://chatgpt.com/connector/oauth/{callback_id}` |
| Resource parameter | Required | Required (enforced) |
| Token audience | Validate `aud` | Must echo `resource` in `aud` claim |

---

## 4. Claude Skills + MCP Integration

### How Claude Skills Work

Skills are Markdown files (`.md`) in `.claude/skills/` directories that teach Claude Code how to perform specific tasks. They provide workflow logic on top of MCP tools.

- **Skills** = recipes (Markdown instructions, no server needed)
- **MCP servers** = professional kitchen (protocol-based tools with APIs)
- **Combined** = Skills orchestrate MCP tool calls with domain knowledge

### Skill File Structure

```
.claude/
  skills/
    pmm-sherpa-research/
      SKILL.md              # Main skill definition
      reference.md          # Optional context docs
      scripts/              # Optional helper scripts
    pmm-sherpa-positioning/
      SKILL.md
```

Key SKILL.md frontmatter:
```yaml
---
name: pmm-sherpa-research
description: "Research competitive landscapes using PMM Sherpa"
auto_invoke: false
show_in_menu: true
run_in_subagent: true
---
```

### Skills Calling MCP Servers

A skill references MCP tools by name in its Markdown instructions:

```markdown
## Steps
1. Use the `pmmsherpa_search_corpus` MCP tool to find relevant frameworks
2. Use the `pmmsherpa_generate_positioning` MCP tool with the research results
3. Format the output as a positioning document
```

Claude Code resolves tool names against configured MCP servers automatically. The skill doesn't need to know where the MCP server is hosted — that's in the MCP configuration.

### Can a Published Skill Require an MCP Server?

Yes. The skill's documentation states the MCP server dependency, and users configure the MCP server connection separately in their Claude Code or Claude Desktop settings. The skill references tools by name; the client handles the connection.

**For PMM Sherpa**: Publish skills that reference your MCP tools. Users add your remote MCP server URL to their client config. Skills provide the "how to use PMM Sherpa effectively" layer.

---

## 5. Performance & Caching

### MCP Client Timeout Expectations

| Client | Default Timeout | Configurable? |
|--------|----------------|---------------|
| Claude Desktop | 60 seconds (hardcoded) | No |
| Claude Code | 60 seconds | Yes, via `MCP_TIMEOUT` env var |
| Cursor | ~60 seconds | Limited |
| ChatGPT | Unknown (likely 60s) | No |
| MCP Inspector | 60 seconds | Feature requested |

**Critical constraint**: All tool responses must complete within 60 seconds. For RAG workloads (embedding + vector search + LLM generation), this is tight but achievable.

### RAG Latency Budget (60-second ceiling)

| Step | Typical Latency | Optimization |
|------|----------------|-------------|
| Token validation | 5-20ms | Cache JWKS keys |
| Query embedding | 50-200ms | Pre-computed, cached |
| Vector search (Supabase pgvector) | 50-300ms | Indexed, HNSW |
| Context assembly | 10-50ms | Pre-chunked |
| LLM generation (if needed) | 2-15s | Stream, use fast models |
| **Total** | **~0.5-16s** | **Well within 60s** |

### Caching Strategies

**Multi-tier caching architecture:**

1. **L1: In-memory cache** (<1ms)
   - Tool schemas and metadata
   - JWKS keys for token validation
   - Frequently accessed corpus metadata

2. **L2: Redis/Upstash** (1-5ms)
   - Semantic cache: Hash of query embedding -> cached results (TTL: 1 hour)
   - User session data and preferences
   - Rate limit counters
   - Recent search results

3. **L3: Edge cache (CDN)** (5-50ms)
   - Static tool definitions
   - Protected resource metadata
   - Authorization server metadata

**Semantic caching pattern** (biggest win for PMM Sherpa):
```
// Pseudocode
const queryHash = hashEmbedding(queryVector);
const cached = await redis.get(`search:${queryHash}`);
if (cached && cached.ttl > 0) {
  return cached.results;  // Skip vector search entirely
}
const results = await vectorSearch(queryVector);
await redis.set(`search:${queryHash}`, results, { ex: 3600 });
```

This can deliver **90% cost reduction and 5x faster responses** for repeated/similar queries.

### Streaming Responses

For long-running operations, use SSE streaming within the Streamable HTTP transport:

- Server returns `Content-Type: text/event-stream` for POST requests
- Send progress notifications before the final response
- Send heartbeats every 30 seconds to prevent proxy timeouts
- Client sees partial results while waiting for completion

**Important**: Progress notifications may NOT reset the 60-second timeout in all clients. Design tools to complete within 30 seconds for reliability.

---

## 6. Security Best Practices

### Rate Limiting

Implement per-user and per-token rate limiting:

```
// Rate limit tiers
Free tier: 50 tool calls/hour, 500/day
Pro tier: 500 tool calls/hour, 5000/day
API keys: Configurable per key

// Implementation: Redis sliding window
const key = `ratelimit:${userId}:${window}`;
const count = await redis.incr(key);
if (count === 1) await redis.expire(key, windowSeconds);
if (count > limit) return 429;
```

### Input Sanitization

- Validate ALL tool arguments against Zod schemas (strict mode)
- Reject unknown fields and malformed requests
- Implement context-aware semantic validation (e.g., query length limits, allowed characters)
- Sanitize data before database operations to prevent injection
- Normalize Unicode inputs
- Limit response sizes to prevent memory exhaustion

### Token Rotation and Refresh

- Access tokens: Short-lived (15 minutes recommended)
- Refresh tokens: Rotate on every use (Supabase does this automatically)
- API keys: Support manual rotation from dashboard, require re-authentication
- JWKS key rotation: Cache with short TTL (5 minutes), support key rollover

### CORS and Origin Validation

```
// Strict CORS configuration
const allowedOrigins = [
  'https://claude.ai',
  'https://chatgpt.com',
  'https://cursor.sh',
  'https://app.pmmsherpa.com'
];

// Validate Origin header on EVERY request
if (!allowedOrigins.includes(request.headers.origin)) {
  // For MCP clients that don't send Origin (desktop apps),
  // fall back to token-based auth only
  if (request.headers.origin) {
    return 403;
  }
}
```

**Note**: Desktop MCP clients (Claude Desktop, Claude Code) may not send Origin headers. Token validation is the primary security gate, with CORS as an additional layer for browser-based clients.

### Secrets Management

- Use environment variables for all API keys and secrets
- Never embed secrets in tool responses (`structuredContent`, `content`, or `_meta`)
- Use Vercel/Railway encrypted environment variables
- Rotate Supabase service role keys periodically
- Audit tool response content to prevent accidental secret leakage

---

## 7. Billing/Metering Integration

### Metering MCP Tool Calls

**Stripe Meters** are the native solution for usage-based billing:

1. **Create a Stripe Meter**: Define how to aggregate events (e.g., count of tool calls per billing period)
2. **Report meter events**: On each tool call, send an event to Stripe
3. **Attach meter to price**: Meter events drive billing automatically

```typescript
// Report usage on every tool call
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function reportToolUsage(userId: string, toolName: string) {
  await stripe.billing.meterEvents.create({
    event_name: 'mcp_tool_call',
    payload: {
      stripe_customer_id: userToStripeCustomer(userId),
      value: '1',
    },
    timestamp: Math.floor(Date.now() / 1000),
  });
}
```

### Stripe `@stripe/token-meter` Package

Stripe's official `@stripe/token-meter` package provides native usage-based billing for AI applications. It works with OpenAI, Anthropic, and Google SDKs. Use this if PMM Sherpa tools involve LLM calls that should be metered by token count.

### Open MCP Billing Spec

An emerging standard (`mcp-billing-spec`) defines:
- Per-call billing (fiat or crypto)
- Subscriptions with call limits
- Tiered pricing with free tiers
- Signed receipts and SLA monitoring

This is still early but worth watching for future interoperability.

### Recommended Billing Architecture for PMM Sherpa

**Hybrid model:**

| Tier | Price | Includes | Overage |
|------|-------|----------|---------|
| Free | $0/mo | 50 MCP tool calls/month | Hard cap |
| Pro | $29/mo | 1,000 tool calls/month | $0.02/additional call |
| Team | $99/mo | 5,000 tool calls/month | $0.015/additional call |

**Implementation flow:**
1. On every tool call, check user's tier and remaining quota (Redis counter)
2. If within quota, execute tool and increment counter
3. If over quota on Pro/Team, execute tool and report to Stripe meter for overage billing
4. If over quota on Free, return friendly error with upgrade CTA
5. At billing cycle reset, zero out Redis counters

```typescript
// Middleware pattern
async function billingMiddleware(userId: string, toolName: string) {
  const { tier, used, limit } = await getUserQuota(userId);

  if (used >= limit) {
    if (tier === 'free') {
      return { error: 'Monthly limit reached. Upgrade at pmmsherpa.com/pricing' };
    }
    // Pro/Team: allow overage, report to Stripe
    await reportToolUsage(userId, toolName);
  }

  await redis.incr(`usage:${userId}:${billingPeriod}`);
  return null; // proceed with tool execution
}
```

### How Existing MCP Servers Handle Credits

- **altFINS**: Credit-based system, users purchase credit packs
- **ScrapingBee**: Per-call pricing with monthly quotas
- **Glama**: Hosting platform with built-in billing gateway SDK
- **Stripe `PaidMcpAgent`**: Subscription-based access with `paidTool()` method for per-tool pricing

---

## 8. Recommended Architecture for PMM Sherpa

### High-Level Architecture

```
                    ┌─────────────────┐
                    │  Claude Desktop  │
                    │  Claude Code     │
                    │  Cursor          │──── Streamable HTTP ────┐
                    │  ChatGPT         │                         │
                    │  Other MCP       │                         │
                    └─────────────────┘                         │
                                                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     PMM Sherpa MCP Server                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Auth Layer   │  │  Rate Limit  │  │  Billing     │              │
│  │  (Supabase    │  │  (Redis)     │  │  (Stripe     │              │
│  │   OAuth 2.1)  │  │              │  │   Meters)    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         ▼                  ▼                  ▼                       │
│  ┌────────────────────────────────────────────────┐                  │
│  │              Tool Router                        │                  │
│  │  search_corpus | get_frameworks | analyze_      │                  │
│  │  positioning | generate_messaging | ...         │                  │
│  └────────────────────────┬───────────────────────┘                  │
│                           │                                          │
│  ┌────────────────────────▼───────────────────────┐                  │
│  │           RAG Engine                            │                  │
│  │  ┌─────────┐  ┌────────────┐  ┌────────────┐  │                  │
│  │  │Embedding │  │ Vector     │  │ Context    │  │                  │
│  │  │Cache     │  │ Search     │  │ Assembly   │  │                  │
│  │  │(Redis)   │  │ (pgvector) │  │            │  │                  │
│  │  └─────────┘  └────────────┘  └────────────┘  │                  │
│  └────────────────────────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │   Supabase (Postgres)   │
              │   - pgvector corpus     │
              │   - User data           │
              │   - Auth (OAuth 2.1)    │
              │   - RLS policies        │
              └─────────────────────────┘
```

### Technology Stack Decision

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Next.js + `mcp-handler` OR standalone Express/Hono | If web app on Vercel, use mcp-handler. Otherwise standalone. |
| **Transport** | Streamable HTTP | Current spec standard, works with all clients |
| **Hosting** | Vercel (Pro) or Railway | Vercel if co-located with web app; Railway for always-on |
| **Auth** | Supabase Auth OAuth 2.1 | Already have users, zero migration |
| **Cache** | Upstash Redis (if Vercel) or Railway Redis | Semantic cache + rate limits + sessions |
| **Billing** | Stripe Meters + Redis counters | Native metered billing + fast quota checks |
| **Monitoring** | Vercel Analytics + Sentry | Error tracking + performance |

### Implementation Priority

**Phase 1: Core MCP Server (Week 1-2)**
- Set up Streamable HTTP endpoint with `mcp-handler` or `@modelcontextprotocol/sdk`
- Implement 3-5 core tools (search_corpus, get_frameworks, analyze_positioning)
- Token validation middleware (Supabase JWT)
- Basic rate limiting (Redis)

**Phase 2: Auth + Multi-client (Week 3-4)**
- Enable Supabase OAuth 2.1 server
- Expose protected resource metadata endpoint
- Enable Dynamic Client Registration (for ChatGPT)
- Test with Claude Desktop, Claude Code, Cursor, ChatGPT
- Add API key support for programmatic access

**Phase 3: Billing + Production Hardening (Week 5-6)**
- Stripe meter integration
- Tiered quotas (Free/Pro/Team)
- Semantic caching for RAG queries
- CORS configuration
- Input validation (Zod strict schemas)
- Error handling and monitoring

**Phase 4: ChatGPT App + Skills (Week 7-8)**
- Add tool annotations (readOnlyHint, etc.)
- Publish Claude Skills for PMM Sherpa workflows
- Optional: ChatGPT UI extensions for rich output
- Documentation and developer onboarding

---

## 9. MCP Tools & Templated Outputs

### Tool Inventory

Based on PMM Sherpa's usage data (277 conversations, 60 users) and corpus analysis (Lauchengco, King, Sheehan, 532 AMAs, 827 PMA guides), here are the MCP tools to build:

**Phase 1 — Core Advisory Tools (ship first)**

| Tool | Description | Credit Cost |
|------|-------------|-------------|
| `query_sherpa` | Primary advisory tool. User asks a GTM question, gets a grounded answer with citations from the 38K-chunk corpus. Covers 39% of usage (positioning & messaging) plus most other categories. | 1 credit |
| `search_corpus` | Lightweight lookup. Returns raw chunks matching a query without synthesis. For browsing the knowledge base. Low token cost. | 1 credit |
| `validate_artifact` | Paste a positioning doc, messaging framework, one-pager, or battlecard. Gets scored against practitioner standards from the corpus. Maps to the "Validate" pillar. | 1 credit |

**Phase 2 — Structured Deliverable Tools**

| Tool | Description | Credit Cost |
|------|-------------|-------------|
| `generate_positioning` | Structured input (product, audience, alternatives, differentiators) → complete positioning statement using Dunford's framework. | 1 credit |
| `competitive_analysis` | Takes a competitor URL or name, fetches their positioning, analyzes against the corpus, returns structured competitive brief. | 1 credit |
| `career_advisor` | Takes resume/role/question, returns career guidance grounded in Lauchengco, King, and 532 AMAs. 6.5% of usage, 13.3 avg messages — surprise retention driver. | 1 credit |
| `review_url` | Drop a URL (competitor homepage, pricing page, launch announcement). Fetches it, runs positioning analysis, returns strategic read. | 1 credit |

**Phase 3 — Visual Deliverable Tools (MARP + Gamma)**

| Tool | Description | Engine | Credit Cost |
|------|-------------|--------|-------------|
| `generate_deck` | Creates a presentation from structured PMM content. Default: MARP (free tier). Premium: Gamma AI-designed (pro tier). | MARP / Gamma | 3 / 10 credits |
| `generate_one_pager` | One-page solution brief, battlecard, or case study as designed PDF. | MARP / Gamma | 2 / 8 credits |
| `generate_battlecard` | Structured competitive battlecard with designed layout. | MARP / Gamma | 2 / 8 credits |

### Templated Output Catalog

Ranked by frequency of real-world PMM use (sourced from Sharebird AMAs, PMA blogs, Lauchengco's *Loved*, King's *MisUnderstood PMM*, Sheehan's *Pocket Guide to Product Launches*).

#### Tier 1: Weekly/Daily Artifacts (highest demand)

| Template | Description | Source Framework | Credit Cost |
|----------|------------|-----------------|-------------|
| **Positioning Statement** | One-page structured output using Dunford's framework. The #1 use case (39% of conversations). | Dunford, *Obviously Awesome* | 1 credit |
| **Messaging Framework / Hierarchy** | Pillar messages, proof points, audience variants. Lauchengco calls this "the single most important PMM artifact." | Lauchengco, *Loved* | 1 credit |
| **Competitive Battlecard** | Strengths, weaknesses, landmines, talk tracks. Sheehan and King both rank this in PMM top 3. Sales teams consume weekly. | Sheehan, King | 1 credit |
| **One-Pager / Solution Brief** | Product + audience + value prop + proof on one page. The deliverable PMMs hand to sales most often per Sharebird AMAs. | PMA Blogs, AMAs | 1 credit |

#### Tier 2: Monthly/Quarterly Artifacts

| Template | Description | Source Framework | Credit Cost |
|----------|------------|-----------------|-------------|
| **Launch Plan / Brief** | Structured timeline, audiences, channels, success metrics. Sheehan's entire book. 9% of conversations. | Sheehan, *Pocket Guide* | 2 credits |
| **Sales Deck / Pitch Narrative** | External-facing story. Raskin's strategic narrative + Dunford's Sales Pitch framework. | Raskin, Dunford | 2 credits |
| **Competitive Landscape Matrix** | Visual comparison grid. Dunford's "competitive alternatives" analysis rendered as a table. | Dunford | 1 credit |
| **Customer Persona / ICP Doc** | Kalbach's JTBD + Voje's ICP framework. Drives 13.6 avg messages in usage data. | Kalbach, Voje | 2 credits |
| **Win/Loss Analysis Brief** | Deal context, decision criteria, competitor comparison, recommendations. PMA blogs rank top 5 PMM deliverable. | PMA Blogs | 1 credit |

#### Tier 3: Visual Deliverables (MARP free / Gamma premium)

| Template | MARP (Free) | Gamma (Pro) |
|----------|------------|-------------|
| **Positioning Deck (10-12 slides)** | 3 credits | 10 credits |
| **Sales Enablement Deck** | 3 credits | 10 credits |
| **Competitive Battlecard (designed)** | 2 credits | 8 credits |
| **Launch Announcement Deck** | 3 credits | 10 credits |
| **Board / Leadership GTM Update** | 3 credits | 10 credits |
| **Customer Case Study (designed)** | 2 credits | 8 credits |

#### What NOT to Template

**LinkedIn posts, emails, blog drafts.** These drove the deepest engagement in usage data (24.2 avg messages) precisely because they're iterative conversations, not one-shot outputs. Keep them as conversational advisory via `query_sherpa`. The conversation IS the product for content creation.

---

## 10. Credit Pricing Strategy

### Pricing Framework

Grounded in Ramanujam (*Monetizing Innovation*), Kyle Poyar (Growth Unhinged), PMA blogs on AI pricing, and 2026 market benchmarks.

**Core principle (Ramanujam):** Price against the value the customer receives, not your cost to deliver. His Optimizely case study: they stopped pricing per seat and moved to monthly unique visitors because that's what correlated with customer outcomes. For PMM Sherpa, the analogous metric is **completed advisory queries**, not seats and not raw tokens.

### The Value Anchor

The freelance PMM benchmark sets the ceiling:
- Positioning statement: $600-2,400 in freelance value (4-8 hours × $150-300/hr)
- Battlecard: $300-600
- Full launch plan: $2,000-5,000

Poyar's framework: subscription SaaS captures 10-15% of economic value. Success-based billing captures 20-30%. PMM Sherpa should aim for the 10-15% range for individual PMMs, higher for enterprise.

### Market Benchmarks (2026)

| Product | Per-query effective cost | What you get |
|---------|------------------------|--------------|
| Perplexity Sonar | $0.01-0.02 | Generic web search |
| Clay Data Credit | ~$0.05 | Simple enrichment |
| Tavily Research | $0.12-2.00 | Credit-weighted deep search |
| **Perplexity Sonar Deep Research** | **$0.41** | **Deep reasoning over web** |
| Intercom Fin | $0.99 | Outcome-based resolution |
| **PMM Sherpa (proposed)** | **$0.20** | **Expert advisory grounded in 38K proprietary chunks** |

AI marketing tool benchmarks: Jasper ($69/mo unlimited), Copy.ai ($49/mo unlimited), Writer (per-seat). These are generic writing tools with zero domain expertise. PMM Sherpa's RAG corpus justifies pricing above commodity AI but below outcome-based tools.

### Recommended: $0.20 per credit (PAYG)

| Rationale | Detail |
|-----------|--------|
| Above commodity AI | $0.01-0.05 is generic text generation. PMM Sherpa delivers expert-grounded advisory. |
| Below deep research | Perplexity Deep Research at $0.41 is the comp. Stay under at $0.20 to avoid sticker shock. |
| 5-10x margin over COGS | COGS per query is ~$0.02-0.04 (embedding + vector search + Claude Sonnet). $0.20 gives healthy margin. |
| Psychologically accessible | At $0.20, a 10-question session is $2.00. Feels like a coffee, not a consulting fee. |

### Credit Pack Pricing (volume discount)

| Pack | Credits | Price | Effective $/credit | Discount vs PAYG |
|------|---------|-------|-------------------|------------------|
| **Starter** | 100 | $15 | $0.15 | 25% off |
| **Growth** | 500 | $49 | $0.098 | 51% off |
| **Scale** | 1,500 | $99 | $0.066 | 67% off |

Ramanujam's "fences" principle: the volume discount rewards commitment, not penny-pinching. The Scale pack at $0.066/credit is still 2x COGS. The discount is steep enough to feel like a deal, shallow enough to protect margin.

### Web Subscription MCP Allowances (hybrid bundling)

| Web Tier | Price | MCP Credits Included/mo |
|----------|-------|------------------------|
| Free | $0 | 20 credits |
| Starter | $11.99 | 50 credits |
| Explorer | $19 | 100 credits |
| Studio | $39 | 200 credits |
| Army | $99 | 300 credits |

Overage: purchase credit packs. MCP-first users who never open the web app can stay on credit packs alone.

### Visual Deliverable Pricing

| Output | Engine | Credit Cost | Your COGS | Margin |
|--------|--------|-------------|-----------|--------|
| MARP deck (PDF/PPTX) | Server-side, MIT | 2-3 credits ($0.40-0.60) | ~$0 | ~100% |
| Gamma deck (AI-designed) | Gamma API | 8-10 credits ($1.60-2.00) | ~$0.50-2.00 | 0-70% |
| MARP one-pager | Server-side, MIT | 2 credits ($0.40) | ~$0 | ~100% |
| Gamma one-pager | Gamma API | 6-8 credits ($1.20-1.60) | ~$0.30-1.00 | 20-75% |

### Pricing Psychology (Poyar + Ramanujam)

1. **Don't let credits feel like micro-transactions.** The $49/500 Growth pack positions as "500 expert consultations for less than one hour of freelance PMM time."
2. **One credit = one advisory query.** Don't fragment by complexity the way Clay does (1 credit vs 75). PMM Sherpa customers want the answer, not a complexity taxonomy.
3. **Hybrid models (subscription + usage) report 21% median growth rate** (OpenView 2025 SaaS Benchmarks), outperforming both pure subscription and pure usage.
4. **Free tier is the activation ramp.** 20 credits/mo lets users experience 10 real advisory sessions. Enough to form a habit, not enough to live on.

### Visual Deliverable Integration: MARP + Gamma

**MARP as foundation (free/starter tier):**
- Zero marginal cost (MIT license, runs on server)
- Invest in 3-5 custom CSS themes for PMM deliverables
- Existing MCP server: `@masaki39/marp-mcp` (8 tools, MIT license)
- Output: Clean, professional Markdown → PDF/PPTX

**Gamma as premium upsell (pro tier):**
- Best-in-class AI presentation design quality
- One PMM Sherpa backend Gamma Pro account ($20/mo)
- Official API (GA Nov 2025) + official MCP server
- Cost per deck: ~$0.50-2.00 via API

**Canva MCP as optional add-on:**
- Requires each user to authenticate with own Canva account (OAuth)
- Good for power users already in Canva ecosystem
- Not the core engine — too much friction for default experience

### Sources (Pricing & Templates)

- Ramanujam, *Monetizing Innovation* — pricing metric selection, Optimizely case study, fences framework
- Kyle Poyar, Growth Unhinged — "From Selling Access to Selling Work," value capture margins, hybrid model benchmarks
- Lauchengco, *Loved* — "messaging source document as the single most important PMM artifact"
- King, *MisUnderstood PMM* — PMM deliverable prioritization, battlecard frequency
- Sheehan, *Pocket Guide to Product Launches* — launch plan structure, launch deliverable hierarchy
- PMA Blogs — competitive intelligence guides, artifact templates, win/loss frameworks
- Sharebird AMAs — 532 practitioner war stories on what PMMs actually produce day-to-day
- [Bessemer AI Pricing Playbook](https://www.bvp.com/atlas/the-ai-pricing-and-monetization-playbook)
- [2026 Guide to SaaS, AI, and Agentic Pricing](https://www.getmonetizely.com/blogs/the-2026-guide-to-saas-ai-and-agentic-pricing-models)
- [How to Price AI Products (Aakash Gupta)](https://www.news.aakashg.com/p/how-to-price-ai-products)
- [Jasper AI Pricing 2026](https://www.jasper.ai/pricing)
- [Sharebird PMM Launch Templates](https://sharebird.com/h/product-marketing/q/do-you-have-a-product-launch-template-that-you-use-to-drive-product-launches)
- [ProductivePMM Starter Kit](https://productivepmm.com/starter-kit)
- [MARP Ecosystem](https://marp.app/) — MIT license, `@marp-team/marp-cli`, `@masaki39/marp-mcp`
- [Gamma AI API](https://developers.gamma.app/) — GA Nov 2025, official MCP server
- [Canva MCP](https://www.canva.dev/docs/mcp/) — official, requires per-user OAuth

---

## Sources

### MCP Specification & Protocol
- [MCP Transports Specification](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [MCP Authorization Specification (Draft)](https://modelcontextprotocol.io/specification/draft/basic/authorization)
- [2026 MCP Roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [MCP Transport Future](https://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/)
- [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)

### Hosting & Deployment
- [Deploy MCP Servers: Vercel vs Railway vs Render vs Heroku vs Fly.io](https://mcpplaygroundonline.com/blog/deploy-mcp-server-vercel-railway-render-heroku-flyio)
- [Free MCP Server Hosting Guide](https://mcpplaygroundonline.com/blog/free-mcp-server-hosting-cloudflare-vercel-guide)
- [Vercel MCP Server Deployment Docs](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
- [Vercel mcp-handler GitHub](https://github.com/vercel/mcp-handler)
- [Host MCP Server: 2026 Deployment Guide](https://apigene.ai/blog/host-mcp-server)

### Authentication
- [MCP OAuth 2.1 Complete Guide](https://dev.to/composiodev/mcp-oauth-21-a-complete-guide-3g91)
- [WorkOS MCP Auth](https://workos.com/mcp)
- [WorkOS AuthKit MCP Docs](https://workos.com/docs/authkit/mcp)
- [Supabase MCP Authentication](https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication)
- [Supabase OAuth 2.1 Server](https://supabase.com/docs/guides/auth/oauth-server)
- [Clerk MCP Tools](https://github.com/clerk/mcp-tools)
- [Clerk MCP Server Guide](https://clerk.com/docs/expressjs/guides/ai/mcp/build-mcp-server)
- [Scalekit MCP OAuth Guide](https://www.scalekit.com/blog/ship-secure-mcp-server)

### ChatGPT Apps SDK
- [ChatGPT Apps SDK: Build MCP Server](https://developers.openai.com/apps-sdk/build/mcp-server)
- [ChatGPT Apps SDK: Authentication](https://developers.openai.com/apps-sdk/build/auth)
- [MCP Apps Compatibility in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt)
- [ChatGPT Apps SDK Quickstart](https://developers.openai.com/apps-sdk/quickstart)

### Production Implementations
- [Notion's Hosted MCP Server: An Inside Look](https://www.notion.com/blog/notions-hosted-mcp-server-an-inside-look)
- [HubSpot MCP Server](https://developers.hubspot.com/mcp)
- [Stripe MCP Documentation](https://docs.stripe.com/mcp)

### Claude Skills
- [Claude Skills vs MCP Servers](https://dev.to/williamwangai/claude-code-skills-vs-mcp-servers-what-to-use-how-to-install-and-the-best-ones-in-2026-548k)
- [Extending Claude with Skills and MCP](https://claude.com/blog/extending-claude-capabilities-with-skills-mcp-servers)
- [Claude Code Full Stack: MCP, Skills, Subagents, Hooks](https://alexop.dev/posts/understanding-claude-code-full-stack/)

### Performance & Caching
- [MCP Caching Strategies](https://markaicode.com/mcp-caching-strategies-reducing-latency/)
- [MCP Caching: Redis, CDN & Semantic Caching](https://makeaihq.com/guides/cluster/mcp-server-caching-strategies)
- [Fix MCP Error -32001: Request Timeout](https://mcpcat.io/guides/fixing-mcp-error-32001-request-timeout/)

### Security
- [MCP Security Best Practices for 2026](https://www.akto.io/blog/mcp-security-best-practices)
- [MCP Security Vulnerabilities Guide](https://aembit.io/blog/the-ultimate-guide-to-mcp-security-vulnerabilities/)
- [MCP Server Security for Safe AI Deployments](https://www.truefoundry.com/blog/mcp-server-security-best-practices)

### Billing & Metering
- [MCP Billing Gateway SDK](https://glama.ai/mcp/servers/sapph1re/mcp-billing-gateway-sdk)
- [Stripe Usage Metering](https://stripe.com/resources/more/usage-metering)
- [Paid MCP Servers with Stripe and Cloudflare](https://dev.to/hideokamoto/exploring-paid-mcp-servers-with-stripe-and-cloudflare-my-hands-on-experience-3le9)
- [Stripe Meter Configuration](https://docs.stripe.com/billing/subscriptions/usage-based/meters/configure)

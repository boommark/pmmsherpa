# PMM Sherpa MCP Server — Phase 1 Implementation Plan

> **Scope:** Stand up a remote MCP server on the existing `pmmsherpa/` Next.js 16 / Vercel / Supabase stack. Streamable HTTP transport, OAuth 2.1 + PKCE on Supabase Auth, Langfuse tracing tagged `surface:mcp`. First end-to-end tool: `search_corpus` (lookup-only, wraps `hybrid_search`). Stub but do not implement: `query_pmm_sherpa`, `validate_artifact`.

> **Locked decisions:** Supabase Auth (self-hosted, PKCE) over WorkOS/Clerk; Streamable HTTP per MCP spec rev 2025-11-25; same Vercel project; `surface:mcp` Langfuse tag.

---

## 1. File structure

```
src/app/
├── .well-known/
│   ├── oauth-protected-resource/
│   │   └── route.ts               # RFC 9728 — points to AS metadata
│   └── oauth-authorization-server/
│       └── route.ts               # RFC 8414 — discovery for /authorize, /token, /register
├── api/mcp/
│   ├── route.ts                   # Streamable HTTP transport: POST + GET + DELETE on /api/mcp
│   ├── authorize/
│   │   └── route.ts               # OAuth 2.1 authorize endpoint (wraps Supabase OAuth)
│   ├── token/
│   │   └── route.ts               # PKCE token exchange + refresh
│   ├── callback/
│   │   └── route.ts               # Supabase OAuth callback → mints MCP code
│   └── register/
│       └── route.ts               # RFC 7591 dynamic client registration (CIMD)
└── api/chat/route.ts              # (existing — reference pattern)

src/lib/mcp/
├── transport.ts                   # Streamable HTTP framing: JSON-RPC parse, SSE encode, session map
├── server.ts                      # MCP server core: initialize / tools/list / tools/call dispatch
├── auth.ts                        # JWT verify against Supabase JWKs, bearer extraction, scope check
├── pkce.ts                        # code_verifier ↔ code_challenge (S256), state generation
├── oauth-store.ts                 # Supabase-backed table for auth_codes + refresh_tokens
├── tools/
│   ├── index.ts                   # Tool registry: name → { schema, handler }
│   ├── search-corpus.ts           # IMPLEMENT — wraps retrieveContext()
│   ├── query-pmm-sherpa.ts        # STUB — full RAG + LLM (Phase 1.5)
│   └── validate-artifact.ts       # STUB — review mode (Phase 1.5)
├── tracing.ts                     # startMcpObservation() helper — sets surface:mcp tag
└── errors.ts                      # JSON-RPC error codes + MCP-specific shapes

supabase/migrations/
└── 20260501_mcp_oauth.sql         # mcp_auth_codes, mcp_refresh_tokens, mcp_clients tables

src/instrumentation.ts             # (existing — already wires Langfuse, no change)
src/lib/observability/trace.ts     # (existing — getActiveTraceId reused)
```

---

## 2. OAuth 2.1 + PKCE on Supabase Auth

### 2.1 Discovery endpoints

**`/.well-known/oauth-protected-resource`** (RFC 9728) — the resource server side. The MCP transport at `/api/mcp` returns `WWW-Authenticate: Bearer resource_metadata="https://pmmsherpa.com/.well-known/oauth-protected-resource"` on 401. JSON body:

```json
{
  "resource": "https://pmmsherpa.com/api/mcp",
  "authorization_servers": ["https://pmmsherpa.com"],
  "bearer_methods_supported": ["header"],
  "resource_documentation": "https://pmmsherpa.com/docs/mcp",
  "scopes_supported": ["mcp:read", "mcp:query"]
}
```

**`/.well-known/oauth-authorization-server`** (RFC 8414) — the AS side:

```json
{
  "issuer": "https://pmmsherpa.com",
  "authorization_endpoint": "https://pmmsherpa.com/api/mcp/authorize",
  "token_endpoint": "https://pmmsherpa.com/api/mcp/token",
  "registration_endpoint": "https://pmmsherpa.com/api/mcp/register",
  "jwks_uri": "https://cfztsohetqiaudijlocj.supabase.co/auth/v1/.well-known/jwks.json",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"],
  "token_endpoint_auth_methods_supported": ["none"],
  "scopes_supported": ["mcp:read", "mcp:query", "offline_access"]
}
```

Note: `jwks_uri` points at Supabase's own JWKs so we can verify access tokens minted by Supabase Auth without re-issuing them. We are *wrapping* Supabase's session, not standing up a parallel JWT signer.

### 2.2 Authorization flow (wrap Supabase, don't reimplement)

We do **not** mint our own JWTs. We use Supabase's existing access tokens and bind them to MCP authorization codes. Pseudocode for `/api/mcp/authorize`:

```ts
// src/app/api/mcp/authorize/route.ts
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')           // e.g. claude://oauth/callback
  const codeChallenge = params.get('code_challenge')
  const codeChallengeMethod = params.get('code_challenge_method')  // must be 'S256'
  const state = params.get('state')
  const scope = params.get('scope') ?? 'mcp:read mcp:query'

  if (codeChallengeMethod !== 'S256') return error(400, 'invalid_request')
  if (!await isRegisteredClient(clientId, redirectUri)) return error(400, 'unauthorized_client')

  // Stash PKCE + redirect in a short-lived cookie keyed by state
  const stash = { clientId, redirectUri, codeChallenge, scope, state }
  cookies().set('mcp_oauth_pending', signed(stash), { maxAge: 600, httpOnly: true })

  // Punt to Supabase's existing OAuth (Google) — user signs in with their PMM Sherpa account
  const supabase = await createClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'https://pmmsherpa.com/api/mcp/callback' },
  })
  return redirect(data.url)
}
```

`/api/mcp/callback` runs after Supabase finishes auth: read the Supabase session, generate an opaque MCP authorization code, persist it bound to `(user_id, code_challenge, supabase_refresh_token)`, then redirect back to the MCP client's `redirect_uri` with `?code=...&state=...`.

```ts
// src/app/api/mcp/callback/route.ts
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const stash = readSignedCookie('mcp_oauth_pending')
  const code = randomUUID()
  const { data: { session } } = await supabase.auth.getSession()

  await mcpAuthCodes.insert({
    code,
    user_id: user.id,
    client_id: stash.clientId,
    code_challenge: stash.codeChallenge,
    redirect_uri: stash.redirectUri,
    scope: stash.scope,
    supabase_refresh_token: session!.refresh_token,
    expires_at: new Date(Date.now() + 60_000),  // 60s
  })

  return redirect(`${stash.redirectUri}?code=${code}&state=${stash.state}`)
}
```

### 2.3 Token endpoint — verify PKCE, return Supabase tokens

```ts
// src/app/api/mcp/token/route.ts
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const grantType = form.get('grant_type')

  if (grantType === 'authorization_code') {
    const code = form.get('code') as string
    const verifier = form.get('code_verifier') as string
    const clientId = form.get('client_id') as string

    const row = await mcpAuthCodes.consume(code)  // single-use, deletes on read
    if (!row || row.expires_at < new Date()) return error(400, 'invalid_grant')
    if (row.client_id !== clientId) return error(400, 'invalid_client')

    // Verify PKCE: SHA256(verifier) base64url == row.code_challenge
    const challenge = base64url(await sha256(verifier))
    if (challenge !== row.code_challenge) return error(400, 'invalid_grant')

    // Refresh Supabase session to get a fresh access_token we can hand to the client
    const supabase = await createServiceClient()
    const { data, error: refreshErr } = await supabase.auth.refreshSession({
      refresh_token: row.supabase_refresh_token,
    })
    if (refreshErr) return error(400, 'invalid_grant')

    // Persist the rotated refresh token under our own opaque handle
    const mcpRefresh = randomUUID()
    await mcpRefreshTokens.insert({
      token: mcpRefresh,
      user_id: row.user_id,
      supabase_refresh_token: data.session!.refresh_token,
      scope: row.scope,
    })

    return Response.json({
      access_token: data.session!.access_token,   // Supabase JWT, verifiable via JWKs
      token_type: 'Bearer',
      expires_in: data.session!.expires_in,
      refresh_token: mcpRefresh,
      scope: row.scope,
    })
  }

  if (grantType === 'refresh_token') {
    const mcpRefresh = form.get('refresh_token') as string
    const row = await mcpRefreshTokens.findAndRotate(mcpRefresh)
    if (!row) return error(400, 'invalid_grant')

    const supabase = await createServiceClient()
    const { data } = await supabase.auth.refreshSession({
      refresh_token: row.supabase_refresh_token,
    })
    // ...rotate, return new pair
  }
}
```

### 2.4 Token validation on tool calls (`src/lib/mcp/auth.ts`)

```ts
import { jwtVerify, createRemoteJWKSet } from 'jose'

const JWKS = createRemoteJWKSet(new URL(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
))

export async function authenticateMcpRequest(req: Request): Promise<{
  userId: string; email: string; scopes: string[]
} | null> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null

  const token = auth.slice(7)
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    })
    return {
      userId: payload.sub as string,
      email: (payload.email as string) ?? '',
      scopes: ((payload.scope as string) ?? 'mcp:read mcp:query').split(' '),
    }
  } catch {
    return null
  }
}
```

On any tool call where `authenticateMcpRequest` returns null, respond 401 with `WWW-Authenticate: Bearer error="invalid_token", resource_metadata="..."`.

---

## 3. MCP transport — Streamable HTTP at `/api/mcp`

**Spec ref:** modelcontextprotocol.io rev 2025-11-25, "Streamable HTTP" (replaces the older HTTP+SSE pair).

- **Single endpoint** at `/api/mcp` accepts `POST` (JSON-RPC requests + notifications) and `GET` (server-initiated SSE stream). `DELETE` terminates a session.
- **Session ID:** server returns `Mcp-Session-Id: <uuid>` in the response to the first `initialize` request. Clients echo it on every subsequent request. Server may return 404 if the session is unknown — client must re-initialize.
- **Response framing:** when the client sends a request that the server wants to stream (e.g., progressive `tools/call` output), respond with `Content-Type: text/event-stream` and emit JSON-RPC frames as `data:` lines, terminated by `\n\n`. For one-shot responses, return `Content-Type: application/json` with the single JSON-RPC envelope.
- **Initialize handshake:**
  ```jsonc
  // → POST /api/mcp
  { "jsonrpc":"2.0", "id":1, "method":"initialize",
    "params":{ "protocolVersion":"2025-11-25",
               "capabilities":{}, "clientInfo":{"name":"claude","version":"..."}}}
  // ← 200, header Mcp-Session-Id: 7f3a...
  { "jsonrpc":"2.0", "id":1,
    "result":{ "protocolVersion":"2025-11-25",
               "capabilities":{"tools":{"listChanged":false}},
               "serverInfo":{"name":"pmm-sherpa","version":"0.1.0"}}}
  ```
- **Session map** lives in `src/lib/mcp/transport.ts`. For Vercel serverless, sessions are persisted in Redis (Upstash) or the existing Supabase Postgres — pick Supabase to avoid a new dependency. Schema: `mcp_sessions(id uuid pk, user_id uuid, created_at, last_seen_at, initialized bool)`.
- **Method dispatch** in `src/lib/mcp/server.ts`:
  - `initialize` → mark session initialized, return capabilities.
  - `tools/list` → return registry from `src/lib/mcp/tools/index.ts`.
  - `tools/call` → look up handler, invoke under tracing wrapper.
  - Unknown method → JSON-RPC error -32601.
  - Request before `initialize` → JSON-RPC error -32002 ("server not initialized").

---

## 4. Tool definitions

### 4.1 `search_corpus` — IMPLEMENT in Phase 1

**Description:** "Search the PMM Sherpa knowledge base (38K+ chunks across 34 books, 583 podcasts, 532 AMAs, 827 PMA blogs, etc.) and return the most relevant excerpts. Lookup-only, no LLM synthesis."

**Input schema:**
```json
{
  "type": "object",
  "required": ["query"],
  "properties": {
    "query": { "type": "string", "minLength": 3, "maxLength": 1000,
               "description": "Natural-language question or topic." },
    "top_k": { "type": "integer", "minimum": 1, "maximum": 20, "default": 8 },
    "source_types": {
      "type": "array",
      "items": { "type": "string", "enum": [
        "book","book_pm","book_sales","book_presentations","book_communication",
        "podcast_pm","podcast_pmm","podcast_ai","ama","blog","blog_external"
      ]},
      "description": "Optional filter."
    }
  }
}
```

**Output (MCP `content` array):** one `text` block with formatted markdown (reuse `formatContextForPrompt` from `retrieval.ts`) + a structured JSON block for programmatic clients:

```json
{
  "content": [
    { "type": "text", "text": "### Frameworks & Theory\n[Source 1] \"Loved\" by Lauchengco (Page 126)\n..." }
  ],
  "structuredContent": {
    "chunks": [{ "source": "...", "author": "...", "url": "...", "snippet": "...", "score": 0.84 }],
    "trace_id": "<otel-trace-id>"
  }
}
```

**Internal flow** (`src/lib/mcp/tools/search-corpus.ts`):
1. `startMcpObservation('mcp.tool.search_corpus', { userId, sessionId })` — sets `surface:mcp` tag.
2. Validate input against schema (zod).
3. Call `retrieveContext({ query, topK: top_k })` from `src/lib/rag/retrieval.ts`. (Use single-query, not `multiQueryRetrieve` — keep it cheap.)
4. If `source_types` provided, filter `chunks` post-retrieval.
5. Format via `formatContextForPrompt(chunks)`; build `extractCitations(chunks)` for `structuredContent`.
6. Set `span.update({ output: { chunkCount, traceId } })`, `setActiveTraceIO({ input, output })`.
7. `waitUntil(langfuseSpanProcessor.forceFlush())` — same pattern as `/api/chat`.

This tool deliberately does **not** touch monthly usage gates, abuse detection, or LLM cost tracking. It's a read-only retrieval primitive — fast, idempotent, easy to test end-to-end.

### 4.2 `query_pmm_sherpa` — STUB only (defer implementation)

**Description:** "Ask PMM Sherpa a strategic product-marketing question. Returns a synthesized answer with citations from the knowledge base, current web research, and the full Layer-4 voice system prompt."

**Input schema:** `{ query: string, conversation_id?: string, model?: 'opus'|'sonnet'|'gemini-pro' }`

**Output:** `{ content: [{ type: 'text', text: <answer> }], structuredContent: { citations, webCitations, traceId } }`

**Internal flow (deferred, but planned):** Refactor the body of `/api/chat/route.ts` lines 286–770 into a reusable `runSherpaQuery({ message, conversationId, userId, model })` function in `src/lib/sherpa/query.ts`. The web route and the MCP tool both call into it. **Do not stream** from MCP — collect `fullResponseText` and return as a single `content` block. Apply the same monthly usage gate (free 10 / starter 200) but read-only for beta. Track cost under endpoint='/api/mcp/query_pmm_sherpa' so we can split MCP from web in usage analytics.

### 4.3 `validate_artifact` — STUB only

**Description:** "Review a PMM artifact (positioning statement, messaging, launch plan) and surface gaps, inconsistencies, and missed PMM principles."

**Input:** `{ artifact_text: string, artifact_type: 'positioning'|'messaging'|'launch_plan'|'other', context?: string }`

**Output:** Markdown review with strengths, gaps, suggested rewrites.

**Flow:** intent='review', specialized prompt overlay, RAG biased toward AMAs (per `INTENT_BOOSTS.review` in `retrieval.ts`).

---

## 5. Langfuse tracing (`src/lib/mcp/tracing.ts`)

Mirror the pattern from `src/app/api/chat/route.ts:266–284`:

```ts
import { startActiveObservation, setActiveTraceIO } from '@langfuse/tracing'
import { LangfuseOtelSpanAttributes } from '@langfuse/core'
import { langfuseSpanProcessor } from '@/instrumentation'
import { waitUntil } from '@vercel/functions'

export async function startMcpObservation<T>(
  name: string,
  ctx: { userId: string; sessionId: string; toolName?: string; input: unknown },
  fn: (span: Awaited<ReturnType<typeof startActiveObservation>>) => Promise<T>
): Promise<T> {
  return startActiveObservation(name, async (span) => {
    span.update({
      input: ctx.input,
      metadata: { userId: ctx.userId, sessionId: ctx.sessionId,
                  surface: 'mcp', toolName: ctx.toolName },
    })
    setActiveTraceIO({ input: ctx.input })
    span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_NAME, name)
    span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_USER_ID, ctx.userId)
    span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_SESSION_ID, ctx.sessionId)
    span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_TAGS, ['surface:mcp'])
    try {
      return await fn(span)
    } finally {
      waitUntil(langfuseSpanProcessor.forceFlush())
    }
  })
}
```

Trace name conventions: `mcp.transport.request` (the outer envelope) and `mcp.tool.<tool_name>` (per tool call) — nested children of the transport span. `getActiveTraceId()` from `src/lib/observability/trace.ts` is reused to echo trace IDs back to clients in error paths so support can correlate.

---

## 6. Edge cases the test agent must cover

1. **Missing Authorization header** on `/api/mcp` POST → 401 + `WWW-Authenticate` with `resource_metadata` URL pointing at protected-resource doc.
2. **Expired access token** (Supabase JWT past `exp`) → 401 + `error="invalid_token"`. Client should refresh.
3. **Malformed bearer token** (not JWT, signature fails JWKS verification) → 401, no leak of internal state.
4. **PKCE verifier mismatch** at `/api/mcp/token` → 400 `invalid_grant`. `code` is consumed regardless to prevent replay.
5. **Authorization code reuse** (second `POST /token` with the same code) → 400 `invalid_grant`. Single-use enforced by `mcpAuthCodes.consume()`.
6. **Tool call before `initialize`** → JSON-RPC -32002. Session ID present but `initialized=false`.
7. **Unknown tool name** in `tools/call` → JSON-RPC -32601 with `data: { availableTools: [...] }`.
8. **Oversized query** (>1000 chars on `search_corpus`) → JSON-RPC -32602 invalid params.
9. **RAG returns zero chunks** → return success with empty `chunks` array and `text: "No relevant content found in the corpus for this query."` Don't 500.
10. **Concurrent requests on same `Mcp-Session-Id`** → both succeed; session row uses `last_seen_at = NOW()` upsert, no row-level locking required for read-only tools.
11. **Mid-request token expiry** (token expires while RAG is running) → request completes; expiry is checked once at entry. Client refreshes for the next call.
12. **Trace ID propagation** → assert `getActiveTraceId()` inside `search-corpus.ts` matches the trace ID visible in Langfuse UI for that user. Surface in `structuredContent.trace_id`.
13. **Unknown `Mcp-Session-Id`** (e.g., after server restart wipes in-memory cache, or session row deleted) → 404; client must re-initialize.
14. **`DELETE /api/mcp`** with valid session → 204, row removed, subsequent calls 404.
15. **Cross-user session takeover** — token user_id ≠ session user_id → 403 `forbidden`.
16. **Supabase JWKs unreachable** (network blip) → 503 with retry hint, don't crash. `jose` caches JWKs by default.
17. **CIMD client registration** with malformed `client_metadata.json` URL → 400 `invalid_client_metadata`.

---

## 7. Open questions / risks

1. **Dynamic Client Registration vs CIMD.** Spec rev 2025-11-25 prefers CIMD (Client ID Metadata Documents) over RFC 7591 DCR. Claude desktop currently uses DCR. Ship `/api/mcp/register` (RFC 7591) Day 1; add CIMD support before public registry submission. Risk: Anthropic registry may reject DCR-only servers.
2. **Session state on Vercel.** Serverless functions are stateless; session map must live in Supabase (or Upstash Redis). Postgres adds ~10–20ms per request. Acceptable for Phase 1; revisit if p95 climbs.
3. **Should access tokens be Supabase JWTs directly, or wrapped?** Direct Supabase JWTs leak our project URL via `iss`. Acceptable for beta; consider a proxy issuer in Phase 2 if enterprise customers object.
4. **Refresh token rotation cadence.** Supabase rotates on each refresh. We must update `mcpRefreshTokens.supabase_refresh_token` on every refresh — race condition if two clients refresh simultaneously. Use Postgres `SELECT ... FOR UPDATE`.
5. **Rate limiting.** No per-user limit on `search_corpus` in Phase 1. Free during beta. Add bucket (e.g., 60 req/min) before billing turns on (Phase 4).
6. **Free-tier corpus access via MCP.** Should free users (10 web msgs/mo) get unlimited `search_corpus` calls via MCP? Recommendation: yes, since it's lookup-only and cheap. The expensive `query_pmm_sherpa` tool inherits the monthly cap.
7. **Source-type filter UX.** Do we expose all 11 source types, or group them into 3–4 buckets (books / podcasts / community / blogs)? Affects schema. Defer to user feedback after week 1.
8. **MCP server identity in Anthropic Registry.** Need a `server.json` manifest. Not blocking Phase 1 build, blocking Phase 1 launch.
9. **Supabase session cookie SameSite during OAuth redirect.** Supabase's default `Lax` may break the `/authorize → google.com → /callback` flow if `redirect_uri` is non-pmmsherpa. Test with `claude://` scheme specifically.

---

## 8. Build agent breakdown

Three parallel build briefs. Each is self-contained and references the spec sections above. Build agents should not need to re-read IDEAS.md.

### Brief A — Transport (`src/lib/mcp/transport.ts`, `src/app/api/mcp/route.ts`)

**Goal:** Streamable HTTP at `/api/mcp` per spec section 3. Handles `initialize`, `tools/list`, `tools/call`, `DELETE`. Session state in Supabase (`mcp_sessions` table — write the migration).

**Inputs:** Section 3 (transport), Section 5 (tracing), Section 6 (edge cases 6, 10, 13, 14).

**Outputs:**
- `src/lib/mcp/transport.ts` — JSON-RPC parsing, SSE encoder, session CRUD.
- `src/lib/mcp/server.ts` — method dispatch table.
- `src/app/api/mcp/route.ts` — Next.js route handler exporting `POST`, `GET`, `DELETE`. Wrap the whole thing in `startMcpObservation('mcp.transport.request', ...)`.
- `supabase/migrations/<ts>_mcp_sessions.sql` — `mcp_sessions` table.

**Done when:**
- `curl -X POST /api/mcp -d '{"jsonrpc":"2.0","id":1,"method":"initialize",...}'` returns 200 with `Mcp-Session-Id` header.
- Subsequent `tools/list` with that session header returns the tool registry.
- `tools/call` before `initialize` returns -32002.
- A trace appears in Langfuse with name `mcp.transport.request` and tag `surface:mcp`.

**Stub the auth check** to `userId='test-user-id'` for now — Brief B replaces it.

### Brief B — OAuth 2.1 + PKCE (`src/lib/mcp/auth.ts`, `src/app/api/mcp/{authorize,token,callback,register}/route.ts`, `.well-known/*`)

**Goal:** Full OAuth flow per spec section 2. Wraps Supabase Auth, does not reissue JWTs. Stores codes + refresh tokens in Supabase.

**Inputs:** Section 2 (full), Section 6 (edge cases 1–5, 15–17).

**Outputs:**
- `.well-known/oauth-protected-resource/route.ts`
- `.well-known/oauth-authorization-server/route.ts`
- `src/app/api/mcp/authorize/route.ts`
- `src/app/api/mcp/callback/route.ts`
- `src/app/api/mcp/token/route.ts` (PKCE verify + refresh grant)
- `src/app/api/mcp/register/route.ts` (RFC 7591 minimal)
- `src/lib/mcp/auth.ts` — `authenticateMcpRequest()` JWKS verifier
- `src/lib/mcp/pkce.ts` — S256 helpers
- `src/lib/mcp/oauth-store.ts` — Supabase wrappers
- `supabase/migrations/<ts>_mcp_oauth.sql` — `mcp_clients`, `mcp_auth_codes`, `mcp_refresh_tokens` tables
- Wire `authenticateMcpRequest` into `/api/mcp/route.ts` (replacing Brief A's stub).

**Done when:**
- An end-to-end PKCE flow from a CLI test client mints a working access token.
- `jwtVerify` against Supabase JWKs succeeds; expired/forged tokens 401.
- Refresh flow rotates and returns a fresh pair.
- Replay of a consumed `code` returns 400.

### Brief C — `search_corpus` tool (`src/lib/mcp/tools/search-corpus.ts`, `src/lib/mcp/tools/index.ts`, `src/lib/mcp/tracing.ts`)

**Goal:** First end-to-end tool. Wraps `retrieveContext` from `src/lib/rag/retrieval.ts:14`. Traced as `mcp.tool.search_corpus` under the parent transport span.

**Inputs:** Section 4.1 (schema), Section 5 (tracing), Section 6 (edge cases 7–9, 12).

**Outputs:**
- `src/lib/mcp/tracing.ts` — `startMcpObservation` helper.
- `src/lib/mcp/tools/index.ts` — tool registry (zod schemas + handlers).
- `src/lib/mcp/tools/search-corpus.ts` — implementation.
- `src/lib/mcp/tools/query-pmm-sherpa.ts` — stub returning `{ content: [{ type:'text', text: 'Not implemented in Phase 1.' }] }` with the correct schema in `tools/list`.
- `src/lib/mcp/tools/validate-artifact.ts` — same stub pattern.
- `src/lib/mcp/errors.ts` — JSON-RPC error builder.

**Done when:**
- `tools/call` for `search_corpus` returns formatted markdown + `structuredContent.chunks` + `structuredContent.trace_id`.
- Trace appears in Langfuse as a child span of `mcp.transport.request`, with `surface:mcp` tag, `userId` populated, and `output.chunkCount` set.
- Empty-result path (query like "asdfqwerty zzz") returns a clean "no content found" response, not an error.
- `top_k` boundaries (1, 20) work; out-of-range returns -32602.

**Brief C blocks on Brief A** (needs the dispatch wiring) but can develop tool logic against a unit-test harness in parallel.

---

**End of Phase 1 plan. Total scope: ~3 build briefs, 1 migration, ~12 new files. Estimate: 5–8 working days at one engineer.**

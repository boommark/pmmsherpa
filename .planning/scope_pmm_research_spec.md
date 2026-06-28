# `scope_pmm_research` — MCP Tool Spec & Description Refactor

**Status:** Planning. No code changes yet.
**Author:** Abhishek (drafted via Claude Code)
**Date:** 2026-05-07
**Targets:** `src/lib/mcp/tools.ts`, `src/app/api/mcp/route.ts`, `src/lib/mcp/helpers.ts`

---

## 1. Why a fourth tool

Claude Deep Research uses an orchestrator-worker loop. At **planning time** the lead agent wants a structured scope (angle, sub-questions, sources to weight, anti-patterns, success criteria) — not advisory prose. `ask_sherpa` returns Layer-4 voice, which is the wrong shape for that hook and burns tokens. A purpose-built scoping tool that returns terse JSON solves this and frees the existing three tools to keep their advisory/drafting/critique shapes intact.

We also need to rewrite the existing three descriptions as **phase triggers** so Claude's lead agent picks the right tool deterministically rather than defaulting to `ask_sherpa` for everything.

---

## 2. Phase-triggered descriptions (rewrites)

The model below: open with WHEN (the phase), say WHAT (concrete output), say WHEN NOT (anti-pattern). 3–5 sentences. Imperative.

### `scope_pmm_research` (new)

> Call this at the **start** of any PMM-adjacent research run, before spawning subagents or drafting anything. Returns structured JSON: `{ angle, sub_questions[], sources_to_weight[], anti_patterns[], success_criteria[] }` — a research brief, not prose. Use it to decompose a vague PMM question ("how should we position X", "what's the GTM for Y") into orthogonal sub-questions a research swarm can attack in parallel. Do NOT call for follow-up questions inside an active research thread, single-fact lookups, or any non-PMM topic.

### `ask_sherpa` (rewrite)

> Call during the **advisory** phase — when the user wants a grounded conversational answer to a strategic PMM question. Returns Sherpa's voice: a corpus-cited recommendation with reasoning. Use for "how do I…", "what would you do…", "should we…" framings on positioning, messaging, launch, GTM, or pricing. Do NOT call at planning time (use `scope_pmm_research`), when producing a named deliverable (use `draft_artifact`), or when critiquing existing work (use `get_feedback`).

### `draft_artifact` (rewrite)

> Call during the **drafting** phase when the user wants a specific named PMM deliverable produced end-to-end. Returns a fully-filled Markdown artifact (positioning statement, messaging framework, launch plan, battlecard, ICP, persona, blog brief, landing-page copy, pricing-page copy, plus 30 others — 39 total). Required: `artifact_type` enum match. Do NOT call when the user is exploring options conversationally (use `ask_sherpa`), or when they have a draft and want it reviewed (use `get_feedback`).

### `get_feedback` (rewrite)

> Call during the **validating** phase when the user has work in hand (their text, a URL's content, a file extract) and wants it pressure-tested against PMM principles. Returns structured JSON: `{ critique, gaps[], recommendations[], principles_cited[] }`. Use for reviewing positioning drafts, competitor pages, decks, blog posts, or any artifact the user wants strengthened. Do NOT call to *generate* an artifact (use `draft_artifact`) or to answer a question about a topic (use `ask_sherpa`).

---

## 3. `scope_pmm_research` — full spec

### Input schema (minimum viable)

```ts
{
  type: 'object',
  required: ['question'],
  properties: {
    question:     { type: 'string', minLength: 10, maxLength: 2000 },
    context:      { type: 'string', maxLength: 2000,
                    description: 'Optional: company stage, audience, prior decisions, constraints.' },
    audience_hint:{ type: 'string', maxLength: 200,
                    description: 'Optional: target buyer/ICP if known (e.g., "RevOps director at Series B SaaS").' },
  },
}
```

Rationale for keeping it small: every additional required field punishes the orchestrator. `context` and `audience_hint` are both optional strings the LLM can weave in if present. We do **not** need `target_audience`, `company_stage`, etc. as separate fields — they collapse into `context` cleanly.

### Output schema (structured JSON, not prose)

Returned in `structuredContent`; `content[0].text` carries a stringified JSON for hosts that don't read structured payloads.

```ts
{
  angle: string,                   // 1-2 sentence point of view on how to attack the question
  sub_questions: string[],         // 3-7 orthogonal questions a research swarm should answer
  sources_to_weight: string[],     // PMM source types/authors to prioritize (e.g. "April Dunford on positioning", "PMA blog on launch tiers")
  anti_patterns: string[],         // 2-4 traps/wrong-paths to avoid (e.g. "feature-list framing", "audience = everyone")
  success_criteria: string[],      // 3-5 bullets describing what a *good* answer would contain
  citations: Citation[],           // grounded principle citations (reuse existing Citation type)
  usage: { inputTokens, outputTokens },
}
```

### System prompt suffix (plumbed via `customSystemPromptSuffix`)

```
You are scoping a research run. Return ONLY valid JSON matching this exact shape — no prose, no preamble, no closing remarks, no markdown fences:

{
  "angle": "...",
  "sub_questions": ["...", "..."],
  "sources_to_weight": ["...", "..."],
  "anti_patterns": ["...", "..."],
  "success_criteria": ["...", "..."]
}

Sub-questions must be orthogonal (no overlap), specific, and answerable with PMM corpus knowledge. Ground anti_patterns and success_criteria in cited principles where possible. Do not include the word "json" or any code fences.
```

Use `intentOverride: 'review'` (closest existing intent for analytical retrieval boost) — or add a new `'scope'` intent if the planner type allows. Recommend reusing `'review'` for v1 to avoid touching the planner.

---

## 4. Implementation sketch

**`src/lib/mcp/tools.ts`** — slot the new export between `getFeedbackTool` and the registry block. Register in the `tools` map alongside the other three. Pattern mirrors `getFeedbackTool`: usage gate → build prompt → `runSherpaChat({ message, userId, intentOverride: 'review', customSystemPromptSuffix: SCOPE_SUFFIX })` → parse JSON → return.

**`src/app/api/mcp/route.ts`** — no handler changes. Routing is name-based; the new tool registers itself via `tools.ts`. **Do not stream.** The output is small structured JSON; streaming partial JSON would corrupt the parse. Skip the `onProgress` plumbing entirely.

**`src/lib/mcp/helpers.ts`** — `customSystemPromptSuffix` is sufficient. No new options needed. The empty-corpus short-circuit already handled in `runSherpaChat` should fall through to a graceful empty-shape response (`sub_questions: []`, etc.) rather than an error — match the pattern in `ask_sherpa`/`get_feedback`.

**Validation** — do NOT run the response through `parseCritiqueMarkdown`. Instead:
1. Strip any leading/trailing markdown fences defensively (LLMs sometimes ignore the "no fences" instruction).
2. `JSON.parse()` inside a try/catch.
3. Validate shape with a small Zod schema (`scopeResultSchema`) — if invalid, log + return `isError: true` with the raw text in `structuredContent.raw` for debugging.
4. Coerce arrays to length caps (sub_questions ≤ 7, others ≤ 5) defensively.

---

## 5. Rollout sequencing

1. **Branch** off `staging`: `feature/scope-pmm-research`.
2. **Unit tests** (`src/lib/mcp/__tests__/tools.test.ts` or new file):
   - JSON parse happy path → returns structured shape.
   - Markdown-fence-wrapped JSON → strips and parses.
   - Invalid JSON → `isError: true` with raw text preserved.
   - Empty corpus → graceful empty shape, no usage increment.
   - Sub-questions cap enforcement.
3. **Integration test** — hit the staging MCP server with a real Anthropic API key, call `tools/list` (assert 4 tools), call `scope_pmm_research` with a canonical question ("how should a Series B observability startup position against Datadog"), assert structured shape and ≥3 sub_questions.
4. **Description rewrites** — ship the three rewrites in the SAME PR. The point is to teach the lead agent the new four-tool taxonomy atomically; partial rollout invites mis-routing.
5. **Deploy to staging.pmmsherpa.com** → smoke test via the Sherpa Staging MCP connector in claude.ai.
6. **Eval pass** — add a small Braintrust eval (5–10 prompts) that scores: did the tool return valid JSON; are sub_questions orthogonal; do success_criteria reference grounded principles. Baseline before merging to main.
7. **Merge to main** → production. Update `CLAUDE.md` and `MEMORY.md` (`project_pmmsherpa_mcp_phase1.md` → add Phase 3 line for scope tool).

### Risks to flag

- **JSON adherence drift**: Sonnet 4.6 sometimes leaks prose around JSON. Mitigation: defensive fence-strip + Zod + retry once on parse failure.
- **Description rewrite regressing tool selection**: Anthropic's lead agent may have cached behavior on the old descriptions. Run eval immediately after staging deploy comparing tool-selection rate across 20 mixed prompts (planning / advisory / drafting / validating).
- **Usage gate accounting**: scoping is cheaper than advisory but currently bills the same. Decide whether `scope_pmm_research` increments the usage counter — recommend YES for v1 (simpler) and revisit if abuse patterns appear.
- **Token cost in deep-research loops**: if an orchestrator calls `scope_pmm_research` then 5× `ask_sherpa`, the user burns 6 messages for one research run. Monitor and consider a "research session" usage discount in Phase 4.
- **Intent='review' is a smell**: revisit adding a `'scope'` intent in the query planner once the tool is in production and we have data on which retrieval boosts actually help.

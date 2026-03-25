# PMM Sherpa — To-Do

_Last updated: 2026-03-24_

---

## In Progress

- [x] **Action bar simplification** — Kill Perplexity dropdown + globe toggle. Replace with single Research toggle (Perplexity icon, quick research only). Remove deep research + native web search tools entirely.
- [x] **URL scraping** — When user pastes a URL, fetch content via Jina Reader (`r.jina.ai/URL`), inject as context. Remove broken native LLM URL reading.
- [x] **Admin analytics dashboard** — `/admin/analytics` gated by `is_admin` flag. Shows users, conversations, DAU/WAU, model breakdown, latency.
- [x] **System prompt tone overhaul** — Replaced "April Dunford no-BS" persona with senior CMO advisor tone: no filler closers, no emoji, one recommendation not a menu, proportionate structure.
- [x] **Model updates** — Claude Sonnet 4.6 (`claude-sonnet-4-6`) + Gemini 3.1 Pro (`gemini-3.1-pro-preview`). Removed Opus and Gemini 2.5 Thinking. Added `effort: "low"` for Sonnet 4.6 (avoids default high-latency mode).
- [ ] **Intelligent RAG query generation** ← **CURRENT FOCUS**
  - Problem: RAG uses raw user message as query — e.g. "Summarize this article: https://..." is a useless RAG query
  - Fix needed: Read URL content FIRST, extract key concepts/themes, then generate 2-3 targeted queries that will actually surface relevant chunks from the knowledge base
  - Also: duplicate conversation bug (double-submission race condition) needs `isSubmittingRef` guard fix
  - Context: knowledge base is at `~/.gemini/antigravity/knowledge` — need to understand breadth of sources before designing query strategy
  - Test approach: fetch both articles, reason about what knowledge is relevant, try query variants against live RAG, compare chunk quality

---

## Up Next

- [ ] **Output tone & voice refinement** — Final output should sound like a professional PM or senior marketer: clear, warm, relatable, and technically precise. Will provide example outputs to calibrate. Involves system prompt tuning + possibly post-processing guardrails.
- [ ] **Telemetry dashboard** — `/admin/analytics` page: conversations per user, tokens by model, DAU/WAU. Audit whether `usage_logs` is being written on every chat call first.

---

## Onboarding & Marketing

- [ ] **Welcome screen tiles** — 4 clickable use case tiles (Frame / Consult / Validate / Career) with example starter prompts on empty state.
- [ ] **Homepage copy update** — Lead with outcomes, not modes. New section: "Frame it. Get advice. Validate it. Grow." with real example prompts per pillar.
- [ ] **YouTube tutorials** — 4 videos (one per mode) using real past chats as demos. Thumbnails already in Canva.

---

## Backlog

- [ ] Ongoing scrape + ingest pipeline (PMA, Sharebird daily sync, chunk count on UI)
- [ ] API product / MCP server
- [ ] Ungate access / sandbox trial for new users
- [ ] Knowledge expansion (theproductmarketer.com, Robert Kaminski, Anthony Pieri content)
- [ ] Tone & style refinement (system prompt polish)
- [ ] Evals — generic Claude vs PMM Sherpa quality comparison
- [ ] Pricing & monetization (free/paid tiers, token limits)
- [ ] Voice & phone access (ElevenLabs, Deepgram)

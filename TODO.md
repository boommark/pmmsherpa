# PMM Sherpa — To-Do

_Last updated: 2026-03-24_

---

## In Progress

- [x] **Action bar simplification** — Kill Perplexity dropdown + globe toggle. Replace with single Research toggle (Perplexity icon, quick research only). Remove deep research + native web search tools entirely.

---

## Up Next

- [ ] **URL scraping** — When user pastes a URL, fetch content via Jina Reader (`r.jina.ai/URL`), inject as context. Firecrawl as fallback. Remove broken native LLM URL reading.
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

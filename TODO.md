# PMM Sherpa — To-Do

_Last updated: 2026-03-25_

---

## Recently Shipped (Mar 2026)

- [x] **Intelligent RAG query engine** — Gemini 2.5 Flash Lite query planner analyzes full context (message, history, URLs, attachments), generates 2-3 targeted RAG queries across knowledge dimensions, auto-invokes Perplexity when external data needed. Multi-query parallel retrieval with dedup.
- [x] **Voice and writing style overhaul** — System prompt rewrite modeled on Dunford, Stratton, Jassy. Anti-AI-slop rules. Explicit formatting: mandatory headings, bold, section breaks. Example response in prompt. Effort bumped to medium.
- [x] **Welcome screen redesign** — "What are you working on?" + 4 pillar tiles (Frame, Consult, Validate, Grow) with clickable example prompts.
- [x] **Homepage redesign** — Full marketing page with product screenshots, "How It Works" walkthrough, audience cards (PMMs, PMs, Founders), differentiators section.
- [x] **Editorial response layout** — No bubble on assistant messages, DM Sans font, generous spacing (1.85 line height), heading hierarchy.
- [x] **Single-click copy** — Replaced 3-option dropdown with single copy button (HTML + plain text clipboard).
- [x] **UI cleanup** — Removed avatars, model name, Expand with Research, Perplexity toggle, source citations from UI. Citations still tracked in DB.
- [x] **Token budgets** — Context overflow protection for long conversations (12K history, 8K RAG, 8K URL, 4K Perplexity, 6K attachments).
- [x] **Auto-Perplexity** — Flash Lite decides when web research is needed. Toggle removed from UI entirely.

---

## Up Next

- [ ] **YouTube tutorials** — 4 videos (one per pillar: Frame, Consult, Validate, Grow) using real past chats as demos.
- [ ] **Ongoing scrape + ingest pipeline** — PMA, Sharebird daily sync. Auto-update chunk counts.
- [ ] **Evals** — Generic Claude vs PMM Sherpa quality comparison on standard PMM questions.

---

## Backlog

- [ ] API product / MCP server
- [ ] Ungate access / sandbox trial for new users
- [ ] Knowledge expansion (theproductmarketer.com, Robert Kaminski, Anthony Pieri content)
- [ ] Pricing & monetization (free/paid tiers, token limits)
- [ ] Voice & phone access (ElevenLabs, Deepgram)

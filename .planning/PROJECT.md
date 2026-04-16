# PMM Sherpa

## What This Is

AI-powered product marketing advisory tool with RAG knowledge base (38,213 chunks from 34 books, 583 podcasts, 532 AMAs, 827 PMA blogs, 790 thought-leader posts). Production at pmmsherpa.com with 155 approved users across 60 active (Google, Amazon, NVIDIA, Atlassian, IBM, Uber, Boeing, etc.). 277 conversations, 2,141 messages. Next.js 16 + Supabase + Vercel.

## Core Value

Expert GTM advisory grounded in the world's best practitioner knowledge, available the moment you need it.

## Requirements

### Validated

- Auth: Email/password signup with admin approval flow (ban-until-approved)
- Chat: Multi-model streaming chat (Claude Opus/Sonnet, Gemini 3 Pro/2.5 Pro)
- RAG: Hybrid search (70% semantic + 30% keyword) over 38K chunks
- Research: Perplexity quick research mode for live web data
- URL Analysis: Paste a URL, get strategic positioning read
- Voice: Web Speech API for voice input
- History: Conversation history with search
- File Upload: LlamaParse document processing
- Landing Page: Homepage with logo banner, demo video, pricing sections

### Active

- [ ] Free tier usage gating (10 messages/month, founder exempt)
- [ ] Usage counter in chat UI
- [ ] Exhaustion modal with upgrade CTA
- [ ] Pricing page on homepage (Free vs Starter)
- [ ] Stripe checkout for Starter tier ($11.99/mo)
- [ ] Soft warning at 2 messages remaining

### Out of Scope

- MCP server — Phase 2 after gating ships
- MARP template generation — Phase 2
- Credit packs — Phase 3, validate Starter first
- Army/Studio tiers — premature, validate Starter first
- Gamma AI integration — Phase 3

## Context

- 155 approved users, 60 active, 277 conversations since Dec 2025
- Positioning & Messaging is 39% of usage (dominant use case)
- 55% of users never return after first conversation (activation problem)
- 2 power users drive 57% of conversations
- Explosive growth: 28 convos in Dec → 112 in March → 100+ in April
- Content Creation drives deepest engagement (24.2 avg messages)
- Existing `usage_logs` table tracks model, tokens, latency per message
- Stripe API key available, no products created yet

## Constraints

- **Stack**: Next.js 16, Supabase PostgreSQL, Vercel hosting — all changes must fit this stack
- **Workflow**: staging → main deploy pipeline, never push directly to main
- **Founder exempt**: Abhishek Ratna (abhishekratna@gmail.com, abhishekratna1@gmail.com) must bypass all usage limits
- **Existing users**: 155 approved users currently have unlimited access — need grace period communication

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 10 messages/month free tier | Low enough to gate power usage, high enough to experience value (5 real advisory sessions) | — Pending |
| Calendar month reset (1st of each month) | Simpler than rolling 30-day window for users and implementation | — Pending |
| $11.99/mo Starter tier | Below Claude Pro ($20) and Jasper ($69), captures price-sensitive users who want web UI with modest usage | — Pending |
| Stripe for billing | Standard, well-documented, existing API key available | — Pending |

## Current Milestone: v1.1 Free Tier Usage Gating & Pricing

**Goal:** Implement message-based usage limits, in-product upgrade flow, pricing page, and Stripe checkout for Starter tier.

**Target features:**
- Free tier: 10 messages/month per user (founder exempt)
- Usage counter in chat UI showing remaining messages
- Exhaustion modal with upgrade CTA when credits hit zero
- Soft warning banner at 2 messages remaining
- Pricing page on homepage
- Stripe checkout for Starter tier ($11.99/mo)

---
*Last updated: 2026-04-15 after milestone v1.1 initialization*

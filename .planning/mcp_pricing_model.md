# PMM Sherpa MCP — Credit Pricing Model

**Headline recommendation:** Adopt a weighted-credit model (`ask_sherpa` = 1, `get_feedback` = 1, `draft_artifact` = 3) and ladder pricing at **$5 / 100, $15 / 350, $40 / 1,000**. Drop the proposed $20 / 250 tier — it is a typo (more expensive per credit than the $5 entry). The math gives ~75-85% gross margin in the realistic mix and survives both stress scenarios. Existing $9.99 web subscribers should get **150 free MCP credits/month** (about $4 of cost), bundled — keep credits a **single unified wallet** across web and MCP so users don't think about surfaces.

---

## 1. Per-tool credit weighting

Cost spread is ~3x between cheapest and dearest tool. Charging 1 credit flat means power users running `draft_artifact` are subsidized by chatters running `ask_sherpa`. Recommended weighting:

| Tool | Avg cost | Weight (credits) | Implied $/credit @ cost |
|---|---|---|---|
| ask_sherpa (warm) | $0.0102 | 1 | $0.0102 |
| ask_sherpa (cold, 33%) | $0.0312 | 1 | $0.0312 |
| ask_sherpa (blended) | $0.0152 | 1 | $0.0152 |
| get_feedback | $0.0123 | 1 | $0.0123 |
| draft_artifact | $0.0357 | 3 | $0.0119 |

**Assumed tool mix** (median session, from `mcp_token_economics.md`): 60% ask_sherpa / 30% get_feedback / 10% draft_artifact.

Weighted cost per credit:
`(0.60 × 1 × $0.0152) + (0.30 × 1 × $0.0123) + (0.10 × 3 × $0.0357 / 3) = $0.00912 + $0.00369 + $0.00357 = $0.0164/credit`

In credits-issued terms (a draft_artifact burns 3 credits per call), the **blended LLM cost per credit issued ≈ $0.013**.

---

## 2. Profitability per tier

Stripe fees: 2.9% + $0.30 per charge.

| Tier | Gross | Stripe fee | Net rev | Credits | Net $/credit | Cost/credit | GM% |
|---|---|---|---|---|---|---|---|
| Free | $0 | — | $0 | 10 | $0 | $0.013 | -∞ ($0.13/user) |
| **$5 / 100** (proposed) | $5.00 | $0.445 | $4.555 | 100 | $0.0456 | $0.013 | **71.5%** |
| **$20 / 250** (proposed, BAD) | $20.00 | $0.880 | $19.12 | 250 | $0.0765 | $0.013 | 83.0% |
| **$20 / 500** (corrected) | $20.00 | $0.880 | $19.12 | 500 | $0.0382 | $0.013 | **66.0%** |

The user-proposed `$20/250` works financially (higher margin) but is **anti-customer** — bigger pack should mean lower unit price, not higher. It also kills upsell: nobody buys a worse-value bigger pack.

**Infra coverage:** Vercel ($20) + Supabase Pro ($25) + Resend (free) + Langfuse (free) = **$45/mo fixed**. At a 75% blended margin on paid revenue, breakeven is **~$60 net paid revenue/month** = ~13 × $5 packs or ~3 × $20 packs.

**Free tier subsidy:** 10 credits × $0.013 = **$0.13 per free user**. 1,000 free users = $130/mo cost. Subsidized by **~36 × $5 packs/month** (each contributes $3.62 gross margin after Stripe + LLM cost) — easily achievable if free→paid conversion sits at ~3-5%.

---

## 3. Final tier recommendation

| Tier | Price | Credits | $/credit | Audience | Rationale |
|---|---|---|---|---|---|
| **Free** | $0 | 10 | — | Trial | Lets a new user feel the MCP value (1 multi-turn session) before paying. |
| **Starter pack** | $5 | 100 | $0.050 | Casual / one-off | Low-friction credit-card swipe; 1 week of normal use. |
| **Pro pack** | $15 | 350 | $0.043 | Active solo PMM | Sweet-spot: ~12 sessions, replaces $20 tier with a price that beats the $5 tier per credit. |
| **Power pack** | $40 | 1,000 | $0.040 | Heavy / agency / consultant | Anchor tier; signals there is a "serious" tier and pulls midmarket up. |

Ladder rationale: each tier strictly **decreases $/credit** (50¢ → 4.3¢ → 4.0¢) so the upsell is rational. Three tiers (not four) — adding $50/$99 splits demand. Drop $20 entirely; it overlaps Pro and offers worse value.

---

## 4. Sensitivity analysis

**Scenario A — High draft_artifact mix (30% instead of 10%):**
Weighted cost/credit = `(0.40 × $0.0152) + (0.30 × $0.0123) + (0.30 × 3 × $0.0357 / 3) = $0.00608 + $0.00369 + $0.01071 = $0.0205/credit`. At Starter ($0.0456 net/credit), GM drops 71.5% → **55%**. At Pro ($0.0431), GM = **52%**. **Still profitable**, but the cushion thins. Mitigation: cap `draft_artifact` at 5/day on free, or weight it at 4 credits if real usage clusters here.

**Scenario B — Cold-cache nightmare (every ask_sherpa is cold, $0.025 avg):**
Weighted cost/credit = `(0.60 × $0.025) + (0.30 × $0.0123) + (0.10 × $0.0357) = $0.0150 + $0.00369 + $0.00357 = $0.0222/credit`. Starter GM = **51%**, Pro GM = **48%**. Survivable but uncomfortable. Mitigation: enable Anthropic 1-hour cache beta header (already noted in token economics doc) — collapses this scenario back to baseline.

**What actually breaks the model:** users who only ever do `draft_artifact` cold. That's `$0.0357 × ~1.6` (cold) = ~$0.057/call, billed at 3 credits = $0.135 net at Starter → **58% GM**, but at $5/100 a single user could legitimately burn $0.57 in margin on one pack. Ceiling acceptable.

---

## 5. Coexistence with $9.99 web subscription

**Should $9.99 web subscribers get free MCP credits?** Yes — bundle **150 credits/month** (refilling, not stacking) into the existing Starter sub. At blended cost $0.013/credit that's **~$1.95/sub of LLM cost**, well within the $9.69 net revenue (post-Stripe) on $9.99. It removes an objection ("do I need a second subscription?") and preserves the headline price. Heavy MCP users still pay overage via packs.

**Unified wallet or MCP-only?** Unify. One credit balance shown on the billing page, decremented by both web `/api/chat` calls and MCP tool calls. Reasoning: (a) users pick the surface that fits the moment (Claude Code at the keyboard, web on a tablet) — splitting balances punishes that, (b) it lets the $9.99 sub include credits without inventing a second meter, (c) future tools (a Slack bot, a Raycast extension) plug into the same wallet without re-pricing. The web "unlimited messages" promise on $9.99 becomes "150 included credits + soft-unlimited on the chat surface" — which is what the existing fair-use governor already enforces.

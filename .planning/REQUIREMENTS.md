# Requirements: PMM Sherpa v1.1

**Defined:** 2026-04-15
**Core Value:** Expert GTM advisory grounded in the world's best practitioner knowledge, available the moment you need it.

## v1.1 Requirements

### Usage Gating

- [ ] **GATE-01**: System tracks messages per user per calendar month
- [ ] **GATE-02**: Free tier users are limited to 10 messages per month
- [ ] **GATE-03**: Founder accounts (abhishekratna@gmail.com, abhishekratna1@gmail.com) bypass all limits
- [ ] **GATE-04**: Message counter resets on the 1st of each calendar month
- [ ] **GATE-05**: System blocks message submission when monthly limit is reached

### Usage UI

- [ ] **UI-01**: User sees remaining message count in chat input area
- [ ] **UI-02**: User sees a soft warning banner when 2 or fewer messages remain
- [ ] **UI-03**: User sees an exhaustion modal when limit is reached, with upgrade CTA
- [ ] **UI-04**: Exhaustion modal links to pricing page

### Pricing Page

- [ ] **PRICE-01**: Homepage includes a pricing section (Free vs Starter comparison)
- [ ] **PRICE-02**: Pricing page shows feature comparison between tiers
- [ ] **PRICE-03**: Pricing page has a CTA that initiates Stripe checkout

### Billing

- [ ] **BILL-01**: Starter tier ($11.99/mo) is created as a Stripe product
- [ ] **BILL-02**: User can complete Stripe checkout from the pricing page
- [ ] **BILL-03**: Successful payment upgrades user tier in the database
- [ ] **BILL-04**: Starter tier users get higher message limits (unlimited or 500/mo)
- [ ] **BILL-05**: User can manage subscription (cancel/update) from settings

## v2 Requirements

### MCP Server

- **MCP-01**: Remote MCP server with Streamable HTTP transport
- **MCP-02**: OAuth 2.1 + PKCE authentication via Supabase
- **MCP-03**: Core tools: query_sherpa, search_corpus, validate_artifact
- **MCP-04**: Credit-based billing via Stripe Meters

### Visual Deliverables

- **VIS-01**: MARP-based deck generation (PDF/PPTX)
- **VIS-02**: Gamma AI premium deck generation
- **VIS-03**: Template catalog (positioning deck, battlecard, one-pager, launch plan)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Credit packs (PAYG) | Validate Starter tier converts first |
| Army/Studio/Explorer tiers | Premature — ship Starter, measure, then expand |
| MCP server | Phase 2 after gating validates |
| Gamma AI integration | Phase 3 |
| Existing user email notification | Manual send, not automated in-product |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GATE-01 | Phase 1 | Pending |
| GATE-02 | Phase 1 | Pending |
| GATE-03 | Phase 1 | Pending |
| GATE-04 | Phase 1 | Pending |
| GATE-05 | Phase 1 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |
| UI-04 | Phase 2 | Pending |
| PRICE-01 | Phase 3 | Pending |
| PRICE-02 | Phase 3 | Pending |
| PRICE-03 | Phase 3 | Pending |
| BILL-01 | Phase 4 | Pending |
| BILL-02 | Phase 4 | Pending |
| BILL-03 | Phase 4 | Pending |
| BILL-04 | Phase 4 | Pending |
| BILL-05 | Phase 4 | Pending |

**Coverage:**
- v1.1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 after initial definition*

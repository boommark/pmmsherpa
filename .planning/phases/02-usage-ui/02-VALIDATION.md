---
phase: 2
slug: usage-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test runner configured (confirmed in research) |
| **Config file** | none |
| **Quick run command** | `npm run build` (type-check + build) |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | UI-01, UI-04 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-01-02 | 01 | 1 | UI-02 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-01-03 | 01 | 1 | UI-03, UI-04 | build + manual | `npm run build` | N/A | ⬜ pending |
| 02-01-04 | 01 | 1 | UI-01 | build + manual | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework to install — project uses manual staging verification via `npm run build` + deploy to staging.pmmsherpa.com.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Counter displays "X of 10 messages remaining" below input | UI-01 | Visual UI component — no test runner | Load chat page, verify counter text appears below textarea |
| Warning banner at ≤3 remaining | UI-02 | Visual + state-dependent | Send messages until 3 remain, verify amber banner appears above input |
| Exhaustion modal on 429 | UI-03 | Requires real API 429 response | Send messages until 0, attempt send, verify modal appears with copy and CTA |
| Modal CTA links to /pricing | UI-04 | Navigation check | Click "Upgrade to Starter" in modal, verify navigation to /pricing |
| Counter updates after each send | UI-01 | Real-time state update | Send a message, verify counter decrements without page refresh |
| Founders see "Unlimited messages" | UI-01 | Tier-dependent display | Log in as founder account, verify "Unlimited messages" text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
marp: true
theme: sherpa
paginate: true
footer: 'Confidential — Internal Use Only'
---

<!-- _class: title -->

# Deal Intelligence Copilot
## INTERNAL LAUNCH BRIEF

<br>

**Launch date:** May 14, 2026
**Launch tier:** Ripple — targeted GTM with staged rollout
**Owner:** Priya Nair, PMM · Eng lead: Marcus Chen
**Status:** GA-ready · Staging verified ✓

<br>

`AI FEATURE` `REVOPS` `GA LAUNCH` `MAY 2026`

---

## The Problem

What's broken today for our customers — and why it's costing them.

**Pain 1 — Reps enter deals blind**
Before a call, the average AE spends 22 minutes cobbling together account context from Salesforce, LinkedIn, their call recording tool, and a Slack thread from 3 months ago. Half of what they find is stale. The other half is in a system they don't open.

> *"By the time I've pieced together the account history, I've already lost the first 5 minutes of the call."* — AE, Lattice (customer interview, March 2026)

**Pain 2 — Deal risk surfaces too late**
RevOps teams learn a deal is at risk on average 19 days after the first warning signals appear in call data. By then, stage regression is almost inevitable. Managers are reacting, not coaching.

**Pain 3 — Coaching is manual and backward-looking**
Sales managers spend 3–4 hours per week reviewing call recordings manually to prepare for 1:1s. They catch patterns in the aggregate but miss in-the-moment coaching opportunities. Top performers go unrecognized; struggling reps go uncoached for weeks.

---

## Market Context

Why this is the right product, at the right moment.

**Signal 1 — AI copilot adoption crossed the churn threshold**
In Q1 2026, AI-assisted tools in the sales stack crossed 60% adoption among enterprise buyers (Gartner Sales Technology Survey, March 2026). Buyers are no longer asking "do we need AI?" — they're asking "which AI is actually built into my workflow?" This is the moment to own that answer in our category.

**Signal 2 — The point-tool consolidation wave is accelerating**
Average enterprise GTM stack has shrunk from 14.2 tools to 11.6 tools YoY (G2 2026 State of Software). Buyers are cutting the tools that don't have native AI and don't write back to their CRM. Our competitors without native AI copilot capabilities are already losing renewals. We have a 6–9 month window to establish this as a core differentiator before the field catches up.

**Signal 3 — Our own churn data says "insight gaps" kill retention**
In 12 of our last 18 churned accounts, exit interviews cited "we weren't getting actionable insights from the data" as a primary reason. Deal Intelligence Copilot directly addresses this. This is as much a retention play as it is a growth feature.

---

## What We Built

**Deal Intelligence Copilot** gives every rep and manager in your org a real-time AI layer on top of your conversation data — without adding another tool or login.

**One headline:** An AI that surfaces the right deal context, at the right moment, directly in the rep's workflow — before the call, during the call, and in the CRM after it.

**Three capabilities:**

- **Pre-Call Brief (2 min, auto-generated)** — Before every meeting, reps get a structured briefing: last conversation summary, open commitments, stakeholder risk score, and 3 recommended questions based on deal stage and buyer signals. Delivered via Slack or email, 30 minutes before meeting start.

- **Live Deal Risk Scoring** — Real-time model scores each active opportunity on 7 risk dimensions (champion engagement, multi-threading, next-step clarity, competitor mention frequency, sentiment trend, decision-maker access, timeline pressure). Flags surface in Salesforce before the deal slips.

- **Manager Coaching Feed** — A curated daily digest for frontline managers: top 3 calls worth reviewing, one positive coaching moment and one coachable gap per rep, week-over-week team trend. Replaces manual call review with structured signal.

---

<!-- _class: compare -->

## Who It's For

**Primary ICP — VP of Sales / CRO (the economic buyer)**

Role: VP Sales, Sr. Director of Sales, or CRO
Company type: B2B SaaS, 100–1,000 employees, Series B to late-stage
Key use case: Wants predictable pipeline and a coaching infrastructure that doesn't require 4 hours/week of manual call review. Will champion this to their RevOps lead. Decision made at the business level — not technical.

Positioning message: *"Your team already records every call. Deal Intelligence Copilot turns that archive into a real-time coaching and forecasting engine — no new workflow required."*

<br>

**Secondary audience — RevOps / Sales Operations (the champion)**

Role: VP RevOps, Sr. Manager Sales Ops, Salesforce Admin
Company type: Same profile, but this persona runs the technical evaluation
Key use case: Wants Salesforce-native risk signals without a custom integration project. Will run the POC, own the rollout, and become the internal advocate. They care about data accuracy, latency, and CRM write-back reliability.

Positioning message: *"Native Salesforce integration. No custom API work. Risk scores appear in your existing deal views within 48 hours of activation."*

---

## Positioning & Messaging

**Positioning statement (Geoffrey Moore format):**

For revenue teams who struggle to act on the deal intelligence buried in their call data, Deal Intelligence Copilot is an AI-native layer built into their existing conversation platform that surfaces risk, coaching signals, and pre-call context at the moment each person actually needs it — unlike generic AI writing tools or manual call review workflows, which require reps and managers to do the analysis themselves.

<br>

**Three value propositions (prioritized for this launch):**

1. **Speed to signal** — Surface deal risk 19 days earlier than manual review allows. Give managers a daily coaching feed instead of a call recording library.
2. **Zero new workflow** — Works inside Salesforce, Slack, and the tools reps already open. Not another dashboard nobody logs into.
3. **Org-wide consistency** — Every rep gets the same quality of pre-call prep that your top performers build manually. Compress ramp time, lift the floor.

**Tagline options (test in launch email and paid):**

- *"Every deal, coached."*
- *"Your best rep's prep. For every rep."*
- *"Don't review the call. Prevent the slip."*

---

## GTM Motion

**Launch tier: Ripple** — Targeted activation with existing customers first, new logo in wave 2.

| Phase | Dates | Channels | Owner |
|---|---|---|---|
| **Week 0 — Internal enablement** | May 7–13 | Sales kickoff session, Slack #gtm, battle card drop | Priya Nair |
| **Week 1 — Customer early access** | May 14–20 | Email to 40 high-NPS accounts, CSM-led activation calls | CS + PMM |
| **Week 2 — Existing base rollout** | May 21–27 | In-app announcement, product email, webinar (May 22) | Growth + PMM |
| **Week 3 — New logo GTM** | May 28–Jun 6 | Paid LinkedIn, updated homepage hero, AE outbound sequence | Marketing + Sales |
| **Ongoing — Content amplification** | Jun 7+ | Case study (Lattice), G2 review campaign, podcast placement | PMM |

**Key dates to protect:**
- **May 13** — Enablement assets locked (battle card, demo script, FAQ doc)
- **May 14** — GA live in production, early access email sends at 9am PT
- **May 22** — Customer webinar "Deal Intelligence: From Data to Action" (target: 150 attendees)
- **Jun 15** — First case study published (Lattice, pending legal approval)

---

## Competitive Angle

How Deal Intelligence Copilot changes our competitive win/loss story.

**Updated positioning vs. Gong:**
Gong has AI summaries — we have AI deal intelligence. The difference: Gong's AI tells you what happened on the call. Ours tells you what to do about the deal. Lead with: *"Gong gives you a transcript. We give you a risk score and a next action."* New win scenario: any Gong account where the CRO is complaining about forecast accuracy — this is now our sharpest entry point.

**Updated positioning vs. Clari / Bowtie:**
Clari is a forecasting tool bolted onto call data. We're a conversation intelligence platform with native forecasting intelligence. The difference is where the source of truth lives. Our risk scoring pulls from actual conversation signals — not just Salesforce field updates that reps may not have touched. Win scenario: any account where reps don't update Salesforce hygienically (almost all of them).

**New objection we now handle:**
*"We're evaluating AI sales tools — we've seen Gong's AI, Salesloft AI, HubSpot's Breeze."* Response: None of those tools own the conversation layer. Their AI is summarizing data they don't have. We recorded the call. Our AI has the actual signal.

---

## Sales Enablement

What the field needs to win with this feature — starting week one.

**Talk track summary (60-second version for cold outreach or follow-up):**

Your team records every sales call. But right now, those recordings are a library nobody has time to read. Deal Intelligence Copilot turns your call archive into a live coaching and forecasting engine. Reps get a 2-minute brief before every call — no prep time required. Managers get a daily digest of the 3 calls worth reviewing and one coaching moment per rep. And RevOps gets risk scores in Salesforce 19 days earlier than your current process allows. It's live in your existing platform. No new tool, no new login, no integration project.

**New objection handler:**

*"We already have [Gong/Chorus/CallRail] for call recording. We don't need another tool."*

"You're not adding a tool — you're activating the layer that was always missing from the one you have. Deal Intelligence Copilot plugs directly into your existing conversation platform. We're not replacing your call recording; we're making it actionable. The question isn't whether you need another tool — it's whether your current tool is telling you which deals are at risk before it's too late."

**Updated discovery question to add to your playbook:**

*"When your manager reviews your deals in a 1:1, are they pulling from real-time call data or from what you've updated in Salesforce?"* — This surfaces the signal gap and sets up the copilot value prop naturally.

---

## Launch Metrics

How we'll know this launch worked. Review at 30, 60, and 90 days.

| KPI | Target | Measurement Method | Owner |
|---|---|---|---|
| **Feature activation rate (existing base)** | 35% of eligible accounts activate within 30 days | Product analytics (PostHog event: `copilot_activated`) | Growth |
| **Pre-call brief open rate** | ≥ 55% open rate on Slack/email delivery | Resend + Slack delivery analytics | Eng / PMM |
| **Deal risk score adoption (Salesforce)** | ≥ 60% of active opportunities have a risk score attached by day 30 | Supabase usage logs + Salesforce field audit | RevOps / CS |
| **NPS lift (feature-specific)** | +12 points vs. pre-launch baseline among activated users | In-app survey (Typeform, 14-day post-activation) | CS |
| **New logo influenced pipeline** | $800K influenced pipeline in 60 days (deals where copilot demo was delivered) | Salesforce opportunity tagging — field: `copilot_demo_delivered` | Sales + PMM |

**Reporting cadence:** Weekly GTM sync every Tuesday 9am PT. PMM publishes launch health scorecard every Friday in #gtm-launch Slack channel.

---

<!-- _class: accent -->

## Next Steps & Launch Readiness

**Key decisions needed before May 14:**

- **Pricing model** — Is Copilot included in all tiers or Starter+ only? Decision needed by May 9 (affects in-app messaging and launch email segmentation). *Owner: Abhishek / Product.*
- **Webinar co-presenter** — Do we bring a customer (Lattice) or run solo? Lattice CSM contact needs to confirm by May 8. *Owner: CS lead.*
- **Paid budget approval** — $15K LinkedIn campaign (May 28–Jun 14). Finance sign-off needed. *Owner: Marketing Ops.*

**Open questions:**
- Does the Salesforce package support Salesforce Government Cloud? (3 prospects have asked.)
- What's the data retention policy for AI-generated briefs? Legal needs to confirm.
- International availability: EU data residency confirmed for GDPR? Eng to confirm by May 12.

**Launch readiness checklist:**

- [ ] Battle card finalized and in Highspot
- [ ] Demo environment seeded with realistic deal data
- [ ] In-app tooltip copy approved by legal
- [ ] Early access email reviewed and scheduled in Resend
- [ ] Webinar registration page live and tested
- [ ] Rollback plan documented (feature flag: `copilot_ga_enabled`)

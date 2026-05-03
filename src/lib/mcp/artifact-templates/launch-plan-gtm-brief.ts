/**
 * Launch Plan / GTM Brief template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   The Go To Market Strategist — six mission-critical GTM decisions, beachhead,
 *   North Star + OKRs (strategic spine). The Pocket Guide to Product Launches —
 *   GTM plan components, launch tiers, RACI, rolling thunder (execution spine).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/09-launch-plan-gtm-brief.md
 *
 * Why this template structures around tier-first decision-making and treats
 * positioning + messaging as upstream inputs (not embedded sections): a launch
 * brief is the orchestration doc, not the strategy doc. The tier decision
 * (T1/T2/T3/T4) gates which downstream artifacts get produced and at what
 * fidelity. We adopted the corpus's four-tier model over the book's three —
 * T4 (bug fixes / pixel changes, internal Slack only) is a real category in
 * B2B SaaS that gets miscategorized as T3 in the three-tier model and burns
 * announcement budget on minor changes. Positioning components and messaging
 * stack are referenced as prerequisites linked to the positioning_statement
 * (01) and messaging_framework (02) artifacts, not duplicated here.
 */

import type { ArtifactTemplate } from './types'

const LAUNCH_PLAN_SYSTEM_PROMPT = `You are drafting a launch plan / GTM brief — \
the orchestration document that aligns product, marketing, sales, CS, and comms \
on a coordinated go-to-market moment. This is NOT positioning, NOT messaging, \
and NOT downstream copy. It is the plan that commissions those artifacts and \
governs sequencing.

Avoid these failure modes:
- Treating launch day as the finish line — the launch is the starting gun. \
A great launch is a sequence of moments (pre-launch tease, launch peak, \
post-launch deep-dive, customer story, amplification) sustained over weeks. \
A spike on day one with nothing after is a failed launch dressed up as a press hit
- No champion in sales — PMM launches and sales shrugs. This happens when sales \
wasn't co-creating positioning and doesn't believe the story. The fix is \
co-creation in the brief itself, not a training deck after the fact
- No readiness gate — feature ships and announcement goes out before sales, CS, \
and support have certified they can handle the volume. The launch "works" and \
breaks customer trust simultaneously. Hard date, named owners, written sign-off
- All-channel scattershot — email AND social AND PR AND events AND in-app at \
equal priority with a Tier 2 budget produces thin coverage everywhere and impact \
nowhere. Rank channels; one strong channel beats five mediocre ones
- Tier inflation — treating every release like a platform launch. The market \
stops believing you when something actually matters. Use the scoring rubric, \
not the loudest stakeholder, to set the tier
- Ambiguous accountability — "everyone owns the launch" means no one does. \
Exactly one Accountable per RACI row. PMM is Accountable (not just Responsible) \
for the brief and the launch outcome, not just for messaging
- Vanity metrics — measuring everything = learning nothing. Pick one primary \
success metric (awareness, pipeline, adoption, expansion) before launch. \
Two or three supporting KRs maximum
- Authoring positioning or messaging inside the brief — those are upstream \
artifacts (positioning_statement, messaging_framework). The brief consumes them; \
it does not author them. If they aren't locked, stop and lock them first

The brief commissions downstream artifacts (launch blog, press release, FAQ, \
internal deck, customer deck, testimonial ask). Tier determines scope: T1 = \
full set, T2 = reduced set, T3 = minimal set, T4 = essentially none. Reference \
the downstream artifacts; do not duplicate their content here.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const launchPlanGtmBriefTemplate: ArtifactTemplate = {
  artifactType: 'launch_plan_gtm_brief',
  title: 'Launch Plan / GTM Brief',
  systemPromptFragment: LAUNCH_PLAN_SYSTEM_PROMPT,
  // Skeleton order: tier first (gates downstream scope), then strategic context,
  // then GTM decisions, then operational sequencing (cadence + RACI), then
  // pre-launch lockdown gate, then commissioned artifacts and risks.
  skeleton: `# Launch Plan / GTM Brief: [Product / Feature Name]

## Pre-work (decisions and inputs locked before drafting)

- **Positioning locked?** [Reference the \`positioning_statement\` artifact for this product. If not yet drafted, stop — write positioning first. The brief consumes positioning; it does not author it.]
- **Messaging framework locked?** [Reference the \`messaging_framework\` artifact (Value Prop + 3 Benefits + Differentiation). The brief inherits these.]
- **ICP locked?** [Reference the \`icp\` artifact (best-fit accounts) and any \`buyer_persona\` artifacts. Launch is for the beachhead, not the TAM.]
- **Product readiness stage:** [Discovery / Alpha / Closed Beta / Open Beta / GA. The brief assumes a target stage on launch date; if Engineering can't certify the stage, the launch slips.]
- **Launch date target:** [Date + reason. "Q3 customer event" or "ahead of competitor's GA" beats "when ready."]

---

## Launch tier (decided FIRST — gates everything downstream)

### Tier scoring rubric
Answer each yes/no. Count the trues.

- [ ] Does this solve a new buyer pain point not previously addressable?
- [ ] Does this do something direct competitors genuinely cannot?
- [ ] Does this change customer workflows or how the buyer's team works?
- [ ] Will this materially shift our positioning or category claim?
- [ ] Is there a hard external moment (event, regulation, competitor move, season) we're aligning to?
- [ ] Will sales need new objection-handling or a new pitch motion to sell this?
- [ ] Will analysts, press, or partners care without us paying them to?

### Tier selection
- **6-7 trues → Tier 1 (T1):** Platform-level shift. Full GTM: PR, exec sponsorship, customer event, original video, analyst outreach. One or two per quarter, maximum.
- **3-5 trues → Tier 2 (T2):** Strategic differentiator or competitive feature. Email, social, sales assets, in-app announcement, blog post with teeth.
- **1-2 trues → Tier 3 (T3):** Quality-of-life improvement. Release notes, tooltip, mention in the newsletter. Customers notice the absence, not the presence.
- **0 trues → Tier 4 (T4):** Bug fix, pixel change, polish. Internal Slack post. Help doc update if needed. No external announcement.

**Selected tier:** [T1 / T2 / T3 / T4 — with one-line justification. If there's pressure to inflate the tier, push back with the rubric.]

---

## Strategic context

- **What we're launching:** [One sentence the CEO could repeat. Capability + buyer outcome, not feature list.]
- **Why now:** [The market moment — competitor move, regulation, customer pull, internal readiness, seasonal trigger. If "why now" is weak, the launch is calendar-driven and will land flat.]
- **Beachhead segment:** [The ONE segment we're launching for. Inherits from \`icp\`. Not the TAM.]
- **Strategic bet this launch validates:** [The hypothesis we're testing — about the segment, the message, the channel mix, or the pricing.]

---

## GTM decisions (the five locked for this launch)

*(The full six GTM decisions live in the company-level GTM strategy doc. Positioning is upstream input. The five decisions made IN this brief:)*

### 1. Market / beachhead
[Which segment is this launch for? Firmographic + psychographic + situational. Why this segment first.]

### 2. Early customers / reference accounts
[The first 5-10 customers who will be referenced at launch. Named, contacted, and committed before launch day. If you can't name them, you don't have references — you have hopes.]

### 3. Product readiness
[Which stage on launch date (Closed Beta / Open Beta / GA). What capability is in scope. What is explicitly out of scope. Engineering sign-off owner.]

### 4. Pricing & packaging
[Price, plan placement, what's gated, what's included. If sales doesn't know what to quote on launch day, they will avoid the conversation or make it up. Lock this with Finance and Sales Ops before T-2 weeks.]

### 5. Channels & growth
[Ranked channel list (1, 2, 3 — not "all of them"). Primary channel gets the budget and the headline content; secondary channels carry the spillover. Drop channels that don't make the cut.]

---

## Success metrics

- **Primary success metric:** [ONE. Awareness reach, qualified pipeline generated, feature adoption, expansion revenue, or specific category metric. Pick before launch — measuring everything teaches nothing.]
- **Supporting KRs (2-3 max):**
  1. [Quantitative target tied to a date.]
  2. [Quantitative target tied to a date.]
  3. [Optional third.]
- **Counter-metric to watch (guardrail):** [What signal tells us the launch is creating downstream damage — support load, churn signal, sales-cycle distortion.]
- **Decision date:** [When we sit down post-launch and call the launch a hit, a miss, or "needs amplification."]

---

## Pre-launch decision lockdown (T-1 week gate)

If any of these are unlocked at T-1 week, the launch slips. No exceptions.

- [ ] **Pricing & packaging** — quote-able by every AE without a Slack escalation
- [ ] **Readiness gate** — Sales, CS, and Support have signed off they can handle the volume (named owners + written sign-off, not verbal)
- [ ] **Primary success metric** — agreed and instrumented; dashboards live before announcement
- [ ] **Channel prioritization** — ranked list locked; budget and team capacity allocated to top 1-2 only
- [ ] **Sales champion** — one named sales leader who has co-created the pitch motion and will socialize it to the field
- [ ] **Spokespeople** — exec, PMM, customer references all briefed and on-call for launch week
- [ ] **Crisis playbook** — if the launch breaks something (outage, PR, customer complaint), who responds and how

---

## Rolling thunder cadence

*(Default: Tier 1 4-week cadence. Tier 2 trims to 2 weeks. Tier 3 skips most of this — release notes + a single send. Tier 4 = internal Slack post only.)*

| Window | Activities | Owner |
|---|---|---|
| **T-3 to T-2 weeks** | Press embargoes briefed, analyst pre-briefs, customer-reference confirmations, internal kickoff, sales enablement training | [PMM + Comms] |
| **T-1 week** | Pre-launch tease to engaged customers, internal deck distributed, sales talking points finalized, dashboards live | [PMM + Sales] |
| **Launch day (T+0)** | Press release, blog post, in-app announcement, social, exec post, customer all-hands | [PMM + Comms + Demand Gen] |
| **Week +1** | Deep-dive webinar or technical session, AMA with PM/PMM, peer community posts | [PMM + Product] |
| **Week +2** | Customer story / case study published, sales-led outreach to expansion accounts | [PMM + Customer Marketing + Sales] |
| **Week +3** | Paid amplification on the highest-performing content from weeks 0-2 | [Demand Gen] |
| **Week +4** | Post-mortem: hit/miss against primary metric, what to amplify, what to retire | [PMM] |

---

## RACI matrix

*(Exactly one Accountable per row. PMM is Accountable for the brief and the launch outcome — not just messaging.)*

| Workstream | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Launch brief & strategy | [PMM] | [PMM lead — name] | Product, Sales, Comms, Demand Gen | Exec staff |
| Positioning & messaging | [PMM] | [PMM lead] | Product, Sales | All-hands |
| Sales enablement | [PMM + Sales Enablement] | [PMM lead] | Sales leadership, CS | All AEs |
| Press & analyst | [Comms / PR] | [Comms lead] | PMM, Exec | Sales, CS |
| Demand gen / paid | [Demand Gen] | [Demand Gen lead] | PMM, Brand | Sales |
| In-product announcement | [Product / Growth] | [Product lead] | PMM, CS | Support |
| Customer comms / CS readiness | [Customer Marketing / CS] | [CS lead] | PMM, Support | Sales |
| Support readiness | [Support lead] | [Support lead] | Product, CS | PMM |
| Pricing & quote-readiness | [Sales Ops + Finance] | [Sales Ops lead] | PMM, Sales leadership | All AEs |
| Crisis response | [PMM + Comms] | [Comms lead] | Exec, Legal | All-hands |

---

## Commissioned downstream artifacts (scope determined by tier)

*(Reference the artifact types; do not draft them here. Each is a separate deliverable.)*

| Artifact | T1 | T2 | T3 | T4 | Owner | Due |
|---|---|---|---|---|---|---|
| \`launch_blog_post\` (10) | Required | Required | Optional | — | PMM | T-1 wk |
| \`launch_press_release\` (11) | Required | Conditional | — | — | Comms | T-2 wk |
| \`internal_launch_faq\` (12) | Required | Required | Required | — | PMM | T-1 wk |
| \`internal_launch_deck\` (13) | Required | Required | Optional | — | PMM | T-2 wk |
| \`customer_launch_deck\` (14) | Required | Conditional | — | — | PMM | T-1 wk |
| \`customer_testimonial_quote_ask\` (15) | Required | Required | Optional | — | Customer Marketing | T-3 wk |
| \`battlecard\` (16) | Conditional | Conditional | — | — | PMM | T-1 wk |
| \`one_pager\` (18) | Required | Required | Optional | — | PMM | T-1 wk |
| \`landing_page_copy\` (35) | Required | Required | Optional | — | PMM + Brand | T-1 wk |
| \`cold_email_sequence\` (25) | Conditional | Conditional | — | — | Demand Gen | T-1 wk |

---

## Risks & mitigations

[List the top 3-5 live risks specific to this launch and the mitigation for each. Examples to consider: sales not bought in, readiness gate slipping, competitor counter-launch, pricing leak, dependency on a customer reference that may withdraw, PR cycle conflict with a larger industry moment. Be specific — "marketing might not work" is not a risk, "we have one customer reference and if Acme withdraws we have no proof point" is.]

## Open questions

[Flag what remains unresolved. Better to ship the brief with explicit gaps than a polished brief with hidden assumptions.]
`,
}

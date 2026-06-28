/**
 * Partner-Facing Launch FAQ template for the generate_artifact MCP tool.
 *
 * Canonical source (read first per .planning/mcp-phase-2/methodology.md):
 *   VandeHei / Allen / Schwartz — Smart Brevity (TEASE → LEDE → optional
 *   GO DEEPER as the per-Q+A craft discipline; Audience First; Fog of
 *   Words; Short, Not Shallow). Corpus amplification: PMA podcast + PMA
 *   blogs (Janani Nagarajan on routes-to-market) — synthesizing a 5-block
 *   partner-FAQ structure.
 *   Sibling references: artifact 12 (internal-launch-faq.ts) for craft
 *   discipline; artifact 28 (co-sell-battlecard.ts) for partner-economics
 *   structure.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/30-partner-facing-launch-faq.md
 *
 * Why this template diverges from artifact 12 (internal launch FAQ):
 * the reader is an employee of a *different company* selling our product
 * alongside their own portfolio. Three structural inversions follow:
 * (1) WIIFM — margin, SPIFFs, attribution — leads, not "what is it,"
 * because partner reps allocate selling time before they care about
 * product detail; (2) channel conflict and deal registration are required
 * dedicated blocks (the corpus's strongest insistence — "this is where
 * trust lives or dies"); (3) vendor-internal commercial sensitivities are
 * removed (discount authority, internal sales comp, direct competitor
 * naming) because the partner rep may also carry a competitor in another
 * segment, and pricing exceptions are not theirs to know. Known issues
 * are kept but recalibrated to language safe in front of the partner's
 * customer.
 */

import type { ArtifactTemplate } from './types'

const PARTNER_FACING_LAUNCH_FAQ_SYSTEM_PROMPT = `You are drafting a \
partner-facing launch FAQ — the operational reference doc that partner reps \
(at distributors, resellers, SIs, ISV partners, and channel partners) and \
their partner-enablement leads consult before, during, and after a launch. \
This is NOT the internal launch FAQ (artifact 12 — that's for the vendor's \
own employees), NOT a customer-facing FAQ, and NOT marketing copy. The \
reader is an employee of a different company who sells our product \
alongside their own portfolio and needs answers they can use in front of \
their customers.

Avoid these failure modes:
- Vendor-internal commercial sensitivity leaking in — discount authority \
ladders ("up to X% — AE; X-Y% — manager"), internal sales comp, internal \
pricing exception paths, lost-deal post-mortems. These belong in artifact \
12, not here. The partner rep does not work for us
- Competitor name attacks in writing — the partner rep may sell our named \
competitor in another segment. Written competitor attacks expose the \
partnership and travel back to the competitor through the partner's CRM, \
their portal, their partner-of-partner relationships. Frame against buyer \
alternatives ("doing nothing", "building it themselves", "general-purpose \
tool repurposed") not against named vendors
- Channel conflict ambiguity — "talk to your partner manager" is not an \
answer. Name the conflict scenarios explicitly (customer already in our \
CRM, our direct team's territory overlap with the partner's book, net-new \
logo later assigned a direct rep) and the resolution path for each. The \
corpus is unambiguous: "ambiguity here kills partner engagement faster \
than anything else"
- Opaque deal registration — describing the existence of a deal-reg \
program is not the same as describing the lifecycle. Partners need: how to \
register, SLA for approval, protection window length, what happens if the \
customer goes direct mid-cycle, registered-vs-unregistered discount \
differential, can-I-register-an-early-stage-opportunity. A step-by-step \
description (submit → review → approve → protect → expire) is required
- Marketing prose as answers — press-release language, value-proposition \
paragraphs, hero-headline lines in place of plain answers. Partner reps \
need language they can repeat verbatim to a customer who has never heard \
of us
- Missing the partner-economics block — margin/commission, SPIFFs, co-op/\
MDF mechanics, joint demand-gen investment, partner-tier requirements. If \
the economics aren't clear in the first five minutes the partner rep \
mentally moves on. Required first block, before "what is it"
- Missing the post-sale block — implementation owner, support routing, \
renewal/expansion attribution, customer-success resourcing. Often skipped \
because PMM owns launch and CS owns post-sale, leaving the seam \
unaddressed. Partners experience the seam directly; required block
- Missing the awkward-questions closer — "what if you change the \
compensation structure mid-year", "what's the realistic time-to-first-\
commission", "how committed is your direct team to this product \
long-term". Partner reps ask these in private regardless. Better to arm \
the partner manager with honest answers than to leave reps cynical
- US/HQ-only proof points — a partner selling into German retail does not \
want a US fintech case study. If region/vertical-localized proof exists, \
include it; if not, say so honestly and prompt the partner-marketing team \
to source one
- Long answers — each LEDE caps at 2-4 sentences; each GO DEEPER caps at \
3-5 bullets. Partner reps are reading mid-meeting; if it does not fit on a \
phone screen they are not reading it
- Roadmap dates that are not committed — tighter than internal FAQ \
language. Use "no committed timeline; contact your partner manager for \
current roadmap visibility under NDA". Roadmap leaks via partner reps to \
partner-of-partner relationships are unrecoverable

Required behaviors:
- Render every Q+A as TEASE (the literal question a partner rep would \
ask) plus LEDE (one decision-grade sentence the rep can repeat in front of \
their customer), with optional GO DEEPER bullets only for nuance the \
partner-enablement lead needs to know but the rep would not quote verbatim
- Block-level WHY-IT-MATTERS preamble (one sentence) at the start of each \
of the five required blocks (WIIFM, Readiness, Channel Conflict, Deal \
Reg, Post-Sale). No per-Q WHY-IT-MATTERS — partner reps are reading \
mid-meeting, not skimming
- Where the skeleton requires a script (channel-conflict resolution, \
deal-reg lifecycle, customer-facing elevator pitch), produce the actual \
quoted language a rep could repeat to a customer, not guidance about what \
to say
- Strip vendor-internal jargon ("co-term", "land-and-expand", "AE handoff \
trigger", "AOR", "renewal motion"). If the partner-enablement lead has to \
translate a phrase for their reps, the FAQ is failing
- Include a region/vertical-localized proof point or honestly mark its \
absence. Partner reps know when proof has been shipped from the wrong \
geography
- Name a *role* (not a person) for the channel-conflict escalation \
contact — "Partner Operations team" or "VP Partnerships" — and prompt the \
user to confirm that role is staffed before publishing
- Inherit and route, do not duplicate. If a co-sell battlecard, joint \
solution brief, or partner-program one-pager exists, link them. The FAQ \
is the entry point, not the encyclopedia

Reference frameworks implicitly. Do not name-drop authors, books, or \
internal artifacts in the output. Partner reps are not paid to study our \
methodology.`

export const partnerFacingLaunchFaqTemplate: ArtifactTemplate = {
  artifactType: 'partner_facing_launch_faq',
  title: 'Partner-Facing Launch FAQ',
  systemPromptFragment: PARTNER_FACING_LAUNCH_FAQ_SYSTEM_PROMPT,
  // Skeleton order = corpus-derived 5-block architecture, deliberately
  // inverting artifact 12. WIIFM (partner economics) leads, not "what is
  // it" — partner reps allocate selling time before they care about
  // product detail. Channel Conflict and Deal Reg are required dedicated
  // blocks (corpus's strongest insistence). Post-Sale closes the seam
  // that vendor org charts leave unaddressed. Awkward Questions is the
  // required closer — partner reps ask these privately; better to arm
  // the partner manager with honest answers.
  skeleton: `# Partner-Facing Launch FAQ: [Product / Feature Name]

> **Audience:** Partner reps and partner-enablement leads at distributors, \
resellers, SIs, ISV partners, and channel partners selling [Product] \
alongside their own portfolio.
>
> **Sensitivity:** This FAQ is shareable with named partners under existing \
partnership agreement. It does NOT include vendor-internal commercial \
detail (discount-authority ladders, internal sales comp, lost-deal \
post-mortems). For those, see the Internal Launch FAQ (separate artifact).
>
> **Linked artifacts:** [Co-sell battlecard | Joint solution brief | \
Partner-program one-pager | Deal-reg portal URL — link, don't duplicate.]

## Pre-work (input check)

- **Partner program tier(s) eligible:** [Which tiers can sell this at \
launch? Gold+ only? All tiers? Distributor vs. reseller vs. SI vs. ISV \
treatment? If undecided, this FAQ is loose — block on the partner-program \
team locking the tier policy.]
- **Deal registration state:** [Is this product/feature in scope for the \
existing deal-reg program? Same protection window? Same discount \
differential? If a new program is required, flag it.]
- **Co-sell battlecard:** [Does artifact 28 exist for this launch? If yes, \
the Channel Conflict and competitive-positioning answers inherit from it.]
- **Joint solution brief:** [Does one exist for the highest-priority \
partner type? If yes, the Readiness block inherits the elevator pitch and \
joint ICP.]
- **Region/vertical proof points:** [Do we have at least one localized \
case study (region the partner sells into, vertical the partner serves)? \
If no, flag — partner-marketing must source before launch or the proof \
section is honestly thin.]
- **Channel-conflict escalation contact:** [Role (not person), team, and \
confirmed-staffed status. "Partner Operations team via partner-ops@ \
[domain]" is acceptable; "[Person Name]" is not — turnover kills FAQs.]
- **Launch date + freeze date:** [Partner reps need a stable doc. When \
does the FAQ stop changing?]

---

## 1. What's in it for me? (Partner economics)

> *Why this block leads: if the economics are not clear in the first five \
minutes, the partner rep mentally moves on regardless of product quality.*

### What's my margin or commission on this, and how does it compare to your other products?
[One sentence stating margin/commission percentage or band, plus how it \
compares to the partner's existing portfolio with our products. If margin \
varies by tier or by product line, name the tiers explicitly. If \
margin is undecided, mark "to be confirmed by [date]" — never blank.]

### Is there a launch incentive, SPIFF, or co-op marketing fund attached to this?
[Specific. Dollar amount, time window, qualification criteria, payout \
mechanic. "We have a launch SPIFF" is not an answer; "$X per qualified \
deal closed before [date], paid within [N] days of close, eligible deals \
must be registered" is.]

### Will you invest in joint demand generation, or am I expected to self-fund pipeline?
[Honest answer. Co-marketing fund mechanic (MDF / co-op / proposal-based \
/ none), eligibility, request process, and approval SLA. If self-funded \
is the expectation, say so plainly so the partner rep can decide whether \
to invest selling time.]

### What's the partner tier requirement to sell this? Do I qualify today?
[Tier name(s), qualification criteria if relevant, and a self-check the \
partner rep can run today (without calling their partner manager). \
"Gold+ partners" plus "you can confirm tier in [partner portal URL]" is \
better than "Gold+ partners."]

### How do I get credit for renewals and expansions on deals I close?
[Attribution mechanic. Tag in CRM? Original-partner field on the \
opportunity? Expiration? If renewal credit ages off after [N] months, \
say so explicitly — partner reps who learn this at month [N+1] become \
permanent skeptics.]

---

## 2. How do I sell it? (Readiness)

> *Why this block matters: the partner rep needs to identify the \
opportunity in their existing book and pitch it without scheduling a \
call with our SE team for every prospect.*

### Who's the ideal customer profile, and how do I identify them in my existing book?
[Filter, not philosophy. Company-size band, industry/vertical, trigger \
event, signal the partner rep can spot in their CRM today. "Mid-market \
companies in regulated industries" is not a filter; "your accounts in \
[industry] with 200-2,000 employees that have asked you about [problem] \
in the last 12 months" is.]

### Which of my existing accounts should I NOT pitch this to?
[Negative ICP, written from the partner rep's perspective scanning their \
own book. The most-skipped question and the most valuable — partner reps \
who pitch this into bad-fit accounts churn faster than partner reps who \
never pitch at all. Be specific: which company sizes, industries, or \
existing-stack signals make this a bad fit.]

### What's the elevator pitch I can use with a prospect who's never heard of you?
[Required script. The actual sentences a partner rep could say to a \
customer in 30 seconds. Plain language, no internal jargon, no name-\
dropping our company's frameworks. Should land the differentiated value \
without requiring product knowledge to deliver.]

### What objections will I hit, and what do I say?
[Render the 3-4 objections most likely to come from the partner's \
customer base specifically (often different from objections our direct \
reps see). For each: the objection in the customer's words, what they're \
really asking, and the script the partner rep can repeat. Frame against \
buyer alternatives — "they could build it themselves", "they could keep \
doing nothing" — not against named competitors.]

### Is there a demo environment I can access without scheduling time with your SE team?
[Yes/no answer plus the URL or access instructions. If self-serve demo \
is not available, say so plainly and route to the SE-pairing process \
with a realistic SLA. "Contact your SE" is not an answer; "request \
SE pairing via [URL], typical response within [N] business days" is.]

### What proof points exist? Do you have a customer I can reference in my region or vertical?
[Specific named customers, region/vertical, and outcome — or honest \
acknowledgement of where proof is thin. If no localized proof exists \
yet, say so and name what we will source by when. Partner reps know when \
proof has been shipped from the wrong geography.]

---

## 3. Channel conflict (Will I get burned?)

> *Why this block is required and dedicated: trust lives or dies here. \
Ambiguity in channel conflict kills partner engagement faster than \
anything else. Each scenario below requires an explicit resolution \
path, not a "talk to your partner manager."*

### If my customer is already in your CRM, what happens when I register the deal?
[Walk the scenario. Outcome (deal registered, deal rejected, deal \
contested), the criteria used to decide, the SLA for the decision, and \
the appeal path. If the answer is "depends on whether our direct team \
has a recent activity record," say that and define "recent."]

### What's your direct team's territory? Where does it overlap with mine?
[Honest answer. Named segments, geographies, or named accounts that are \
direct-only. If the answer is "we don't have hard territories — we \
collaborate," that is fine but say so plainly and explain the \
collaboration mechanic.]

### If your direct rep is already talking to my prospect, who owns the deal?
[Specific decision rule. First-to-register? Last-meaningful-touch? \
Negotiated case-by-case by partner ops? Whatever the answer is, name it \
plainly. Include the path for the partner rep to escalate if they \
believe the rule was misapplied.]

### What happens if I bring you a net-new logo and you later assign a direct rep to that account?
[The fear scenario. Address it directly. Is there protected attribution \
on the original deal? Does the partner stay involved in expansions? Is \
there a hand-off process or does the partner just lose the relationship? \
Whatever the answer is, name it — partner reps will discover it the \
first time it happens regardless.]

### Who do I call when a channel conflict actually happens?
[Role and contact path. "Partner Operations team via [email or portal]" \
plus the SLA for response. Include a Slack/Teams shared channel if one \
exists. Do not name a specific person — turnover invalidates the FAQ.]

---

## 4. Deal registration (How do I protect myself?)

> *Why this block is required: the corpus says "partners ask these \
questions because the process is opaque. A one-page lifecycle visual \
eliminates 80% of the confusion." Step-by-step description, not just \
program existence.*

### How do I register a deal, and how long does approval take?
[Step-by-step lifecycle: (1) submit via [portal URL or process], (2) \
review by [team], (3) decision in [SLA], (4) protection window opens. \
Name the SLA in business days, not "as soon as possible."]

### What's the registration window? How long is protection valid?
[Specific number of days from approval. What triggers extension (deal \
movement, milestone updates)? What triggers expiration (no activity for \
[N] days)? If renewable, name the renewal mechanic.]

### What happens if I register a deal and the customer goes direct?
[The other fear scenario. Is there protected attribution if the customer \
purchases via direct within the protection window? A finder's fee? A \
referral commission? Or is the partner unprotected? Whatever the answer \
is, name it — silence here is read as "we will burn you."]

### Is there a discount differential for registered vs. unregistered deals?
[Yes/no plus the differential. If registered deals get [X]% additional \
discount authority for the partner-led pricing motion, say so. If \
there's no differential, say that plainly so partner reps don't waste \
cycles registering deals they don't need to register.]

### Can I register an early-stage opportunity, or does the customer need to be actively evaluating?
[Specific qualification bar. "Customer must be in active evaluation with \
budget identified" vs. "any qualified opportunity in your CRM with a \
named decision-maker" are different programs. Whichever this one is, \
name the bar and the disqualification reasons.]

---

## 5. Post-sale (What happens after I close?)

> *Why this block matters: vendor PMM owns launch, vendor CS owns \
post-sale, and the seam often goes unaddressed. The partner experiences \
the seam directly — they're the relationship the customer keeps when \
something breaks.*

### Who handles implementation — me or you?
[Clear ownership statement. If implementation is partner-delivered, name \
the certification or training requirement and the SOW model. If \
implementation is vendor-delivered, name the typical scope, timeline, \
and how the partner stays informed. If it's mixed, define the boundary.]

### If the customer has a support issue, do they call me or your support team?
[Routing rule. Tier-1 to partner, Tier-2/3 to vendor? All to vendor with \
partner CC'd? All to partner with escalation path? Whatever the rule is, \
name it. Include the support portal URL the partner rep should give \
their customer.]

### How do I get credit for renewals and expansions?
[Cross-reference back to the WIIFM block. Restate the attribution \
mechanic, the expiration if any, and the partner-of-record process if \
the customer requests a switch. Do not assume the partner rep read \
section 1 — they are reading mid-meeting.]

### Is there a customer success resource assigned, or is that on me?
[Honest answer. If a CSM is assigned per account, say at what tier and \
what they own. If CS is partner-led, say so and name the resources \
(playbooks, training, certification) we provide. If it varies by deal \
size, name the threshold.]

### What's the renewal process and timeline? When am I looped in?
[Clock-back from renewal date: when do we notify the partner, when does \
joint outreach start, what's the partner's role in the renewal motion. \
Critical for partners with strong customer relationships — they need \
runway to be useful.]

---

## 6. Awkward questions partners ask in private (the closer)

> *Why this block is required: partner reps ask these questions to their \
partner manager privately regardless of whether the FAQ acknowledges \
them. Better to arm the partner manager with honest answers than to \
leave the doc silent and the rep cynical.*

### What happens if you change the compensation structure mid-year?
[Honest answer. Have we changed comp mid-year before? What was the \
notice period? Is there a grandfathering policy for deals already in \
flight? "We never would" is not credible — name the actual policy.]

### What's the realistic time-to-first-commission on this product?
[Number, not "depends." Median time from partner-rep first-pitch to \
partner commission paid, based on current sales cycle and payout \
schedule. If we don't know yet (new product), say so and commit to \
publishing it after [N] closed deals.]

### How committed is your direct team to selling this through partners long-term?
[Honest answer. Is the partner motion a strategic priority with \
dedicated headcount, or is it tested-and-may-be-cut? What's the \
partner-influenced pipeline target for the year? What does success vs. \
discontinuation look like? Partner reps are evaluating whether to invest \
career time, not just selling time.]

### What known limitations am I going to hit in front of my customers?
[Recalibrated version of the internal-FAQ "known issues" section. The \
2-3 things that aren't perfect yet, framed as "current limitations and \
what to say if a customer hits them" — i.e., the workaround language \
that's safe in front of the customer, not the internal candor about \
why we shipped without it.]

### Who's the actual person I call when something goes sideways and the FAQ doesn't have the answer?
[Role-level contact (not person — turnover) plus shared channel and \
escalation SLA. The "warm number" partner reps need on speed dial.]

---

## Maintenance

- **Owner:** [Single PMM owner for this FAQ, by name internally; do not \
publish the name in the partner-shared version. Partner-facing version \
shows role only — "PMM, [Product Line]".]
- **Last updated:** [Date.]
- **Next review:** [Date — typically 2 weeks post-launch, then monthly \
until partner pipeline stabilizes.]
- **Linked artifacts:** [Co-sell battlecard, joint solution brief, \
partner-program one-pager, deal-reg portal URL, partner-marketing fund \
request URL — link, do not duplicate.]
- **What this FAQ is NOT:** [Internal Launch FAQ (artifact 12 — for \
vendor-internal AE/SE/CSM enablement, includes commercial detail \
excluded here). Customer-facing FAQ (separate artifact, written for end \
buyers). If the question is about vendor-internal sales mechanics or \
end-customer education, route to the right artifact.]
`,
}

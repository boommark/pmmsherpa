/**
 * Co-Sell Battlecard template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Stratton — Punchy (VBF Rule applied to the JOINT pitch; Competitive
 *   Messaging Audit applied to the combined motion; A+ Customer becomes
 *   the joint A+ customer; BBQ Talk for the partner rep's spoken register).
 *   Structural sibling: artifact 16 (battlecard) — wedge-first ordering,
 *   leak-tolerance discipline, single customer proof, metadata block.
 *   Corpus amplification: PMA value-prop blogs, Dunford Sales Pitch p.154,
 *   Kalbach JTBD Playbook for joint customer profile.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/28-co-sell-battlecard.md
 *
 * Why this is a separate artifact from artifact 16: a solo battlecard reused
 * for co-sell is the dominant failure mode. The wedge, the ICP, and the
 * competitor list are all different in a joint motion. The wedge is the
 * outcome neither vendor delivers alone. The competitors are integrated
 * alternatives, DIY stacks, and do-nothing — not either side's solo
 * competitor list. The talk track is for the PARTNER rep (who knows their
 * platform cold and ours at ~30% depth), not our rep. Partner economics and
 * deal-reg mechanics are non-negotiable structural sections, not footnotes —
 * a partner rep who doesn't know how they get paid will not prioritize the
 * deal. The artifact is INTERNAL-ONLY across BOTH companies and designed to
 * be leak-tolerant calibrated for a partner-of-partner reader (a real
 * scenario in hyperscaler ecosystems).
 */

import type { ArtifactTemplate } from './types'

const CO_SELL_BATTLECARD_SYSTEM_PROMPT = `You are drafting a co-sell \
battlecard — a single (competitor × partner-pairing) document for a JOINT \
sales motion. It is INTERNAL-ONLY across both companies, read by partner \
reps and our reps before a joint competitive call, in joint deal review, and \
mid-cycle when the prospect names a competitor of the combined motion. It is \
NOT a solo battlecard with the partner's logo added. It is NOT a buyer-facing \
joint solution brief. It is NOT a general partner enablement one-pager.

CRITICAL — assume this document will leak and assume the reader is a \
partner-of-partner. Co-sell battlecards travel between two field orgs and \
sit in two partner portals; in hyperscaler ecosystems, your competitor is \
often also a partner of your partner. Calibrate every line as if a reporter, \
the competitor's CEO, or a partner-of-partner reads it. No mockery, no \
unverifiable claims, no internal customer names paired with revenue figures, \
no partner-disparaging asides ("we cover the gaps in their product"), no \
roadmap speculation phrased as fact for either product.

Avoid these failure modes:
- Solo battlecard reused for co-sell — wedge, ICP, and competitor list copy- \
pasted from our solo card with the partner's logo bolted on. The wedge, the \
joint customer profile, and the competitor list are all joint-first or the \
artifact fails on arrival
- No joint wedge — describing each product side-by-side ("we do X, they do Y, \
together we cover both") is not a wedge. The wedge is the outcome neither \
vendor delivers alone. Test: could the customer get this outcome from just \
one of us? If yes, sharpen the wedge
- Solo competitors listed instead of competitors of the combined motion. The \
right list has three categories: integrated alternative (a single vendor \
who bundles what we two do), DIY / build-it-yourself (their internal team + \
open source), do-nothing / delay (often the real competitor in complex joint \
deals)
- Missing partner economics. A partner rep who doesn't know how they get \
paid on a co-sell win will not prioritize the deal. Comp structure, deal- \
reg mechanics, and timeline expectations are non-negotiable inclusions
- Missing co-sell motion. "Contact your partner manager" is not a motion. \
Where to register the deal (ACE, AppExchange, Crossbeam, Reveal — the \
actual system), what qualifies as co-sell vs. referral vs. resell, response \
SLAs, rules of engagement
- Generic escalation. Two paths required: technical (integration question, \
POC blocker, security review) and commercial (stuck deal, exec alignment, \
competitive pressure). Named contacts and Slack handles when the partnership \
is mature; explicit "TBD — name to be added by [date]" markers when not
- Talk track in our register, not the partner rep's. Partner rep knows their \
platform cold and ours at ~30% depth. The pitch must be deliverable in 60 \
seconds without our slide deck. Discovery questions must be in the partner \
rep's spoken register, not press-release prose
- Logo-wall joint customer proof. ONE specific co-sell win with BOTH \
products in production — industry, size, what they switched from, how the \
joint motion closed it, the joint outcome. Reps quote the deal narrative
- Leakable language about the partner. Do-not-say list is two-sided: things \
not to say about competitors AND things not to say about the partner. \
Partner-disparaging asides damage the partnership before the deal closes
- Stale data treated as fresh. Both products' pricing, packaging, and \
program rules go stale invisibly. Date every factual claim. If older than \
90 days, mark for re-verification on either side
- More than 3 trap-setting questions. Partner reps cannot memorize a long \
list — and they know our product less well than our own reps do. Fewer \
questions, sharper questions

Required behaviors:
- Lead 'Joint wedge' with the buyer's transformation neither vendor delivers \
alone, then name the structural reason no single vendor and no DIY stack \
can match it, then the joint capability that proves it. Joint value → why- \
no-one-else → joint feature, in that order
- Pull the competitor's pitch verbatim from their homepage / latest investor \
update / G2 page. The partner rep needs to recognize the actual language on \
a call, not a paraphrase
- Render exactly three competitor categories: integrated alternative, DIY, \
do-nothing. Default to free-list and the model regresses to solo competitors
- Set joint ownership in the metadata block — named PMM (or partner manager) \
on BOTH sides with both review dates. A co-sell battlecard with a single- \
side owner is one re-org from being abandoned

One battlecard, one (competitor × partner-pairing). Three partners against \
the same competitor = three cards (the wedge differs, because the joint \
solution differs). One partner against three competitors = three cards. \
Cross-product is intentional.

Reference frameworks implicitly. Do not name-drop authors or sibling \
artifacts in the output.`

export const coSellBattlecardTemplate: ArtifactTemplate = {
  artifactType: 'co_sell_battlecard',
  title: 'Co-Sell Battlecard',
  // Skeleton order is wedge-first by design (inherited from artifact 16)
  // and joint-first throughout: header (joint owners both sides) → joint
  // customer profile → joint wedge → partner-rep talk track → trap-setting
  // → competitors of the joint solution (3 categories) → objection handling
  // → do-not-say (two-sided) → joint customer proof → deal-reg / co-sell
  // motion → escalation (two paths) → metadata. Reps on both sides read
  // top-down and arrive at the joint value before they read about the
  // competitor or the mechanics.
  systemPromptFragment: CO_SELL_BATTLECARD_SYSTEM_PROMPT,
  skeleton: `# Co-Sell Battlecard: [Our Product] + [Partner Product] vs. [Competitor of the Joint Solution]

> **INTERNAL ONLY — both companies.** Do not share with prospects, the partner-of-partner, or external audiences. Calibrate every line as if a partner-of-partner will read it.

**Our owner:** [Our PMM or partner-AM name + email]
**Partner owner:** [Partner PMM or partner-AM name + email — or "TBD — name to be added by [date]"]
**Last reviewed (our side):** [YYYY-MM-DD]
**Last reviewed (partner side):** [YYYY-MM-DD]
**Next joint review:** [YYYY-MM-DD — quarterly minimum, sooner on trigger events on either side]
**Format:** [PDF / Klue / Crayon / shared Notion / partner portal — and the joint refresh process]
**Joint deal context this card is built for:** [The specific deal type where this competitor shows up against the joint solution — e.g., "mid-market RevOps running on [Partner Platform] who has hit observability and cost-control needs at the same scale event, considering [Competitor] as a single-vendor alternative."]

---

## Joint customer profile

[The account where BOTH products create compounding value at the same time — not where one fits and the other tags along. Ruthless specificity.

- **Company shape:** [Size, vertical, cloud / platform maturity, scale signals where both products are simultaneously true.]
- **Buyer who owns BOTH problems:** [The single persona who is on the hook for the outcome neither vendor delivers alone — title, what they own, why both problems land on their desk at once.]
- **Trigger event making both urgent:** [Migration / audit / scale event / M&A / regulatory deadline — the moment the joint motion is most welcome.]
- **Negative joint profile:** [Accounts where ONLY one product fits. Co-selling on a bad-fit joint customer wastes both reps' time and poisons the partnership. Name the disqualifying signals explicitly.]]

---

## Joint wedge (how the joint solution wins)

[ONE paragraph — three sentences max. Open with the buyer's transformation that NEITHER vendor delivers alone. Then name the structural reason no single vendor and no DIY stack can match it (architectural, business-model, integration depth — something a competitor can't fix in two quarters by shipping a feature). End with the joint capability or integration that proves the wedge. Joint value → why-no-one-else → joint feature, in that order.

**Wedge test before you ship this card:** Could the customer get this outcome from just our product? Just the partner's product? If either is yes, the wedge is not joint — sharpen it.]

---

## 30-second talk track for the partner rep (when the competitor comes up)

[Three lines, in the *partner rep's* spoken register, deliverable in 60 seconds without a slide deck. The partner rep knows their platform cold and our product at ~30% depth — write accordingly.

1. **Acknowledge:** [One sentence acknowledging the competitor as a credible single-vendor option for a narrower scenario. Never pretend a known competitor is irrelevant.]
2. **Pivot to the joint wedge:** [One sentence connecting the buyer's stated need to the outcome neither vendor delivers alone, in language a partner rep can deliver from memory.]
3. **Invite the next step:** [One sentence — a question or a joint-proof offer. Not a close.]

**Discovery questions the partner rep asks early (3 max, partner-rep voice, no jargon):**
- [Question that surfaces whether the buyer feels the gap the joint solution closes — phrased so the partner rep can ask it without our context.]
- [Question that exposes the hidden cost of solving this with a single vendor or a DIY stack.]
- [Question that establishes whether the buyer owns BOTH problems or just one.]]

---

## Trap-setting questions (proactive — partner rep asks the prospect before [Competitor] is named)

[Exactly 3 questions. Partner-rep voice. Surface doubt about the single-vendor or DIY approach without naming the competitor.

1. [Question that exposes a constraint the joint motion closes — e.g., "How does your team handle X today when you have to make Y and Z work together, given the platform architecture?"]
2. [Question that exposes a hidden integration cost or operational friction the single-vendor alternative carries.]
3. [Question that exposes the gap the competitor's pricing or packaging creates when the buyer needs both jobs done.]]

---

## Competitors of the joint solution (three categories)

[Render all three categories. The right list is NOT either side's solo competitor list.

### Integrated alternative (a single vendor who bundles what we two do)
[Name the closest single-vendor bundle. One line on their pitch (verbatim if possible, sourced + dated). One line on why the joint solution wins (structural, not featural). One line on the honest risk — where they're genuinely competitive.]

### DIY / build-it-yourself (their internal team + open source)
[The customer's likely DIY stack — common open-source tools, internal team labor estimate, the maintenance tax. One line on why the joint motion wins (TCO, time-to-value, reliability — pick the sharpest). One line on when DIY actually wins (be honest; reps lose credibility pretending it never does).]

### Do-nothing / delay
[Often the real competitor in complex joint deals. Name the delay rationale ("we'll revisit next budget cycle", "we'll see if the existing tool catches up"). One line on the cost of delay specific to this buyer's trigger event.]]

---

## Objection handling (reactive — when the prospect repeats a competitor's pitch)

[Three to five common objections the prospect will voice when considering or having tried the integrated-alternative or DIY path. For each, response is one or two lines, in the partner rep's spoken register. Inherit recurring patterns from joint win/loss data if available.

- **"[Objection in the prospect's words]"** — [Response: acknowledge, reframe to the joint wedge, offer the joint proof point.]
- **"[Objection in the prospect's words]"** — [Response.]
- **"[Objection in the prospect's words]"** — [Response.]]

---

## Do-not-say (two-sided)

[Specific, not generic. "Don't disparage" is useless; "Don't call them legacy" is usable.

**About the competitor:**
- [Don't say X.]
- [Don't bring up Y (e.g., a public incident — invites comparison on dimensions where they recover quickly).]
- [Don't compare on [specific dimension where the comparison flatters them or invites a feature war].]

**About the partner (this is the section solo battlecards don't have — and where co-sell battlecards leak the worst):**
- [Don't reference [the partner's gap our product fills] — frames the partnership as us patching them.]
- [Don't speculate on [the partner's roadmap or internal politics].]
- [Don't compare pricing or packaging across the two products in a way that invites the prospect to negotiate one against the other.]]

---

## Joint customer proof (one deal, full context)

[ONE specific co-sell win — not a logo wall — with BOTH products in production. Reps on both sides quote this narrative on calls; specificity is the whole value.

- **Deal:** [Industry, ~headcount, geography.]
- **Situation:** [What they had / what they evaluated / which competitor of the joint solution they considered.]
- **Joint motion:** [Which side opened the deal, how the other was brought in, deal-reg path used, timeline.]
- **Decision driver:** [Their words on why the joint solution beat the integrated alternative or DIY path.]
- **Joint outcome:** [Measurable result that required BOTH products — not a metric either product could claim alone.]
- **Reference posture:** [Approved for joint sales reference / approved for competitive use only / no public reference — pick one. Note approval status on BOTH sides.]]

---

## Deal-reg / co-sell motion (the mechanics — without this section the card dies in a drawer)

[Cover all of the following. If the program doesn't yet exist, render explicit "TBD — co-sell program in design as of [date], owner: [name]" rather than skipping.

- **Where to register:** [The actual system — ACE, AppExchange Partner Community, Crossbeam, Reveal, partner portal URL. Step-by-step if the partner is new to the system.]
- **Co-sell vs. referral vs. resell:** [What qualifies a deal for each path and the implications. Reps use the wrong path when the rules aren't explicit.]
- **Response SLA:** [How fast each side responds to a registered deal — hours / days. Stale registrations are dead deals.]
- **Partner economics on a co-sell win:** [The partner rep's comp on this motion. SPIFFs, accelerators, MDF eligibility, attribution rules. NON-NEGOTIABLE inclusion — without this, the partner rep won't prioritize the deal.]
- **Rules of engagement:** [Who owns the customer relationship. Who leads the commercial conversation. What happens if the prospect comes inbound to one side first. How to handle an existing customer of one side becoming a joint prospect.]]

---

## Escalation (two paths, named contacts)

[**Technical escalation** — for integration questions, POC blockers, security reviews, architecture review.
- **Our side:** [Named SE / TAM / partner SE — name + Slack + SLA + what to bring to the call.]
- **Partner side:** [Named SE / TAM / partner SE — same.]
- **Trigger:** [What signals warrant escalation vs. handling at the rep level.]

**Commercial escalation** — for stuck deals, exec alignment, competitive pressure, executive sponsorship requests.
- **Our side:** [Named field leader or VP — name + threshold for pulling them in.]
- **Partner side:** [Named field leader or VP — same.]
- **Trigger:** [Deal size, time stuck, named-account designation — what triggers exec involvement on either side.]

If any of the above is "TBD" mark it explicitly with an owner and date. Generic "contact your partner manager" is failure mode — name names or name the gap.]

---

## Refresh triggers (re-verify this card when any of these happen on EITHER side)

- [Either product publishes new pricing or changes packaging.]
- [The competitor of the joint solution ships a feature that touches the joint wedge.]
- [The partner program rules change (deal-reg path, comp structure, qualification criteria).]
- [Major G2 / Gartner / Forrester report drops covering the integrated alternative.]
- [Acquisition, leadership change, or significant fundraise on either side or at the competitor.]
- [Joint win/loss data shows shift in deal-loss reasons against this competitor.]
- [Partnership tier or status changes on either side (e.g., advanced-tier designation, technology partner status).]
- [More than 90 days since last joint review, regardless of triggers.]
`,
}

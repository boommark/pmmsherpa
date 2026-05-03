/**
 * Partner Enablement One-Pager template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Stratton — Punchy (VBF Rule, A+ Customer, BBQ Talk applied to partner-rep
 *   register). VandeHei / Allen / Schwartz — Smart Brevity (TEASE/LEDE,
 *   skim density, one-screen discipline). Corpus amplification: PMA
 *   sales-enablement and partner-collateral practitioner POV — joint use
 *   cases, disqualifier line, qualifying-question four-jobs framing,
 *   embarrassingly-easy escalation, deal-registration visibility, refresh
 *   cadence.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/27-partner-enablement-one-pager.md
 *
 * Why this template is equip-the-rep (not persuade-the-prospect): the dominant
 * training prior for "partner one-pager" is the customer-facing marketing
 * flyer — glossy, inside-out, persuasion-coded. The corpus diagnosed this as
 * failure mode #1: marketing-flyer-repurposed-for-partners. The partner rep
 * needs answers to four questions in 30 seconds — what is this thing, is my
 * deal a fit, what do I say, who do I call when stuck — and the skeleton is
 * ordered to deliver those answers top-down. Distinct from the customer-facing
 * one-pager / solution brief (artifact 18), the partner pitch deck (26 — for
 * partner execs), and the co-sell battlecard (28 — per-competitor).
 */

import type { ArtifactTemplate } from './types'

const PARTNER_ENABLEMENT_ONE_PAGER_SYSTEM_PROMPT = `You are drafting a partner \
enablement one-pager — the asset a partner rep skims in 30 seconds before a \
customer call, when our product comes up in their pipeline, or when they're \
deciding whether to loop us in. The audience is the PARTNER REP, not their \
exec (that's the partner pitch deck) and not their customer (that's a joint \
solution brief or one-pager).

Avoid these failure modes:
- Marketing flyer voice. This is NOT a customer-facing prospect asset. \
Persuasion copy ("the leading platform for…", "transform your business") has \
no place here. The partner rep is being equipped, not persuaded
- Inside-out language ("we built X", "our platform delivers Y"). Partner reps \
cannot recycle inside-out lines in customer conversations. Use buyer-outcome \
language so the rep can paraphrase any sentence on a live call
- Generic differentiators ("best-in-class", "AI-native", "enterprise-grade", \
"easier to use"). Apply the competitor-verbatim test: if a direct competitor \
could lift this line word-for-word, it's not a differentiator
- Use cases that don't name the partner's role. A use case described only in \
terms of our product reads as "sell our product for us". Joint use cases must \
show where the partner's service, integration, or context provides the \
value-add alongside us
- Skipping the disqualifier in the joint customer profile. One line on who \
is NOT a fit saves partner reps wasted cycles and builds program trust. \
Without it, partner reps bring you into bad-fit deals or fail to bring you \
into good ones because they're unsure
- Qualifying questions phrased as buyer-discovery questions. These are \
partner-side fit-confirmation questions — the rep asks them to decide \
whether to loop us in, covering pain, authority, fit, and competitive \
context. They are NOT the sales discovery question set
- Free-text escalation. "Reach out to your partner manager" fails the \
embarrassingly-easy test. Render escalation as a 3-row table: situation → \
person/role → channel. Friction in the escalation path is where joint \
opportunities quietly die
- More than one page. If the draft spills past a single page or single \
screen, cut. Partner reps will not read a multi-page asset under time \
pressure. The constraint is the discipline

Required behaviors:
- Render exactly three joint use cases and three differentiators — not four, \
not five
- Render exactly four qualifying questions — covering pain, authority, fit, \
competitive context
- Inherit positioning's Distinct Capabilities, Differentiated Value, and \
Best-Fit Accounts (positioning_statement artifact) and ICP firmographics \
(icp artifact) as upstream inputs. If those artifacts do not exist, flag it \
— do not invent positioning here
- Date every factual claim, name a PMM owner and a partner program owner. \
Partner enablement assets go stale faster than internal sales assets; \
staleness destroys partner-rep trust. Quarterly refresh minimum
- Make deal registration visible as its own block (not a footer) with the \
registration window stated explicitly

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const partnerEnablementOnePagerTemplate: ArtifactTemplate = {
  artifactType: 'partner_enablement_one_pager',
  title: 'Partner Enablement One-Pager',
  systemPromptFragment: PARTNER_ENABLEMENT_ONE_PAGER_SYSTEM_PROMPT,
  // Skeleton order is skim-optimized, top-down: header (LEDE) → what we are
  // (one sentence) → ideal joint customer (with disqualifier) → joint use
  // cases → differentiators → qualifying questions → escalation → deal
  // registration → metadata. By the end of the third block a partner rep
  // knows whether to loop us in.
  skeleton: `# Partner Quick Reference: [Our Product]

> **For partner reps.** Skim before customer calls. Updated [Month YYYY].

**Owned by:** [PMM owner name + email]
**Partner program contact:** [Name + email]
**Last reviewed:** [YYYY-MM-DD]
**Next review:** [YYYY-MM-DD — quarterly minimum]

---

## What we are

[ONE sentence. What it does, for whom, and the outcome. Buyer-outcome led, not feature-led — a line the partner rep can paraphrase verbatim on a customer call. Example shape: "[Product] helps [specific buyer] [achieve specific outcome] without [the trade-off they currently make]." If a direct competitor could lift this sentence word-for-word, rewrite it.]

---

## Ideal joint customer

- **Company profile:** [Industry, employee or revenue band, tech-stack signal — inherit from the ICP artifact. Specific enough that a partner rep can recognize a fit account on sight.]
- **Champion:** [Title, what they own, the pain they feel weekly, what they're measured on.]
- **Economic buyer:** [Title, what they care about, the budget question they ask.]
- **Disqualifier:** [One line on who is NOT a fit — the bad-fit pattern. Saves partner-rep cycles. Examples of disqualifier shape: "<50 employees", "no existing data warehouse", "single-region only", "regulated industries we don't yet support".]

---

## Top 3 joint use cases

[Three use cases the customer experiences when they buy our product through this partner. Each names the partner's role alongside ours. Buyer-outcome led; one sentence each.

1. **[Use case name — buyer-outcome shape, not feature shape]:** [The customer pain + how the partner's service/integration + our product jointly resolve it. Example shape: "[Customer] uses [partner's service] to [partner's value-add], paired with [our product] to [our value-add], so they [joint outcome]."]
2. **[Use case name]:** [One sentence with the partner's role + our role + the joint outcome.]
3. **[Use case name]:** [One sentence with the partner's role + our role + the joint outcome.]]

---

## Top 3 differentiators

*(What the partner rep says when the customer asks "why not [competitor]?")*

[Three differentiators — buyer-outcome led, structurally defensible. Each is one sentence the partner rep can repeat on a call. No feature checkboxes, no "best-in-class", no jargon. Inherit from positioning_statement's Distinct Capabilities + Differentiated Value.

1. **[Differentiator — buyer-outcome shape]:** [One sentence. The outcome the buyer gets that the alternatives can't structurally match.]
2. **[Differentiator]:** [One sentence.]
3. **[Differentiator]:** [One sentence.]]

---

## Qualifying questions

[Exactly four questions the partner rep asks themselves or their customer BEFORE looping us in. These are partner-side fit-confirmation questions, not buyer-discovery questions. Cover all four jobs:

1. **Pain:** [Question that surfaces the core problem our product solves — phrased so the answer immediately tells the rep whether the customer feels the pain we address.]
2. **Authority / budget:** [Question that confirms the customer has authority and budget — phrased so the rep can decide whether the deal is real.]
3. **Fit:** [Question that confirms firmographic and stack fit — phrased so the answer maps to the joint-customer profile above.]
4. **Competitive context:** [Question that surfaces what the customer is currently using or evaluating — so the rep knows whether to pull the co-sell battlecard.]]

---

## Escalation contacts

| Situation | Who to contact | How |
|---|---|---|
| Technical questions / demo support | [Name or role] | [Slack channel / email / Calendly link] |
| Deal structuring / pricing | [Name or role] | [Slack channel / email / Calendly link] |
| Customer escalation | [Name or role] | [Slack channel / email / Calendly link] |

[If the partner program has a separate legal/compliance channel, add a fourth row. Otherwise route through deal structuring.]

---

## Deal registration

**[Register this deal: [direct link to partner portal registration form]]**

Register within [X days — typically 30] of your first qualified customer conversation to protect the deal and unlock partner economics. Questions on registration mechanics → [partner program contact above].

---

*Partner Slack: [channel]. Found a stale fact, broken link, or a use case that's missing? Ping [PMM owner].*
`,
}

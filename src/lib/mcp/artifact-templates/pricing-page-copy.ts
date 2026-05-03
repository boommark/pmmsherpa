/**
 * Pricing Page Copy template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Madhavan Ramanujam — Monetizing Innovation (Good/Better/Best tiering,
 *   willingness-to-pay segmentation, the 4 monetization failure types:
 *   Feature Shock / Minivation / Hidden Gem / Undead, behavioral pricing
 *   tactics, price integrity).
 *   Alex Hormozi — $100M Offers (Value Equation as the page's perceived-value
 *   surface, Trim & Stack as feature-gating discipline, naming/wrapper as
 *   tier-naming discipline).
 *   Tier-2 corpus: Sharebird / PMA pricing AMAs and ProductLed pricing-page
 *   guides (Wes Bush), Kyle Poyar on usage-based pricing pitfalls,
 *   Maja Voje — Go-To-Market Strategist on packaging.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/39-pricing-page-copy.md
 *
 * Why this template gates hard on pre-work: the pricing page is the
 * consumer-facing render of the company's monetization strategy. Drafting
 * copy before packaging strategy is locked produces a page that has to be
 * thrown out when the strategy lands. The skeleton's first move is to refuse
 * to draft until the strategy is confirmed — Ramanujam's central argument
 * applied as a guard rail.
 *
 * Why tier-naming is treated as identity-not-capability: corpus convergence
 * across PMA, ProductLed, and Hormozi's wrapper framing — capability tier
 * names ("Basic / Pro / Enterprise") create friction; identity tier names
 * ("Solo / Team / Scale") create self-selection. The negative system prompt
 * codifies this.
 */

import type { ArtifactTemplate } from './types'

const PRICING_PAGE_COPY_SYSTEM_PROMPT = `You are drafting public pricing page \
copy — the consumer-facing surface of the company's monetization strategy. \
This is NOT a marketing page; it is the closing argument of a sales process. \
Buyers come to this page to *self-select into a tier*, not to be persuaded \
into a single CTA.

STOP CONDITION — refuse to draft copy if any of the following is true:
- The packaging strategy is in flux (tier count, value metric, or what each \
tier includes is being actively debated). Pricing page copy is downstream of \
packaging strategy. If the strategy moves, the copy gets thrown out.
- The structural choice has not been made: 3-tier Good/Better/Best, 4-tier \
G/B/B + usage volume, single-tier, pure usage-based, or contact-sales. One \
must be chosen before drafting; mixing produces incoherent pages.
- Willingness-to-pay bands per tier are unknown. Without WTP signal, tier \
prices are guesses anchored on competitor benchmarks — which the canon \
explicitly warns against.

If any of these is unresolved, respond with the gating warning and a list of \
the unresolved decisions. Do not draft copy.

Avoid these failure modes (book + corpus consensus):
- Feature Shock — too many features bulleted under a tier, buyer overwhelmed, \
no perceived value. Each tier's bullets should be the 5-8 things that *most* \
signal value to its persona, not everything that's technically included.
- Hidden Gem — burying the highest-value capability under a generic "Pro" \
label. The differentiated value should be visibly placed in the tier where \
it converts.
- Generic capability-led tier names ("Starter / Pro / Enterprise") without a \
"best for [persona]" anchor. Identity-led naming ("Solo / Team / Scale") \
creates self-selection; capability-led naming creates friction. If you must \
keep generic names, the "best for" line is mandatory.
- 5 or more tiers. Three is the sweet spot. Four is acceptable only when the \
fourth tier is a usage-volume tier (not a feature-tier). 5+ tiers cause \
comparison paralysis.
- Hidden gates / surprise exclusions. What is NOT included at each tier must \
be visible. Buyers who hit an undisclosed gate feel manipulated.
- "Contact us" as the default for every tier. Reserve for genuine enterprise \
customization, not as a hedge against pricing confidence. Hiding price = \
pricing confidence failure.
- No anchor tier. Without a high-priced option, buyers anchor on the middle \
tier as expensive. The top tier exists to make the middle tier feel \
reasonable, regardless of whether it converts.
- Leading with feature counts ("50+ integrations, 10 dashboards"). Counts \
are not value. Lead with the outcome, then prove it with the right features.
- Cost-based feature gating. Gate on value signals — the question is "what \
feature, when used, signals the customer is ready to pay more?" — not on \
what's expensive to deliver.
- Omitting the FAQ. Late-stage objections kill pricing-page conversion at a \
higher rate than headline weakness. The FAQ is conversion copy, not customer \
support.
- Vague value-metric definitions. If the buyer can't tell exactly what \
counts as a "user" or a "seat" or a "credit", they hesitate even when the \
price is right.

Inherit (do not re-derive) positioning, messaging framework, value \
proposition canvas, and ICP/persona work. The pricing page's job is to \
*render* the strategy, not re-discover it.

Reference frameworks implicitly. Do not name-drop authors or frameworks in \
the output.`

export const pricingPageCopyTemplate: ArtifactTemplate = {
  artifactType: 'pricing_page_copy',
  title: 'Pricing Page Copy',
  systemPromptFragment: PRICING_PAGE_COPY_SYSTEM_PROMPT,
  // Skeleton order mirrors how a serious buyer scans a pricing page:
  // hero (1-line reminder of the value) → tier grid (find your tier) →
  // comparison strip (validate the jump) → FAQ (handle objections) →
  // social proof (de-risk the choice) → contact-sales bridge → footer CTA.
  skeleton: `# Pricing Page Copy: [Product Name]

## Pre-work (gating decisions — do not draft copy until all are resolved)

> **Warning:** Pricing page copy is downstream of packaging and monetization \
strategy. A copy *change* without a packaging strategy review will produce a \
page that has to be rewritten when the strategy lands. If any decision below \
is in flux, stop and run a packaging strategy review first.

- **Packaging strategy lock:** [Is the tier count, value metric, and what \
each tier includes settled? If the team is actively debating any of these, \
STOP and resolve before drafting copy.]
- **Structural choice (pick exactly one):** [3-tier Good/Better/Best | \
4-tier G/B/B + usage volume | Single tier | Pure usage-based | Contact-sales \
only. The skeleton below assumes 3-tier G/B/B as the default. Adjust the \
tier grid section if a different structure was chosen.]
- **Willingness-to-pay bands per tier:** [What's the WTP band for each \
target segment? Source — Van Westendorp survey, Gabor-Granger testing, \
existing customer interviews, or competitor anchoring with a stated reason. \
Don't price on competitor benchmarks alone.]
- **Champion persona per tier:** [Inherited from positioning + ICP. Each \
tier targets ONE persona. If a tier doesn't have a clear persona, it \
shouldn't exist.]
- **Value metric:** [What you charge per — seats, active users, credits, \
events, revenue, contacts. Define it precisely; ambiguity here kills \
conversion even when the price is right.]
- **Upstream artifacts consumed:** [Positioning Statement, Messaging \
Framework, Value Proposition Canvas, ICP/Buyer Persona — link or paste the \
differentiated value statements that will render on this page.]

---

## Hero (above the fold)

- **Page title:** [One short line. The value reminder, not a re-pitch. \
Example pattern: "Pricing that scales with [the buyer's job-to-be-done]." \
Do not lead with "Simple, transparent pricing" — that's table-stakes copy.]
- **Subhead:** [One sentence that anchors the page in the buyer's outcome \
and signals self-selection — "Find the plan that fits where your team is \
today, and grows with you." Friction-reducer ("No credit card required" / \
"14-day free trial") goes here if applicable.]
- **Annual / Monthly toggle:** [Default to annual. Show the savings as a \
specific number, not a percentage abstraction. "Save $240/year" is more \
visible than "Save 20%".]

---

## Tier grid (3 tiers — Good / Better / Best)

> Each tier follows the same fixed schema. Do not vary the schema across \
tiers. Buyers compare tier-to-tier; consistency is what makes the comparison \
visible.

### Tier 1 — [Identity-led name, e.g., "Solo" / "Starter for Builders" — \
NOT "Basic"]

- **Value-statement headline:** [One sentence, one outcome. What changes for \
this buyer at this tier. Example pattern: "Everything you need to ship your \
first [outcome]." If the buyer has to read the bullets to figure out if this \
tier is for them, the headline failed.]
- **Price (monthly):** [$X/mo per [value metric]]
- **Price (annual):** [$Y/mo billed annually — Save $Z/year]
- **Best for:** [The persona who self-selects here. One sentence. \
Psychographic + situational, not demographic. "Solo operators running their \
first 100 customers on a single tool" is best-fit. "Small businesses" is \
not.]
- **What's included (5-8 bullets, value-signal first):**
  - [The 5-8 things that most signal value to this persona. Lead with the \
outcome each bullet enables, not the feature name. Use the persona's \
language, not the product's.]
- **Usage limits included:** [Specific numbers — "Up to 1,000 [value metric \
units] / month". Vague limits ("ample usage") read as a future bait-and-switch.]
- **What's NOT included at this tier:** [The 2-4 capabilities that gate to \
the next tier. Be explicit. Hiding the gate produces buyers who feel \
manipulated when they hit it. Examples: "SSO, audit logs, and custom roles \
unlock at [Tier 2 name]."]
- **Primary CTA:** [Free trial OR low-friction signup OR "Start free". One \
action. Match the time-to-value (under 30 min → trial; longer → guided \
demo).]

### Tier 2 — [Identity-led name, e.g., "Team" / "Scaling Team" — \
NOT "Pro". This is the page's revenue tier; it should feel like the obvious \
choice before the buyer reads the bullets.]

- **Value-statement headline:** [One sentence. The outcome a growing team \
gets that they couldn't get on Tier 1. Often the most differentiated of the \
three.]
- **Price (monthly):** [$X/mo per [value metric] — typically 3-5x Tier 1]
- **Price (annual):** [$Y/mo billed annually — Save $Z/year]
- **Best for:** [The persona who self-selects here. The "scaling team" or \
"growing org" — they have collaboration, governance, or volume needs that \
Tier 1 doesn't address.]
- **"Most popular" / "Recommended" badge:** [Yes — this is the page's \
revenue tier and should be visually distinguished. The badge is part of the \
copy.]
- **What's included (5-8 bullets, value-signal first):**
  - [Lead with "Everything in [Tier 1], plus —" then the 5-8 capabilities \
that define this tier. The plus-list is where the differentiated value \
lives. Each bullet maps to a specific Tier 2 persona pain.]
- **Usage limits included:** [Specific numbers — typically 5-10x Tier 1.]
- **What's NOT included at this tier:** [The 2-3 capabilities that gate to \
Tier 3. Usually enterprise-level — SSO with custom IdP, dedicated CSM, \
custom contracts, SOC 2 / HIPAA / advanced compliance, custom data residency.]
- **Primary CTA:** [Often the same as Tier 1 (free trial / start) but \
visually emphasized. Some pages use "Start free, upgrade when you need to" — \
that copy belongs here.]

### Tier 3 — [Identity-led name, e.g., "Scale" / "Enterprise" — Enterprise \
is acceptable here because it IS the persona. This tier exists to anchor.]

- **Value-statement headline:** [One sentence. The outcome an enterprise \
buyer gets — typically about security, compliance, scale, or dedicated \
support, not about more features.]
- **Price:** ["Custom pricing" or "Starts at $X/mo" — only use "Contact us" \
here, and only because enterprise pricing is genuinely customized. Do not \
hide the floor if you have one.]
- **Best for:** [The enterprise persona. Compliance-heavy industries, large \
seat counts, multi-team governance, regulated data — the situational \
markers that make Tier 1 and Tier 2 a non-starter.]
- **What's included (5-8 bullets):**
  - [Lead with "Everything in [Tier 2], plus —" then the enterprise-grade \
capabilities. SSO with custom IdP, audit logs, custom roles & permissions, \
SOC 2 / HIPAA / GDPR / data residency, dedicated CSM, custom SLAs, custom \
contracts, priority support.]
- **Usage limits included:** ["Custom" or specific high-volume numbers if \
the contract has them. "Unlimited" should be used with care — it implies a \
support burden the buyer assumes you'll absorb.]
- **Primary CTA:** ["Talk to sales" or "Book a demo" — this is where \
contact-us belongs because the buying motion genuinely requires it.]

---

## Comparison strip / feature matrix

> Not a 60-row exhaustive matrix. A 12-20 row "what changes across tiers" \
matrix focused on the value-signal gates. Buyers use this to validate the \
tier jump — "if I upgrade to Tier 2, what specifically do I get?"

| Capability | [Tier 1 name] | [Tier 2 name] | [Tier 3 name] |
|---|---|---|---|
| [Capability 1 — usage volume] | [Limit] | [Limit] | [Custom] |
| [Capability 2 — collaboration / seats] | [Cap] | [Cap] | [Custom] |
| [Capability 3 — integrations] | [Subset] | [Full] | [Full + custom] |
| [Capability 4 — analytics] | [Basic] | [Advanced] | [Advanced + custom reports] |
| [Capability 5 — SSO] | — | [SAML] | [SAML + custom IdP] |
| [Capability 6 — audit logs] | — | [30 days] | [Unlimited retention] |
| [Capability 7 — roles & permissions] | [Basic] | [Custom roles] | [Custom + scoped] |
| [Capability 8 — compliance] | — | [SOC 2] | [SOC 2 + HIPAA + custom] |
| [Capability 9 — support] | [Email] | [Priority email + chat] | [Dedicated CSM] |
| [Capability 10 — SLA] | — | — | [Custom SLA] |
| [Capability 11 — data residency] | [Default region] | [Default region] | [Custom region] |
| [Capability 12 — contracts] | [Self-serve] | [Self-serve / annual] | [Custom MSA] |

[Add 3-8 more rows specific to your product's value-signal gates. Do not \
pad the matrix — every row should map to a real buyer decision.]

---

## FAQ (objection-led, 8-12 questions)

> This is conversion copy, not customer support. Each question is a real \
buyer objection. Each answer reduces friction or restates a tier benefit. \
Order from highest-frequency objection to lowest.

- **What counts as a [value metric — "user" / "seat" / "credit"]?** [Define \
the value metric precisely. Ambiguity here is a leading conversion killer. \
Include an example: "An active user is anyone who logs in at least once in a \
billing month."]
- **How does seat / user pricing work?** [Explicit math. "You're charged \
$X/seat/month, billed annually. Add or remove seats anytime; we prorate." \
Tell them exactly how the bill changes when their team changes.]
- **Can I change plans later?** [Reduce commitment fear. "Yes — upgrade \
anytime, downgrade at the end of your billing cycle. Your data stays \
intact."]
- **Do I need a credit card to start?** [Friction reducer. If the answer is \
no, this question must be answered first.]
- **What happens to my data if I cancel?** [Lock-in fear. Specific export \
options, retention window, and data destruction policy.]
- **Is there a free trial?** [If yes — what's the length, what's included, \
what happens at the end. If no — say why and what alternative ("free tier", \
"30-day money-back guarantee") exists.]
- **How is annual billing different from monthly?** [Specific savings, \
specific lock-in. "Save $X by paying annually. You can downgrade or cancel \
at the end of the annual term."]
- **What's included in the [Tier 3 / Enterprise] tier?** [The enterprise \
self-qualification question. Which features, which compliance, which support \
SLA — give them enough to know if they need to talk to sales.]
- **Do you offer discounts for [non-profits / startups / education]?** [If \
yes, what's the program. If no, say so cleanly.]
- **What payment methods do you accept?** [Credit card, ACH, wire, invoice. \
The enterprise buyer will check this.]
- **Is my data secure?** [Compliance certifications, data encryption, \
breach history (if good). One-line summary; deep-link to a security page.]
- **Can I get a custom plan?** [The contact-sales bridge. Who qualifies — \
typically a seat count or revenue threshold — and how to start the \
conversation.]

[Add or remove questions to fit the product. 8-12 is the right range; \
fewer than 8 and you're under-handling objections; more than 12 and the FAQ \
becomes a knowledge base.]

---

## Social proof

- **Customer logos:** [4-8 logos from companies that match the ICP, not \
just the most famous logos. The buyer should see at least one company they \
recognize as similar to their own. Logos do double duty: trust + \
self-identification.]
- **Specific testimonial:** [One named-VP-with-metric quote. "We reduced \
[metric] by [X%] in [time]" from a real customer at a recognizable company. \
Beats five generic five-star reviews. Place near the highest-value tier.]
- **Quantified outcome strip:** [If you have aggregate metrics — "Trusted \
by 4,000+ teams", "$2B in [outcome] processed" — place them here. Generic \
"loved by thousands" is not proof; specific numbers are.]

---

## Contact-sales bridge (for enterprise / custom)

- **Headline:** [One line. "Need something custom?" or "Looking for a \
solution at scale?" — anchored to the situational marker that defines the \
enterprise persona, not just to "Enterprise".]
- **Best for:** [Same psychographic + situational specificity as the tier \
"Best for" lines. "Teams over 100 seats", "Regulated industries (HIPAA / \
financial services)", "Multi-region deployments" — give the buyer a way to \
self-qualify before the call.]
- **What you'll get:** [The 3-5 things that come with a custom plan that \
aren't on the standard tiers. Dedicated CSM, custom SLA, custom MSA, \
priority roadmap input, on-premise / private cloud option.]
- **CTA:** ["Talk to sales" with a short form (3-5 fields max). Long forms \
here are a CTA decision, not a separate concern — every extra field reduces \
conversion.]

---

## Footer CTA

- **Re-state the offer in one line.** [The same value reminder from the \
hero, refreshed for someone who just scrolled the whole page.]
- **Primary CTA:** [Same as the page's primary CTA. One action, repeated. \
Buyers who reach the footer have read the full page; this is the close.]
- **Secondary link:** ["Talk to sales" or "See a demo" for buyers who \
aren't ready to self-serve. Visually subordinate to the primary CTA.]

---

## Validation checklist

- [ ] Pre-work decisions all resolved — packaging strategy locked, \
structural choice made, WTP bands known, persona per tier identified, value \
metric defined.
- [ ] 3 tiers (or 4 if the fourth is a usage-volume tier). Not 5+.
- [ ] Each tier has identity-led name OR generic name with mandatory "best \
for [persona]" anchor.
- [ ] Each tier's headline is one sentence, one outcome — not a feature list.
- [ ] What's NOT included is visible at each tier (Tiers 1 and 2).
- [ ] Middle tier feels like the obvious choice; carries "Most popular" badge.
- [ ] Top tier exists to anchor; pricing reflects that even if conversion \
volume is low.
- [ ] Comparison strip is 12-20 rows of value-signal gates, not a 60-row \
feature dump.
- [ ] FAQ is 8-12 objection-led questions; value metric is precisely defined.
- [ ] Social proof is specific (named-VP testimonial, ICP-matched logos, \
quantified metric) — not generic stars.
- [ ] "Contact us" appears only on the enterprise tier and the contact- \
sales bridge — not as a hedge across all tiers.
- [ ] Page inherits positioning, messaging, and persona work — does not \
re-derive them.
`,
}

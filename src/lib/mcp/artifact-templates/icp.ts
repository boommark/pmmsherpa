/**
 * ICP (Ideal Customer Profile) template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   April Dunford — Obviously Awesome 2nd ed (2026), Step 4: Best-Fit Accounts
 *   (company-level signals: buy quickly, no discount-grinding, intuitive value,
 *   refer others). Alex Hormozi — $100M Offers, Market Selection Framework
 *   (4 conditions: massive pain, purchasing power, easy to target, growing).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/04-icp.md
 *
 * Why this direction: ICP is Best-Fit Accounts at full fidelity (the
 * positioning doc compresses this into 4-5 lines), wrapped in Hormozi's
 * upstream market-selection lens. ICP is strictly company-level — buyer
 * persona (artifact 05) handles the humans inside the account. The two
 * documents are complementary; conflating them is the most common ICP
 * failure mode in B2B SaaS.
 */

import type { ArtifactTemplate } from './types'

const ICP_SYSTEM_PROMPT = `You are drafting an Ideal Customer Profile — the \
internal strategic document that tells the GTM team which COMPANIES to \
prioritize, which to exclude, and how to spot best-fit accounts in the wild. \
This is a quality filter and a weekly decision-making lens, not a market \
sizing exercise and not a buyer persona.

Avoid these failure modes:
- Conflating ICP with buyer persona — ICP describes COMPANIES (firmographic, \
psychographic, behavioral). Persona describes the HUMANS inside those \
companies (champion, economic buyer, blocker). Stay company-level here.
- Demographics-only profile — "B2B SaaS, 100-500 employees, North America" \
is not an ICP. Add psychographic specificity (beliefs, prior failed attempts, \
ROI vs. vision orientation) and behavioral signals (hiring, content, \
competitive churn, product usage)
- No exclusion criteria — ICP without explicit bad-fit patterns is just a \
TAM doc. Name the patterns that signal a bad-fit account: slow close, \
discount-grinding, heavy customization, disproportionate support load, \
never becomes a reference
- Skipping the market-conditions check — if the market lacks acute pain, \
purchasing power, targetability, or growth, account-level work is waste. \
Validate the market BEFORE drafting account profiles
- No trigger events — without in-market behavioral signals (recently \
churned from a rival, hiring the team that uses the product, actively \
consuming content on the problem) the ICP is unactionable for outbound \
and account scoring
- Targeting-list mindset — ICP is not a one-time list build. It's a \
prioritization philosophy used weekly across messaging, roadmap, sales \
qualification, and content. Frame outputs accordingly
- Biggest-customer trap — letting your largest or weirdest customer \
define ICP when they're an outlier. Position for the best-fit pattern, \
not the loudest data point
- Cake-pop trap — describing the ICP you wish you had based on what you \
intended to build, not the ICP your happy customers actually represent. \
If unexpected segments are succeeding, that IS the signal

Best-fit signals to anchor on (the four observable behaviors): a best-fit \
account buys quickly, doesn't ask for a discount, intuitively understands \
the value, and refers others. If a candidate profile fails these tests \
in the wild, the profile is wrong.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const icpTemplate: ArtifactTemplate = {
  artifactType: 'icp',
  title: 'Ideal Customer Profile',
  systemPromptFragment: ICP_SYSTEM_PROMPT,
  // Order: market conditions (is this market worth fishing in?) → firmographic
  // (the easy/observable layer) → psychographic (beliefs, prior attempts) →
  // behavioral (in-market triggers — most predictive) → best-fit signals
  // (the four behaviors) → qualifying floor (PBAT minimum) → exclusion criteria
  // → operationalization (how the team uses this weekly).
  skeleton: `# Ideal Customer Profile: [Product Name]

## Pre-work (decisions made before drafting)

- **Customer data readiness:** [Do you have enough closed-won and closed-lost data to see a pattern? If not, this is a hypothesis ICP — revisit when you have 10+ best-fit customers to study.]
- **Outliers to exclude:** [Largest, loudest, weirdest customers explicitly removed from the exercise so they don't distort the pattern.]
- **Relationship to positioning:** [The Best-Fit Accounts section in the positioning doc is the 4-5 line summary of THIS document. They must agree.]

## Market conditions check

[Before profiling accounts within a market, validate the market itself is worth pursuing. Score each on a 1-5 scale:]

- **Acute pain:** [How urgent is the problem? Are buyers actively searching for solutions, or is this a nice-to-have they tolerate?]
- **Purchasing power:** [Do these companies have budget allocated for this category, or do they need to create a new line item?]
- **Targetability:** [Can you define a list of these companies through a real signal — industry code, tech stack, hiring pattern, public funding event, attendee list?]
- **Growth trajectory:** [Is the segment expanding, flat, or shrinking? Tailwinds or headwinds?]

[If any condition scores 1-2, name the implication. A 1 on purchasing power means free-tier-only — adjust ICP accordingly. A 1 on targetability means inbound-only — outbound list-building is wasted effort.]

## Firmographic profile

[Observable company-shape attributes. List each with a value range and the rationale for that range — not "100-500 employees because mid-market," but "100-500 employees because below 100 there's no dedicated owner for this function and above 500 the buying motion shifts to enterprise procurement."]

- **Industry / vertical:**
- **Company size (headcount):**
- **Revenue band:**
- **Geography:**
- **Funding stage / business model:**
- **Tech stack signals:**
- **Growth trajectory:**

## Psychographic profile

[What this company believes, how it makes decisions, what it has tried before. The most predictive layer in B2B SaaS — and the one most ICPs skip.]

- **Buying orientation:** [ROI proof vs. strategic vision. Early adopter vs. fast follower vs. laggard.]
- **Prior attempts:** [Has this company already tried to solve this problem and failed? A company that has experienced the pain of a bad solution and is actively searching again is a buyer with urgency, budget precedent, and organizational will. Much easier to close than one being convinced from scratch.]
- **Decision culture:** [Centralized vs. distributed. Top-down vs. bottoms-up. PLG-receptive vs. enterprise-procurement-only.]
- **Stated priorities:** [What initiatives is leadership publicly committing to? Where is this problem on their roadmap?]
- **Risk posture:** [Will they buy from a Series A startup, or do they require established vendors?]

## Behavioral signals (in-market triggers)

[The most predictive and most underused signals. These tell you WHO is in-market right now, not just who fits. Each signal should map to a sourceable data point.]

- **Hiring patterns:** [Are they growing the team that uses the product? Specific roles to track.]
- **Content consumption:** [Are they reading about the problem you solve? Webinar attendance, content downloads, podcast listens, community participation.]
- **Competitive displacement:** [Did they recently churn from a rival? Public RFP signals?]
- **Product usage signals (PLG only):** [If you have a free tier or trial, what usage patterns predict willingness to convert?]
- **Trigger events:** [Funding rounds, leadership changes, regulatory shifts, public commitments, M&A activity. Be specific about which trigger maps to which urgency.]

## Best-fit signals (the four behaviors)

[A best-fit account in the wild displays all four. Use these as field-testable predictions, not aspirations. If a candidate profile fails these in practice, the profile is wrong.]

1. **Buys quickly** — [What does "quickly" mean in your category? Define the cycle length that signals best-fit.]
2. **Doesn't ask for discounts** — [Accepts pricing as priced; doesn't grind on procurement.]
3. **Intuitively understands the value** — [Minimal education burden in discovery. The pitch lands without heavy proof.]
4. **Refers others** — [Becomes a word-of-mouth multiplier within their network or industry.]

## Qualifying floor (PBAT)

[The minimum bar for an account to even enter consideration. If any of these four is missing, disqualify regardless of firmographic fit.]

- **Pain:** [Acute, named, owned by someone with budget exposure.]
- **Budget:** [Allocated or reasonably reachable in this fiscal cycle.]
- **Authority:** [Identifiable champion + path to economic buyer.]
- **Timing:** [Active evaluation window, not a "someday" project.]

## Exclusion criteria (bad-fit patterns)

[The patterns that, when observed, are reasons to disqualify or de-prioritize. Pull from your five worst customers and ask: what did they have in common?]

- **Too early:** [No budget, no process, no champion. Often pre-Series-A or pre-revenue.]
- **Too large:** [Your product is a rounding error in their stack. Procurement cycle exceeds your cash runway.]
- **Wrong buying motion:** [They need enterprise procurement and you're PLG, or vice versa.]
- **Misaligned success metrics:** [They measure something your product doesn't move.]
- **Bad-fit behavioral pattern:** [Slow close, discount-grinding, heavy customization requests, support load disproportionate to revenue, never becomes a reference.]

## Operationalization

[ICP is a weekly decision-making lens, not a one-time document. Spell out how each downstream function uses it.]

- **List-building sources:** [Where the GTM team sources accounts that match this profile — specific tools, lists, signals.]
- **Account scoring:** [Which firmographic + behavioral attributes get weighted, and how. Threshold for "tier 1 best-fit" vs. "tier 2 plausible" vs. "exclude."]
- **Sales qualification:** [The 3-5 disqualifying questions reps ask in discovery to test fit against this ICP.]
- **Marketing prioritization:** [Which campaigns, channels, and content investments target this ICP exclusively vs. broader audience.]
- **Roadmap prioritization:** [Feature requests from best-fit accounts get weighted; requests from outside the ICP get logged but not prioritized.]
- **Review cadence:** [How often is this ICP re-tested against closed-won/lost data? Default: quarterly.]

---

## Validation checks

- [ ] Every firmographic attribute has a rationale, not just a range
- [ ] Psychographic profile names what this company *believes*, not just what it *is*
- [ ] At least 3 behavioral signals map to a sourceable data point
- [ ] Exclusion criteria are explicit and observable in early discovery
- [ ] The 4 best-fit behaviors are testable in the wild — not aspirational
- [ ] Positioning doc's Best-Fit Accounts section is derivable from this doc (and they agree)
- [ ] No buyer-persona-level detail (titles, individual JTBDs, personal objections) leaked into this doc
`,
}

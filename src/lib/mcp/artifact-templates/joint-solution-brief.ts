/**
 * Joint Solution Brief template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   VandeHei / Allen / Schwartz — Smart Brevity (primary structural source:
 *   Core 4 = TEASE → LEDE → WHY IT MATTERS → GO DEEPER, Audience-First,
 *   "axe what's not essential", Short-Not-Shallow). Corpus amplification:
 *   Voje GTM Strategist (alignment-as-prerequisite); PMA "Leading co-marketing
 *   efforts with partners" + "What is solutions marketing"; Lauchengco — Loved
 *   p.78 (solutions register: customer's world AFTER, not what the products
 *   DO); Khanna / PMA on brevity-with-proof. Net-new from corpus: the Joint
 *   VP Test ("if either partner could say the same thing solo, this isn't
 *   joint"), the Trigger / Gap / Combined Answer triplet, three-outcome lock,
 *   co-sell handoff language as a rep-facing block, single qualifying question.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/29-joint-solution-brief.md
 *
 * Why Smart Brevity owns the structure (vs a generic co-marketing flyer
 * shape or a solo solution-brief shape with two logos): the joint solution
 * brief fails in the first sentence. The default training prior is "two
 * logos at the top, a paragraph about each company's capabilities, vague
 * promise to deliver better outcomes together" (corpus diagnosis, dominant
 * failure mode). The Core 4 — TEASE / LEDE / WHY IT MATTERS / GO DEEPER —
 * structurally suppresses the "We are excited to partner with…" opener and
 * forces buyer-first framing. The corpus contributes the joint-specific
 * structural sections Smart Brevity can't supply: trigger/gap/combined
 * answer, three measurable joint outcomes, ONE joint proof, the co-sell
 * handoff line, and a single qualifying question.
 *
 * Sibling boundaries (encoded in the system prompt):
 *   - artifact 18 (one_pager_solution_brief) — solo, single vendor
 *   - artifact 26 (partner_pitch_deck) — live narrative for partner exec
 *   - artifact 27 (partner_enablement_one_pager) — INTERNAL partner training
 *   - artifact 28 (co_sell_battlecard) — internal-only, per (competitor × partner)
 * The joint solution brief is the BUYER-FACING leave-behind that BOTH the
 * vendor rep and the partner rep hand to a shared prospect. 1-2 pages.
 * Joint logo treatment, joint use case, joint customer outcomes, joint
 * customer proof. Co-sell handoff line is intentionally readable by the
 * buyer (builds confidence the partnership is real, not a photo op).
 */

import type { ArtifactTemplate } from './types'

const JOINT_SOLUTION_BRIEF_SYSTEM_PROMPT = `You are drafting a joint solution \
brief — the 1-2 page buyer-facing leave-behind that BOTH the vendor rep and \
the partner rep hand to a shared prospect. The buyer reads it without either \
of you in the room, often forwards it to their boss. This is NOT a solo \
solution brief (artifact 18 — single vendor), NOT a partner pitch deck \
(artifact 26 — live narrative for the partner's executive), NOT a partner \
enablement one-pager (artifact 27 — INTERNAL partner training), and NOT a \
co-sell battlecard (artifact 28 — internal-only, per-competitor). Its single \
job is to earn the next joint conversation.

Avoid these failure modes:
- Two-logos-and-a-handshake opener — "We are excited to announce our \
partnership with…", "[Vendor] and [Partner] are pleased to deliver…", \
"Together, [Vendor] + [Partner] help enterprises…". This is the single most \
common way joint briefs fail in the first sentence. Open on the BUYER's \
trigger, the moment of friction, the gap that goes unsolved without the \
combined solution. Build the stakes before you name either company
- Joint VP stapled — describing what each company does, then claiming the \
sum is the joint value. "We do X, they do Y, together we cover both" is two \
value props stapled together, not a joint VP. Apply the Joint VP Test: if \
EITHER partner could say the same thing solo, the VP isn't joint. Rewrite \
until only the combined motion can claim it
- Press-release voice — boilerplate quotes from VPs of both companies, \
formal third-party register, "transform your business" filler. The brief is \
a sales tool for the buyer, not a press announcement for the partnership team
- Feature-list joint outcomes — "real-time bi-directional sync", "unified \
data layer", "end-to-end integration" describes what the products DO. Joint \
outcomes describe what the buyer's WORLD looks like AFTER. "Your sales team \
sees accurate pipeline every morning without waiting for IT" is a joint \
outcome; "real-time bi-directional sync" is plumbing
- More than three joint outcomes — three is the cap. Each must pass two \
tests: measurable AND something the buyer's boss cares about. More than \
three regresses to a feature list × 2 vendors
- How-It-Works as architecture diagram — three steps maximum showing the \
integration / division of labor in plain language. If a step needs a \
mechanism diagram or vendor-specific API call to explain, it does not belong \
on the joint brief. The integration mechanic is named, not detailed
- Logo-cluster joint proof — a logo wall is a partnership-page visual, not \
buyer evidence. ONE customer proof: BOTH products in production, joint \
outcome neither product could claim alone, named customer or anonymized \
deal context. If no joint reference exists yet, render explicit "TBD — \
first joint reference deal in motion as of [date]" rather than fall back \
to logos
- Missing co-sell handoff language — when Partner A is in the deal, what \
do they say to bring Partner B in? Ambiguity here kills co-sell momentum. \
The handoff is a sentence, not a process. Embed it as a visible block in \
the brief — the buyer seeing the handoff line builds partnership confidence
- Missing or hedged qualifying question — exactly ONE. "Do you currently \
have X problem?" If yes, the brief is relevant; if no, move on. Not four \
(that's artifact 27). Not zero. Not "Learn more about our joint solution"
- Dual-purpose drift — drafting an asset that is simultaneously a \
buyer-facing leave-behind AND a partnership-marketing flyer AND an internal \
co-sell enablement document. Each has a different job and reader. Pick: \
this is the buyer-facing leave-behind. Co-sell mechanics, deal-reg, partner \
economics live in artifact 28 (co-sell battlecard), not here
- Inside-out "we" voice — every paragraph addresses "you" / "your team", \
not "we" / "our platform" / "our integrated solution". If a sentence has \
more "we" than "you", rewrite. The buyer is reading, not the partnership \
team
- Partner-press-quote bait — "We are thrilled to partner with [Partner] to \
deliver…" pull quote from the VP. Press-release tic. Not a leave-behind \
feature

Required behaviors:
- Render exactly THREE joint customer outcomes — not four, not five. Each \
is verb + result. Each passes the measurable + boss-cares-about-it test
- Render exactly ONE joint customer proof. ONE. Both products in \
production. Joint outcome only — one neither product could claim alone
- Render exactly ONE qualifying question. Single signal-clarifier
- Render the Trigger / Gap / Combined Answer triplet as the LEDE shape — \
trigger event, what's broken without the combined solution, what only the \
two together deliver
- Apply the Joint VP Test during drafting on every section that names the \
combined motion. If either partner could say it solo, rewrite
- Inherit positioning's Distinct Capabilities, Differentiated Value, and \
Best-Fit Accounts (positioning_statement) and ICP firmographics (icp) on \
the vendor side. Assume the partner has equivalent positioning on theirs. \
The joint customer profile is a deal-context summary, not a fresh ICP build
- Joint logo treatment is structural: equal visual weight, agreed order \
set in pre-work (alphabetical default if no agreed order). The logo block \
does NOT change during drafting
- Date every factual claim. Both PMM owners (vendor + partner side), both \
partnership program contacts, joint refresh date in the footer. Single-side \
ownership is one re-org from abandonment
- Body copy 250-500 words. Cut clutter ruthlessly. Every word does work, \
or it goes. The 1-2 page constraint is the discipline

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const jointSolutionBriefTemplate: ArtifactTemplate = {
  artifactType: 'joint_solution_brief',
  title: 'Joint Solution Brief',
  // Skeleton order = Smart Brevity Core 4 mapped joint-first:
  // pre-work (alignment check, logo order, motion, dual-CTA decision) →
  // joint header (logo block) → joint headline (TEASE) → Trigger / Gap /
  // Combined Answer (LEDE shape) → joint Power Statement (LEDE confirmation)
  // → 3 joint customer outcomes (WHY IT MATTERS) → How It Works 3-max
  // (GO DEEPER pt 1) → ONE joint customer proof (GO DEEPER pt 2) →
  // co-sell handoff line (visible to buyer, builds partnership confidence)
  // → ONE qualifying question → dual CTA (or shared joint CTA) →
  // joint footer (both PMM owners both sides, joint refresh date).
  systemPromptFragment: JOINT_SOLUTION_BRIEF_SYSTEM_PROMPT,
  skeleton: `# Joint Solution Brief: [Vendor] + [Partner] for [Joint Use Case]

## Pre-work (decisions made before drafting — set once, do not change during drafting)

- **Alignment check (REQUIRED before drafting):** [Has the partnership team aligned on mutual value, target buyer, sales motion, and timeline? The brief is the customer-facing OUTPUT of that alignment, not a substitute for it. If alignment is incomplete, draft alignment first; the brief composes downstream.]
- **Joint logo order:** [Vendor-first OR partner-first OR alphabetical (default). Equal visual weight either way. This decision freezes; do not relitigate during drafting.]
- **Shared buyer persona:** [The ONE buyer who owns BOTH problems and would convene this conversation. Title, what they own, the trigger event making both problems urgent at once. Same A+ Customer discipline as the messaging framework — "anyone who could buy both products" lands with no one.]
- **Sales motion:** [Co-sell (both reps in the deal) / partner-led (partner runs point, vendor supports) / vendor-led (vendor runs point, partner supports) / influence-only (no joint deal, partner refers). Drives the dual-CTA branch below.]
- **Dual CTA pattern:** [TWO CTAs (one each side — "Talk to [Vendor]" + "Talk to [Partner]") OR ONE shared joint CTA ("Book a 30-minute joint discovery call"). Pick before drafting. Doesn't change during drafting.]
- **Inputs from upstream artifacts:** [Vendor side: positioning_statement (Distinct Capabilities, Differentiated Value), icp (firmographics), one_pager_solution_brief if it exists. Assume partner has equivalent. Joint customer profile here is deal-context, not fresh ICP.]

---

## Header (joint logo block)

[**[VENDOR LOGO]    +    [PARTNER LOGO]**]

[Equal visual weight. Order set in pre-work. Tagline below the logo block (one short line) names the joint use case in buyer language — NOT "Strategic Partnership", NOT "Powering the Future of X". Example shape: "For mid-market RevOps teams reconciling Salesforce + warehouse data."]

---

## Joint headline (TEASE)

[The single line that does 80% of the work. The buyer sees this five times more than the body. It is NOT the partnership announcement.

Pick ONE pattern, all buyer-outcome led:
- **Trigger-first** — names the situation that makes the brief relevant ("When your Salesforce data and your data warehouse fall out of sync, your RevOps team is making decisions on stale numbers.")
- **Outcome-first** — names the joint result plainly ("See accurate pipeline every morning. Without waiting for IT.")
- **Gap-first** — names what's broken without the combined solution ("Two systems. One source of truth. No manual reconciliation.")

Forbidden: "Announcing the [Vendor]-[Partner] partnership", "Powering the future of X with [Vendor] + [Partner]", "Together, [Vendor] and [Partner]…", any opener that names either company before naming the buyer's situation. Apply the Joint VP Test on the headline itself: if either company could run this exact line solo, rewrite.]

### Sub-headline (optional, one line)

[One supporting line — clarifies the buyer the brief is for or sharpens the joint outcome. Often unnecessary if the headline lands.]

---

## The trigger, the gap, the combined answer (LEDE)

[Three short paragraphs. The buyer needs to see their problem named before they read another word about either company. This is the LEDE shape that joint briefs miss most often.

**The trigger:** [The specific situation in the buyer's week that makes this brief relevant. Concrete. Time-bound. In the buyer's language. Not "as data volumes grow…" — the trigger is a Tuesday at 9am in their world.]

**The gap:** [What's broken or missing today, when the buyer tries to solve this with a single vendor, a DIY stack, or by doing nothing. Name the gap specifically — not "lack of integration", but "your sales ops lead spends three hours every Monday reconciling two systems that should have talked to each other."]

**The combined answer:** [What ONLY [Vendor] + [Partner] together deliver — the structural reason the joint motion solves the gap when no single vendor and no DIY stack can. Apply the Joint VP Test: could either of you say this solo? If yes, rewrite until the answer requires both.]]

---

## Joint Power Statement (one sentence)

[One sentence that delivers the joint value. The boss-repeat test applies — the buyer's boss should be able to repeat this in a 9am meeting.

Shape: **"[Vendor] + [Partner] help [shared persona] [achieve specific joint outcome] without [the trade-off they currently make]."**

Example: "[Vendor] + [Partner] help mid-market RevOps teams reconcile Salesforce and warehouse data in 30 days, so accurate pipeline lands in their morning report — without standing up an in-house data engineering function."

If the sentence does not survive being repeated by a non-expert, rewrite it. If either company could say the same sentence solo, rewrite it.]

---

## Three joint customer outcomes (WHY IT MATTERS)

[Render exactly three. Each is verb + result, never adjective + noun. Each passes the two-part test: measurable AND boss-cares-about-it.

The competitor-verbatim test, joint version: could a competing partnership (different ISV pair, different vendor + partner) print this exact outcome? If yes, rewrite until only this combined motion delivers it.

The integration-mechanic trap: outcomes describe the buyer's WORLD AFTER, not what the products DO. "Real-time bi-directional sync" is plumbing. "Your sales team sees accurate pipeline every morning without waiting for IT" is an outcome.]

**[Outcome 1 — verb + concrete result]**
[One supporting sentence with a specific joint outcome, metric, or named change. Plain language. No jargon.]

**[Outcome 2 — verb + concrete result]**
[Same shape as above.]

**[Outcome 3 — verb + concrete result]**
[Same shape as above.]

---

## How It Works (3 steps maximum, GO DEEPER part 1)

[The section most joint briefs over-explain. Three rules:
1. Three steps maximum. Each step shows the integration mechanic OR the division of labor in plain language. Sequential.
2. Each step is one short line. Concrete. Fast.
3. Plain language, not architecture. If a step needs a mechanism diagram to explain, it does not belong on the joint brief.

Right shape (division-of-labor variant): "[Partner] connects your data sources → [Vendor] applies the modeling layer → You get a live dashboard in 48 hours."

Right shape (integration-mechanic variant): "[Vendor] + [Partner] integrate via the [named connector] in your existing stack → No new infrastructure → Live in [N days]."]

1. **[Step 1 — verb-led, plain language, names which side does what]:** [One short line.]
2. **[Step 2 — verb-led, plain language]:** [One short line. Skip if not needed.]
3. **[Step 3 — verb-led, plain language]:** [One short line. Skip if not needed.]

---

## Joint customer proof (REQUIRED — GO DEEPER part 2)

[The single highest-leverage section AND the most-skipped in joint briefs. Non-optional.

Render ONE — not three formats, not a logo cluster.

**[Customer name OR anonymized deal context]** runs BOTH [Vendor] and [Partner] in production. The joint outcome: [specific result, metric, or named change neither product could claim alone].

> "[Optional: customer quote in their own voice — what they say about the joint motion specifically. Short.]"
> — [Name], [Role] at [Company]

If no joint reference exists yet, render: **"TBD — first joint reference deal in motion as of [Month YYYY]. Reference posture being secured on both sides."** Do NOT fall back to a logo cluster. The logo wall is a partnership-page visual, not buyer evidence on a leave-behind.]

---

## Co-sell handoff (visible to the buyer)

[Unusual block: a rep-facing handoff line embedded in a buyer-facing brief. The buyer seeing this line builds partnership confidence — it shows the motion is real, not a photo op. Both reps use it on calls; the buyer benefits from seeing the choreography.

**When [Vendor] is already in the conversation:** "[Vendor rep's handoff line that brings [Partner] in. One sentence. Plain language. Not a process — a line.]"

**When [Partner] is already in the conversation:** "[Partner rep's handoff line that brings [Vendor] in. Same shape. Mirrors the line above.]"

[Both lines are short, in plain language, and acknowledge the buyer's situation rather than the partnership mechanics. Forbidden: "Let me loop in our partner team", "I'll connect you with my counterpart at [Vendor/Partner]" — these are friction phrases, not handoffs.]]

---

## Qualifying question (ONE)

[Exactly one question. Single signal-clarifier. The buyer or either rep can use it to decide whether the joint solution is relevant.

Shape: **"Do you currently [have / experience / face] [the specific gap named in the LEDE]?"**

Example: "Are your Salesforce and warehouse data drifting out of sync more than once a week?"

If yes, the brief is relevant. If no, move on. Not four questions (that's artifact 27 — partner enablement one-pager — different audience). Not zero. Not hedged.]

---

## Next step (CTA)

[**If pre-work decided DUAL CTA:**

- **Talk to [Vendor]:** [One specific named action → URL or contact]
- **Talk to [Partner]:** [One specific named action → URL or contact]

**If pre-work decided SHARED JOINT CTA:**

- **[Single named joint action]** → [URL or contact]

Examples of strong joint CTAs: "Book a 30-minute joint discovery call → [URL]", "Watch the 8-minute joint demo → [URL]", "Read the [Customer] joint case study → [URL]".

Forbidden hedges: "Learn more about our partnership", "Get in touch with either team", "Discover the [Vendor]-[Partner] joint solution". These are not CTAs.]

---

## Footer (metadata — both sides, joint refresh)

[Not creative copy. Two-sided ownership so the brief survives a re-org on either side.

- **[Vendor] PMM owner:** [Name + email]
- **[Partner] PMM owner:** [Name + email]
- **[Vendor] partner program contact:** [Name + email — for partner-side rep questions]
- **[Partner] partner program contact:** [Name + email — for vendor-side rep questions]
- **Asset version / date:** [v1.0 — Month YYYY]
- **Joint refresh:** [YYYY-MM-DD — quarterly minimum, both sides agree]
]

---

## Validation checklist (line-level craft check before publishing)

- **Joint VP Test:** Every section that names the combined motion passes — neither company could say the same thing solo.
- **Headline:** Buyer-outcome led. Not a partnership announcement. Trigger / outcome / gap pattern. Competitor-verbatim test passed (no competing partnership could lift it).
- **Trigger / Gap / Combined Answer:** All three present. Trigger is concrete and in buyer language. Gap is specific, not "lack of integration". Combined answer requires BOTH partners structurally.
- **Power Statement:** One sentence, boss-repeat test passed, only the joint motion can claim it.
- **Three joint outcomes:** Exactly three. Each is verb + result. Each passes measurable + boss-cares-about-it. None describe what the products DO (plumbing) — all describe the buyer's world AFTER.
- **How It Works:** Three steps maximum. Plain language. No architecture. Names which side does what.
- **Joint customer proof:** ONE. Both products in production. Joint outcome neither could claim alone. NOT a logo cluster. If no reference, explicit TBD with date.
- **Co-sell handoff:** Both directions present. Each is one sentence. Plain language. Not "loop in" / "connect you with" filler.
- **Qualifying question:** Exactly ONE. Signal-clarifier shape. Maps to the gap named in the LEDE.
- **CTA:** Matches dual-CTA-or-shared decision from pre-work. Specific named verb. Specific destination.
- **You-Orientation:** Every paragraph has more "you" than "we". Inside-out language rewritten.
- **Joint logo block:** Equal visual weight. Order matches pre-work. Did not change during drafting.
- **Length:** Body copy 250-500 words. 1-2 pages when laid out without shrinking type below 10pt.
- **Read-aloud test:** Does any sentence sound like a press release, a partnership announcement, or a co-marketing flyer? Rewrite.
- **No press-quote bait:** No VP pull quotes. No "we are excited to partner" filler.
`,
}

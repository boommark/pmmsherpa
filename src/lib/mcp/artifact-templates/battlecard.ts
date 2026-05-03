/**
 * Battlecard template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Stratton — Punchy (Competitive Messaging Audit, VBF Rule applied
 *   competitively, BBQ-Talk register for rep talk tracks). Corpus
 *   amplification: PMA practitioner battlecard anatomy (per-competitor
 *   sections, trap-setting questions, do-not-say list, refresh cadence,
 *   PDF-vs-dynamic-platform tradeoff).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/16-battlecard.md
 *
 * Why this template is wedge-first instead of feature-comparison-first:
 * a battlecard whose lead section is a checkbox table or a competitor
 * weakness list trains reps to take down the competitor instead of selling
 * our value. The wedge — buyer transformation + structural reason this
 * competitor can't match it — is the only durable section. Competitor pitch,
 * strengths, and weaknesses appear after the wedge so the rep reads them as
 * context for the wedge, not as the headline. Trap-setting questions are
 * separated from objection handling because they're proactive (asked of the
 * prospect to seed doubt) rather than reactive. The artifact is INTERNAL-ONLY
 * but designed to be leak-tolerant: no mockery, no unverifiable claims, no
 * internal customer names with revenue figures.
 */

import type { ArtifactTemplate } from './types'

const BATTLECARD_SYSTEM_PROMPT = `You are drafting a competitive battlecard — \
a single-competitor, INTERNAL-ONLY sales-arming document. It is read by reps \
before a competitive call, in deal review, and mid-cycle when the prospect \
names this competitor for the first time. It is NOT a buyer-facing comparison \
matrix and it is NOT a partner co-sell document.

CRITICAL — assume this document will leak. Reps share decks, prospects forward \
files, people change jobs. Do not write any line you would be embarrassed to \
see quoted in a competitor blog post or read back to you by the buyer. No \
mockery, no unverifiable claims, no internal customer names paired with \
revenue figures, no roadmap speculation phrased as fact. Stick to verifiable, \
defensible language.

Avoid these failure modes:
- Feature-comparison soup — checkbox tables of who-has-what. Invites the buyer \
to score you on criteria you didn't choose. The wedge is structural, not featural
- Attacking the competitor instead of differentiating us. Reps should leave the \
call with the buyer excited about us, not just skeptical about them. Wedges \
built on competitor weakness collapse when they fix it; wedges built on \
differentiated value hold
- Marketing-register talk track. Trap-setting questions and rep talk tracks \
must be in the rep's actual spoken register. A line that reads like a press \
release is unusable on a live call
- Stale data treated as fresh. Pricing, feature claims, and roadmap notes for \
the competitor go stale invisibly. Date every factual claim. If the source is \
older than 90 days, mark it for re-verification
- Leakable language — see CRITICAL note above. Calibrate every line as if a \
reporter or the competitor's CEO will read it
- More than 3 trap-setting questions — reps can't memorize a long list. Pick \
the 3 sharpest
- Generic 'how we win' lines that any vendor could copy ('we're more flexible', \
'better support', 'easier to use'). The wedge must name the structural reason \
THIS competitor specifically cannot match the value, not a universal vendor virtue
- Logo-wall customer proof. One specific deal with full deal context — industry, \
size, what they switched from, why they chose us, what the outcome was — beats \
five logos. Reps quote the deal narrative, not the logo

Required behaviors:
- Lead 'How we win' with the buyer's transformation, then name the structural \
reason this competitor can't deliver it, then the capability that proves it. \
Value → why-they-can't → feature, in that order
- Pull the competitor's pitch verbatim from their homepage / latest investor \
update / G2 page. Reps need to recognize the actual language on a call, not a \
paraphrase
- If win/loss data exists for this competitor, ground 'How we win' and customer \
proof in actual deal patterns rather than internal hypothesis
- Set the format decision (PDF vs. dynamic platform) and refresh cadence in \
the metadata block. A battlecard with no refresh plan is already going stale

One battlecard, one competitor. Multi-competitor coverage is a comparison \
matrix, not this. Fit on one page or one clean screen — the constraint is the \
discipline.

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const battlecardTemplate: ArtifactTemplate = {
  artifactType: 'battlecard',
  title: 'Battlecard',
  systemPromptFragment: BATTLECARD_SYSTEM_PROMPT,
  // Skeleton order is wedge-first by design: header → wedge ("how we win")
  // → talk track → trap-setting questions → competitor pitch / strengths /
  // weaknesses (as context, not as the headline) → objection handling →
  // do-not-say → customer proof → metadata. Reps read top-down and arrive at
  // our value before they read about the competitor.
  skeleton: `# Battlecard: [Our Product] vs. [Competitor Name]

> **INTERNAL ONLY.** Do not share with prospects, partners, or external audiences. Calibrate every line as if it will leak.

**Owner:** [PMM owner name + email]
**Last reviewed:** [YYYY-MM-DD]
**Next review:** [YYYY-MM-DD — quarterly minimum, sooner on trigger events]
**Format:** [PDF / Klue / Crayon / Battlecard.io / Notion — and the refresh process for that format]
**Deal context this card is built for:** [The specific deal type where we encounter this competitor most — e.g., "mid-market RevOps replacing legacy CRM-attached competitive tool, 50-500 seats, 6-12 month evaluation."]

---

## How we win (the wedge)

[ONE paragraph — three sentences max. Open with the buyer's transformation: what does the buyer get with us that they don't get with this competitor? Then name the **structural** reason this competitor can't match it (architectural, business-model, GTM-model — something they can't fix in two quarters by shipping a feature). End with the capability or proof that demonstrates the wedge. This is the only sentence the rep memorizes; everything else supports it. Generic vendor virtues ("more flexible", "better support") fail this section.]

---

## 30-second talk track (when the competitor comes up)

[Three lines, in the rep's actual spoken register — read each aloud and confirm it sounds like something a person would say on a Zoom call, not a press release.

1. **Acknowledge:** [One sentence acknowledging the competitor as a credible option for a specific use case. Reps lose buyer trust when they pretend a known competitor is irrelevant.]
2. **Pivot to the wedge:** [One sentence connecting the buyer's stated need to our wedge.]
3. **Invite the next step:** [One sentence — a question or a proof-point offer that moves the conversation forward, not a close.]]

---

## Trap-setting questions (proactive — ask the prospect early)

[Exactly 3 questions the rep asks the *prospect* — before the competitor is named — to surface doubt about the competitor's approach. The prospect answers their own objection. Format each as the literal question a rep would speak.

1. [Question that exposes a constraint of the competitor's architecture or model — e.g., "How does your team handle X when Y happens, given how the platform is structured?"]
2. [Question that exposes a hidden cost or implementation friction.]
3. [Question that exposes the gap the competitor's pricing or packaging creates.]]

---

## Their pitch (verbatim — last verified [YYYY-MM-DD])

[The competitor's own positioning, copied verbatim from their homepage hero / latest fundraise announcement / G2 category page. Source URL + date. Reps must recognize this language when they hear it on a call. Do not paraphrase.]

## Their genuine strengths (and how to defend)

[Three real strengths — not faint-praise. For each, one line on how we defend the deal when this strength surfaces. Reps who pretend the competitor has no strengths get blindsided; reps who know exactly where the competitor is strong handle those moments.

- **Strength 1:** [What it is.] **Defense:** [How we handle it.]
- **Strength 2:** [What it is.] **Defense:** [How we handle it.]
- **Strength 3:** [What it is.] **Defense:** [How we handle it.]]

## Their weaknesses (factual, dated)

[Two to three weaknesses we can verify. Each with a date and a source (G2 review excerpt, public pricing page, public roadmap, customer interview). If the source is older than 90 days, mark for re-verification. Avoid speculation phrased as fact.

- **Weakness 1:** [Specific factual gap.] *Source: [URL or interview ref], [date].*
- **Weakness 2:** [Specific factual gap.] *Source: [URL or interview ref], [date].*
- **Weakness 3 (optional):** [Specific factual gap.] *Source: [URL or interview ref], [date].*]

---

## Objection handling (reactive — when the prospect repeats the competitor's pitch)

[Three to five common objections the prospect will voice when they're considering or have used this competitor. For each, the response is one or two lines, in spoken register. Inherit recurring patterns from the win/loss insights artifact if available.

- **"[Objection in the prospect's words]"** — [Response: acknowledge the concern, reframe to our wedge, offer the proof point.]
- **"[Objection in the prospect's words]"** — [Response.]
- **"[Objection in the prospect's words]"** — [Response.]]

---

## Do-not-say list

[Four to six concrete instructions on what reps MUST NOT say about this competitor. Specific, not generic. "Don't disparage" is useless; "Don't call them legacy" is usable. These are the lines that, if leaked or quoted back, would damage the deal or the brand.

- [Don't say X.]
- [Don't bring up Y.]
- [Don't reference Z internal claim about them.]
- [Don't compare on [specific dimension where the comparison flatters them or invites a feature war].]
- [Avoid [specific tone or framing] — reads as defensive.]]

---

## Customer proof (one deal, full context)

[ONE specific win against this competitor — not a logo wall. Include: industry + company size, what they switched from (or evaluated against), why they chose us in this competitor's words, what the measurable outcome was. Anonymize to industry + size unless the customer has explicitly approved competitive use of their name. Reps will quote this narrative on calls; specificity is the whole value.

- **Deal:** [Industry, ~headcount, geography.]
- **Situation:** [What they had / what they evaluated.]
- **Decision driver:** [Their words on why they chose us over the competitor.]
- **Outcome:** [Measurable result — metric, time-to-value, expansion.]
- **Reference posture:** [Approved for sales reference / approved for competitive use only / no public reference — pick one.]]

---

## Refresh triggers (re-verify this card when any of these happen)

- [Competitor publishes new pricing page or changes packaging.]
- [Major G2 / Gartner / Forrester report drops covering this competitor.]
- [Acquisition, leadership change, or significant fundraise.]
- [Competitor ships a major feature that touches our wedge.]
- [Win/loss data shows shift in deal-loss reasons against this competitor.]
- [More than 90 days since last review, regardless of triggers.]
`,
}

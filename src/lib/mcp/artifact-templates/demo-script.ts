/**
 * Demo Script template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Efti — Product Demos that Sell (seven sins, Demo Discovery, Big Bang
 *   Opening, Macro-to-Micro, Three-Point Rule, Rules of Engagement). Boundary:
 *   Dunford — Sales Pitch (the demo lives at Step 5/6 of the 8-step
 *   storyboard — Differentiated Value / Proof — not the opening of the
 *   pitch). Corpus amplification: Tell-Show-Tell per-beat scaffold, the
 *   storytelling formula (real-world problem → lookalike social proof → show
 *   how they solved it), audience-specific callouts.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/20-demo-script.md
 *
 * Why this template is act-by-scene with Tell/Show/Callout instead of a
 * feature checklist: a demo script that lists features in order trains reps
 * to give a feature tour, which is the failure mode the book centres on. The
 * structure here forces three acts (Three-Point Rule), Macro→Workflow→Feature
 * within each act, and Tell-Show-Tell per scene so the model cannot draft a
 * feature-led beat without violating the skeleton. Same structural-enforcement
 * pattern as the messaging-framework's V/B/F nesting and three-benefit lock.
 * The demo Close hands back to the pitch's Ask rather than ending on "any
 * questions?" — closing the demo on a passive question is Sin #7.
 */

import type { ArtifactTemplate } from './types'

const DEMO_SCRIPT_SYSTEM_PROMPT = `You are drafting a demo script — the \
narrated walk-through a seller or sales engineer reads (not verbatim, but as \
the structural spine) when running a live or recorded product demo. The \
audience is the champion plus technical evaluator and sometimes the economic \
buyer. The demo lives INSIDE a larger sales pitch, at the Differentiated \
Value / Proof step — not at the opening. You are not drafting the whole \
pitch. You are drafting the moment where the narrative stops being words and \
becomes evidence.

The demo's job: make the buyer's future-state real and specifically real for \
THEM. Buyers don't buy products; they buy a version of the future where their \
problem is gone. Every scene either makes that future visible, specific, and \
credible — or it's noise and should be cut.

Avoid these failure modes:
- Feature dump — showing everything the product does. Completeness theater \
buries the best capabilities and exhausts the buyer. Removing features from a \
demo INCREASES persuasiveness
- Features-first opening — leading with "let me show you what we built" \
instead of "here's the problem you told me you have." The Big Bang Opening \
names the pain first, shows the painful before-state, then reveals the \
solution
- No narrative spine — a feature tour with no story the buyer can place \
themselves inside. Each act must serve one of the three core claims; cut the rest
- No business-outcome callout — showing something powerful and then clicking \
to the next screen without naming what just happened in the buyer's metric. \
Tell-Show-Tell exists because reps lose deals at the third "tell"
- Same demo for every audience — the CFO, the ops manager, and the technical \
evaluator care about completely different things. Same scenes are fine; same \
verbal callouts are not
- Not real for THIS buyer — generic demo data, generic industry language. \
Pull the buyer's industry, terminology, and metrics from Discovery into the \
demo environment
- Passive close — ending on "any questions?" hands control to silence. The \
demo Close hands back to the pitch's Ask (next meeting, expand the room, \
proof-of-concept scope) — never on a passive question
- Saving the best for last — opening on the login screen or a dashboard tour. \
The Big Bang Opening is the most impressive, most relevant moment of the \
product, in the first 60-90 seconds. Lead with the lean-forward moment

Required behaviors:
- Render exactly three claim-acts (the Three-Point Rule). Three is what fits \
in working memory. Four becomes inventory; two feels incomplete
- Inside each scene, render Tell → Show → Callout in that order. Tell sets up \
the pain; Show is the click path; the second Tell (the callout) names the \
business outcome the buyer cares about
- Pull Discovery answers into the script. The five Discovery questions \
(problem, what they tried, success state, decision-makers, timeline) are the \
script's source material — not the product feature list
- Use the buyer's words and metrics, not marketing register. If the buyer \
said "we lose 3 days a month chasing exceptions," the callout uses "3 days a \
month," not "operational efficiency"
- For lookalike proof in the Big Bang Opening, cite ONE customer who matches \
the prospect's industry + size + role + problem. Specificity beats logo walls
- Time-box each act. Demo discipline is structural, not aspirational

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const demoScriptTemplate: ArtifactTemplate = {
  artifactType: 'demo_script',
  title: 'Demo Script',
  // Skeleton order is act-by-scene by design: pre-work (Discovery + audience
  // + Feature/Need Matrix locks the three claims) → Act 1 Big Bang Opening
  // (Pain / Before / Reveal) → Acts 2-4 (one per claim, each with Macro /
  // Workflow / Feature scenes, each scene with Tell-Show-Callout) → Demo
  // Close (hands back to the pitch's Ask) → Rules of Engagement → Time
  // budget. The Three-Point Rule is enforced structurally; Tell-Show-Callout
  // is enforced per scene; the buyer's business outcome is enforced per beat.
  systemPromptFragment: DEMO_SCRIPT_SYSTEM_PROMPT,
  skeleton: `# Demo Script: [Product Name] for [Prospect Account]

> **Read by:** AE / SE / PMM running the live or recorded demo. This is the structural spine, not a verbatim teleprompter. The demo lives inside the larger sales pitch at the Differentiated Value / Proof step — it is the moment evidence replaces words.

**Owner:** [PMM owner name + email]
**Demo length target:** [20 minutes default; cap at 30. Cut, don't add.]
**Last reviewed:** [YYYY-MM-DD]
**Pitch artifacts this script slots into:** [Sales pitch deck v[X], Talk track v[Y]]

---

## Pre-work (lock these before drafting any scene)

### Discovery summary (the five answers from the qualification call)
- **The problem:** [In the buyer's words. "We lose 3 days a month chasing AP exceptions" — not "operational inefficiency."]
- **What they've tried:** [Tools, workarounds, internal builds. Why each one fell short — also in their words.]
- **What success looks like:** [Their metric, their timeframe. "Close-the-books in 5 days, not 9."]
- **Who else is in the decision:** [Champion, economic buyer, technical evaluator, blockers — name each role and their primary concern.]
- **Timeline / urgency:** [What event is forcing the decision. No urgency = no demo.]

### Audience map (who's in the room, what each cares about)
[For each role attending, one line on the metric / outcome / objection that lands for THEM. Same scenes, different verbal callouts per role.

- **Champion ([Title]):** [What lands.]
- **Economic buyer ([Title], if attending):** [What lands.]
- **Technical evaluator ([Title], if attending):** [What lands.]
- **Other ([Title]):** [What lands.]]

### The three claims (Three-Point Rule)
[Exactly three reasons this prospect should buy — the spine of the demo. Each claim is one sentence in outcome language, not capability language. Everything that doesn't support one of these three gets cut.

1. **Claim 1:** [Outcome the buyer gets — phrased in their metric.]
2. **Claim 2:** [Outcome the buyer gets.]
3. **Claim 3:** [Outcome the buyer gets.]]

### Feature/Need Matrix (cut list)
[For each Discovery need, the ONE feature you'll show. Anything not in this matrix does not appear in the demo.

| Need (from Discovery) | Feature to show | Maps to claim |
|---|---|---|
| [Stated need 1] | [Feature 1] | [1 / 2 / 3] |
| [Stated need 2] | [Feature 2] | [1 / 2 / 3] |
| [Stated need 3] | [Feature 3] | [1 / 2 / 3] |

**Cut list — features deliberately NOT shown today:** [Bullet 3-5 capabilities you could demo but won't, with one line each on why they're out of scope for this prospect. Forces explicit removal.]]

---

## Act 1 — Big Bang Opening

> **Target time:** 2-3 minutes. The first 60-90 seconds set the emotional frame for everything that follows. Open with the most impressive, most relevant moment — the lean-forward moment. Do not save the best for last.

### Scene 1.1 — Name the pain
- **Tell (setup):** [Restate the problem the prospect named in Discovery, in their exact words. "You told me you lose 3 days a month chasing AP exceptions and your team is burning out on it."]
- **Show (what to click):** [Nothing yet, or a single screen showing the painful current state — a queue, an inbox, a spreadsheet. Make the old way visible.]
- **Callout (the second Tell):** [The line that lands the pain in their metric. "Three days a month. Across your AP team of 8, that's 24 person-days a quarter pulled away from analysis."]

### Scene 1.2 — The lookalike proof
- **Tell (setup):** [One sentence connecting this prospect to a customer who matched their industry, size, and problem. "[Customer] is a [same industry], [same size], with the same exception-rate problem you described."]
- **Show (what to click):** [A specific moment from that customer's environment — a metric, a workflow output, an outcome screen. Specific beats logo walls.]
- **Callout:** [What changed for that customer in their words. "Their AP lead, [name or role], told us they cut exception-handling from 3 days to 90 minutes a month."]

### Scene 1.3 — The reveal
- **Tell (setup):** [Bridge from the lookalike to this prospect. "Here's the moment in [Product] that made that possible — and it's the same moment we'd configure for you."]
- **Show (what to click):** [The single most impressive, most relevant action in the product — the visceral "yes" reaction. NOT a feature list, NOT a dashboard tour. ONE moment that eliminates the pain instantly. This is the lean-forward beat.]
- **Callout:** [Name what just happened in the buyer's metric, then state the three claims you'll prove. "What you just saw is [outcome]. Today I'm going to show you three things: [Claim 1], [Claim 2], [Claim 3]."]

---

## Act 2 — [Claim 1 in outcome language]

> **Target time:** 5 minutes. Macro → Workflow → Feature. Each scene is Tell-Show-Callout. Audience-specific callouts noted per scene.

### Scene 2.1 — Macro (the world this claim creates)
- **Tell (setup):** [What does the buyer's week look like once Claim 1 is delivered? One sentence framed as life-with-the-solution.]
- **Show (what to click):** [The high-level view — the route to the result in the fewest possible clicks. Senior stakeholders often only need this.]
- **Callout:** [What just changed in their world.]
- **Audience callout variants:**
  - *For the champion:* [Their version of the value.]
  - *For the economic buyer:* [The financial / risk version.]
  - *For the technical evaluator:* [The architectural / integration version.]

### Scene 2.2 — Workflow (how it actually works)
- **Tell (setup):** [The step-by-step the buyer's team would follow.]
- **Show (what to click):** [The core workflow, end to end, with the prospect's own data / industry terminology / scenario from Discovery seeded in.]
- **Callout:** [The friction this removes — in their metric, with a number from Discovery.]
- **Audience callout variants:** [As above, one line each per role attending.]

### Scene 2.3 — Feature (the proof beat)
- **Tell (setup):** [The specific capability that makes the workflow possible — the answer to "how does it actually do that?"]
- **Show (what to click):** [The feature in action. Singular. Not a feature tour.]
- **Callout:** [Why this capability is hard for alternatives to match — the structural reason, not "we're better." Then check in: "Does that match what you were looking for?"]

---

## Act 3 — [Claim 2 in outcome language]

> **Target time:** 5 minutes. Same Macro → Workflow → Feature shape, same Tell-Show-Callout per scene.

### Scene 3.1 — Macro
- **Tell:** [Life-with-the-solution for Claim 2.]
- **Show:** [The macro view — fewest clicks to the result.]
- **Callout:** [What changed in their world.]
- **Audience callout variants:** [Per role.]

### Scene 3.2 — Workflow
- **Tell:** [The step-by-step.]
- **Show:** [End-to-end workflow with their data / scenario.]
- **Callout:** [The friction removed, in their metric.]
- **Audience callout variants:** [Per role.]

### Scene 3.3 — Feature
- **Tell:** [The capability.]
- **Show:** [The feature in action — singular.]
- **Callout:** [Why this is hard for alternatives to match.]

---

## Act 4 — [Claim 3 in outcome language]

> **Target time:** 5 minutes. Same shape.

### Scene 4.1 — Macro
- **Tell:** [Life-with-the-solution for Claim 3.]
- **Show:** [Macro view.]
- **Callout:** [What changed.]
- **Audience callout variants:** [Per role.]

### Scene 4.2 — Workflow
- **Tell:** [Step-by-step.]
- **Show:** [End-to-end with their scenario.]
- **Callout:** [Friction removed in their metric.]
- **Audience callout variants:** [Per role.]

### Scene 4.3 — Feature
- **Tell:** [The capability.]
- **Show:** [Feature in action.]
- **Callout:** [Why hard for alternatives to match.]

---

## Demo Close — confirm the three claims, hand back to the pitch's Ask

> **Target time:** 2-3 minutes. **Do not end on "any questions?"** That's a passive close. The demo hands the conversation back to the pitch's Ask.

- **Confirm the three claims** (the closing "Tell"): ["We just walked through three things. [Claim 1] — you saw [feature/scene]. [Claim 2] — you saw [feature/scene]. [Claim 3] — you saw [feature/scene]. Those are the three reasons teams like yours pick us."]
- **Resonance check (one calibrated question, not a passive one):** ["Of those three, which one would matter most for your team in the first 90 days?" Their answer reveals their real priority and seeds the proof-of-concept scope.]
- **Hand to the Ask:** [The specific next step from the pitch — proposal to expand the room, proof-of-concept with defined scope, intro to the economic buyer, security review kickoff. NOT "let me know if you have questions." Match the pitch deck's Step 8.]

---

## Rules of engagement (operational, for the rep)

- Ask permission before each major transition: "Is it OK if I show you how X works now?"
- Pause and check in after each act: "Does that match what you were looking for?"
- Handle confusion immediately — stop, address it, do not barrel forward
- Make silence comfortable — let the prospect react before explaining more
- Never navigate through setup screens, loading screens, or unrelated features
- If a buyer asks about a feature on the cut list, answer briefly and steer back: "Yes, we do that — happy to cover it in a follow-up. For today, I want to make sure we land the three things that matter most for [their stated outcome]."
- If you're running long, cut Act 4's Workflow scene first; protect the Big Bang Opening and the Demo Close

---

## Time budget (sums to demo length target above)

| Section | Target minutes | Notes |
|---|---|---|
| Big Bang Opening (Act 1) | 2-3 | Protected — never cut |
| Act 2 (Claim 1) | 5 | Cut Workflow first if over time |
| Act 3 (Claim 2) | 5 | Cut Workflow first if over time |
| Act 4 (Claim 3) | 5 | Cut Workflow first if over time |
| Demo Close | 2-3 | Protected — never cut |
| Buffer for questions / confusion | 0-3 | Earned, not assumed |
`,
}

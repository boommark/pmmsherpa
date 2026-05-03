/**
 * Discovery Question Set template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Stanier — The Coaching Habit (seven essential questions, ask one at a
 *   time, AWE probe, no rhetorical questions). Voss — Never Split the
 *   Difference (calibrated questions: "how" and "what" not "why";
 *   mirroring; labeling; get to "No"). Weinberg — New Sales Simplified
 *   (B2B pain qualification, Power Statement frame, Not-So-Sweet-16
 *   failure modes including show-up-and-throw-up).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/23-discovery-question-set.md
 *
 * Why this template renders a MENU of questions, not a script: a discovery
 * call is not a recital. The rep pulls 8–12 questions from this 30-question
 * bank in conversation order, probing with "and what else?" between answers.
 * This is the central distinction from talk_track (artifact 21), which
 * sequences a pitch. The template is also distinct from buyer_persona (05) —
 * persona describes the buyer; this artifact is how to LEARN about a specific
 * buyer in front of you. ICP (04) and persona (05) are inherited inputs, not
 * duplicated here.
 *
 * Authority hierarchy: Stanier sets the discipline (one question, listen,
 * probe). Voss sets the phrasing (calibrated, no "why"). Weinberg sets the
 * qualification spine (pain, sponsor, urgency, fit) and the failure-mode
 * catalog. On direct conflict — Weinberg's BANT-adjacent qualification vs.
 * Voss's no-interrogation — Weinberg wins on WHAT to qualify and Voss wins
 * on HOW to phrase. The template uses MEDDIC-style content with calibrated
 * phrasing, without naming any acronym.
 */

import type { ArtifactTemplate } from './types'

const DISCOVERY_QUESTION_SET_SYSTEM_PROMPT = `You are drafting a discovery \
question set — the bank of calibrated questions a rep pulls from during a \
buyer call. This is a MENU organized by category, not a script. The rep \
picks 8–12 questions per call based on what the buyer surfaces; they do \
not read all 30 in sequence. The output is INTERNAL — for reps and \
managers — but it shapes every first call the team runs.

Avoid these failure modes:
- Show-up-and-throw-up — feature-pitching disguised as questions. "Have you \
considered that our automation engine could…" is a pitch with a question mark, \
not a discovery question. Real discovery questions do not contain the answer.
- Leading questions — "You'd agree manual processes are a problem, right?" \
You're not learning; you're farming agreement that produces false confidence.
- "Why" as opener — "why are you doing X?" reads as judgment and triggers \
defense. Open with "how" or "what" only. "What led you to handle it this way?" \
gets the same information without the defensiveness.
- BANT-style interrogation — Budget / Authority / Need / Timeline run as a \
checklist makes the prospect feel processed, not heard. The same information \
shows up in calibrated form: "What does success look like in numbers?", \
"Who has to sign off?", "What's the trigger that made this a priority now?"
- Rapid-fire questioning — stacking multiple questions in one breath. Ask one, \
listen fully, probe with "and what else?", then advance.
- Skipping the AWE probe — the second answer is almost always richer than the \
first. The probe-and-camp instinct (staying in the problem one beat longer than \
feels comfortable) is what separates discovery that builds trust from discovery \
that just collects data.
- No frame before the questions — diving in cold. The buyer has to know why \
this conversation matters and what specific wall the rep helps with. The Frame \
& Setup section is delivered (not asked) before the menu opens.
- No disqualification willingness — pursuing a prospect who has tried nothing \
and feels no pain. If pain qualification fails, the call ends. Disqualification \
is a feature.

Phrasing rules:
- Every question must begin with "how", "what", "walk me through", or \
"tell me about". No "why". No "do you" / "have you" / "can you" (closed yes/no).
- Questions are open-ended. Closed yes/no questions belong in objection \
handling, not discovery.
- Questions are short — one clause. If a question needs three commas, it's \
two questions and the rep should pick one.

Conversational moves to weave between questions (these are NOT additional \
questions — they are how the rep listens):
- Mirroring — repeat the prospect's last 3 words as a question, then silence. \
Surfaces the layer beneath the polite answer.
- Labeling — "It seems like…", "It sounds like…" — name the emotion you hear. \
Disarms defensiveness, surfaces what's really going on.
- Get to "No" — frame questions so it's safe to say no. "Is now a bad time?" \
outperforms "Do you have a few minutes?".

If a buyer_persona (artifact 05) and ICP (artifact 04) exist for this product, \
inherit them: customize the pain probes to the persona's specific pains, and \
calibrate disqualification signals against the ICP. If they don't exist, \
prompt the user to draft a thumbnail persona before drafting questions — \
otherwise the question set will be ungrounded.

Reference frameworks implicitly. Do not name-drop authors, MEDDIC, PACTT, \
BANT, or any acronym in the output.`

export const discoveryQuestionSetTemplate: ArtifactTemplate = {
  artifactType: 'discovery_question_set',
  title: 'Discovery Question Set',
  systemPromptFragment: DISCOVERY_QUESTION_SET_SYSTEM_PROMPT,
  // Skeleton is a MENU of 8 categories. Frame & Setup is delivered (not
  // asked). Opener → Pain → Aspiration → Buying Process → Competitive
  // Context → Qualification → Close. Conversational Moves and Disqualifying
  // Signals are sidebars, not categories.
  skeleton: `# Discovery Question Set: [Product Name]

## How to use this document

This is a menu of calibrated questions, organized by category. On any given call, pull 8–12 questions in conversation order based on what the buyer surfaces. Do NOT read all of them sequentially — that's an interrogation, not a conversation.

Between every substantive answer, probe with "and what else?" before advancing. The second answer is almost always richer than the first.

**Inherited inputs:** [If a Buyer Persona and ICP exist for [Product], list them here and customize pain and qualification questions to that persona.]

---

## Frame & Setup (delivered, not asked)

Before any question, the rep delivers a 60–90 second frame. This is what the buyer needs to hear to know why to engage:

- **Who we work with:** [The specific persona / ICP segment — "ops leaders at Series B SaaS companies", not "growing companies".]
- **The wall they hit:** [The one specific pain pattern that triggers buying — "the wall around manual reconciliation past 200 transactions a day", not "operational inefficiency".]
- **What we help them do:** [One sentence, plain language. The cool new thing the buyer can do, be, or feel — not a feature list.]
- **The frame question:** "I want to understand if that's what you're facing, or if it's something different. [open question]"

The frame earns the right to ask. Without it, every question feels like an interrogation.

---

## 1. Opener questions

Set the conversation in motion. Open wide so the buyer brings the problem to you.

- "What's on your mind coming into this call?"
- "Walk me through what made you take this meeting."
- "Tell me about the role — what do you own, and what does a hard week look like?"

*Probe between answers: "And what else?" / Mirror the last 3 words.*

---

## 2. Pain — current state and what's broken

The goal is the real problem, not the presenting symptom. Open wide, then narrow. The single highest-signal question in this section is "what have you tried?"

- "Walk me through how [the relevant process] works today, end to end."
- "Where does that process break down most often?"
- "What's the real challenge here for you, underneath all that?"
- "What have you tried to fix it? What happened?"
- "What's the cost of leaving this the way it is for another quarter?"
- "How does this show up day to day — what does it cost you in time, in headcount, in stress?"

*Disqualifying signal: if the buyer has tried nothing and can't name a cost, the pain isn't real enough to buy against. Probe one more time — if still nothing, this is not a deal.*

---

## 3. Aspiration — what good looks like

The emotional fuel for the deal. Cuts past pain into what success looks and feels like — and surfaces whether the buyer can articulate value to others (a consensus signal).

- "If this was working the way you wanted it to six months from now, what would be different?"
- "How would you know it was working? What would you measure?"
- "Who else would notice? What would change for them?"
- "What's the version of this that would make you look like a hero?"

*Disqualifying signal: if the buyer can't answer "who else would notice", they don't have internal consensus. That's a flag, not a close signal.*

---

## 4. Buying process — sponsor, consensus, kill criteria

The failure mode here is BANT-style interrogation. Better framing: ask about the *process* and the *blockers*, not the checklist items.

- "How have you bought tools like this before? What made that smooth or painful?"
- "Who else is going to have opinions about this? What do they care about that might be different from what you care about?"
- "What would have to be true for this to get approved?"
- "What would kill this deal? What's the most likely reason this doesn't happen?"
- "Where does this rank against the other priorities your team is investing in this quarter?"

*The "what would kill this?" question is the one most reps fear. It's also the one that tells you whether you're in a real deal or a polite exploration.*

---

## 5. Competitive context

Don't ask "who else are you looking at?" — you'll get a list of names and nothing useful. Ask about the *bar* and where it came from.

- "What does your current solution do well that you'd want to keep?"
- "What's the bar you're using to evaluate options? Where did that bar come from?"
- "Have you seen anything in your evaluation so far that impressed you? What made it stand out?"
- "What concerns came up in your last vendor decision that you want to avoid this time?"

*The "where did the bar come from?" question is the one that surfaces who actually owns the decision criteria — sometimes it's a board member, sometimes a competitor's benchmark report. Knowing the source tells you who you're really selling to.*

---

## 6. Qualification — metrics, urgency, fit

The categories any rigorous qualification framework agrees on: metrics, economic buyer, decision criteria, decision process, identified pain, urgency trigger. Phrased calibrated, not interrogated.

- "What does success look like in numbers? Which metric moves if this works?"
- "Who's going to sponsor this internally? Have you talked to them yet?"
- "What's the trigger that made this a priority now, versus six months ago?"
- "What happens to your team's goals if you don't solve this by end of [quarter / year]?"
- "What's the budget conversation you'll need to have, and who do you need to have it with?"

*The trigger question separates genuine urgency from "we're exploring". If the answer is "honestly, not much would happen," it's a long sales cycle with low conviction.*

---

## 7. Close — anchor learning, advance the sale

End deliberately. Stanier's Learning Question surfaces what landed for the buyer; the advance commitment turns insight into a next step.

- "What was most useful in our conversation today?"
- "What did we not cover that you wish we had?"
- "Based on what you've heard, what would be the right next step from your side?"

*Never end with "Does that make sense?" or "Any questions?" — those are closed and produce nothing. The Learning Question is open and gives the buyer ownership of the recall.*

---

## Conversational moves (use throughout, not as questions)

These are how the rep listens and keeps the buyer talking. They go between every substantive question.

- **Mirror.** Repeat the buyer's last 2–3 words as a question, then go silent. Example — Buyer: "It's been frustrating for the team." Rep: "Frustrating for the team?" *(silence)*. The buyer fills the silence with the layer beneath the first answer.
- **Label.** Name the emotion or pattern you hear. "It sounds like the team has tried to fix this before and gotten burned." / "It seems like there's some tension between what you want to do and what your CFO is willing to fund." Labels disarm defensiveness.
- **Get to "No".** Frame the question so a "no" is safe and informative. "Is now a bad time to dig into the budget question?" / "Is it ridiculous to think this could land before [quarter]?" A premature "yes" is the most dangerous answer in B2B sales.
- **AWE probe.** "And what else?" — the highest-leverage question in this document. Use it after every substantive answer in the Pain, Aspiration, and Buying Process sections.

---

## Disqualifying signals (when to end the call early)

A discovery call has two valid outcomes: a qualified next step, or a clean disqualification. Pursuing wrong-fit deals is the most expensive mistake in B2B sales. End the call early if:

- The buyer has tried nothing and can't name a cost of inaction (no real pain).
- The buyer can't name who else would notice if the problem were solved (no internal consensus path).
- The metric the buyer would measure success against doesn't move enough numbers to justify your price (wrong segment).
- The trigger that made this a priority is "we're exploring" with no underlying event (no urgency — long cycle, low conviction).
- The buying process the buyer describes routes through stakeholders you've never sold to before AND the buyer can't introduce you to them in the next two weeks.

End the call with respect: "Based on what you've shared, I don't think we're the right fit right now — and I'd rather tell you that than waste another hour of your time. If [specific trigger] changes, I'd love to reconnect." This earns referrals. Pursuing the deal earns nothing.
`,
}

/**
 * Cold Email Sequence template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Bly — The Copywriter's Handbook (4 U's, Eight Headline Types, AIDA arc,
 *   You-Orientation, clarity rules). Hormozi — $100M Offers (Market Selection,
 *   Value Equation, Trim & Stack). Corpus synthesis (Voje 40/40/20, Wes Bush,
 *   PMA practitioner blogs) for sequence shape, day-spacing, and behavior
 *   branching.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/25-cold-email-sequence.md
 *
 * Why 5 emails, not 3 or 7: corpus synthesis is unambiguous — five touches is
 * the point at which non-response is information ("targeting wrong, offer
 * wrong, or timing wrong"). Adding more is a signal to re-run market
 * selection (Hormozi), not extend the sequence. Day-spacing (1/4/8/13/18) is
 * locked into the skeleton headings so users don't relitigate cadence.
 */

import type { ArtifactTemplate } from './types'

const COLD_EMAIL_SEQUENCE_SYSTEM_PROMPT = `You are drafting a cold email sequence \
— a 5-email outbound sequence to a prospect at a best-fit account who has not \
engaged with the company yet. This is NOT a launch announcement, NOT an inbound \
nurture, and NOT a customer testimonial ask. It is a never-met-you sequence whose \
job is to earn a reply.

Avoid these failure modes:
- "Just checking in" / "Following up" / "Bumping this" — signals you have nothing \
new to say. Every follow-up needs a new angle, a new asset, or a new piece of \
relevance
- Generic openings — "Hope this finds you well", "My name is X and I work at Y", \
"I wanted to introduce you to" — fastest path to the trash folder
- Multi-question / compound CTAs — "open to a call? or more info? or 15 minutes?" \
Pick ONE. One CTA per email, and the CTAs escalate across the sequence
- No relevance signal — if the email could have been sent to anyone in the \
industry, it reads like spam. Even one specific detail (LinkedIn headline, \
recent announcement, job posting that signals the pain) changes the psychology
- Immediate hard sell — the first email asking for a 45-minute demo is asking \
for too much trust too fast. Micro-commitments first: a reply, a click, a \
calendar link
- Inside-out language — "we built", "our platform delivers", "we help companies". \
Replace with you-orientation. "You can…" beats "We help you…"
- Vague-curiosity subject lines — "Quick question", "Quick favor", "Following up". \
Buyers are immune. Apply the 4 U's (urgent, unique, useful, ULTRA-SPECIFIC); \
specificity does the most lifting in cold subject lines
- Running the sequence on the wrong list — no copy fixes a list failure. If the \
target list fails the four targeting filters (urgency of pain, purchasing power, \
ease of targeting, growth trajectory), the sequence is wasted regardless of craft

Render exactly FIVE emails with fixed day-spacing: Day 1, Day 4, Day 8, Day 13, \
Day 18. Each email has subject + body + ONE CTA. The pattern is locked: \
relevance hook → problem reframe → specific social proof → value asset → \
break-up. Do not collapse, expand, or reorder the pattern.

Each email's CTA escalates: low-friction reply → calendar link → low-friction \
reply or click → asset consumption → graceful close. Do not stack CTAs within \
a single email.

Pull buyer language from the RAG corpus when available — buyers' words outperform \
marketers' words. Reference frameworks implicitly. Do not name-drop authors.`

export const coldEmailSequenceTemplate: ArtifactTemplate = {
  artifactType: 'cold_email_sequence',
  title: 'Cold Email Sequence',
  // Skeleton: pre-work (targeting + offer + personalization plan) → subject-line
  // craft block (4 U's + 8 types + colleague test) → 5 emails with locked
  // day-spacing and locked pattern → behavior branch flag → composition
  // pointers → validation checklist.
  systemPromptFragment: COLD_EMAIL_SEQUENCE_SYSTEM_PROMPT,
  skeleton: `# Cold Email Sequence: [Product] → [Buyer Persona at Best-Fit Account]

## Pre-work (decisions made before drafting)

- **Targeting fitness — does the list pass all four filters?**
  1. *Urgency of pain:* [Is the problem you solve a now-problem or a someday-problem for this list? "Now" lists convert; "someday" lists don't.]
  2. *Purchasing power:* [Can the recipient (or their boss in 1 hop) actually buy at your price point?]
  3. *Ease of targeting:* [Can you find them via LinkedIn / Apollo / Clay filters cleanly, or are you guessing?]
  4. *Growth trajectory:* [Is this segment growing? Hiring signals, funding rounds, product launches all count.]
  *If any filter fails, do not run this sequence — fix the list first.*
- **Offer fitness — what are you actually offering, and does it score?**
  [Each email's offer needs to either (a) increase perceived likelihood of outcome, (b) accelerate timeliness, or (c) reduce effort/sacrifice. A "15-minute call" with no demonstrated value is a poor offer. A "5-minute Loom showing X for your team" is a better offer — likelihood is proven, effort is lower. Name the underlying offer here in one sentence.]
- **Personalization plan — what's findable in <90 seconds per prospect?**
  [Pick ONE custom field per email that is findable fast: LinkedIn headline, recent post, hiring signal, funding announcement, product launch. Everything else is templated. Spending 45 minutes researching one prospect when you need to reach 500 is the wrong tradeoff.]
- **Upstream artifacts you should have:**
  [Positioning statement → defines the differentiated value seeded into Email 3 social proof. Messaging framework → seeds the value claim in Email 1 and the reframe in Email 2. ICP → defines who's on the list. Value proposition canvas → defines the offer.]

---

## Subject-line craft block (run this BEFORE drafting bodies)

Subject lines are the first 80% of the work. Five times as many people read the subject line as the body. Each email below gets one subject line that passes all three tests.

- **The 4 U's, scored 1-4:**
  - *Urgent:* time-sensitive reason to act now (a deadline, a window, a recent event)
  - *Unique:* says something fresh, not a category cliché
  - *Useful:* signals the benefit, not the ask
  - *Ultra-specific:* concrete details, real numbers, real names — *this one does the most lifting in cold email*
  Aim for 3+ on at least three dimensions. If the subject scores below that, rewrite.
- **Eight headline types as a variant menu** (when stuck, run the subject through each):
  1. *Direct:* "Cut [metric] by 40%"
  2. *Indirect / curiosity:* (use sparingly — see failure mode list)
  3. *News:* "New: [feature/integration/finding] for [persona]"
  4. *How-to:* "How [similar company] cut [metric] by 40%"
  5. *Question:* "Is [Company]'s [metric] 8 hours or 8 minutes?"
  6. *Command:* "Stop [losing X] in [process Y]"
  7. *Reason-why:* "Three reasons your [process] takes [too long]"
  8. *Testimonial:* "[Customer name] cut [metric] 40% — quick share"
- **The colleague test:** would this subject line make sense sent from a colleague at the prospect's company? If yes, send it. If it reads like marketing, rewrite.
- **Mechanics:** under 8 words, no title case, no exclamation points, no emoji.

---

## The sequence — 5 emails, locked

### Email 1 — Day 1: Relevance hook + single value claim

**Subject line:** [Apply the craft block above. Should reference something specific to *them* — recent news, post, signal — OR the value-with-numbers. Eight words max.]

**Body:**

[*Paragraph 1 — relevance hook, one sentence.* Reference something specific you found in <90 seconds: "Saw [Company]'s announcement about [thing]" / "Your post on [topic] last week landed on me — particularly the part about [detail]" / "[Specific signal — funding, hire, launch] suggests [Company] is at the [specific stage] where [pain] gets sharper". One sentence. No "I hope this finds you well".]

[*Paragraph 2 — single value claim, one sentence.* Connect the relevance hook to a specific outcome you deliver. Use you-orientation: "You can [do specific thing] without [specific pain]." Not "We help companies do X". Plain language — pass the BBQ-talk test.]

[*Paragraph 3 — single CTA, one sentence.* Lowest-friction option in the sequence: a reply ("worth a quick reply if [specific qualifier]?") or a calendar link with the time-cost named ("15 minutes next Tuesday or Thursday?"). ONE option. No "or here's more info, or maybe a call".]

[*Sign-off — first name only, no corporate footer block in the body. Title + company in the email signature, not the body.*]

---

### Email 2 — Day 4: Problem reframe (pattern recognition, not desperation)

**Subject line:** [Different angle from Email 1. Often a reason-why or how-to type. Example: "Most [persona]s I talk to hit [pain] around [milestone]" — frames it as pattern recognition.]

**Body:**

[*Paragraph 1 — pattern reframe.* Don't restate Email 1's pitch. Come at the pain from a different angle. "Most [persona] I talk to are dealing with [pain]. Usually it's because of [root cause they may not have named yet]." Signals you've seen the pattern many times — the opposite of desperation.]

[*Paragraph 2 — implication, one sentence.* Why this matters specifically — what gets worse if it doesn't get solved. Specific stakes, not "growth opportunities".]

[*Paragraph 3 — single CTA, slightly higher friction than Email 1.* Calendar link or a single qualifying question. Example: "Worth 15 minutes to compare notes on how [other company in their space] solved this?" ONE option.]

---

### Email 3 — Day 8: Specific social proof

**Subject line:** [Lead with the customer outcome data. Direct or testimonial type. Example: "[Customer name] cut reporting time 40% — relevant for [Their Company]?"]

**Body:**

[*Paragraph 1 — named customer + specific result + relevant context.* "A [similar-shape company — same size, same stack, same segment] cut [specific metric] by [X%] in [timeframe]." Specificity does the work. Vague testimonials ("major Fortune 500 saw significant improvement") are invisible.]

[*Paragraph 2 — why this is relevant to *them*, one sentence.* Connect the customer's situation to the prospect's: "Same [stack / scale / segment] as [Their Company]" or "Same [industry pressure] you mentioned in [their post]".]

[*Paragraph 3 — single CTA, micro-commitment level.* Could be: "Worth a 5-minute Loom walking through how they did it?" / "Want me to send the case study?" / "15 minutes to compare?" ONE option. The asset offer ("Loom" or "case study") sets up Email 4.]

---

### Email 4 — Day 13: Value asset — different angle, give-first

**Subject line:** [Lead with the asset. News or how-to type. Example: "Short Loom — [specific topic for their situation]"]

**Body:**

[*Paragraph 1 — the asset, named specifically.* "I put together a 4-minute Loom looking at [Their Company]'s [public data point — pricing page, careers page, product page] through the lens of [the pain]." OR "Three pages from our [framework / research] that map directly to [their named situation]." NOT a generic content drop ("we have a great whitepaper").]

[*Paragraph 2 — what they'll get from it, one sentence.* Specific takeaway, not "thought you'd find it useful". "Skip to minute 2 — that's the [specific finding]."]

[*Paragraph 3 — single CTA, asset consumption.* "Want me to send it over?" / "Reply 'send' and I'll DM the link." Lower-friction than a calendar ask — gives the prospect a reason to reply without committing to a meeting.]

[*If you don't have an asset to genuinely offer, do not fake one.* Replace this email with a different-angle problem reframe drawn from a second pain point in the persona's job. Empty value asset emails are worse than no email.]

---

### Email 5 — Day 18: Break-up (graceful close)

**Subject line:** [Direct, calm, no guilt. Example: "Closing the loop" / "Last note" / "I'll let this go".]

**Body:**

[*Paragraph 1 — name the silence and the assumption.* "I've reached out a few times and haven't heard back — assuming the timing isn't right." No guilt. No "are you the right person?". No "did I do something wrong?".]

[*Paragraph 2 — one-sentence reminder of what you do, plain.* "If [pain] becomes a priority later, [one sentence on what we do]." Plain language. Future-state framing.]

[*Paragraph 3 — single CTA, lowest-friction close.* "Happy to step back — or if a different person on your team is closer to this, I'd appreciate the redirect." ONE soft option. (The break-up frequently gets the highest reply rate of the sequence — graceful closes signal you're not going to keep pestering them, which is itself a positive signal.)]

---

## Behavior branch flag (sequence-runner concern)

Someone who clicked twice is not the same as someone who never opened. The sequence above is the cold-cold default. If your sequencer (Smartlead, Lemlist, Apollo, Outreach, etc.) supports behavior branching, encode at minimum:

- *Opened Email 1 but didn't click:* Email 2 stays as drafted (problem reframe).
- *Clicked any link in Emails 1-3:* skip to a fast-follow asset email; the prospect has signaled active interest.
- *No opens by Day 8:* targeting or deliverability problem, not copy. Pause and re-investigate before sending Email 3.

Behavior branching is the single biggest leverage point most teams ignore. It does not change the template; it changes which email is sent next.

---

## Composition pointers

- *Upstream inputs:* \`positioning_statement\` (differentiated value seeds Email 3 proof), \`messaging_framework\` (value claim seeds Email 1, reframe seeds Email 2), \`icp\` (list definition), \`buyer_persona\` (which findable signals matter), \`value_proposition_canvas\` (the underlying offer).
- *Downstream artifacts:* a positive reply opens \`discovery_question_set\` (artifact 23) and \`talk_track\` (artifact 21). A demo request opens \`demo_script\` (artifact 20). An objection opens \`objection_handling\` (artifact 22).
- *After the sequence ends with no reply:* re-list with a different angle in 90 days, OR remove from the list. Do not extend to a 6th touch — that's a targeting/offer problem the copy cannot fix.
- *Personalization at scale:* one custom line per email, everything else templated. Custom line must be findable in <90 seconds. Tools like Clay merge context automatically.

---

## Validation checklist (run before queuing the sequence)

[Run before the sequence goes out:
- Does the list pass all four targeting filters (urgency / power / targeting / growth)?
- Does each email have ONE CTA, and do the CTAs escalate (reply → calendar → reply → asset → close)?
- Does each subject line score 3+ on the 4 U's, with ultra-specific the strongest?
- Does each subject line pass the colleague test?
- Is there a relevance signal (custom line) in every email — not just Email 1?
- Is the language you-oriented, not we-oriented? Search the bodies for "we", "our", "us" — if those outnumber "you" / "your", rewrite.
- Are the sentences short (avg 14-16 words) and the words plain ("use" not "utilize", "help" not "assistance")?
- Is the social proof in Email 3 specific (named customer, numbered metric, relevant context) — not vague ("Fortune 500 success")?
- Is the Email 4 asset real and specific to the prospect — not a generic content drop?
- Does the break-up (Email 5) have no guilt language?
- Are you running this on a list, not a person? (Single-prospect cold sequences are a different artifact — manual outreach, not templated.)

If any answer is no, the sequence isn't ready.]
`,
}

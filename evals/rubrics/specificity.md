# Rubric — Specificity / Actionability

**Metric:** Specificity / Actionability (pointwise, 1-5)
**What it measures:** Can a PMM execute this tomorrow, or is it strategy theater? Specific and actionable means — named tactics, concrete numbers, quotable examples, steps in order, diagnostic tests the reader can run.

**Why it matters:** Vanilla LLMs produce McKinsey-soup — "understand your customer, define your ICP, align stakeholders." Fine in a book; useless in a Friday afternoon planning session. PMM Sherpa's value is operational specificity.

---

## Scoring anchors

### Score 1 — Strategy theater
Abstract nouns, unfalsifiable claims, no named tactics, no concrete steps. The reader finishes the answer and still doesn't know what to do Monday morning.

**Example 1 (Score 1):**
> *Prompt:* "How do I run win/loss interviews?"
> *Answer:* "Win/loss analysis is critical for understanding why you win and lose deals. Reach out to customers and ask them about their experience. Use the insights to improve your positioning and sales process. Make sure to talk to both won and lost deals for a balanced view."

**Example 2 (Score 1):**
> *Prompt:* "My product has 12 features. How do I pick 3 to lead with in messaging?"
> *Answer:* "Focus on the features that matter most to your customers. Prioritize based on what makes you unique and what your target audience values. Test different messages to see what resonates."

### Score 3 — Named tactics, incomplete specificity
The answer names specific tactics and gives some concrete steps, but key details are still abstract. The reader has direction but will need to fill in 30% of the plan themselves.

**Example 1 (Score 3):**
> *Prompt:* "How do I run win/loss interviews?"
> *Answer:* "Talk to customers from your last 10-20 deals, both won and lost. Aim for 30-minute calls. Ask about their trigger event, the alternatives they considered, what drove the decision, and who was involved. Analyze patterns by segment and loss reason. Consider using a third-party interviewer to reduce bias."
>
> *Why 3:* Names concrete number (10-20 deals), length (30 min), and question topics. But doesn't give verbatim questions, doesn't say how to structure the conversation, doesn't tell you what to do with the analysis.

**Example 2 (Score 3):**
> *Prompt:* "Pick 3 features from 12 to lead with."
> *Answer:* "Apply three filters — uniqueness (does an alternative claim this?), value-to-ICP (does your ideal customer care?), and resonance (does it change their decision?). Test your picks with 5-10 customers before committing. Kill features that fail any of the three filters."
>
> *Why 3:* Clear 3-filter method, specific customer-count. But doesn't say how to run the test, what questions to ask, or what "resonance" looks like in practice.

### Score 5 — Execute tomorrow
The answer delivers a sequenced, specific, tactic-level plan. Named tools, numbers, specific phrasings, diagnostic tests. The reader can act on it without Googling anything further.

**Example 1 (Score 5):**
> *Prompt:* "How do I run win/loss interviews?"
> *Answer:* "Pull your last 20 closed deals — 10 won, 10 lost. Reach out to the economic buyer (not the champion) with a short note — 'We're trying to sharpen our understanding of how teams evaluate Loopview. Would you have 25 minutes next week to walk me through your decision process? No sales agenda.' Expect 40% acceptance.
>
> Open every interview with — 'Walk me back to the moment you realized you needed this.' That's the trigger question. Then five more — 'What else did you seriously consider?' / 'What made it a finalist?' / 'Who else was involved in the decision?' / 'When did price come up, and what did it do to the process?' / 'If you ran this again, what would you do differently?'
>
> Code transcripts into four buckets — trigger event, alternatives evaluated, decision criteria with weights, and post-decision reflections. Look for patterns that repeat across at least 3 interviews — single-interview 'insights' are noise.
>
> Bias control — a third-party interviewer (PMA has a directory, or a contractor at $100-200/hour) gets you 2x more candor on lost deals. If you can only afford one budget line, spend it here."
>
> *Why 5:* Sequenced (20 deals → outreach → interview → coding → pattern extraction → bias control). Verbatim questions. Specific numbers (40% acceptance, $100-200/hour, minimum 3 interviews for a pattern). Diagnostic test (economic buyer not champion). Executable Monday morning.

**Example 2 (Score 5):**
> *Prompt:* "Pick 3 features from 12."
> *Answer:* "Run the Dunford diagnostic. For each of the 12 features, answer three questions with a customer (not internally): 'Do competitors or alternatives also offer this?' 'Would you still switch to us if this feature disappeared tomorrow?' 'What outcome does this enable that you can't get elsewhere?' Features that survive all three — where alternatives can't claim it, where it's load-bearing to the switch, and where the outcome is unique — are your leads.
>
> Test with 5 customers, not 50. More customers introduce noise, not signal, this early. Bias check — avoid asking internal stakeholders because they'll vote for the features they built.
>
> If more than 3 features survive, you haven't narrowed enough on the ICP. Go back to ICP first. If fewer than 3 survive, you're either missing customer interviews or your product's real value is fewer than 3 things — both are useful discoveries."
>
> *Why 5:* Verbatim questions. Specific customer count with reasoning. Named diagnostic test (internal-stakeholder bias). Handles edge cases (if more/fewer than 3 survive). Executable.

---

## Judge instructions

Given a prompt, an answer, and this rubric, assign a score from 1-5 (integer only):

```json
{
  "score": <int 1-5>,
  "anchor_example_closest": "1 | 3 | 5",
  "reasoning": "<1-2 sentences — does the reader know what to do Monday morning?>"
}
```

**Bias controls:**
- Do NOT confuse length with specificity. A 300-word answer with 5 verbatim questions scores higher than a 1000-word answer of abstract principles.
- Do NOT penalize answers that refuse to be specific when the prompt doesn't warrant specificity (pure framework-knowledge questions in Tier 1 may legitimately stay conceptual — defer to framework fidelity for those).
- For Tier 3 deliverable prompts, specificity means the artifact is ready to paste into a doc, not abstractly structured.
- Numbers without sources are fine if plausible ($100-200/hour contractor rate). Invented specifics ("studies show 73.4%...") are NOT — they score lower, not higher.

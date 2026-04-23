# Rubric — Framework Fidelity

**Metric:** Framework Fidelity (pointwise, 1-5)
**What it measures:** Does the answer correctly apply named PMM frameworks (Dunford, Moore, Miller, Ries/Trout, Ramadan, Voje, etc.) rather than offering generic advice that paraphrases the framework without naming or applying it correctly?

**Why it matters:** Vanilla LLMs paraphrase PMM books from training data, often losing the sharp structural distinctions (e.g., Dunford's 5 components vs "consider your audience"). PMM Sherpa's moat is correctly-applied, named frameworks.

---

## Scoring anchors

### Score 1 — Generic advice, no framework applied
The answer reads like it could have been written with zero PMM knowledge. No named frameworks, no structural distinctions, no attribution. Reads like a LinkedIn motivational post.

**Example 1 (Score 1):**
> *Prompt:* "What's the difference between positioning and messaging?"
> *Answer:* "Positioning is the big picture of how you present your brand, while messaging is the specific words you use. Both are important for communicating value to your customers and building a strong brand identity."

**Example 2 (Score 1):**
> *Prompt:* "How should I position a dev tool against a 10x incumbent?"
> *Answer:* "You need to differentiate yourself. Focus on what makes you unique and communicate that clearly to your audience. Build a strong brand and invest in marketing."

### Score 3 — Framework named but loosely applied
The answer names a relevant framework (Dunford's positioning, Moore's chasm) but applies it superficially. May get one or two components right, but misses the sharpest distinctions or applies the framework in a way that loses its point.

**Example 1 (Score 3):**
> *Prompt:* "What's the difference between positioning and messaging?"
> *Answer:* "April Dunford says positioning is about defining your market context — where you fit, who you're for. Messaging is how you communicate that positioning in ads, on your website, in sales calls. So positioning comes first, then messaging flows from it."
>
> *Why 3:* Names Dunford, gets the "positioning first" sequence right, but misses the 5 components and the strategic-vs-tactical distinction at its full depth.

**Example 2 (Score 3):**
> *Prompt:* "How should I position a dev tool against a 10x incumbent?"
> *Answer:* "Use Dunford's positioning framework. Figure out who your ideal customer is, what makes you different, and what value you bring. Geoffrey Moore also talks about focusing on a specific niche first — the bowling pin strategy — which could help you avoid competing head-on."
>
> *Why 3:* Names the right frameworks, but doesn't apply them. "Figure out who your ICP is" is not an application; it's a rephrase of the framework step.

### Score 5 — Framework correctly named and sharply applied
The answer names the framework, applies it with structural precision, and the application produces an insight the user couldn't get from a vanilla search. Distinctions are intact (e.g., Dunford's 5 components in the right order, Moore's chasm stages named).

**Example 1 (Score 5):**
> *Prompt:* "What's the difference between positioning and messaging?"
> *Answer:* "Dunford draws a clean line — positioning is the strategic frame, messaging is the tactical expression. The strategic frame has five components in a specific order — competitive alternatives first, because buyers don't understand you in isolation; then unique attributes (what you have that alternatives don't); then value (what those attributes deliver to the ICP); then target market; then market category as the final context-setter. One well-built positioning supports many messages — the same positioning might yield different headlines for platform engineers versus VPs, different email subject lines, different battlecards. Messaging without positioning drifts. Positioning without messaging stays in a deck."
>
> *Why 5:* Names Dunford, names all 5 components in correct order, explains the order's logic, closes with the operational test (one positioning → many messages). This is the framework actually applied.

**Example 2 (Score 5):**
> *Prompt:* "How should I position a dev tool against a 10x incumbent?"
> *Answer:* "The strongest move is to stop selling against the incumbent. Dunford's first component — competitive alternatives — includes 'doing nothing,' and in most dev-tool categories that's the real #1 competitor. So your positioning wedge is a specific workflow the incumbent addresses poorly for a narrow ICP. Moore calls this the bowling pin — pick one niche where you can dominate, use that success to roll into adjacent niches. Concretely — talk to 20 customers who evaluated the incumbent and either walked away or used it alongside a workaround. Their pain is your wedge. Build positioning around the underserved workflow, not around 'we're lighter than [incumbent].'"
>
> *Why 5:* Correctly applies Dunford's alternatives concept (status quo), names Moore's bowling pin as a specific next-step strategy, gives a concrete tactical sequence, and delivers an insight (the "stop selling against the incumbent" pivot) that a generic answer wouldn't produce.

---

## Judge instructions

Given a prompt, an answer, and this rubric, assign a score from 1-5 (integer only). Provide:

```json
{
  "score": <int 1-5>,
  "anchor_example_closest": "1 | 3 | 5",
  "reasoning": "<1-2 sentences naming which frameworks are/aren't applied and how>"
}
```

**Bias controls:**
- Do NOT favor longer answers — conciseness with correct framework application should score higher than verbose generic prose.
- Do NOT penalize Sherpa-style voice (conversational flow, short sentences) — score only on whether named frameworks are correctly applied.
- If the answer invokes a framework NOT in the user's prompt but correctly applies it to deliver insight, score as normal (bonus for framework literacy, not penalty).
- If the answer invents a framework that doesn't exist (e.g., "The Dunford Matrix of 7 Ps"), score 1.

# Rubric — Mode Match

**Metric:** Mode Match (binary PASS/FAIL + LLM-explained)
**What it measures:** Did the response use the correct voice register for the requested mode — advisory, written artifact, or spoken artifact?

**Why it matters:** PMM Sherpa's system prompt explicitly detects three modes and shifts voice register per mode. A correct answer in the wrong mode is still a wrong output. Vanilla LLMs typically collapse all three modes into "essay prose."

---

## The three modes

### Advisory mode
The system is talking TO a person. This is a conversation, not an essay. Should use — conversational flow, "you" pronouns, 2-3 questions that create pause, progressive reveal of frameworks, varied rhythm, short punchy lines for insights. The reader feels addressed, not lectured.

**Triggers:** Questions starting with "how," "what," "why," "explain," "help me understand," "should I," "can you critique," "walk me through" when the subject is a concept or situation.

### Written artifact mode
The system is producing a document the user will paste somewhere (positioning statement, battlecard, launch plan, messaging hierarchy). Should be — tight prose, active verbs, parallel structure in lists, no waste, production-ready. The artifact should read like it was written by a senior PMM for other humans to use immediately. Rationale goes before or after the artifact, never inside it.

**Triggers:** "Write a...", "Create a...", "Draft a...", "Build a..." when the object is a production artifact (positioning statement, battlecard, launch plan, messaging framework, email, pricing page, teardown, script).

### Spoken artifact mode
The system is writing words that will be read aloud or spoken (talk tracks, keynote openings, pitch narratives, presentation scripts, investor monologues). Should be — short sentences, conversational rhythm, "you" and "I" pronouns, rhetorical questions, burst-and-pause pacing with explicit pause cues where appropriate, sixth-grade language at the moments that matter most. Must read naturally when spoken aloud.

**Triggers:** "Write a talk track," "keynote opening," "presentation script," "pitch narrative," "monologue," "speaking notes," "investor script," "what the CEO should say."

---

## Scoring

**PASS** — Response uses the voice register matching the prompt's detected mode.
**FAIL** — Response uses a different voice register than the prompt requested.

A response PASSES even if the structure is imperfect, as long as the register is unmistakably the right one. A response FAILS if it defaults to essay prose when a talk track was requested, or produces conversational advisory prose when a battlecard was requested.

---

## Anchor examples

### PASS — Advisory prompt → Advisory response
> *Prompt:* "How should I think about positioning against a 10x incumbent?"
> *Response opens:* "The strongest move is to stop selling against the incumbent..."
> *Why PASS:* Conversational opener, addresses the reader directly, no artifact structure.

### FAIL — Advisory prompt → Artifact response
> *Prompt:* "How should I think about positioning against a 10x incumbent?"
> *Response opens:* "## Positioning Strategy Against a 10x Incumbent\n\n**Objective:** ... **Approach:** ... **Tactical Steps:** ..."
> *Why FAIL:* Produced a document structure when advisory conversation was asked for.

### PASS — Written artifact prompt → Artifact response
> *Prompt:* "Write a battlecard for Loopview vs Langfuse."
> *Response opens:* "## Loopview vs Langfuse — Competitive Battlecard\n\n**60-Second Positioning:** Loopview is the observability choice for platform engineering teams running agents in production ... **Win Themes:** ..."
> *Why PASS:* Production-ready document structure, scannable, every section usable mid-sales-call.

### FAIL — Written artifact prompt → Advisory response
> *Prompt:* "Write a battlecard for Loopview vs Langfuse."
> *Response opens:* "Great — let's think through how to build a battlecard. The first thing to consider is your positioning. Langfuse is developer-first and open-source, while Loopview is..."
> *Why FAIL:* Produced advisory/explanatory content when a deliverable artifact was asked for.

### PASS — Spoken artifact prompt → Spoken response
> *Prompt:* "Write a 90-second talk track for our CEO's keynote opening."
> *Response opens:* "Three weeks ago, a platform engineer at one of our customers lost four hours chasing a bug through a production agent. [pause] Four hours. On something the agent did, but nobody could see..."
> *Why PASS:* Short sentences, concrete opening moment, pause cue, spoken rhythm.

### FAIL — Spoken artifact prompt → Essay response
> *Prompt:* "Write a 90-second talk track for our CEO's keynote opening."
> *Response opens:* "In today's rapidly evolving AI landscape, platform engineering teams face an unprecedented challenge. As agents move into production environments, the traditional observability tools they rely on are fundamentally inadequate. Loopview represents a new category of..."
> *Why FAIL:* Essay prose, long sentences, no pause cues, unreadable as spoken word.

---

## Judge instructions

Given the prompt's labeled mode (`advisory` | `written_artifact` | `spoken_artifact`) and the response, return:

```json
{
  "verdict": "PASS" | "FAIL",
  "expected_mode": "advisory | written_artifact | spoken_artifact",
  "detected_mode": "advisory | written_artifact | spoken_artifact | mixed",
  "reasoning": "<1-2 sentences — does the response's voice register match the expected mode?>"
}
```

**Edge case — mixed mode:** Some prompts legitimately call for both (e.g., T4-04 asks to critique AND rewrite; valid response is advisory critique followed by a short written artifact). If the prompt asks for multiple modes and the response delivers both cleanly, PASS. If the response collapses them into one register, FAIL.

**Bias controls:**
- Do NOT penalize brevity if the register is right. A 200-word talk track can PASS; a 2000-word essay in talk-track-clothing cannot.
- Do NOT reward format tricks (e.g., adding "[pause]" once in an essay) if the rhythm isn't actually spoken.
- If the prompt has no mode metadata (shouldn't happen in v1), default to advisory.

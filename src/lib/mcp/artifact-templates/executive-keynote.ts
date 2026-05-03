/**
 * Executive Keynote template (script + deck outline) for the generate_artifact
 * MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Nancy Duarte — Resonate (Sparkline, audience-as-hero, mentor stance,
 *   S.T.A.R. moment, Big Idea, frequency tuning). Duarte & Sanchez — Illuminate
 *   (torchbearer model, Venture Scape, threshold crossing, symbolic artifacts).
 *   Jeremy Donovan — How to Deliver a TED Talk (Idea Worth Spreading, opening
 *   hook, story-evidence loop, closing circle, time discipline, slide strategy,
 *   rehearsal protocol). Corpus (Tier 2) for the operational 7-beat story
 *   spine, Play Bigger's category-claim framing for the Big Idea, and the
 *   prose-first rehearsal rule.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/24-executive-keynote.md
 *
 * Why this artifact is dual-format (script + deck outline): an executive
 * keynote is delivered live by a CEO/CMO. The script is the primary artifact;
 * the deck is visual support. The skeleton renders the prose script first
 * (7-beat spine, each beat tagged What Is / What Could Be) and the slide-by-
 * slide deck outline second, keyed to the script beats. This enforces the
 * prose-first rehearsal rule structurally — you cannot write the deck before
 * the script.
 *
 * Why this template diverges from artifact 14 (customer launch deck): a launch
 * deck answers "why now (about this product)?". A keynote answers "why this
 * shift?". Launch deck is product-anchored; keynote is vision/category-
 * anchored. The keynote can announce a product but the product is not the
 * spine — the shift is.
 *
 * Distinct from:
 *   - artifact 13 (internal_launch_deck) — internal enablement for a specific
 *     launch (RACI, talk track, Q&A). Goal: enable. This artifact is exec
 *     stage performance; goal is to seed a belief shift.
 *   - artifact 14 (customer_launch_deck) — product-launch event deck spec.
 *     This artifact is broader — a vision/category talk that may or may not
 *     announce a product, delivered at a conference, customer event, or
 *     all-hands.
 *   - artifact 19 (sales_pitch_deck) — 1:1 deal conversation, ends in
 *     commercial Ask. This artifact is broadcast, ends in threshold ask.
 *   - artifact 36 (webinar_deck) — shorter, interactive, instructional. This
 *     artifact is performance — single voice, vision-led, no audience
 *     interaction inside the keynote frame.
 */

import type { ArtifactTemplate } from './types'

const EXECUTIVE_KEYNOTE_SYSTEM_PROMPT = `You are drafting an executive keynote — \
the script and deck outline a CEO, CMO, or founder delivers live to a room \
(conference stage, customer event, all-hands, fireside). This is NOT a product \
announcement, NOT a sales pitch, NOT a webinar. The keynote's job is to seed a \
belief shift — the audience leaves thinking "the world is changing and I need \
to be on the right side of it."

The single sharpest framing: a launch deck answers "why now (about this \
product)?". A keynote answers "why this shift?". Every structural decision \
flows from that.

Render two outputs in order:
1. The full prose script (7 beats), each beat tagged [What Is] or [What Could Be]
2. The slide-by-slide deck outline, one slide per beat, keyed to the script

The script must hold together as prose without the deck. If it does not, the \
structure is not there yet.

Avoid these failure modes:
- Feature-pitching disguised as keynote — every "vision" beat drifts back to \
capabilities. The fix is structural: write the prose script first; if the \
written narrative holds together without product mentions, it is probably a \
keynote. If product is mentioned in beats 1, 2, 3, 4, or 6, the spine has \
collapsed
- Exec-as-hero — "we built this, we saw the future, we solved it." The \
audience stops listening because they are not in the story. Introduce the \
market shift before the company. The shift is the inciting incident, not the \
founding moment
- Multiple Big Ideas — three category claims in one talk means zero category \
claims land. One talk, one Big Idea. Test: can someone who attended summarize \
the Big Idea in one sentence the next morning?
- Weak opening — "thank you for being here, I am excited to share..." wastes \
the first thirty seconds, which is when attention is won or lost. Open with \
the market shift. First sentence, no warm-up
- No planted S.T.A.R. moment — Something They'll Always Remember. One stat, \
one story, one quote, one image, one symbol so specific it sticks. For \
keynotes (vs. launch decks) the most powerful S.T.A.R. is most often a symbol \
or image that encapsulates the Big Idea — a "no software" logo, a pocket, a \
single shocking number. Pick one and protect it
- More than one CTA — keynotes end in a single threshold ask: the audience's \
commit moment. "Join the [movement/category/initiative]" is a threshold ask; \
"visit our booth, download the report, talk to your AE, sign up for beta" is \
a commercial stapled to the end. Three CTAs are zero CTAs
- Hero's Journey drift — making the buyer a hero on a fantasy quest produces \
fuzzy B2B narratives. The arc is What Is / What Could Be (oscillating), not \
ordinary world → call to adventure → return. The audience is the hero of \
their own decision; you are the mentor who hands them the protagonist role
- Vendor name-drops as enemies — the enemy of the narrative is the OLD WAY of \
working, never a named competitor. Vendor call-outs collapse the emotional \
register from inspiration to combat
- No rehearsal / slide-first drafting — the talk must work without slides. If \
the prose script does not hold standalone, the deck cannot save it. Render \
the script first, the deck second

Positive asks:
- Render the keynote as a Sparkline embedded in a 7-beat spine: World Has \
Changed (What Is) → Old Way Is Broken (What Is, deepening) → Introduce the \
New Category / Big Idea (What Could Be, named) → Audience as Hero (What Could \
Be, owned) → S.T.A.R. Moment (What Could Be, made unforgettable) → Vision \
(What Could Be, extended) → Single CTA / Closing Circle. The oscillation is \
enforced inside the spine — beats 1-2 are the audience's current reality; \
beats 3-7 are the new world they are being asked to enter
- One Big Idea, locked in pre-work before any drafting. One sentence. Plain \
language. Memorable. The line the audience repeats the next morning. For \
category-creation keynotes, the Big Idea is the category claim ("we call \
this X") — the category exists whether the company does or not, and the \
exec is the one who saw it first
- One planted S.T.A.R. moment, named in pre-work, visible in the script and \
the deck. The line, image, or symbol people will quote afterward
- Pull customer language from the RAG corpus when drafting the "Old Way Is \
Broken" beat and the "Audience as Hero" turn. Buyer words outperform marketer \
words. The audience must hear their own pain described before they trust the \
vision
- Inherit upstream artifacts when present: the strategic narrative (03) seeds \
beats 1-3; the positioning statement (01) seeds the category framing; the \
messaging framework (02) seeds the language register. Do not re-derive — \
apply
- Treat the closing CTA as a threshold ask, not a commercial action. The \
audience is committing to a new world, not signing up for a newsletter

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const executiveKeynoteTemplate: ArtifactTemplate = {
  artifactType: 'executive_keynote',
  title: 'Executive Keynote',
  systemPromptFragment: EXECUTIVE_KEYNOTE_SYSTEM_PROMPT,
  // Skeleton renders the prose script first (7 beats, each tagged What Is /
  // What Could Be to enforce the Sparkline oscillation inside the spine),
  // then the slide-by-slide deck outline keyed to the beats. This enforces
  // the prose-first rehearsal rule structurally — the deck is built from the
  // script, not the other way around.
  skeleton: `# Executive Keynote: [Title] — [Speaker, Venue, Date]

## Pre-work (lock these decisions before drafting a single line)

- **Audience & venue read:** [Conference stage (peers + skeptics), customer event (validation-seekers + prospects), all-hands (employees needing direction), or fireside (intimate, conversational)? Name what each audience knows, fears, hopes for, and resists. The script's tone, register, and S.T.A.R. type all flow from this read. Without it, the keynote is generic.]
- **Time budget:** [18-22 min (TED-shape, conference talk), 25-30 min (typical exec keynote, customer event), or 35-45 min (extended conference keynote)? Locks pacing — ~2 min per beat at 18 min, ~4 min per beat at 30 min. Do not draft beyond budget; cut beats, do not speed-talk.]
- **Big Idea (the locking sentence):** [One sentence. Plain language. Memorable. The line the audience repeats the next morning. For category-creation keynotes: name the new way of thinking ("We call this X. The category exists whether our company does or not — we are simply the ones who saw it first.") For non-category keynotes: name the shift the audience is being asked to navigate. If you cannot finish this sentence, you do not have a keynote yet — you have a status update.]
- **Planted S.T.A.R. moment:** [Which single beat is the moment people will quote afterward? For keynotes, the most powerful S.T.A.R. is most often a symbol or image that encapsulates the Big Idea (a "no software" logo, a pocket, a single shocking number) — sharper than a customer story for a vision talk. Name the symbol or moment now; the script and deck will plant it in beat 5.]
- **Single threshold CTA:** [One commit action — the audience's threshold moment. "Join the [movement/category/initiative]." "Adopt the [practice]." "Make the [shift] in your own org." For internal all-hands: "Commit to [the next quarter's focus]." This is the audience's choice to step into the new world, not a marketing action. "Visit our booth" is a shrug, not a threshold ask.]
- **Inherited upstream artifacts:** [Does a strategic narrative (03) exist? It seeds beats 1-3. A positioning statement (01)? It seeds the category framing. A messaging framework (02)? It seeds the language register. Do not re-derive — apply.]

---

## Part 1 — The script (prose, written before any slide exists)

The script must hold together as prose without the deck. Read it aloud, end-to-end. If it does not flow as a standalone talk, the structure is not there yet.

### Beat 1 — The world has changed [What Is] (~3-5 min)

[Open with the market shift. First sentence, no warm-up. A provocation: a stat that reframes the audience's world, a question they have not thought to ask, an unexpected revelation. Make the audience nod within thirty seconds. "Seven years ago, [X] was the only option. Today, that assumption is breaking." You are not the protagonist here. The shift is. Write 3-5 paragraphs of prose. Do NOT mention your company yet.]

### Beat 2 — The old way is broken [What Is, deepening] (~2-3 min)

[Show the cost of staying put. Earn emotional buy-in. The from/to journey starts here: name what people are doing now, then name the pain they are absorbing because of it. Be specific. A short customer anecdote (one named human, one specific number) works better than a stat. Pull buyer language from the RAG corpus — the audience must hear their own pain described before they will trust your vision. Write 2-3 paragraphs of prose.]

### Beat 3 — Introduce the new category / Big Idea [What Could Be, named] (~3-5 min)

[Not your product. The new way of thinking. The thing that did not have a name before you named it. State the Big Idea — the locking sentence from pre-work — verbatim, in plain language. "We call this [X]." For category-creation keynotes: the category exists whether your company does or not; you are the one who saw it first. Frame it that way explicitly. Write 3-5 paragraphs of prose. The audience should leave this beat with one sentence in their head.]

### Beat 4 — The audience as hero [What Could Be, owned] (~2-3 min)

[The turn most executives miss. The audience is not watching your journey; they are deciding whether to take their own. Hand them the protagonist role explicitly: "The companies/teams/people who navigate this shift will define the next decade. That is you. That is why you are in this room." Reframe the new category as the audience's opportunity, not your company's product. The mentor stance — the company is the guide; the audience is the hero. Write 2-3 paragraphs of prose.]

### Beat 5 — S.T.A.R. moment [What Could Be, made unforgettable] (~3-5 min)

[Plant the moment named in pre-work. Something They'll Always Remember. One demo, one customer story, one visual, one symbol, one number so specific it sticks. NOT a feature list. NOT a roadmap reveal. One thing. Build the script around making this moment land — everything else in the talk is setup for this beat. Write the prose so the moment lands at a specific sentence. The line people quote afterward should be writeable in this beat.]

### Beat 6 — The vision [What Could Be, extended] (~3-5 min)

[Paint the world once the shift matures. Not your roadmap — the destination. What does a company / team / industry look like in five years if they made this shift? Make it vivid enough that the audience can picture themselves in it. This is the Venture Scape: past (beat 1), present (beat 2), future (beat 6). Write 3-5 paragraphs of prose. Forward-looking, ambitious, but grounded in the shift you named in beat 1.]

### Beat 7 — Single CTA / closing circle [threshold ask] (~1-2 min)

[One ask — the threshold ask from pre-work. The audience's commit moment. Tie it back to the opening hook so the keynote closes the loop: the question or revelation from beat 1 is now answered or extended by everything in between. The audience leaves with one thing to do, one thing to believe, and one feeling — that the future just arrived and they are part of it. Write 1-2 paragraphs of prose. NO additional CTAs. NO "and also follow us on LinkedIn." One.]

---

## Part 2 — The deck outline (built from the script, not before it)

Slides support, never replace. Images over text. One idea per slide. Never read the slide aloud. The deck below is keyed to the script beats — each slide carries the visual weight of one beat.

### Slide 1 — Opening provocation (Beat 1)
[Image or single sentence. NOT a logo, NOT an agenda, NOT "thanks for joining." The visual that lets the opening line land. If beat 1 opens with a stat, the slide is the stat at full bleed. If it opens with a question, the slide is the question.]

### Slides 2-3 — The shift / market evidence (Beat 1, deepened)
[Two slides supporting the market shift. Slide 2: the shift framed visually (a chart, a then/now image pair, a single arresting visual). Slide 3: one named piece of proof — analyst data, a public benchmark, a customer behavior pattern. Story-evidence loop in two slides.]

### Slide 4 — The cost of the old way (Beat 2)
[The pain made visible. Best: one named customer's before-state with one specific number. NOT a logo wall. NOT a quote slide. The image that makes the audience feel the cost.]

### Slide 5 — The Big Idea / category claim (Beat 3)
[The locking sentence at full bleed. One sentence. Plain language. This slide is the centerpiece of the deck — design it accordingly. Often the title of the keynote.]

### Slide 6 — The new category framed (Beat 3, extended)
[A simple visual that gives the new category shape — a 2x2, a then/now, a flow, a metaphor. NOT a feature diagram. The audience should see the category, not the product.]

### Slide 7 — The audience as hero (Beat 4)
[The turn made visual. Best: an image of the audience archetype (the marketer, the operator, the founder) in the new world, doing the new thing. The companies/teams/people who navigate this shift named explicitly on the slide.]

### Slide 8 — The S.T.A.R. moment (Beat 5)
[The planted moment from pre-work. The symbol, image, demo reveal, or single shocking number that encapsulates the Big Idea. This is the most-designed slide in the deck. If the rest of the deck is plain, this slide is the visual punch.]

### Slide 9 — The vision (Beat 6)
[The destination visualized. The world after the shift matures. An image that makes the audience picture themselves in it. NOT a roadmap timeline.]

### Slide 10 — The threshold ask (Beat 7)
[The single CTA at full bleed. One sentence. One action. Tied back to the opening provocation so the closing circle is visible. The last frame the audience sees. NO logo slide after this.]

---

## Rehearsal protocol (three gates before the keynote ships)

[Run each gate before final sign-off:

**1. Prose-only read-through.** Read the full script aloud, end to end, with no slides visible. Does it hold as a standalone talk? Are there gaps the slides were silently covering? If the prose does not work without the deck, the structure is not there — fix the script before re-rendering the deck.

**2. Timed read-through.** Read the full script aloud at delivery pace. Does it fit the time budget locked in pre-work? At ~150 words per minute, an 18-min talk is ~2,700 words, a 25-min talk is ~3,750 words, a 30-min talk is ~4,500 words. If the script exceeds budget, cut a beat or compress beats 1, 2, 6 — never compress beat 5 (the S.T.A.R. moment).

**3. Audience-as-hero check.** Read every paragraph of the script. In each, ask: is the subject the audience, the shift, or the company? "We built X" fails. "Marketing teams now do Y in minutes" passes. "The world has shifted because Z" passes. If more than two paragraphs across the whole script have the company as subject (excluding beat 5 if the S.T.A.R. is a customer story), the mentor stance has collapsed. Rewrite.]

---

## Validation: keynote-vs-pitch test + watercooler test + threshold test

[Three crisp gates before sign-off:

**Keynote-vs-pitch test (boundary against launch/sales decks):** Read the script as if you were the audience. Does it answer "why this shift?" — or does it answer "why us?" or "why now (about this product)?" If the latter, you have drafted a sales pitch deck (artifact 19) or a launch deck (artifact 14), not a keynote. Rewrite beats 1-3 until the shift, not the company or the product, is the dominant emotional spine. The "why us?" answer should be implicit in the keynote itself, not the spine.

**Watercooler test (S.T.A.R. principle):** What is the one line, image, symbol, or moment from this keynote that someone in the audience will repeat to a colleague tomorrow morning? If you cannot name it in one sentence, the keynote has no S.T.A.R. moment and will be forgotten by Monday. The line you name should be writeable in beat 5.

**Threshold test (single-CTA / closing circle):** Does the keynote close the loop? Read beat 1 and beat 7 back to back. Does beat 7 answer, extend, or invert the provocation from beat 1? Is there exactly one ask, and is it a commit action (a threshold the audience crosses), not a marketing action (a click, a follow, a sign-up)? If there are multiple CTAs or the closing does not circle back, the keynote drifts and the threshold ask loses force. Cut to one. Tie it back to the opening.]
`,
}

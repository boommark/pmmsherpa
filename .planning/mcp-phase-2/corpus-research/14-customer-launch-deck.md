# Research — 14 Customer-Facing Launch Deck

## Canonical sources (read FIRST)

- **Duarte — Resonate** — primary structural source (Sparkline, "What Is / What
  Could Be" oscillation, audience-as-hero, S.T.A.R. moment, mentor stance)
  - Card: `~/Documents/AbhishekR/Book Brain/Duarte - Resonate.md`
- **Donovan — How to Deliver a TED Talk** — performance/delivery layer (single
  Idea Worth Spreading, opening hook, story-evidence loop, closing circle,
  time discipline, slide strategy)
  - Card: `~/Documents/AbhishekR/Book Brain/How to Deliver a TED Talk.md`

Both books are presentation-craft books, not B2B-launch books. They give the
narrative architecture and delivery rules. The corpus supplies the launch-
event specifics (slide-by-slide, virtual vs in-person time budgets, the
"What's Next" insider beat, the failure-mode taxonomy).

---

## What Resonate establishes (the architecture)

### The Sparkline (the structural spine)

A presentation that resonates oscillates between **What Is** (the world today,
the buyer's current reality) and **What Could Be** (the transformed future).
The arc rises and falls — every "what is" beat is a return to current pain;
every "what could be" beat is a glimpse of the new normal. Each oscillation
deepens the audience's emotional commitment to the change. The deck ends on a
**New Bliss** — what life looks like once the change has happened — not on a
features list.

This is the spine of artifact 14. The launch event is structurally a Sparkline:
opening (what is) → market shift (why what-is is breaking) → launch (what
could be) → demo/proof (what could be made tangible) → customer story (what
could be made real, in someone else's life) → what's next (what could be
extended) → CTA (cross the threshold).

### Audience-as-Hero / Mentor Stance

The audience is the hero. The company is the mentor (Yoda, not Luke). This
shifts every slide's center of gravity from "look what we built" to "here is
what *you* can now do." Every customer-facing launch deck failure mode in the
corpus is, at root, a violation of this stance.

### S.T.A.R. Moment

One *Something They'll Always Remember* moment per deck — a planted dramatic
beat that becomes the watercooler line ("did you see when she walked off
stage and the screen went black?"). Stat, story, quote, image, or symbol.
For a launch event, the S.T.A.R. moment is most often (a) the demo reveal
or (b) the customer story climax. It is not optional — without it, the deck
is informational, not memorable.

### Frequency Tuning

Know the audience's existing beliefs, fears, desires before drafting. For a
launch event the audience is dual: existing customers (who have context, want
to feel validated they bet right) and prospects (who want to feel the future
arriving). The narrative must work for both — that's why the spine is shift-
based (universal) rather than product-feature based (customer-only).

---

## What TED Talk adds (the delivery layer)

### The Idea Worth Spreading (the locking decision)

Before slides exist, name the single transformative idea the audience will
carry out the door. For a launch this is rarely "we shipped X." It's the
*shift* the launch participates in — "the way [job] gets done is no longer Y;
it's Z, and here's what that makes possible." If you cannot finish that
sentence, you don't have a keynote yet, you have a release-notes meeting.

### Opening Hook (first 30 seconds)

Question, revelation, or unexpected statement. Not a logo, agenda, or "thanks
for joining." The corpus is sharp on this: most teams open with logistics and
lose the room before they've earned it.

### Story-Evidence Loop

Alternate narrative and proof. Pure story = entertaining but unbelievable.
Pure data = credible but forgettable. Both, alternating, is what makes ideas
stick. For artifact 14: the market-shift section is story-evidence (anecdote
+ analyst data + named industry move). The customer story is story-evidence
(named human + before/after metric).

### Closing Circle

End where you opened — reframed by everything in between. The opening hook's
question is now answered, the opening revelation is now extended into a
direction. This is what creates the sense of a complete arc rather than a
slide deck that just stopped.

### Time Discipline

TED's hard ceiling is 18 minutes. Donovan's framing is that constraint forces
clarity — a 60-minute version of the same idea is almost always weaker. The
corpus echoes this with a launch-specific budget: 25-30 min virtual ceiling,
~40 min in-person ceiling.

### Slide Strategy

Slides support, not distract. Images over text, one idea per slide, never read
the slide aloud. We bake this in as a rendering convention in the system
prompt rather than as a deliverable section.

---

## Corpus citations (Tier-2, top 10 returned)

The corpus query returned a 10-citation, single-author-feel synthesis. Net
contributions beyond the books:

1. **Sales Pitch — Dunford (p.25, p.41, p.129)** — three citations clarifying
   the *boundary* between launch event deck and sales pitch. Direct quote
   adopted: "A sales pitch deck answers 'why us?' A launch event deck answers
   'why now?'" This is the cleanest one-line boundary anyone has written and
   we use it as the audit-doc opening.
2. **Crossing the Chasm — Moore (p.154)** — the "tectonic shift" framing for
   the market-shift section. Adopted as the system-prompt guidance on what a
   real shift is (something moved, the old approach is breaking, a new
   solution category is now possible).
3. **MisUnderstood PMM (p.49)** — the dual-audience framing (customers want
   validation; prospects want vision). Adopted into pre-work.
4. **PMA podcast (×2)** — virtual vs in-person time budgets (25-30 min
   virtual, ~40 min in-person). Adopted as a hard system-prompt constraint.
5. **Sharebird AMAs — Sean Lauer, Ashley Faus** — the "What's Next" insider
   beat (don't promise vaporware; show direction; create anticipation). Net-
   new contribution; neither book covers the post-launch teaser slot.
6. **Weinberg — New Sales Simplified (p.160)** — appeared because the query
   asked about sales-pitch differences. Contributed nothing structural; we
   used it only to confirm we should NOT inherit Weinberg's Power Statement
   into the launch deck (that lives in artifact 21).

### Net-new contributions from corpus

- **"Why us? vs. why now?" boundary line** (Dunford via corpus) — locks the
  audience and intent against artifacts 13 and 19
- **Tectonic shift framing** (Moore via corpus) — sharpens the market-shift
  section beyond Resonate's "What Is" abstraction
- **Dual-audience framing** (existing customers want validation; prospects
  want the future arriving) — added to pre-work
- **The "What's Next" insider beat** (corpus AMAs) — neither Resonate nor TED
  Talk specifies a post-launch direction slot
- **Live demo risk → 90s narrated video** (corpus practitioner POV) — used as
  a system-prompt warning, not a deliverable section
- **Specific time budgets** (25-30 virtual, 40 in-person) — system-prompt
  hard rule
- **Five named failure modes** (feature-heavy, no narrative arc, missing
  emotional beat, no clear CTA, too long) — adopted into the system prompt

### Where book and corpus disagreed

No direct conflicts. Resonate's Sparkline is structurally identical to the
corpus's "shift → launch → proof → CTA" arc; they use different vocabulary
for the same architecture. Where the corpus framing is sharper for B2B
specifics (the dual-audience, the "What's Next" beat, the time budgets), we
adopt the corpus phrasing inside a Sparkline-shaped skeleton. Where Resonate
is sharper conceptually (audience-as-hero, S.T.A.R. moment, mentor stance),
we adopt the book.

### Where they merged

- **Opening hook + What Is** — TED's opening hook lives inside Resonate's
  first What Is beat. We make it a single skeleton section ("Opening hook /
  what is").
- **Customer story + Story-Evidence Loop** — Resonate's S.T.A.R. moment most
  often *is* the customer story. The skeleton calls the customer-story
  section out as the planted S.T.A.R. moment, not just "social proof."
- **Closing Circle + CTA** — TED's closing circle (return to the opening,
  reframed) is collapsed into the CTA section. The CTA is the answer to the
  opening hook, not a new add-on slide.

---

## Boundary calls (vs. adjacent artifacts)

| Adjacent | Difference |
|---|---|
| **13 — Internal launch deck** | Audience: employees / GTM. Goal: enable, not inspire. Internal deck has talk tracks, RACI, Q&A appendix. External (14) is shorter, story-led, single-CTA. No talk track. No internal-only data. |
| **19 — Sales pitch deck** | Audience: one buyer in a deal. 1:1 conversational. Adapts in real time. Ends in commercial Ask. Launch deck (14) is broadcast: 1-to-many, performance, ends in event-CTA (start trial / join beta / book session) not "sign here". |
| **24 — Executive keynote** | Could be the same deck if the keynote IS the launch. Different when keynote is thought-leadership without a product launch attached. Artifact 14 is launch-specific (named product, named release). |
| **31 — Investor / board deck** | Audience: investors. Different metrics surface (TAM, growth, burn). Launch deck doesn't surface those. |
| **32 — Customer all-hands / QBR** | Existing-customer-only, account-level. Launch deck (14) is dual-audience and product-launch-specific. |
| **36 — Webinar deck** | Webinars are thought-leadership or how-to. Launch is event-specific (Dreamforce, customer day, virtual launch broadcast). Webinars rarely have a S.T.A.R. moment; launch decks must. |

**Inheritance:** Strategic narrative (03) seeds the market-shift section.
Positioning (01) seeds the differentiated-value frame for the launch
section. Messaging framework (02) seeds the language. The launch deck
*applies* these upstream artifacts to a specific event.

---

## Template design decisions

**Spine = Sparkline. Delivery = TED layer.** Resonate gives the structural
oscillation; TED gives the time discipline, opening hook rule, and closing
circle. These compose without conflict — TED's three-part structure is a
flatter version of the Sparkline, and we use the Sparkline's deeper
oscillation pattern for the launch event because the audience needs to feel
the shift, not just hear it framed.

**Hero's Journey explicitly rejected.** Same reason as artifact 03: B2B
buyers don't take "fantasy quests." They have a shift to navigate. The
audience-as-hero stance from Resonate is preserved (it's what fixes the
inside-out failure mode); the journey-arc structure is replaced by the
Sparkline (which is Resonate's own preferred B2B-friendly arc).

**Slide-by-slide skeleton, not section-by-section.** Unlike artifacts 1-6
(which produce documents), artifact 14 produces a deck spec. The skeleton
renders one bracketed prompt per slide, in the order the slides appear in
the final deck. This makes the V/B/F-equivalent failure mode (slides
without a through-line) structurally hard to commit.

**Single S.T.A.R. moment, planted explicitly.** The skeleton calls out the
intended S.T.A.R. moment as a pre-work decision: "which slide is the
moment people will quote on LinkedIn afterward?" If that decision isn't
made before drafting, the deck will be informational rather than memorable.

**Single CTA, named in pre-work.** Corpus is unambiguous: one action, not
three. The skeleton enforces one CTA slot. Pre-work asks the user to
choose: trial, beta, demo booking, breakout attendance, contact sales.
"Learn more at our website" is system-prompt-blocked.

**Time budget enforced at the system-prompt level.** 25-30 min virtual,
40 min in-person, ~12-18 slides depending on density. The skeleton is sized
to that budget.

**No talk track, no speaker notes.** Those belong to artifact 24
(executive keynote) which is script + outline. Artifact 14 is the deck
spec only. If the user wants a script for it, they generate the keynote
artifact alongside.

**Validation = the "watercooler test" + the "why now" test.** Two crisp
audit gates at the end of the skeleton — the first borrowed from
Resonate's S.T.A.R. moment principle, the second from the corpus's
"why us vs. why now" boundary.

---

## Section-to-source map

| Skeleton section | Source |
|---|---|
| Pre-work: event format & time budget | Corpus (PMA podcasts: 25-30 virtual, 40 in-person) |
| Pre-work: dual audience | Corpus (MisUnderstood PMM p.49) |
| Pre-work: Idea Worth Spreading | TED Talk (ch.1) |
| Pre-work: planted S.T.A.R. moment | Resonate (S.T.A.R. Moment Framework) |
| Pre-work: single CTA | Corpus (failure-mode taxonomy) |
| Slide 1 — Opening hook | TED Talk (Opening Hook, first 30s) |
| Slides 2-3 — Why now / market shift | Resonate (What Is); Moore (tectonic shift, via corpus); Strategic Narrative inheritance |
| Slides 4-5 — What we're launching | Resonate (What Could Be); Positioning inheritance |
| Slides 6-7 — Demo or proof | Corpus (90s narrated video over live demo); Resonate (showing What Could Be made tangible) |
| Slides 8-9 — Customer story (the S.T.A.R. moment) | Resonate (S.T.A.R. Moment); TED (Story-Evidence Loop) |
| Slide 10 — What's next | Corpus AMAs (Sean Lauer, Ashley Faus — insider direction beat) |
| Slide 11 — CTA / closing circle | TED Talk (Closing Circle); corpus (single CTA rule) |
| Validation: watercooler test | Resonate (S.T.A.R. principle made into audit gate) |
| Validation: "why now vs why us" test | Corpus (Sales Pitch boundary line) |

---

## System-prompt asks (the most important section)

The system prompt is failure-mode-heavy because launch decks have a small
number of universal traps that come from the same root cause: treating the
launch as a feature announcement instead of a moment in a larger story. The
8 negative-guidance lines all suppress some variant of that.

### Negative guidance (8)

1. **No feature-list slides.** Every capability slide must answer "what does
   this make possible that wasn't possible before?" If the slide reads as
   inventory, it's a feature dump and the narrative collapses.
2. **No inside-out language.** "We built", "our platform", "our team is
   excited" — banned from the body slides. The audience is the hero. (From
   Resonate.)
3. **No agenda slide. No logo slide. No "thanks for joining."** Open on a
   provocation. (TED + corpus.)
4. **No live demo without a video safety net.** If the demo is live, the
   skeleton names a 90-second narrated video as the fallback. Live demo
   failure on stage destroys the S.T.A.R. moment.
5. **No more than one CTA.** Pre-work locks the single action; the skeleton
   refuses to render a second. ("Learn more at our website" is not a CTA.)
6. **No vendor name-drops as enemies.** The "old way" is the enemy, never a
   competitor. (Inherits from artifact 03.)
7. **No vaporware in "What's Next."** Directional, not committal. Customers
   should feel like insiders, not like they're being pre-sold roadmap.
8. **No deck longer than time budget.** Virtual: 25-30 min, ~12-15 slides.
   In-person: ~40 min, ~15-18 slides. If the draft exceeds, cut — don't
   speed-talk.

### Positive asks (4)

1. **Sparkline oscillation:** every "what could be" beat must be preceded by
   a "what is" beat. The reader/audience must feel the contrast.
2. **One planted S.T.A.R. moment** named in pre-work and visible in the
   skeleton (most often the customer story climax or the demo reveal).
3. **Pull customer-language from the RAG corpus** when generating the
   customer-story slide and the market-shift framing. Buyer words outperform
   marketer words.
4. **Inherit upstream artifacts when present:** strategic narrative (03)
   seeds the market shift; positioning (01) seeds the launch framing;
   messaging framework (02) seeds the language register.

---

## Open questions for audit

- **Should the demo slide explicitly require a video over a live demo?**
  Currently the skeleton flags both options and warns. Argument for forcing
  video: corpus is firm on demo-failure risk. Argument against: in-person
  events sometimes benefit from live energy. Left as user decision in pre-
  work.
- **Should the customer story slide be marked as the S.T.A.R. moment by
  default, or kept as an open pre-work decision?** Currently open — corpus
  AMAs note that for some launches the demo reveal is a stronger S.T.A.R.
  beat. Forcing customer-story default would over-constrain.
- **Should "what's next" be optional?** Some launch events deliberately end
  on the launched product without a roadmap teaser. Currently the slide is
  in the skeleton but can render as "(omit if not applicable)" — flagging
  for review.
- **Corpus gap:** none surfaced — the query returned a clean synthesis with
  10 citations and no broken-metadata entries.

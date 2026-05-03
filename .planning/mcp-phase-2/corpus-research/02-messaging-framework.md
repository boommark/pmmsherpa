# Research — Messaging Framework

## Canonical sources (read FIRST)

- **Stratton — Punchy** (primary structural source) — VBF Rule, A+ Customer, "So what?" Game, BBQ Talk, Altitude, Messaging Stack, Competitive Messaging Audit
  - Card: `~/Documents/AbhishekR/Book Brain/Punchy.md`
- **Lauchengco — LOVED** (validation / craft criteria) — CAST Framework (Clear, Authentic, Simple, Tested), Storyteller fundamental
  - Card: `~/Documents/AbhishekR/Book Brain/Kaplan - Loved.md`

> Note on the artifact-book-map naming: the map lists "Kaplan - Loved" but the file/book is **Lauchengco — LOVED**. Treated as the same canonical source for this template.

## What the book cards establish

### Punchy — the operational mechanics

**The VBF Rule (the spine of the template).** Outside-in messaging order: **Value → Benefit → Feature**. Most B2B copy starts at F and never reaches V. Every messaging artifact at every level (homepage, deck, email, pitch) reads wrong when it inverts this order. The template skeleton enforces VBF top-down.

**The A+ Customer.** Don't write for a broad persona. Write for one specific archetypal buyer — the one whose week you can describe in granular detail. Messaging written for "everyone" resonates with no one. Pre-work, not a deliverable section.

**The "So what?" Game.** Take a feature → ask "So what?" 3-4 times → arrive at the genuine business outcome. Mechanism for translating F into V. The corpus echo of this is unusually strong (multiple Punchy citations + the synthesized "Three-Layer Stack" article).

**BBQ Talk.** Diagnostic test: would you say this at a barbecue? If your friend would look confused, the messaging is jargon-laden. Forces human-level pain description.

**Altitude (Goldilocks).** Too high = vague ("we help companies grow"). Too low = tactical ("we automate CSV imports"). Right altitude is mid-range: specific enough to feel real, broad enough to apply to the segment.

**The Messaging Stack.** Value Proposition → 3 Benefits → Features per Benefit. This **is** the skeleton. Three is the right count for benefits ("four becomes inventory; two feels incomplete" — corpus echo).

**Competitive Messaging Audit.** Categories converge on 3-5 clichés ("increase efficiency", "unify your data", "enterprise-ready"). If your messaging sounds like competitors', buyers can't tell you apart.

### LOVED — the craft criteria

**CAST framework** for evaluating messaging:
- **Clear** — can a non-expert understand it?
- **Authentic** — does it resonate with how customers actually talk?
- **Simple** — easy to grasp and repeat?
- **Tested** — validated in real customer contexts (not just internal opinion)?

LOVED's contribution is the **validation discipline**. Punchy gives the structure; CAST gives the post-draft test. The Storyteller fundamental also reinforces "framed through authentic stories, not formulas or jargon" — which lines up with BBQ Talk.

### Punchy's central principle (drives the system prompt)

> "Messaging isn't really about your product — it's about the cool new things your buyer will be able to do, be, and feel, thanks to your product."

> "Features are facts. Benefits are feelings. Value is transformation."

---

## Corpus research (amplification)

Top citations from query "What are the essential components of a B2B SaaS messaging framework? What turns features into buyer-resonant value, and what are the most common messaging failure modes?":

| # | Source | What it added |
|---|---|---|
| 1 | **Punchy p.70** (book) | The Three-Layer Stack — direct echo of the Messaging Stack |
| 2 | Stevie Langford / PMA — "What is B2B Messaging" — *Prevalent pitfalls* | Practitioner failure-mode taxonomy (jargon, generic benefits, inside-out) |
| 3 | **Punchy p.87** (book, broken metadata — likely Loved or Punchy ch. on benefits) | "So what?" chain extended into CFO-language test |
| 4 | **Punchy p.18** (book) | A+ Customer / outside-in framing |
| 5 | **Punchy p.5** (book) | Inside-out vs outside-in opening principle |
| 6 | The Go To Market Strategist p.127 | Value-prop placement in GTM brief context (adjacent, not core) |
| 7 | PMA — "GTM SaaS in emerging markets" — *Message for real people* | Reinforces BBQ-Talk principle (no MBA-speak) |
| 8 | Stevie Langford / PMA — *Crafting a robust B2B messaging framework* | Practitioner template — three-tier hierarchy matches Punchy stack |
| 9 | PMA — *How to build GTM strategy for SaaS* — *Step 2: Define clear value propositions* | "Could a competitor use this verbatim?" filter — corpus addition |

### Corpus addition: the **competitor-verbatim test**

The synthesized RAG response surfaced a sharper filter than either book states explicitly:

> "Could your three closest competitors use your exact benefit statement without changing a word? If yes, you don't have differentiated messaging. You have category description."

This is consistent with Punchy's Competitive Messaging Audit but operationalizes it as a per-statement gut check. **Adopted as a template validation step.**

### Where book and corpus aligned (no conflict)

- VBF / Three-Layer Stack — Punchy p.70 + corpus synthesis are essentially the same artifact
- Failure modes — corpus adds "jargon as trust signal" framing on top of Punchy's BBQ Talk
- "So what?" chain — corpus adds the *don't go too far* warning ("don't end at 'makes money' — every competitor can say that") that Punchy implies but doesn't state explicitly. Merged into the template's "So what?" prompt.

### Where they diverged

**Number of benefits.** Some PMA practitioner blogs suggest 3-5 benefits or "value pillars". Punchy is firm at **3** ("four becomes inventory; two feels incomplete"). **Punchy wins** — included in skeleton as "exactly 3 benefits".

**Tone of differentiation statement.** PMA convention treats positioning and messaging as overlapping; Punchy keeps them distinct (positioning = upstream strategic doc, messaging = customer-facing copy hierarchy). The template defers to Punchy and treats positioning as a **prerequisite input** (linkable to the positioning_statement artifact), not a section of the messaging framework.

### Corpus metadata gap (logged)

- Citation #3 returned `[book] ? p.87` with no title/author — pattern matches Punchy's chunk style and likely is Punchy or Loved. Logged in `corpus-gaps.md`.

---

## Template design decisions

**Skeleton = Punchy's Messaging Stack, top-down.**
1. A+ Customer (pre-work)
2. Value Proposition (one sentence)
3. Three Benefits (exactly three; each = V → B → F triplet)
4. Proof / evidence per benefit (corpus addition — practitioners consistently include this)
5. Differentiation statement (Competitive Messaging Audit output, condensed)
6. CAST validation block (LOVED)

**Pre-work section.** Punchy is emphatic that the A+ Customer must be defined before drafting. Plus a positioning-doc pointer (does the team have a positioning statement? messaging without positioning produces incoherent stacks).

**Three benefits, locked.** Skeleton renders three benefit blocks. The bracketed prompt warns against expansion.

**Each benefit as VBF triplet.** Per Punchy: Value claim → Benefit explanation → Feature support. Skeleton enforces this nesting per benefit so the model can't write a feature-led benefit.

**"So what?" prompt embedded inline.** Each benefit's bracketed prompt asks the model to verify it survives 3 rounds of "so what?" without ending at generic outcomes ("makes money", "saves time").

**BBQ Talk + competitor-verbatim test live in CAST validation.** Two filters:
- *BBQ Talk*: would a smart non-expert friend understand each line?
- *Competitor-verbatim*: could three named competitors use this exact statement?

**Differentiation statement section.** Short — one paragraph. Sources the Competitive Messaging Audit output (cliché map → unclaimed territory). Not a full audit doc; that's a separate artifact.

**Excluded from this template:**
- Full Competitive Messaging Audit table — separate artifact (battlecard / comparison_matrix)
- Full A+ Customer profile — separate artifact (buyer_persona)
- Positioning statement components (Distinct Capabilities, Best-Fit Accounts, etc.) — that's the positioning_statement artifact
- Boilerplate / brand voice — not messaging-framework
- Channel-specific copy (homepage, email, deck) — those are downstream artifacts

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work: A+ Customer + positioning input | Punchy (A+) | Without this, the stack is ungrounded |
| Value Proposition | Punchy (Messaging Stack) + corpus | Top of stack; one sentence the buyer's boss can repeat |
| Benefit 1/2/3 (VBF triplets, exactly 3) | Punchy (VBF Rule, Messaging Stack) | Operational core; locked at three |
| Proof / evidence per benefit | Corpus (practitioner pattern) | Benefits without evidence are claims; light proof here |
| Differentiation statement | Punchy (Competitive Messaging Audit) | Stake your claim — what competitors can't say |
| CAST validation (Clear, Authentic, Simple, Tested) | LOVED | Post-draft craft check |
| BBQ Talk + competitor-verbatim filter | Punchy + corpus | Two sharpest plain-language tests |

## Sections excluded

- Mission / vision / brand pillars (different artifact)
- Tone of voice / brand guidelines (different artifact)
- Persona empathy maps (buyer_persona)
- Tagline / boilerplate (downstream copy)
- "Why now" / market trends (positioning, not messaging)
- Channel-specific message variants (downstream artifacts: landing page, ad copy, etc.)

## System prompt failure modes (negative guidance)

Distilled from Punchy + corpus practitioner pitfalls:

1. **Inside-out language** — writing about the product/team/tech instead of the buyer's transformation
2. **Feature-first leads** — opening with a capability before the value it produces (VBF inversion)
3. **Jargon as trust signal** — "AI-native, frictionless, purpose-driven platform" — fails BBQ Talk
4. **Generic benefits** — "increase efficiency", "streamline operations" — anything a competitor could lift verbatim
5. **Wrong altitude** — too high (says nothing) or too low (loses aspiration)
6. **Four-or-more benefits** — three is the canonical count; expanding dilutes the stack
7. **"So what?" run aground** — chasing the chain all the way to "makes money / saves money" and losing differentiation
8. **Skipping the A+ customer** — drafting before the specific buyer is named in detail

Required behaviors:
- Pull buyer language from corpus (Sharebird AMAs, customer-quote chunks) when generating benefits — buyers' words beat marketers' words
- If positioning_statement artifact exists for this user, **inherit Differentiated Value themes** as the input to the three Benefits
- Always render exactly **three** benefit blocks
- Every benefit must contain V, B, and F components in that order

Voice rule: do not name-drop authors (Stratton, Lauchengco) in skeleton or system prompt. Frameworks referenced implicitly.

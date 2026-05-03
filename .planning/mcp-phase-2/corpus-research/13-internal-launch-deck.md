# Research — 13 Internal Launch Deck

## Canonical sources (read FIRST)

- **Duarte — Resonate** — primary structural source for the *deck arc*. Card: `~/Documents/AbhishekR/Book Brain/Duarte - Resonate.md`. Frameworks pulled: Sparkline (what is / what could be oscillation), Audience-as-Hero / Mentor stance, S.T.A.R. moment, Big Idea.
- **Duarte & Sanchez — Illuminate** — primary structural source for the *change-comm psychology*. Card: `~/Documents/AbhishekR/Book Brain/Illuminate.md`. Frameworks pulled: Torchbearer model, Empathetic Listening Strategy (ask before tell), Threshold Crossing (commitment moment), Symbolic Artifacts, Four-Stage Toolkit (speeches / stories / ceremonies / symbols).

## What the book cards establish

### Resonate (deck arc)

- **Sparkline.** A presentation oscillates between *what is* (today's frustrating reality) and *what could be* (the new world after change). Each oscillation deepens engagement until the call to action lands as inevitable. **This is the dramatic spine of the deck — not a linear "context → product → ask" march.** The internal-launch context: oscillate between *what your colleagues feel today* (deal slipping on objection X, CS escalation Y, support backlog Z) and *what could be* (new motion that closes that loop), so each role sees their own pain inside the arc.
- **Audience as the hero, presenter as the mentor.** The launch lead is *not* the hero of the deck. Sales reps, CS managers, support agents, marketers, and PMs are the heroes. The launch lead is the mentor who hands them the tools (pitch language, qualification questions, expansion triggers) so they can win in their own world. Inverting this is the #1 internal-deck failure: making the deck about the *team* that built the launch, not the team that will *carry* it.
- **S.T.A.R. moment.** Plant one Something They'll Always Remember moment — a customer clip, a single shocking stat, a symbol. Internal launches are remembered by their S.T.A.R. moment, not their slide count.
- **Big Idea.** One sentence that captures what the launch is and why it matters — strong enough to be repeated by an SDR in a hallway. If the deck doesn't surface a Big Idea, employees walk out remembering their feature list, not their movement.

### Illuminate (change-comm psychology)

- **Torchbearer model.** A launch lead is a *torchbearer* using speeches (the all-hands), stories (customer footage, case studies), ceremonies (the all-hands itself, the GA moment, the first-deal-won celebration), and symbols (logo on the slide, ICP card, naming convention) to illuminate the path for *travelers* (the company's employees) through change.
- **Empathetic Listening BEFORE telling.** The torchbearer asks before they tell. What is the team's current pain? What change is this launch asking of them? What new behavior must they adopt? The deck must reflect that the launch lead has heard the team, not just informed them. Operationalised in the corpus pattern of an "early preview cohort" (10 reps two weeks before all-hands).
- **Threshold Crossing / commitment moment.** Travelers don't change just because they're informed; they change at a *threshold moment* where they choose to commit. The deck has to engineer that moment — typically the role-by-role asks slide. Without an explicit "your team's specific behavior change starting Monday," the threshold isn't crossed and employees walk out as observers, not participants.
- **Symbolic artifacts.** Ordinary objects acquire meaning when embedded in the moment — a launch codename, a rallying cry, a shared metric, a screenshot used as a memetic image. The deck should plant 1–2 symbols that the company will reuse for the next 90 days.
- **Four-stage toolkit.** Speeches, stories, ceremonies, symbols. The all-hands is one ceremony in a longer change journey; the deck must point forward to the *next* ceremonies (30/60/90 check-ins, first-deal celebration) so the launch isn't a one-off event.

## Corpus research (amplification)

The corpus query returned a tight, high-signal synthesis. Top citations:

1. **Lawrence Chapman / PMA — "The importance of internal communication"** (3 sections) — Practitioner failure modes: silos, no clear ask, no role accountability. Reinforces Illuminate's empathetic-listening principle.
2. **Charlene Wang AMA** (Sharebird) — Internal launch communication patterns.
3. **Brandon Benke AMA** (Sharebird) — Sales enablement on launch day.
4. **Anna Wiggins AMA** (Sharebird) — Cross-functional launch coordination.
5. **Pocket Guide to Product Launches pp. 21, 49** — Tier model + internal vs external launch boundaries (already canonical for artifact 09).
6. **Melissa Breker / PMA — "How to strengthen your change muscle"** — Change-comm for internal teams. Echoes Illuminate's traveler/torchbearer dynamic.

The corpus produced a structurally usable 8-section outline that maps cleanly onto the books:

| Corpus section | Book equivalent |
|---|---|
| Context: Why Now | Sparkline opening *what is* + Illuminate "ask before tell" |
| What We're Launching | Sparkline "what could be" first beat |
| Why We're Winning | Big Idea (Resonate) |
| Sales Motion | Mentor's tools handed to the hero (Resonate) |
| Role-by-Role Asks | Threshold Crossing moment (Illuminate) |
| Success Metrics | Symbolic artifact — the metric becomes a rallying number (Illuminate) |
| Timeline | Four-stage toolkit pointing forward to next ceremonies (Illuminate) |
| FAQ Pointer | Boundary: living document, not a slide |

**Net-new corpus additions** beyond the books:
- The "repurposed pitch deck" failure mode, named explicitly.
- One-slide-per-role discipline ("specific enough that someone reading it at 8am before a customer call knows exactly what to do").
- Outcome metrics over activity metrics ("did the launch *work*, not *happen*").
- Live Q&A + Slack channel for psychological safety — codified.
- Early preview cohort (10 reps two weeks early) as a torchbearer technique.

## Where the books and corpus disagreed — and which won

- **Linear vs Sparkline arc.** The corpus presents the deck as a linear 8-section march. Resonate is firm: presentations that drive change *oscillate* between today's pain and tomorrow's reality. **Winner: Resonate (book).** The skeleton uses the corpus's 8 sections as the skeleton order but instructs the LLM to *oscillate within them* — every role-by-role ask carries a what-is/what-could-be beat for that role.
- **Hero of the deck.** Default corporate decks make the launch team the hero ("we built this"). Resonate is unambiguous: the audience is the hero. **Winner: Resonate.** Encoded into the system prompt as a negative-guidance line.
- **Information vs commitment.** The corpus correctly names "no clear ask" as a failure but treats it as a checklist item. Illuminate frames it as a *threshold-crossing* moment — psychologically deeper. **Winner: Illuminate.** The role-by-role asks slide is named the threshold moment and gets explicit commitment-language framing in the bracketed prompt.

## Where they merged

- **Role-by-role asks.** Corpus gave the operational structure (one slide per role, specific action). Illuminate gave the psychological framing (this is the threshold moment, employees become torchbearers themselves). Combined into a single section with both.
- **Symbolic artifacts + S.T.A.R. moment.** Resonate's S.T.A.R. and Illuminate's Symbol are different names for the same idea (a planted moment that becomes the thing people remember). Merged into one prompt to plant exactly one of each per deck.
- **Empathetic listening + early preview cohort.** Illuminate's "ask before tell" + corpus's "10 reps two weeks early" are the same practice at different abstraction levels. Encoded into pre-work.

## Template design decisions

**Authority hierarchy.** Illuminate (torchbearer / change-comm psychology) is the dominant lens because the artifact's *purpose* is internal change. Resonate (Sparkline / mentor) drives the *deck arc*. Corpus drives the *operational sections* (role asks, metrics, timeline).

**8 corpus sections kept as skeleton order.** They are correct for the artifact and recognizable to PMM teams. We don't re-invent the structure — we reframe each section through the torchbearer/Sparkline lens via bracketed prompts.

**Pre-work as Step 0.** Three pre-work items: (1) Have you listened first (early preview cohort or rep interviews)? (2) Anchor audience (which role's threshold matters most this quarter)? (3) Big Idea (one sentence). Skipping pre-work is the first failure mode Illuminate calls out (telling without asking).

**Skeleton outputs prompts, not slides.** Per the constraint — the LLM generates *content prompts* slide-by-slide; the user converts to slides downstream. Each skeleton section is bracketed: "Slide X: [prompt for what this slide should contain]." This matches how PMM teams build decks.

**One S.T.A.R. moment + one symbol.** Required, not optional. Decks without a planted moment are forgotten by Friday.

**Threshold-crossing language on the role-asks slide.** Explicit framing that this is the moment where employees become torchbearers themselves — not a checklist, a commitment.

**Forward-pointing toolkit (next ceremonies).** Timeline section names the 30/60/90 check-ins as ceremonies, not status meetings, so the launch isn't a one-off event.

## Section-by-section rationale

| Slide / section | Source | Why included |
|---|---|---|
| Pre-work | Illuminate (empathetic listening) + corpus (preview cohort) | Listening before telling. Anchor audience. Big Idea. |
| Slide 1: Big Idea / cold open | Resonate (Big Idea + S.T.A.R.) | Deck must lead with one repeatable sentence + a planted moment. |
| Slide 2: Context — why now | Resonate (Sparkline *what is*) + corpus | Names the shift / pain that triggered the launch. Confirmation, not education. |
| Slide 3: What we're launching | Corpus (one demo / screenshot) | Crisp product description anchored to the job, not the feature list. |
| Slide 4: Why we're winning | Resonate (Big Idea distilled) + corpus | Differentiated position, not a feature list. The line sales will memorize. |
| Slide 5: Sales motion | Corpus + Resonate (mentor's tools) | ICP, qualification, top objections, packaging changes. |
| Slide 6: Role-by-role asks (Sales / CS / Support / Marketing / Product) | Illuminate (Threshold Crossing) + corpus | THE threshold moment. One slide per role. Specific behavior change. |
| Slide 7: Success metrics | Illuminate (symbolic metric) + corpus | Outcome metrics, not activity. The number becomes a rallying symbol. |
| Slide 8: Timeline | Illuminate (forward-pointing ceremonies) + corpus | Embargo / GA / 30/60/90 ceremonies. |
| Slide 9: FAQ pointer | Corpus | Living doc link, not a slide. Signals ownership. |
| Slide 10: Q&A + Slack channel | Illuminate (psychological safety) + corpus | Confusion is acceptable. Live channel beats nodding. |

## Sections explicitly excluded

- **Customer pitch language.** That belongs to artifact 14 (customer-facing launch deck) and 19 (sales pitch deck). The internal deck *links* to those, doesn't duplicate them.
- **Battlecard depth.** Top 2-3 objections only — full battlecard is artifact 16.
- **Marketing campaign copy.** Belongs to launch plan (09) and downstream content artifacts.
- **Live FAQ content.** Pointer only; FAQ is artifact 12.
- **Investor / board framing.** Different audience entirely (artifact 31).

## System prompt failure modes (negative guidance)

From book + corpus, distilled to 7:

1. **Repurposed pitch deck** — investor / external buyer language repurposed for an internal audience ("we're disrupting the $40B market" means nothing to a support rep). Rewrite for the audience or rebuild the deck.
2. **Launch team as hero** — slides about *us* (the team that built it) instead of *them* (the team that will carry it). The audience is the hero; the launch lead is the mentor / torchbearer.
3. **No clear ask** — deck ends on "questions?" and everyone walks out unsure what they're supposed to do differently Monday. Every role gets a specific behavioral commitment.
4. **Same generic message for everyone** — treating sales, CS, support, marketing, product as one audience. A CS manager and an SDR have completely different jobs after a launch. One slide per role, or no role slides at all (and accept the launch will under-perform).
5. **Linear march, no oscillation** — context → product → ask in a flat line. The deck must oscillate between today's pain and tomorrow's reality so each role sees their own world reflected.
6. **No S.T.A.R. moment / no symbol** — decks without a planted, memorable beat (a customer clip, a single stat, a codename) are forgotten by Friday.
7. **One-off event framing** — treating the all-hands as the end of the launch instead of one ceremony in a 90-day arc. The timeline must point forward to the next ceremonies (30/60/90 check-ins, first-deal celebration).

Voice rule: Reference Duarte / Sanchez / Resonate / Illuminate / torchbearer model implicitly. Do not name-drop authors or framework names in the output.

## Open questions / corpus gaps

- The corpus returned no specific guidance on **deck length**. The skeleton lands on ~10 slides as an upper bound; a single Pocket Guide citation suggests "tighter is better" but doesn't quantify. Open for user audit.
- **Live Q&A vs async Slack channel.** Both are recommended; the skeleton includes both as a final slide pair. Whether to make Slack channel optional is open.
- **No book named "Illuminate" in the corpus** despite being canonical. The torchbearer model surfaced only via the Melissa Breker PMA blog (paraphrase). Logged in `corpus-gaps.md`-equivalent: Illuminate book content has not been ingested. Did not block this template since the book card carried the framework directly.

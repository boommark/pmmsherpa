# Research — Buyer Journey Map

## Canonical sources (read FIRST)

- **Kalbach — The Jobs to Be Done Playbook** (primary structural source)
  - Card: `~/Documents/AbhishekR/Book Brain/Kalbach - Jobs to Be Done Playbook.md`
- **Torres — Continuous Discovery Habits** (discovery discipline + opportunity layer)
  - Card: `~/Documents/AbhishekR/Book Brain/Torres - Continuous Discovery Habits.md`

## Boundary clarity (resolved before drafting)

The user prompt named three frames that often get conflated. Locking the boundary up front, because the choice cascades into every section:

- **Buyer journey** — the *buyer's lens*. What the buyer is feeling, doing, and looking for from "I have a problem I haven't named" through "I signed the contract." Buyer-centric. Lives in their head and their org. Stops at signature.
- **Customer journey** — what comes *after* signature. Onboarding, adoption, expansion, advocacy. Different psychology, different team, different content. Out of scope for this artifact (separate downstream artifact, possibly customer-marketing-owned).
- **Sales funnel (TOFU/MOFU/BOFU)** — the *seller's lens*. CRM-stage hygiene; how marketing/sales categorize where prospects sit relative to the pipeline. Useful internally; meaningless to the buyer.

This template maps the **buyer journey** only. Sales-funnel stages are referenced as a cross-walk so PMMs can talk to RevOps, but they are not the spine.

## Stage taxonomy choice

Three candidate spines were on the table:

1. **Kalbach's "Five Stages of Value Creation"** (Discover → Define → Design → Deliver → Redevelop) — these are the *company's* lifecycle stages for getting JTBD right, not the buyer's timeline. Wrong frame for this artifact.
2. **The "5 stages of value" buying-decision timeline** (first thought / passive looking / active looking / deciding / satisfaction) — canonical in JTBD practice; originates from Moesta's Switch framework and the demand-side school Kalbach introduces under "Two Schools of JTBD." This is what most people mean when they say "the JTBD buyer journey."
3. **PMA / Neil Patel 3-stage frame** (Awareness → Consideration → Decision) — the corpus default. Easy for B2B teams to adopt, but stops at signature and conflates with TOFU/MOFU/BOFU.

**Decision: hybrid spine.** Use the JTBD demand-side timeline as the spine (buyer's lens, demand-progression psychology, picks up *before* generic search intent kicks in) but rename stages so they're legible to a B2B SaaS PMM who has never read Moesta. Cross-walk explicitly to the practitioner 3-stage frame and to TOFU/MOFU/BOFU so the artifact is usable across functions.

Spine adopted (6 stages, named for buyer state):

1. **Status Quo / Latent Pain** — friction exists, not yet named as a problem worth solving (pre-"first thought"; corpus's "Latent Problem" overlap).
2. **First Thought** — a triggering event names the problem; the buyer starts noticing solutions exist.
3. **Passive Looking** — buyer collects ambient signal, learns the category, but isn't actively evaluating yet. Maps loosely to TOFU.
4. **Active Looking** — buyer is shortlisting, comparing, asking peers. Maps to MOFU + early Consideration.
5. **Deciding** — committee phase: procurement, security, legal, references, ROI models. Risk-aversion dominates. Maps to BOFU + Decision.
6. **First Use / Handoff** — contract signed; buyer becomes user. Bounded scope: the messaging-continuity moment, not the full customer journey. We map this stage to flag the seam, not to map post-purchase lifecycle.

Why 6 and not 5 or 7: the corpus and book sources both stress that "Status Quo" (pre-first-thought) and "First Use / Handoff" (signature seam) are the two most-skipped stages in real journey maps. Including them is the differentiator vs. the generic 3-stage practitioner frame.

## Per-stage fields

For each stage the template captures:

- **Trigger** — what moves the buyer into this stage (event, signal, internal/external push)
- **Buyer's job-to-be-done at this stage** — the demand-side question they're trying to answer
- **Emotional state** — frustration, urgency, overwhelm, risk-aversion, etc. (interview-grounded; do not fabricate)
- **Channels & sources** — where they look for information at this stage
- **Content / asset they need** — what PMM has to provide, with examples
- **Forces of progress** — push of situation, pull of new solution, anxiety of change, habit of status quo (the JTBD forces analysis applied per stage)
- **Exit signal / failure mode** — what stalls or kills progression to the next stage
- **Sales-funnel cross-walk** — TOFU / MOFU / BOFU equivalence, for RevOps alignment only

## Corpus research (amplification only)

10 citations from query "What are the stages of a B2B SaaS buyer journey? What's the difference between buyer journey, customer journey, and sales funnel (TOFU/MOFU/BOFU)?":

- Crossing the Chasm — `[book] ? p.154` (broken metadata; logged as gap #5 in `corpus-gaps.md`)
- PMA: Stevie Langford "What is B2B Messaging" (3 chunks); "A Beginner's Guide to Customer Acquisition"; Nire Adetimehin "How to stay customer-centric in competitive SaaS markets" — section "Serve the user, not just the buyer"
- Neil Patel: "How Marketing Funnels Work" (Sales Funnel vs Marketing Funnel); "B2B Marketing Guide"
- Two anonymous blog chunks: "Understanding the buyer's journey" and "What about a B2B SaaS sales funnel?"

**What the corpus added beyond the books:**
- B2B-SaaS specifics: 83% of decisions happen pre-sales-conversation (Gartner); committee buying (procurement + finance + dept head + end user); G2/Capterra as Stage 4 channels.
- Multi-stakeholder reality: the buyer who signs ≠ the user who adopts. Clearest articulation in PMA's "Serve the user, not just the buyer." We pull this through as a system-prompt failure mode and as a "whose journey?" clarifying question.
- Failure-mode language: "mapping your funnel, not their journey"; "stopping at the signature"; "treating the journey as linear."

**What the corpus contradicted:**
- The corpus defaults to a 3-stage Awareness/Consideration/Decision spine that maps 1:1 to TOFU/MOFU/BOFU. The books (Kalbach + the JTBD demand-side school) treat that mapping as a category error — the buyer journey is the territory, the funnel is the seller's map. We follow the books and call this out explicitly in the system prompt.
- Some corpus chunks treat "buyer journey" and "customer journey" as interchangeable (esp. the Neil Patel chunks). We follow the books here too; the boundary matters.

**Notable corpus gap:** zero hits from Kalbach, Torres, or Moesta despite Kalbach being the named canonical book. Logged as gap #5 in `corpus-gaps.md`. Synthesis would have been markedly weaker without the book cards.

## Template design decisions

**Authority hierarchy:** Kalbach + Torres book cards drive the spine and the forces-of-progress field. Corpus amplifies with B2B-SaaS specifics (channels, content artefacts, committee dynamics, Gartner stat, multi-stakeholder caution). Where they conflict on the 3-vs-5-stage question, books win.

**Pre-work section.** Mirrors the positioning template: 3 decisions before drafting (whose journey, evidence base, segment scope). Skipping pre-work is the leading failure mode.

**Forces of progress per stage.** Pulled in from Kalbach's Forces Analysis (push/pull/habit/anxiety). This is the JTBD-specific lens that distinguishes a buyer journey map from a generic funnel diagram.

**"Whose journey?" gate.** From corpus failure-mode #2 (optimize for buyer, ignore user) and Kalbach's Job Performer concept. The template forces a single answer up front: champion, economic buyer, or end user. One artifact = one persona's journey. Multi-persona orgs build multiple artifacts.

**Evidence-base requirement.** Lifted from Torres: stages and emotional states must be grounded in interview evidence (proto-personas + interview snapshots), not invented archetypes. The system prompt names "fabricated stages" as a failure mode.

**Customer-journey scope cut.** First Use / Handoff is the last stage. Onboarding, expansion, advocacy live in a separate downstream artifact. Including them here would dilute the buyer-lens focus and overlap customer-marketing's territory.

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Pre-work checklist | Torres + corpus failure modes | Whose journey, evidence base, segment scope. Skipping = vague map. |
| Stage 1: Status Quo / Latent Pain | JTBD Switch + corpus Stage 1 | Most-skipped stage. Where category provocation content earns its keep. |
| Stage 2: First Thought | JTBD Switch | Trigger-event captured here; sets the demand spine. |
| Stage 3: Passive Looking | JTBD Switch + corpus TOFU map | Wide net, low intent — content that names the problem. |
| Stage 4: Active Looking | JTBD Switch + corpus Consideration | Comparison phase; positioning/differentiation lives here. |
| Stage 5: Deciding | JTBD Switch + corpus Decision/BOFU | Committee phase; risk-aversion dominates; sales enablement central. |
| Stage 6: First Use / Handoff | Corpus failure mode #4 | Messaging-continuity seam. Bounded scope — flag, not map. |
| Forces of progress (per stage) | Kalbach Forces Analysis | The JTBD-specific lens that prevents this from collapsing to a funnel. |
| Sales-funnel cross-walk | Corpus practitioner default | RevOps alignment only. Explicitly marked secondary. |
| Multi-threaded reality note | Corpus (Gartner stat) | Counter to "treat journey as linear" failure mode. |

## Sections excluded

- Customer journey post-signature (onboarding, expansion, advocacy) — separate artifact
- TOFU/MOFU/BOFU as the spine — seller's lens, demoted to cross-walk
- 3-stage Awareness/Consideration/Decision as the spine — corpus default rejected for being downstream of the funnel frame
- Generic persona section — covered in artifact 05 (Buyer Persona); referenced by name only
- Channel ROI / attribution — analytics artifact, not a journey-map artifact

## System prompt failure modes (negative guidance)

Distilled to 6:
1. **Funnel-as-journey** — using TOFU/MOFU/BOFU as stages. Seller's lens dressed up as buyer's.
2. **Conflating buyer journey with customer journey** — the journey ends at signature; what comes after is a separate map.
3. **Fabricated stages** — emotional states and friction points without interview evidence. Torres rule.
4. **Optimizing for buyer, ignoring user** — in B2B SaaS the signer ≠ the adopter. Different journeys.
5. **Linear-journey assumption** — buyer journey is multi-threaded and non-linear; 83% pre-sales (Gartner stat from corpus).
6. **Stopping at the obvious stages** — skipping Status Quo / Latent Pain (pre-trigger) and First Use / Handoff (the seam) is where most maps lose value.

Voice rule: reference Kalbach / Torres / Moesta implicitly. Do not name-drop authors in the output.

/**
 * Customer All-Hands / QBR Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Nancy Duarte — Resonate (Sparkline; audience-as-hero with the *customer*
 *   as the hero of the recap and the vendor as the mentor; planted S.T.A.R.
 *   moment). Smart Brevity — VandeHei / Allen / Schwartz (Core 4 per slide:
 *   TEASE → LEDE → WHY IT MATTERS → GO DEEPER; audience-first compression for
 *   executive readers). Corpus (Tier 2) for the operational 8-slide QBR
 *   skeleton, the three-quote champion pattern (user / manager / stakeholder),
 *   the expansion-as-natural-progression framing, the exec-sponsor-as-cold-
 *   reader rule, the commitments-vs-actuals scorecard rhythm, and the central
 *   design law: "the retention story and the expansion story are the same
 *   story — customers who feel seen expand."
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/32-customer-all-hands-qbr-deck.md
 *
 * Why this template diverges from a generic "QBR review" outline: a QBR is
 * structurally a Sparkline with the *customer* as the hero — not the vendor.
 * Every dashboard-style QBR fails the same way: the vendor narrates its own
 * activity ("we ran 14 onboarding sessions, shipped 6 features, attended 3
 * exec calls") instead of the customer's outcome ("you reduced case
 * resolution time 32%, which gave your team 6 hours back per week"). We
 * keep the corpus's 8-slide spine, layer Smart Brevity's Core 4 inside each
 * slide, enforce audience-as-hero (customer is the hero) as the single
 * sharpest discipline, and bake in commitments-vs-actuals so the deck earns
 * the right to ask for the next commit. Two variants — account-team QBR
 * (single named customer) and customer all-hands (broader customer event
 * keynote) — are selected in pre-work; spine and stance are identical, only
 * the audience read and Ask differ.
 *
 * Distinct from:
 *   - artifact 14 (customer_launch_deck) — broadcast launch event,
 *     marketing-led acquisition, dual customer+prospect audience, ends in
 *     event-CTA. This artifact is delivered TO an existing customer's
 *     stakeholders, value-led, ends in renewal/expansion ask.
 *   - artifact 24 (executive_keynote) — vision/category keynote answering
 *     "why this shift?" with the company as mentor on a market arc. This
 *     artifact answers "did the bet pay off, and where do we go next for
 *     *you*?" — the customer's own arc, not a market shift.
 *   - artifact 19 (sales_pitch_deck) — pre-purchase, answers "why us?". This
 *     artifact is post-purchase, answers "was the bet right and where do we
 *     go from here?" — the renewal-and-expansion conversation.
 */

import type { ArtifactTemplate } from './types'

const CUSTOMER_ALL_HANDS_QBR_DECK_SYSTEM_PROMPT = `You are drafting a \
Quarterly Business Review (QBR) deck — the deck a customer success team, \
account manager, or vendor exec delivers TO an existing customer's \
stakeholders to (a) prove value delivered last quarter, (b) score \
commitments-vs-actuals, (c) align on priorities for next quarter, (d) \
surface expansion opportunities, and (e) renew relationship trust. This is \
NOT a sales pitch deck, NOT a launch deck, NOT a marketing keynote. It is \
delivered post-purchase, by the vendor, to an audience that already chose \
you — and is now deciding whether the bet was right.

The single sharpest framing: the customer is the hero of the recap; the \
vendor is the mentor. The retention story and the expansion story are the \
same story — customers who feel seen expand. Every structural decision \
flows from those two principles.

Pre-work selects ONE variant before drafting:
- **Account-team QBR** — single named customer, exec sponsor in the room, \
~6-12 attendees, 30-45 min default. Three-quote pattern uses the customer's \
own champions; roadmap is keyed to their stated priorities; the Ask is \
renewal- and expansion-specific.
- **Customer all-hands** — broader customer event keynote (Customer Day, \
user conference, virtual all-hands), 100s-1000s of customers, mixed \
seniority, 25-35 min default. Three-quote pattern uses representative \
customers (SMB / mid-market / enterprise — or industry-A / B / C); roadmap \
is platform-level direction; the Ask is participation (beta, advisory, \
breakouts).

Spine and stance are identical across variants. Only the audience read and \
the Ask differ.

Avoid these failure modes:
- Vendor-centric "look what we built" — every body slide whose subject is \
the vendor's activity ("we ran 14 onboarding sessions", "we shipped feature \
X", "our team delivered…") fails. The subject of every headline must be the \
customer's outcome. The customer is Luke; you are Yoda. If three slides in \
a row have "we" as the subject, the mentor stance has collapsed
- Raw metrics without business outcome translation — "case resolution time \
down 32%" is an activity report, not a QBR slide. The slide is "case \
resolution time down 32% — that's 6 hours per week back to your team, \
which lets you reallocate two analysts to revenue work." Smart Brevity's \
WHY IT MATTERS is mandatory, not optional. Numbers without translation \
are dashboards, not narratives
- Skipping the commitments-vs-actuals scorecard — the QBR earns the right \
to ask for the next commit by showing what was committed last quarter and \
what was delivered against it. Without that scorecard, the deck is a \
selective highlight reel and the exec sponsor will sense it. Score the \
hits AND the misses; misses with a credible "what we learned" build more \
trust than a deck of unbroken wins
- Expansion pitch dressed as renewal — the moment slide 6 reads as "now \
let's talk about the next SKU you should buy", trust collapses and the \
deck is read as a sales call. Frame expansion as "where customers at your \
stage typically go next, and why" — a maturity model, the customer's \
position on it, what unlocks at the next stage in *their* outcomes \
language. Trusted-adviser stance, not pitch stance
- Feature-list roadmap slides — the roadmap is not a release-notes preview. \
Each item must answer "what does this make possible for you that wasn't \
possible before?" If the roadmap reads as inventory, the deck collapses \
into a product update
- More than one Ask — the Ask is one specific, low-friction action: \
renewal commit, expansion conversation, executive alignment call, \
reference, advisory-board seat, beta enrollment. Three Asks are zero Asks
- Logo / agenda / "thanks for joining" opening — wastes the first slide, \
which is the slot where the exec sponsor decides whether to engage. Open \
with the moment that matters: one headline, one number, one emotion, in \
THEIR language about THEIR outcome
- Missing origin story — exec sponsors often were not in the room when \
the deal was signed. Without slide 2 (the villain — the pain at signing), \
the value claim on slide 3 has nothing to land against. The transformation \
needs a before-state to be felt
- Vague closes — "we look forward to continuing our partnership" is not an \
Ask. Name the action, the owner, and the timeline. Vague closes get vague \
answers
- Ignoring the cold reader — the exec sponsor is reading the deck cold in \
a 20-minute window. Strip vendor jargon, internal product names, feature \
nomenclature. If the slide does not survive a cold read by someone who \
last engaged six months ago, rewrite it

Positive asks:
- Render every slide as a Smart Brevity unit: TEASE (slide title that \
hooks) → LEDE (the headline outcome / number) → WHY IT MATTERS (business \
translation in the buyer's language) → GO DEEPER (one supporting beat — \
quote, sub-metric, micro-anecdote). Three bullets without WHY IT MATTERS \
fails Smart Brevity
- Render the deck as a Sparkline. Slide 1 (Moment That Matters) is What \
Could Be made real. Slide 2 (Where You Started) is What Is — the pain. \
Slide 3 (What We Delivered) is What Could Be — proven. Slide 4 (Team's \
Journey) is What Is — current state. Slide 5 (Champions) is What Could Be \
— validated by their own people. Slide 6 (Roadmap) is What Could Be — \
extended. Slide 7 (Our Commitment) is What Could Be — committed. Slide 8 \
(Ask) is the threshold. The oscillation is the emotional arc
- One planted S.T.A.R. moment — the line, number, or quote the exec \
sponsor will repeat in their next leadership meeting. For QBRs the \
sharpest S.T.A.R. is most often "one number they haven't seen before" — \
something from the data that surprises them in a good way and signals \
you are paying attention at a level they did not expect
- Three-quote pattern, never two and never four. Account QBR: one \
day-to-day user (emotional, specific), one manager (efficiency, team \
impact), one stakeholder near the exec sponsor (strategic framing). All-\
hands variant: one SMB / one mid-market / one enterprise (or by industry). \
Together they answer the question every executive sponsor is quietly \
asking: "was this the right call?"
- Pull customer language from the RAG corpus and from the customer's own \
prior emails / Slack / call notes when drafting. Buyer words outperform \
vendor words. The deck must sound like the customer's world, not yours
- Inherit upstream artifacts when present: the buyer persona (05) seeds the \
audience read; the value proposition canvas (08) seeds the outcomes \
language; the messaging framework (02) seeds the register

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const customerAllHandsQbrDeckTemplate: ArtifactTemplate = {
  artifactType: 'customer_all_hands_qbr_deck',
  title: 'Customer All-Hands / QBR Deck',
  systemPromptFragment: CUSTOMER_ALL_HANDS_QBR_DECK_SYSTEM_PROMPT,
  // Skeleton is slide-by-slide because this artifact produces a deck spec.
  // The 8-slide spine comes from the corpus QBR skeleton; the Sparkline
  // oscillation is enforced by tagging each slide [What Is] or [What Could
  // Be]. Smart Brevity Core 4 (TEASE / LEDE / WHY IT MATTERS / GO DEEPER) is
  // enforced inside every slide's bracket guidance. Variant selection
  // (account QBR vs. all-hands) is a pre-work decision; bracket prompts
  // adapt to the variant rather than forking the skeleton.
  skeleton: `# Customer All-Hands / QBR Deck: [Customer or Event Name] — [Quarter / Date]

## Pre-work (lock these decisions before drafting slides)

- **Variant selection:** [Account-team QBR (single named customer, exec sponsor in the room, ~6-12 attendees) OR customer all-hands (broader customer event keynote, 100s-1000s of customers, mixed seniority)? Spine and stance are identical; audience read, three-quote pattern, and Ask differ. Lock this first — every other pre-work decision flows from it.]
- **Audience read:** [Account QBR: name the exec sponsor (title, what they own, what they fear), the day-to-day champion (what they need to walk out feeling), and any new attendees who weren't in prior conversations. All-hands: name the audience archetypes (SMB ops lead / mid-market director / enterprise VP — or by industry) and what each needs from this hour. Cold-reader rule: the exec sponsor is reading the deck cold in a 20-minute window — write to that, not to the day-to-day champion who already knows the story.]
- **Time budget:** [Account QBR default 30-45 min (~10-12 slides at 3-4 min each). All-hands default 25-35 min (~8-10 slides at 3 min each). Lock the budget; do not exceed it. If the draft exceeds budget, cut content — do not speed-talk.]
- **Last quarter's committed priorities (commitments-vs-actuals input):** [List the 2-4 priorities you committed to last quarter — by name, with the original commitment language. This is the input to slide 4's scorecard. If you do not have these on hand, the QBR cannot be drafted credibly — go pull them from prior decks or notes first. Score honestly: hits, partial hits, and misses with a "what we learned." Hidden misses destroy trust; named misses with credible learning build it.]
- **One number they haven't seen before (planted S.T.A.R. moment):** [Which single number, insight, or signal from your data will surprise them in a good way? This is the line the exec sponsor repeats in their next leadership meeting. For QBRs, this is more often a behavioral insight ("your power-user pod's adoption is in the top 10% of customers your size") or a leading indicator ("expansion-team usage tripled three weeks before your other expansion-team conversations") than a headline outcome metric. Name it now; slide 4 plants it.]
- **The single Ask:** [One specific, low-friction action. Account QBR options: renewal commit by [date], expansion scoping conversation, executive-alignment call, reference for [named prospect], advisory-board seat. All-hands options: beta enrollment, breakout-session attendance, advisory cohort, customer-story participation. Pick the one that moves the most-meaningful step forward. "Continue our partnership" is not an Ask.]
- **Inherited upstream artifacts:** [Does a buyer persona (05) exist? It seeds the audience read. A value proposition canvas (08)? It seeds the outcomes-language translation on slide 3. A messaging framework (02)? It seeds the register. Do not re-derive — apply.]

---

## Slide 1 — The moment that matters [What Could Be, made real]

[Open with their world, not your logo. One headline, one number, one emotion. The TEASE is a sentence that frames the year/quarter in their language; the LEDE is the single most important outcome they achieved; the WHY IT MATTERS connects to a stated business goal; the GO DEEPER is the one-line setup for everything that follows. Pattern: "Since [Month], [Customer / your community] has [specific outcome]: [number]. Here's how we got here, and where we go next." NOT a logo slide, NOT an agenda, NOT "thanks for joining." This is the oxytocin trigger — the customer is the hero from frame one.]

## Slide 2 — Where you started [What Is, the pain]

[The villain slide. Make the pain real before claiming the win. TEASE: a question or framing that returns the audience to their pre-deal reality. LEDE: the specific status-quo cost (time wasted, errors, revenue at risk, headcount stretched). WHY IT MATTERS: why this was unsustainable, in their language. GO DEEPER: one quote from the original discovery or onboarding call — verbatim if possible. This slide exists for the exec sponsor who was not in the room when the deal was signed: it gives them the origin story so the transformation on slide 3 lands harder. For all-hands variant: name the shared pain across the customer base, not a single customer's pain.]

## Slide 3 — What we delivered [What Could Be, proven]

[Outcomes, not activities. THREE metrics maximum — the corpus is unambiguous; more dilutes. Each metric structured as: [Result] + [What it means for them in their business language]. Example: "Case resolution time down 32%. That's 6 hours per week back to your team — enough to reallocate two analysts to revenue work." Pick the three numbers that connect to *their* stated business goals, not your product's feature set. NEVER frame this slide as "what we did" — frame it as "what you achieved." For all-hands variant: aggregate metrics across the customer base ("customers in our community shipped X% more campaigns this quarter than last") with two or three named customer outcomes as supporting beats.]

## Slide 4 — Your team's journey + commitments-vs-actuals [What Is, current state + scorecard]

[Two beats on one slide (or split into 4a/4b if the scorecard is dense).

**Beat A — the adoption curve as a narrative arc.** Show usage over time as a story, not a flat chart. Label the inflection points: first power user, first cross-team expansion, first moment of self-sufficiency. The exec sponsor sees momentum, not dependency. This is also where the planted S.T.A.R. moment from pre-work lands — the one number they haven't seen before. Mark it visually so it punches.

**Beat B — commitments-vs-actuals scorecard.** A small table: last quarter's committed priorities (from pre-work), what was delivered, what slipped or was de-scoped, what was learned. Score honestly. Hits, partial hits, and named misses with credible learning. The hidden-miss instinct is the failure mode — exec sponsors trust deck-presenters who name misses more than deck-presenters who present unbroken success. This scorecard is the trust foundation for slide 6's expansion conversation. For all-hands variant: replace customer-specific commitments with platform-level commitments made at last all-hands; same scorecard discipline.]

## Slide 5 — What your champions are saying [What Could Be, validated by their own people]

[Three quotes. No more. Account QBR pattern:
- One day-to-day user — emotional, specific, in-the-work language ("I used to dread Mondays; now I actually look forward to clearing the queue")
- One manager — efficiency / team impact framing ("My team got 14 hours a week back. We redirected that into [strategic initiative]")
- One stakeholder near the exec sponsor — strategic framing, business outcome language ("This is now part of our quarterly board update")

All-hands variant pattern:
- One SMB customer — emotional, founder/operator voice
- One mid-market customer — manager / director, efficiency + scale framing
- One enterprise customer — VP/exec, strategic / risk-reduction framing
(Or by industry: A / B / C — pick the dimension that signals "we serve people like you.")

Together the three quotes answer the question every executive sponsor is quietly asking: "was this the right call?" Pain story → impact story → strategic-context story. NOT a logo wall. NOT a generic NPS quote. Specific humans, specific words, specific context.]

## Slide 6 — Roadmap ahead / what's next [What Could Be, extended — the trusted-adviser frame, NOT the pitch frame]

[Frame as: "Here's where customers at your stage typically go next, and why." Show a maturity model or adoption journey. Mark where they are today. Show what unlocks at the next stage — in *their* outcomes language, not your product feature language.

WHY IT MATTERS for the slide: the expansion narrative works only when it feels like natural progression, not upsell. You are the trusted adviser showing the path, not the vendor pushing the next SKU. If this slide reads as a sales pitch, the entire deck collapses into a sales call. The boundary discipline is: the maturity model is about *their journey*, not your product portfolio. Specific products / SKUs / pricing belong in a follow-up conversation, not on this slide.

For all-hands variant: the roadmap is platform-level direction (themes, not committed dates), framed as "where the platform is going so customers like you can do more." Vaporware language collapses trust faster than no roadmap — directional only.]

## Slide 7 — Our commitment [What Could Be, committed]

[What you (the vendor) are bringing to the next 90 days. Two or three specific commitments. Named owners (real names from your team). Tied to the customer's stated priorities from earlier in the deck — not generic CSM activity. Each commitment formatted as: [Action] + [Owner] + [Date / cadence] + [Tied-to-priority].

This slide closes the loop: you opened with their world, you proved value, you scored last quarter's commitments honestly, and now you are signaling you are still invested. Exec sponsors remember this slide because it answers "what do I get for renewing?"

For all-hands variant: replace customer-specific commitments with platform-level / community-level commitments — what the vendor is committing to deliver across the customer base in the next quarter. Same discipline: specific, owned, dated.]

## Slide 8 — The Ask [the threshold]

[ONE Ask. The one named in pre-work. Specific. Low-friction. Easy to say yes to. Whether renewal, expansion conversation, exec alignment call, reference, advisory seat, beta enrollment — name it directly. Vague closes get vague answers. Format: [Action verb] + [Specific thing] + [By when] + [How to say yes].

Account QBR examples:
- "Confirm the renewal at current ARR by [date] — we'll send the paperwork tomorrow."
- "Greenlight a 30-min expansion scoping call with [your team] and [our team] in the next two weeks."
- "Introduce me to [named prospect] you mentioned at our last QSR — I'll handle from there."

All-hands examples:
- "Apply for the [feature] beta cohort — link on screen, 50 spots, closes Friday."
- "Nominate someone from your team for the [advisory program] — we'll follow up tomorrow with details."

NO additional asks after this slide. NO logo slide after this. The Ask is the last frame.]

---

## Narrative quality gate (audit before sign-off)

[Verify before considering the deck done:
- **Audience-as-hero check.** Read every body-slide headline. Is the subject the customer's outcome or the vendor's activity? "We delivered…" / "Our team shipped…" / "We onboarded…" all fail. "Your team reduced…" / "Acme analysts now do…" / "Your power-user pod is in the top 10%…" pass. If more than two body slides have the vendor as subject, the mentor stance has collapsed — rewrite the headlines.
- **Smart Brevity check.** Read each slide. Does it have a TEASE (hooking title), a LEDE (the one outcome / number), a WHY IT MATTERS (business translation in their language), and a GO DEEPER (one supporting beat)? If the slide is three bullets without WHY IT MATTERS, rewrite it.
- **Sparkline check.** Read the slide titles top-to-bottom. Does the deck oscillate What Is / What Could Be? If three "What Could Be" slides land in a row, the audience never returns to their reality and the contrast collapses.
- **Commitments-vs-actuals check.** Is slide 4 honest? Does it name misses with credible learning, or only highlight hits? If only hits, the exec sponsor will sense it and the renewal trust budget shrinks. Score honestly.
- **Expansion-vs-pitch check.** Read slide 6. Does it frame the next stage as the customer's natural progression or as your next product to sell them? If "next product to sell" energy leaks in, the deck reads as a sales call. Rewrite as maturity model + their position + what-unlocks-next in their outcomes language.
- **One-Ask check.** Is there exactly one Ask, and is it specific, owned, and dated? "Continue our partnership" / "renew + maybe expand + maybe reference + maybe advisory" all fail. Cut to one.
- **Cold-reader check.** Read the deck as if you were the exec sponsor who last engaged six months ago. Does every slide survive without insider context? If any slide requires "you have to remember when…" to land, rewrite it.]

## Validation: the so-what test + the bet-was-right test + the next-conversation test

[Three crisp gates before sign-off:

**So-what test (Smart Brevity boundary):** Read every slide and ask "so what — to *them*?" If the slide does not answer that in the body of the slide (not in the speaker notes), it fails. The exec sponsor is reading cold; the deck must do the translation, not the presenter.

**Bet-was-right test (renewal trust):** Read slides 2, 3, 4, and 5 as a sequence. Together, do they let an exec sponsor who was not in the room confidently tell their CEO "yes, this was the right call"? If any of those four slides is missing or weak, the renewal trust budget is too thin to support slide 6's expansion conversation. Strengthen the weakest before drafting slide 6.

**Next-conversation test (the central design law):** "Customers who feel seen expand." Read the deck top-to-bottom. Does the customer feel seen — their pain remembered (slide 2), their outcomes celebrated in their own language (slide 3), their team's momentum named (slide 4), their champions amplified (slide 5)? If the customer feels seen, slide 8's Ask will land — whether that Ask is renewal, expansion, reference, or advisory. If the customer does not feel seen, no amount of polish on slide 6 or 8 saves the deck. The retention story and the expansion story are the same story.]
`,
}

/**
 * Partner Pitch Deck template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   April Dunford — Sales Pitch (8-step storyboard, REFRAMED for partner
 *   audience). Nancy Duarte — Resonate (Sparkline oscillation, mentor stance,
 *   audience-as-hero, S.T.A.R. moment). Corpus (Tier 2) for partner-specific
 *   sections the books do not name: 3-lane partner value proposition
 *   (economics / lead-gen / differentiation), Joint Customer Profile,
 *   dedicated channel-conflict / deal-protection slide, 90-day success
 *   criteria in the Ask.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/26-partner-pitch-deck.md
 *
 * Why this template diverges from the customer pitch deck (artifact 19):
 * the audience is a partner exec, not an economic buyer; the question being
 * answered is "will this help me make money and look good to my customers?",
 * not "will this solve my problem?". Re-mapping Dunford's 8-step: Insight is
 * the shift in the partner's CUSTOMERS' world (not the partner's world);
 * Alternatives is the partner's current portfolio gap; Perfect World becomes
 * Perfect Partnership; Differentiated Value collapses into a 3-lane partner
 * value prop (economics / lead-gen / differentiation) per corpus consensus;
 * Proof becomes a Joint Customer Story where the partner co-stars; the Ask
 * carries 90-day success criteria. Channel conflict is promoted from "an
 * objection" to a dedicated Deal Protection slide because corpus consensus
 * is unambiguous: it is the universal unspoken objection in every partner
 * conversation, and burying it reads as evasion.
 *
 * Distinct from:
 *   - artifact 19 (sales_pitch_deck) — recruits a customer; ends in
 *     commercial close. This artifact recruits a partner; ends in program
 *     enrollment + 90-day criteria.
 *   - artifact 27 (partner_enablement_one_pager) — post-signing rep-training
 *     asset. This artifact is pre-signing recruitment.
 *   - artifact 28 (co_sell_battlecard) — tactical asset used by an existing
 *     partner mid-deal. This artifact precedes the battlecard temporally.
 *   - artifact 29 (joint_solution_brief) — external customer-facing
 *     co-marketing asset, post-partnership. This artifact is internal-to-
 *     the-partnership, pre-partnership.
 */

import type { ArtifactTemplate } from './types'

const PARTNER_PITCH_DECK_SYSTEM_PROMPT = `You are drafting a partner pitch \
deck — the deck used to recruit a new partner (reseller, SI, ISV, channel, \
referral) into the program. The audience is a partner exec, channel chief, or \
BD lead at a prospective partner company, NOT a customer and NOT an economic \
buyer of your product.

The single sharpest framing: a customer pitch deck answers "will this solve \
my problem?"; a partner pitch deck answers "will this help me make money and \
look good to my customers?". Every structural decision flows from that. The \
partner's customer is the ultimate hero of this story; the partner is the \
agent who serves them; you are the mentor (Yoda, not Luke) offering tools, \
training, and pipeline.

Avoid these failure modes:
- Customer pitch repurposed for partners — the tell is slide 2: "our customers \
love us." Partners do not care yet. They need to know their customers will \
love them for bringing you in. Body slides live in the partner's reality \
(their deals, their pipeline, their customer conversations), not yours
- No economics / vague margin structure — silence reads as evasion. If the \
margin structure, deal registration mechanics, and co-sell splits are not in \
the deck with specifics (not ranges), partners assume the economics are bad \
and you are hiding them
- Vague enablement — "robust partner portal" / "training and support" / \
"world-class enablement" mean nothing. Partners have been promised portals \
before. What they need to see: certification path, time-to-first-deal, \
co-sell motion (will your AE be on the call?), what happens when a deal gets \
complicated. Show the scaffolding
- No Joint Customer Profile — without naming the customer you win together \
(industry, size, tech stack, buying trigger, ICP overlap with the partner's \
book of business), the partner cannot self-qualify. You will get "sounds \
interesting, let's stay in touch" with zero pipeline
- Channel conflict buried in objections — channel conflict is the universal \
unspoken objection in every partner conversation. They have been burned \
before. Address it directly on a dedicated slide: registration, conflict \
resolution process, renewal margin protection. The partner who does not ask \
about it is thinking about it anyway
- Vendor name-drops as the enemy — calling out a competitor by name collapses \
the deck into a battlecard. The enemy is the OLD WAY of working in the \
partner's customers' world (manual processes, unsupported categories, gaps in \
the partner's portfolio), never a named company
- Hero's Journey drift — making the partner a "hero on a quest" produces \
fuzzy B2B narratives that do not survive the first concrete objection. The \
partner is operating a business; you are mentoring that business. The arc is \
Sparkline (What Is / What Could Be), not ordinary world → call to adventure
- More than one CTA in the Ask — the partner pitch CTA is one specific next \
step (sign the program agreement, scope a co-sell pilot, schedule a joint \
ICP review with named attendees and a date). "Let us know if interested" is \
not a CTA, it is a shrug. Three CTAs are zero CTAs
- Lead with vision / company mission — the partner exec does not care that \
your category is a $12B TAM. They care that 60% of their mid-market clients \
are asking about this problem and they have no answer. Open in their world, \
not yours
- Inside-out language — "we built", "our platform", "our team is excited". \
The audience is the hero of this story; the company is the mentor. Body \
slides headline the partner or the partner's customer, never the company

Positive asks:
- Render the deck as a Sparkline: every "what could be" slide must oscillate \
against a "what is" beat. The partner exec must feel the contrast between \
their current portfolio reality and the partnership reality, not just hear \
the program announced
- One planted S.T.A.R. moment — a single named partner who closed a single \
named deal in a named timeframe with a specific dollar figure. Most often \
this lands on the Joint Customer Story slide. The S.T.A.R. is the line the \
partner exec repeats to their RevOps lead on the call afterward
- Three value-prop lanes, locked: Economics, Lead-Gen, Differentiation. One \
slide per lane. Not four lanes (becomes inventory), not two (feels \
incomplete), not free-form (collapses into vendor talk). The corpus \
consensus on this is unambiguous and the skeleton enforces it
- Specificity in the Ask — name the 90-day success criteria (e.g., one \
co-sold deal, three certified reps, joint pipeline review by a date). \
Specificity signals you have run a partner program before; vague asks signal \
the opposite
- Pull partner / customer language from the RAG corpus when drafting the \
Insight, Alternatives, and Joint Customer Story slides. Partner-exec words \
outperform vendor-marketer words
- Inherit upstream artifacts when present: positioning (01) seeds the \
Introduction slide; strategic narrative (03) seeds the Insight; messaging \
framework (02) seeds the language register. Do not re-derive — apply

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const partnerPitchDeckTemplate: ArtifactTemplate = {
  artifactType: 'partner_pitch_deck',
  title: 'Partner Pitch Deck',
  systemPromptFragment: PARTNER_PITCH_DECK_SYSTEM_PROMPT,
  // Skeleton is slide-by-slide because this artifact produces a deck spec.
  // Spine = Dunford 8-step REFRAMED for partner audience. Sparkline rhythm
  // is enforced by slide order: Insight (What Is, the partner's customers'
  // world shifted) → Alternatives (What Is, the partner's portfolio gap) →
  // Perfect Partnership (What Could Be, criteria) → Introduction (What Could
  // Be, named) → Value Prop 3 lanes (What Could Be, quantified) →
  // Enablement (What Could Be, scaffolded) → Deal Protection (What Is,
  // addressed before asked) → Joint Customer Story (What Could Be, real) →
  // Ask + 90-day criteria (cross the threshold).
  skeleton: `# Partner Pitch Deck: [Product Name] × [Partner Type]

## Pre-work (lock these decisions before drafting slides)

- **Partner motion type:** [Resell, co-sell, refer, OEM, or hybrid? Different motions = different economics shapes, different deal-protection mechanics, different enablement depth. Pick one and adapt the Economics + Enablement slides to fit. If pitching multiple motion types in one deck, you are pitching no one.]
- **Joint Customer Profile (the customer you win TOGETHER):** [Industry, company size, tech stack, buying trigger, ICP overlap with the partner's existing book of business. Be specific — "mid-market manufacturers with $50M-$500M revenue, 200+ field employees, on legacy ERP, recently hired a Director of Digital Transformation." If you cannot name the joint customer, the partner cannot self-qualify and the deck fails. This profile carries through every slide.]
- **The partner's portfolio gap (your Insight target):** [What can the partner's customers ask them today that they cannot answer? What category is squeezing their margin or differentiation? The Insight slide will name this gap in the partner's world. Without it, the deck reads as "another vendor trying to recruit me."]
- **Planted S.T.A.R. moment:** [Which single slide is the moment the partner exec quotes to their RevOps lead afterward? Most decks land this on the Joint Customer Story (a named partner, a named deal, a named outcome). Without a planted moment, the deck is informational, not memorable.]
- **The single CTA + 90-day success criteria:** [What ONE next step are you asking for (sign the program agreement, scope a co-sell pilot, joint ICP review with named attendees and a date)? What does a successful first 90 days look like (e.g., one co-sold deal, three certified reps, joint pipeline review)? Specificity here signals you have done this before.]
- **Inherited upstream artifacts:** [Does a strategic narrative (03) exist? It seeds the Insight. A positioning statement (01)? It seeds the Introduction frame. A messaging framework (02)? It seeds the language register. Do not re-derive — apply.]

---

## Slide 1 — Opening hook / Insight (What Is, in the partner's customers' world)

[A specific, named, undeniable shift in the **partner's customers'** world — not your TAM, not your category, not your vision. Examples: "60% of mid-market manufacturers are now asking their SI about real-time inventory visibility — and most SIs have no answer." Cite evidence (analyst data, named buyer behavior, public benchmarks). The partner exec should nod within 30 seconds: "yes, my customers are asking that and it is a gap in my portfolio." NOT a logo slide, NOT an agenda, NOT "thanks for joining." One slide, one provocation.]

## Slide 2 — Alternatives (What Is, the partner's current portfolio gap)

[What is the partner currently offering their customers in this category — and where is it falling short? This is empathetic, not condescending. Acknowledge the existing tools / vendors / workarounds the partner is selling. Then reveal why the shift from slide 1 has made those alternatives inadequate. The partner should think: "I keep losing these deals to the legacy approach and I do not have the right product to swap in." This sets up the program as the answer.]

## Slide 3 — The Perfect Partnership (What Could Be, criteria)

[Describe what a great vendor partnership looks like in this category — written as objective criteria, not as your program. The criteria should be: a product their customers ask for by name; predictable economics (margin, registration, renewal protection); enablement that gets a rep deal-ready in [N] days; co-sell muscle on enterprise deals; a Joint Customer Profile that maps to their existing pipeline. The criteria should match your program's strengths exactly — but framed as what the partner needs, not as what you offer. Embed the Joint Customer Profile from pre-work here ("partners win when the customer looks like X"). The partner should be nodding before you have named the program.]

## Slide 4 — Introduction (the product AND the program — two intros, not one)

[Now and only now, name the product and the program. Two clear lines, one paragraph or two: (1) [Product] is a [category] that [differentiated value, one line]. (2) The [Program Name] partner program enables [partner motion type] partners to [outcome] with [program-defining mechanism]. The Introduction lands cleanly because the Setup slides 1-3 have already framed the gap and the criteria. This is the reveal, not the pitch.]

---

## Slide 5 — Partner Value Prop · Lane 1: Economics (What Could Be, quantified)

[Specifics, not ranges. Margin structure for net-new deals. Deal registration mechanics (how the partner protects opportunities they source). Co-sell splits (who gets credit on what). Renewal margin (what happens to economics on year 2+). Payment terms and timing. If economics are NDA-gated, name the high-level shape and what is unlockable on signed NDA — but the deck should not read as "trust us." The economics lane is where decks fail fastest. If the numbers are not ready to share, the program is not ready to recruit partners.]

## Slide 6 — Partner Value Prop · Lane 2: Lead Generation (What Could Be, quantified)

[Are you bringing the partner net-new opportunities, or asking them to resell into their existing pipeline? Both are valid; conflating them is not. Quantify: how many qualified leads per partner per quarter? What is the source (your demand-gen, joint marketing, ABM, events)? What is the SLA on lead handoff? What does a partner-sourced deal look like vs. a vendor-sourced deal? The partner is evaluating: "do I get pipeline, or am I just paying you for the privilege of selling your product?"]

## Slide 7 — Partner Value Prop · Lane 3: Differentiation (What Could Be, qualitative)

[What does adding [Product] do for the partner's positioning with **their** customers? Concretely: which RFPs do they now win that they were losing? Which conversations open up that were closed before? Which competitors do they now beat in their own market? This is not "we make you look good"; it is the specific positioning lift in the partner's own competitive context. If you cannot name the lift, the differentiation lane is filler.]

---

## Slide 8 — Enablement (What Could Be, scaffolded)

[Show the scaffolding, not the slogan. Five concrete elements: (1) certification path — sales cert in [N] hours, technical cert in [N] hours, who delivers it; (2) time-to-first-deal — what is the realistic interval from contract signing to a partner rep closing a deal solo; (3) co-sell motion — when does your AE join the call, when does your SE run the demo, when does the partner take the lead; (4) escalation path — what happens when a deal gets technically complex or commercially complex; (5) ongoing enablement cadence — quarterly business reviews, monthly office hours, a named partner success contact. "Robust partner portal" is not in this list because it is a fixture, not enablement.]

## Slide 9 — Deal Protection / Channel Conflict (What Is, addressed before asked)

[The unspoken objection in every partner conversation. Address directly: (1) deal registration — how a partner protects an opportunity they source, registration window, what gets registered (account, opportunity, vertical); (2) conflict resolution — when a customer is in play with both your direct team and a partner, what is the process and who decides; (3) renewal protection — what happens to partner margin and credit on renewals year 2+; (4) direct-team incentives — does your AE comp plan reward co-sell or punish it. This slide is the trust slide. Partners who hear evasion here disengage silently.]

## Slide 10 — Joint Customer Story (What Could Be, real — likely S.T.A.R. moment)

[One named partnership, one named deal, one specific outcome. Structure: (1) the partner — named, with their motion and customer profile; (2) the customer — named or anonymized with specifics (industry, size, trigger); (3) the deal shape — co-sold in [N] days, partner sourced / vendor sourced / joint, deal size; (4) the outcome — what the customer got, what the partner earned, what year-2 expansion looks like. NOT "Acme Corp is a happy customer." More like: "Partner Y brought us into a mid-market manufacturer in Q1, co-sold the deal in 90 days, expanded to three sites in year two — Partner Y earned [$X] across the lifecycle and the customer cut [process] from 14 hours to 20 minutes." The partner exec needs to see themselves in the story. If you flagged this as the S.T.A.R. moment in pre-work, this is the line that gets quoted afterward.]

---

## Slide 11 — Ask + 90-day Success Criteria

[ONE specific, time-bound next step from pre-work. Then immediately: what does a successful first 90 days look like (one co-sold deal? three certified reps? joint pipeline review with [N] qualified opps by date X?). Tie back to the opening hook so the deck closes the loop: the gap from slide 1 in the partner's customers' world is now answered by the program. The partner should leave with one thing to do, one feeling (the future of their portfolio just got easier to staff), and one number to take to their leadership (the 90-day target). NO "Q&A" slide as the last frame; the Ask is the close.]

---

## Narrative quality gate (audit before sign-off)

[Verify before considering the deck done:
- **Sparkline check:** Read slide titles top to bottom. Does the deck oscillate What Is / What Could Be? Three "what could be" slides in a row collapses the contrast.
- **Audience-as-hero check:** Read every body slide headline. Is the subject the partner, the partner's customer, or the company? "We built X" fails; "Your enterprise customers now get Y in days, not months" passes.
- **Three-lane lock:** Are there exactly three value-prop slides (5, 6, 7), one per lane (Economics / Lead-Gen / Differentiation), with specifics on each? Drift back to a single "value" slide is the dominant failure pattern.
- **Channel-conflict promoted:** Is there a dedicated Deal Protection slide, or did it get demoted into an objections appendix? Promoted = trust signal; demoted = evasion signal.
- **JCP traceability:** Is the Joint Customer Profile from pre-work visible on slides 3, 6, and 10? If JCP only appears in pre-work and never on a slide, the partner cannot self-qualify.
- **One-S.T.A.R. check:** Is there exactly one slide that could become the line the partner exec repeats to their RevOps lead? Zero = informational deck; more than one = no single moment will land.
- **One-CTA + 90-day check:** Is there exactly one Ask, time-bound, with named 90-day success criteria?]

## Validation: the forwarding test + the reskin test

[Two crisp gates:

**Forwarding test:** Would the partner exec who saw this deck forward it internally to their CRO, RevOps lead, and one regional director — without needing to add context? If the deck cannot stand on its own inside the partner's organization, the partner cannot champion you. The forwarding test is sharper than "did they like it" because forwarding requires the partner to bet their internal credibility on the deck.

**Reskin test:** Could one of your top three vendor competitors take this deck, swap their logo, swap their economics, and ship it tomorrow? If yes, the differentiation lane is generic and the program is not yet defensible to a sophisticated partner. The reskin test is the partner-pitch equivalent of the competitor-verbatim test in messaging — if a peer vendor could lift the deck without changing a word, you do not have a partner pitch, you have partner-flavored marketing.]
`,
}

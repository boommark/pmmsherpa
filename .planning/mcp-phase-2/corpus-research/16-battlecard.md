---
title: "Phase 2 Audit — 16 Battlecard"
artifact: battlecard
canonical_books:
  - "Punchy (Emma Stratton) — competitive audit + differentiation discipline"
status: drafted, awaiting audit
template_path: src/lib/mcp/artifact-templates/battlecard.ts
research_path: .planning/mcp-phase-2/corpus-research/16-battlecard.md
inherits_from:
  - 01-positioning-statement (Distinct Capabilities, Differentiated Value)
  - 07-win-loss-insights (deal-context proof, recurring objection patterns)
distinct_from:
  - 17-comparison-matrix (multi-competitor table, buyer-shareable, NOT this)
  - 28-co-sell-battlecard (partner co-sell context, NOT competitive)
---

# Phase 2 Audit — 16 Battlecard

The Battlecard is one battlecard *per direct competitor*, sales-arming, **internal-only**.
It is the document a rep glances at before a competitive call, in deal review, or
mid-cycle when the prospect names the competitor for the first time. It is not a
comparison matrix and it is not buyer-facing. The whole template is built around
the constraint that a battlecard is useful only when (a) it fits one screen, (b)
it sharpens differentiation rather than just describing the competitor, and (c)
it could not embarrass the company if leaked.

---

## 1. Findings across canonical book and practitioners

### What Punchy said (the competitive discipline)

Punchy is not a battlecard book — it's a messaging book — but it provides the
*editorial* frame the battlecard depends on:

- **Competitive Messaging Audit.** Map what every competitor leads with, find the
  3–5 clichés the category converges on, and identify the unclaimed positioning
  territory. The battlecard's "How we win" section is the *operational output*
  of this audit, narrowed to one competitor.
- **VBF Rule (Value → Benefit → Feature).** Applies sideways here: the wedge
  ("how we win") must lead with the buyer's transformation, not with our
  capability. A battlecard that opens "we have feature X they don't" reads as
  feature-comparison soup. A battlecard that opens "buyer gets outcome Y, which
  this competitor structurally can't deliver because Z" reads as a wedge.
- **A+ Customer.** The battlecard is for a specific deal type — when the A+
  customer is in market and considering this competitor, what's the wedge?
  Generic "anyone evaluating us vs. them" battlecards under-perform because
  they're written for nobody.
- **BBQ Talk.** The trap-setting questions and rep talk tracks must be in the
  rep's actual spoken register, not marketing copy. A trap-setting question that
  reads like a press release is unusable on a live call.

Stratton's relevant principle for this artifact: **differentiation lives at the
message layer, not just the product layer.** Two products with similar feature
sets can still produce vastly different battlecards if the messaging frame
differs. The battlecard's "How we win" is the operationalization of that.

### What corpus added (top citations)

The corpus query returned 10 chunks. The substantive contributions:

1. **PMA — Use battlecards to increase sales performance and lead conversion**
   (Productmarketingalliance.com). Practitioner-canonical anatomy:
   competitor pitch (verbatim), strengths, weaknesses, our wedge, talk track,
   trap-setting questions, do-not-say list, customer proof, objection handling.
   This is the working anatomy adopted in the template.
2. **PMA — All you need to know about battlecards.** Adds: format discipline
   (one page), refresh cadence (quarterly minimum, faster on trigger events),
   internal-only classification.
3. **PMA — Sales assets: choose your weapon.** Reinforces: battlecard is one
   tool in a competitive enablement system; do not collapse the comparison
   matrix and battlecard into one document.
4. **Punchy p.70** (book) — Messaging Stack reinforcement; used as the
   editorial spine for the wedge.
5. **Wes Bush / productled.com — B2B customer acquisition strategy guide.**
   Adjacent — confirmed that competitor-specific positioning is a normal part
   of a B2B SaaS funnel, not a niche enterprise practice.

**Net-new contributions from the corpus that the book did not provide:**

- **Trap-setting questions** as a distinct section (separate from objection
  handling). These are questions the rep asks the *prospect* to surface doubt
  about the competitor *before* the competitor is named. "How does your current
  vendor handle X when Y happens?" The prospect answers their own objection.
  This is sharper than reactive objection handling and lives in its own block.
- **Do-not-say list** as a sales guardrail mechanism. Punchy doesn't address
  this; the practitioner pattern is unanimous: "Don't call them legacy. Don't
  bring up the acquisition. Don't disparage." Tells reps what to avoid without
  a lecture.
- **One page is non-negotiable.** Across every PMA blog: a battlecard that
  doesn't fit one screen lives in a drawer. The constraint forces editorial
  discipline; the discipline is the deliverable.
- **Standalone PDF vs. dynamic platform** (Klue / Crayon / Battlecard.io) is a
  real tradeoff, not a tooling preference. PDFs ship faster but go stale
  invisibly. Dynamic platforms add usage analytics (which cards get pulled,
  which competitors are coming up). Decision rule from corpus: if competitive
  landscape moves fast or there are 5+ competitors tracked, platform pays for
  itself. Otherwise a PDF with a quarterly refresh trigger is fine.
- **Stale info is worse than no battlecard.** A rep citing last-year's pricing
  signals to the buyer that this rep isn't current. Refresh triggers
  (competitor pricing page change, new G2 reviews, acquisition, major launch)
  are part of the artifact, not a separate ops doc.
- **Leak-proofing as a design principle.** Battlecards leak. Reps share decks,
  prospects forward, people change jobs. The mitigation isn't paranoia, it's
  calibration: never put a line in a battlecard you wouldn't want the
  competitor to read. Specific internal win/loss data with customer names
  belongs in a separate internal doc. Trap-setting questions, talk tracks, and
  even do-not-say lists are fine to leak — they describe sales discipline, not
  competitive gossip.

### Where book and corpus disagreed — and which won

**Editorial register.** Some PMA blogs frame the battlecard as a
near-adversarial document ("here's why they're bad, here's how to beat them").
Punchy is firm: messaging that attacks the competitor without anchoring the
wedge in *your* value is a position of weakness. The buyer should leave the
call excited about *you*, not just skeptical about *them*.
- **Winner: Punchy.** The "How we win" section is structured wedge-first
  (your value the competitor structurally can't match), not weakness-first
  (their gaps). Weaknesses are in their own section, but the wedge does not
  lead with them.
- *Reason:* sustainable. A wedge built on the competitor's weakness collapses
  when they fix it. A wedge built on your differentiated value holds.

**Number of trap-setting questions.** PMA blogs vary (3 to 8). Punchy doesn't
opine. We locked **3** by analogy with Punchy's "three benefits" rule: more
becomes inventory the rep can't memorize.
- *Reason:* the constraint is the discipline. If you can't pick 3, you don't
  yet know the wedge.

### Where they merged

- **Wedge structure.** Punchy's VBF Rule + PMA's "how we win" section merged
  into a wedge that opens with the buyer's transformation, names the structural
  reason this competitor can't deliver it, and ends with a one-line proof.
- **Failure-mode list.** PMA practitioner pitfalls + Punchy's competitive
  audit warnings combined into 8 negative-guidance rules in the system prompt.
- **Refresh cadence + change triggers.** Practitioner-blog patterns codified as
  a metadata block on the artifact: last reviewed, next review, change
  triggers.

---

## 2. Why we chose this template structure

### The structural decisions

**One battlecard, one competitor.** The skeleton produces a single-competitor
document. Multi-competitor coverage is the comparison matrix (artifact 17), not
this. The MCP tool generates one battlecard per call; the user runs it N times
for N competitors.

**One page, enforced visually.** The skeleton renders sections as compact
blocks (header → wedge → talk track → trap questions → objections → do-not-say
→ proof → metadata). Section descriptions instruct terseness ("3 trap
questions max", "one wedge sentence", "one customer proof, deal-context").
Without this constraint the model produces a 4-page essay.

**Wedge-first ordering, not feature-comparison-first.** The first substantive
section is "How we win" (the wedge). Their pitch / strengths / weaknesses come
*after* the wedge so the document trains the rep to lead with our value, not
to lead with a takedown. This is a deliberate ordering inversion against some
practitioner templates that open with competitor strengths.

**Trap-setting questions as their own section.** Distinct from objection
handling. Trap-setting is *proactive* (asked of the prospect to seed doubt
before the competitor is named). Objection handling is *reactive* (when the
prospect names the competitor or repeats a competitor's pitch back). Conflating
them produces a section reps don't know how to use.

**Do-not-say list, not just talk track.** Operationalizes leak-proofing and
sales discipline in one place. "Don't call them legacy" is more useful than
"speak professionally about competitors."

**Customer proof = ONE deal, not a logo wall.** The practitioner pattern is
unanimous: one specific win with full deal context outperforms a row of logos.
"Replaced Competitor X at a 400-person fintech, after a bake-off, on price and
implementation speed" is usable in a live call. A logo wall isn't.

**Metadata block (last reviewed, next review, change triggers, owner).** Stale
battlecards are worse than no battlecards. The metadata block is part of the
deliverable, not an ops afterthought. Change triggers (competitor pricing
page change, G2 reviews update, acquisition, major launch) are listed
inline so the owner knows what to watch.

**Format/distribution as a stated decision.** PDF vs. dynamic platform is
captured at the top of the doc as a one-line decision, not left implicit.
Forces the user to commit to a refresh strategy.

### Trade-offs we accepted

- **No feature-comparison checkbox table.** That's the comparison matrix
  artifact (17). Including it here would dilute the wedge.
- **No partner / co-sell framing.** That's the co-sell battlecard (28).
- **No buyer-facing version.** This is internal-only. A buyer-facing
  comparison is the comparison matrix (17), and even that is calibrated for
  external sharing.
- **No win/loss raw data.** Inherits from win/loss insights (07). The
  battlecard surfaces *patterns* (the recurring deal context where we win)
  not the underlying interview transcripts.
- **No deep ICP definition.** Inherits from positioning (01). The battlecard
  references "the deal type where we win" — full ICP is upstream.

### Section-to-source map

| Template section | Source |
|---|---|
| Header (competitor name, date, owner, format decision) | Practitioner ops pattern |
| Their pitch (verbatim) | Corpus — PMA practitioner anatomy |
| Their strengths (and how to defend) | Corpus — PMA |
| Their weaknesses (factual, dated) | Corpus — PMA |
| Why our buyer chooses us (the wedge) | Punchy (Competitive Audit + VBF Rule) |
| Talk track (3-line script) | Punchy (BBQ Talk register) + corpus |
| Trap-setting questions (3) | Corpus — net-new (not in Punchy) |
| Objection handling (when they name the competitor) | Practitioner pattern; inherits from objection_handling artifact |
| Do-not-say list | Corpus — net-new |
| Customer proof (ONE deal, deal-context) | Corpus + Punchy (specificity) |
| Metadata (refresh, triggers, owner) | Corpus — practitioner ops |

### What we excluded and why

- **Multi-competitor table** — that's artifact 17.
- **Pricing detail** — pricing changes most frequently and is the highest leak
  risk. The battlecard says "see current pricing page" rather than embedding
  numbers.
- **Internal-only customer names with revenue figures** — leak risk. Customer
  proof is anonymized to industry + size + deal context unless the customer
  has explicitly approved use in a competitive context.
- **Author / vendor name-drops in any section** — voice rule.
- **Long-form competitive history / "story of the competitor"** — interesting,
  not useful in a sales moment.

---

## 3. System prompt asks (most important section)

The system prompt is failure-mode-heavy (8 negative rules, 4 positive asks),
matching the messaging-framework pattern. Battlecards have very specific
failure modes that each require active suppression.

### Negative-guidance lines

1. **"Feature-comparison soup — checkbox tables of who-has-what. The buyer
   starts scoring on criteria you didn't choose. The wedge is structural, not
   featural."**
   - *Source:* Corpus (PMA, dominant failure mode); Punchy (VBF Rule).

2. **"Attacking the competitor instead of differentiating us. Reps should leave
   the call with the buyer excited about us, not just skeptical about them.
   Wedges built on competitor weakness collapse when they fix it; wedges built
   on differentiated value hold."**
   - *Source:* Punchy (Competitive Audit principle); corpus reinforced.

3. **"Marketing-register talk track. Trap-setting questions and rep talk tracks
   must be in the rep's actual spoken register. A line that reads like a press
   release is unusable on a live call. BBQ Talk."**
   - *Source:* Punchy (BBQ Talk).

4. **"Stale data treated as fresh. Pricing, feature claims, and roadmap notes
   for the competitor go stale invisibly. Date every factual claim. If the
   source is older than 90 days, mark it for re-verification."**
   - *Source:* Corpus (unanimous practitioner pattern).

5. **"Leakable language. Assume this document will reach the competitor. Any
   line that would embarrass us if quoted back to us, the buyer, or in a
   compete blog post does not belong in the battlecard. No mockery, no
   unverifiable claims, no internal customer names with revenue figures."**
   - *Source:* Corpus + project constraint (internal-only artifact, INTERNAL
     CLASSIFICATION must be respected even though leaks happen).

6. **"More than 3 trap-setting questions. Reps cannot memorize a long list.
   Pick the 3 sharpest. The constraint is the discipline."**
   - *Source:* Punchy-by-analogy; corpus pattern.

7. **"Generic 'how we win' lines that any vendor could copy ('we're more
   flexible', 'better support', 'easier to use'). The wedge must name the
   structural reason this specific competitor cannot match the value, not a
   universal vendor virtue."**
   - *Source:* Punchy (Competitive Messaging Audit clichés); corpus reinforced.

8. **"Logo-wall customer proof. One specific deal with full context — industry,
   size, what they switched from, why they chose us, what the outcome was —
   beats five logos. Reps quote the deal narrative, not the logo."**
   - *Source:* Corpus (unanimous practitioner pattern).

### Positive asks

1. **"Lead 'How we win' with the buyer's transformation, then name the
   structural reason this competitor can't deliver it. VBF Rule applied to
   competitive: Value → why this competitor specifically can't match it →
   the capability that proves it."**
2. **"Pull the competitor's pitch verbatim from their homepage / latest
   investor update / G2 page. Reps need to recognize the language when they
   hear it on a call, not a paraphrase."**
3. **"If win/loss data exists, ground the customer proof and 'why we win'
   wedge in actual deal patterns from win/loss insights — not internal
   hypothesis."**
4. **"Set the format decision (PDF vs. dynamic platform) and refresh cadence
   in the metadata block before drafting. A battlecard with no refresh plan
   is already on its way to stale."**

### Voice rules carried into the system prompt

- INTERNAL ONLY classification stated explicitly at the top of the prompt.
- No author name-drops, no implied affiliation with named frameworks.
- Reference the wedge / VBF / BBQ-Talk discipline implicitly through
  instruction language ("plain spoken register", "lead with buyer
  transformation"), not by naming the source.

---

## Open questions for audit

- **Should "their roadmap" be a section?** Currently merged into "their
  weaknesses" with a date stamp. Argument for surfacing: roadmap moves are
  competitive intel reps need. Argument against (current): roadmap is the
  most leak-sensitive content and goes stale fastest.
- **Should the customer proof section pull from the win/loss artifact (07)
  automatically?** Currently the prompt says "ground in win/loss data if
  available". Open question whether to formalize the dependency more strongly
  (e.g., refuse to render if no win/loss artifact exists for this competitor).
- **Should we render trap-setting questions as exactly 3 (current) or 1-3?**
  Locked at 3 to force editorial discipline; a small product with limited
  competitive insight may struggle to find 3. Open for your call.
- **Format decision (PDF vs. dynamic) — should it be a structured field or
  free text?** Currently free text in metadata. A structured field would
  enable downstream tooling (auto-export to Klue, etc.) but couples the
  artifact to specific platforms.
- **Corpus gap:** no Klue / Crayon / Compete-specific practitioner content
  surfaced beyond the PMA blogs. If those vendors publish opinionated
  battlecard guides, we should ingest them. Logged for the next sweep.

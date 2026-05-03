# Research — Buyer Persona

## Canonical sources (read FIRST)

- **Kalbach — Jobs to Be Done Playbook** — primary structural source for the human-level deep dive (job performer, the 5 JTBD elements, desired outcome statements, 5 stages of value creation)
  - Card: `~/Documents/AbhishekR/Book Brain/Kalbach - Jobs to Be Done Playbook.md`
- **Torres — Continuous Discovery Habits** — discipline source: proto-personas built from interview patterns, NOT imagined demographics
  - Card: `~/Documents/AbhishekR/Book Brain/Torres - Continuous Discovery Habits.md`
- **Cagan — Inspired** — risk frame: the Four Risks (value, usability, feasibility, viability) used to surface what the persona must believe to say yes
  - Card: `~/Documents/AbhishekR/Book Brain/Cagan - Inspired.md`

## What the book cards establish

### Kalbach — JTBD Playbook
- **Job Performer** is the unit of analysis — not "the buyer" generically, but the human trying to accomplish a specific job under specific circumstances. Demographics are not the input.
- **Five JTBD elements**: Job Performer (who), Jobs (functional / related / emotional / social), Process, Needs, Circumstances.
- **Job hierarchy / laddering**: aspirations → big job → little jobs → micro-jobs (ask "why?" to ladder up, "how?" to ladder down).
- **Desired outcome statements**: direction of change + unit of measure + object + clarifier ("maximize likelihood of customer retention"). Replaces vague "needs."
- **5 stages of value creation**: Discover Value → Define Value → Design Value → Deliver Value → (Re)develop Value. The persona artifact lives in *Define Value*.
- **Functional vs emotional/social jobs**: layer emotional/social on top of functional, not instead of. B2B champions have emotional jobs ("don't get blamed if this fails," "look credible to my CFO") that demographic personas miss.
- **Memorable anchor**: "JTBD deliberately avoids mention of particular solutions in order to first comprehend the process that people go through to solve a problem."

### Torres — Continuous Discovery Habits
- **Proto-personas**: 2-3 lightweight personas based on **actual research patterns**, not invented archetypes. The discipline is "based on what we've heard," not "based on what we imagine."
- Customer interviews at 6-8/week minimum; the persona is a synthesis of interview patterns, refreshed continuously.
- Opportunity framing structure ("I observed... I think... it matters because...") is the kind of shape the persona should encode — observed signals, not stock-photo color.
- **Failure mode Torres calls out**: invented archetypes — the "Marketing Mary, age 34, drives a Subaru, listens to NPR" pattern. Torres is firm: if a detail isn't grounded in actual research, it doesn't belong on the persona.

### Cagan — Inspired
- **Four Risks**: Value (will they buy it?), Usability (can they figure it out?), Feasibility (can we build it?), Viability (does it work for our business?).
- For a buyer persona artifact, two of the four risks are persona-load-bearing:
  - **Value risk** = "what would make this person say yes?" — the heart of a champion persona
  - **Viability risk for the buyer** = "what would make this person fail internally if they pick us?" — the political/organizational fear layer
- Cagan's "missionaries vs mercenaries" frame applies to internal stakeholders too: the champion is a missionary for the change; the economic buyer often is not.

---

## Corpus research (amplification only)

Top 10 citations from the buyer-persona query. The synthesized corpus answer was unusually well-structured and aligned with the books:

- PMA — Bryony Pearce, "Your guide to personas" (user vs buyer persona distinction)
- PMA — Stevie Langford, "Building B2B buyer personas"
- PMA — "Understanding your sales prospect — complexity of the buyer's journey"
- PMA — "Thinking about a product marketing role in health tech" ("speak to the whole buying group")
- PMA — "Getting your fundamentals right" (ICP and personas)
- Neil Patel — "Account-Based Marketing: Map 4–7 Key Roles Per Account"
- 2 internal blog chunks (no source metadata)
- 1 `book` chunk (no title/author metadata) and 1 `book_sales` chunk (Sales Pitch p.66)

**What the corpus added beyond the books:**
- Crisp B2B taxonomy of four buyer roles: **economic buyer, champion, end user, technical evaluator** — language not in any of the three canonical books in this exact form. Useful for the doc's "which role is this" header.
- Failure-mode language we adopted nearly verbatim: "fictional detail inflation" (stock photos, fake hobbies), "demographic-only construction" (title + company size = describes the account, not the human), and "missing jobs-to-be-done" (no answer to "what are they afraid will go wrong?").
- A B2B-specific framing: "the champion already understands the other stakeholders' concerns and is factoring them in." This *amplifies* (doesn't contradict) Torres' interview-grounded discipline and aligns with Dunford's "position for one champion" stance from artifact 01.

**Where corpus and books diverge:**
- One PMA chunk ("Speak to the whole buying group – not just one stakeholder") softly conflicts with the champion-first stance from artifact 01 positioning. **Resolution**: books win on the *positioning* level (one champion gets the position). On the *persona artifact* level, multi-stakeholder reality is real — handle it by allowing **one persona doc per stakeholder type** (champion is mandatory; others optional), not by diluting a single doc to cover everyone. This is the same pattern Dunford v2 uses: position for one, handle others via objection responses.

**Corpus gaps surfaced (logged in `corpus-gaps.md`):**
- The "Both start with a persona" chunk and the bare `[book] ? p.59` chunk both surfaced without `title`, `author`, or `url`. Same metadata-incomplete pattern as the Dunford gap from artifact 01. Logged.

---

## Boundary clarity: persona vs ICP vs buyer journey

This artifact sits inside a tight neighborhood — three overlapping concepts that PMM teams routinely conflate. Drawing the line crisply:

| Artifact | Unit of analysis | Question it answers |
|---|---|---|
| **04 — ICP** | The **company** | Which accounts close, expand, refer, and don't churn? (Firmographic + situational + psychographic.) |
| **05 — Buyer Persona** (this) | The **human** inside the best-fit account | Who champions / decides / uses, what's their job, what makes them say yes? |
| **06 — Buyer Journey Map** | The **persona's path** | What stages does this human move through from trigger to renewal? |

Concretely:
- ICP says: *"Mid-market RevOps teams running on Salesforce + 8 spreadsheets who just hired their first analytics lead."*
- Buyer persona says: *"The newly-hired analytics lead — 6 months in, under pressure to show wins, afraid of being seen as just-another-spreadsheet-jockey."*
- Buyer journey says: *"This persona's trigger → shortlist → demo → POC → procurement → onboarding."*

If a persona artifact starts describing the company, it has drifted into ICP. If it starts describing stages and timeline, it has drifted into the journey map. Keep the unit of analysis at the human level.

---

## Multi-stakeholder reality: how this artifact handles it

Artifact 01 (positioning) makes a hard call: position for ONE champion. This artifact respects that, but acknowledges that real B2B deals involve a buying committee. The pattern:

- **One persona doc per stakeholder role.** Each doc is single-focus: champion, OR economic buyer, OR end user, OR technical evaluator. The header explicitly forces a pick.
- **The champion persona is mandatory and primary.** It's the deep dive on the human positioning was built for. If a team only has time for one persona doc, this is the one.
- **Other personas are optional and light.** Economic buyer / end user / technical evaluator each get their own doc only if the deal motion materially requires it (e.g., long enterprise deals where IT veto is real). They are written *as objection-handling support* for the champion, not as competing positioning targets.
- **No "Sarah, age 34, Subaru" composites.** A persona that tries to be "the buyer" in general is the failure mode Torres calls out. Each doc names exactly one role.

This produces persona-soup-prevention: the team can have 1-4 persona docs, but each is sharp and single-role.

---

## Template design decisions

**Authority hierarchy:** Kalbach's JTBD job-performer model drives the structure. Torres' proto-persona discipline drives the *tone* (interview-grounded, no fiction). Cagan's Four Risks drive two specific sections (value risk: "what makes them say yes"; viability risk: "what makes them fail internally"). Corpus amplifies with B2B taxonomy.

**Mandatory role pick at the top.** Before anything else, the persona doc names which of the four B2B roles it is. No multi-role docs.

**Functional + emotional + social jobs, not "needs."** "Needs" is vague (Kalbach's critique). The doc decomposes the persona's jobs into the three layers JTBD names.

**Trigger event over biography.** Instead of "personal background" (where Marketing-Mary-isms breed), the doc captures the *trigger that starts the buying process*. This is corpus-amplified ("the trigger event that starts the buying process") and consistent with JTBD circumstances.

**Desired outcomes, not feature wishes.** The "what success looks like" section forces the desired-outcome-statement form (direction of change + unit + object + clarifier).

**Internal politics section.** Champion-specific: what they have to manage upward, what objection IT/finance/legal will raise, what "safe choice" means to them. This is the corpus's strongest single contribution.

**Evidence column required.** Every claim on the persona must cite the source: interview quote, deal note, support ticket, anonymized customer name, or "untested assumption." Torres' discipline. The persona surfaces what's grounded vs what's a guess.

**No fictional details section.** No name, no stock photo prompt, no hobbies, no pet's name. The doc explicitly omits these because including them as bracketed prompts would invite their use.

---

## Section-by-section rationale

| Section | Source | Why included |
|---|---|---|
| Role declaration | Corpus (4-role taxonomy) + Torres (no soup) | Forces single-role focus per doc. |
| Best-fit account context | ICP linkage | One-line link to ICP so the persona is anchored to the company-level pattern. |
| Trigger event & circumstances | JTBD circumstances + corpus | What starts the buying process — not biography. |
| Functional / emotional / social jobs | Kalbach JTBD | Replaces vague "needs"; gives the model the JTBD job-element structure. |
| Desired outcomes (success criteria) | Kalbach desired-outcome statements | Direction + unit + object + clarifier. Testable. |
| Shortlist criteria | Corpus (champion section) | How they decide who makes the cut — sales-rep-level knowledge. |
| What makes them say yes (value risk) | Cagan value risk | The buying-decision crux. |
| What makes them fail internally (viability risk) | Cagan viability risk + corpus internal-politics | Champion-specific political fear layer. |
| Objections from other roles | Positioning artifact 01 alignment + corpus | The champion pre-handles these; the doc captures them so messaging can equip the champion. |
| Evidence / sources | Torres proto-persona discipline | Every claim labeled grounded vs assumed. |

## Sections excluded

- Name, stock photo, age, hobbies, "favorite podcast" — fictional detail inflation
- Industry / company size / employee count — those belong to ICP (artifact 04)
- Stage-by-stage path (awareness → consideration → decision) — that's the buyer journey (artifact 06)
- Generic "pain points" without circumstance or trigger — JTBD-failed
- Mission/values prose — not a buyer persona artifact

## System prompt failure modes (negative guidance)

Distilled to 5:
1. **Fictional detail inflation** — names, stock photos, hobbies, fake biography (Torres)
2. **Demographic-only construction** — title + company size + industry describes the account, not the human (Torres + corpus)
3. **Missing jobs-to-be-done** — no answer to "what are they trying to accomplish, and what are they afraid will go wrong?" (Kalbach)
4. **Persona soup** — one doc trying to cover champion + economic buyer + end user simultaneously (Torres + alignment with positioning artifact 01)
5. **ICP drift / journey drift** — describing the company (= ICP) or the stages (= buyer journey) instead of the human

Voice rule: Reference frameworks implicitly. Do not name-drop authors in the output.

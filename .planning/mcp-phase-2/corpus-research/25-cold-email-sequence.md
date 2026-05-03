# Research — Cold Email Sequence

## Canonical sources (read FIRST)

Per `artifact-book-map.md` row 25:

- **Bly — The Copywriter's Handbook** (primary craft layer)
  - Card: `~/Documents/AbhishekR/Book Brain/Bly - The Copywriters Handbook.md`
  - Frameworks pulled: **The 4 U's Formula** (Urgent, Unique, Ultra-specific, Useful) for subject lines; **Eight Headline Types** (direct, indirect, news, how-to, question, command, reason-why, testimonial) as a subject-line variant menu; **Four Core Tasks of Copy** (attention → message → persuade → response) which compresses to AIDA inside a single email; **You-Orientation** as the negative-guidance engine.
  - Hardline rule: "If you haven't sold in the headline, you've lost 80% of your reader." For cold email, the subject line is the headline. We treat it as a separate craft step, not an afterthought.
  - Failure-mode source: jargon, "utilize" instead of "use", inside-out language, missing CTA.

- **Hormozi — $100M Offers** (offer-construction layer)
  - Card: `~/Documents/AbhishekR/Book Brain/Hormozi - 100M Offers.md`
  - Frameworks pulled: **Value Equation** (perceived likelihood × timeliness ÷ time-delay × effort/sacrifice); **Market Selection** (urgency of pain × purchasing power × ease of targeting × growth) as the *targeting* prerequisite that determines whether any sequence works; **Trim & Stack** as the discipline of keeping each email's offer narrow.
  - Hardline rule: "Offer quality matters less than market fit; a Grand Slam Offer to the wrong audience falls flat." This is the single most important pre-work principle and dominates the corpus's "60-80% of outcome is determined before a word is written" line.

These two compose cleanly: Hormozi sets the *targeting + offer* upstream of the sequence (pre-work); Bly sets the *line-by-line craft* once you're inside an email. Neither gives you a sequence shape — that comes from the corpus.

---

## What the books establish (extracted directly)

### Bly — the copy spine for each individual email

- **Headline as gateway.** Five times as many people read headlines as body copy. In cold email, that's the subject line. The 4 U's are the test.
- **The 4 U's, scored 1-4 across all four dimensions.** Aim for 3+ on at least three dimensions. **Ultra-specific does the most lifting** in a cold-email context (the corpus echoes this).
- **Eight Headline Types as a subject-line variant menu.** When A/B testing or rewriting a flat subject, run it through the eight types: direct ("Cut reporting time 40%"), indirect (curiosity), news ("New: GA4 reporting now in [tool]"), how-to, question, command, reason-why ("Three reasons your reporting takes 8 hours"), testimonial. Practitioners default to "direct" or "question"; the menu opens the rest.
- **You-orientation.** "You can save 10%" beats "Customers can save 10%". Cold emails written in first-person plural ("we built", "our platform") trigger immediate dismissal.
- **Short sentences (14-16 words avg). Plain words.** "Use" not "utilize", "help" not "assistance".
- **Specific facts beat generic claims.** "40% reduction in Q3" beats "significant reduction".
- **Always end with a specific response instruction.** No CTA = no response. One CTA per email.
- **AIDA arc inside a single email** (Bly's Four Core Tasks): subject line gets attention → first sentence communicates the message → body persuades → close asks for response. One email = one AIDA loop.

### Hormozi — the pre-work layer

- **Market Selection is upstream of everything.** Cold-emailing the wrong list is the dominant failure mode regardless of copy quality. The four filters: (1) urgency of pain, (2) purchasing power, (3) ease of targeting, (4) growth trajectory. If the list fails these filters, sequence work is wasted.
- **Value Equation as the offer test for each email.** Every email's offer must increase perceived likelihood, accelerate timeliness, *or* reduce time-delay/effort. A "15-minute call" offer with no demonstrated likelihood is a poor offer. A "5-minute Loom that shows X" offer is a better offer because likelihood is proven and effort is lower.
- **Trim & Stack discipline per email.** Each email gets ONE offer/CTA. The instinct to stack ("call, demo, content, intro") collapses response rate — corpus echoes this as the multi-question CTA failure mode.
- **The grand-slam principle applied to a sequence.** The sequence's job is not five chances to pitch the same offer; it's five chances to surface a *different* angle on the same problem with a different micro-offer (calendar link → reframe → social proof → asset → break-up). Each email is a self-contained offer with one trade.

---

## What the corpus added (top 10 citations + synthesis)

Top citations from the query (`.json` peer file):

1. **Maja Voje — *The Go-To-Market Strategist* p.270-271** (book) — Surfaced the **40/40/20 principle** (40% list, 40% offer, 20% creative — applied to cold outreach). Reinforces Hormozi's market-selection-upstream rule. The corpus's "60-80% of outcome before a word is written" line is the synthesized version of this.
2. **Wes Bush / productled.com — Cold email to drive product signups** — Tactical sequence patterns (relevance hook + single value claim, behavior-based personalization on opens/clicks).
3. **Kirsty McConnell (PMA) — Personalize without being creepy** — The 90-second-research rule per prospect; one custom line + templated body as the scale pattern.
4. **Neil Patel — Email marketing for ecommerce** — One-CTA discipline (cited adjacent — adapted for B2B SaaS cold outbound).
5. **PMA — Personalization tactics** — Mailing-list segmentation; behavior-based sequencing on opens/clicks.
6. **Maja Voje — *The Go-To-Market Strategist* p.270** (book) — Targeting + offer upstream of execution. Same source as #1.
7. **Stevie Langford (PMA) — *What is B2B Messaging* (Prevalent pitfalls)** — Generic openings, jargon, inside-out language. Direct echo of Bly's failure-mode list and reused as practitioner-grade negative guidance.
8. **Stevie Langford (PMA) — *How to avoid B2B messaging mistakes*** — Same source.
9. **Brendan Kane — *Hook Point*** (book, generic metadata `book_pm` p.120, no title) — Surfaced as a practitioner reference for "hook in the first 3 seconds" — fits the relevance-hook pattern in Email 1. Logged as a partial-metadata corpus chunk.
10. **Stevie Langford (PMA) — *What is B2B Messaging*** — Repeats #7-8.

### What the corpus added beyond the books

Three things the books don't give you:

- **The 5-email shape with day-spacing.** Bly doesn't write sequences; Hormozi doesn't write sequences. The corpus did. The synthesis: **5 emails (not 7), spaced Day 1 / Day 4 / Day 8 / Day 13 / Day 18**, with a fixed pattern: relevance hook → problem reframe → social proof (specific) → different angle/asset → break-up. The break-up frequently produces the highest reply rate of the sequence.
- **Personalization-at-scale tradeoff.** "One custom line per email, everything else templated." The custom line references something findable in <90 seconds (LinkedIn headline, recent announcement, job posting that signals pain). Spending 45 minutes researching one prospect when you need 500 is the wrong tradeoff. Tools like Clay merge context automatically.
- **Behavior-based branching.** Someone who clicked twice is not the same as someone who never opened. Most teams treat them identically — the corpus calls this a missed signal. Encoded as a sequence-level pre-work flag.

### Where the corpus and books disagreed

- **Sequence length: 5 vs 7 emails.** Some practitioner sources push 7-touch sequences. Corpus synthesis said 5 explicitly: "After five touches with no response, you've learned something: either the targeting is wrong, the offer doesn't resonate, or the timing is bad." Bly and Hormozi don't speak to length.
  - **Winner: 5 emails (corpus synthesis).** The template renders exactly five email blocks. Adding more is a signal you should re-run targeting (Hormozi market-selection), not extend the sequence.
- **Subject-line school: clickbait/curiosity vs ultra-specific.** Some practitioners advocate vague-curiosity subjects ("Quick question", "Following up") to drive opens. Corpus and Bly agree those *used to work*. The corpus is direct: "Buyers are immune now."
  - **Winner: Bly + corpus (ultra-specific).** Vague curiosity is encoded as a failure mode. The "would this make sense from a colleague?" test is the colleague-tone filter.
- **Multi-CTA "give them options" school.** Some sales-enablement sources stack "call OR more info OR 15 minutes" to "give the prospect choice".
  - **Winner: Hormozi + corpus (one CTA per email).** Trim & Stack at the email level. One offer, one decision. The compound close is encoded as a failure mode.

### Where the books and corpus merged

- **Failure-mode list.** Bly's clarity rules + Stevie Langford's pitfalls + corpus's named failures collapse into 8 negative-guidance lines, all of them book- or corpus-grounded.
- **Subject-line craft.** Bly's 4 U's + corpus's "ultra-specific does the most lifting" + colleague-tone test compose into one craft block in the system prompt and the per-email skeleton.
- **Offer-per-email discipline.** Hormozi's Trim & Stack + corpus's one-CTA rule collapse into a single skeleton constraint: each email has exactly one CTA, and the CTAs *escalate* across the sequence (low-friction reply → calendar link → asset consumption → calendar link → graceful close).

---

## Boundary calls (resolved before drafting)

Three frames that get conflated — locked here to avoid template overlap:

- **This artifact** is an *outbound cold sequence* — to a prospect at a best-fit account who hasn't engaged yet. Output: a 5-email sequence with subject + body + day-spacing + behavioral branches.
- **Distinct from launch blog post (artifact 10)** — that's *inbound* content (someone already on your site). Cold email is *outbound* and assumes zero prior interest. Different intent, different craft.
- **Distinct from customer testimonial ask (artifact 15)** — that's an existing-customer message about a quote. Cold email is a never-met-you message about a meeting. Relationship state and ask shape are completely different.

The template covers the *sequence only*. The underlying offer (calendar link, what gets demoed, what value is promised) inherits from `value_proposition_canvas`, `messaging_framework`, and `icp` upstream. The sequence is the wrapper; the offer is the content.

---

## Template design decisions

- **5 emails, locked.** Not "3-7", not "as many as needed". Five blocks render in the skeleton. The corpus synthesis is unambiguous, and the books don't contradict.
- **Fixed day-spacing.** Day 1 / Day 4 / Day 8 / Day 13 / Day 18. Not "3-7 days between" — that's setup overhead the user shouldn't relitigate. Days are inline in each email's heading.
- **Fixed pattern per email.** Email 1 = relevance hook + value claim + low-friction CTA. Email 2 = problem reframe (pattern recognition, not desperation). Email 3 = specific social proof. Email 4 = value asset (Loom / research / framework — the "give first" turn). Email 5 = break-up (graceful close, often highest reply rate).
- **Subject + body + one-CTA structure repeated 5×.** Each email block has identical anatomy: subject (with 4 U's prompt), body (with paragraph-level prompts), single CTA (named explicitly), day-spacing in the heading.
- **Subject-line craft block as Step 0.** Before the sequence, a craft block prompts the user through Bly's 4 U's, the eight headline types as a variant menu, and the colleague-tone test. This is structural — the subject line is not an afterthought; it's the first 80% of the work.
- **Pre-work as a pre-Step-0.** Three items: targeting fitness (Hormozi market-selection filters applied to the list), offer fitness (Value Equation applied to what you're asking for), one-line personalization plan (what's findable in 90 seconds). Skipping pre-work = wrong-list, wrong-offer = sequence is wasted regardless of copy quality.
- **Behavior branch flag.** A small block at the end notes that opens/clicks change what Email N should look like. We don't render branched copy (that bloats the template); we flag it as a sequence-runner concern.
- **Composition pointers.** Cite upstream inputs (positioning, messaging, ICP, value-prop) so the user knows where the offer language should come from. Cite downstream artifacts that the sequence feeds (sales call → discovery questions, demo script).

### Section-to-source map

| Template section | Source |
|---|---|
| Pre-work: targeting fitness (4 filters) | Hormozi — Market Selection |
| Pre-work: offer fitness (Value Equation) | Hormozi — Value Equation |
| Pre-work: personalization plan | Corpus — Kirsty McConnell + corpus synthesis |
| Subject-line craft block (4 U's + 8 types + colleague test) | Bly — 4 U's + Eight Headline Types; corpus colleague-tone test |
| Email 1 — relevance hook | Corpus synthesis (Wes Bush + corpus pattern) |
| Email 2 — problem reframe | Corpus synthesis |
| Email 3 — specific social proof | Corpus synthesis + Bly (specific facts > generic claims) |
| Email 4 — value asset / different angle | Corpus synthesis (give-first / behavior-branch) |
| Email 5 — break-up | Corpus synthesis (highest-reply-rate signal) |
| One-CTA discipline | Hormozi — Trim & Stack; corpus — one-CTA rule |
| Behavior branch flag | Corpus synthesis (open/click signal) |
| Validation checklist | Bly — clarity rules; corpus — failure modes |

### Sections excluded

- **Domain warmup / deliverability.** Important but operational, not craft. Belongs in a sequencer-runner doc, not the template.
- **A/B test design.** A separate concern; the template gives one strong default sequence.
- **Reply-handling scripts** (when prospect responds with objection/interest). Different artifact: `objection_handling` (22) or `talk_track` (21).
- **Multi-channel orchestration** (email + LinkedIn + phone). Out of scope; this is the email sequence.
- **Inbound nurture sequences.** Different intent (warm), different craft.
- **Templates with merge tags pre-filled.** The template renders the *shape*; user fills the offer language from upstream artifacts.

---

## System prompt failure modes (negative guidance, distilled)

From book + corpus, eight failure modes encoded:

1. **"Just checking in" / "Following up" / "Bumping this"** — signals you have nothing new to say. Every follow-up needs a new angle, a new asset, or a new piece of relevance. (Corpus.)
2. **Generic openings** — "Hope this finds you well," "My name is X and I work at Y." Trash-folder triggers. (Corpus + Bly + Stevie Langford.)
3. **Multi-question / compound CTAs** — "Open to a call? Or more info? Or 15 minutes?" Pick one. (Hormozi Trim & Stack + corpus.)
4. **No relevance signal** — could have been sent to anyone in the industry. Even one specific detail changes the psychology. (Corpus.)
5. **Immediate hard sell** — first email asking for a 45-min demo is asking too much trust too fast. Micro-commitments first (reply, click, calendar link). (Hormozi Value Equation: effort/sacrifice too high.)
6. **Inside-out language** — "We built", "our platform", "I wanted to introduce you to". Replace with You-orientation. (Bly.)
7. **Vague curiosity subject lines** — "Quick question", "Quick favor", "Following up". Used to work; immune now. Apply 4 U's, weight ultra-specific. (Bly + corpus.)
8. **Sequence run on the wrong list** — no copy fixes a list failure. If targeting fails Hormozi's four filters, do not run the sequence. (Hormozi + Voje 40/40/20.)

### Positive asks (4)

1. **Each email has exactly one CTA, and the CTAs escalate** (low-friction reply → calendar → asset → calendar → graceful close).
2. **Pull buyer language from RAG corpus** — Sharebird AMAs, podcast transcripts. Buyers' words outperform marketers' words.
3. **One custom line per email, everything else templated** — findable in <90 seconds (LinkedIn headline, recent announcement, job posting).
4. **Subject lines pass the colleague test** — would this make sense sent from a colleague? If no, rewrite.

---

## Open questions for audit

- **Should Email 4 default to "value asset" or to "different angle / no asset"?** Currently "value asset" (Loom / framework / research) because the corpus weight is on give-first. The downside: requires the user to actually *have* an asset. Open: should the template prompt for an asset upfront or render a fork?
- **Should the break-up (Email 5) include a soft re-engagement line ("if timing changes…")?** Currently yes — corpus pattern. The argument against: pure-break breakups can produce sharper reply rates than soft-reopen breakups.
- **Should subject-line variants be rendered (3 options per email) or just one?** Currently one — keeps the template lean. Argument for multiple: A/B testing is standard cold-email practice. Decision: one subject line, validation checklist prompts the user to draft 2 alternates if running A/B.
- **Should the template include a 6th "after the sequence" line** — what to do when the sequence ends with no reply? Currently flagged in composition pointers as "re-list with new angle in 90 days OR remove from list" — not its own section.

## Corpus gaps logged

- `book_pm` chunk for Brendan Kane *Hook Point* (p.120) surfaced with broken metadata (no title, generic source-type tag). Used inferentially. Logged for next ingestion sweep.
- No book chunk surfaced for Bly *Copywriter's Handbook* despite it being canonical for this artifact. Read directly from Book Brain card (per methodology); flagged as gap so future cold-email-adjacent queries (artifacts 18, 34, 35, 38) can pull it.
- No book chunk surfaced for Hormozi *$100M Offers*. Same path — read from card, logged as gap. Will affect artifact 35 (landing page copy) and 39 (pricing page copy) which both name Hormozi as canonical.

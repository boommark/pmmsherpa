# Research — Partner-Facing Launch FAQ (artifact 30)

## Canonical sources (read FIRST)

- **Smart Brevity (VandeHei / Allen / Schwartz)** — `~/Documents/AbhishekR/Book Brain/Smart Brevity.md`
  - Core 4: TEASE / LEDE / WHY-IT-MATTERS / GO-DEEPER. For a partner-facing FAQ,
    each Q+A renders as TEASE (the literal partner-rep question) + LEDE (one
    decision-grade sentence the rep can say in front of a customer) + optional
    GO DEEPER (bullets the partner enablement lead reads but the rep won't
    quote verbatim). WHY-IT-MATTERS appears once at the top of the FAQ as the
    block-purpose preamble, not per Q+A — partner reps are reading mid-meeting,
    not skimming.
  - Audience First: the reader is a *partner rep* (multi-vendor seller juggling
    several lines of business) AND a *partner enablement lead* (programmatic
    consumer prepping their reps). Both consume the same FAQ; both have low
    tolerance for vendor-internal language.
  - Short, Not Shallow: ruthless compression matters more here than in the
    internal FAQ — partner reps are not paid to study our product. If the FAQ
    is long, they don't read it; their customers ask and they wing it.
  - Fog of Words: jargon that's invisible to vendor employees ("co-term",
    "land-and-expand motion", "AE handoff trigger") is fog to a partner rep.
    Strip it.

- **Internal Launch FAQ (artifact 12)** — sibling, NOT canonical. We inherit
  the TEASE/LEDE craft discipline, the awkward-questions-as-required pattern,
  and the script-not-principle rule. We do NOT inherit the discount-authority
  section (vendor-internal commercial sensitivity), the competitor naming
  posture (partner reps expose this to their customers; safer framing), or
  the "what does PMM tell sales" tone. The audience is fundamentally
  different: an employee of a *different company* selling our product
  alongside their own portfolio.

- **Co-Sell Battlecard (artifact 28)** — adjacent partner artifact. We inherit
  its structural insistence that partner economics is a *required section, not
  a footnote* and its corpus gap pattern: channel conflict must be addressed
  explicitly, not buried.

## Corpus citations (top synthesis)

The corpus query returned a remarkably coherent five-block FAQ structure
synthesized from 10 citations across PMA blogs, PMA podcast, and AMAs by
Amanda Groves, Shana Iles, Andrew Kaplan, Janani Nagarajan, Jesse Lopez,
April Rassa, Sharon Markowitz, and Stephanie Kelman. The synthesis is
strong because partner enablement is one of the few PMM topics where
practitioners agree on the question taxonomy — partner reps reliably ask
the same five families of questions at every launch.

The five blocks the corpus surfaces, in priority order:

1. **WIIFM ("What's in it for me?")** — margin/commission, SPIFFs, co-op
   funds, joint demand gen, tier requirements. *Comes first because if this
   doesn't land, nothing else does.* Direct quote from the corpus: "If the
   economics aren't clear in the first five minutes of your enablement
   session, they mentally move on."

2. **Readiness ("How do I sell it?")** — ICP they can identify in their
   existing book, elevator pitch a non-PMM rep can use, objections + scripts,
   self-serve demo access, regional/vertical proof points. The corpus calls
   out the localization gap: "A partner selling into German retail doesn't
   want a case study from a US fintech."

3. **Channel conflict ("Will I get burned?")** — what happens if my customer
   is already in your CRM, where does your direct team's territory overlap,
   who owns the deal when both teams are talking to the prospect, what if a
   net-new logo gets a direct rep assigned later. The corpus is unambiguous:
   "This is where trust lives or dies… Ambiguity here kills partner
   engagement faster than anything else."

4. **Deal registration ("How do I protect myself?")** — registration
   process + SLA, protection window, what happens if customer goes direct,
   discount differential for registered deals, can early-stage opportunities
   be registered. The corpus recommends a one-page lifecycle visual:
   "Partners ask these questions because the process is opaque. A one-page
   visual eliminates 80% of the confusion."

5. **Post-sale ("What happens after I close?")** — implementation owner,
   support routing, renewal/expansion attribution, customer success
   resourcing. Often skipped in launch FAQs because PMM owns launch and CS
   owns post-sale, so the seam stays unaddressed. Required for a partner
   FAQ because the partner experiences the seam, not the vendor.

## Sibling-boundary calls (what makes this NOT artifact 12)

| Dimension | Internal FAQ (12) | Partner FAQ (30) |
|---|---|---|
| Reader | Vendor's own AEs/SEs/CSMs | Partner reps + partner enablement leads |
| Threat model | Internal — can name pricing exceptions, known issues, lost deals | External-of-vendor — must not include commercial-sensitive vendor internals |
| Discount authority | Required section with thresholds/approvers | Excluded — discount mechanics live in deal-reg + co-op fund sections |
| Sales comp | Required (manager / VP approval ladder) | Excluded — replaced by partner economics (margin, SPIFFs, attribution) |
| Competitor naming | Direct ("we see Competitor X most") | Softer framing — partner rep may have Competitor X as another vendor in their portfolio. Frame around buyer alternatives, not named competitor attacks |
| Known issues | Required, candid | Required but framed as "known limitations and current workarounds" — same content, language calibrated for in-front-of-customer use |
| Channel conflict | Not present | **Required dedicated block** — corpus's strongest insistence |
| Deal registration | Not present | **Required dedicated block** with process visual |
| Roadmap candor | "Exploring X, no committed timeline" allowed | Tighter — "no committed timeline, contact your partner manager for current roadmap visibility" |
| Awkward questions | Skip these and reps invent answers internally | Skip these and partner reps wing it in *front of their customers* — higher cost of failure |

## Design decisions

1. **Five-block category architecture from the corpus, not seven.** The
   corpus synthesis is unusually clean. We adopt WIIFM / Readiness / Channel
   Conflict / Deal Reg / Post-Sale as the five required categories and add
   two structural sections that aren't Q+A: a header block (audience +
   sensitivity defaults + linked artifacts) and an "awkward questions"
   closer (the questions partner reps ask in private that vendors often
   pretend don't exist).

2. **WIIFM goes first, not "what is it."** Direct inversion of the internal
   FAQ. The internal FAQ leads with "what does it actually do" because
   employees need product literacy. The partner FAQ leads with margin and
   incentives because partner reps need a reason to allocate selling time
   before they care what the product does.

3. **TEASE/LEDE per Q+A, no per-Q WHY-IT-MATTERS.** Same craft discipline
   as artifact 12. WHY-IT-MATTERS appears once per block as the block
   preamble — partner reps reading mid-meeting need the LEDE to land in one
   sentence.

4. **Channel conflict as a required dedicated block, with three required
   scenarios.** "Customer already in your CRM," "your direct rep
   over-territory with my book," "net-new logo later assigned a direct
   rep." Plus a named escalation contact. The corpus is clearest here that
   ambiguity is the killer.

5. **Deal registration block requires a process visual / lifecycle
   description.** Even when generated as text, the section explicitly
   prompts for a step-by-step process (submit → review → approve →
   protection window → expiration) because the corpus says opaqueness is
   the failure mode.

6. **Negative ICP block is renamed and refocused.** In the internal FAQ,
   "who is NOT a good fit" filters out bad-fit prospects for vendor reps.
   In the partner FAQ, the negative ICP is "**which of your existing
   accounts should you NOT pitch this to**" — written from the partner
   rep's perspective, scanning their own book of business.

7. **Awkward-questions closer is required, not optional.** Three
   prototypical awkward questions: "what happens if you change the
   compensation structure mid-year," "what's the realistic time-to-first-
   commission," "how committed is your direct team to this product
   long-term." These get honest LEDEs because partner reps ask them
   privately to their partner manager regardless; better to arm the
   partner manager with the answer.

8. **Explicit boundary statement at the top of the FAQ pointing at
   artifact 12.** "This is the partner-facing FAQ. For internal AE/SE/CSM
   enablement, use the Internal Launch FAQ." Prevents the doc from being
   accidentally widened into vendor-internal use.

9. **No competitor names in writing.** The "Don't say this" guidance lifts
   from artifact 12 but is firmer here: "do not name competitors in writing
   in this FAQ." Partner reps may sell our competitor in another segment;
   written competitor attacks expose the partnership.

10. **Linked artifacts at the bottom.** Co-sell battlecard (28), joint
    solution brief (29), partner-program one-pager (if it exists), deal-reg
    portal URL. The FAQ doesn't duplicate; it routes.

## Conflicts / tensions

- **Smart Brevity says short; partner enablement says comprehensive.**
  Resolution: each LEDE caps at 2-4 sentences, GO DEEPER caps at 3-5
  bullets — same caps as artifact 12. If a partner rep needs more, they
  call their partner manager (and we put that contact in the metadata).

- **Corpus puts post-sale fifth; some sources put it in the WIIFM block
  (because attribution = renewals = comp).** Resolution: keep post-sale as
  a separate block but explicitly reference renewal/expansion attribution
  back to the WIIFM block. Partner reps think about post-sale comp at
  close, not at launch.

- **Naming a partner-conflict escalation contact creates a load on that
  person.** Resolution: name a *role* not a person ("VP Partnerships" or
  "Partner Operations team"), and prompt the user to confirm the role
  exists and is staffed before publishing.

## Open questions / corpus gaps

- The corpus has strong coverage of channel conflict and deal reg but thin
  coverage of **partner-marketing co-funding mechanics** specifically (MDF
  vs. co-op vs. accrued vs. proposal-based). The WIIFM block prompts for
  this but the model will infer rather than cite. Flag for the
  partner-economics ingestion sweep.

- The corpus has very little on **regional/vertical proof-point
  localization** beyond the one quote. Practitioner blogs from EMEA-heavy
  partner-led vendors would be a useful future ingestion target.

- The corpus has nothing on **partner-tier-gated launches** (e.g., this
  feature is only sellable by Gold+ partners). The WIIFM block has a "tier
  requirement" prompt but the depth is shallow. Acceptable for v1.

## Verdict

The Smart Brevity book card supplies the per-Q+A craft (TEASE → LEDE →
optional GO DEEPER) and the audience-first / fog-cutting discipline. The
corpus supplies a clean five-block category architecture (WIIFM →
Readiness → Channel Conflict → Deal Reg → Post-Sale) that is closer to
field-ready than what the book alone would produce. The sibling
boundary vs. artifact 12 is sharp and asymmetric: 30 *adds* channel
conflict + deal reg + WIIFM/economics, *removes* discount authority +
sales comp + direct competitor naming, and *recalibrates* known-issue
language for in-front-of-customer use.

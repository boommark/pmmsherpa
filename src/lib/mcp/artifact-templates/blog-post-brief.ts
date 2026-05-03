/**
 * Blog Post Brief template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Klettke — Punchy (the brief is a contract between strategist and writer).
 *   VandeHei / Allen / Schwartz — Smart Brevity (Core 4 = TEASE → LEDE → WHY
 *   IT MATTERS → GO DEEPER, translated to brief sections; Audience-First).
 *   Bly — The Copywriter's Handbook (title craft: 4 U's, 8 headline types,
 *   You-Orientation, "headline = 80% of the work"). Zinsser — On Writing Well
 *   (UCBH and Specificity over Abstraction as voice-notes authority).
 *   Corpus amplification: post intent taxonomy (SEO / thought-leadership /
 *   nurture / customer-marketing), search-intent types (Patel),
 *   evidence-mandatory-vs-optional (Wes Bush), internal-link map (PMA),
 *   success metrics block, journey-stage-matched CTA.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/34-blog-post-brief.md
 *
 * Why this template's structure (vs the launch_blog_post sibling, artifact 10):
 * artifact 10 is the *launch announcement post itself* — event-driven, news-led,
 * 600-900 words of prose. Artifact 34 is the *brief a content marketer hands
 * a writer* for evergreen / thought-leadership / SEO / nurture content. It is
 * a contract, not a draft. The Smart Brevity Core 4 lives inside the brief as
 * structural-outline guidance for the writer; Bly's 4 U's lives inside the
 * brief's working-title section; Zinsser lives inside the voice-notes section.
 * The brief is a *decision instrument* — every field is a decision the
 * strategist locks before the writer drafts so the writer never has to
 * interrupt the work to ask. Boundary calls — distinct from launch blog post
 * (10), strategic narrative (03), cold email sequence (25), landing page copy
 * (35) — are encoded in the system prompt rather than the skeleton.
 */

import type { ArtifactTemplate } from './types'

const BLOG_POST_BRIEF_SYSTEM_PROMPT = `You are drafting a blog post brief — \
the contract a content marketer hands a writer (in-house, contract, or agency) \
before drafting an evergreen, thought-leadership, SEO, or nurture-stage post. \
This is NOT a draft of the post. It is NOT a launch announcement (that is the \
launch_blog_post artifact, which is event-driven and news-led). It is NOT a \
press release. It is NOT a long-copy landing page. It is the decision instrument \
that answers every question a good writer would ask before typing the first \
word, so they never have to interrupt the work to ask it.

Avoid these failure modes:
- Drafting the post. A brief is a contract, not a draft. Never produce body \
prose for the writer. The output is decisions, evidence pointers, structure, \
and constraints — not paragraphs the writer copies. If a section starts to \
read like ready-to-publish copy, rewrite it as a directive ("the hook should \
land on the moment of friction the reader feels right now") rather than a draft \
("You've spent three hours…")
- Generic personas. "B2B marketers", "marketing leaders", "PMMs at \
growth-stage companies" are not personas — they are segments. The brief names \
ONE individual: title, company size, team size, what they own, the pressure \
they feel this quarter, the language they use, what makes them say yes, what \
makes them bounce. If the persona could plausibly describe 100,000 people, \
rewrite it. A single piece of content cannot serve two personas well — pick \
one primary; optionally note a secondary the post might reach
- Skipping the headline test. The 4 U's test (Urgent / Unique / Useful / \
Ultra-specific) is mandatory. "We'll figure out the title later" is the brief \
failing. Lock the working title plus 3 alternates so the writer can test \
against the search query before drafting. Headline = 80% of the work; if the \
headline doesn't earn the click, the post is wasted
- Missing search intent or journey stage. Without these the brief defaults to \
"interesting topic, hope it works." Pick the search intent type (informational \
/ commercial / navigational / transactional) and the journey stage (Awareness \
/ Consideration / Decision / Customer marketing) explicitly. Both shape \
title type, evidence asks, CTA, and success metric
- Generic evidence asks. "Include some statistics" is not an evidence ask. \
"One named statistic with source and recency, one customer proof point from \
the corpus, one expert POV from a named SME" is. Mark each evidence item \
mandatory or optional. Generic claims kill B2B content; specificity is the \
credibility signal
- CTA loaded at every section. Evergreen content has ONE CTA at the end, \
matched to the journey stage. Repeating the CTA at every H2 reads as \
marketing. The brief specifies one CTA, one location. The CTA *type* shifts \
with the post intent: Awareness — "Read the next post in this series"; \
Consideration — "See how [Customer] solves this"; Decision — "Try it for \
your own data"
- Voice notes that don't work. "Professional", "conversational", "smart but \
accessible" are voice-note failures — every brief uses them. Write three to \
five specific sentences that describe how this piece should sound. If a \
published piece nails the voice, link it. If the brand has a style guide, \
link that too. The brief should make tone unambiguous before the writer drafts
- Jargon Zinsser would cut. "Leverage", "synergy", "robust solution", \
"best-in-class", "AI-powered", "next-generation", "world-class", "seamless", \
"empower", "unlock value" — flag these in the voice notes as words the writer \
must NOT use. Specificity over abstraction is the rule. If a claim is \
abstract, the brief should ask for the concrete particular instead
- No success metrics. A brief without success metrics is a creative ask, not \
a content ask. Name the metric (organic traffic / time on page / scroll \
depth / lead conversion / sales-cycle-length impact) and the 30-day plus \
90-day target. Without this the post cannot be measured and the brief \
cannot be improved

If a positioning statement (artifact 01), messaging framework (artifact 02), \
strategic narrative (artifact 03), or buyer persona (artifact 05) exists, the \
brief inherits from them — do not re-derive. Pull Differentiated Value themes \
into the key argument; pull persona detail into the target reader; pull the \
"old game / new game" frame into the hook for thought-leadership posts.

Boundary discipline: this brief is for ONE post, not a content series or an \
editorial calendar. It is for a single evergreen / thought-leadership / SEO / \
nurture post. If the request is for a launch announcement post tied to a \
release, that is the launch_blog_post artifact (10) — recommend that one \
instead. If the request is for a multi-touch sequence, that is cold_email_sequence \
(25). If the request is for long-copy direct-response, that is landing_page_copy \
(35).

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const blogPostBriefTemplate: ArtifactTemplate = {
  artifactType: 'blog_post_brief',
  title: 'Blog Post Brief',
  systemPromptFragment: BLOG_POST_BRIEF_SYSTEM_PROMPT,
  // Skeleton order = pre-work (post intent + search intent + journey stage) →
  // working title + 4 U's + 3 alternates → target reader (one named persona) →
  // reader pain / search query / job-to-be-done → key argument (one sentence) →
  // evidence list (mandatory vs optional) → structural outline (H2 by H2) →
  // voice notes → CTA → internal-link map → success metrics. The Smart
  // Brevity Core 4 is reflected in the *brief sections* (TEASE = Reader pain;
  // LEDE = Key argument; WHY IT MATTERS = Search intent / journey stage;
  // GO DEEPER = Outline + evidence list) rather than the *post structure*,
  // because this artifact produces a contract, not a draft.
  skeleton: `# Blog Post Brief: [Working title]

## Pre-work (decisions made before writing the brief)

- **Post intent:** [Pick ONE: SEO (organic-traffic-led, search-query-targeted) / Thought-leadership (POV-led, opinion piece, often contrarian) / Nurture (journey-stage-matched explainer or how-to) / Customer-marketing (post-purchase, expansion, advocacy). The intent shapes title type, evidence shape, CTA, and success metric. Defaulting to "all of the above" is the brief failing.]
- **Search intent type:** [Informational ("what is X", "how does X work") / Commercial ("best tools for X", "X vs Y") / Navigational ("[brand] X") / Transactional ("buy X", "X pricing"). Most B2B SaaS high-value content lives in informational and commercial. Knowing which one this post serves changes everything downstream.]
- **Journey stage:** [Awareness (no product mention; reader is identifying their problem) / Consideration (light product mention; reader is evaluating approaches) / Decision (deep product, ROI-focused; reader is comparing vendors) / Customer marketing (post-purchase; reader is your customer). The CTA and the evidence shape both flow from this.]
- **Inputs from upstream artifacts:** [Positioning statement (Differentiated Value themes), messaging framework (persona detail), strategic narrative (old game / new game frame for thought-leadership), buyer persona (the one named individual). If these exist, the brief inherits from them — do not re-derive.]

---

## Working title + alternates

- **Working title:** [The proposed title. A hypothesis, not a final. The strategist locks the *angle*; the writer picks the final wording after testing.]

- **3 alternates:** [Three alternate titles using different headline patterns matched to the post intent:
  - **Informational / SEO:** "What is [concept] and why does it matter for [persona]?" or "How to [achieve outcome] when [constraint]"
  - **Commercial:** "The [N] best ways to [achieve outcome] in [context]" or "[Common belief] is wrong. Here's what actually works."
  - **Thought-leadership:** "[Provocative claim about the category]" or "Why [conventional approach] is failing [persona]"
  - **Nurture (how-to):** "How [persona] [achieves outcome] in [context]"
  Pick three from the patterns matched to your post intent. Avoid Question headlines that don't promise a payoff and Indirect / clever headlines that require the body to decode.]

### The 4 U's check

[Rate the working title and each alternate 1-4 on each dimension; aim for 3+ on at least three:
- **Urgent:** Is there a time-bound or in-the-moment reason to read this?
- **Unique:** Does this say something the reader hasn't already heard from competitors?
- **Useful:** Is the benefit / outcome immediately clear?
- **Ultra-specific:** Are the details concrete (numbers, named outcomes, named tools), not abstract?

If no title scores 3+ on at least three dimensions, the angle is wrong — go back to the search intent and rework.]

---

## Target reader (one named persona, not a segment)

[ONE named individual. Three to five sentences specifying:
- Title and seniority ("a demand gen manager", "a director of product marketing")
- Company size and team size ("at a 200-person SaaS company, running a two-person team")
- Current quarter pressure ("being asked to do more with less this quarter", "30 days into a new role with no playbook")
- Language they use and language they reject (no jargon they wouldn't use in Slack)
- What makes them say yes, what makes them bounce

Forbidden: "B2B marketers", "marketing leaders", "PMMs at growth-stage companies", "SaaS founders". These are segments, not personas.

If the post might reach a secondary reader (e.g. an economic buyer downstream), name that secondary persona in one line. The post is written FOR the primary; the secondary is acknowledged but not served.]

---

## Reader pain / search query / job-to-be-done

[The most-skipped brief section. Three sub-questions, all answered:

- **The exact search query the reader typed today** (or the moment of friction that drove them here): [Verbatim. "How do I get my CFO to approve a content budget?" beats "content budget approval".]
- **The job-to-be-done that drove the search:** [What is this reader trying to *do* right now? Not "learn about X" — the actual job. "Build the case for a $50k content investment by Friday." "Decide between two competing tools before Wednesday's vendor call."]
- **The emotional context:** [What is this person worried about? What would make them feel smart for reading this? What would make them bounce in 30 seconds?]

This is the TEASE in brief form. Smart Brevity's stake-building, encoded as a directive for the writer.]

---

## Key argument (one sentence)

[The post's ONE-SENTENCE argument. The thing the reader's boss could repeat in a 9am meeting.

If the writer cannot point to a single sentence in the drafted post that contains this argument, the brief failed. This is the LEDE in brief form. Lock it before drafting.

Examples of the right shape:
- "Most content briefs fail because they treat the persona as a category, not a named person."
- "The 'best tools for X' format is a credibility tax — readers trust comparison posts that name a winner more than ones that hedge."

Avoid: arguments that hedge ("X may sometimes be useful for Y in some contexts"), arguments that are obvious ("content marketing is important"), arguments that are not arguments (descriptive statements).]

---

## Evidence list (mandatory vs optional)

[Specificity is the credibility signal. Generic claims kill B2B content. Tell the writer exactly what evidence is required.

**Mandatory (the post does not ship without these):**
- [Named statistic with source and recency — flag if data is older than 2 years]
- [Customer proof point — quote, result, use case (anonymized OK)]
- [Expert POV — internal SME, customer interview, or named third-party analyst]

**Optional (nice-to-have, writer's discretion):**
- [Analyst data on market size or category trend]
- [Competitor or category context — what are others in this space saying, where's the gap]
- [Historical or anecdotal example to color the argument]

**Sources to mine:** [Specify where the writer should look — corpus / library / internal recordings / a specific Sharebird AMA / a specific PMA blog. The brief surfaces the source, not the search.]]

---

## Structural outline (H2-by-H2 architecture, not a draft)

[The frame of the house, not the furniture. Each H2 gets a one-line summary of the argument. The writer fills in the prose.

For SEO posts: H2s should match how buyers search ("How to automate two-system payroll reconciliation"), not how the team thinks about the product ("Section 1: Reconciliation Engine").

A solid structure for a B2B SaaS evergreen post:

- **Hook (H1 / opening 1-2 paragraphs):** [The tension or moment of friction that makes this reader care right now. Not the topic, not the conclusion — the pain.]
- **Context / why this matters now (one short section):** [Why this matters, what's changed, or what most people get wrong. The "why now" of evergreen content is "what shift in the reader's world makes this relevant today".]
- **Core content — H2 #1: [argument-led subhead, one-line summary of the argument]**
- **Core content — H2 #2: [argument-led subhead, one-line summary of the argument]**
- **Core content — H2 #3: [argument-led subhead, one-line summary of the argument]** [3-5 H2s. Fewer for thought-leadership; more for SEO. More than 5 dilutes; fewer than 3 reads thin.]
- **Proof (where the evidence lands):** [Either a dedicated section or threaded into the core H2s. Specify which approach for this post.]
- **Close (one short paragraph):** [The specific takeaway or next step. Not "in conclusion". The takeaway should be the same shape as the key argument — one sentence the reader could repeat.]

**Target word count range:** [800-1500 for SEO informational; 1000-2000 for thought-leadership; 600-1000 for nurture. Match to post intent.]]

---

## Voice notes

[Three to five specific sentences that describe how this piece should sound. Not "professional" or "conversational" — specific.

Example: "Write like a smart colleague explaining this over Slack. No jargon for jargon's sake. Short paragraphs (2-4 sentences). Use 'you' throughout. Assume the reader has tried the obvious stuff and it didn't work. Active voice over passive in every sentence that allows it. Specific numbers and named tools beat abstractions every time."

**Words to avoid (jargon flags):** ["leverage", "synergy", "robust solution", "best-in-class", "AI-powered", "next-generation", "world-class", "seamless", "empower", "unlock value" — list the specific words the writer must NOT use, plus any others specific to this brand or category.]

**Sample piece that nails the voice:** [Link to one published piece — internal or external — that captures the target voice. If no sample exists, link the brand style guide or omit. Do not write "professional, on-brand" and stop there.]

**Read-aloud test:** [The writer reads the final draft aloud before handing it back. If any sentence sounds like a press release or a conference panel, it gets rewritten.]]

---

## CTA (one specific next step, journey-stage-matched)

[ONE CTA. One location (end of post, optionally repeated once mid-post for long-form). One per brief, one is the rule, not the maximum. The CTA *type* shifts with the post intent and journey stage:

- **Awareness (top-of-funnel):** "Read the next post in this series", "Subscribe to the newsletter", "Watch the [topic] explainer"
- **Consideration (mid-funnel):** "See how [Customer] solves this", "Read the [topic] guide", "Compare [approach A] vs [approach B]"
- **Decision (bottom-of-funnel):** "Start your free trial", "See it in a 12-minute demo", "Try it for your own data", "Book a working session"
- **Customer marketing (post-purchase):** "Activate the [feature] in your account", "Join the [advanced topic] webinar", "Refer a colleague"

Forbidden: "Learn more about our platform", "Get in touch", "Discover [Product]". These are not CTAs.

The CTA should be a clickable anchor or button in the published post — specify the destination URL.]

---

## Internal-link map (2-4 anchors)

[Specify which internal links the writer must include. Closes the SEO loop and prevents the writer from inventing links or skipping internal linking entirely.

- **Required link 1 (anchor text + destination URL):** [e.g., "anchor: 'best-fit accounts for [category]'; URL: /blog/best-fit-accounts-positioning"]
- **Required link 2:** [...]
- **Optional link (nice-to-have if relevant):** [...]

**Outbound link policy:** [Allowed (cite credible third-party sources to build trust) / required (cite at least one named third-party study) / not allowed (this post is internal-link-only). Pick one.]]

---

## Success metrics

[Without this section the brief is a creative ask, not a content ask.

- **Primary metric:** [The metric this post is optimized for. Pick ONE: organic traffic / time on page / scroll depth / lead conversion / sales-cycle-length impact / customer expansion. Match to post intent.]
- **30-day target:** [Specific number. e.g., "5,000 organic sessions", "2-minute average time on page", "30 marketing-qualified leads".]
- **90-day target:** [Specific number. The post's evergreen value compounds; the 90-day target is usually 2-3x the 30-day for SEO posts.]
- **Secondary metric (optional):** [A second metric to watch but not optimize for. e.g., "social shares", "newsletter sign-ups attributable to this post".]
- **Review cadence:** [When the post will be revisited and updated. Evergreen content decays; specify a refresh date (typically 6-12 months from publish).]]

---

## Brief checklist (before handing to the writer)

- **Post intent locked.** SEO / thought-leadership / nurture / customer-marketing — picked one, not all four.
- **Search intent + journey stage named.** Both decisions explicit.
- **Working title + 3 alternates + 4 U's check.** Each title scored; at least one passes 3+ on at least three dimensions.
- **Persona is one named individual.** Not "B2B marketers". Specific title, company size, quarter pressure.
- **Reader pain / search query / job-to-be-done all specified.** Verbatim search query if known.
- **Key argument is one sentence.** The writer can point to it after drafting.
- **Evidence list separates mandatory from optional.** Sources to mine specified.
- **Outline is H2-by-H2, not draft prose.** Each H2 has a one-line argument summary.
- **Voice notes are 3-5 specific sentences plus a sample link.** Not "professional / conversational".
- **Jargon flags listed.** The writer knows which words not to use.
- **One CTA, journey-stage-matched.** Destination URL specified.
- **Internal-link map has 2-4 anchors.** Anchor text + URL for each.
- **Success metrics named with 30-day and 90-day targets.** Refresh date set.
`,
}

/**
 * Launch Blog Post template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   VandeHei / Allen / Schwartz — Smart Brevity (primary structural source:
 *   Core 4 = TEASE → LEDE → WHY IT MATTERS → GO DEEPER, Audience-First).
 *   Bly — The Copywriter's Handbook (headline craft: 4 U's, 8 headline types,
 *   You-Orientation, CTA discipline). Zinsser — On Writing Well (UCBH and
 *   the Clutter Enemy as line-level checks). Corpus amplification: rolling
 *   thunder (Pocket Guide to Product Launches), 600-900 word B2B norm,
 *   SEO patterns (Bush / Poyar), feature-with-"so that" pairing.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/10-launch-blog-post.md
 *
 * Why the Smart Brevity Core 4 owns the structure (vs Bly long-copy or a
 * generic "intro / body / CTA" shape): launch posts fail in the first two
 * sentences. The Core 4 — TEASE / LEDE / WHY IT MATTERS / GO DEEPER —
 * structurally suppresses the "Today we're excited to announce" opener and
 * forces audience-first framing at every section. Bly's craft (4 U's headline
 * test, You-Orientation, single specific CTA) is layered into the Headline
 * and CTA sections where Smart Brevity's structural guidance is light. The
 * boundary calls — distinct from press release (11), blog brief (34), launch
 * plan (09) — are encoded in the system prompt rather than the skeleton.
 */

import type { ArtifactTemplate } from './types'

const LAUNCH_BLOG_POST_SYSTEM_PROMPT = `You are drafting a launch announcement \
blog post — the external company-blog post that customers, prospects, and press \
read when a product or major feature ships. This is NOT a press release \
(formal third-party-press format), NOT an internal launch FAQ, and NOT a \
recurring content-marketing post. It is the anchor piece for one launch moment.

Avoid these failure modes:
- "Today we're excited to announce…" or any company-first opener — this is \
the single most common way launch posts fail in the first sentence. Open on \
the reader's pain, the moment of friction, the thing they have lived through. \
Build the stakes before you name the product
- Feature-list lede — naming three to five new capabilities before establishing \
why the reader should care. Features earn their place AFTER the news lands and \
WHY NOW is established
- Missing "why now" — a launch post without a "why now" reads like a changelog. \
Connect the release to a specific market shift, regulatory change, buyer-behavior \
change, or moment in the customer's world. Generic "in today's fast-paced world" \
filler does not satisfy this
- Features without "so that" pairing — every capability must be paired with the \
specific outcome it produces for the reader. "Real-time anomaly detection, so \
that your team catches revenue leakage before quarter-close" — never the \
capability standalone
- Jargon as trust signal — "AI-native, multi-tenant, event-driven architecture" \
reads as opacity, not competence. Name the outcome first; explain the mechanism \
only when it earns its place. If a smart non-expert reader would not understand \
a sentence on first read, rewrite it
- "We" voice / inside-out framing — every paragraph is drafted from the reader's \
perspective ("you", "your team"), not the company's ("we", "our platform"). The \
You-Orientation rule: if a sentence has more "we" than "you", rewrite it
- No clear CTA, or multiple competing CTAs — one specific next step at the end. \
"Learn more about our platform" is not a CTA. "Start your free trial", "See it \
in a 12-minute demo", "Read the [Customer] case study" are CTAs. One per post; \
one is the rule, not the maximum. May be repeated mid-post for long-form, but \
the same single CTA
- No customer voice — a launch post without at least one customer quote, data \
point, or beta-customer line reads as marketing. With proof, it reads as \
evidence. Pull customer language from the corpus when available

Length target: 600-900 words. Long enough to land the value story, short \
enough that a busy VP reads the whole thing on a Tuesday morning. Two underused \
craft moves: every paragraph should pass the read-aloud test (if it sounds like \
a press release, rewrite); active voice over passive throughout.

If a launch plan / GTM brief artifact exists for this release, inherit its \
launch tier (tier-1 release, feature update, integration), primary audience \
(one buyer persona — same A+ Customer discipline as the messaging framework), \
and the single primary CTA. The blog post is one tactic inside that program, \
not a standalone deliverable.

Boundary discipline: this post does NOT include a dateline, formal boilerplate, \
or third-party-press-format quote block (that is the press release artifact). \
It does NOT include a battlecard-style competitor comparison (separate artifact). \
It does NOT replicate the launch program / RACI / channel plan (that is the \
launch plan artifact).

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const launchBlogPostTemplate: ArtifactTemplate = {
  artifactType: 'launch_blog_post',
  title: 'Launch Blog Post',
  systemPromptFragment: LAUNCH_BLOG_POST_SYSTEM_PROMPT,
  // Skeleton order = Smart Brevity Core 4 (TEASE → LEDE → WHY NOW → GO DEEPER)
  // expanded for launch context: pre-work decisions first, headline-with-4-U's
  // check, then the Core 4 with WHAT'S NEW + VALUE split out from GO DEEPER
  // (because feature-with-"so that" pairing and the aspirational layer each
  // need their own block), then a single specific CTA, then a rolling-thunder
  // footer that reframes the post as the anchor of a launch program rather
  // than a one-off deliverable.
  skeleton: `# Launch Blog Post: [Product or Feature Name]

## Pre-work (decisions made before drafting)

- **Launch tier:** [Tier-1 product launch / major feature update / integration / minor release. If a launch plan artifact exists for this release, inherit the tier from there. Tier sets the hook altitude — a tier-1 launch earns aspirational framing; a minor release does not.]
- **Primary audience:** [The ONE buyer persona this post is written for. Same A+ Customer discipline as the messaging framework: title alone is not enough. Their week, the pain they feel in their gut, the language they use. Posts written for "everyone" land with no one.]
- **The one CTA:** [Decide BEFORE drafting so the post builds toward it. Examples: "Start free trial", "Book a 12-minute demo", "Read the [Customer] case study", "Watch the launch keynote". One. Not three.]
- **Inputs from upstream artifacts:** [Positioning statement (Differentiated Value themes), strategic narrative (old game / new game / promised land), launch plan (timing, channel mix, single CTA). If these exist, the post inherits from them — do not re-derive.]

---

## Headline

[The single line that does 80% of the work. Five times more people read the headline than the body — if the headline doesn't earn the click, the rest of the post is wasted.

Pick ONE of three headline patterns that work for B2B launch posts:
- **News headline** — states the news in reader-relevant terms ("[Product] now reconciles two-system payroll in 90 seconds")
- **Reason-Why** — answers "why does this matter to me" ("Why finance teams are killing their month-end spreadsheet stack")
- **How-To** — promises a specific outcome the reader wants ("How to close the books in two days, not two weeks")

Avoid: "Introducing X", "Announcing X", "[Company] is excited to share X", question headlines that don't promise a payoff, indirect / clever headlines that require the body to decode.

The 4 U's check — rate 1-4 on each dimension; aim for 3+ on at least three:
- **Urgent:** Is there a time-bound reason to read this now?
- **Unique:** Does this say something the reader hasn't heard from competitors?
- **Useful:** Is the benefit / outcome immediately clear?
- **Ultra-specific:** Are the details concrete (numbers, named outcomes), not abstract?]

### SEO sub-block

- **Target query:** [The specific phrase the buyer types when searching for a solution to the problem this product solves. The H1 and the first 150 words must contain this phrase naturally — not stuffed.]
- **Meta description (155 chars):** [One human-written sentence that earns the click from the SERP. Reads like a person wrote it, not a template.]
- **Internal link to product page:** [Specify the URL slug so the post links back. Closes the loop for SEO and conversion.]
- **Use-case-query H2 subheads:** [In the WHAT'S NEW section below, the H2s should match the specific use-case queries buyers search ("How to automate payroll reconciliation"), not feature names ("Feature 1: Reconciliation Engine").]

---

## TEASE (the hook — opening 1-2 sentences)
[The pain, the moment of friction, the thing the reader has lived through. Not the product, not the announcement. Build the stakes before you deliver the news.

Examples of the right shape:
- "You've spent three hours reconciling two spreadsheets that should have talked to each other automatically."
- "The last week of every quarter your finance team works until 11pm — and it's not because the numbers are hard."

Forbidden openers: "Today we're excited to announce…", "We're thrilled to share…", "[Company] is proud to launch…"]

## LEDE (the news — one sentence)
[One sentence that delivers the news in reader-relevant terms. Not the product name leading; the change for the reader leading. The buyer's boss should be able to repeat this sentence in a 9am meeting.

If a customer quote or one-line data point exists from a beta / design partner that captures the news in their own language, lead with that and follow with one line of context. Customer voice in the LEDE outperforms marketing voice every time.]

## WHY NOW (why it matters — one short paragraph)
[The most-skipped section in launch posts. Without it, this reads like a changelog. Connect the release to a specific shift in the buyer's world: market change, regulatory shift, behavior change, the failure of an old approach, a new constraint that makes the old way untenable.

"In today's fast-paced world" is not a "why now". Name the specific shift: "Last quarter, three of the four largest payroll providers changed their export schemas — and finance teams that built reconciliation around the old format are silently losing data."

Pull from the strategic narrative artifact if it exists — the "old game / new game" frame goes here.]

---

## WHAT'S NEW (the capabilities — every feature paired with "so that")

[This is where the new capabilities live. Three rules, all enforced:

1. Each capability gets a paired outcome with "so that" or equivalent. "Real-time anomaly detection, so that your team catches revenue leakage before quarter-close." Never the capability alone.
2. Use H2 subheads that match how buyers search, not how the product team names features. "How to automate two-system payroll reconciliation" beats "Feature 1: Reconciliation Engine".
3. Lead each subsection with the outcome the capability produces; the mechanism (the "how it works") is optional and earns its place only if the reader needs it to trust the outcome.

Render 2-4 capability blocks. More than 4 dilutes the post into a feature-list dump.]

### [Use-case-query subhead — outcome-led]
[The capability + the "so that" outcome. Optional one-line mechanism. Optional one-line proof point if available.]

### [Use-case-query subhead — outcome-led]
[Same shape as above.]

### [Use-case-query subhead — outcome-led]
[Same shape as above. Skip if not needed — fewer is better than padded.]

---

## VALUE (the aspirational layer — one short paragraph)
[Zoom out. What does the reader's world look like six months from now if this works? This is where the vision earns its place — at this position in the post, not at the top.

The pattern: name the transformation, not the platform. "Finance teams that adopt this in Q1 will close their books in two days, not two weeks. The first hour of every quarter goes back to forecasting, not chasing reconciliations."

Cross-reference: this is the aspirational top of the messaging framework's value prop, but rendered for THIS release moment, not as a permanent statement.]

---

## PROOF (customer voice — threaded into LEDE or VALUE, or surfaced here if standalone)
[At minimum, one quote, data point, or beta-customer line. A launch post without customer voice reads as marketing; with it, the trust level of the entire post changes.

Pull from corpus when available: customer interviews, sales call transcripts, support cases. Buyers' words outperform marketers' words.

If proof has already been threaded into the LEDE or VALUE sections, mark this section as "(integrated above)" rather than repeating.]

---

## CTA (the one specific next step)
[One action. Specific. Singular. Placed at the end and optionally repeated once mid-post for long-form. The CTA decided in pre-work — it does not change during drafting.

Forbidden: "Learn more about our platform", "Get in touch", "Discover X". These are not CTAs.

Strong CTAs match where the buyer is in their journey:
- Bottom-of-funnel buyer: "Start your 14-day free trial"
- Mid-funnel: "See it in a 12-minute demo"
- Top-of-funnel: "Read the [Customer] case study", "Watch the launch keynote"

The CTA should be a clickable anchor or button in the published post.]

---

## Rolling-thunder footer (planning prompt — not body copy)
[This post is the anchor of the launch program, not the finish line. Before publishing, name 3-5 downstream pieces that will link back to this post and extend one specific angle deeper:

- Channel cuts (LinkedIn post, X thread, launch-day email) — separate artifacts
- Use-case deep-dives (one blog post per WHAT'S NEW capability) — separate artifact
- Customer story (full case study from the proof source) — separate artifact
- Webinar / launch-day demo recording — separate artifact
- Sales enablement (one-pager, battlecard update) — separate artifact

The post that does the most work is the one that keeps earning traffic six months after launch day.]

---

## Validation checklist (line-level craft check before publishing)

- **Headline:** Passes 4 U's (3+ on at least three dimensions). Not "Introducing X".
- **Hook:** Opens on reader pain / moment of friction. Not "Today we're excited to announce".
- **Why now:** Names a specific shift, not "in today's fast-paced world".
- **Features paired with "so that":** Every capability has a paired outcome. None standalone.
- **You-Orientation:** Every paragraph has more "you" than "we". Inside-out language rewritten.
- **Customer voice:** At least one quote, data point, or beta-customer line is present.
- **CTA:** Exactly one specific next step. Not "Learn more".
- **Length:** 600-900 words. Cut clutter ruthlessly — every word does work.
- **Read-aloud test:** Does any sentence sound like a press release? Rewrite.
- **Active voice:** Active over passive in every sentence that allows it.
- **SEO:** Target query in H1 and first 150 words, naturally. Meta description reads human-written.
`,
}

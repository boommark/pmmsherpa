/**
 * Launch Press Release template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   VandeHei / Allen / Schwartz — Smart Brevity (TEASE → LEDE → WHY IT MATTERS
 *   → GO DEEPER, audience-first, "short, not shallow"). AP Stylebook conventions
 *   (dateline, inverted pyramid, numerals, titles, ### end mark) treated as
 *   table-stakes mechanics. Corpus amplification: B2B SaaS failure modes,
 *   trade-reporter-independence test, AP style mechanics list, news-shape
 *   headline pattern.
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/11-launch-press-release.md
 *
 * Why this template is a strict skeleton, not a flexible scaffold: the press
 * release is a 100-year-old journalism format with fixed component slots.
 * Reordering breaks the format; reporters and wire services scan for the
 * structural markers (dateline, inverted-pyramid lede, end mark). The template
 * renders all 12 components in fixed order and suppresses the conventional
 * marketing-copy instincts (build-to-reveal headlines, restated-lede quotes,
 * vague boilerplate) via heavy negative guidance in the system prompt.
 *
 * 2026 posture: pre-work asks whether a press release is the right artifact.
 * Default recommendation is to skip unless this is a Tier-1 launch, a Tier-2
 * launch with explicit media motion, or a category that conventionally requires
 * a release (funding, M&A, executive hire, certification, regulated disclosure).
 * For standard product launches without media targets, the launch blog
 * (artifact 10) is the primary channel.
 */

import type { ArtifactTemplate } from './types'

const PRESS_RELEASE_SYSTEM_PROMPT = `You are drafting a launch press release — a \
journalism-format document for media and wire distribution. This is NOT a launch \
blog post, NOT a marketing announcement, NOT a sales asset. It is a structured \
news document written in the third-person voice of a wire-service reporter, \
intended either to be reproduced verbatim or used as the source for a journalist's \
own story.

First, validate this is the right artifact. If the launch is not Tier 1, not Tier 2 \
with explicit media motion, and not a category that conventionally requires a \
release (funding, M&A, executive hire, certification, regulated disclosure), \
recommend the user produce a launch blog post (artifact: launch_blog_post) instead. \
In 2026, most B2B SaaS launches do not run a wire-service motion; press release \
distribution is expensive and has narrow remaining utility.

Avoid these failure modes:
- Marketing-copy headlines — "[Company] Revolutionizes / Transforms / Pioneers the \
Future of [Category]" is not news, it is a banner ad. News-shape pattern: \
[Subject] [specific verb] [specific scope or number] [where or why-now]. Example \
of bad: "Acme Revolutionizes the Future of Customer Engagement with Groundbreaking \
AI Platform." Example of good: "Acme Raises $40M Series B to Expand AI-Powered \
Support Automation into Europe."
- No real news — apply the trade-reporter-independence test: would a reporter at a \
relevant vertical publication find this independently interesting? If no, this is \
not press-release material; recommend a launch blog instead
- Vague boilerplate — "leading provider of innovative solutions that help companies \
achieve their goals" tells a reporter nothing. Boilerplate must answer: what does \
the product do, who uses it, and one credibility anchor (named customers, ARR \
range, notable backers, certifications, scale numbers)
- Restated-lede executive quote — "We're thrilled to announce this exciting new \
capability" is filler, not a quote. The exec quote exists to add strategic \
significance the straight news paragraph cannot carry. If the quote could be \
deleted without losing information, rewrite it
- Generic customer satisfaction quote — "[Product] has transformed the way we work" \
is not validation. The customer quote needs a specific outcome: a number, a named \
situation, or a concrete before/after
- Length over 600 words — supporting detail belongs in the fact sheet or media kit, \
not the release. Target: 400-500 words. Hard ceiling: 600
- Building to a reveal — inverted pyramid, not narrative arc. The full news must be \
in the lede paragraph (who, what, why, when in 2-3 sentences). Everything that \
follows is descending importance. Editors cut from the bottom
- Inside-out framing — "we are excited to announce that we have built X" is the \
launch team's voice, not a reporter's voice. Press release voice is third-person, \
news-register, audience-first

Required behaviors:
- Render all 12 components in fixed order: release marker, headline, subhead, \
dateline, lede, why-it-matters, how-it-works, executive quote, customer/partner \
quote, boilerplate, end mark, contact
- Use AP style mechanics: spell out one through nine, numerals for 10 and above; \
titles before names capitalized ("Chief Marketing Officer Jane Smith"), titles \
after names lowercase ("Jane Smith, chief marketing officer"); dates as "June 10" \
not "June 10th"; "10%" not "10 percent"
- If a positioning statement exists for this product, the boilerplate inherits its \
market category and best-fit account characterization plus one credibility anchor. \
If you cannot write 2-3 tight boilerplate sentences, the underlying positioning \
work is incomplete — flag it
- Specificity is credibility. "30% faster ticket resolution" beats "significant \
productivity gains" every time. Apply this filter to every quoted number and every \
boilerplate claim

Reference frameworks implicitly. Do not name-drop authors or stylebooks in the \
output of the release itself.`

export const launchPressReleaseTemplate: ArtifactTemplate = {
  artifactType: 'launch_press_release',
  title: 'Launch Press Release',
  systemPromptFragment: PRESS_RELEASE_SYSTEM_PROMPT,
  // Skeleton renders all 12 AP-format components in fixed order. Reordering
  // breaks the format. Pre-work front-loaded as Step 0 because the #1 modern
  // PR failure is drafting one when the launch is not press-release material.
  skeleton: `# Launch Press Release: [Product / News Item]

## Pre-work (decisions made before drafting)

- **News test:** [Apply the trade-reporter-independence test: would a reporter at a relevant vertical publication find this independently interesting? Name the publication and the angle. If you cannot name a real reporter or beat that would care, this is not press-release material — generate a launch blog post (artifact: launch_blog_post) instead.]
- **Launch tier:** [T1 (industry-defining), T2 (significant, with explicit media motion), T3 (standard launch), T4 (minor / SKU-level). Press release is appropriate for T1 and T2-with-media. For T3 and T4, recommend skipping in favor of the launch blog. Reference the launch plan / GTM brief (artifact 09) tiering if it exists.]
- **News type:** [Funding round / product launch / executive hire / customer milestone / partnership / acquisition / certification / other. Each shapes the lede emphasis differently — name it explicitly.]
- **Embargo or immediate release:** [If embargoed, name the lift date and time zone. Otherwise: immediate.]

---

FOR IMMEDIATE RELEASE

## Headline
[One line. News-shaped, not marketing-copy. Pattern: [Subject] [specific verb] [specific scope or number] [where or why-now]. Approx. 10-12 words. Bad: "Acme Revolutionizes the Future of Customer Engagement." Good: "Acme Raises $40M Series B to Expand AI-Powered Support Automation into Europe."]

## Subhead
[One line. The single detail the headline could not carry — usually the why-now, the specific buyer outcome, or the named partner/investor.]

## Dateline + lede paragraph
[CITY, STATE — Month DD, YYYY — [Lede paragraph: 2-3 sentences. Who did what, why it matters, when. Every essential fact in this paragraph. If a reader stops after the lede, they have the whole story. Inverted pyramid: most important fact first. Use the news type from pre-work to shape the emphasis (funding announcements lead with raised amount + lead investor + use of funds; product launches lead with what the product does + who it's for + the specific shift it represents; executive hires lead with name + role + what they previously ran).]

## Supporting paragraph 1 — why it matters
[The market context, the buyer shift, the stake. Why now? What was the gap before this? Approx. 2-3 sentences. This is the "why it matters" layer — the strategic frame a reporter needs to write the wider story. Avoid product feature description here; that comes in the next paragraph.]

## Supporting paragraph 2 — how it works / what's launching
[The mechanics, the scope, the numbers. What does the product/news actually entail at a concrete level? Capabilities, scale, geographic reach, customer count, or pricing tier as relevant. Approx. 2-4 sentences. Specificity is credibility — name real numbers when you have them, named customers when you have permission, named integrations when relevant.]

## Executive quote
"[Quote: 1-3 sentences. Strategic significance — the *why this matters* perspective the news paragraph cannot carry. NOT a restatement of the lede. NOT 'we're thrilled to announce.' The quote should add a perspective: the trend the company is responding to, the bet they are making, the customer pattern that drove the decision. If the quote could be deleted without losing information, rewrite it.]"

— [Executive Name], [Title] at [Company]

## Customer or partner quote
"[Quote: 1-3 sentences. Third-party validation with a specific outcome. NOT 'this product transformed the way we work.' Anchor in: a named situation (what they were trying to do), a specific result (a number, a time saved, a deal won), or a concrete before/after. Real specificity signals real customers; vague satisfaction signals a fabricated quote.]"

— [Customer or Partner Name], [Title] at [Customer Company]

---

## About [Company]
[Boilerplate: 2-3 sentences. What does the product do, for whom, and one credibility anchor (named customers, ARR range, notable backers, customer count, certifications, geographic footprint). If you cannot write this in 2-3 tight sentences, the underlying positioning work is incomplete — revisit the positioning statement (artifact: positioning_statement) before publishing. Inherit the market category and best-fit account characterization from positioning if available.]

###

## Media contact
[Name]
[Title — typically Communications Lead, Head of PR, or external agency contact]
[email@company.com]
[phone, optional]

---

## Validation (AP mechanics + brevity + news test)

- **News test (final pass):** [Re-read the lede aloud. If a trade reporter on a 200-pitches-a-day inbox would not stop, the headline or lede needs sharpening. If there is no real news under it, do not publish — produce a launch blog post instead.]
- **Word count:** [Target 400-500 words from headline through end of boilerplate (excluding pre-work and validation blocks). Hard ceiling 600. If over, what supporting detail belongs in the fact sheet or media kit instead?]
- **Inverted pyramid:** [Could an editor cut the last paragraph without losing the news? Last two? If no, the structure is wrong — the most important facts are not at the top.]
- **Headline filter:** [Does the headline match the news-shape pattern (subject + specific verb + specific scope/number + where/why-now)? Strip any "revolutionizes / transforms / pioneers / unveils" verbs.]
- **Quote filter:** [Does the executive quote add strategic significance the news paragraph cannot carry? Does the customer quote contain a specific outcome (number, named situation, before/after)? If either is generic, rewrite or pull the quote entirely.]
- **Boilerplate filter:** [Does the boilerplate name what the product does, for whom, and one credibility anchor? If "leading provider of innovative solutions" appears anywhere, rewrite.]
- **AP style mechanics:** [Spell out one through nine, numerals 10+. Titles before names capitalized; titles after names lowercase. Dates as "June 10" not "June 10th." "10%" not "10 percent." First reference of a person uses full name + title; subsequent references use last name only.]
- **Voice check:** [Read aloud as if a reporter were reading it. Strip any first-person plural ("we", "our") outside of quoted material. Strip any marketing intensifiers ("groundbreaking", "best-in-class", "industry-leading").]
`,
}

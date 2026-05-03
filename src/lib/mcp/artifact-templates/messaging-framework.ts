/**
 * Messaging Framework template for the generate_artifact MCP tool.
 *
 * Canonical sources (read first per .planning/mcp-phase-2/methodology.md):
 *   Stratton — Punchy (primary structural source: VBF Rule, A+ Customer,
 *   "So what?" Game, BBQ Talk, Altitude, Messaging Stack, Competitive
 *   Messaging Audit). Validation: Lauchengco — LOVED (CAST framework:
 *   Clear, Authentic, Simple, Tested). Corpus amplification: PMA
 *   practitioner blogs (Stevie Langford pitfalls; competitor-verbatim test).
 *
 * Audit trail: .planning/mcp-phase-2/corpus-research/02-messaging-framework.md
 *
 * Why this template is built around the Messaging Stack (Value → 3 Benefits →
 * Features), not a generic value-pillar table: Punchy's central argument is
 * that B2B messaging fails because teams default to feature-first (inside-out)
 * order. The VBF Rule is the only structural fix. Locking benefits at exactly
 * three and nesting V/B/F per benefit forces outside-in drafting at every
 * altitude — homepage, deck, email — from one source document. CAST is layered
 * on top as a craft check rather than the primary structure because LOVED's
 * contribution is post-draft validation, not the build order.
 */

import type { ArtifactTemplate } from './types'

const MESSAGING_SYSTEM_PROMPT = `You are drafting a messaging framework — the \
internal source-of-truth document that downstream copy (homepage, deck, email, \
ad, sales pitch) is derived from. This is NOT marketing copy itself. It is the \
structured hierarchy that produces consistent copy across channels.

Avoid these failure modes:
- Inside-out language ("we built X", "our platform delivers Y") — start from the \
buyer's world and the transformation they experience, not from the product
- Feature-first leads — naming a capability before the value it produces. Order is \
always Value → Benefit → Feature. If a benefit reads as a feature with adjectives, \
rewrite it
- Jargon as trust signal — "AI-native, frictionless, purpose-driven platform" \
signals the opposite of credibility. If a smart non-expert friend at a barbecue \
wouldn't understand the line, rewrite it in plain language
- Generic benefits — "increase efficiency", "streamline operations", "drive growth" \
— anything a direct competitor could lift verbatim is category description, not \
differentiated messaging. Apply the competitor-verbatim test to every benefit and \
value statement
- Wrong altitude — too high ("we help companies grow") says nothing; too low \
("we automate CSV imports") loses the aspiration. Goldilocks: specific enough to \
feel real, broad enough to apply to the buyer segment
- More or fewer than 3 benefits — render exactly three benefit blocks. Two feels \
incomplete; four or more becomes inventory and dilutes the stack
- "So what?" chain run aground — when translating features into value, stop one \
step before "makes money" or "saves money". Those endpoints are universal and \
non-differentiating. The right stopping point is the specific business outcome only \
this product enables
- Drafting without an A+ customer — if the specific archetypal buyer hasn't been \
named in pre-work (their week, their gut-felt pain, their language), the stack \
will be ungrounded

Required behaviors:
- Use exactly three benefits. Each benefit must render Value (the transformation), \
Benefit (the buyer-facing explanation), and Feature (the specific capability that \
delivers it) in that order
- Pull buyer language from the RAG corpus when available — customer quotes, AMA \
transcripts, podcast snippets. Buyers' words outperform marketers' words
- If a positioning statement exists for this product, inherit its Differentiated \
Value themes as the input to the three Benefits. Messaging without positioning \
produces incoherent stacks
- Write the value proposition as one sentence the buyer's boss could repeat in a \
budget meeting

Reference frameworks implicitly. Do not name-drop authors in the output.`

export const messagingFrameworkTemplate: ArtifactTemplate = {
  artifactType: 'messaging_framework',
  title: 'Messaging Framework',
  systemPromptFragment: MESSAGING_SYSTEM_PROMPT,
  // Skeleton order = Messaging Stack top-down: A+ customer pre-work →
  // value proposition → 3 benefits as V/B/F triplets → proof → differentiation
  // → CAST validation. Each benefit nests Value-Benefit-Feature so the model
  // cannot draft a feature-led benefit without violating the structure.
  skeleton: `# Messaging Framework: [Product Name]

## Pre-work (decisions made before drafting)

- **A+ customer:** [The ONE specific archetypal buyer this messaging is written for. Title alone is not enough. Describe their week, the pain they feel in their gut, the language they use when complaining about it, and what success looks like to them personally. Messaging written for "everyone" resonates with no one.]
- **Positioning input:** [Does a positioning statement exist for this product? If yes, the Differentiated Value themes from that doc become the seed for the three Benefits below. If not, name the 1-3 differentiated value themes here before drafting.]
- **Altitude calibration:** [Where on the abstraction ladder does this messaging sit? Too high = vague platitudes. Too low = tactical capability list. Aim for the middle: specific enough to feel real, broad enough to apply to the full A+ segment.]

## Value proposition
[One sentence. The transformative outcome the A+ customer gets from this product. The buyer's boss must be able to repeat it in a budget meeting. Lead with the buyer's world, not the product's category. Avoid jargon, avoid generic outcomes ("drive growth", "increase efficiency"). Pass the competitor-verbatim test: a direct competitor should not be able to use this sentence without lying.]

---

## Benefit 1: [Short label — the transformation in 3-5 words]

- **Value (the transformation):** [What is the buyer able to *do, be, or feel* because of this benefit? Outcome-level. Apply the "So what?" test 3 times — but stop one step before generic ("makes money / saves money"). Stop at the specific outcome only this product enables.]
- **Benefit (the buyer-facing explanation):** [How does the product enable that transformation? Plain-language, BBQ-Talk passing — would a smart non-expert friend understand it on first read?]
- **Feature (the specific capability):** [The concrete capability that delivers the benefit. Specific, demonstrable. This is the only place feature language is allowed to lead.]
- **Proof point:** [One quote, metric, or customer-language artifact from the corpus that supports this benefit. Buyers' words beat marketers' words.]

## Benefit 2: [Short label — the transformation in 3-5 words]

- **Value (the transformation):** [Per Benefit 1 instructions. Different dimension of value — not a restated version of Benefit 1.]
- **Benefit (the buyer-facing explanation):** [Per Benefit 1 instructions.]
- **Feature (the specific capability):** [Per Benefit 1 instructions.]
- **Proof point:** [Per Benefit 1 instructions.]

## Benefit 3: [Short label — the transformation in 3-5 words]

- **Value (the transformation):** [Per Benefit 1 instructions. Third dimension — distinct from Benefits 1 and 2.]
- **Benefit (the buyer-facing explanation):** [Per Benefit 1 instructions.]
- **Feature (the specific capability):** [Per Benefit 1 instructions.]
- **Proof point:** [Per Benefit 1 instructions.]

---

## Differentiation statement
[One short paragraph. What can this product credibly say that direct competitors cannot? Anchor in the unclaimed messaging territory surfaced from a competitive audit (the 3-5 category clichés competitors converge on, and what's left unsaid). Not a comparison table — that's a separate artifact. One claim, defensible, specific.]

---

## Validation (CAST + plain-language filters)

- **Clear:** [Can a non-expert understand the value prop and each benefit on first read? Mark each line that fails and rewrite.]
- **Authentic:** [Does this resonate with how the A+ customer actually talks? Cross-check against customer quotes / AMA / call transcripts in the corpus. Marketing-speak that doesn't appear in real buyer language is a red flag.]
- **Simple:** [Is the value prop easy to grasp and repeat? If the buyer can't paraphrase it after one read, simplify.]
- **Tested:** [What evidence validates each benefit beyond internal opinion — customer interviews, win/loss data, sales call themes, demo reactions? List the source per benefit.]
- **BBQ Talk filter:** [Read each line aloud as if explaining to a friend at a barbecue. Anything that would make them look confused gets rewritten in plain language.]
- **Competitor-verbatim filter:** [For each benefit and the value prop, ask: could the 3 closest competitors use this exact statement without changing a word? If yes, it's category description, not differentiation. Rewrite.]
`,
}

/**
 * Smoke test: runs the 4 programmatic Layer 4 scorers against known-good and
 * known-bad fixtures from the existing rubric, so we can verify wiring without
 * needing live Braintrust traffic.
 *
 * Run: npx tsx evals/harness/smoke_test.ts
 */

import { scoreEmDash } from "../scorers/em_dash.js";
import { scoreLengthBucket } from "../scorers/length_bucket.js";
import { scoreMidQuestion } from "../scorers/mid_question.js";
import { scoreAiTells } from "../scorers/ai_tells.js";

type Fixture = { label: string; expected: "good" | "bad" | "mid"; input: string; output: string };

// Pulled verbatim from evals/rubrics/voice_quality.md anchors.
const SCORE_5_ANCHOR = `The cleanest way to think about it, positioning is the frame, messaging is the painting.

Positioning is strategic. It names the context you want buyers to evaluate you in. Dunford's structure has five parts that hang together in a specific order, alternatives first, because buyers don't understand you in isolation; then what you uniquely have; then what that delivers; then who values it most; then the category label that primes all of it. One well-built positioning supports twenty different messages, the same frame, different paintings for platform engineers, VPs, and analysts.

Messaging is tactical. It's the specific language on a specific surface for a specific reader at a specific moment. Headline on the hero. Email subject line. Cold opener on a call. If your messaging drifts between surfaces and nothing feels coherent, the problem is one layer up, you don't have positioning yet. Messaging is just the exhaust.

So the test is simple, can five different messages for five different audiences all trace back to the same positioning? If yes, you're aligned. If no, you're improvising.`;

const SCORE_1_ANCHOR = `Great question! 🎯 Positioning and messaging are both critical components of a successful product marketing strategy. Let me break them down for you:

**Positioning** is the foundation of how your brand is perceived in the market. It's about carving out a unique space and leveraging your competitive advantages.

**Messaging** is the tactical execution of your positioning. It's the actual words, phrases, and narratives you use to communicate your positioning to your target audience.

Both are essential for a robust, cohesive brand strategy. While there are many approaches, the most effective is to align them tightly. Would you like me to dive deeper into any specific aspect? 🚀`;

// Excerpt 3 from the polish references — has one em dash, should fail em_dash scorer.
const POLISH_EXCERPT_3 = `As you can see, it's clear product marketing is having a renaissance alongside the development of the SaaS landscape as well. Over the last seven years, SaaS has exploded, with most businesses speaking the same language or working from the same templates. Now, the only differentiator is the product marketer who is getting it right and enabling their company to stand out in an increasingly competitive crowd.

If we rewind to five years ago, a product marketer's main role was to bring a product to market. Today, customers want their voices heard, and they have more ways than ever before to do just that, thanks to the emergence of many online and off-line platforms. The most engaged customers take their voice one step further and seek to collaborate directly with the businesses they interact with. The most successful product marketers embrace this type of listening and collaborate fully and with enthusiasm—because any PMM worth their salt will tell you this is, hands down, the best route to achieve next-gen outcomes.`;

const fixtures: Fixture[] = [
  {
    label: "SCORE_5_ANCHOR (rubric golden)",
    expected: "good",
    input: "What's the difference between positioning and messaging?",
    output: SCORE_5_ANCHOR,
  },
  {
    label: "SCORE_1_ANCHOR (AI slop)",
    expected: "bad",
    input: "What's the difference between positioning and messaging?",
    output: SCORE_1_ANCHOR,
  },
  {
    label: "Polish excerpt 3 (has 1 em dash)",
    expected: "mid",
    input: "Describe the state of SaaS product marketing.",
    output: POLISH_EXCERPT_3,
  },
];

function run() {
  for (const f of fixtures) {
    console.log(`\n=== ${f.label}  (expected: ${f.expected}) ===`);
    const em = scoreEmDash(f.input, f.output);
    const len = scoreLengthBucket(f.input, f.output);
    const mq = scoreMidQuestion(f.input, f.output);
    const at = scoreAiTells(f.input, f.output);
    console.log(`  em_dash       score=${em.score}  meta=${JSON.stringify(em.metadata)}`);
    console.log(`  length_bucket score=${len.score.toFixed(2)}  meta=${JSON.stringify(len.metadata)}`);
    console.log(`  mid_question  score=${mq.score}  meta=${JSON.stringify(mq.metadata)}`);
    console.log(`  ai_tells      score=${at.score.toFixed(2)}  hits=${(at.metadata.hit_count as number)}`);
    if ((at.metadata.hit_count as number) > 0) {
      const hits = at.metadata.hits as { id: string; category: string }[];
      for (const h of hits) console.log(`    - ${h.category}: ${h.id}`);
    }
  }
}

run();

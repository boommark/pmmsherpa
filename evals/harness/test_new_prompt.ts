/**
 * Smoke test the tweaked system prompt against 3 representative advisory
 * prompts. Runs the 4 programmatic scorers + the Layer 4 voice judge on each.
 *
 * This uses PMMSHERPA_SYSTEM_PROMPT directly (static voice rules), without
 * RAG context. The goal is to see if the voice tweaks moved the needle on
 * sentence-level polish, not to validate grounded-reference behavior.
 *
 * Run: npx tsx evals/harness/test_new_prompt.ts
 */

import OpenAI from "openai";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

import { PMMSHERPA_SYSTEM_PROMPT } from "../../src/lib/llm/system-prompt.js";
import { scoreEmDash } from "../scorers/em_dash.js";
import { scoreLengthBucket } from "../scorers/length_bucket.js";
import { scoreMidQuestion } from "../scorers/mid_question.js";
import { scoreAiTells } from "../scorers/ai_tells.js";
import { scoreLayer4Voice } from "../scorers/layer4_voice.js";

// Sherpa prod uses Claude Sonnet 4.6 by default. We're using GPT-4o here
// only because the Anthropic account is out of credit right now. The voice
// rules apply cross-model, so this is a reasonable smoke test for the prompt
// changes but is not a true prod re-creation.
const MODEL = "gpt-4o";

const TEST_PROMPTS = [
  {
    label: "meta-concept (positioning vs messaging)",
    prompt: "How should I think about the difference between positioning and messaging?",
  },
  {
    label: "applied advisory (AI notetaker launch)",
    prompt:
      "I'm launching an AI meeting notetaker startup and my main competitor is Notion AI. Where should I focus first to carve out a defensible position?",
  },
  {
    label: "industry commentary (how PMM has changed)",
    prompt: "What has fundamentally changed about product marketing in the last five years?",
  },
];

async function runPrompt(client: OpenAI, userPrompt: string): Promise<string> {
  const resp = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1200,
    messages: [
      { role: "system", content: PMMSHERPA_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });
  return resp.choices[0]?.message?.content ?? "";
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not set");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const results: Record<string, unknown>[] = [];

  for (const t of TEST_PROMPTS) {
    console.log(`\n>>> ${t.label}`);
    console.log(`    prompt: "${t.prompt}"`);
    console.log(`    generating...`);

    const output = await runPrompt(client, t.prompt);

    console.log(`    generated ${output.split(/\s+/).length} words\n`);
    console.log(`    --- preview (first 400 chars) ---`);
    console.log("    " + output.slice(0, 400).replace(/\n/g, "\n    "));
    console.log(`    ---\n`);

    const emDash = scoreEmDash(t.prompt, output);
    const length = scoreLengthBucket(t.prompt, output);
    const midQ = scoreMidQuestion(t.prompt, output);
    const aiTells = scoreAiTells(t.prompt, output);
    // Layer 4 judge uses Anthropic; skipped until credits are topped up.
    const layer4 = {
      name: "layer4_voice",
      score: null as number | null,
      metadata: { skipped: "anthropic_credit_low" } as Record<string, unknown>,
    };

    console.log(`    em_dash       score=${emDash.score}   count=${(emDash.metadata as { em_dash_count: number }).em_dash_count}`);
    console.log(`    length_bucket score=${length.score.toFixed(2)}   words=${(length.metadata as { output_words: number }).output_words}  band=${JSON.stringify((length.metadata as { target_band: number[] }).target_band)}`);
    console.log(`    mid_question  score=${midQ.score}   mid_q=${(midQ.metadata as { mid_questions: number }).mid_questions}`);
    console.log(`    ai_tells      score=${aiTells.score.toFixed(2)}   hits=${(aiTells.metadata as { hit_count: number }).hit_count}`);
    if ((aiTells.metadata as { hit_count: number }).hit_count > 0) {
      const hits = (aiTells.metadata as { hits: { id: string; category: string }[] }).hits;
      for (const h of hits) console.log(`      - ${h.category}: ${h.id}`);
    }
    const raw15 = (layer4.metadata as { raw_score_1_5?: number }).raw_score_1_5;
    console.log(`    layer4_voice  raw=${raw15 ?? "n/a"}/5  (0-1 normalized=${typeof layer4.score === "number" ? layer4.score.toFixed(2) : "n/a"})`);
    console.log(`      reasoning: ${(layer4.metadata as { reasoning?: string }).reasoning ?? "(none)"}`);

    results.push({
      label: t.label,
      prompt: t.prompt,
      output,
      scores: {
        em_dash: emDash.score,
        length_bucket: length.score,
        mid_question: midQ.score,
        ai_tells: aiTells.score,
        layer4_voice: layer4.score,
      },
      metadata: {
        em_dash: emDash.metadata,
        length_bucket: length.metadata,
        mid_question: midQ.metadata,
        ai_tells: aiTells.metadata,
        layer4_voice: layer4.metadata,
      },
    });
  }

  const reportDir = join(process.cwd(), "evals", "reports", "layer4");
  mkdirSync(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(reportDir, `new-prompt-test-${stamp}.json`);
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\nFull outputs written to: ${jsonPath}`);

  console.log("\n=== AVERAGES across the 3 prompts ===");
  for (const scorer of ["em_dash", "length_bucket", "mid_question", "ai_tells", "layer4_voice"]) {
    const nums = results
      .map((r) => (r.scores as Record<string, number | null>)[scorer])
      .filter((x): x is number => typeof x === "number");
    const mean = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    console.log(`  ${scorer.padEnd(16)} mean=${mean.toFixed(3)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

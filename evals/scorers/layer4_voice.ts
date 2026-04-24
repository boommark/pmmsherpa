/**
 * Layer 4 voice — LLM-as-judge scorer
 *
 * Scores sentence-level polish and conversational flow (1-5) using:
 *   - the 1 / 3 / 5 anchors from evals/rubrics/voice_quality.md
 *   - the 3 book-excerpt polish references from evals/anchors/layer4/polish_references.md
 *
 * The judge is asked to score VOICE ONLY (not content correctness). Correctness
 * is covered by framework_fidelity and specificity scorers.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import type { ScoreResult } from "./em_dash";

// Resolve relative to cwd — the runner is expected to be invoked from repo root.
const RUBRIC_PATH = join(process.cwd(), "evals", "rubrics", "voice_quality.md");
const POLISH_PATH = join(process.cwd(), "evals", "anchors", "layer4", "polish_references.md");

function loadAnchors(): { rubric: string; polish: string } {
  return {
    rubric: readFileSync(RUBRIC_PATH, "utf-8"),
    polish: readFileSync(POLISH_PATH, "utf-8"),
  };
}

const JUDGE_MODEL = "claude-sonnet-4-6";

function buildJudgePrompt(input: string, output: string, rubric: string, polish: string): string {
  return `You are a senior product-marketing editor scoring the **voice** of an AI assistant response. You are NOT scoring correctness, depth of advice, or framework application — those are separate metrics. You are scoring only whether the response reads like a human senior PMM advisor wrote it, or like an AI generated it.

## The rubric (use this for score anchors 1 / 3 / 5)

${rubric}

## Polish reference passages (target sentence-level rhythm)

These excerpts from published authors show the rhythm, flow, and naturalness a score-5 response should feel like. Responses that match this feel earn a 5. Responses that feel assembled by a language model earn a 1.

${polish}

---

## The response to score

**User prompt:**
${input}

**Assistant response:**
${output}

---

## Your output

Return ONLY a JSON object with this exact shape, nothing else:

{
  "score": <integer 1 to 5>,
  "anchor_example_closest": "1" | "3" | "5",
  "ai_tells_detected": [<short string per tell>],
  "polish_strengths": [<short string per strength, e.g. "varied sentence rhythm", "concrete examples">],
  "reasoning": "<2 sentences max: what pushed the score up or down at the sentence level>"
}`;
}

export async function scoreLayer4Voice(input: string, output: string): Promise<ScoreResult> {
  // Prefer a dedicated eval key so eval traffic is billed/observed separately
  // from prod Sherpa generation. Falls back to the main key if unset.
  const apiKey = process.env.ANTHROPIC_EVAL_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      name: "layer4_voice",
      score: 0,
      metadata: { error: "ANTHROPIC_EVAL_API_KEY / ANTHROPIC_API_KEY not set" },
    };
  }

  const client = new Anthropic({ apiKey });
  const { rubric, polish } = loadAnchors();
  const prompt = buildJudgePrompt(input, output, rubric, polish);

  const resp = await client.messages.create({
    model: JUDGE_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      name: "layer4_voice",
      score: 0,
      metadata: { error: "no_json_in_response", raw: text.slice(0, 500) },
    };
  }

  let parsed: {
    score?: number;
    anchor_example_closest?: string;
    ai_tells_detected?: string[];
    polish_strengths?: string[];
    reasoning?: string;
  };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    return {
      name: "layer4_voice",
      score: 0,
      metadata: { error: "json_parse_failed", raw: jsonMatch[0].slice(0, 500) },
    };
  }

  const raw = typeof parsed.score === "number" ? parsed.score : 0;
  const clamped = Math.max(1, Math.min(5, raw));
  // normalize 1-5 into 0..1 for aggregation alongside other scorers
  const score01 = (clamped - 1) / 4;

  return {
    name: "layer4_voice",
    score: score01,
    metadata: {
      raw_score_1_5: clamped,
      anchor_example_closest: parsed.anchor_example_closest,
      ai_tells_detected: parsed.ai_tells_detected ?? [],
      polish_strengths: parsed.polish_strengths ?? [],
      reasoning: parsed.reasoning,
      judge_model: JUDGE_MODEL,
    },
  };
}

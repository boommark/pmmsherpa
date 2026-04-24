/**
 * Length-bucket scorer (programmatic)
 *
 * Based on the length calibration in src/lib/llm/system-prompt.ts:
 *   prompt ≤30 words  -> response 100-200 words (advisory)
 *   prompt 31-100     -> response 300-500 words
 *   prompt >100 OR    -> up to 700 words
 *     "go deep"
 *   hard cap: 700 words
 *
 * Deliverable-mode prompts (positioning statement, battlecard, etc.) are
 * exempt from the cap but their rationale must stay under 150 words. This
 * scorer ignores deliverable mode for v1 — flag externally if needed.
 */

import type { ScoreResult } from "./em_dash";

const HARD_CAP = 700;

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function targetBand(promptWords: number, promptText: string): [number, number] {
  const goDeep = /\b(go deep|deep dive|detailed|thorough|comprehensive)\b/i.test(promptText);
  if (goDeep || promptWords > 100) return [400, HARD_CAP];
  if (promptWords <= 30) return [50, 250];
  return [200, 550];
}

export function scoreLengthBucket(input: string, output: string): ScoreResult {
  const pw = wordCount(input);
  const ow = wordCount(output);
  const [lo, hi] = targetBand(pw, input);

  let score: number;
  if (ow > HARD_CAP) {
    score = 0;
  } else if (ow >= lo && ow <= hi) {
    score = 1;
  } else if (ow < lo) {
    // too short — gradient
    score = Math.max(0, ow / lo);
  } else {
    // too long — gradient down to 0 at hard cap
    score = Math.max(0, 1 - (ow - hi) / (HARD_CAP - hi));
  }

  return {
    name: "length_bucket",
    score,
    metadata: {
      prompt_words: pw,
      output_words: ow,
      target_band: [lo, hi],
      hard_cap: HARD_CAP,
    },
  };
}

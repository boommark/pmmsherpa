/**
 * Mid-response question scorer (programmatic)
 *
 * Layer 4 bone: ≥1 question inside the response that is NOT the final
 * closing question. Creates the conversational pacing Sherpa is built for.
 *
 * Implementation: count `?` whose sentence is not in the last 15% of the
 * response text. A closing question is fine; we want at least one BEFORE it.
 */

import type { ScoreResult } from "./em_dash";

// Rough sentence split — not perfect but good enough for mid-question detection.
function splitSentences(s: string): string[] {
  return s
    .replace(/\n+/g, " ")
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"'(\[])/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function scoreMidQuestion(_input: string, output: string): ScoreResult {
  const sentences = splitSentences(output);
  if (sentences.length < 3) {
    // Response too short for a mid-question requirement — neutral pass.
    return {
      name: "mid_question",
      score: 1,
      metadata: { total_sentences: sentences.length, mid_questions: 0, note: "too_short_neutral" },
    };
  }

  const tailStartIdx = Math.floor(sentences.length * 0.85);
  const mid = sentences.slice(0, tailStartIdx);
  const midQuestions = mid.filter((s) => /\?\s*$/.test(s)).length;

  return {
    name: "mid_question",
    score: midQuestions >= 1 ? 1 : 0,
    metadata: {
      total_sentences: sentences.length,
      mid_section_sentences: mid.length,
      mid_questions: midQuestions,
    },
  };
}

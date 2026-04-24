/**
 * AI-tells scorer (programmatic regex sweep)
 *
 * Detects the hard-coded AI tells listed in:
 *   - src/lib/llm/system-prompt.ts (lines ~169-180)
 *   - evals/rubrics/voice_quality.md ("AI tells to detect")
 *
 * Any hit => reduces score. Score = 1 if zero tells, gradient down otherwise.
 * Reports which tells were detected so regressions are debuggable.
 */

import type { ScoreResult } from "./em_dash";

type Tell = { id: string; pattern: RegExp; category: string };

const TELLS: Tell[] = [
  // Preambles
  { id: "preamble_great_question", pattern: /\bgreat question\b/i, category: "preamble" },
  { id: "preamble_absolutely", pattern: /^absolutely[!.]/im, category: "preamble" },
  { id: "preamble_happy_to_help", pattern: /\b(happy to help|i'?d be happy to)\b/i, category: "preamble" },
  { id: "preamble_sure_thing", pattern: /^sure( thing)?[!.]/im, category: "preamble" },

  // Sign-offs
  { id: "signoff_let_me_know", pattern: /\blet me know if (you'?d like|you want|there'?s)\b/i, category: "signoff" },
  { id: "signoff_want_me_to", pattern: /\bwant me to (refine|dive deeper|explore|elaborate|expand)\b/i, category: "signoff" },
  { id: "signoff_happy_to_dive", pattern: /\bhappy to (dive|explore|expand|go)\b/i, category: "signoff" },
  { id: "signoff_feel_free", pattern: /\bfeel free to (ask|let me know|reach out)\b/i, category: "signoff" },

  // Hedge-then-assert
  { id: "hedge_while_there_are", pattern: /\bwhile there are (many|several|various|different) (approaches|ways|options|methods)\b/i, category: "hedge" },
  { id: "hedge_there_are_many", pattern: /\bthere are many (ways|approaches|factors)\b/i, category: "hedge" },

  // Buzzwords (consultant-speak)
  { id: "buzz_leverage", pattern: /\bleverag(e|ing|es)\b/i, category: "buzzword" },
  { id: "buzz_utilize", pattern: /\butiliz(e|ing|es)\b/i, category: "buzzword" },
  { id: "buzz_facilitate", pattern: /\bfacilitat(e|ing|es)\b/i, category: "buzzword" },
  { id: "buzz_cutting_edge", pattern: /\bcutting[- ]edge\b/i, category: "buzzword" },
  { id: "buzz_unlock", pattern: /\bunlock(ing|s)?\b/i, category: "buzzword" },
  { id: "buzz_empower", pattern: /\bempower(s|ing|ed)?\b/i, category: "buzzword" },
  { id: "buzz_seamless", pattern: /\bseamless(ly)?\b/i, category: "buzzword" },
  { id: "buzz_robust", pattern: /\brobust\b/i, category: "buzzword" },
  { id: "buzz_revolutionary", pattern: /\brevolutionary\b/i, category: "buzzword" },
  { id: "buzz_unprecedented", pattern: /\bunprecedented\b/i, category: "buzzword" },

  // Zombie nouns
  { id: "zombie_implementation_of", pattern: /\bthe implementation of\b/i, category: "zombie_noun" },
  { id: "zombie_make_recommendation", pattern: /\bmake a recommendation\b/i, category: "zombie_noun" },
  { id: "zombie_provide_explanation", pattern: /\bprovide an explanation\b/i, category: "zombie_noun" },

  // Restating
  { id: "restate_as_you_can_see", pattern: /\bas you can see\b/i, category: "restating" },
  { id: "restate_in_summary", pattern: /\bin summary,?/i, category: "restating" },
  { id: "restate_to_recap", pattern: /\bto recap,?/i, category: "restating" },
  { id: "restate_to_summarize", pattern: /\bto summarize,?/i, category: "restating" },

  // Directive commands (Sherpa should illuminate, not command)
  { id: "directive_heres_what_you_need", pattern: /\bhere'?s what you need to know\b/i, category: "directive" },
  { id: "directive_your_job_is", pattern: /\byour job is to\b/i, category: "directive" },
  { id: "directive_know_that", pattern: /^know that[.,]/im, category: "directive" },

  // Emoji (no emoji allowed)
  { id: "emoji", pattern: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u, category: "emoji" },
];

export function scoreAiTells(_input: string, output: string): ScoreResult {
  const hits: { id: string; category: string; excerpt: string }[] = [];
  for (const tell of TELLS) {
    const m = output.match(tell.pattern);
    if (m) {
      const idx = m.index ?? 0;
      const excerpt = output.slice(Math.max(0, idx - 20), idx + m[0].length + 20);
      hits.push({ id: tell.id, category: tell.category, excerpt });
    }
  }

  // 1 tell -> 0.75, 2 -> 0.5, 3 -> 0.25, 4+ -> 0.
  const score = Math.max(0, 1 - hits.length * 0.25);

  return {
    name: "ai_tells",
    score,
    metadata: {
      hit_count: hits.length,
      hits,
    },
  };
}

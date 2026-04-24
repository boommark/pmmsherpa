/**
 * Braintrust experiment: PMMSherpa Layer 4 voice
 *
 * Wraps the local scorers (evals/scorers/) in Braintrust's Eval() primitive
 * so that every run shows up as an experiment in the Braintrust console
 * under the PMMSherpa project, with history and cross-run comparison.
 *
 * Run:
 *   npx braintrust eval evals/braintrust/layer4.eval.ts
 *
 * Requires: BRAINTRUST_API_KEY (main), ANTHROPIC_API_KEY (for Sherpa
 * generation), ANTHROPIC_EVAL_API_KEY (for the Layer 4 judge, optional).
 */

import { Eval } from "braintrust";
import Anthropic from "@anthropic-ai/sdk";

import { PMMSHERPA_SYSTEM_PROMPT } from "../../src/lib/llm/system-prompt.js";
import { scoreEmDash } from "../scorers/em_dash.js";
import { scoreLengthBucket } from "../scorers/length_bucket.js";
import { scoreMidQuestion } from "../scorers/mid_question.js";
import { scoreAiTells } from "../scorers/ai_tells.js";
import { scoreLayer4Voice } from "../scorers/layer4_voice.js";

// Sherpa's prod model. Note: this eval does NOT include RAG context or
// web research. It measures voice on the system prompt alone. Grounded-
// reference scoring (metric 6 in Sherpa Eval v1 plan) would need RAG
// context to be fed through; that is deliberately out of scope for v1.
const SHERPA_MODEL = "claude-sonnet-4-6";

const DATA = [
  {
    input: "How should I think about the difference between positioning and messaging?",
    tags: ["meta-concept", "advisory"],
  },
  {
    input:
      "I'm launching an AI meeting notetaker startup and my main competitor is Notion AI. Where should I focus first to carve out a defensible position?",
    tags: ["applied-advisory", "positioning"],
  },
  {
    input: "What has fundamentally changed about product marketing in the last five years?",
    tags: ["industry-commentary"],
  },
  {
    input:
      "Write me a battlecard for a dev-tools startup competing against Datadog. Include positioning, three objection-handling talking points, and discovery questions.",
    tags: ["written-artifact", "battlecard"],
  },
  {
    input:
      "How should I think about category design vs just taking share from existing competitors in a mature market?",
    tags: ["meta-concept", "strategic"],
  },
  {
    input: "Our free trial conversion is 4%. Industry benchmark says 15%. Where should I start?",
    tags: ["applied-advisory", "review"],
  },
];

// ---------------------------------------------------------------------------
// Task: run the user prompt through Sherpa's system prompt and return the
// assistant's response. Uses Anthropic SDK directly (no RAG, no web, no
// conversation history). This is the thing being evaluated.
// ---------------------------------------------------------------------------

// Prefer the eval key for generation too, so eval runs are billed and
// observable separately from prod Sherpa traffic.
const sherpaClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_EVAL_API_KEY ?? process.env.ANTHROPIC_API_KEY,
});

async function runSherpa(input: string): Promise<string> {
  const resp = await sherpaClient.messages.create({
    model: SHERPA_MODEL,
    max_tokens: 1200,
    system: PMMSHERPA_SYSTEM_PROMPT,
    messages: [{ role: "user", content: input }],
  });
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Scorers adapted to Braintrust's scorer signature:
//   ({ input, output, expected }) => { name, score, metadata }
// Our underlying scorers already return {name, score, metadata} and take
// (input, output) positional, so adapters are one-liners.
// ---------------------------------------------------------------------------

type BtScoreArgs = { input: string; output: string };

const EmDash = ({ input, output }: BtScoreArgs) => scoreEmDash(input, output);
const LengthBucket = ({ input, output }: BtScoreArgs) => scoreLengthBucket(input, output);
const MidQuestion = ({ input, output }: BtScoreArgs) => scoreMidQuestion(input, output);
const AiTells = ({ input, output }: BtScoreArgs) => scoreAiTells(input, output);
const Layer4Voice = async ({ input, output }: BtScoreArgs) => scoreLayer4Voice(input, output);

// Give each scorer a stable name so Braintrust can track it over time.
Object.defineProperty(EmDash, "name", { value: "em_dash" });
Object.defineProperty(LengthBucket, "name", { value: "length_bucket" });
Object.defineProperty(MidQuestion, "name", { value: "mid_question" });
Object.defineProperty(AiTells, "name", { value: "ai_tells" });
Object.defineProperty(Layer4Voice, "name", { value: "layer4_voice" });

// ---------------------------------------------------------------------------
// The experiment. Every time this runs, Braintrust registers an experiment
// named "layer4-voice-v1" under the PMMSherpa project. Subsequent runs are
// comparable side-by-side.
// ---------------------------------------------------------------------------

Eval("PMMSherpa", {
  experimentName: "layer4-voice-v1",
  data: () =>
    DATA.map((d) => ({
      input: d.input,
      metadata: { tags: d.tags },
    })),
  task: async (input: string) => await runSherpa(input),
  scores: [EmDash, LengthBucket, MidQuestion, AiTells, Layer4Voice],
  metadata: {
    sherpa_model: SHERPA_MODEL,
    judge_model: "claude-sonnet-4-6",
    system_prompt_chars: PMMSHERPA_SYSTEM_PROMPT.length,
  },
});

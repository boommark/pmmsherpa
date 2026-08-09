/**
 * Braintrust experiment: PMMSherpa file-upload pipeline E2E
 *
 * Wraps the upload probe (evals/harness/upload_probe_core.ts) in Braintrust's
 * Eval() primitive so every run shows up as an experiment in the Braintrust
 * console under the PMMSherpa project, with history and cross-run comparison —
 * same pattern as layer4.eval.ts.
 *
 * Unlike layer4 (which calls the Anthropic API directly), this eval drives the
 * LIVE deployment end-to-end: storage upload → /api/upload → /api/chat SSE →
 * asserts the model actually reports the sentinel content from the fixtures,
 * including on a second turn with no attachment payload (the cross-turn path
 * behind the Aug 2026 "your PNG is still parsing" bug).
 *
 * Run:
 *   npm run eval:uploads:braintrust                             # staging
 *   UPLOAD_PROBE_BASE_URL=https://pmmsherpa.com \
 *     npx braintrust eval evals/braintrust/upload_pipeline.eval.ts   # prod
 *
 * Requires: BRAINTRUST_API_KEY, UPLOAD_PROBE_PASSWORD (see upload_probe_core).
 */

import { Eval } from "braintrust";

import {
  DEFAULT_BASE_URL,
  signInProbe,
  runCase,
  type CaseResult,
  type ProbeCase,
  type ProbeSession,
} from "../harness/upload_probe_core.js";

const BASE_URL = DEFAULT_BASE_URL;

// Sign in once and share the session across cases.
let sessionPromise: Promise<ProbeSession> | null = null;
function getSession(): Promise<ProbeSession> {
  if (!sessionPromise) sessionPromise = signInProbe();
  return sessionPromise;
}

// ---------------------------------------------------------------------------
// Scorers: one per pipeline property, so Braintrust tracks each over time.
// Each maps a named check (or check group) from CaseResult onto a 0/1 score.
// A check that didn't run (e.g. the case threw before reaching it) scores 0.
// ---------------------------------------------------------------------------

type BtScoreArgs = { input: ProbeCase; output: CaseResult };

function checkScore(output: CaseResult, ...checkNames: string[]) {
  const matched = output.checks.filter((c) => checkNames.includes(c.check));
  const pass = matched.length > 0 && matched.every((c) => c.pass);
  return {
    score: pass ? 1 : 0,
    metadata: {
      checks: matched.map((c) => ({ check: c.check, pass: c.pass, detail: c.detail })),
      ran: matched.length > 0,
    },
  };
}

const UploadAccepted = ({ output }: BtScoreArgs) => ({
  name: "upload_accepted",
  ...checkScore(output, "upload accepted", "processing status sane"),
});
const StreamCompleted = ({ output }: BtScoreArgs) => ({
  name: "stream_completed",
  ...checkScore(output, "turn1 stream completed", "turn2 stream completed"),
});
const ModelSeesContent = ({ output }: BtScoreArgs) => ({
  name: "model_sees_content",
  ...checkScore(output, "turn1 model sees file content"),
});
const CrossTurnRecall = ({ output }: BtScoreArgs) => ({
  name: "cross_turn_recall",
  ...checkScore(output, "turn2 cross-turn recall works"),
});
const NoStallPhrases = ({ output }: BtScoreArgs) => ({
  name: "no_stall_phrases",
  ...checkScore(output, "turn1 no stall phrases", "turn2 no stall phrases"),
});
const AllChecksPass = ({ output }: BtScoreArgs) => ({
  name: "all_checks_pass",
  score: output.pass ? 1 : 0,
  metadata: {
    failed: output.checks.filter((c) => !c.pass).map((c) => c.check),
    total_checks: output.checks.length,
  },
});

Object.defineProperty(UploadAccepted, "name", { value: "upload_accepted" });
Object.defineProperty(StreamCompleted, "name", { value: "stream_completed" });
Object.defineProperty(ModelSeesContent, "name", { value: "model_sees_content" });
Object.defineProperty(CrossTurnRecall, "name", { value: "cross_turn_recall" });
Object.defineProperty(NoStallPhrases, "name", { value: "no_stall_phrases" });
Object.defineProperty(AllChecksPass, "name", { value: "all_checks_pass" });

// ---------------------------------------------------------------------------
// The experiment. Runs each fixture case through the live deployment.
// ---------------------------------------------------------------------------

Eval("PMMSherpa", {
  experimentName: "upload-pipeline-e2e",
  data: () => [
    { input: "image" as ProbeCase, metadata: { fixture: "sentinel.png", sentinel: "VISION-7741" } },
    { input: "pdf" as ProbeCase, metadata: { fixture: "sentinel.pdf", sentinel: "MOONSTONE-2288" } },
  ],
  task: async (input: ProbeCase): Promise<CaseResult> => {
    const session = await getSession();
    try {
      return await runCase(input, session, BASE_URL);
    } catch (err) {
      // Return a failed CaseResult instead of throwing so scorers still log.
      return {
        name: input,
        pass: false,
        checks: [{ check: "case ran without throwing", pass: false, detail: String(err) }],
      };
    }
  },
  scores: [
    UploadAccepted,
    StreamCompleted,
    ModelSeesContent,
    CrossTurnRecall,
    NoStallPhrases,
    AllChecksPass,
  ],
  // Live E2E against a shared environment — run cases one at a time.
  maxConcurrency: 1,
  metadata: {
    base_url: BASE_URL,
    chat_model: "claude-sonnet",
    pipeline: "storage upload → /api/upload → /api/chat SSE",
  },
});

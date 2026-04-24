/**
 * Layer 4 eval runner
 *
 * Pulls recent Braintrust traces for PMMSherpa, filters for prose responses,
 * runs the 5 Layer 4 scorers on each, and writes a report.
 *
 * Run:
 *   npx tsx evals/harness/run_layer4.ts --limit 20
 *   npx tsx evals/harness/run_layer4.ts --limit 50 --skip-judge   # programmatic only (no API cost)
 *
 * Requires: bt CLI authenticated (already done), ANTHROPIC_API_KEY for judge.
 */

import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

import { scoreEmDash } from "../scorers/em_dash.js";
import { scoreLengthBucket } from "../scorers/length_bucket.js";
import { scoreMidQuestion } from "../scorers/mid_question.js";
import { scoreAiTells } from "../scorers/ai_tells.js";
import { scoreLayer4Voice } from "../scorers/layer4_voice.js";

type Args = { limit: number; skipJudge: boolean };
function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const limitIdx = argv.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : 20;
  const skipJudge = argv.includes("--skip-judge");
  return { limit, skipJudge };
}

type BtTraceRow = {
  id: string;
  created: string;
  input: unknown;
  output: unknown;
  span_attributes?: { name?: string; type?: string };
  metrics?: { completion_tokens?: number };
};
type BtEnvelope = { items: { row: BtTraceRow }[] };

function fetchTraces(limit: number): BtTraceRow[] {
  const cmd = `bt view logs --project PMMSherpa --limit ${limit} --json`;
  const raw = execSync(cmd, { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  const parsed = JSON.parse(raw) as BtEnvelope;
  return parsed.items.map((x) => x.row);
}

/** Extract user prompt + assistant text from a Braintrust span. */
function extractPair(row: BtTraceRow): { input: string; output: string } | null {
  // Input can be an array of {role, content} or a string.
  let input = "";
  if (Array.isArray(row.input)) {
    const userTurns = (row.input as { role?: string; content?: string }[])
      .filter((m) => m.role === "user")
      .map((m) => m.content ?? "");
    input = userTurns[userTurns.length - 1] ?? "";
  } else if (typeof row.input === "string") {
    input = row.input;
  }

  // Output can be a JSON string (OpenAI completion) or plain text.
  let output = "";
  if (typeof row.output === "string") {
    output = row.output;
    // Try to parse OpenAI-shaped completion
    try {
      const parsed = JSON.parse(output) as Array<{ message?: { content?: string } }>;
      if (Array.isArray(parsed) && parsed[0]?.message?.content) {
        output = parsed[0].message.content;
      }
    } catch {
      // leave as-is
    }
  } else if (Array.isArray(row.output)) {
    const arr = row.output as Array<{ message?: { content?: string } }>;
    if (arr[0]?.message?.content) output = arr[0].message.content;
  }

  if (!input || !output) return null;
  return { input, output };
}

/** Heuristic — score only outputs that look like assistant prose to the user,
 * not internal query-planner JSON or embedding spans. */
function looksLikeUserResponse(output: string): boolean {
  const trimmed = output.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return false;
  const words = trimmed.split(/\s+/).length;
  return words >= 60;
}

async function main() {
  const { limit, skipJudge } = parseArgs();
  console.log(`Fetching last ${limit} traces from PMMSherpa...`);
  const rows = fetchTraces(limit);
  console.log(`Fetched ${rows.length} spans.`);

  const candidates: { id: string; created: string; input: string; output: string }[] = [];
  for (const row of rows) {
    const pair = extractPair(row);
    if (!pair) continue;
    if (!looksLikeUserResponse(pair.output)) continue;
    candidates.push({ id: row.id, created: row.created, ...pair });
  }
  console.log(`${candidates.length} spans look like user-facing prose. Scoring...\n`);

  const results: Record<string, unknown>[] = [];
  let i = 0;
  for (const c of candidates) {
    i += 1;
    process.stdout.write(`[${i}/${candidates.length}] ${c.id.slice(0, 8)}... `);

    const emDash = scoreEmDash(c.input, c.output);
    const length = scoreLengthBucket(c.input, c.output);
    const midQ = scoreMidQuestion(c.input, c.output);
    const aiTells = scoreAiTells(c.input, c.output);
    const layer4 = skipJudge
      ? { name: "layer4_voice", score: null, metadata: { skipped: true } }
      : await scoreLayer4Voice(c.input, c.output);

    const row = {
      id: c.id,
      created: c.created,
      input_preview: c.input.slice(0, 120),
      output_preview: c.output.slice(0, 160),
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
    };
    results.push(row);

    const numericScores = [emDash.score, length.score, midQ.score, aiTells.score];
    if (typeof layer4.score === "number") numericScores.push(layer4.score);
    const avg = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;
    console.log(`avg=${avg.toFixed(2)}  em=${emDash.score}  len=${length.score.toFixed(2)}  midQ=${midQ.score}  aiTells=${aiTells.score.toFixed(2)}  voice=${typeof layer4.score === "number" ? layer4.score.toFixed(2) : "skip"}`);
  }

  // Aggregate
  const agg: Record<string, { sum: number; count: number; mean: number }> = {};
  for (const scorer of ["em_dash", "length_bucket", "mid_question", "ai_tells", "layer4_voice"]) {
    agg[scorer] = { sum: 0, count: 0, mean: 0 };
  }
  for (const r of results) {
    const s = r.scores as Record<string, number | null>;
    for (const [k, v] of Object.entries(s)) {
      if (typeof v === "number") {
        agg[k].sum += v;
        agg[k].count += 1;
      }
    }
  }
  for (const k of Object.keys(agg)) {
    agg[k].mean = agg[k].count > 0 ? agg[k].sum / agg[k].count : 0;
  }

  const reportDir = join(process.cwd(), "evals", "reports", "layer4");
  mkdirSync(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = join(reportDir, `run-${stamp}.json`);
  writeFileSync(jsonPath, JSON.stringify({ aggregates: agg, results }, null, 2));

  console.log("\n=== AGGREGATES ===");
  for (const [k, v] of Object.entries(agg)) {
    console.log(`${k.padEnd(16)} mean=${v.mean.toFixed(3)}  n=${v.count}`);
  }
  console.log(`\nReport: ${jsonPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

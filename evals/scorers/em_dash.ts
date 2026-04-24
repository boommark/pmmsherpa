/**
 * Em-dash scorer (programmatic)
 *
 * Rule: a Sherpa response must contain ZERO em dashes (—).
 * Any em dash in output => score 0.
 */

export type ScoreResult = {
  name: string;
  score: number; // 0..1
  metadata: Record<string, unknown>;
};

const EM_DASH = /—/g;

export function scoreEmDash(_input: string, output: string): ScoreResult {
  const matches = output.match(EM_DASH) ?? [];
  const count = matches.length;
  return {
    name: "em_dash",
    score: count === 0 ? 1 : 0,
    metadata: { em_dash_count: count },
  };
}

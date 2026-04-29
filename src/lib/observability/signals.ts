// Silent-failure signals for traces. Computed per request and attached to
// the active span so dashboards can alert on degradation without humans
// having to read every trace. Wired in Phase 3 (MCP_EXECUTION_PLAN.md).

export type RetrievedChunk = {
  score: number
}

export type SignalInput = {
  chunks: RetrievedChunk[]
  citationsCount: number
  outputText: string
  expectedJson?: boolean
  costUsd?: number
  costP95Usd?: number
}

export type Signals = {
  retrieval_mean_score: number
  retrieval_low_confidence: boolean
  citations_count: number
  output_invalid_json: boolean
  cost_outlier: boolean
}

const LOW_CONFIDENCE_THRESHOLD = 0.5

export function computeSignals(input: SignalInput): Signals {
  const { chunks, citationsCount, outputText, expectedJson, costUsd, costP95Usd } = input

  const meanScore = chunks.length === 0
    ? 0
    : chunks.reduce((acc, c) => acc + c.score, 0) / chunks.length

  let invalidJson = false
  if (expectedJson) {
    try {
      JSON.parse(outputText)
    } catch {
      invalidJson = true
    }
  }

  const costOutlier = !!(costUsd && costP95Usd && costUsd > costP95Usd * 2)

  return {
    retrieval_mean_score: Number(meanScore.toFixed(3)),
    retrieval_low_confidence: meanScore > 0 && meanScore < LOW_CONFIDENCE_THRESHOLD,
    citations_count: citationsCount,
    output_invalid_json: invalidJson,
    cost_outlier: costOutlier,
  }
}

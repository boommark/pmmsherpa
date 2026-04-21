/**
 * Cost Tracker — centralized API cost logging for all external services.
 * Fire-and-forget: never throws, never blocks features.
 */

import { createServiceClient } from '@/lib/supabase/server'

// All pricing in one place — update here when rates change
export const PRICING = {
  claude:              { inputPer1M: 3.0,    outputPer1M: 15.0 },   // Claude Sonnet 4.6
  gemini:              { inputPer1M: 2.0,    outputPer1M: 12.0 },   // Gemini 3.1 Pro Preview
  gemini_flash_lite:   { inputPer1M: 0.10,   outputPer1M: 0.40 },   // Gemini 2.5 Flash Lite
  openai_embeddings:   { perMillionTokens: 0.02 },                   // text-embedding-3-small
  perplexity:          { inputPer1M: 3.0,    outputPer1M: 15.0, perRequest: 0.005 }, // sonar-pro: tokens + $5/1K search
  brave_search:        { perRequest: 0.005 },                         // $5/1K requests
  jina:                { perMillionTokens: 0.02 },                    // token-based, ~$0.02/1M
  firecrawl:           { perPage: 0.002 },                            // ~$2/1K pages (v2 scrape)
  llamaparse:          { perPage: 0.00125 },                          // $1.25/1K pages (Fast tier)
  elevenlabs:          { perThousandChars: 0.12 },                    // Multilingual v2/v3
} as const

export type ServiceName = keyof typeof PRICING

interface TrackCostParams {
  userId: string
  service: ServiceName
  operation: string
  inputTokens?: number
  outputTokens?: number
  units?: number
  unitType?: 'tokens' | 'characters' | 'pages' | 'requests'
  metadata?: Record<string, unknown>
  conversationId?: string | null
}

export function calculateCost(service: ServiceName, params: { inputTokens?: number; outputTokens?: number; units?: number }): number {
  const p = PRICING[service]
  let cost = 0

  // Token-based cost (input + output)
  if ('inputPer1M' in p && 'outputPer1M' in p) {
    cost += ((params.inputTokens || 0) / 1_000_000) * p.inputPer1M +
            ((params.outputTokens || 0) / 1_000_000) * p.outputPer1M
  }
  // Per-request search fee (Perplexity has both token + per-request costs)
  if ('perRequest' in p) {
    cost += (params.units || 1) * p.perRequest
  }
  if (cost > 0) return cost

  if ('perMillionTokens' in p) {
    return ((params.units || 0) / 1_000_000) * p.perMillionTokens
  }
  if ('perPage' in p) {
    return (params.units || 1) * p.perPage
  }
  if ('perThousandChars' in p) {
    return ((params.units || 0) / 1000) * p.perThousandChars
  }
  return 0
}

export async function trackCost(params: TrackCostParams): Promise<void> {
  try {
    const costUsd = calculateCost(params.service, {
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      units: params.units,
    })
    const supabase = await createServiceClient()
    await (supabase.from('api_costs') as ReturnType<typeof supabase.from>).insert({
      user_id: params.userId,
      service: params.service,
      operation: params.operation,
      input_tokens: params.inputTokens || null,
      output_tokens: params.outputTokens || null,
      units: params.units || null,
      unit_type: params.unitType || null,
      cost_usd: costUsd,
      metadata: params.metadata || null,
      conversation_id: params.conversationId || null,
    })
  } catch (err) {
    console.error('[CostTracker] Failed to log cost:', err)
  }
}

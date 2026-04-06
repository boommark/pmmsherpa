/**
 * Cost Tracker — centralized API cost logging for all external services.
 * Fire-and-forget: never throws, never blocks features.
 */

import { createServiceClient } from '@/lib/supabase/server'

// All pricing in one place — update here when rates change
export const PRICING = {
  claude:              { inputPer1M: 3.0,    outputPer1M: 15.0 },
  gemini:              { inputPer1M: 1.25,   outputPer1M: 10.0 },
  gemini_flash_lite:   { inputPer1M: 0.075,  outputPer1M: 0.30 },
  openai_embeddings:   { perMillionTokens: 0.02 },
  perplexity:          { perRequest: 0.005 },       // $5/1K requests
  brave_search:        { perRequest: 0.005 },       // $5/1K requests
  jina:                { perRequest: 0.001 },       // $1/1K requests
  firecrawl:           { perPage: 0.0045 },         // $4.50/1K pages
  llamaparse:          { perPage: 0.003 },          // $3/1K pages
  elevenlabs:          { perThousandChars: 0.15 },  // $0.15/1K chars
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

  if ('inputPer1M' in p && 'outputPer1M' in p) {
    return ((params.inputTokens || 0) / 1_000_000) * p.inputPer1M +
           ((params.outputTokens || 0) / 1_000_000) * p.outputPer1M
  }
  if ('perMillionTokens' in p) {
    return ((params.units || 0) / 1_000_000) * p.perMillionTokens
  }
  if ('perRequest' in p) {
    return (params.units || 1) * p.perRequest
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

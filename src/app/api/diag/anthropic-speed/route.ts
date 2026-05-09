/**
 * Diagnostic endpoint: measures Sonnet 4.6 streaming decode rate two ways
 * from inside the Vercel function — direct fetch to api.anthropic.com vs
 * the same call routed through @ai-sdk/anthropic. Goal is to determine
 * whether the observed ~38-40 tok/s ceiling on PMM Sherpa MCP traces is
 * caused by the Anthropic account/tier (both paths slow) or by the AI
 * SDK / OTel instrumentation overhead (only the SDK path slow).
 *
 * Run from anywhere with admin credentials:
 *   curl -H "Authorization: Bearer $DIAG_SECRET" \
 *     https://pmmsherpa.com/api/diag/anthropic-speed
 *
 * Or signed-in admin: just GET /api/diag/anthropic-speed in a browser.
 *
 * Cost per run: ~$0.02 (two ~1000-output-token Sonnet calls).
 * Returns JSON; safe to leave in production for ad-hoc re-measurement.
 */

import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { getModel } from '@/lib/llm/provider-factory'
import { createClient } from '@/lib/supabase/server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const TEST_SYSTEM = 'You are a helpful assistant. Reply concisely and informatively.'
const TEST_USER =
  'Write a 700-word explainer on the history and present-day importance of product positioning, citing Geoffrey Moore, April Dunford, and Al Ries. No bullet lists; full prose only.'
const MODEL_ID = 'claude-sonnet-4-6'
const MAX_TOKENS = 2048

interface TimingResult {
  path: 'direct-fetch' | 'ai-sdk'
  total_ms: number
  ttft_ms: number | null
  decode_ms: number
  output_tokens: number
  tok_per_sec: number
  error?: string
}

async function authorize(req: NextRequest): Promise<true | Response> {
  const bearer = req.headers.get('authorization')
  const diagSecret = process.env.DIAG_SECRET
  if (diagSecret && bearer === `Bearer ${diagSecret}`) return true

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL) return true

  return new Response('forbidden', { status: 403 })
}

async function timeDirectFetch(): Promise<TimingResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY!
  const start = Date.now()
  let firstTokenAt: number | null = null
  let outputTokens = 0
  let textLen = 0

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        system: TEST_SYSTEM,
        messages: [{ role: 'user', content: TEST_USER }],
        stream: true,
      }),
    })

    if (!res.ok || !res.body) {
      const errText = await res.text().catch(() => '')
      return {
        path: 'direct-fetch',
        total_ms: Date.now() - start,
        ttft_ms: null,
        decode_ms: 0,
        output_tokens: 0,
        tok_per_sec: 0,
        error: `HTTP ${res.status}: ${errText.slice(0, 200)}`,
      }
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const json = line.slice(5).trim()
        if (!json || json === '[DONE]') continue
        try {
          const evt = JSON.parse(json)
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            if (firstTokenAt === null) firstTokenAt = Date.now()
            textLen += evt.delta.text.length
          } else if (evt.type === 'message_delta' && evt.usage?.output_tokens != null) {
            outputTokens = evt.usage.output_tokens
          } else if (evt.type === 'message_start' && evt.message?.usage?.output_tokens != null) {
            outputTokens = Math.max(outputTokens, evt.message.usage.output_tokens)
          }
        } catch {
          /* skip malformed line */
        }
      }
    }
  } catch (err) {
    return {
      path: 'direct-fetch',
      total_ms: Date.now() - start,
      ttft_ms: firstTokenAt ? firstTokenAt - start : null,
      decode_ms: 0,
      output_tokens: 0,
      tok_per_sec: 0,
      error: err instanceof Error ? err.message : 'unknown error',
    }
  }

  const total_ms = Date.now() - start
  const ttft_ms = firstTokenAt ? firstTokenAt - start : null
  const decode_ms = firstTokenAt ? Date.now() - firstTokenAt : total_ms
  const tok_per_sec = decode_ms > 0 && outputTokens > 0
    ? outputTokens / (decode_ms / 1000)
    : 0
  return {
    path: 'direct-fetch',
    total_ms,
    ttft_ms,
    decode_ms,
    output_tokens: outputTokens,
    tok_per_sec: Number(tok_per_sec.toFixed(1)),
  }
}

async function timeAiSdk(): Promise<TimingResult> {
  const start = Date.now()
  let firstTokenAt: number | null = null
  let outputTokens = 0

  try {
    const stream = streamText({
      model: getModel('claude-sonnet'),
      system: TEST_SYSTEM,
      messages: [{ role: 'user', content: TEST_USER }],
      maxOutputTokens: MAX_TOKENS,
      temperature: 0.7,
    })

    for await (const _delta of stream.textStream) {
      if (firstTokenAt === null) firstTokenAt = Date.now()
    }
    const usage = await stream.usage
    outputTokens = usage?.outputTokens ?? 0
  } catch (err) {
    return {
      path: 'ai-sdk',
      total_ms: Date.now() - start,
      ttft_ms: firstTokenAt ? firstTokenAt - start : null,
      decode_ms: 0,
      output_tokens: 0,
      tok_per_sec: 0,
      error: err instanceof Error ? err.message : 'unknown error',
    }
  }

  const total_ms = Date.now() - start
  const ttft_ms = firstTokenAt ? firstTokenAt - start : null
  const decode_ms = firstTokenAt ? Date.now() - firstTokenAt : total_ms
  const tok_per_sec = decode_ms > 0 && outputTokens > 0
    ? outputTokens / (decode_ms / 1000)
    : 0
  return {
    path: 'ai-sdk',
    total_ms,
    ttft_ms,
    decode_ms,
    output_tokens: outputTokens,
    tok_per_sec: Number(tok_per_sec.toFixed(1)),
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  const auth = await authorize(req)
  if (auth instanceof Response) return auth

  const direct = await timeDirectFetch()
  const sdk = await timeAiSdk()

  const verdict = (() => {
    if (direct.error || sdk.error) return 'inconclusive (see errors)'
    const gap = sdk.tok_per_sec - direct.tok_per_sec
    if (Math.abs(gap) < 5) return 'no significant gap — Anthropic account/tier likely capped at this rate'
    if (sdk.tok_per_sec < direct.tok_per_sec - 5) return 'AI SDK / OTel adds overhead — investigate experimental_telemetry flush cadence'
    return 'AI SDK is faster than direct — unexpected, re-run'
  })()

  return Response.json({
    model: MODEL_ID,
    max_tokens: MAX_TOKENS,
    region: process.env.VERCEL_REGION ?? 'unknown',
    direct_fetch: direct,
    ai_sdk: sdk,
    gap_tok_per_sec: Number((sdk.tok_per_sec - direct.tok_per_sec).toFixed(1)),
    verdict,
  })
}

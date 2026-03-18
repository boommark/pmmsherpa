/**
 * Chat pipeline tracing — captures timing, outcomes, and errors for every request.
 * Traces are saved to Supabase `chat_traces` table for debugging.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface TraceData {
  trace_id: string
  user_id: string
  conversation_id?: string | null
  model: string
  user_message?: string
  has_attachments?: boolean

  // Auto-detection
  web_search_enabled?: boolean
  search_reason?: string | null
  has_urls?: boolean
  detected_urls?: string[]

  // Pipeline timings (ms)
  total_duration_ms?: number
  history_fetch_ms?: number
  rag_duration_ms?: number
  perplexity_duration_ms?: number
  llm_duration_ms?: number
  db_save_ms?: number

  // RAG
  rag_chunks_found?: number
  rag_query?: string

  // Perplexity
  perplexity_triggered?: boolean
  perplexity_success?: boolean
  perplexity_citations_count?: number
  perplexity_error?: string

  // URL tools
  url_tools_attached?: boolean
  url_tool_provider?: string

  // LLM
  llm_input_tokens?: number
  llm_output_tokens?: number
  llm_response_length?: number

  // Outcome
  status: 'started' | 'streaming' | 'completed' | 'error'
  error_message?: string
  error_step?: string

  completed_at?: string
}

/**
 * Generates a unique trace ID for correlating logs
 */
export function generateTraceId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 8)
  return `tr_${ts}_${rand}`
}

/**
 * ChatTracer — accumulates pipeline step data and flushes to Supabase.
 *
 * Usage:
 *   const tracer = new ChatTracer(supabase, traceId, userId, model)
 *   tracer.set({ conversation_id: '...' })
 *   tracer.startStep('rag')
 *   // ... do work ...
 *   tracer.endStep('rag', { rag_chunks_found: 5 })
 *   await tracer.complete()  // or tracer.fail('llm', error)
 */
export class ChatTracer {
  private data: TraceData
  private stepTimers: Map<string, number> = new Map()
  private supabase: SupabaseClient
  private inserted = false
  private pipelineStart: number

  constructor(supabase: SupabaseClient, traceId: string, userId: string, model: string) {
    this.supabase = supabase
    this.pipelineStart = Date.now()
    this.data = {
      trace_id: traceId,
      user_id: userId,
      model,
      status: 'started',
    }
  }

  /** Set arbitrary trace fields */
  set(fields: Partial<TraceData>) {
    Object.assign(this.data, fields)
  }

  /** Start timing a named step */
  startStep(step: string) {
    this.stepTimers.set(step, Date.now())
  }

  /** End timing a named step and merge extra fields */
  endStep(step: string, extra?: Partial<TraceData>) {
    const start = this.stepTimers.get(step)
    if (start) {
      const duration = Date.now() - start
      const key = `${step}_duration_ms` as keyof TraceData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(this.data as any)[key] = duration
      this.stepTimers.delete(step)
    }
    if (extra) {
      Object.assign(this.data, extra)
    }
  }

  /** Insert the initial trace row (call early so partial data is visible) */
  async insert() {
    if (this.inserted) return
    this.inserted = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.supabase.from('chat_traces') as any).insert({
        ...this.data,
        created_at: new Date().toISOString(),
      })
      if (error) {
        console.error('[Trace] Insert error:', error.message)
      }
    } catch (err) {
      console.error('[Trace] Insert exception:', err)
    }
  }

  /** Update the trace row with accumulated data */
  private async update(fields: Partial<TraceData>) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (this.supabase.from('chat_traces') as any)
        .update(fields)
        .eq('trace_id', this.data.trace_id)
      if (error) {
        console.error('[Trace] Update error:', error.message)
      }
    } catch (err) {
      console.error('[Trace] Update exception:', err)
    }
  }

  /** Mark trace as streaming (LLM has started producing output) */
  async streaming() {
    this.data.status = 'streaming'
    if (this.inserted) {
      await this.update({ status: 'streaming' })
    }
  }

  /** Mark trace as successfully completed */
  async complete(extra?: Partial<TraceData>) {
    if (extra) Object.assign(this.data, extra)
    this.data.status = 'completed'
    this.data.total_duration_ms = Date.now() - this.pipelineStart
    this.data.completed_at = new Date().toISOString()

    if (this.inserted) {
      await this.update(this.data)
    } else {
      // Never inserted — write the full record now
      this.inserted = true
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (this.supabase.from('chat_traces') as any).insert({
          ...this.data,
          created_at: new Date(this.pipelineStart).toISOString(),
        })
        if (error) console.error('[Trace] Final insert error:', error.message)
      } catch (err) {
        console.error('[Trace] Final insert exception:', err)
      }
    }
  }

  /** Mark trace as failed */
  async fail(step: string, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    this.data.status = 'error'
    this.data.error_step = step
    this.data.error_message = errorMessage.substring(0, 2000) // Truncate long errors
    this.data.total_duration_ms = Date.now() - this.pipelineStart
    this.data.completed_at = new Date().toISOString()

    console.error(`[Trace ${this.data.trace_id}] FAILED at step "${step}":`, errorMessage)

    if (this.inserted) {
      await this.update(this.data)
    } else {
      this.inserted = true
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: dbErr } = await (this.supabase.from('chat_traces') as any).insert({
          ...this.data,
          created_at: new Date(this.pipelineStart).toISOString(),
        })
        if (dbErr) console.error('[Trace] Error insert error:', dbErr.message)
      } catch (err) {
        console.error('[Trace] Error insert exception:', err)
      }
    }
  }

  /** Get the trace ID for logging */
  get traceId(): string {
    return this.data.trace_id
  }
}

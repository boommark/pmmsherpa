/**
 * LlamaParse v2 client helpers.
 *
 * Two-phase async parsing:
 *   1. startJob()          — upload file, get job_id, return fast
 *   2. fetchResult(jobId)  — poll job status, pull markdown when done
 *
 * The upload HTTP handler uses startJob() only, so the response returns in a
 * few seconds regardless of document length. The chat handler uses
 * fetchResult() / pollUntilDone() lazily on the first chat send after upload,
 * then persists extracted_text so subsequent sends are instant.
 *
 * v2 endpoints (per developers.llamaindex.ai/python/cloud/llamaparse/api-v2-guide):
 *   POST /api/v2/parse/upload                            multipart
 *   GET  /api/v2/parse/{job_id}?expand=markdown,text     status + content
 *
 * Response shapes are still being finalized in the v2 guide, so every field
 * access goes through a defensive extractor that tries several known shapes.
 */

const BASE = 'https://api.cloud.llamaindex.ai'

export type ParseResult =
  | { status: 'processing' }
  | { status: 'completed'; markdown: string }
  | { status: 'failed'; error: string }

/**
 * Kick off a parse job. Returns the job id, or null on failure.
 * Does NOT wait for the job to finish.
 */
export async function startJob(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string | null> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  if (!apiKey) {
    console.warn('[LlamaParse] LLAMA_CLOUD_API_KEY not set, skipping document parsing')
    return null
  }

  const form = new FormData()
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType })
  form.append('file', blob, fileName)
  form.append(
    'configuration',
    JSON.stringify({
      tier: 'cost_effective',
      version: 'latest',
      output_options: {
        markdown: {
          annotate_links: true,
          tables: { output_tables_as_markdown: true },
        },
      },
    }),
  )

  let res: Response
  try {
    res = await fetch(`${BASE}/api/v2/parse/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    })
  } catch (err) {
    console.error(`[LlamaParse] network error starting job for ${fileName}:`, err)
    return null
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(
      `[LlamaParse] start job failed for ${fileName}: ${res.status} ${body.slice(0, 500)}`,
    )
    return null
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    console.error(`[LlamaParse] start job returned non-JSON for ${fileName}`)
    return null
  }

  const jobId = extractJobId(data)
  if (!jobId) {
    console.error(
      `[LlamaParse] no job id in response for ${fileName}:`,
      JSON.stringify(data).slice(0, 500),
    )
    return null
  }

  console.log(`[LlamaParse] started job ${jobId} for ${fileName}`)
  return jobId
}

/**
 * Fetch the current status and (if completed) the markdown content for a job.
 * One-shot — does not poll.
 */
export async function fetchResult(jobId: string): Promise<ParseResult> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  if (!apiKey) return { status: 'failed', error: 'LLAMA_CLOUD_API_KEY not set' }

  let res: Response
  try {
    res = await fetch(
      `${BASE}/api/v2/parse/${jobId}?expand=markdown,text`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    )
  } catch (err) {
    console.error(`[LlamaParse] network error fetching ${jobId}:`, err)
    return { status: 'processing' } // transient — let the caller retry
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error(
      `[LlamaParse] fetch failed for ${jobId}: ${res.status} ${body.slice(0, 300)}`,
    )
    // 4xx likely terminal; 5xx retryable
    if (res.status >= 400 && res.status < 500) {
      return { status: 'failed', error: `${res.status}: ${body.slice(0, 200)}` }
    }
    return { status: 'processing' }
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return { status: 'processing' }
  }

  const status = normalizeStatus(extractStatus(data))

  if (status === 'completed') {
    const markdown = extractMarkdown(data)
    if (markdown && markdown.trim()) {
      return { status: 'completed', markdown }
    }
    console.warn(
      `[LlamaParse] job ${jobId} completed but no markdown in response. Keys:`,
      describeShape(data),
    )
    return { status: 'failed', error: 'completed but no markdown in response' }
  }

  if (status === 'failed') {
    const errMsg = extractError(data) || 'Unknown error'
    console.error(`[LlamaParse] job ${jobId} failed: ${errMsg}`)
    return { status: 'failed', error: errMsg }
  }

  return { status: 'processing' }
}

/**
 * Poll fetchResult() every ~2s until done or budgetMs elapses.
 * Returns null on timeout or failure.
 */
export async function pollUntilDone(
  jobId: string,
  budgetMs: number,
): Promise<string | null> {
  const start = Date.now()
  const interval = 2000
  // fire an immediate check — the job may already be done by the time we're
  // called from the chat route (upload kicked it off seconds ago)
  while (Date.now() - start < budgetMs) {
    const result = await fetchResult(jobId)
    if (result.status === 'completed') return result.markdown
    if (result.status === 'failed') return null
    const remaining = budgetMs - (Date.now() - start)
    if (remaining <= 0) break
    await new Promise((r) => setTimeout(r, Math.min(interval, remaining)))
  }
  return null
}

// ────────────────────────────────────────────────────────────────────────────
// Defensive extractors — v2 response shapes are documented inconsistently,
// so we accept either top-level fields or a nested { job: {...} } wrapper.
// ────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractJobId(data: any): string | null {
  if (!data || typeof data !== 'object') return null
  return (
    (typeof data.id === 'string' ? data.id : null) ||
    (typeof data.job_id === 'string' ? data.job_id : null) ||
    (typeof data.job?.id === 'string' ? data.job.id : null) ||
    null
  )
}

function extractStatus(data: any): string {
  if (!data || typeof data !== 'object') return ''
  return (
    (typeof data.status === 'string' ? data.status : '') ||
    (typeof data.job?.status === 'string' ? data.job.status : '') ||
    ''
  )
}

function extractError(data: any): string | null {
  if (!data || typeof data !== 'object') return null
  return (
    (typeof data.error_message === 'string' ? data.error_message : null) ||
    (typeof data.job?.error_message === 'string' ? data.job.error_message : null) ||
    (typeof data.error === 'string' ? data.error : null) ||
    null
  )
}

function extractMarkdown(data: any): string | null {
  if (!data || typeof data !== 'object') return null

  // Direct string candidates at a handful of known paths.
  const direct: Array<unknown> = [
    data.markdown,
    data.text,
    data.result?.markdown,
    data.result?.text,
    data.job?.result?.markdown,
    data.job?.markdown,
    data.content?.markdown,
  ]
  for (const c of direct) {
    if (typeof c === 'string' && c.trim()) return c
  }

  // Page arrays — join markdown/text fields across pages.
  const pageArrays: Array<unknown> = [
    data.pages,
    data.result?.pages,
    data.job?.pages,
    data.job?.result?.pages,
  ]
  for (const arr of pageArrays) {
    if (Array.isArray(arr) && arr.length > 0) {
      const joined = arr
        .map((p: any) => p?.markdown || p?.md || p?.text || '')
        .filter((s: string) => s && s.trim())
        .join('\n\n')
        .trim()
      if (joined) return joined
    }
  }

  return null
}

function normalizeStatus(raw: string): 'processing' | 'completed' | 'failed' {
  const s = (raw || '').toUpperCase()
  if (s === 'COMPLETED' || s === 'SUCCESS') return 'completed'
  if (s === 'FAILED' || s === 'ERROR' || s === 'CANCELLED' || s === 'CANCELED') {
    return 'failed'
  }
  // PENDING, QUEUED, RUNNING, or unknown → treat as still processing
  return 'processing'
}

function describeShape(data: any): string {
  if (!data || typeof data !== 'object') return typeof data
  return Object.keys(data).join(',')
}

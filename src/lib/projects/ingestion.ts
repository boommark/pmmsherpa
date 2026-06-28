/**
 * Project document ingestion pipeline.
 *
 * processProjectDocument(documentId) is the single entry point — called via
 * waitUntil() from the documents API routes after upload-finalize (files) or
 * immediately after row creation (pasted text). Safe to re-run: chunks for the
 * document are deleted before re-insert, and the LlamaParse job is reused
 * when one is already recorded.
 *
 * Pipeline (files):
 *   storage signed URL → LlamaParse (parsing runs off-Vercel) → poll →
 *   heading-aware chunking → per-chunk contextual preamble (Haiku, prompt
 *   caching with the doc text as the cached prefix) → doc synopsis (Haiku) →
 *   embeddings (text-embedding-3-small, 512-dim) → insert project_chunks →
 *   doc status='ready' → recompute project total_token_count.
 *
 * Pasted text skips the parse step and uses the stored full_text directly.
 *
 * Failures land as status='failed' with a human-readable error_message —
 * parsing failures are the #1 expected support surface (scanned PDFs,
 * image-only decks), so messages are written for end users, not logs.
 */

import { generateText } from 'ai'
import { createServiceClient } from '@/lib/supabase/server'
import { startJobFromUrl, pollUntilDone } from '@/lib/llamaparse'
import { generateEmbeddings } from '@/lib/rag/embeddings'
import { getModel } from '@/lib/llm/provider-factory'
import { trackCost } from '@/lib/cost-tracker'
import { chunkMarkdown, estimateTokens, type ProjectChunkOutput } from './chunker'
import { MAX_DOC_TOKENS, MAX_DOC_PAGES } from './limits'

export const PROJECT_DOCUMENTS_BUCKET = 'project-documents'

/** Same Haiku alias the MCP server uses (claude-haiku-4-5). */
const HAIKU_MODEL = 'claude-haiku' as const

/** Budget for re-polling an already-started LlamaParse job before restarting it. */
const REPOLL_BUDGET_MS = 45_000
/** Budget for a freshly started parse job (route maxDuration is 300s). */
const PARSE_BUDGET_MS = 220_000

/** Cap on the document text used as the cached prompt prefix (~37K tokens). */
const DOC_CACHE_CHAR_CAP = 150_000

/** Below this many extracted chars we assume a scanned/image-only document. */
const MIN_EXTRACTED_CHARS = 200

/** Parallelism for per-chunk contextualization calls (after a cache-warming call). */
const CONTEXT_CONCURRENCY = 4

/** Embedding batch size. */
const EMBED_BATCH_SIZE = 64

/** Chunk insert batch size. */
const INSERT_BATCH_SIZE = 100

interface ProjectDocumentRow {
  id: string
  project_id: string
  user_id: string
  title: string
  file_name: string | null
  mime_type: string | null
  storage_path: string | null
  source_type: 'file' | 'text'
  status: string
  llamaparse_job_id: string | null
  full_text: string | null
}

export async function processProjectDocument(documentId: string): Promise<void> {
  const supabase = await createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: doc, error: docErr } = await (supabase.from('project_documents') as any)
    .select('id, project_id, user_id, title, file_name, mime_type, storage_path, source_type, status, llamaparse_job_id, full_text')
    .eq('id', documentId)
    .maybeSingle()

  if (docErr || !doc) {
    console.error(`[Projects] processProjectDocument: document ${documentId} not found`, docErr)
    return
  }
  const document = doc as ProjectDocumentRow

  const markFailed = async (message: string) => {
    console.error(`[Projects] doc ${documentId} (${document.title}) failed: ${message}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('project_documents') as any)
      .update({ status: 'failed', error_message: message })
      .eq('id', documentId)
  }

  try {
    // Re-runs (retry endpoint) should clear stale failure state up front.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('project_documents') as any)
      .update({ status: 'processing', error_message: null })
      .eq('id', documentId)

    // ── 1. Get the full text ────────────────────────────────────────────────
    let fullText: string | null = null

    if (document.source_type === 'text') {
      fullText = document.full_text
      if (!fullText || !fullText.trim()) {
        await markFailed('No text content was provided for this document.')
        return
      }
    } else {
      fullText = await parseFile(supabase, document)
      if (fullText === null) {
        await markFailed(
          'We could not parse this file. It may be corrupted, password-protected, or in an unsupported format. Try re-uploading or exporting it to PDF first.',
        )
        return
      }
    }

    // ── 2. Sanity checks ────────────────────────────────────────────────────
    const trimmed = fullText.trim()
    if (trimmed.length < MIN_EXTRACTED_CHARS && document.source_type === 'file') {
      const isPdf = document.mime_type === 'application/pdf'
      await markFailed(
        isPdf
          ? 'This file appears to be a scanned/image PDF — almost no readable text was found. Try a text-based PDF export, or paste the content directly.'
          : 'Almost no readable text was found in this file. If it is mostly images, paste the key content directly instead.',
      )
      return
    }

    const docTokens = estimateTokens(trimmed)
    if (docTokens > MAX_DOC_TOKENS) {
      await markFailed(
        `This document is too large (~${docTokens.toLocaleString()} tokens — roughly more than ${MAX_DOC_PAGES} pages). Split it into smaller documents and upload those instead.`,
      )
      return
    }

    // ── 3. Chunk ────────────────────────────────────────────────────────────
    const chunks = chunkMarkdown(trimmed)
    if (chunks.length === 0) {
      await markFailed('No usable content was found in this document after parsing.')
      return
    }
    console.log(`[Projects] doc ${documentId}: ${chunks.length} chunks from ~${docTokens} tokens`)

    // ── 4. Synopsis + contextual preambles (Haiku, cached doc prefix) ───────
    const docPrefix = trimmed.slice(0, DOC_CACHE_CHAR_CAP)

    // Synopsis first — it warms the prompt cache for the per-chunk calls.
    const synopsis = await generateSynopsis(document, docPrefix)
    const contextHeaders = await generateContextHeaders(document, docPrefix, chunks)

    // ── 5. Embeddings ───────────────────────────────────────────────────────
    // Contextual-retrieval convention: embed the preamble together with the
    // chunk so retrieval benefits from the added context.
    const embedInputs = chunks.map((c, i) =>
      contextHeaders[i] ? `${contextHeaders[i]}\n\n${c.content}` : c.content,
    )
    const embeddings: number[][] = []
    for (let i = 0; i < embedInputs.length; i += EMBED_BATCH_SIZE) {
      const batch = embedInputs.slice(i, i + EMBED_BATCH_SIZE)
      embeddings.push(...(await generateEmbeddings(batch)))
    }
    trackCost({
      userId: document.user_id,
      service: 'openai_embeddings',
      operation: 'project_doc_embedding',
      units: embedInputs.reduce((sum, t) => sum + estimateTokens(t), 0),
      unitType: 'tokens',
      metadata: { documentId, projectId: document.project_id, chunks: chunks.length },
    })

    // ── 6. Idempotent insert ────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delErr } = await (supabase.from('project_chunks') as any)
      .delete()
      .eq('document_id', documentId)
    if (delErr) throw new Error(`failed to clear existing chunks: ${delErr.message}`)

    const rows = chunks.map((c, i) => ({
      document_id: documentId,
      project_id: document.project_id,
      user_id: document.user_id,
      content: c.content,
      context_header: contextHeaders[i] || null,
      section_title: c.sectionTitle,
      page_number: null,
      token_count: c.tokenCount,
      embedding: JSON.stringify(embeddings[i]),
    }))
    for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insErr } = await (supabase.from('project_chunks') as any)
        .insert(rows.slice(i, i + INSERT_BATCH_SIZE))
      if (insErr) throw new Error(`failed to insert chunks: ${insErr.message}`)
    }

    // ── 7. Mark ready + roll up project token count ─────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updErr } = await (supabase.from('project_documents') as any)
      .update({
        status: 'ready',
        error_message: null,
        synopsis,
        full_text: trimmed,
        token_count: docTokens,
      })
      .eq('id', documentId)
    if (updErr) throw new Error(`failed to mark document ready: ${updErr.message}`)

    await recomputeProjectTokenCount(supabase, document.project_id)

    console.log(`[Projects] doc ${documentId} ready: ${chunks.length} chunks, ${docTokens} tokens`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await markFailed(`Processing failed: ${message}`)
  }
}

/**
 * Recompute projects.total_token_count from ready documents. Exported so the
 * document DELETE route can reuse it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function recomputeProjectTokenCount(supabase: any, projectId: string): Promise<void> {
  const { data: docs, error } = await supabase
    .from('project_documents')
    .select('token_count')
    .eq('project_id', projectId)
    .eq('status', 'ready')
  if (error) {
    console.error(`[Projects] failed to recompute token count for project ${projectId}:`, error)
    return
  }
  const total = ((docs || []) as Array<{ token_count: number | null }>).reduce(
    (sum, d) => sum + (d.token_count || 0),
    0,
  )
  await supabase
    .from('projects')
    .update({ total_token_count: total, updated_at: new Date().toISOString() })
    .eq('id', projectId)
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────────────────────

/** Parse a stored file via LlamaParse. Returns markdown, or null on failure. */
async function parseFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  document: ProjectDocumentRow,
): Promise<string | null> {
  if (!document.storage_path) {
    console.error(`[Projects] doc ${document.id} has source_type=file but no storage_path`)
    return null
  }

  // Reuse an in-flight/completed job when one is recorded (retry path).
  if (document.llamaparse_job_id) {
    const markdown = await pollUntilDone(document.llamaparse_job_id, REPOLL_BUDGET_MS)
    if (markdown) return markdown
    console.warn(
      `[Projects] doc ${document.id}: existing LlamaParse job ${document.llamaparse_job_id} unusable, starting fresh`,
    )
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(PROJECT_DOCUMENTS_BUCKET)
    .createSignedUrl(document.storage_path, 60 * 60)
  if (signErr || !signed?.signedUrl) {
    console.error(`[Projects] createSignedUrl failed for doc ${document.id}:`, signErr)
    return null
  }

  const jobId = await startJobFromUrl(signed.signedUrl, document.file_name || document.title)
  if (!jobId) return null

  await supabase
    .from('project_documents')
    .update({ llamaparse_job_id: jobId })
    .eq('id', document.id)

  trackCost({
    userId: document.user_id,
    service: 'llamaparse',
    operation: 'project_doc_parse',
    units: 1,
    unitType: 'pages',
    metadata: { documentId: document.id, fileName: document.file_name },
  })

  return pollUntilDone(jobId, PARSE_BUDGET_MS)
}

// ─────────────────────────────────────────────────────────────────────────────
// Haiku: synopsis + contextual preambles (shared cached document prefix)
// ─────────────────────────────────────────────────────────────────────────────

function buildCachedSystemMessages(document: ProjectDocumentRow, docPrefix: string) {
  return [
    {
      role: 'system' as const,
      content:
        `You are indexing a document a user added to their product-marketing workspace.\n\n` +
        `Document title: ${document.title}\n\n<document>\n${docPrefix}\n</document>`,
      providerOptions: {
        // Default 5-min ephemeral TTL — all calls for one document happen
        // within seconds of each other, so the cheap cache is enough here
        // (unlike the sparse MCP traffic that needs the 1h TTL).
        anthropic: { cacheControl: { type: 'ephemeral' as const } },
      },
    },
  ]
}

async function generateSynopsis(
  document: ProjectDocumentRow,
  docPrefix: string,
): Promise<string | null> {
  try {
    const result = await generateText({
      model: getModel(HAIKU_MODEL),
      messages: [
        ...buildCachedSystemMessages(document, docPrefix),
        {
          role: 'user' as const,
          content:
            'Write a 2-3 sentence synopsis of this document: what it is, what it covers, and what it would be useful for. ' +
            'Respond with only the synopsis — no preamble, no markdown.',
        },
      ],
      maxOutputTokens: 200,
      temperature: 0,
    })
    return result.text.trim() || null
  } catch (err) {
    console.warn(`[Projects] synopsis generation failed for doc ${document.id}:`, err)
    return null
  }
}

async function generateContextHeaders(
  document: ProjectDocumentRow,
  docPrefix: string,
  chunks: ProjectChunkOutput[],
): Promise<Array<string | null>> {
  const systemMessages = buildCachedSystemMessages(document, docPrefix)

  const contextualize = async (chunk: ProjectChunkOutput): Promise<string | null> => {
    try {
      const result = await generateText({
        model: getModel(HAIKU_MODEL),
        messages: [
          ...systemMessages,
          {
            role: 'user' as const,
            content:
              `Here is a chunk from the document:\n<chunk>\n${chunk.content}\n</chunk>\n\n` +
              'Give a short succinct context (1-2 sentences) situating this chunk within the overall document, ' +
              'to improve search retrieval of the chunk. Respond with only the context — nothing else.',
          },
        ],
        maxOutputTokens: 120,
        temperature: 0,
      })
      return result.text.trim() || null
    } catch (err) {
      console.warn(`[Projects] chunk contextualization failed for doc ${document.id}:`, err)
      // Fallback: title (+ section) is still a useful retrieval prefix.
      return chunk.sectionTitle ? `${document.title} — ${chunk.sectionTitle}` : document.title
    }
  }

  const headers: Array<string | null> = new Array(chunks.length).fill(null)

  // First call alone to write the prompt cache; remainder in small parallel
  // batches that all read the cached document prefix.
  headers[0] = await contextualize(chunks[0])
  for (let i = 1; i < chunks.length; i += CONTEXT_CONCURRENCY) {
    const batch = chunks.slice(i, i + CONTEXT_CONCURRENCY)
    const results = await Promise.all(batch.map(contextualize))
    results.forEach((r, j) => {
      headers[i + j] = r
    })
  }

  return headers
}

/**
 * /api/projects/[id]/documents — add and list project documents.
 *
 * GET  → documents with status (ingestion progress polling)
 * POST → three actions:
 *   { action: 'init-upload', fileName, mimeType, fileSize }
 *       Creates the doc row + mints a signed upload URL. The client uploads
 *       the bytes straight to Supabase Storage (no Vercel body-size cap),
 *       then calls finalize.
 *   { action: 'finalize', documentId }
 *       Verifies the object landed in storage, then kicks off ingestion
 *       (LlamaParse → chunk → contextualize → embed) via waitUntil.
 *   { action: 'text', title, content, tier? }
 *       Pasted text — creates the row with full_text and processes immediately.
 *
 * Caps: MAX_DOCS_PER_PROJECT per project; pinned tier total ≤ PINNED_TIER_TOKEN_CAP;
 * files ≤ 25MB (also enforced by the bucket's file_size_limit).
 */

import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { requireProject } from '@/lib/projects/auth'
import { processProjectDocument, PROJECT_DOCUMENTS_BUCKET } from '@/lib/projects/ingestion'
import { estimateTokens } from '@/lib/projects/chunker'
import {
  MAX_DOCS_PER_PROJECT,
  MAX_FILE_SIZE_BYTES,
  MAX_DOC_TOKENS,
  PINNED_TIER_TOKEN_CAP,
  canPinDocument,
} from '@/lib/projects/limits'

export const runtime = 'nodejs'
// Post-parse processing (LlamaParse poll + contextualization + embeddings)
// runs in this function's background via waitUntil.
export const maxDuration = 300

const MAX_TITLE_LENGTH = 200

// Document formats LlamaParse handles — mirrors the bucket's allowed_mime_types
// (no images/video: projects are a text-knowledge feature).
const SUPPORTED_MIME_TYPES = new Set<string>([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/rtf',
  'text/rtf',
  'application/epub+zip',
  'text/html',
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/x-markdown',
  'application/json',
])

const DOCUMENT_COLUMNS =
  'id, title, file_name, mime_type, source_type, tier, status, error_message, synopsis, token_count, created_at'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response
    const { service, project } = guard

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents, error } = await (service.from('project_documents') as any)
      .select(DOCUMENT_COLUMNS)
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[Projects] documents fetch failed:', error)
      return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 })
    }

    return NextResponse.json({ documents: documents || [] })
  } catch (error) {
    console.error('[Projects] GET documents error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Expected JSON body with { action }' }, { status: 400 })
    }

    switch (body?.action) {
      case 'init-upload':
        return initUpload(guard, body)
      case 'finalize':
        return finalizeUpload(guard, body)
      case 'text':
        return addText(guard, body)
      default:
        return NextResponse.json(
          { error: "action must be one of 'init-upload', 'finalize', 'text'" },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error('[Projects] POST documents error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

type Guard = Extract<Awaited<ReturnType<typeof requireProject>>, { ok: true }>

async function countDocuments(guard: Guard): Promise<number | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (guard.service.from('project_documents') as any)
    .select('id', { count: 'exact', head: true })
    .eq('project_id', guard.project.id)
  if (error) {
    console.error('[Projects] document count failed:', error)
    return null
  }
  return count ?? 0
}

async function initUpload(
  guard: Guard,
  body: { fileName?: unknown; mimeType?: unknown; fileSize?: unknown; title?: unknown },
) {
  const { service, project, userId } = guard

  const fileName = typeof body.fileName === 'string' ? body.fileName.trim() : ''
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : ''
  const fileSize = typeof body.fileSize === 'number' ? body.fileSize : NaN

  if (!fileName || !mimeType || !Number.isFinite(fileSize)) {
    return NextResponse.json(
      { error: 'Missing required fields: fileName, mimeType, fileSize' },
      { status: 400 },
    )
  }
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 })
  }
  if (fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` },
      { status: 400 },
    )
  }

  const docCount = await countDocuments(guard)
  if (docCount === null) {
    return NextResponse.json({ error: 'Failed to add document' }, { status: 500 })
  }
  if (docCount >= MAX_DOCS_PER_PROJECT) {
    return NextResponse.json(
      { error: `This project has reached the limit of ${MAX_DOCS_PER_PROJECT} documents.` },
      { status: 403 },
    )
  }

  const title =
    (typeof body.title === 'string' && body.title.trim()) || fileName
  // Row first — its id is the storage object name: {user_id}/{project_id}/{doc_id}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: doc, error: insertErr } = await (service.from('project_documents') as any)
    .insert({
      project_id: project.id,
      user_id: userId,
      title: title.slice(0, MAX_TITLE_LENGTH),
      file_name: fileName,
      mime_type: mimeType,
      source_type: 'file',
      tier: 'rag', // files start unpinned; pin later once token_count is known
      status: 'processing',
    })
    .select('id')
    .single()
  if (insertErr || !doc) {
    console.error('[Projects] document insert failed:', insertErr)
    return NextResponse.json({ error: 'Failed to add document' }, { status: 500 })
  }

  const storagePath = `${userId}/${project.id}/${doc.id}`
  const { data: signed, error: signErr } = await service.storage
    .from(PROJECT_DOCUMENTS_BUCKET)
    .createSignedUploadUrl(storagePath)
  if (signErr || !signed) {
    console.error('[Projects] createSignedUploadUrl failed:', signErr)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (service.from('project_documents') as any).delete().eq('id', doc.id)
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service.from('project_documents') as any)
    .update({ storage_path: storagePath })
    .eq('id', doc.id)

  return NextResponse.json(
    {
      documentId: doc.id,
      storagePath,
      uploadUrl: signed.signedUrl,
      token: signed.token,
    },
    { status: 201 },
  )
}

async function finalizeUpload(guard: Guard, body: { documentId?: unknown }) {
  const { service, project } = guard

  const documentId = typeof body.documentId === 'string' ? body.documentId : ''
  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: doc, error } = await (service.from('project_documents') as any)
    .select('id, project_id, source_type, storage_path, status')
    .eq('id', documentId)
    .eq('project_id', project.id) // ownership: project already verified
    .maybeSingle()
  if (error || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }
  if (doc.source_type !== 'file' || !doc.storage_path) {
    return NextResponse.json({ error: 'Document is not a file upload' }, { status: 400 })
  }

  // Verify the object actually landed in storage before burning a parse job.
  const lastSlash = doc.storage_path.lastIndexOf('/')
  const folder = doc.storage_path.slice(0, lastSlash)
  const basename = doc.storage_path.slice(lastSlash + 1)
  const { data: listed, error: listErr } = await service.storage
    .from(PROJECT_DOCUMENTS_BUCKET)
    .list(folder, { search: basename, limit: 1 })
  if (listErr || !listed || listed.length === 0) {
    return NextResponse.json(
      { error: 'File not found in storage — upload it before finalizing' },
      { status: 404 },
    )
  }

  waitUntil(processProjectDocument(documentId))

  return NextResponse.json({ documentId, status: 'processing' })
}

async function addText(
  guard: Guard,
  body: { title?: unknown; content?: unknown; tier?: unknown },
) {
  const { service, project, userId } = guard

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }
  if (!content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  const tokenCount = estimateTokens(content)
  if (tokenCount > MAX_DOC_TOKENS) {
    return NextResponse.json(
      { error: `Text is too long (~${tokenCount.toLocaleString()} tokens). Split it into smaller documents.` },
      { status: 400 },
    )
  }

  let tier: 'pinned' | 'rag' = 'rag'
  if (body.tier !== undefined) {
    if (body.tier !== 'pinned' && body.tier !== 'rag') {
      return NextResponse.json({ error: "tier must be 'pinned' or 'rag'" }, { status: 400 })
    }
    tier = body.tier
  }

  const docCount = await countDocuments(guard)
  if (docCount === null) {
    return NextResponse.json({ error: 'Failed to add document' }, { status: 500 })
  }
  if (docCount >= MAX_DOCS_PER_PROJECT) {
    return NextResponse.json(
      { error: `This project has reached the limit of ${MAX_DOCS_PER_PROJECT} documents.` },
      { status: 403 },
    )
  }

  if (tier === 'pinned') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pinnedDocs, error: pinErr } = await (service.from('project_documents') as any)
      .select('token_count')
      .eq('project_id', project.id)
      .eq('tier', 'pinned')
    if (pinErr) {
      console.error('[Projects] pinned token sum failed:', pinErr)
      return NextResponse.json({ error: 'Failed to add document' }, { status: 500 })
    }
    const pinnedTokens = ((pinnedDocs || []) as Array<{ token_count: number | null }>).reduce(
      (sum, d) => sum + (d.token_count || 0),
      0,
    )
    const check = canPinDocument(pinnedTokens, tokenCount)
    if (!check.ok) {
      return NextResponse.json(
        { error: check.reason, pinnedTokenCap: PINNED_TIER_TOKEN_CAP },
        { status: 400 },
      )
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: doc, error: insertErr } = await (service.from('project_documents') as any)
    .insert({
      project_id: project.id,
      user_id: userId,
      title: title.slice(0, MAX_TITLE_LENGTH),
      source_type: 'text',
      tier,
      status: 'processing',
      full_text: content,
      token_count: tokenCount,
    })
    .select(DOCUMENT_COLUMNS)
    .single()
  if (insertErr || !doc) {
    console.error('[Projects] text document insert failed:', insertErr)
    return NextResponse.json({ error: 'Failed to add document' }, { status: 500 })
  }

  waitUntil(processProjectDocument(doc.id))

  return NextResponse.json({ document: doc }, { status: 201 })
}

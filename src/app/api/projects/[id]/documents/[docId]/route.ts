/**
 * /api/projects/[id]/documents/[docId] — single-document operations.
 *
 * PATCH  → pin/unpin (token-cap checked) and/or rename
 * DELETE → remove row (chunks cascade) + storage object, refresh token rollup
 * POST   → retry processing for a failed document
 */

import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { requireProject } from '@/lib/projects/auth'
import {
  processProjectDocument,
  recomputeProjectTokenCount,
  PROJECT_DOCUMENTS_BUCKET,
} from '@/lib/projects/ingestion'
import { PINNED_TIER_TOKEN_CAP, canPinDocument } from '@/lib/projects/limits'

export const runtime = 'nodejs'
// POST retry re-runs the full ingestion pipeline via waitUntil.
export const maxDuration = 300

const MAX_TITLE_LENGTH = 200

const DOCUMENT_COLUMNS =
  'id, title, file_name, mime_type, source_type, tier, status, error_message, synopsis, token_count, created_at'

type RouteParams = { params: Promise<{ id: string; docId: string }> }

type Guard = Extract<Awaited<ReturnType<typeof requireProject>>, { ok: true }>

interface DocumentRow {
  id: string
  title: string
  source_type: 'file' | 'text'
  tier: 'pinned' | 'rag'
  status: 'processing' | 'ready' | 'failed'
  storage_path: string | null
  token_count: number
}

async function getDocument(guard: Guard, docId: string): Promise<DocumentRow | null> {
  if (!docId || !/^[0-9a-f-]{36}$/i.test(docId)) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (guard.service.from('project_documents') as any)
    .select('id, title, source_type, tier, status, storage_path, token_count')
    .eq('id', docId)
    .eq('project_id', guard.project.id) // ownership: project already verified
    .maybeSingle()
  if (error) {
    console.error('[Projects] document lookup failed:', error)
    return null
  }
  return (data as DocumentRow) || null
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, docId } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response
    const { service, project } = guard

    const doc = await getDocument(guard, docId)
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    let body: { tier?: unknown; title?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Expected JSON body' }, { status: 400 })
    }

    const updates: Record<string, string> = {}

    if (body.title !== undefined) {
      const title = typeof body.title === 'string' ? body.title.trim() : ''
      if (!title) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
      }
      updates.title = title.slice(0, MAX_TITLE_LENGTH)
    }

    if (body.tier !== undefined) {
      if (body.tier !== 'pinned' && body.tier !== 'rag') {
        return NextResponse.json({ error: "tier must be 'pinned' or 'rag'" }, { status: 400 })
      }
      if (body.tier === 'pinned' && doc.tier !== 'pinned') {
        if (doc.status !== 'ready') {
          return NextResponse.json(
            { error: 'Only ready documents can be pinned — wait for processing to finish' },
            { status: 400 },
          )
        }
        // Sum the OTHER pinned docs, then check the cap.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: pinnedDocs, error: pinErr } = await (service.from('project_documents') as any)
          .select('token_count')
          .eq('project_id', project.id)
          .eq('tier', 'pinned')
          .neq('id', doc.id)
        if (pinErr) {
          console.error('[Projects] pinned token sum failed:', pinErr)
          return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
        }
        const pinnedTokens = ((pinnedDocs || []) as Array<{ token_count: number | null }>).reduce(
          (sum, d) => sum + (d.token_count || 0),
          0,
        )
        const check = canPinDocument(pinnedTokens, doc.token_count || 0)
        if (!check.ok) {
          return NextResponse.json(
            { error: check.reason, pinnedTokenCap: PINNED_TIER_TOKEN_CAP },
            { status: 400 },
          )
        }
      }
      updates.tier = body.tier
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update — provide tier and/or title' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updErr } = await (service.from('project_documents') as any)
      .update(updates)
      .eq('id', doc.id)
      .select(DOCUMENT_COLUMNS)
      .single()
    if (updErr) {
      console.error('[Projects] document update failed:', updErr)
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
    }

    return NextResponse.json({ document: updated })
  } catch (error) {
    console.error('[Projects] PATCH document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, docId } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response
    const { service, project } = guard

    const doc = await getDocument(guard, docId)
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (doc.storage_path) {
      const { error: rmErr } = await service.storage
        .from(PROJECT_DOCUMENTS_BUCKET)
        .remove([doc.storage_path])
      if (rmErr) {
        console.warn('[Projects] storage remove failed during document delete:', rmErr)
      }
    }

    // Cascades to project_chunks.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delErr } = await (service.from('project_documents') as any)
      .delete()
      .eq('id', doc.id)
    if (delErr) {
      console.error('[Projects] document delete failed:', delErr)
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    await recomputeProjectTokenCount(service, project.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Projects] DELETE document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Retry processing for a failed document. */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, docId } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response

    const doc = await getDocument(guard, docId)
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    if (doc.status !== 'failed') {
      return NextResponse.json(
        { error: `Only failed documents can be retried (current status: ${doc.status})` },
        { status: 400 },
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (guard.service.from('project_documents') as any)
      .update({ status: 'processing', error_message: null })
      .eq('id', doc.id)

    waitUntil(processProjectDocument(doc.id))

    return NextResponse.json({ documentId: doc.id, status: 'processing' })
  } catch (error) {
    console.error('[Projects] POST retry document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

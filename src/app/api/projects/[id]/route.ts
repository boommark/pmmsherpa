/**
 * /api/projects/[id] — single-project operations.
 *
 * GET    → project + its documents (sans full_text)
 * PATCH  → update name / instructions / setup_state
 * DELETE → delete project (rows cascade) + its storage objects
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireProject } from '@/lib/projects/auth'
import { PROJECT_DOCUMENTS_BUCKET } from '@/lib/projects/ingestion'
import { validateSetupState } from '@/lib/projects/setup-state'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_NAME_LENGTH = 100
const MAX_INSTRUCTIONS_LENGTH = 10_000

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
      return NextResponse.json({ error: 'Failed to load project documents' }, { status: 500 })
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      instructions: project.instructions,
      totalTokenCount: project.total_token_count,
      setupState: project.setup_state ?? null,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      documents: documents || [],
    })
  } catch (error) {
    console.error('[Projects] GET /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response
    const { service, project } = guard

    let body: { name?: unknown; instructions?: unknown; setup_state?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Expected JSON body' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) {
        return NextResponse.json({ error: 'Project name cannot be empty' }, { status: 400 })
      }
      if (name.length > MAX_NAME_LENGTH) {
        return NextResponse.json(
          { error: `Project name must be ${MAX_NAME_LENGTH} characters or fewer` },
          { status: 400 },
        )
      }
      updates.name = name
    }

    if (body.instructions !== undefined) {
      if (body.instructions !== null && typeof body.instructions !== 'string') {
        return NextResponse.json({ error: 'instructions must be a string or null' }, { status: 400 })
      }
      const instructions =
        typeof body.instructions === 'string' ? body.instructions.trim() || null : null
      if (instructions && instructions.length > MAX_INSTRUCTIONS_LENGTH) {
        return NextResponse.json(
          { error: `Instructions must be ${MAX_INSTRUCTIONS_LENGTH.toLocaleString()} characters or fewer` },
          { status: 400 },
        )
      }
      updates.instructions = instructions
    }

    if (body.setup_state !== undefined) {
      const result = validateSetupState(body.setup_state)
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      updates.setup_state = result.state
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Nothing to update — provide name, instructions, and/or setup_state' },
        { status: 400 },
      )
    }
    updates.updated_at = new Date().toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error } = await (service.from('projects') as any)
      .update(updates)
      .eq('id', project.id)
      .select()
      .single()
    if (error) {
      console.error('[Projects] update failed:', error)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      instructions: updated.instructions,
      totalTokenCount: updated.total_token_count,
      setupState: updated.setup_state ?? null,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    })
  } catch (error) {
    console.error('[Projects] PATCH /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response
    const { service, project, userId } = guard

    // Remove storage objects first — once the rows are gone we'd lose the
    // paths. Path convention: {user_id}/{project_id}/{doc_id}
    const folder = `${userId}/${project.id}`
    const { data: objects, error: listErr } = await service.storage
      .from(PROJECT_DOCUMENTS_BUCKET)
      .list(folder, { limit: 1000 })
    if (listErr) {
      console.warn('[Projects] storage list failed during project delete:', listErr)
    } else if (objects && objects.length > 0) {
      const paths = objects.map((o) => `${folder}/${o.name}`)
      const { error: rmErr } = await service.storage.from(PROJECT_DOCUMENTS_BUCKET).remove(paths)
      if (rmErr) {
        console.warn('[Projects] storage remove failed during project delete:', rmErr)
      }
    }

    // Cascades to project_documents and project_chunks.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delErr } = await (service.from('projects') as any)
      .delete()
      .eq('id', project.id)
    if (delErr) {
      console.error('[Projects] delete failed:', delErr)
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Projects] DELETE /api/projects/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

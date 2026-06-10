/**
 * /api/projects — list and create projects.
 *
 * GET  → user's projects with document counts
 * POST → create a project (name required; capped at MAX_PROJECTS_PER_USER)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { MAX_PROJECTS_PER_USER } from '@/lib/projects/limits'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_NAME_LENGTH = 100
const MAX_INSTRUCTIONS_LENGTH = 10_000

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (service.from('projects') as any)
      .select('id, name, instructions, total_token_count, created_at, updated_at, project_documents(count)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[Projects] list failed:', error)
      return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      instructions: p.instructions,
      totalTokenCount: p.total_token_count,
      documentCount: p.project_documents?.[0]?.count ?? 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }))

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('[Projects] GET /api/projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { name?: unknown; instructions?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Expected JSON body with { name }' }, { status: 400 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }
    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Project name must be ${MAX_NAME_LENGTH} characters or fewer` },
        { status: 400 },
      )
    }

    let instructions: string | null = null
    if (body.instructions !== undefined && body.instructions !== null) {
      if (typeof body.instructions !== 'string') {
        return NextResponse.json({ error: 'instructions must be a string' }, { status: 400 })
      }
      instructions = body.instructions.trim() || null
      if (instructions && instructions.length > MAX_INSTRUCTIONS_LENGTH) {
        return NextResponse.json(
          { error: `Instructions must be ${MAX_INSTRUCTIONS_LENGTH.toLocaleString()} characters or fewer` },
          { status: 400 },
        )
      }
    }

    const service = await createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error: countErr } = await (service.from('projects') as any)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if (countErr) {
      console.error('[Projects] count failed:', countErr)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
    if ((count ?? 0) >= MAX_PROJECTS_PER_USER) {
      return NextResponse.json(
        { error: `You've reached the limit of ${MAX_PROJECTS_PER_USER} projects. Delete one to create another.` },
        { status: 403 },
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project, error: insertErr } = await (service.from('projects') as any)
      .insert({ user_id: user.id, name, instructions })
      .select()
      .single()
    if (insertErr) {
      console.error('[Projects] insert failed:', insertErr)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json(
      {
        id: project.id,
        name: project.name,
        instructions: project.instructions,
        totalTokenCount: project.total_token_count,
        documentCount: 0,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[Projects] POST /api/projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

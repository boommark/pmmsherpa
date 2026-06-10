/**
 * Shared auth + ownership guard for the Projects API routes.
 *
 * Pattern (matches the rest of the API surface): the user-scoped client
 * authenticates the caller; the service-role client does the data work.
 * Because the service client bypasses RLS, the ownership check here is
 * load-bearing — every project-scoped route must go through it.
 */

import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ProjectRow {
  id: string
  user_id: string
  name: string
  instructions: string | null
  total_token_count: number
  created_at: string
  updated_at: string
}

export type ProjectGuardResult =
  | {
      ok: true
      userId: string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      service: SupabaseClient<any>
      project: ProjectRow
    }
  | { ok: false; response: NextResponse }

/**
 * Authenticate the caller and verify they own `projectId`.
 * Returns 401 for unauthenticated callers and 404 (not 403 — don't leak
 * existence) when the project is missing or owned by someone else.
 */
export async function requireProject(projectId: string): Promise<ProjectGuardResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (!projectId || !/^[0-9a-f-]{36}$/i.test(projectId)) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid project id' }, { status: 400 }) }
  }

  const service = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error } = await (service.from('projects') as any)
    .select('*')
    .eq('id', projectId)
    .maybeSingle()

  if (error) {
    console.error('[Projects] project lookup failed:', error)
    return { ok: false, response: NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
  }
  if (!project || project.user_id !== user.id) {
    return { ok: false, response: NextResponse.json({ error: 'Project not found' }, { status: 404 }) }
  }

  return { ok: true, userId: user.id, service, project: project as ProjectRow }
}

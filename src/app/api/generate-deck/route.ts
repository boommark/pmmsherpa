import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAccessDecks, DECKS_UPGRADE_MESSAGE } from '@/lib/artifacts/gate'
import { getEffectiveTier } from '@/lib/constants'
import { generateDeck } from '@/lib/artifacts/index'
import { ARTIFACT_TYPES, type ArtifactType } from '@/lib/artifacts/prompts/index'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch tier — cast needed due to Supabase generic schema constraints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('tier, starter_access_until')
      .eq('id', user.id)
      .single() as { data: { tier: string; starter_access_until: string | null } | null; error: unknown }

    const effectiveTier = profile ? getEffectiveTier(profile.tier, profile.starter_access_until) : null
    if (!effectiveTier || !canAccessDecks(effectiveTier)) {
      return NextResponse.json(
        { error: DECKS_UPGRADE_MESSAGE, code: 'UPGRADE_REQUIRED' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { artifactType, conversationId, userContext } = body as {
      artifactType: string
      conversationId: string
      userContext: string
    }

    // Validate artifact type
    if (!ARTIFACT_TYPES.includes(artifactType as ArtifactType)) {
      return NextResponse.json({ error: 'Invalid artifact type' }, { status: 400 })
    }
    if (!conversationId || !userContext?.trim()) {
      return NextResponse.json({ error: 'Missing conversationId or userContext' }, { status: 400 })
    }

    // Load recent conversation messages for context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: messages } = await (supabase as any)
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(12) as { data: Array<{ role: string; content: string }> | null; error: unknown }

    const conversationHistory = (messages ?? [])
      .reverse()
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content ?? '' }))

    // Generate
    const result = await generateDeck({
      artifactType: artifactType as ArtifactType,
      userId: user.id,
      conversationId,
      userContext,
      conversationHistory,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[generate-deck]', err)
    return NextResponse.json(
      { error: 'Generation failed. Please try again.' },
      { status: 500 }
    )
  }
}

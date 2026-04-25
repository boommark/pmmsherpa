import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Deck } from '@/types/database'

export const runtime = 'nodejs'

type DeckListRow = Pick<Deck, 'id' | 'title' | 'artifact_type' | 'format' | 'download_count' | 'created_at' | 'conversation_id'>

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: decks, error } = await (supabase as any)
    .from('decks')
    .select('id, title, artifact_type, format, download_count, created_at, conversation_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50) as { data: DeckListRow[] | null; error: unknown }

  if (error) return NextResponse.json({ error: (error as { message?: string })?.message ?? 'DB error' }, { status: 500 })

  return NextResponse.json({ decks })
}

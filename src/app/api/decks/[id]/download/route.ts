import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Deck } from '@/types/database'

export const runtime = 'nodejs'

type DeckRow = Pick<Deck, 'id' | 'storage_path' | 'title' | 'artifact_type' | 'format' | 'download_count'>

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch deck (RLS ensures user can only access their own)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deck, error } = await (supabase as any)
    .from('decks')
    .select('id, storage_path, title, artifact_type, format, download_count')
    .eq('id', id)
    .single() as { data: DeckRow | null; error: unknown }

  if (error || !deck) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!deck.storage_path) return NextResponse.json({ error: 'No file stored yet' }, { status: 404 })

  // Generate signed URL (1 hour)
  const serviceClient = await createServiceClient()
  const { data: signedData, error: signedError } = await serviceClient.storage
    .from('decks')
    .createSignedUrl(deck.storage_path, 3600)

  if (signedError || !signedData) {
    return NextResponse.json({ error: 'Could not generate download URL' }, { status: 500 })
  }

  // Increment download count (best-effort)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (serviceClient as any)
    .from('decks')
    .update({ download_count: (deck.download_count ?? 0) + 1 })
    .eq('id', id)
    .catch(() => {})

  return NextResponse.json({
    url: signedData.signedUrl,
    title: deck.title,
    artifactType: deck.artifact_type,
    format: deck.format,
  })
}

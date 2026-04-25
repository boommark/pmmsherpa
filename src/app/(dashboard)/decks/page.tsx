'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, LayoutTemplate, ArrowUpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DeckCard } from '@/components/artifacts/DeckCard'
import { useProfile } from '@/hooks/useSupabase'

interface DeckRecord {
  id: string
  title: string
  artifact_type: string
  format: 'slide' | 'document'
  download_count: number
  created_at: string
  conversation_id: string | null
  slide_count?: number
  page_count?: number
}

function DeckCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/4 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  )
}

export default function DecksPage() {
  const [decks, setDecks] = useState<DeckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const { profile } = useProfile()

  const isPaidUser = profile?.tier === 'starter' || profile?.tier === 'founder'

  useEffect(() => {
    async function fetchDecks() {
      try {
        const res = await fetch('/api/decks')
        if (!res.ok) return
        const data = await res.json() as { decks: DeckRecord[] }
        setDecks(data.decks ?? [])
      } finally {
        setLoading(false)
      }
    }
    fetchDecks()
  }, [])

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
        }),
      })
      const data = await res.json() as { url?: string }
      if (data.url) window.location.href = data.url
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Decks</h1>
        <p className="text-muted-foreground">
          Slide decks and documents generated from your conversations.
        </p>
      </div>

      {/* Upgrade banner for free users */}
      {!loading && !isPaidUser && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-[#d8e2ff]/60 dark:bg-[#0058be]/10 border border-[#0058be]/20 px-5 py-4 gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0058be] dark:text-[#a8c0f0] mb-0.5">
              Starter feature
            </p>
            <p className="text-sm text-muted-foreground">
              Upgrade to generate slide decks and documents from your chat conversations.
            </p>
          </div>
          <Button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="shrink-0 bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none gap-1.5"
          >
            <ArrowUpCircle className="h-4 w-4" />
            {upgrading ? 'Redirecting…' : 'Upgrade to Starter'}
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <DeckCardSkeleton key={i} />
          ))}
        </div>
      ) : decks.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-2xl bg-[#d8e2ff]/40 dark:bg-[#0058be]/10 p-5 mb-5">
            <LayoutTemplate className="h-10 w-10 text-[#0058be]" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No decks yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Start a conversation and use the artifact button to generate your first deck.
          </p>
          <Link href="/chat">
            <Button className="bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none">
              Start a conversation
            </Button>
          </Link>
        </div>
      ) : (
        /* Decks grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deckId={deck.id}
              title={deck.title}
              artifactType={deck.artifact_type}
              format={deck.format}
              slideCount={deck.slide_count}
              pageCount={deck.page_count}
            />
          ))}
        </div>
      )}
    </div>
  )
}

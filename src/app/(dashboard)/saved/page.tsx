'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bookmark, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Message, SavedResponse } from '@/types/database'

interface SavedResponseWithMessage extends SavedResponse {
  message: Message
}

export default function SavedPage() {
  const [savedResponses, setSavedResponses] = useState<SavedResponseWithMessage[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSaved = async () => {
      const { data } = await supabase
        .from('saved_responses')
        .select(`
          *,
          message:messages(*)
        `)
        .order('created_at', { ascending: false })

      if (data) {
        setSavedResponses(data as unknown as SavedResponseWithMessage[])
      }
      setLoading(false)
    }

    fetchSaved()
  }, [supabase])

  const handleRemove = async (id: string) => {
    await supabase.from('saved_responses').delete().eq('id', id)
    setSavedResponses((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Saved Responses</h1>
        <p className="text-muted-foreground">
          Your bookmarked responses from PMMSherpa for quick reference
        </p>
      </div>

      {savedResponses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No saved responses yet</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              When chatting with PMMSherpa, you can save helpful responses by clicking
              the bookmark icon on any message.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {savedResponses.map((saved) => (
              <Card key={saved.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {saved.note || 'Saved response'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {saved.message?.model === 'claude' ? 'Claude' : 'Gemini'}
                        </Badge>
                        <span>
                          {new Date(saved.created_at).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/chat/${saved.message?.conversation_id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemove(saved.id)}
                      >
                        <Bookmark className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {saved.message?.content}
                  </p>
                  {saved.tags && saved.tags.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {saved.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

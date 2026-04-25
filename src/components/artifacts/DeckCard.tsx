'use client'

import { useState } from 'react'
import { LayoutTemplate, FileText, ExternalLink, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DeckCardProps {
  deckId: string
  title: string
  artifactType: string
  format: 'slide' | 'document'
  slideCount?: number
  pageCount?: number
  className?: string
}

export function DeckCard({
  deckId,
  title,
  artifactType: _artifactType,
  format,
  slideCount,
  pageCount,
  className,
}: DeckCardProps) {
  const [viewLoading, setViewLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const isSlide = format === 'slide'
  const Icon = isSlide ? LayoutTemplate : FileText

  const countLabel = isSlide
    ? slideCount !== undefined
      ? `${slideCount} slide${slideCount === 1 ? '' : 's'}`
      : null
    : pageCount !== undefined
    ? `${pageCount} page${pageCount === 1 ? '' : 's'}`
    : null

  const formatLabel = isSlide ? 'Slide Deck' : 'Document'

  async function getSignedUrl(): Promise<string> {
    const res = await fetch(`/api/decks/${deckId}/download`)
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(err.error ?? 'Failed to load deck')
    }
    const data = await res.json() as { url: string }
    return data.url
  }

  const handleView = async () => {
    const win = window.open('', '_blank')
    setViewLoading(true)
    try {
      const url = await getSignedUrl()
      if (win) win.location.href = url
      else window.open(url, '_blank')
    } catch (error) {
      win?.close()
      toast.error(error instanceof Error ? error.message : 'Failed to open deck')
    } finally {
      setViewLoading(false)
    }
  }

  const handleSaveAsPdf = async () => {
    const win = window.open('', '_blank')
    setPdfLoading(true)
    try {
      const url = await getSignedUrl()
      const pdfUrl = url + (url.includes('?') ? '&' : '?') + 'print=1'
      if (win) win.location.href = pdfUrl
      else window.open(pdfUrl, '_blank')
    } catch (error) {
      win?.close()
      toast.error(error instanceof Error ? error.message : 'Failed to open deck')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-[#0058be]/20 bg-[#0058be]/[0.03] p-4 flex flex-col gap-3 max-w-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Icon className="h-5 w-5 text-[#0058be]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug truncate" title={title}>
            {title}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 bg-[#d8e2ff] text-[#0058be] border-0 font-medium"
            >
              {formatLabel}
            </Badge>
            {countLabel && (
              <span className="text-[11px] text-muted-foreground">{countLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleView}
          disabled={viewLoading || pdfLoading}
          className="flex-1 h-8 text-xs bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none gap-1.5"
        >
          {viewLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSaveAsPdf}
          disabled={viewLoading || pdfLoading}
          className="flex-1 h-8 text-xs gap-1.5"
        >
          {pdfLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Save as PDF
        </Button>
      </div>
    </div>
  )
}

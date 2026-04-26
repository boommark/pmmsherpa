'use client'

import { useState } from 'react'
import { Globe, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { ExpandedResearchDb } from '@/types/database'

function safeHostname(url: string | null | undefined): string {
  if (!url) return ''
  try { return new URL(url).hostname.replace('www.', '') } catch { return '' }
}

interface WebSourcesProps {
  expandedResearch: ExpandedResearchDb
}

export function WebSources({ expandedResearch }: WebSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const citations = expandedResearch.webCitations

  const validCitations = (citations || []).filter(c => c.url)
  if (!validCitations.length) return null

  return (
    <div className="mt-3">
      {/* Sources button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0058be]/10 dark:bg-[#0058be]/15 text-[#0058be] dark:text-[#a8c0f0] text-xs font-medium hover:bg-[#0058be]/15 dark:hover:bg-[#0058be]/25 transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{validCitations.length} source{validCitations.length !== 1 ? 's' : ''}</span>
        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {/* Expanded sources list */}
      {isExpanded && (
        <div className="mt-2 space-y-1.5 max-w-xl">
          {validCitations.map((citation, i) => (
            <a
              key={i}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-[#0058be]/30 hover:shadow-sm transition-all group"
            >
              {/* Favicon */}
              <div className="shrink-0 mt-0.5 w-5 h-5 rounded bg-muted flex items-center justify-center overflow-hidden">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${safeHostname(citation.url)}&sz=32`}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Domain */}
                <p className="text-[11px] text-muted-foreground truncate">
                  {safeHostname(citation.url)}
                </p>
                {/* Title */}
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-1 group-hover:text-[#0058be] transition-colors">
                  {citation.title}
                </p>
                {/* Snippet */}
                {citation.snippet && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {citation.snippet}
                  </p>
                )}
              </div>

              <ExternalLink className="shrink-0 h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-[#0058be] transition-colors mt-1" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, MessageSquare, ChevronDown, ExternalLink } from 'lucide-react'
import type { Citation } from '@/types/database'

interface SourceCitationsProps {
  citations: Citation[]
}

const sourceTypeConfig = {
  book: {
    icon: BookOpen,
    label: 'Book',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  blog: {
    icon: FileText,
    label: 'PMA Blog',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  ama: {
    icon: MessageSquare,
    label: 'AMA',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
}

export function SourceCitations({ citations }: SourceCitationsProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!citations || citations.length === 0) return null

  // Deduplicate citations by source (title)
  const uniqueCitations = citations.reduce((acc, citation) => {
    const key = `${citation.source}-${citation.author || ''}-${citation.page_number || ''}`
    if (!acc.has(key)) {
      acc.set(key, citation)
    }
    return acc
  }, new Map<string, Citation>())

  const deduplicatedCitations = Array.from(uniqueCitations.values())

  // Group citations by source type
  const groupedCitations = deduplicatedCitations.reduce((acc, citation) => {
    const type = citation.source_type
    if (!acc[type]) acc[type] = []
    acc[type].push(citation)
    return acc
  }, {} as Record<string, Citation[]>)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full overflow-hidden">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 text-[10px] sm:text-xs hover:bg-transparent p-0 h-auto">
          <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary shrink-0" />
          <span className="text-primary font-medium">
            {deduplicatedCitations.length} source{deduplicatedCitations.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            className={`h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform text-primary shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 sm:mt-1.5 md:mt-2">
        <div className="space-y-1.5 sm:space-y-2 md:space-y-3 text-[10px] sm:text-xs md:text-sm border-l-2 border-primary/20 pl-1.5 sm:pl-2 md:pl-3 overflow-hidden">
          {Object.entries(groupedCitations).map(([type, typeCitations]) => {
            const config = sourceTypeConfig[type as keyof typeof sourceTypeConfig]
            const Icon = config.icon

            return (
              <div key={type} className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
                    {config.label}s ({typeCitations.length})
                  </span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 pl-3 sm:pl-4 md:pl-5">
                  {typeCitations.map((citation, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs min-w-0"
                    >
                      <Badge variant="outline" className={`text-[8px] sm:text-[10px] shrink-0 px-1 py-0 sm:px-1.5 sm:py-0.5 ${config.color}`}>
                        {config.label}
                      </Badge>
                      <div className="flex-1 min-w-0 break-words">
                        <span className="font-semibold text-foreground">
                          &ldquo;{citation.source}&rdquo;
                        </span>
                        {citation.author && (
                          <span className="text-muted-foreground"> by <span className="font-medium text-foreground">{citation.author}</span></span>
                        )}
                        {citation.speaker_role && (
                          <span className="text-muted-foreground">, <span className="font-medium text-foreground">{citation.speaker_role}</span></span>
                        )}
                        {citation.page_number && (
                          <span className="text-muted-foreground"> (p. {citation.page_number})</span>
                        )}
                        {citation.section_title && (
                          <span className="text-muted-foreground block mt-0.5 truncate">Section: {citation.section_title}</span>
                        )}
                        {citation.question && (
                          <span className="text-muted-foreground block mt-0.5 italic line-clamp-2">Q: &ldquo;{citation.question}&rdquo;</span>
                        )}
                        {citation.url && (
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center ml-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

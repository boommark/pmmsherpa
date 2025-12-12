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
  const [isOpen, setIsOpen] = useState(false)

  if (!citations || citations.length === 0) return null

  // Group citations by source type
  const groupedCitations = citations.reduce((acc, citation) => {
    const type = citation.source_type
    if (!acc[type]) acc[type] = []
    acc[type].push(citation)
    return acc
  }, {} as Record<string, Citation[]>)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-xs">
          <span className="text-muted-foreground">
            {citations.length} source{citations.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="space-y-3 text-sm">
          {Object.entries(groupedCitations).map(([type, typeCitations]) => {
            const config = sourceTypeConfig[type as keyof typeof sourceTypeConfig]
            const Icon = config.icon

            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {config.label}s ({typeCitations.length})
                  </span>
                </div>
                <div className="space-y-1 pl-5">
                  {typeCitations.map((citation, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                        {config.label}
                      </Badge>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          {citation.source}
                        </span>
                        {citation.author && (
                          <span> by {citation.author}</span>
                        )}
                        {citation.page_number && (
                          <span> (Page {citation.page_number})</span>
                        )}
                        {citation.section_title && (
                          <span> - {citation.section_title}</span>
                        )}
                        {citation.question && (
                          <span className="italic"> &ldquo;{citation.question}&rdquo;</span>
                        )}
                        {citation.url && (
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center ml-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
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

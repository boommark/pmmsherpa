'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Globe, ChevronDown, ChevronUp, ExternalLink, Sparkles, Search } from 'lucide-react'
import type { ExpandedResearch as ExpandedResearchType } from '@/types/chat'

interface ExpandedResearchProps {
  research: ExpandedResearchType
}

export function ExpandedResearch({ research }: ExpandedResearchProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showCitations, setShowCitations] = useState(false)

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between h-auto py-2 px-3 hover:bg-primary/5"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-md",
                research.researchType === 'deep'
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-blue-100 dark:bg-blue-900/30"
              )}>
                {research.researchType === 'deep' ? (
                  <Sparkles className={cn(
                    "h-3.5 w-3.5",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                ) : (
                  <Search className={cn(
                    "h-3.5 w-3.5",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                )}
              </div>
              <span className="text-sm font-medium">
                {research.researchType === 'deep' ? 'Deep Research' : 'Web Research'}
              </span>
              {research.webCitations.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({research.webCitations.length} sources)
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-2">
          <div className={cn(
            "rounded-lg px-3 py-2 text-sm",
            research.researchType === 'deep'
              ? "bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30"
              : "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30"
          )}>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold mt-3 mb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  p: ({ children }) => <p className="my-2">{children}</p>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "underline decoration-dotted hover:decoration-solid",
                        research.researchType === 'deep'
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {children}
                    </a>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    )
                  },
                }}
              >
                {research.content}
              </ReactMarkdown>
            </div>

            {/* Web Citations */}
            {research.webCitations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <Collapsible open={showCitations} onOpenChange={setShowCitations}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1.5"
                    >
                      <Globe className="h-3 w-3" />
                      Web Sources ({research.webCitations.length})
                      {showCitations ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="space-y-2">
                      {research.webCitations.map((citation, index) => (
                        <a
                          key={index}
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded-md bg-background/50 hover:bg-background transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium truncate">
                                {citation.title}
                              </span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {citation.snippet && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {citation.snippet}
                              </p>
                            )}
                            <span className="text-xs text-muted-foreground/70 truncate block mt-0.5">
                              {new URL(citation.url).hostname}
                              {citation.date && ` • ${citation.date}`}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Related Questions */}
            {research.relatedQuestions && research.relatedQuestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Related questions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {research.relatedQuestions.slice(0, 3).map((question, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-background/50 text-muted-foreground"
                    >
                      {question}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

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
    <div className="mt-2 sm:mt-3 border-t border-border/50 pt-2 sm:pt-3 overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between h-auto py-1.5 sm:py-2 px-2 sm:px-3 hover:bg-primary/5"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className={cn(
                "p-1 sm:p-1.5 rounded-md shrink-0",
                research.researchType === 'deep'
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-blue-100 dark:bg-blue-900/30"
              )}>
                {research.researchType === 'deep' ? (
                  <Sparkles className={cn(
                    "h-3 w-3 sm:h-3.5 sm:w-3.5",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                ) : (
                  <Search className={cn(
                    "h-3 w-3 sm:h-3.5 sm:w-3.5",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">
                {research.researchType === 'deep' ? 'Deep Research' : 'Web Research'}
              </span>
              {research.webCitations.length > 0 && (
                <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                  ({research.webCitations.length})
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-1.5 sm:pt-2">
          <div className={cn(
            "rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm overflow-hidden",
            research.researchType === 'deep'
              ? "bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30"
              : "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30"
          )}>
            <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden [&_*]:break-words">
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
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/30">
                <Collapsible open={showCitations} onOpenChange={setShowCitations}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-1 sm:gap-1.5"
                    >
                      <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">Web Sources</span>
                      <span className="sm:hidden">Sources</span> ({research.webCitations.length})
                      {showCitations ? (
                        <ChevronUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      ) : (
                        <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-1.5 sm:pt-2">
                    <div className="space-y-1.5 sm:space-y-2">
                      {research.webCitations.map((citation, index) => (
                        <a
                          key={index}
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-md bg-background/50 hover:bg-background transition-colors group"
                        >
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <span className="text-[10px] sm:text-xs font-medium truncate">
                                {citation.title}
                              </span>
                              <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {citation.snippet && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {citation.snippet}
                              </p>
                            )}
                            <span className="text-[10px] sm:text-xs text-muted-foreground/70 truncate block mt-0.5">
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
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/30">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2">
                  Related questions:
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {research.relatedQuestions.slice(0, 3).map((question, index) => (
                    <span
                      key={index}
                      className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-background/50 text-muted-foreground line-clamp-1"
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

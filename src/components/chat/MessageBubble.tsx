'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SourceCitations } from './SourceCitations'
import { ExpandedResearch } from './ExpandedResearch'
import { User, Bot, Loader2, Copy, ChevronDown, FileText, Type, Pencil, Check, Sparkles, Search, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'
import { copyAsMarkdown, copyAsPlainText, copyForGoogleDocs, type CopyOptions } from '@/lib/utils/clipboard'
import type { ChatMessage } from '@/types/chat'
import type { Citation } from '@/types/database'
import { useVoiceOutput } from '@/hooks/useVoiceOutput'

interface MessageBubbleProps {
  message: ChatMessage
  messageIndex?: number
  onEditPrompt?: (content: string, messageIndex: number) => void
  onExpandWithResearch?: (messageId: string, content: string, deepResearch: boolean) => void
}

export function MessageBubble({ message, messageIndex, onEditPrompt, onExpandWithResearch }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming
  const isResearching = message.isResearching
  const [copied, setCopied] = useState(false)

  // Voice output hook
  const { isPlaying, isLoading: isVoiceLoading, speak, stop } = useVoiceOutput({
    onError: (error) => {
      toast.error(`Voice playback failed: ${error.message}`)
    }
  })

  const handleSpeak = () => {
    if (isPlaying) {
      stop()
    } else {
      speak(message.content)
    }
  }

  // Build copy options to include citations and research when copying assistant messages
  const copyOptions: CopyOptions | undefined = !isUser ? {
    citations: message.citations as Citation[] | undefined,
    expandedResearch: message.expandedResearch,
  } : undefined

  const handleCopy = async (format: 'markdown' | 'plain' | 'gdocs') => {
    try {
      switch (format) {
        case 'markdown':
          await copyAsMarkdown(message.content, copyOptions)
          toast.success('Copied as Markdown')
          break
        case 'plain':
          await copyAsPlainText(message.content, copyOptions)
          toast.success('Copied as plain text')
          break
        case 'gdocs':
          await copyForGoogleDocs(message.content, copyOptions)
          toast.success('Copied for Google Docs')
          break
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleEdit = () => {
    if (onEditPrompt && messageIndex !== undefined) {
      onEditPrompt(message.content, messageIndex)
    }
  }

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-2.5 md:gap-3 group w-full overflow-hidden',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className={cn('h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 shrink-0', isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-secondary')}>
        <AvatarFallback>
          {isUser ? (
            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          ) : (
            <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'flex flex-col min-w-0 max-w-[calc(100%-2.5rem)] sm:max-w-[calc(100%-3rem)] md:max-w-[85%] space-y-1 sm:space-y-1.5 md:space-y-2 overflow-hidden',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-4 md:py-2.5 w-full relative overflow-hidden',
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
              : 'bg-muted text-foreground'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden [&_*]:break-words [word-break:break-word]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Style markdown elements
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  p: ({ children }) => <p className="my-2">{children}</p>,
                  code: ({ className, children }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="bg-black/10 dark:bg-white/10 p-2 sm:p-3 rounded-lg overflow-x-auto my-2 text-xs sm:text-sm">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2 -mx-2 sm:mx-0 max-w-[calc(100vw-5rem)] sm:max-w-full rounded-md border border-border">
                      <table className="w-full border-collapse text-xs sm:text-sm min-w-full">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-1.5 py-1 sm:px-3 sm:py-2 bg-muted font-medium text-left text-xs sm:text-sm break-words">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-1.5 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm break-words">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 my-2 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-flex items-center ml-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons - always visible on mobile, hover on desktop */}
        {!isStreaming && (
          <div className={cn(
            'flex items-center gap-0.5 sm:gap-1 transition-opacity',
            isUser ? 'flex-row-reverse' : 'flex-row',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground gap-0.5 sm:gap-1"
                >
                  {copied ? (
                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  ) : (
                    <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  )}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleCopy('markdown')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Copy as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopy('plain')}>
                  <Type className="h-4 w-4 mr-2" />
                  Copy as Plain Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopy('gdocs')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Copy for Google Docs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Voice playback button - only for assistant messages */}
            {!isUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                disabled={isVoiceLoading}
                className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground gap-0.5 sm:gap-1"
              >
                {isVoiceLoading ? (
                  <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                ) : (
                  <Volume2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                )}
                <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Listen'}</span>
              </Button>
            )}
            {isUser && onEditPrompt && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground"
                onClick={handleEdit}
              >
                <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
          </div>
        )}

        {/* Citations - only show after streaming completes */}
        {!isUser && !isStreaming && message.citations && message.citations.length > 0 && (
          <SourceCitations citations={message.citations} />
        )}

        {/* Expanded Research - only show after streaming completes */}
        {!isUser && !isStreaming && message.expandedResearch && (
          <ExpandedResearch research={message.expandedResearch} />
        )}

        {/* Expand with Research button */}
        {!isUser && !isStreaming && !message.expandedResearch && onExpandWithResearch && (
          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isResearching}
                  className="h-6 sm:h-7 px-1.5 sm:px-2.5 text-[10px] sm:text-xs gap-1 sm:gap-1.5 border-dashed"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                      <span className="hidden sm:inline">Researching...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">Expand with Research</span>
                      <span className="sm:hidden">Research</span>
                      <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => onExpandWithResearch(message.id, message.content, false)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Quick Search
                  <span className="ml-auto text-xs text-muted-foreground">~5s</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExpandWithResearch(message.id, message.content, true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Deep Research
                  <span className="ml-auto text-xs text-muted-foreground">~30s</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Model indicator */}
        {!isUser && message.model && !isStreaming && (
          <span className="text-xs text-muted-foreground">
            {message.model === 'claude' ? 'Claude Opus 4.5' : 'Gemini 2.5 Pro'}
          </span>
        )}
      </div>
    </div>
  )
}

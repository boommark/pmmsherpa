'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Pencil, Check, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'
import { copyForGoogleDocs, type CopyOptions } from '@/lib/utils/clipboard'
import type { ChatMessage } from '@/types/chat'
import type { Citation } from '@/types/database'
import { useVoiceOutput } from '@/hooks/useVoiceOutput'

interface MessageBubbleProps {
  message: ChatMessage
  messageIndex?: number
  onEditPrompt?: (content: string, messageIndex: number) => void
}

export function MessageBubble({ message, messageIndex, onEditPrompt }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming
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

  const copyOptions: CopyOptions | undefined = !isUser ? {
    citations: message.citations as Citation[] | undefined,
    expandedResearch: message.expandedResearch,
  } : undefined

  const handleCopy = async () => {
    try {
      await copyForGoogleDocs(message.content, copyOptions)
      setCopied(true)
      toast.success('Copied')
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

  const getModelName = (model: string) => {
    switch (model) {
      case 'claude': return 'Claude Sonnet 4.6'
      case 'gemini': return 'Gemini 3.1 Pro'
      default: return model
    }
  }

  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-2.5 md:gap-3 group w-full overflow-hidden',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex flex-col min-w-0 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] space-y-1 sm:space-y-1.5 md:space-y-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 md:px-5 md:py-3.5 w-full relative',
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
              : 'bg-muted text-foreground'
          )}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm sm:text-base break-words overflow-wrap-anywhere">{message.content}</p>
          ) : (
            <div
              className="prose prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:leading-relaxed"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-semibold mt-6 mb-3">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mt-5 mb-2.5">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mt-4 mb-2">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 my-3 space-y-1.5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 my-3 space-y-1.5">{children}</ol>
                  ),
                  li: ({ children }) => <li className="my-1 break-words">{children}</li>,
                  p: ({ children }) => <p className="my-3 break-words">{children}</p>,
                  a: ({ children, href }) => (
                    <a href={href} className="text-primary underline break-all" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  code: ({ className, children }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-sm break-all">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="bg-black/10 dark:bg-white/10 p-3 sm:p-4 rounded-lg overflow-x-auto my-4 text-xs sm:text-sm">
                      {children}
                    </pre>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 -mx-2 sm:mx-0 max-w-[calc(100vw-5rem)] sm:max-w-full rounded-md border border-border">
                      <table className="w-full border-collapse text-xs sm:text-sm min-w-full">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 bg-muted font-medium text-left text-xs sm:text-sm break-words">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm break-words">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/40 pl-4 my-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  hr: () => (
                    <hr className="my-5 border-border/50" />
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

        {/* Action buttons */}
        {!isStreaming && (
          <div className={cn(
            'flex items-center gap-0.5 sm:gap-1 transition-opacity',
            isUser ? 'flex-row-reverse' : 'flex-row',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground gap-0.5 sm:gap-1"
            >
              {copied ? (
                <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              ) : (
                <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </Button>
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

        {/* Model indicator */}
        {!isUser && message.model && !isStreaming && (
          <span className="text-xs text-muted-foreground">
            {getModelName(message.model)}
          </span>
        )}
      </div>
    </div>
  )
}

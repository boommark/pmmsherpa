'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Pencil, Check, Volume2, VolumeX, FileText, Image as ImageIcon, Film, File, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { copyForGoogleDocs, type CopyOptions } from '@/lib/utils/clipboard'
import type { ChatMessage } from '@/types/chat'
import type { Citation, ExpandedResearchDb } from '@/types/database'
import { useVoiceOutput } from '@/hooks/useVoiceOutput'
import { useProfile } from '@/hooks/useSupabase'
import { WebSources } from './WebSources'
import { DeckCard } from '@/components/artifacts/DeckCard'

interface MessageBubbleProps {
  message: ChatMessage
  messageIndex?: number
  onEditPrompt?: (content: string, messageIndex: number) => void
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return ImageIcon
  if (fileType.startsWith('video/')) return Film
  if (fileType === 'application/pdf' || fileType.includes('word') || fileType === 'text/plain') return FileText
  return File
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MessageBubble({ message, messageIndex, onEditPrompt }: MessageBubbleProps) {
  // All hooks must be called unconditionally before any early returns
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming
  const [copied, setCopied] = useState(false)
  const { profile } = useProfile()
  const isPaidUser = profile?.tier === 'starter' || profile?.tier === 'founder'

  const { isPlaying, isLoading: isVoiceLoading, speak, stop } = useVoiceOutput({
    onError: (error) => {
      toast.error(`Voice playback failed: ${error.message}`)
    }
  })

  // Deck card rendering — after hooks to satisfy Rules of Hooks
  if (message.deck) {
    return (
      <div className="px-4 py-2">
        <DeckCard
          deckId={message.deck.deckId}
          title={message.deck.title}
          artifactType={message.deck.artifactType}
          format={message.deck.format}
          slideCount={message.deck.slideCount}
          pageCount={message.deck.pageCount}
        />
      </div>
    )
  }

  // Loading state while deck is being generated
  if (isStreaming && !message.content && !message.deck) {
    return (
      <div className="px-4 py-3 flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-[#0058be]" />
        <span>Generating artifact...</span>
      </div>
    )
  }

  const handleSpeak = () => {
    if (isPlaying) {
      stop()
    } else {
      speak(message.content)
    }
  }

  // Citations and research excluded from clipboard — clean copy for users
  const copyOptions: CopyOptions | undefined = undefined

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

  // User messages: Precision Blue bubble, right-aligned
  if (isUser) {
    return (
      <div className="flex justify-end group w-full overflow-hidden">
        <div className="flex flex-col items-end min-w-0 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] space-y-1">
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {message.attachments.map((att) => {
                const Icon = getFileIcon(att.fileType)
                const isImage = att.fileType.startsWith('image/')
                return (
                  <a
                    key={att.id}
                    href={att.storagePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-white text-xs group/att cursor-pointer"
                    title={`Open ${att.fileName}`}
                  >
                    {isImage && att.storagePath ? (
                      <img src={att.storagePath} alt={att.fileName} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    )}
                    <span className="truncate max-w-[140px]">{att.fileName}</span>
                    <span className="opacity-60 shrink-0">{formatFileSize(att.fileSize)}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/att:opacity-60 shrink-0 transition-opacity" />
                  </a>
                )
              })}
            </div>
          )}
          <div
            className="rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 bg-[#0058be] text-white"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{message.content}</p>
          </div>
          {onEditPrompt && (
            <div className="flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground"
                onClick={handleEdit}
              >
                <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Assistant messages: full-width, editorial layout
  return (
    <div className="group w-full overflow-hidden">
      <div
        className="w-full max-w-none px-1 sm:px-0"
        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
      >
        <div className="prose prose-base dark:prose-invert max-w-none prose-p:leading-[1.85] prose-li:leading-[1.75] text-[15px] sm:text-base">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl sm:text-2xl font-semibold mt-10 mb-4 tracking-tight">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg sm:text-xl font-semibold mt-9 mb-3.5 tracking-tight">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base sm:text-lg font-semibold mt-7 mb-3">{children}</h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-5 space-y-3">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 my-5 space-y-3">{children}</ol>
              ),
              li: ({ children }) => <li className="my-1.5 break-words pl-1">{children}</li>,
              p: ({ children }) => <p className="my-5 break-words">{children}</p>,
              a: ({ children, href }) => (
                <a href={href} className="text-[#0058be] dark:text-[#a8c0f0] underline underline-offset-2 break-all" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ className, children }) => {
                const isInline = !className
                return isInline ? (
                  <code className="bg-surface-container-low dark:bg-surface-container-high px-1.5 py-0.5 rounded text-[0.9em] break-all">
                    {children}
                  </code>
                ) : (
                  <code className={className}>{children}</code>
                )
              },
              pre: ({ children }) => (
                <pre className="bg-surface-container-low dark:bg-surface-container p-4 sm:p-5 rounded-xl overflow-x-auto my-6 text-sm leading-relaxed">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 max-w-full rounded-lg">
                  <table className="w-full border-collapse text-sm min-w-full">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-3.5 py-2.5 bg-surface-container-low dark:bg-surface-container font-medium text-left text-sm break-words">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3.5 py-2.5 text-sm break-words border-t border-outline-variant/15">{children}</td>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-3 border-[#0058be]/30 dark:border-[#a8c0f0]/30 pl-6 my-6 text-muted-foreground italic">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="my-8 border-outline-variant/15" />
              ),
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && message.content && (
            <span className="inline-flex items-center ml-1">
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          )}
        </div>
      </div>

      {/* Web Sources — Starter/Founder only */}
      {!isUser && !isStreaming && isPaidUser && message.expandedResearch && (
        <WebSources expandedResearch={message.expandedResearch as ExpandedResearchDb} />
      )}

      {/* Action buttons */}
      {!isStreaming && (
        <div className="flex items-center gap-1 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity px-1 sm:px-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeak}
            disabled={isVoiceLoading}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            {isVoiceLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Listen'}</span>
          </Button>
        </div>
      )}
    </div>
  )
}

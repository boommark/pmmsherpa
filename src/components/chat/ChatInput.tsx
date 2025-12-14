'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Send, Loader2, Globe, ChevronDown, Search, Microscope, Mic, MicOff } from 'lucide-react'
import { FileUpload, type UploadedFile, getFileCategory } from './FileUpload'
import { AttachmentPreview } from './AttachmentPreview'
import { useChatStore } from '@/stores/chatStore'
import { PerplexityIcon } from '@/components/icons/PerplexityIcon'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string, attachments?: UploadedFile[]) => void
  disabled?: boolean
  conversationId?: string
}

export interface ChatInputRef {
  setInput: (value: string) => void
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  function ChatInput({ onSend, disabled, conversationId }, ref) {
    const [input, setInput] = useState('')
    const [attachments, setAttachments] = useState<UploadedFile[]>([])
    const [partialTranscript, setPartialTranscript] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const {
      webSearchEnabled,
      setWebSearchEnabled,
      perplexityEnabled,
      setPerplexityEnabled,
      deepResearchEnabled,
      setDeepResearchEnabled
    } = useChatStore()

    // Voice input hook
    const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceInput({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          // Append final transcript to input
          setInput(prev => {
            const separator = prev.trim() ? ' ' : ''
            return prev.trim() + separator + text
          })
          setPartialTranscript('')
        } else {
          // Show partial transcript
          setPartialTranscript(text)
        }
      },
      onError: (error) => {
        toast.error(`Voice input failed: ${error.message}`)
      }
    })

    const handleMicClick = useCallback(() => {
      if (isRecording) {
        stopRecording()
      } else {
        startRecording()
      }
    }, [isRecording, startRecording, stopRecording])

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      setInput: (value: string) => {
        setInput(value)
        // Focus the textarea after setting the input
        setTimeout(() => textareaRef.current?.focus(), 0)
      },
      focus: () => {
        textareaRef.current?.focus()
      },
    }))

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
      }
    }, [input])

    // Handle file selection
    const handleFilesSelected = useCallback(async (files: File[]) => {
      // Create pending file entries
      const newAttachments: UploadedFile[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: getFileCategory(file.type) === 'image' ? URL.createObjectURL(file) : undefined,
        status: 'pending' as const,
        progress: 0,
      }))

      setAttachments((prev) => [...prev, ...newAttachments])

      // Upload each file
      for (const attachment of newAttachments) {
        try {
          // Update status to uploading
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id ? { ...a, status: 'uploading' as const, progress: 10 } : a
            )
          )

          const formData = new FormData()
          formData.append('file', attachment.file)
          if (conversationId) {
            formData.append('conversationId', conversationId)
          }

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload failed')
          }

          const data = await response.json()

          // Update with success
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? {
                    ...a,
                    status: 'completed' as const,
                    progress: 100,
                    storagePath: data.storagePath,
                    extractedText: data.extractedText,
                  }
                : a
            )
          )
        } catch (error) {
          console.error('File upload error:', error)
          // Update with error
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? {
                    ...a,
                    status: 'error' as const,
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : a
            )
          )
        }
      }
    }, [conversationId])

    // Remove attachment
    const handleRemoveAttachment = useCallback(async (id: string) => {
      const attachment = attachments.find((a) => a.id === id)

      // Revoke preview URL if it exists
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview)
      }

      // If the file was uploaded, delete it from storage
      if (attachment?.storagePath && attachment.status === 'completed') {
        try {
          await fetch(`/api/upload?id=${id}`, {
            method: 'DELETE',
          })
        } catch (error) {
          console.error('Failed to delete attachment:', error)
        }
      }

      setAttachments((prev) => prev.filter((a) => a.id !== id))
    }, [attachments])

    const handleSubmit = useCallback(() => {
      const hasText = input.trim()
      const hasCompletedAttachments = attachments.some((a) => a.status === 'completed')

      if ((hasText || hasCompletedAttachments) && !disabled) {
        // Filter to only completed attachments
        const completedAttachments = attachments.filter((a) => a.status === 'completed')
        onSend(input.trim(), completedAttachments.length > 0 ? completedAttachments : undefined)
        setInput('')
        setAttachments([])
      }
    }, [input, attachments, disabled, onSend])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }

    // Check if any attachments are still uploading
    const isUploading = attachments.some((a) => a.status === 'uploading')
    const canSubmit = (input.trim() || attachments.some((a) => a.status === 'completed')) && !isUploading

    return (
      <div className="p-2 sm:p-3 md:p-4 lg:p-6">
        <div className="w-full max-w-3xl mx-auto">
          {/* Glassmorphism container */}
          <div className="relative rounded-xl md:rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] md:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] md:dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 dark:border-zinc-700/50">
            {/* Attachment previews */}
            <AttachmentPreview
              files={attachments}
              onRemove={handleRemoveAttachment}
              disabled={disabled}
            />

            <div className="relative flex items-end gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:p-2 md:p-3">
              {/* File upload button */}
              <FileUpload
                onFilesSelected={handleFilesSelected}
                disabled={disabled || isUploading}
                maxFiles={5}
              />

              {/* Web search toggle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                disabled={disabled}
                className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl shrink-0 transition-all ${
                  webSearchEnabled
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'
                }`}
                title={webSearchEnabled ? 'Web search enabled' : 'Enable web search'}
              >
                <Globe className="h-4 w-4" />
              </Button>

              {/* Perplexity research dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    className={`h-8 sm:h-9 md:h-10 px-1.5 sm:px-2 md:px-3 rounded-lg md:rounded-xl shrink-0 transition-all gap-0.5 sm:gap-1 ${
                      perplexityEnabled
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/40'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50'
                    }`}
                    title="Research options"
                  >
                    <PerplexityIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem
                    onClick={() => {
                      setPerplexityEnabled(false)
                      setDeepResearchEnabled(false)
                    }}
                    className="gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${!perplexityEnabled ? 'bg-indigo-500' : 'bg-transparent border border-muted-foreground/30'}`} />
                    <span>Knowledge Base Only</span>
                    <span className="ml-auto text-xs text-muted-foreground">Default</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setPerplexityEnabled(true)
                      setDeepResearchEnabled(false)
                    }}
                    className="gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${perplexityEnabled && !deepResearchEnabled ? 'bg-indigo-500' : 'bg-transparent border border-muted-foreground/30'}`} />
                    <Search className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Quick Research</span>
                      <span className="text-xs text-muted-foreground">Add current web data</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setPerplexityEnabled(true)
                      setDeepResearchEnabled(true)
                    }}
                    className="gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${perplexityEnabled && deepResearchEnabled ? 'bg-indigo-500' : 'bg-transparent border border-muted-foreground/30'}`} />
                    <Microscope className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Deep Research</span>
                      <span className="text-xs text-muted-foreground">Comprehensive analysis</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording && partialTranscript
                    ? partialTranscript
                    : isRecording
                    ? "Listening..."
                    : attachments.length > 0
                    ? "Add a message..."
                    : "Ask about product marketing..."
                }
                disabled={disabled || isRecording}
                className="flex-1 min-h-[36px] sm:min-h-[40px] md:min-h-[44px] max-h-[120px] sm:max-h-[150px] md:max-h-[200px] resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-sm md:text-base placeholder:text-muted-foreground/60 disabled:opacity-50 py-2"
                rows={1}
              />
              {/* Voice input button - purple styling */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMicClick}
                disabled={disabled || isProcessing}
                className={cn(
                  'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl shrink-0 transition-all',
                  isRecording
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 animate-pulse'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800/40'
                )}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || disabled}
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md md:shadow-lg text-white"
              >
                {disabled || isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2 md:mt-3 text-center hidden sm:block">
            PMMSherpa draws from 1,280+ expert sources. Attach PDFs, images, or documents for context.
          </p>
        </div>
      </div>
    )
  }
)

'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Mic, MicOff, Square, AudioLines } from 'lucide-react'
import { FileUpload, type UploadedFile, getFileCategory } from './FileUpload'
import { AttachmentPreview } from './AttachmentPreview'
import { useChatStore } from '@/stores/chatStore'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { createClient as createSupabaseBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mime types we can read inline on the client (tiny files — just send the
// text with the metadata and skip a server round-trip to storage).
const INLINE_TEXT_TYPES = new Set<string>([
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/x-markdown',
  'application/json',
])

/** Parse a server response as JSON, falling back to the raw text if it isn't. */
async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '')
  if (!text) return fallback
  try {
    const json = JSON.parse(text) as { error?: string }
    if (json?.error) return json.error
  } catch {
    // Not JSON — return the text directly (e.g. "Request Entity Too Large")
  }
  return text.slice(0, 300)
}

interface ChatInputProps {
  onSend: (message: string, attachments?: UploadedFile[]) => void
  disabled?: boolean
  conversationId?: string
  onOpenVoiceMode?: () => void
}

export interface ChatInputRef {
  setInput: (value: string) => void
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  function ChatInput({ onSend, disabled, conversationId, onOpenVoiceMode }, ref) {
    const [input, setInput] = useState('')
    const [attachments, setAttachments] = useState<UploadedFile[]>([])
    const [partialTranscript, setPartialTranscript] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const {
      isLoading,
      abortStreaming
    } = useChatStore()

    // Voice input hook
    const { isRecording, isProcessing, startRecording, stopRecording } = useVoiceInput({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setInput(prev => {
            const separator = prev.trim() ? ' ' : ''
            return prev.trim() + separator + text
          })
          setPartialTranscript('')
        } else {
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
      const newAttachments: UploadedFile[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: getFileCategory(file.type) === 'image' ? URL.createObjectURL(file) : undefined,
        status: 'pending' as const,
        progress: 0,
      }))

      setAttachments((prev) => [...prev, ...newAttachments])

      const supabase = createSupabaseBrowserClient()
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData?.user) {
        toast.error('You must be signed in to upload files.')
        setAttachments((prev) =>
          prev.map((a) =>
            newAttachments.some((n) => n.id === a.id)
              ? { ...a, status: 'error' as const, error: 'Not signed in' }
              : a,
          ),
        )
        return
      }
      const userId = userData.user.id

      for (const attachment of newAttachments) {
        try {
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? { ...a, status: 'uploading' as const, progress: 10 }
                : a,
            ),
          )

          // Step 1: Upload the bytes straight to Supabase Storage.
          // Bypasses Vercel's 4.5 MB request-body cap entirely.
          const fileExtension = attachment.file.name.split('.').pop() || ''
          const storedName = `${crypto.randomUUID()}${fileExtension ? '.' + fileExtension : ''}`
          const objectPath = conversationId
            ? `${userId}/${conversationId}/${storedName}`
            : `${userId}/temp/${storedName}`

          const { error: uploadError } = await supabase.storage
            .from('conversation-files')
            .upload(objectPath, attachment.file, {
              contentType: attachment.file.type,
              upsert: false,
            })

          if (uploadError) {
            throw new Error(uploadError.message || 'Storage upload failed')
          }

          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id ? { ...a, progress: 60 } : a,
            ),
          )

          // Step 2: Read inline for tiny text formats so the assistant can
          // see the content immediately (no LlamaParse, no polling).
          let inlineText: string | undefined
          if (INLINE_TEXT_TYPES.has(attachment.file.type)) {
            try {
              inlineText = await attachment.file.text()
            } catch {
              // non-fatal — server will leave extracted_text null
            }
          }

          // Step 3: Tell the server metadata so it can create the
          // attachment row and kick off LlamaParse via signed URL.
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storagePath: objectPath,
              fileName: attachment.file.name,
              fileType: attachment.file.type,
              fileSize: attachment.file.size,
              conversationId: conversationId || null,
              inlineText,
            }),
          })

          if (!response.ok) {
            const msg = await readErrorMessage(response, `Upload failed (${response.status})`)
            throw new Error(msg)
          }

          let data: {
            id: string
            storagePath: string
            extractedText: string | null
            processingStatus: string
          }
          try {
            data = await response.json()
          } catch {
            throw new Error('Server returned an unexpected response')
          }

          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? {
                    ...a,
                    // Swap the local UUID for the DB row id so the chat
                    // route can look the row up later for lazy LlamaParse
                    // result retrieval.
                    id: data.id,
                    status: 'completed' as const,
                    progress: 100,
                    storagePath: data.storagePath,
                    extractedText: data.extractedText ?? undefined,
                  }
                : a,
            ),
          )
        } catch (error) {
          console.error('File upload error:', error)
          setAttachments((prev) =>
            prev.map((a) =>
              a.id === attachment.id
                ? {
                    ...a,
                    status: 'error' as const,
                    error: error instanceof Error ? error.message : 'Upload failed',
                  }
                : a,
            ),
          )
        }
      }
    }, [conversationId])

    // Remove attachment
    const handleRemoveAttachment = useCallback(async (id: string) => {
      const attachment = attachments.find((a) => a.id === id)

      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview)
      }

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
        const completedAttachments = attachments.filter((a) => a.status === 'completed')
        onSend(input.trim(), completedAttachments.length > 0 ? completedAttachments : undefined)
        setInput('')
        setAttachments([])
      }
    }, [input, attachments, disabled, onSend])

    // Handle pasting images from clipboard
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || [])
      const imageFiles: File[] = []

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            // Give pasted images a descriptive name with timestamp
            const ext = file.type.split('/')[1] || 'png'
            const named = new File([file], `screenshot-${Date.now()}.${ext}`, { type: file.type })
            imageFiles.push(named)
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault()
        handleFilesSelected(imageFiles)
      }
    }, [handleFilesSelected])

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }

    const isUploading = attachments.some((a) => a.status === 'uploading')
    const canSubmit = (input.trim() || attachments.some((a) => a.status === 'completed')) && !isUploading

    return (
      <div className="sticky bottom-0 z-10 p-2 sm:p-3 md:p-4 lg:p-6 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3 md:pb-4 lg:pb-6 bg-background/80 backdrop-blur-lg">
        <div className="w-full max-w-3xl mx-auto">
          {/* Glassmorphism container — no hard borders */}
          <div className="relative rounded-xl md:rounded-2xl bg-surface-container-lowest/80 dark:bg-surface-container/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(25,28,30,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
            {/* Attachment previews */}
            <AttachmentPreview
              files={attachments}
              onRemove={handleRemoveAttachment}
              disabled={disabled}
            />

            <div className="relative flex items-end gap-1.5 sm:gap-2 md:gap-2.5 p-1.5 sm:p-2 md:p-3">
              {/* File upload button */}
              <FileUpload
                onFilesSelected={handleFilesSelected}
                disabled={disabled || isUploading}
                maxFiles={5}
              />

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
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
                className="flex-1 min-h-[36px] sm:min-h-[40px] md:min-h-[44px] max-h-[120px] sm:max-h-[150px] md:max-h-[200px] resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-sm md:text-base placeholder:text-muted-foreground/50 disabled:opacity-50 py-2"
                rows={1}
              />
              {/* Voice mode and voice input hidden for now */}
              {isLoading ? (
                <Button
                  onClick={abortStreaming}
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl shrink-0 bg-destructive hover:bg-destructive/90 shadow-none text-white"
                  title="Stop generating"
                >
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || disabled}
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl shrink-0 bg-[#0058be] hover:bg-[#004a9e] shadow-none text-white"
                >
                  {disabled || isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2.5 md:mt-3 text-center hidden sm:block">
            Attach files (PDF, PPT, DOC, XLS, images) for context. Paste URLs for analysis. Ask anything about product marketing.
          </p>
        </div>
      </div>
    )
  }
)

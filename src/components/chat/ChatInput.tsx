'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export interface ChatInputRef {
  setInput: (value: string) => void
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  function ChatInput({ onSend, disabled }, ref) {
    const [input, setInput] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

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

    const handleSubmit = () => {
      if (input.trim() && !disabled) {
        onSend(input.trim())
        setInput('')
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    }

    return (
      <div className="border-t bg-background p-3 md:p-4">
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about product marketing..."
              disabled={disabled}
              className="min-h-[44px] max-h-[200px] resize-none pr-12 text-base"
              rows={1}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8"
            >
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
            PMMSherpa draws from 1,280+ expert sources including PMM books, blogs, and AMAs.
          </p>
        </div>
      </div>
    )
  }
)

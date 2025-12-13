'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
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
      <div className="p-4 md:p-6">
        <div className="w-full max-w-3xl mx-auto">
          {/* Glassmorphism container */}
          <div className="relative rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 dark:border-zinc-700/50">
            <div className="relative flex items-end gap-2 p-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about product marketing..."
                disabled={disabled}
                className="flex-1 min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-base placeholder:text-muted-foreground/60 disabled:opacity-50"
                rows={1}
              />
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || disabled}
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0 bg-primary hover:bg-primary/90 shadow-lg"
              >
                {disabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-3 text-center hidden sm:block">
            PMMSherpa draws from 1,280+ expert sources including PMM books, blogs, and AMAs.
          </p>
        </div>
      </div>
    )
  }
)

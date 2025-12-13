'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { StatusIndicator } from './StatusIndicator'
import type { ChatMessage } from '@/types/chat'

interface MessageListProps {
  messages: ChatMessage[]
  statusMessage?: string | null
  onEditPrompt?: (content: string) => void
}

export function MessageList({ messages, statusMessage, onEditPrompt }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change or during streaming
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [messages, statusMessage])

  // Also scroll when a message is streaming (content updates)
  useEffect(() => {
    const streamingMessage = messages.find(m => m.isStreaming)
    if (streamingMessage) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages])

  return (
    <ScrollArea className="flex-1 h-full w-full" ref={scrollRef}>
      <div className="w-full max-w-3xl mx-auto py-4 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onEditPrompt={onEditPrompt}
          />
        ))}
        {statusMessage && <StatusIndicator message={statusMessage} />}
        {/* Scroll anchor at bottom */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

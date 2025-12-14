'use client'

import { useEffect, useRef, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { StatusIndicator } from './StatusIndicator'
import type { ChatMessage } from '@/types/chat'

interface MessageListProps {
  messages: ChatMessage[]
  statusMessage?: string | null
  onEditPrompt?: (content: string) => void
  onExpandWithResearch?: (messageId: string, content: string, deepResearch: boolean) => void
}

export function MessageList({ messages, statusMessage, onEditPrompt, onExpandWithResearch }: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)
  const isUserScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldAutoScrollRef = useRef(true)

  // Check if any message is currently streaming
  const isStreaming = messages.some(m => m.isStreaming)

  // Scroll to bottom of messages
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!isUserScrollingRef.current && shouldAutoScrollRef.current) {
      const container = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]')
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior
        })
      }
    }
  }, [])

  // Detect when user is manually scrolling
  useEffect(() => {
    const container = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!container) return

    const handleScroll = () => {
      // Check if user is near the bottom (within 100px)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100

      // If user scrolls up while streaming, pause auto-scroll
      if (!isNearBottom && isStreaming) {
        isUserScrollingRef.current = true
        shouldAutoScrollRef.current = false
      } else if (isNearBottom) {
        // If user scrolls back to bottom, resume auto-scroll
        shouldAutoScrollRef.current = true
      }

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Reset the flag after user stops scrolling for 2 seconds
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false
      }, 2000)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isStreaming])

  // Scroll when new messages are added
  useEffect(() => {
    const currentCount = messages.length
    const prevCount = prevMessageCountRef.current

    // When a new message is added (user sends a message or assistant starts responding)
    if (currentCount > prevCount) {
      // Reset auto-scroll when user sends a new message
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'user') {
        isUserScrollingRef.current = false
        shouldAutoScrollRef.current = true
      }

      // Scroll to bottom for new messages
      requestAnimationFrame(() => {
        scrollToBottom('smooth')
      })
    }

    prevMessageCountRef.current = currentCount
  }, [messages.length, scrollToBottom])

  // Auto-scroll while streaming (follow the response as it grows)
  useEffect(() => {
    if (isStreaming && shouldAutoScrollRef.current) {
      scrollToBottom('auto')
    }
  }, [messages, isStreaming, scrollToBottom])

  // On initial load of a conversation, scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && prevMessageCountRef.current === 0) {
      // Initial load - scroll to bottom to show latest
      requestAnimationFrame(() => {
        scrollToBottom('auto')
      })
      prevMessageCountRef.current = messages.length
    }
  }, [messages.length, scrollToBottom])

  return (
    <ScrollArea className="flex-1 h-full w-full" ref={scrollContainerRef}>
      <div className="w-full max-w-3xl mx-auto py-3 md:py-6 px-3 sm:px-4 md:px-6 space-y-3 md:space-y-6 overflow-x-hidden">
        {messages.map((message) => (
          <div key={message.id} className="w-full overflow-hidden">
            <MessageBubble
              message={message}
              onEditPrompt={onEditPrompt}
              onExpandWithResearch={onExpandWithResearch}
            />
          </div>
        ))}
        {statusMessage && <StatusIndicator message={statusMessage} />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}

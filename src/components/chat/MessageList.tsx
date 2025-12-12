'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { StatusIndicator } from './StatusIndicator'
import type { ChatMessage } from '@/types/chat'

interface MessageListProps {
  messages: ChatMessage[]
  statusMessage?: string | null
}

export function MessageList({ messages, statusMessage }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 h-full">
      <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {statusMessage && <StatusIndicator message={statusMessage} />}
      </div>
    </ScrollArea>
  )
}

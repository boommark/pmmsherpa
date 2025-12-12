'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/stores/chatStore'
import { useConversations, useConversationMessages } from '@/hooks/useConversations'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import type { ChatMessage } from '@/types/chat'

interface ChatContainerProps {
  conversationId?: string
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { createConversation } = useConversations()
  const { messages: dbMessages } = useConversationMessages(conversationId || null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const lastConversationIdRef = useRef<string | undefined>(undefined)

  const {
    messages,
    setMessages,
    addMessage,
    isLoading,
    setIsLoading,
    setError,
    currentModel,
    setConversationId,
    startStreaming,
    appendToStream,
    setCitations,
    finishStreaming,
    statusMessage,
    setStatusMessage,
  } = useChatStore()

  // Sync messages from DB - only on initial load or conversation change
  useEffect(() => {
    // Reset initialization when conversation changes
    if (conversationId !== lastConversationIdRef.current) {
      setHasInitialized(false)
      lastConversationIdRef.current = conversationId
    }

    // Only sync from DB on initial load, not during active chat
    if (!hasInitialized && !isLoading) {
      if (conversationId && dbMessages.length > 0) {
        const chatMessages: ChatMessage[] = dbMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          citations: m.citations,
          model: m.model || undefined,
          createdAt: new Date(m.created_at),
        }))
        setMessages(chatMessages)
        setConversationId(conversationId)
        setHasInitialized(true)
      } else if (!conversationId) {
        setMessages([])
        setConversationId(null)
        setHasInitialized(true)
      } else if (conversationId && dbMessages.length === 0) {
        // New conversation with no messages yet
        setHasInitialized(true)
      }
    }
  }, [conversationId, dbMessages, setMessages, setConversationId, hasInitialized, isLoading])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setStatusMessage('Preparing your request...')

    // Create user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
    }
    addMessage(userMessage)

    // Create assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`
    startStreaming(assistantMessageId)

    try {
      // Get or create conversation
      let activeConversationId = conversationId
      let isNewConversation = false

      if (!activeConversationId) {
        // Create new conversation with first message as title
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        const newConv = await createConversation(title, currentModel)
        if (newConv) {
          activeConversationId = newConv.id
          isNewConversation = true
          setConversationId(newConv.id)
        } else {
          throw new Error('Failed to create conversation')
        }
      }

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: activeConversationId,
          model: currentModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'status') {
                  setStatusMessage(data.message)
                } else if (data.type === 'text') {
                  // Clear status when text starts streaming
                  setStatusMessage(null)
                  appendToStream(assistantMessageId, data.content)
                } else if (data.type === 'citations') {
                  setCitations(assistantMessageId, data.citations)
                } else if (data.type === 'done') {
                  setStatusMessage(null)
                  finishStreaming(assistantMessageId)
                  // Navigate to new conversation after streaming completes
                  if (isNewConversation && activeConversationId) {
                    router.replace(`/chat/${activeConversationId}`)
                  }
                } else if (data.type === 'error') {
                  setError(data.message)
                  setStatusMessage(null)
                }
              } catch {
                // Ignore parse errors for partial JSON
              }
            }
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setStatusMessage(null)
      finishStreaming(assistantMessageId)
    } finally {
      setIsLoading(false)
      setStatusMessage(null)
    }
  }, [
    isLoading,
    conversationId,
    currentModel,
    addMessage,
    startStreaming,
    appendToStream,
    setCitations,
    finishStreaming,
    setIsLoading,
    setError,
    setStatusMessage,
    setConversationId,
    createConversation,
    router,
  ])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <div className="text-center space-y-4 max-w-md px-4">
            <h2 className="text-2xl font-semibold">Welcome to PMMSherpa</h2>
            <p className="text-muted-foreground">
              Your AI-powered product marketing assistant. Ask me anything about
              PMM strategy, positioning, messaging, or request deliverables like
              battlecards, launch plans, and more.
            </p>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Try asking:</p>
              <button
                className="text-left px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                onClick={() => handleSendMessage('Help me create a positioning statement for a new SaaS product')}
              >
                &ldquo;Help me create a positioning statement for a new SaaS product&rdquo;
              </button>
              <button
                className="text-left px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                onClick={() => handleSendMessage('What are the key differences between product marketing and product management?')}
              >
                &ldquo;What are the key differences between product marketing and product management?&rdquo;
              </button>
              <button
                className="text-left px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                onClick={() => handleSendMessage('Create a competitive battlecard template')}
              >
                &ldquo;Create a competitive battlecard template&rdquo;
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden min-h-0">
          <MessageList messages={messages} statusMessage={statusMessage} />
        </div>
      )}
      <div ref={messagesEndRef} />
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}

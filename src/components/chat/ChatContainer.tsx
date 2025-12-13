'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/stores/chatStore'
import { useConversations, useConversationMessages } from '@/hooks/useConversations'
import { MessageList } from './MessageList'
import { ChatInput, type ChatInputRef } from './ChatInput'
import { BlobBackground } from '@/components/ui/blob-background'
import { AnimatedOrb } from '@/components/ui/animated-orb'
import type { ChatMessage } from '@/types/chat'

interface ChatContainerProps {
  conversationId?: string
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<ChatInputRef>(null)
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

  // Handle editing a prompt - puts the content back in the input for editing
  const handleEditPrompt = useCallback((content: string) => {
    chatInputRef.current?.setInput(content)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Background blobs - only show on welcome screen */}
      {messages.length === 0 && <BlobBackground />}

      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <div className="text-center space-y-6 max-w-lg px-4">
            {/* Animated AI Orb */}
            <div className="flex justify-center mb-8">
              <AnimatedOrb size="lg" />
            </div>

            {/* Greeting */}
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome to PMMSherpa
              </h2>
              <p className="text-lg text-muted-foreground/80">
                How can I assist you today?
              </p>
            </div>

            {/* Quick action suggestions */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <button
                className="px-4 py-2 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 text-sm hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all shadow-sm hover:shadow-md"
                onClick={() => handleSendMessage('Help me create a positioning statement for a new SaaS product')}
              >
                Positioning Statement
              </button>
              <button
                className="px-4 py-2 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 text-sm hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all shadow-sm hover:shadow-md"
                onClick={() => handleSendMessage('Create a competitive battlecard template')}
              >
                Battlecard Template
              </button>
              <button
                className="px-4 py-2 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 text-sm hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all shadow-sm hover:shadow-md"
                onClick={() => handleSendMessage('Help me develop a go-to-market strategy')}
              >
                GTM Strategy
              </button>
              <button
                className="px-4 py-2 rounded-full bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 text-sm hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all shadow-sm hover:shadow-md"
                onClick={() => handleSendMessage('What are the key differences between product marketing and product management?')}
              >
                PMM vs PM
              </button>
            </div>

            {/* Subtle hint */}
            <p className="text-xs text-muted-foreground/60 pt-4">
              Powered by 1,280+ expert sources
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden min-h-0">
          <MessageList
            messages={messages}
            statusMessage={statusMessage}
            onEditPrompt={handleEditPrompt}
          />
        </div>
      )}
      <div ref={messagesEndRef} />
      <ChatInput ref={chatInputRef} onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}

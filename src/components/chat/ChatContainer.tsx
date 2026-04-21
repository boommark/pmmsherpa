'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/stores/chatStore'
import { useConversations, useConversationMessages } from '@/hooks/useConversations'
import { MessageList } from './MessageList'
import { ChatInput, type ChatInputRef } from './ChatInput'
import { BlobBackground } from '@/components/ui/blob-background'
import { AnimatedOrb } from '@/components/ui/animated-orb'
// Image import removed — tiles now use Lucide icons
import { Loader2, Crosshair, ShieldCheck, Rocket, Target, TrendingUp } from 'lucide-react'
import type { ChatMessage, ChatAttachment } from '@/types/chat'
import type { UploadedFile } from './FileUpload'
import { VoiceModeOverlay } from '@/components/voice/VoiceModeOverlay'
import { useVoiceMode } from '@/hooks/useVoiceMode'

interface ChatContainerProps {
  conversationId?: string
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const router = useRouter()
  const chatInputRef = useRef<ChatInputRef>(null)
  const { createConversation } = useConversations()
  const { messages: dbMessages, loading: messagesLoading } = useConversationMessages(conversationId || null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const lastConversationIdRef = useRef<string | undefined>(undefined)
  const isNavigatingToNewConversation = useRef(false)
  const isStreamingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const editingMessageIndexRef = useRef<number | null>(null)

  const {
    messages,
    setMessages,
    addMessage,
    removeMessagesFromIndex,
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
    setMessageResearching,
    setExpandedResearch,
    setAbortController,
    abortStreaming,
    pendingNewChat,
    setPendingNewChat,
  } = useChatStore()

  // Handle pendingNewChat flag (set by sidebar before navigation)
  // Clear stale messages and reset the flag so the welcome screen renders cleanly.
  useEffect(() => {
    if (pendingNewChat) {
      setMessages([])
      setConversationId(null)
      setPendingNewChat(false)
      setHasInitialized(true)
    }
  }, [pendingNewChat, setMessages, setConversationId, setPendingNewChat])

  // Reset state when conversation changes
  useEffect(() => {
    if (conversationId !== lastConversationIdRef.current) {
      console.log('Conversation changed from', lastConversationIdRef.current, 'to', conversationId)

      if (isNavigatingToNewConversation.current) {
        console.log('Navigating to new conversation - keeping messages')
        isNavigatingToNewConversation.current = false
        setHasInitialized(true)
      } else {
        console.log('Clearing messages for new/different conversation')
        setMessages([])
        setConversationId(null)
        setHasInitialized(false)
      }
      lastConversationIdRef.current = conversationId
    }
  }, [conversationId, setMessages, setConversationId])

  // Sync messages from DB when loaded
  useEffect(() => {
    if (isLoading) return
    if (isStreamingRef.current) return
    if (messagesLoading) return

    const hasStreamingMessage = messages.some(m => m.isStreaming)
    if (hasStreamingMessage) {
      console.log('Skipping sync - message is streaming')
      return
    }

    if (messages.length > 0 && dbMessages.length === 0) {
      console.log('Skipping sync - have local messages, DB is empty (messages being saved)')
      if (!hasInitialized) {
        setHasInitialized(true)
      }
      return
    }

    if (messages.length > dbMessages.length && dbMessages.length > 0) {
      console.log('Skipping sync - local messages ahead of DB (unsaved messages)')
      if (!hasInitialized) {
        setHasInitialized(true)
      }
      return
    }

    console.log('Syncing messages - conversationId:', conversationId, 'dbMessages:', dbMessages.length, 'hasInitialized:', hasInitialized, 'storeMessages:', messages.length)

    if (conversationId && dbMessages.length > 0) {
      const chatMessages: ChatMessage[] = dbMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        citations: m.citations,
        expandedResearch: m.expanded_research || undefined,
        model: m.model || undefined,
        createdAt: new Date(m.created_at),
      }))

      const currentIds = messages.map(m => m.id).join(',')
      const newIds = chatMessages.map(m => m.id).join(',')

      if (messages.length === 0 || (currentIds !== newIds && dbMessages.length >= messages.length)) {
        console.log('Setting messages from DB:', chatMessages.length)
        setMessages(chatMessages)
        setConversationId(conversationId)
        setHasInitialized(true)
      } else if (!hasInitialized) {
        setHasInitialized(true)
      }
    } else if (!conversationId && !hasInitialized) {
      console.log('No conversation - clearing messages')
      setMessages([])
      setConversationId(null)
      setHasInitialized(true)
    } else if (conversationId && dbMessages.length === 0 && !messagesLoading && !hasInitialized) {
      console.log('New conversation with no messages yet')
      setConversationId(conversationId)
      setHasInitialized(true)
    }
  }, [conversationId, dbMessages, messagesLoading, setMessages, setConversationId, hasInitialized, isLoading, messages])

  const handleSendMessage = useCallback(async (content: string, attachments?: UploadedFile[]) => {
    const hasContent = content.trim()
    const hasAttachments = attachments && attachments.length > 0

    if ((!hasContent && !hasAttachments) || isLoading || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsLoading(true)
    setError(null)
    setStatusMessage('Preparing your request...')
    isStreamingRef.current = true

    if (editingMessageIndexRef.current !== null) {
      removeMessagesFromIndex(editingMessageIndexRef.current)
      editingMessageIndexRef.current = null
    }

    const chatAttachments: ChatAttachment[] | undefined = attachments?.map((a) => ({
      id: a.id,
      fileName: a.file.name,
      fileType: a.file.type,
      fileSize: a.file.size,
      storagePath: a.storagePath || '',
      extractedText: a.extractedText || null,
    }))

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content || (hasAttachments ? `[Attached ${attachments!.length} file${attachments!.length > 1 ? 's' : ''}]` : ''),
      attachments: chatAttachments,
      createdAt: new Date(),
    }
    addMessage(userMessage)

    const assistantMessageId = `assistant-${Date.now()}`
    startStreaming(assistantMessageId)

    try {
      let activeConversationId = conversationId
      let isNewConversation = false

      if (!activeConversationId) {
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

      const abortController = new AbortController()
      setAbortController(abortController)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId: activeConversationId,
          model: currentModel,
          attachments: chatAttachments,
        }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let receivedDone = false
        let lastActivityTime = Date.now()
        const STREAM_TIMEOUT_MS = 90000
        const INACTIVITY_TIMEOUT_MS = 30000

        const checkTimeout = () => {
          const now = Date.now()
          const totalElapsed = now - (lastActivityTime - INACTIVITY_TIMEOUT_MS)
          if (now - lastActivityTime > INACTIVITY_TIMEOUT_MS) {
            throw new Error('Stream timed out - no data received for 30 seconds')
          }
          if (totalElapsed > STREAM_TIMEOUT_MS) {
            throw new Error('Stream timed out - total time exceeded')
          }
        }

        try {
          while (true) {
            const readPromise = reader.read()
            const timeoutPromise = new Promise<never>((_, reject) => {
              const timeoutId = setTimeout(() => {
                checkTimeout()
                reject(new Error('Stream read timeout'))
              }, INACTIVITY_TIMEOUT_MS)
              readPromise.then(() => clearTimeout(timeoutId)).catch(() => clearTimeout(timeoutId))
            })

            const { done, value } = await Promise.race([readPromise, timeoutPromise])
            lastActivityTime = Date.now()

            if (done) {
              if (!receivedDone) {
                console.warn('Stream ended without done event - server may have disconnected')
              }
              break
            }

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.type === 'status') {
                    setStatusMessage(data.message)
                  } else if (data.type === 'text') {
                    setStatusMessage(null)
                    appendToStream(assistantMessageId, data.content)
                  } else if (data.type === 'citations') {
                    setCitations(assistantMessageId, data.citations)
                  } else if (data.type === 'expandedResearch') {
                    setExpandedResearch(assistantMessageId, data.expandedResearch)
                  } else if (data.type === 'done') {
                    receivedDone = true
                    setStatusMessage(null)
                    finishStreaming(assistantMessageId)
                    if (isNewConversation && activeConversationId) {
                      isNavigatingToNewConversation.current = true
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
        } finally {
          try {
            reader.cancel()
          } catch {
            // Ignore cancel errors
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        finishStreaming(assistantMessageId)
      } else {
        let errorMessage = 'An error occurred'
        if (error instanceof Error) {
          if (error.message.includes('timed out') || error.message.includes('timeout')) {
            errorMessage = 'The response took too long. Please try again with a simpler question, or disable deep research.'
          } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
            errorMessage = 'Connection lost. Please check your internet and try again.'
          } else {
            errorMessage = error.message
          }
        }
        setError(errorMessage)
        setStatusMessage(null)
        finishStreaming(assistantMessageId)
      }
    } finally {
      setIsLoading(false)
      setStatusMessage(null)
      isStreamingRef.current = false
      isSubmittingRef.current = false
      setAbortController(null)
    }
  }, [
    isLoading,
    conversationId,
    currentModel,
    addMessage,
    removeMessagesFromIndex,
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
    setExpandedResearch,
    setAbortController,
  ])

  // ========================================
  // Voice Mode
  // ========================================
  const [voiceModeOpen, setVoiceModeOpen] = useState(false)
  const [voiceResponseText, setVoiceResponseText] = useState('')
  const [selectedVoiceId, setSelectedVoiceId] = useState('VsQmyFHffusQDewmHB5v')
  const voiceResponseRef = useRef('')

  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    // Send transcript through the same chat API flow
    voiceResponseRef.current = ''
    setVoiceResponseText('')

    try {
      let activeConversationId = conversationId

      if (!activeConversationId) {
        const title = transcript.slice(0, 50) + (transcript.length > 50 ? '...' : '')
        const newConv = await createConversation(title, currentModel)
        if (newConv) {
          activeConversationId = newConv.id
          setConversationId(newConv.id)
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          conversationId: activeConversationId,
          model: currentModel,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n').filter(line => line.startsWith('data: '))

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'text') {
                voiceResponseRef.current += data.content
                setVoiceResponseText(voiceResponseRef.current)
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } finally {
        reader.cancel()
      }

      // Speak the full response
      if (voiceResponseRef.current) {
        voiceMode.speakResponse(voiceResponseRef.current)
      }
    } catch (error) {
      console.error('Voice mode chat error:', error)
    }
  }, [conversationId, currentModel, createConversation, setConversationId])

  const voiceMode = useVoiceMode({
    onTranscript: handleVoiceTranscript,
    onError: (error) => console.error('Voice mode error:', error),
    voiceId: selectedVoiceId,
  })

  // Poll playback amplitude in a rAF loop for smooth orb animation
  const [playbackAmplitude, setPlaybackAmplitude] = useState(0)
  const [playbackFreqData, setPlaybackFreqData] = useState<Uint8Array | undefined>(undefined)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!voiceModeOpen) return

    const tick = () => {
      setPlaybackAmplitude(voiceMode.getPlaybackAmplitude())
      setPlaybackFreqData(voiceMode.getPlaybackFrequencyData())
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [voiceModeOpen, voiceMode])

  const handleOpenVoiceMode = useCallback(() => {
    setVoiceModeOpen(true)
    setVoiceResponseText('')
  }, [])

  const handleCloseVoiceMode = useCallback(() => {
    voiceMode.cancel()
    setVoiceModeOpen(false)
    setVoiceResponseText('')
  }, [voiceMode])

  const handleEditPrompt = useCallback((content: string, messageIndex: number) => {
    editingMessageIndexRef.current = messageIndex
    chatInputRef.current?.setInput(content)
  }, [])

  const handleExpandWithResearch = useCallback(async (messageId: string, content: string, deepResearch: boolean) => {
    setMessageResearching(messageId, true)
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          originalContent: content,
          query: content,
          deepResearch
        })
      })

      const data = await response.json()

      if (data.success && data.expandedResearch) {
        setExpandedResearch(messageId, data.expandedResearch)
      } else {
        console.error('Research failed:', data.error)
      }
    } catch (error) {
      console.error('Research request failed:', error)
    } finally {
      setMessageResearching(messageId, false)
    }
  }, [setMessageResearching, setExpandedResearch])

  const showLoadingState = conversationId && !pendingNewChat && (messagesLoading || !hasInitialized) && messages.length === 0
  // Show welcome screen immediately when pendingNewChat is set (even before
  // the effect clears messages), or when there's no conversation and no messages.
  const isNewChatWelcome = pendingNewChat || (!conversationId && !hasInitialized)

  return (
    <div className="flex flex-col h-full overflow-hidden relative" style={{ height: '100%', minHeight: 0 }}>
      {/* Voice Mode Overlay */}
      <VoiceModeOverlay
        isOpen={voiceModeOpen}
        onClose={handleCloseVoiceMode}
        state={voiceMode.state}
        audioLevel={voiceMode.audioLevel}
        playbackAmplitude={playbackAmplitude}
        playbackFrequencyData={playbackFreqData}
        transcript={voiceMode.transcript}
        responseText={voiceResponseText}
        onStartListening={voiceMode.startListening}
        onStopListening={voiceMode.stopListening}
        onCancel={voiceMode.cancel}
        voiceId={selectedVoiceId}
        onVoiceChange={setSelectedVoiceId}
      />
      {/* Background blobs - only show on welcome screen */}
      {(isNewChatWelcome || (messages.length === 0 && !conversationId)) && <BlobBackground />}

      {showLoadingState ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#0058be]" />
            <p className="text-muted-foreground text-sm">Loading conversation...</p>
          </div>
        </div>
      ) : isNewChatWelcome || (messages.length === 0 && !conversationId) ? (
        <div className="flex-1 overflow-y-auto">
          {/* Top section with orb and headline */}
          <div className="flex flex-col justify-center items-center px-4 md:px-6 pt-4 md:pt-14">
            <div className="flex justify-center mb-2 md:mb-6">
              <AnimatedOrb size="md" />
            </div>

            <div className="text-center space-y-1.5 md:space-y-3 max-w-2xl mx-auto">
              <h2 className="text-lg md:text-3xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                What are you working on?
              </h2>
              <p className="text-xs md:text-base text-muted-foreground/70 max-w-lg mx-auto" style={{ letterSpacing: '0.01em' }}>
                Grounded in the frameworks, war stories, and playbooks of thousands of real-world PMM leaders.{' '}
                <a href="/guides" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">Explore Guides</a> for ready-to-use prompts.
              </p>
            </div>
          </div>

          {/* Starter prompt tiles */}
          <div className="w-full max-w-2xl mx-auto px-4 md:px-6 py-3 md:py-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3.5">
              <button
                className="group text-left px-4 py-2.5 md:px-6 md:py-5 rounded-xl bg-card dark:bg-card backdrop-blur-sm border border-transparent hover:border-[#0058be]/20 hover:shadow-[0_10px_40px_rgba(25,28,30,0.04)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all"
                onClick={() => chatInputRef.current?.setInput("Here's our positioning: [paste it]. Where is it vague? Where would a buyer not see how we're different? Rewrite the weak parts.")}
              >
                <div className="flex items-center gap-2 md:gap-2.5 mb-0.5 md:mb-1.5">
                  <Crosshair className="shrink-0 w-4 h-4 md:w-5 md:h-5 text-[#0058be]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#0058be]">Position</span>
                </div>
                <p className="text-[13px] md:text-[15px] text-foreground/90 leading-snug font-medium">
                  Sound like everyone else?
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 hidden md:block">Sharpen what makes you different</p>
              </button>

              <button
                className="group text-left px-4 py-2.5 md:px-6 md:py-5 rounded-xl bg-card dark:bg-card backdrop-blur-sm border border-transparent hover:border-[#0058be]/20 hover:shadow-[0_10px_40px_rgba(25,28,30,0.04)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all"
                onClick={() => chatInputRef.current?.setInput("Audit this page: [paste URL]. Grade it against proven frameworks and give me the 5 most impactful rewrites.")}
              >
                <div className="flex items-center gap-2 md:gap-2.5 mb-0.5 md:mb-1.5">
                  <ShieldCheck className="shrink-0 w-4 h-4 md:w-5 md:h-5 text-[#0058be]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#0058be]">Audit</span>
                </div>
                <p className="text-[13px] md:text-[15px] text-foreground/90 leading-snug font-medium">
                  Is your page actually converting?
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 hidden md:block">Pressure-test any asset</p>
              </button>

              <button
                className="group text-left px-4 py-2.5 md:px-6 md:py-5 rounded-xl bg-card dark:bg-card backdrop-blur-sm border border-transparent hover:border-[#0058be]/20 hover:shadow-[0_10px_40px_rgba(25,28,30,0.04)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all"
                onClick={() => chatInputRef.current?.setInput("We're launching [product/feature] in [timeframe]. Generate a launch brief: tier, messaging, success metrics, and timeline.")}
              >
                <div className="flex items-center gap-2 md:gap-2.5 mb-0.5 md:mb-1.5">
                  <Rocket className="shrink-0 w-4 h-4 md:w-5 md:h-5 text-[#0058be]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#0058be]">Launch</span>
                </div>
                <p className="text-[13px] md:text-[15px] text-foreground/90 leading-snug font-medium">
                  Alignment breaks down at launch
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 hidden md:block">Plan launches that stick</p>
              </button>

              <button
                className="group text-left px-4 py-2.5 md:px-6 md:py-5 rounded-xl bg-card dark:bg-card backdrop-blur-sm border border-transparent hover:border-[#0058be]/20 hover:shadow-[0_10px_40px_rgba(25,28,30,0.04)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all"
                onClick={() => chatInputRef.current?.setInput("Build a battlecard: us [your product] vs [competitor]. Objection handling, discovery questions, and where they're weak.")}
              >
                <div className="flex items-center gap-2 md:gap-2.5 mb-0.5 md:mb-1.5">
                  <Target className="shrink-0 w-4 h-4 md:w-5 md:h-5 text-[#0058be]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#0058be]">Compete</span>
                </div>
                <p className="text-[13px] md:text-[15px] text-foreground/90 leading-snug font-medium">
                  Sales needs a battlecard by morning
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 hidden md:block">Win more deals</p>
              </button>

              <button
                className="group text-left px-4 py-2.5 md:px-6 md:py-5 rounded-xl bg-card dark:bg-card backdrop-blur-sm border border-transparent hover:border-[#0058be]/20 hover:shadow-[0_10px_40px_rgba(25,28,30,0.04)] dark:hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all sm:col-span-2"
                onClick={() => chatInputRef.current?.setInput("I'm preparing to move from [current role] to [target role]. Here's what I've shipped: [list projects]. Help me frame the strongest narrative.")}
              >
                <div className="flex items-center gap-2 md:gap-2.5 mb-0.5 md:mb-1.5">
                  <TrendingUp className="shrink-0 w-4 h-4 md:w-5 md:h-5 text-[#0058be]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#0058be]">Grow</span>
                </div>
                <p className="text-[13px] md:text-[15px] text-foreground/90 leading-snug font-medium">
                  Ready for your next level?
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1 hidden md:block">Career strategy that lands</p>
              </button>
            </div>
          </div>

          {/* Chat input — sticky at bottom of scroll container */}
          <div className="sticky bottom-0 w-full bg-background">
            <ChatInput ref={chatInputRef} onSend={handleSendMessage} disabled={isLoading} conversationId={conversationId} onOpenVoiceMode={handleOpenVoiceMode} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-hidden min-h-0">
            <MessageList
              messages={messages}
              statusMessage={statusMessage}
              onEditPrompt={handleEditPrompt}
            />
          </div>
          <div className="shrink-0">
            <ChatInput ref={chatInputRef} onSend={handleSendMessage} disabled={isLoading} conversationId={conversationId} onOpenVoiceMode={handleOpenVoiceMode} />
          </div>
        </>
      )}
    </div>
  )
}

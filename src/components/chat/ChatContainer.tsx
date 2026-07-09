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
import { Loader2, Crosshair, ShieldCheck, Rocket, Target, TrendingUp, DollarSign, Map, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Landing tiles — aligned with /guides icons and first prompts
const LANDING_TILES = [
  { icon: Map, label: 'Strategy', hook: "GTM taking weeks?", prompt: "I'm a PMM at [company]. We sell [product] to [audience]. Our biggest GTM challenge right now is [describe it]. What frameworks and strategies should I consider, and what would you recommend as a first move?", guideId: 1 },
  { icon: ShieldCheck, label: 'Audit', hook: "Is your page converting?", prompt: "Audit this landing page: [paste URL]. Grade it against proven positioning, storytelling, and value frameworks. Give me the 5 most impactful rewrites.", guideId: 2 },
  { icon: TrendingUp, label: 'Career', hook: "Ready for your next level?", prompt: "I'm interviewing for a [title] role at a [type of company]. My background is [brief summary]. Give me: the top 5 questions the hiring manager will likely ask, a strong answer structure for each, and a positioning statement for myself as a candidate.", guideId: 3 },
  { icon: Crosshair, label: 'Position', hook: "Sound like everyone else?", prompt: "Write a positioning statement for [product]. We compete mainly against [competitors]. Our ICP is [describe them]. Use competitive positioning as the base, cross-check against category design and adoption frameworks. No generic SaaS language.", guideId: 4 },
  { icon: DollarSign, label: 'Pricing', hook: "Stop guessing on pricing", prompt: "Pressure-test this pricing: [describe your tiers and prices]. Our ICP is [describe them]. Our main competitors charge [what you know]. Where am I leaving money on the table? Where will I lose deals?", guideId: 5 },
  { icon: Rocket, label: 'Launch', hook: "Alignment breaks at launch", prompt: "From this product spec, generate a complete launch brief: launch tier recommendation, target audience, key messaging, success metrics, channel plan, and a timeline with owner assignments. Here's the spec: [paste it]", guideId: 6 },
  { icon: Target, label: 'Compete', hook: "Battlecard by morning?", prompt: "Build a competitive battlecard: us ([product]) vs. [competitor]. Include: their positioning, their strengths, their weaknesses, our differentiators, objection handling for their top 3 claims, and discovery questions that expose their gaps.", guideId: 7 },
]
import type { ChatMessage, ChatAttachment } from '@/types/chat'
import type { UploadedFile } from './FileUpload'
import { VoiceModeOverlay } from '@/components/voice/VoiceModeOverlay'
import { useVoiceMode } from '@/hooks/useVoiceMode'
import posthog from 'posthog-js'
import { toast } from 'sonner'

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
    updateMessage,
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
    currentProject,
    setCurrentProject,
  } = useChatStore()

  // Recovery poll: after a client-side timeout the server may still finish
  // and save the real answer (it has up to 120s). Poll the conversation for
  // a bounded window and swap the local error bubble for the DB row if one
  // lands, instead of leaving the answer invisible until reload.
  const recoveryPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // DB id of the assistant placeholder row for the in-flight turn, learned
  // from the server's `start` SSE event. Lets the recovery poll target the
  // exact row by id (instead of guessing via content match). Cleared on each
  // new send/retry.
  const activePlaceholderIdRef = useRef<string | null>(null)

  const stopRecoveryPoll = useCallback(() => {
    if (recoveryPollRef.current) {
      clearInterval(recoveryPollRef.current)
      recoveryPollRef.current = null
    }
  }, [])

  useEffect(() => stopRecoveryPoll, [stopRecoveryPoll])

  const startRecoveryPoll = useCallback((
    convId: string,
    localMessageId: string,
    sentContent: string,
    placeholderId: string | null
  ) => {
    stopRecoveryPoll()
    // Anchor the deadline to when polling STARTS. Anchoring to the send time
    // fails the 130s total-timeout path, where 120s from send has already
    // elapsed before we get here — the poll would run once and give up.
    const deadline = Date.now() + 120_000

    // A row is "finalized" only when the success save wrote latency_ms (the
    // placeholder insert, the partial flushes, and the error UPDATE never set
    // it), so a mid-stream partial flush — which only rewrites content — is
    // never mistaken for the final answer. latency_ms is preferred over
    // token_count because token_count can be null when usage stats are
    // unavailable, whereas latency_ms is always written on final success.
    type RecoveryRow = {
      id: string
      role: string
      content: string | null
      citations: ChatMessage['citations']
      expanded_research: ChatMessage['expandedResearch'] | null
      model: ChatMessage['model'] | null
      error: boolean | null
      latency_ms: number | null
    }
    const adopt = (row: RecoveryRow) => {
      updateMessage(localMessageId, {
        id: row.id,
        content: row.content ?? '',
        citations: row.citations || undefined,
        expandedResearch: row.expanded_research || undefined,
        model: row.model || undefined,
        error: false,
        isStreaming: false,
      })
      setError(null)
      stopRecoveryPoll()
    }

    const tick = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // New sends call stopRecoveryPoll() up front; this guard covers the
        // bubble being removed by other means (edit, conversation switch).
        const state = useChatStore.getState()
        if (!state.messages.some(m => m.id === localMessageId)) {
          stopRecoveryPoll()
          return
        }

        if (placeholderId) {
          // Preferred path: watch the exact placeholder row by id.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: row } = await (supabase.from('messages') as any)
            .select('id, role, content, citations, expanded_research, model, error, latency_ms')
            .eq('id', placeholderId)
            .maybeSingle() as { data: RecoveryRow | null }

          if (row) {
            if (row.error === true) {
              // The turn ended in an error fallback — keep the error bubble.
              stopRecoveryPoll()
              return
            }
            if (row.latency_ms != null && row.content?.trim()) {
              adopt(row)
              return
            }
          }
        } else {
          // Fallback path (no placeholder id received): match the clean
          // assistant answer sitting directly after our user turn, and require
          // it to be finalized (token_count set) so a partial flush isn't
          // adopted as the final answer.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: rows } = await (supabase.from('messages') as any)
            .select('id, role, content, citations, expanded_research, model, error, latency_ms, created_at')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: false })
            .limit(2)
          const [latest, prev] = (rows ?? []) as RecoveryRow[]

          if (
            latest?.role === 'assistant' &&
            latest.error !== true &&
            latest.content?.trim() &&
            latest.latency_ms != null &&
            prev?.role === 'user' &&
            prev.content === sentContent
          ) {
            adopt(latest)
            return
          }
        }
      } catch (pollErr) {
        console.error('[Chat] Recovery poll error:', pollErr)
      }
      if (Date.now() > deadline) {
        stopRecoveryPoll()
      }
    }

    recoveryPollRef.current = setInterval(tick, 10_000)
    void tick()
  }, [stopRecoveryPoll, updateMessage, setError])

  // Projects P2: when viewing an existing conversation, sync the active
  // project from the conversation row (project is locked per conversation).
  useEffect(() => {
    if (!conversationId) return
    let cancelled = false
    async function syncProject() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: conv } = await (supabase.from('conversations') as any)
          .select('project_id')
          .eq('id', conversationId)
          .maybeSingle()
        if (cancelled) return
        const projectId: string | null = conv?.project_id ?? null
        if (!projectId) {
          setCurrentProject(null)
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: proj } = await (supabase.from('projects') as any)
          .select('id, name')
          .eq('id', projectId)
          .maybeSingle()
        if (cancelled) return
        setCurrentProject(proj ? { id: proj.id, name: proj.name } : null)
      } catch (err) {
        console.error('[Chat] Failed to sync conversation project:', err)
      }
    }
    syncProject()
    return () => {
      cancelled = true
    }
  }, [conversationId, setCurrentProject])

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
      const chatMessages: ChatMessage[] = dbMessages
        // Drop orphaned assistant placeholders (empty content, not an error
        // fallback) left behind when a lambda was killed before the first
        // partial flush — they'd render as blank bubbles.
        .filter((m) => !(m.role === 'assistant' && !m.content?.trim() && (m as { error?: boolean }).error !== true))
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          citations: m.citations,
          expandedResearch: m.expanded_research || undefined,
          model: m.model || undefined,
          error: (m as { error?: boolean }).error === true,
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

    stopRecoveryPoll()
    activePlaceholderIdRef.current = null
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

    // Declared outside try so the finally block can call router.replace as a backstop
    // if done event never fires (e.g. server exception after text stream, Vercel timeout)
    let activeConversationId = conversationId
    let isNewConversation = false

    try {
      if (!activeConversationId) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
        let newConv: Awaited<ReturnType<typeof createConversation>> = null
        try {
          newConv = await createConversation(title, currentModel, currentProject?.id ?? null)
        } catch (convError) {
          console.error('Failed to create conversation:', convError)
        }
        if (!newConv) {
          // Don't lose the typed message: pull the optimistic bubbles back
          // out of the store and restore the text to the input box.
          const userIndex = useChatStore.getState().messages.findIndex(m => m.id === userMessage.id)
          if (userIndex >= 0) {
            removeMessagesFromIndex(userIndex)
          }
          chatInputRef.current?.setInput(content)
          setError('Could not start a new conversation. Please check your connection and try again.')
          return
        }
        activeConversationId = newConv.id
        isNewConversation = true
        setConversationId(newConv.id)
        posthog.capture('conversation_created', { model: currentModel, has_project: !!currentProject })
      }

      posthog.capture('message_sent', {
        model: currentModel,
        has_attachments: (chatAttachments?.length ?? 0) > 0,
        is_new_conversation: isNewConversation,
        has_project: !!currentProject,
      })

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
          project_id: currentProject?.id ?? undefined,
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
        const streamStartTime = Date.now()
        let lastActivityTime = Date.now()
        // Server maxDuration is 120s and sends a heartbeat every 10s until
        // the first text chunk, so these only fire when something is wrong.
        const STREAM_TIMEOUT_MS = 130000
        const INACTIVITY_TIMEOUT_MS = 45000

        const checkTimeout = () => {
          const now = Date.now()
          if (now - lastActivityTime > INACTIVITY_TIMEOUT_MS) {
            throw new Error('Stream timed out - no data received for 45 seconds')
          }
          if (now - streamStartTime > STREAM_TIMEOUT_MS) {
            throw new Error('Stream timed out - total time exceeded')
          }
        }

        let sseBuffer = ''
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

            // Decode incrementally and keep the trailing partial line in the
            // buffer — a `data:` frame can straddle a read boundary, and
            // splitting the raw chunk would drop it.
            sseBuffer += decoder.decode(value, { stream: true })
            const lines = sseBuffer.split('\n')
            sseBuffer = lines.pop() ?? ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.type === 'start') {
                    // Server created the assistant placeholder row and told us
                    // its DB id — stash it so the recovery poll (if this turn
                    // fails) can watch that exact row.
                    if (data.message_id) {
                      activePlaceholderIdRef.current = data.message_id
                    }
                  } else if (data.type === 'status') {
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
                    // The server may have hit an error mid-stream and sent a
                    // fallback message + done event with error=true and the
                    // DB message_id. Re-key the local message to the DB id so
                    // /api/chat/retry can address it, and flag it so the
                    // retry button renders in MessageBubble.
                    if (data.error && data.message_id) {
                      updateMessage(assistantMessageId, { id: data.message_id, error: true })
                      finishStreaming(data.message_id)
                    } else {
                      finishStreaming(assistantMessageId)
                    }
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
            errorMessage = 'The response took too long. Try a shorter prompt or remove URLs from the message.'
          } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
            errorMessage = 'Connection lost. Please check your internet and try again.'
          } else {
            errorMessage = error.message
          }
        }
        setError(errorMessage)
        setStatusMessage(null)
        finishStreaming(assistantMessageId)
        // The server may still be working (it has up to 120s) and could save
        // a real answer after this client-side failure. Poll briefly and
        // surface it if it lands.
        if (activeConversationId) {
          startRecoveryPoll(activeConversationId, assistantMessageId, content, activePlaceholderIdRef.current)
        }
      }
    } finally {
      // If this was a new conversation and the done event never fired (server
      // exception, Vercel timeout), router.replace was never called. Navigate
      // now so the next message uses the correct conversationId instead of
      // creating yet another new conversation.
      if (isNewConversation && activeConversationId && !isNavigatingToNewConversation.current) {
        isNavigatingToNewConversation.current = true
        router.replace(`/chat/${activeConversationId}`)
      }
      // Safety net: clear the message-level isStreaming flag no matter how
      // the request ended (done event, error, stream closed without done,
      // timeout, or unhandled throw). finishStreaming is idempotent in the store.
      finishStreaming(assistantMessageId)
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
    currentProject,
    addMessage,
    updateMessage,
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
    startRecoveryPoll,
    stopRecoveryPoll,
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
    posthog.capture('voice_mode_opened')
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

  // Retry: re-run the failed assistant response. The /api/chat/retry
  // endpoint deletes the failed message server-side, then forwards to
  // /api/chat with skipUserSave=true. We replace the failed bubble with a
  // fresh streaming bubble and pipe the SSE response into it.
  const handleRetry = useCallback(async (failedMessageId: string) => {
    if (!conversationId || isLoading || isSubmittingRef.current) return

    stopRecoveryPoll()
    isSubmittingRef.current = true
    setIsLoading(true)
    setError(null)
    setStatusMessage('Retrying...')
    isStreamingRef.current = true

    // Swap the failed bubble for an empty streaming bubble at the same
    // position. We reuse the failed id for the assistantMessageId so the
    // user sees the retry happen in place.
    const assistantMessageId = `assistant-retry-${Date.now()}`
    updateMessage(failedMessageId, { id: assistantMessageId, content: '', error: false, isStreaming: true })

    try {
      const abortController = new AbortController()
      setAbortController(abortController)

      const response = await fetch('/api/chat/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          retry_message_id: failedMessageId,
          model: currentModel,
        }),
        signal: abortController.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to retry')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let receivedDone = false
      let sseBuffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (!receivedDone) console.warn('Retry stream ended without done event')
            break
          }
          // Buffer incrementally so a `data:` frame split across reads isn't
          // dropped — keep the trailing partial line for the next read.
          sseBuffer += decoder.decode(value, { stream: true })
          const lines = sseBuffer.split('\n')
          sseBuffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
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
                if (data.error && data.message_id) {
                  updateMessage(assistantMessageId, { id: data.message_id, error: true })
                  finishStreaming(data.message_id)
                } else {
                  finishStreaming(assistantMessageId)
                }
              } else if (data.type === 'error') {
                setError(data.message)
                setStatusMessage(null)
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } finally {
        try { reader.cancel() } catch { /* ignore */ }
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        toast.error('Retry failed. Please try again.')
        setError(error instanceof Error ? error.message : 'Retry failed')
      }
      finishStreaming(assistantMessageId)
    } finally {
      finishStreaming(assistantMessageId)
      setIsLoading(false)
      setStatusMessage(null)
      isStreamingRef.current = false
      isSubmittingRef.current = false
      setAbortController(null)
    }
  }, [
    conversationId,
    currentModel,
    isLoading,
    updateMessage,
    appendToStream,
    setCitations,
    finishStreaming,
    setExpandedResearch,
    setIsLoading,
    setError,
    setStatusMessage,
    setAbortController,
    stopRecoveryPoll,
  ])

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
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="min-h-full flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12">
            {/* Orb + headline */}
            <div className="text-center space-y-1.5 md:space-y-2 max-w-2xl mx-auto mb-5 md:mb-7">
              <div className="flex justify-center mb-2 md:mb-4">
                <AnimatedOrb size="md" />
              </div>
              <h2 className="text-lg md:text-3xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                What should we work on?
              </h2>
              <p className="text-xs md:text-base text-muted-foreground/70 max-w-lg mx-auto" style={{ letterSpacing: '0.01em' }}>
                Grounded in real frameworks, war stories, and playbooks from thousands of real-world GTM leaders.
              </p>
            </div>

            {/* Chat input — prominent, centered */}
            <div className="w-full max-w-3xl mb-6 md:mb-8">
              <ChatInput ref={chatInputRef} onSend={handleSendMessage} disabled={isLoading} conversationId={conversationId} onOpenVoiceMode={handleOpenVoiceMode} isLanding />
            </div>

            {/* Compact tiles below the input */}
            <div className="w-full max-w-3xl">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
                {LANDING_TILES.map((tile) => (
                  <button
                    key={tile.guideId}
                    className="text-left px-3 py-2 md:px-3.5 md:py-2.5 rounded-lg bg-card border border-border/40 hover:border-[#0058be]/30 hover:bg-[#0058be]/[0.04] transition-all"
                    onClick={() => {
                      posthog.capture('landing_tile_clicked', { tile: tile.label, guide_id: tile.guideId })
                      chatInputRef.current?.setInput(tile.prompt)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <tile.icon className="shrink-0 w-3.5 h-3.5 text-[#0058be]" />
                      <span className="text-[12px] md:text-[13px] text-foreground/80 font-medium leading-snug line-clamp-1">{tile.hook}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link href="/guides" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-[#0058be] transition-colors">
                  Explore prompt guides <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-hidden min-h-0">
            <MessageList
              messages={messages}
              statusMessage={statusMessage}
              onEditPrompt={handleEditPrompt}
              onRetry={handleRetry}
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

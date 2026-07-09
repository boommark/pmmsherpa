'use client'

/**
 * Interactive project setup assistant — a conversational panel on the project
 * detail page. Sherpa asks what the project is about, proposes project
 * instructions, and offers to draft foundational documents. Progress lives in
 * projects.setup_state; the chat itself is ephemeral (client-held only).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  FileText,
  ListChecks,
  Loader2,
  Minus,
  SkipForward,
  Sparkles,
  Upload,
} from 'lucide-react'
import type { ProjectDetail } from '@/hooks/useProjects'
import {
  advanceSetupStep,
  currentSetupStep,
  isSetupComplete,
  normalizeSetupState,
  resolvedStepCount,
  SETUP_STEP_IDS,
  type SetupState,
  type SetupStepId,
} from '@/lib/projects/setup-state'

const STEP_LABELS: Record<SetupStepId, string> = {
  describe: 'Describe',
  instructions: 'Instructions',
  documents: 'Documents',
}

const KICKOFF_NOTE =
  '[The user just opened the setup assistant for this project. Greet them briefly and ask your first question, adapted to the setup progress.]'

interface Proposal {
  kind: 'instructions' | 'document'
  title?: string
  content: string
  status: 'open' | 'accepted' | 'dismissed'
}

interface SetupMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  hidden?: boolean
  proposal?: Proposal
}

interface SetupAssistantProps {
  project: ProjectDetail
  onSaveInstructions: (instructions: string) => Promise<void>
  onAddDocument: (title: string, content: string) => Promise<void>
  onPersistSetupState: (state: SetupState) => Promise<void>
  onUploadRequest: () => void
}

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Wire format sent to /setup — drafts inlined so the model can revise them. */
function toWire(messages: SetupMessage[]) {
  return messages
    .filter((m) => m.content.trim() || m.proposal)
    .map((m) => ({
      role: m.role,
      content: m.proposal
        ? `${m.content}\n\n[Draft ${
            m.proposal.kind === 'instructions'
              ? 'project instructions'
              : `document "${m.proposal.title ?? 'Untitled'}"`
          } shown to the user (${m.proposal.status}):]\n${m.proposal.content}`
        : m.content,
    }))
}

function StepIndicator({
  step,
  state,
  current,
}: {
  step: SetupStepId
  state: SetupState
  current: SetupStepId | null
}) {
  const status = state.steps[step]
  const isCurrent = current === step
  return (
    <div className="flex items-center gap-1.5">
      {status === 'completed' ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-600/15">
          <Check className="h-2.5 w-2.5 text-green-600 dark:text-green-500" />
        </span>
      ) : status === 'skipped' ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-muted">
          <Minus className="h-2.5 w-2.5 text-muted-foreground" />
        </span>
      ) : isCurrent ? (
        <span className="flex h-4 w-4 items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0058be]" />
        </span>
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
      )}
      <span
        className={`text-xs ${
          isCurrent
            ? 'font-semibold text-foreground'
            : status === 'pending'
              ? 'text-muted-foreground/70'
              : 'text-muted-foreground'
        }`}
      >
        {STEP_LABELS[step]}
        {status === 'skipped' && <span className="ml-1 text-[10px]">(skipped)</span>}
      </span>
    </div>
  )
}

function ProposalCard({
  proposal,
  busy,
  onAccept,
  onReject,
}: {
  proposal: Proposal
  busy: boolean
  onAccept: () => void
  onReject: () => void
}) {
  const isInstructions = proposal.kind === 'instructions'
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-[#0058be]/25 bg-[#0058be]/[0.04]">
      <div className="flex items-center gap-2 border-b border-[#0058be]/15 px-3 py-2">
        {isInstructions ? (
          <ListChecks className="h-3.5 w-3.5 shrink-0 text-[#0058be] dark:text-[#a8c0f0]" />
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-[#0058be] dark:text-[#a8c0f0]" />
        )}
        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
          {isInstructions ? 'Proposed project instructions' : proposal.title || 'Proposed document'}
        </span>
        {proposal.status === 'accepted' && (
          <Badge variant="outline" className="gap-1 border-green-600/30 text-[10px] text-green-600 dark:text-green-500">
            <Check className="h-2.5 w-2.5" />
            {isInstructions ? 'Saved' : 'Added'}
          </Badge>
        )}
        {proposal.status === 'dismissed' && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            {isInstructions ? 'Skipped' : 'Discarded'}
          </Badge>
        )}
      </div>
      <div className="max-h-56 overflow-y-auto px-3 py-2">
        <div className="prose prose-sm dark:prose-invert max-w-none text-[13px] [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposal.content}</ReactMarkdown>
        </div>
      </div>
      {proposal.status === 'open' && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[#0058be]/15 px-3 py-2">
          <Button
            size="sm"
            className="h-7 bg-[#0058be] text-white shadow-none hover:bg-[#004a9e]"
            disabled={busy}
            onClick={onAccept}
          >
            {busy ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Check className="mr-1.5 h-3 w-3" />}
            {isInstructions ? 'Accept & save' : 'Add to project'}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-muted-foreground" disabled={busy} onClick={onReject}>
            {isInstructions ? 'Skip this step' : 'Discard'}
          </Button>
          <span className="text-[11px] text-muted-foreground">or reply below to request changes</span>
        </div>
      )}
    </div>
  )
}

export function SetupAssistant({
  project,
  onSaveInstructions,
  onAddDocument,
  onPersistSetupState,
  onUploadRequest,
}: SetupAssistantProps) {
  const initialState = normalizeSetupState(project.setupState)
  const [setupState, setSetupState] = useState<SetupState>(initialState)
  const [messages, setMessages] = useState<SetupMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(
    () =>
      project.documents.length === 0 &&
      !project.instructions &&
      !initialState.dismissed &&
      !isSetupComplete(initialState),
  )

  const stateRef = useRef(setupState)
  stateRef.current = setupState
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const kickoffFired = useRef(false)
  const prevDocCount = useRef(project.documents.length)
  // Set when accepting a drafted document (which bumps documents.length via
  // onAddDocument). The doc-count watcher consumes it to skip its own note +
  // advance for that bump, so accepted drafts don't double-fire while
  // page-side manual uploads still trigger the watcher.
  const skipDocWatcherRef = useRef(false)
  const threadRef = useRef<HTMLDivElement>(null)

  const complete = isSetupComplete(setupState)
  const current = currentSetupStep(setupState)
  const resolved = resolvedStepCount(setupState)

  const setAllMessages = useCallback((next: SetupMessage[]) => {
    messagesRef.current = next
    setMessages(next)
  }, [])

  const persistState = useCallback(
    (next: SetupState) => {
      stateRef.current = next
      setSetupState(next)
      onPersistSetupState(next).catch((err) => {
        console.error('[SetupAssistant] failed to persist setup state:', err)
      })
    },
    [onPersistSetupState],
  )

  const advanceAndPersist = useCallback(
    (step: SetupStepId, status: 'completed' | 'skipped') => {
      if (stateRef.current.steps[step] !== 'pending') return
      persistState(advanceSetupStep(stateRef.current, step, status))
    },
    [persistState],
  )

  const runTurn = useCallback(
    async (history: SetupMessage[]) => {
      setSending(true)
      const assistantId = makeId()
      setAllMessages([...history, { id: assistantId, role: 'assistant', content: '' }])

      const patchAssistant = (patch: (m: SetupMessage) => SetupMessage) => {
        const next = messagesRef.current.map((m) => (m.id === assistantId ? patch(m) : m))
        messagesRef.current = next
        setMessages(next)
      }

      try {
        const res = await fetch(`/api/projects/${project.id}/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: toWire(history) }),
        })
        if (!res.ok || !res.body) {
          let message = 'Setup assistant is unavailable right now'
          try {
            const json = (await res.json()) as { error?: string }
            if (json?.error) message = json.error
          } catch {
            // keep fallback
          }
          throw new Error(message)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let data: any
            try {
              data = JSON.parse(line.slice(6))
            } catch {
              continue
            }
            if (data.type === 'text' && typeof data.content === 'string') {
              patchAssistant((m) => ({ ...m, content: m.content + data.content }))
            } else if (data.type === 'action') {
              const payload = data.payload ?? {}
              if (data.action === 'propose_instructions' && typeof payload.instructions === 'string') {
                patchAssistant((m) => ({
                  ...m,
                  proposal: { kind: 'instructions', content: payload.instructions, status: 'open' },
                }))
                advanceAndPersist('describe', 'completed')
              } else if (
                data.action === 'propose_document' &&
                typeof payload.title === 'string' &&
                typeof payload.content === 'string'
              ) {
                patchAssistant((m) => ({
                  ...m,
                  proposal: {
                    kind: 'document',
                    title: payload.title,
                    content: payload.content,
                    status: 'open',
                  },
                }))
              }
            } else if (data.type === 'error') {
              throw new Error(typeof data.message === 'string' ? data.message : 'Setup assistant failed')
            }
          }
        }
      } catch (err) {
        console.error('[SetupAssistant] turn failed:', err)
        patchAssistant((m) =>
          m.content || m.proposal
            ? m
            : { ...m, content: 'Sorry — something went wrong on my end. Please try again.' },
        )
        toast.error(err instanceof Error ? err.message : 'Setup assistant failed')
      } finally {
        setSending(false)
      }
    },
    [project.id, setAllMessages, advanceAndPersist],
  )

  // Kickoff: Sherpa speaks first when the panel opens on an empty thread.
  useEffect(() => {
    if (!expanded || kickoffFired.current || sending) return
    if (messagesRef.current.length > 0) return
    if (isSetupComplete(stateRef.current)) return
    kickoffFired.current = true
    runTurn([{ id: makeId(), role: 'user', content: KICKOFF_NOTE, hidden: true }])
  }, [expanded, sending, runTurn])

  // A document appearing while the documents step is pending resolves it
  // (covers uploads triggered from the page's existing upload flow).
  useEffect(() => {
    const count = project.documents.length
    if (count > prevDocCount.current) {
      if (skipDocWatcherRef.current) {
        // This bump came from accepting a drafted document; handleAcceptProposal
        // already appended its note and advanced the step. Consume the flag.
        skipDocWatcherRef.current = false
      } else if (stateRef.current.steps.documents === 'pending') {
        advanceAndPersist('documents', 'completed')
        setAllMessages([
          ...messagesRef.current,
          { id: makeId(), role: 'user', content: '[User added a document to the project.]', hidden: true },
        ])
      }
    }
    prevDocCount.current = count
  }, [project.documents.length, advanceAndPersist, setAllMessages])

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    runTurn([...messagesRef.current, { id: makeId(), role: 'user', content: text }])
  }

  const handleSkipStep = () => {
    if (!current || sending) return
    advanceAndPersist(current, 'skipped')
    runTurn([
      ...messagesRef.current,
      {
        id: makeId(),
        role: 'user',
        content: `[User skipped the ${current} step. Continue with what's next.]`,
        hidden: true,
      },
    ])
  }

  const handleDismiss = () => {
    persistState({ ...stateRef.current, dismissed: true })
    setExpanded(false)
  }

  const markProposal = (messageId: string, status: Proposal['status']) => {
    const next = messagesRef.current.map((m) =>
      m.id === messageId && m.proposal ? { ...m, proposal: { ...m.proposal, status } } : m,
    )
    messagesRef.current = next
    setMessages(next)
  }

  const handleAcceptProposal = async (message: SetupMessage) => {
    const proposal = message.proposal
    if (!proposal || sending || busyProposalId) return
    setBusyProposalId(message.id)
    try {
      if (proposal.kind === 'instructions') {
        await onSaveInstructions(proposal.content)
        markProposal(message.id, 'accepted')
        advanceAndPersist('describe', 'completed')
        advanceAndPersist('instructions', 'completed')
        toast.success('Project instructions saved')
        runTurn([
          ...messagesRef.current,
          {
            id: makeId(),
            role: 'user',
            content: '[User accepted the proposed project instructions — they are now saved.]',
            hidden: true,
          },
        ])
      } else {
        // Tell the doc-count watcher to ignore the bump this upload causes —
        // we append our own note and advance the step below.
        skipDocWatcherRef.current = true
        await onAddDocument(proposal.title || 'Untitled document', proposal.content)
        markProposal(message.id, 'accepted')
        advanceAndPersist('documents', 'completed')
        toast.success('Document added to project')
        runTurn([
          ...messagesRef.current,
          {
            id: makeId(),
            role: 'user',
            content: `[User added the drafted document "${proposal.title}" to the project — it's now processing.]`,
            hidden: true,
          },
        ])
      }
    } catch (err) {
      // The upload failed, so no count bump is coming — clear the guard so it
      // doesn't swallow a later legitimate manual upload.
      skipDocWatcherRef.current = false
      toast.error(
        err instanceof Error
          ? err.message
          : proposal.kind === 'instructions'
            ? 'Failed to save instructions'
            : 'Failed to add document',
      )
    } finally {
      setBusyProposalId(null)
    }
  }

  const handleRejectProposal = (message: SetupMessage) => {
    const proposal = message.proposal
    if (!proposal || sending || busyProposalId) return
    markProposal(message.id, 'dismissed')
    if (proposal.kind === 'instructions') {
      advanceAndPersist('instructions', 'skipped')
      runTurn([
        ...messagesRef.current,
        {
          id: makeId(),
          role: 'user',
          content: '[User skipped the instructions step (declined the proposed instructions). Continue with what\'s next.]',
          hidden: true,
        },
      ])
    } else {
      setAllMessages([
        ...messagesRef.current,
        {
          id: makeId(),
          role: 'user',
          content: `[User discarded the drafted document "${proposal.title}".]`,
          hidden: true,
        },
      ])
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mb-8 flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <span className="flex min-w-0 items-center gap-2">
          {complete ? (
            <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
          ) : (
            <Sparkles className="h-4 w-4 shrink-0 text-[#0058be] dark:text-[#a8c0f0]" />
          )}
          <span className="truncate text-sm font-medium">
            {complete
              ? 'Setup complete'
              : resolved > 0
                ? `Continue setup (${resolved}/${SETUP_STEP_IDS.length})`
                : 'Setup assistant'}
          </span>
          {!complete && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Sherpa can help you set up this project
            </span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    )
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-border/60 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-[#0058be] dark:text-[#a8c0f0]" />
          <span className="text-sm font-semibold">Project setup</span>
          {!complete && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              {resolved}/{SETUP_STEP_IDS.length}
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!complete && !setupState.dismissed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={handleDismiss}
            >
              Set up later
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Collapse"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border/60 px-4 py-2.5">
        {SETUP_STEP_IDS.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
            <StepIndicator step={step} state={setupState} current={current} />
          </div>
        ))}
      </div>

      {/* Thread */}
      <div ref={threadRef} className="max-h-[380px] space-y-4 overflow-y-auto px-4 py-4">
        {messages.filter((m) => !m.hidden).length === 0 && sending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Sherpa is getting ready...
          </div>
        )}
        {messages
          .filter((m) => !m.hidden)
          .map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#0058be] px-3.5 py-2 text-sm text-white">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="text-sm">
                {m.content ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>:first-child]:mt-0 [&>:last-child]:mb-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                ) : sending && !m.proposal ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : null}
                {m.proposal && (
                  <ProposalCard
                    proposal={m.proposal}
                    busy={busyProposalId === m.id}
                    onAccept={() => handleAcceptProposal(m)}
                    onReject={() => handleRejectProposal(m)}
                  />
                )}
              </div>
            ),
          )}
        {complete && !sending && (
          <div className="flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/[0.06] px-3 py-2 text-xs text-green-700 dark:text-green-400">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Setup finished — start chatting in this project whenever you&apos;re ready.
          </div>
        )}
      </div>

      {/* Step actions */}
      {!complete && (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
          {current === 'documents' && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={sending}
              onClick={onUploadRequest}
            >
              <Upload className="mr-1.5 h-3 w-3" />
              Upload files
            </Button>
          )}
          {current && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              disabled={sending}
              onClick={handleSkipStep}
            >
              <SkipForward className="mr-1.5 h-3 w-3" />
              Skip {STEP_LABELS[current].toLowerCase()} step
            </Button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3">
        <Input
          value={input}
          placeholder="Reply to Sherpa..."
          disabled={sending}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 bg-[#0058be] text-white shadow-none hover:bg-[#004a9e]"
          disabled={!input.trim() || sending}
          onClick={handleSend}
          title="Send"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

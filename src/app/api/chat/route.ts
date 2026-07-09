import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'
import { getMonthlyLimitForTier, getEffectiveTier } from '@/lib/constants'
import { getModel, buildMessages, getModelDisplayName, getDbModelValue, MODEL_CONFIG, type ModelProvider } from '@/lib/llm/provider-factory'
import { multiQueryRetrieve, formatContextForPrompt, extractCitations } from '@/lib/rag/retrieval'
import {
  retrieveProjectContext,
  getProjectPromptContext,
  formatProjectContextForPrompt,
  extractProjectCitations,
} from '@/lib/projects/retrieval'
import type { Citation } from '@/types/database'
import { planQueries } from '@/lib/rag/query-planner'
import { conductResearch } from '@/lib/llm/perplexity-client'
import { extractUrls, scrapeUrls } from '@/lib/url-scraper'
import { searchAndFetch } from '@/lib/web/brave-search'
import type { ChatAttachment, WebCitation } from '@/types/chat'
import { trackCost, calculateCost } from '@/lib/cost-tracker'
import { pollUntilDone as pollLlamaParse } from '@/lib/llamaparse'
import { scanInput, scanOutput, SAFE_RESPONSE, CANARY_TOKEN } from '@/lib/prompt-guard'
import { initLogger } from 'braintrust'
import { getPostHogClient } from '@/lib/posthog-server'
import { startActiveObservation, setActiveTraceIO } from '@langfuse/tracing'
import { LangfuseOtelSpanAttributes } from '@langfuse/core'
import { waitUntil } from '@vercel/functions'
import { langfuseSpanProcessor } from '@/instrumentation'
import { getActiveTraceId } from '@/lib/observability/trace'

const resend = new Resend(process.env.RESEND_API_KEY)

// Phase tracking: when the chat request fails, we tag the failure with the
// stage it died in so the fallback message can speak to the actual problem
// and ops can group failures by class. See logChatError + fallbackForPhase.
type ChatPhase =
  | 'guard_blocked'
  | 'history_load'
  | 'url_scrape'
  | 'attachments'
  | 'query_planner'
  | 'rag'
  | 'web_research'
  | 'llm_stream'
  | 'unknown'

function fallbackForPhase(phase: ChatPhase): string {
  switch (phase) {
    case 'url_scrape':
      return "I couldn't read the URL you shared. The site likely has bot protection. Paste the relevant copy from the page here and I'll work with that. Tap retry to try the URL again."
    case 'attachments':
      return "I had trouble reading your attachment. Try re-uploading the file, or paste its contents here. Tap retry to try again."
    case 'query_planner':
    case 'rag':
      return "Something hiccuped while I was preparing your answer. Tap retry to try again."
    case 'web_research':
      return "Web research timed out. Tap retry to try again — or rephrase without asking for current/recent data."
    case 'llm_stream':
      return "I hit an error from the model. Tap retry to try again, or switch models in the input bar below."
    case 'guard_blocked':
      return "I'm here to help with product marketing. What can I work on with you? Whether it's positioning, competitive analysis, GTM strategy, or creating deliverables, I'm ready to dive in."
    default:
      return "Something failed mid-response. Tap retry to try again."
  }
}

// chat_errors is super-admin RLS-only, so writes go through the service client.
// Fire-and-forget — never block the response on a logging failure.
async function logChatError(params: {
  userId: string
  conversationId: string | null
  messageId: string | null
  phase: ChatPhase
  errorClass?: string | null
  errorMessage?: string | null
  userMessageExcerpt?: string | null
}): Promise<void> {
  try {
    const admin = await createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('chat_errors') as any).insert({
      user_id: params.userId,
      conversation_id: params.conversationId,
      message_id: params.messageId,
      phase: params.phase,
      error_class: params.errorClass ?? null,
      error_message: params.errorMessage ?? null,
      user_message_excerpt: params.userMessageExcerpt ?? null,
    })
  } catch (e) {
    console.error('[ChatErrors] log failed:', e)
  }
}

async function handleAbuseEvent(
  userId: string,
  email: string,
  rawMessage: string,
  patternMatched: string | null,
  eventType: string
) {
  const [adminClient] = await Promise.all([createServiceClient()])
  await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminClient.from('abuse_events') as any).insert({
      user_id: userId,
      email,
      event_type: eventType,
      pattern_matched: patternMatched,
      raw_message: rawMessage,
    }),
    resend.emails.send({
      from: 'PMM Sherpa <support@pmmsherpa.com>',
      to: SUPER_ADMIN_EMAIL,
      subject: `[ABUSE ALERT] ${eventType} — ${email}`,
      html: `<p><strong>Event:</strong> ${eventType}</p>
<p><strong>User:</strong> ${email} (${userId})</p>
<p><strong>Pattern matched:</strong> <code>${patternMatched ?? 'n/a'}</code></p>
<p><strong>Message:</strong></p>
<blockquote style="border-left:3px solid #e53e3e;padding:8px 16px;color:#555;margin:0">${rawMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</blockquote>`,
    }),
  ])
}

const btLogger = initLogger({
  projectName: 'PMMSherpa',
  apiKey: process.env.BRAINTRUST_API_KEY,
})

export const runtime = 'nodejs'
export const maxDuration = 120

// Token budget per context section (rough estimate: 1 token ≈ 4 chars)
// Total budget ~40K tokens leaves plenty of room for system prompt + output
const TOKEN_BUDGETS = {
  conversationHistory: 12000, // ~48K chars — keeps last N messages that fit
  ragContext: 8000,           // ~32K chars — 10 chunks is usually well within this
  urlContent: 16000,          // ~64K chars — full page content for accurate analysis
  perplexityContent: 4000,    // ~16K chars — web research summary
  attachments: 6000,          // ~24K chars — attachment text
}

function truncateToTokenBudget(text: string, tokenBudget: number): string {
  const charBudget = tokenBudget * 4
  if (text.length <= charBudget) return text
  return text.slice(0, charBudget) + '\n\n[Content truncated to fit context window]'
}

function truncateHistory(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  tokenBudget: number
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const charBudget = tokenBudget * 4
  let totalChars = 0
  const result: Array<{ role: 'user' | 'assistant'; content: string }> = []

  // Walk backwards (most recent first), keep messages that fit
  for (let i = history.length - 1; i >= 0; i--) {
    const msgChars = history[i].content.length
    if (totalChars + msgChars > charBudget) break
    totalChars += msgChars
    result.unshift(history[i])
  }

  return result
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { message, conversationId, model, attachments, skipUserSave, project_id: projectIdFromBody } = body as {
      message: string
      conversationId?: string
      model: ModelProvider
      attachments?: ChatAttachment[]
      skipUserSave?: boolean
      project_id?: string
    }

    if (!model) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Allow empty message if there are attachments
    const hasMessage = message && message.trim()
    const hasAttachments = attachments && attachments.length > 0
    if (!hasMessage && !hasAttachments) {
      return new Response('Message or attachments required', { status: 400 })
    }

    // ========================================
    // Projects P2: resolve + authorize project context
    // ========================================
    // The conversation row's project_id is authoritative once set (the
    // project is locked when the conversation starts); the body's project_id
    // seeds it on the first turn. Ownership is verified explicitly against
    // the authed user — load-bearing, because project retrieval below runs
    // on the service-role client and bypasses RLS (same pattern as
    // src/lib/projects/auth.ts). Project chunks must NEVER reach a
    // conversation whose project_id doesn't match.
    let activeProject: { id: string; name: string } | null = null
    {
      let conversationProjectId: string | null = null
      if (conversationId) {
        // User-scoped client: RLS guarantees this is the caller's conversation.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: convRow, error: convErr } = await (supabase.from('conversations') as any)
          .select('id, project_id')
          .eq('id', conversationId)
          .maybeSingle()
        if (convErr || !convRow) {
          return new Response(
            JSON.stringify({ error: 'Conversation not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          )
        }
        conversationProjectId = convRow.project_id ?? null
      }

      const effectiveProjectId =
        conversationProjectId ||
        (typeof projectIdFromBody === 'string' && projectIdFromBody ? projectIdFromBody : null)

      if (effectiveProjectId) {
        if (!/^[0-9a-f-]{36}$/i.test(effectiveProjectId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid project id' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }
        const adminClient = await createServiceClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: projRow, error: projErr } = await (adminClient.from('projects') as any)
          .select('id, user_id, name')
          .eq('id', effectiveProjectId)
          .maybeSingle()
        if (projErr) {
          console.error('[Projects] chat project lookup failed:', projErr)
          return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }
        if (!projRow || projRow.user_id !== user.id) {
          // 404 (not 403) — don't leak project existence to non-owners.
          return new Response(
            JSON.stringify({ error: 'Project not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          )
        }
        activeProject = { id: projRow.id, name: projRow.name }

        // Persist the project on the conversation at first use so every
        // later turn (and /api/chat/retry) inherits it server-side.
        if (conversationId && !conversationProjectId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: linkErr } = await (supabase.from('conversations') as any)
            .update({ project_id: projRow.id })
            .eq('id', conversationId)
          if (linkErr) {
            console.error('[Projects] failed to link conversation to project:', linkErr)
          }
        }
      }
    }

    // ========================================
    // Save user message immediately (before any RAG/LLM work)
    // ========================================
    // Why: prior to this, the user message was only persisted at the END of
    // the streaming success path (after RAG, URL scrape, LLM completion).
    // Anything that threw between POST entry and that final save left the
    // conversation as a ghost row in the sidebar with zero messages — the
    // dominant cause of "blank response" reports. Saving up front means
    // failures are recoverable threads, not silent ghosts.
    // skipUserSave is set by /api/chat/retry — the user message already
    // exists in the conversation and was kept while the failed assistant
    // message was deleted. We don't want to insert a duplicate.
    let userMessageId: string | null = null
    if (conversationId && !skipUserSave) {
      const userContent = message || (hasAttachments ? '[Attached file(s)]' : '')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: insertedUser, error: userInsertErr } = await (supabase.from('messages') as any).insert({
        conversation_id: conversationId,
        role: 'user',
        content: userContent,
        model: null,
        citations: [],
      }).select('id').single()
      if (userInsertErr) {
        console.error('[Chat] Failed to persist user message up-front:', userInsertErr)
      } else {
        userMessageId = insertedUser?.id ?? null
      }
    }

    // Scan for prompt extraction attempts
    if (hasMessage) {
      const guardResult = scanInput(message)
      if (guardResult.blocked) {
        // Fire-and-forget abuse log + admin email — but only for true
        // injection attempts. Bulk enumeration is blocked quietly: those
        // are usually curious users, not attackers, and alerting on them
        // fires abuse emails at innocent people.
        if (guardResult.category === 'injection') {
          handleAbuseEvent(user.id, user.email ?? '', message, guardResult.matchedPattern, 'prompt_injection')
            .catch(err => console.error('[PromptGuard] Abuse logging failed:', err))
        }

        // Save SAFE_RESPONSE as a real assistant message instead of a
        // streaming-only reply. This replaces the previous ghost-cleanup
        // pattern (which raced lambda freeze and left dead conversations).
        // The blocked exchange now sits in the sidebar like any other thread.
        if (conversationId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('messages') as any).insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: SAFE_RESPONSE,
            model: null,
            citations: [],
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('conversations') as any)
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId)
        }

        // Diagnostic row so blocked attempts are countable in chat_errors too
        waitUntil(logChatError({
          userId: user.id,
          conversationId: conversationId ?? null,
          messageId: userMessageId,
          phase: 'guard_blocked',
          errorClass: guardResult.category === 'injection' ? 'prompt_injection' : 'bulk_enumeration',
          errorMessage: guardResult.matchedPattern,
          userMessageExcerpt: message?.slice(0, 200) ?? null,
        }))

        const encoder = new TextEncoder()
        const safeStream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: SAFE_RESPONSE })}\n\n`))
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
            controller.close()
          },
        })
        return new Response(safeStream, {
          headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
        })
      }
    }

    // ========================================
    // Monthly usage gate (Phase 1 — GATE-01..05)
    // ========================================
    // Pre-LLM: (a) lazy-reset the counter if period_start is in a prior
    // calendar month, (b) SELECT tier + messages_used_this_period,
    // (c) decide in JS whether to 429. NO increment here — the increment
    // is an atomic RPC call in the post-LLM block (see Task 2b).
    //
    // Race note: a user at exactly 9/10 with concurrent requests could
    // still get 1 extra message (pre-check is SELECT + JS comparison,
    // not atomic). Acceptable tradeoff for keeping "failed requests
    // don't count" simple.
    const currentMonthStart = new Date()
    currentMonthStart.setUTCDate(1)
    currentMonthStart.setUTCHours(0, 0, 0, 0)
    const currentMonthStartIso = currentMonthStart.toISOString().slice(0, 10) // "YYYY-MM-DD"

    // Lazy reset: if the stored period_start is in a prior month, bring
    // it forward and zero the counter. Matches exactly zero or one row.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: gateRow, error: gateError } = await (supabase.from('profiles') as any)
      .update({
        period_start: currentMonthStartIso,
        messages_used_this_period: 0,
      })
      .eq('id', user.id)
      .lt('period_start', currentMonthStartIso)
      .select('tier, starter_access_until, messages_used_this_period, period_start')
      .maybeSingle()

    if (gateError) {
      console.error('[UsageGate] Lazy reset error:', gateError)
    }

    // Read current state. If the lazy reset matched, gateRow is the new
    // row; otherwise SELECT it directly.
    let tier: string
    let messagesUsed: number

    if (gateRow) {
      tier = getEffectiveTier(gateRow.tier, gateRow.starter_access_until)
      messagesUsed = gateRow.messages_used_this_period // 0 after reset
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileRow, error: profileError } = await (supabase.from('profiles') as any)
        .select('tier, starter_access_until, messages_used_this_period')
        .eq('id', user.id)
        .single()

      if (profileError || !profileRow) {
        console.error('[UsageGate] Failed to read profile:', profileError)
        return new Response(
          JSON.stringify({ error: 'profile_read_failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      tier = getEffectiveTier(profileRow.tier, profileRow.starter_access_until)
      messagesUsed = profileRow.messages_used_this_period
    }

    // Gate: per-tier cap. Founders bypass entirely (Infinity). Free=10,
    // Starter=200. See getMonthlyLimitForTier in src/lib/constants.ts.
    const monthlyLimit = getMonthlyLimitForTier(tier)
    if (messagesUsed >= monthlyLimit) {
      // Build reset_at = first day of NEXT calendar month at UTC midnight.
      const now = new Date()
      const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
      const resetAtIso = resetAt.toISOString().replace(/\.\d{3}Z$/, 'Z') // "2026-05-01T00:00:00Z"

      console.log(`[UsageGate] User ${user.email} hit monthly limit: ${messagesUsed}/${monthlyLimit} (tier=${tier}), resets ${resetAtIso}`)

      getPostHogClient().capture({
        distinctId: user.id,
        event: 'usage_limit_hit',
        properties: {
          email: user.email,
          tier,
          messages_used: messagesUsed,
          limit: monthlyLimit,
          resets_at: resetAtIso,
        },
      })

      const upgradeMessage = tier === 'free'
        ? 'Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.'
        : 'You\'ve hit your monthly message cap. Your quota resets on the 1st of next month.'

      return new Response(
        JSON.stringify({
          error: 'message_limit_exceeded',
          limit: monthlyLimit,
          reset_at: resetAtIso,
          message: upgradeMessage,
          upgrade_url: '/pricing',
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    // Gate passed — control falls through to the SSE stream below.
    // Post-LLM increment lives in Task 2b (calls supabase.rpc('increment_messages_used', ...)).

    // Create streaming response with status updates
    const stream = new ReadableStream({
      async start(controller) {
        const sendStatus = (status: string) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', message: status })}\n\n`)
          )
        }

        // Track which stage we're in so the catch handler can write a
        // phase-aware fallback message + chat_errors row.
        let currentPhase: ChatPhase = 'unknown'

        await startActiveObservation('sherpa.chat.request', async (span) => {
          const traceInput = { message, model, hasAttachments: !!hasAttachments }
          span.update({
            input: traceInput,
            metadata: {
              userId: user.id,
              sessionId: conversationId,
              surface: 'web',
              endpoint: '/api/chat',
            },
          })
          // Populate trace-level fields (input/output/name/userId/sessionId)
          setActiveTraceIO({ input: traceInput })
          span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_NAME, 'sherpa.chat.request')
          span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_USER_ID, user.id)
          span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_TAGS, ['surface:web'])
          if (conversationId) {
            span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_SESSION_ID, conversationId)
          }

        try {
          // ========================================
          // PHASE 1: Gather all inputs (parallel)
          // ========================================
          currentPhase = 'history_load'
          sendStatus('Loading conversation context...')

          // Detect URLs in the message
          const detectedUrls = message ? extractUrls(message) : []
          const hasUrls = detectedUrls.length > 0

          // Gather inputs in parallel: conversation history, URL scraping, attachment processing.
          // We persisted the new user message up-front (see top of POST handler), so it's
          // already in this conversation's messages table. Limit 11 + filter by id keeps
          // history at last 10 turns BEFORE the current turn — the new turn is passed
          // separately to buildMessages() further down.
          const historyPromise = conversationId
            ? supabase
                .from('messages')
                .select('id, role, content, created_at')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(11)
            : Promise.resolve({ data: null, error: null })

          const urlScrapePromise = hasUrls
            ? scrapeUrls(detectedUrls, user.id).catch(err => {
                console.error('URL scraping error:', err)
                return ''
              })
            : Promise.resolve('')

          const [historyResult, scrapedUrlContent] = await Promise.all([
            historyPromise,
            urlScrapePromise,
          ])

          // Process conversation history (truncate to budget — keeps most recent messages that fit)
          let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
          if (historyResult.data && Array.isArray(historyResult.data)) {
            // Drop the just-saved user message (we pass it separately as processedMessage),
            // then reverse to chronological order and trim to last 10.
            const filtered = (historyResult.data as Array<{ id: string; role: string; content: string }>)
              .filter(m => m.id !== userMessageId)
              .slice(0, 10)
            const chronologicalMessages = filtered.reverse()
            const fullHistory = chronologicalMessages.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }))
            conversationHistory = truncateHistory(fullHistory, TOKEN_BUDGETS.conversationHistory)
            console.log(`Loaded ${fullHistory.length} messages, kept ${conversationHistory.length} within token budget for ${conversationId}`)
          }
          if (historyResult.error) {
            console.error('Error fetching conversation history:', historyResult.error)
          }

          // Truncate URL content to budget
          const truncatedUrlContent = scrapedUrlContent
            ? truncateToTokenBudget(scrapedUrlContent, TOKEN_BUDGETS.urlContent)
            : ''

          if (hasUrls) {
            console.log(`[URL Scraping] Detected ${detectedUrls.length} URLs: ${detectedUrls.join(', ')}`)
            console.log(`[URL Scraping] Scraped content length: ${scrapedUrlContent.length} chars, truncated to: ${truncatedUrlContent.length} chars`)
            if (!scrapedUrlContent) {
              console.warn('[URL Scraping] WARNING: URL scraping returned empty content!')
            }
          }

          // Build the full set of attachments to include in this turn's
          // context. Two sources:
          //   1. `attachments` from this request — what the client just
          //      uploaded or is re-sending with this message
          //   2. `conversation_attachments` for this conversationId —
          //      everything attached earlier in the conversation, so the
          //      assistant "remembers" files across turns AND so stuck
          //      attachments from earlier turns can be re-polled here
          type AttachmentRow = {
            id: string
            file_name: string
            file_type: string
            extracted_text: string | null
            llamaparse_job_id: string | null
            processing_status: string | null
          }

          const attachmentsById = new Map<
            string,
            {
              id: string
              fileName: string
              fileType: string
              clientText?: string
            }
          >()

          if (hasAttachments && attachments) {
            for (const a of attachments) {
              attachmentsById.set(a.id, {
                id: a.id,
                fileName: a.fileName,
                fileType: a.fileType,
                clientText: a.extractedText ?? undefined,
              })
            }

            // If the client uploaded these before a conversation existed
            // (so they were saved with conversation_id = NULL under /temp/),
            // link them to this conversation now that we know its id.
            // Without this, the next turn's "fetch by conversation_id"
            // query wouldn't find them and the assistant would forget the
            // file entirely.
            if (conversationId) {
              const ids = attachments.map((a) => a.id).filter(Boolean)
              if (ids.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: linkErr } = await (supabase.from('conversation_attachments') as any)
                  .update({ conversation_id: conversationId })
                  .in('id', ids)
                  .eq('user_id', user.id)
                  .is('conversation_id', null)
                if (linkErr) {
                  console.warn('[Attachments] Failed to link temp attachments to conversation:', linkErr)
                }
              }
            }
          }

          if (conversationId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: priorRows } = await (supabase.from('conversation_attachments') as any)
              .select('id, file_name, file_type, extracted_text, llamaparse_job_id, processing_status')
              .eq('conversation_id', conversationId)
              .eq('user_id', user.id)
              .order('created_at', { ascending: true })
            const rows = (priorRows || []) as AttachmentRow[]
            for (const row of rows) {
              if (!attachmentsById.has(row.id)) {
                attachmentsById.set(row.id, {
                  id: row.id,
                  fileName: row.file_name,
                  fileType: row.file_type,
                })
              }
            }
          }

          let attachmentContext = ''
          if (attachmentsById.size > 0) {
            let announcedParseWait = false
            for (const attachment of attachmentsById.values()) {
              let text: string | undefined = attachment.clientText
              if (!text) {
                // Fetch the current DB state — may already be completed,
                // may still be processing with a job_id.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: dbAttachment } = await (supabase.from('conversation_attachments') as any)
                  .select('extracted_text, llamaparse_job_id, processing_status')
                  .eq('id', attachment.id)
                  .maybeSingle()

                if (dbAttachment?.extracted_text) {
                  text = dbAttachment.extracted_text as string
                  console.log(`[Attachments] Using persisted extracted_text for ${attachment.fileName}`)
                } else if (
                  dbAttachment?.llamaparse_job_id &&
                  dbAttachment.processing_status === 'processing'
                ) {
                  if (!announcedParseWait) {
                    sendStatus('Reading your document...')
                    announcedParseWait = true
                  }
                  const parsed = await pollLlamaParse(
                    dbAttachment.llamaparse_job_id as string,
                    25_000, // 25s budget — most jobs finish well under this
                  )
                  if (parsed) {
                    text = parsed
                    console.log(
                      `[Attachments] Finalized LlamaParse for ${attachment.fileName}: ${parsed.length} chars`,
                    )
                    // Persist so future sends skip the poll entirely
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from('conversation_attachments') as any)
                      .update({
                        extracted_text: parsed,
                        processing_status: 'completed',
                      })
                      .eq('id', attachment.id)
                  } else {
                    console.warn(
                      `[Attachments] LlamaParse still running after 25s for ${attachment.fileName}`,
                    )
                  }
                }
              }
              if (text) {
                attachmentContext += `\n\n--- Attached File: ${attachment.fileName} ---\n${text}\n--- End of ${attachment.fileName} ---`
              } else {
                attachmentContext += `\n\n[Attached file: ${attachment.fileName} (${attachment.fileType}) — parsing in progress, content will be available on your next message]`
              }
            }
            attachmentContext = truncateToTokenBudget(attachmentContext, TOKEN_BUDGETS.attachments)
          }

          // ========================================
          // PHASE 2: Plan queries + Retrieve (parallel)
          // ========================================
          currentPhase = 'query_planner'
          sendStatus('Analyzing your question...')

          const queryPlan = await planQueries({
            message: message || (attachments ? attachments.map(a => a.fileName).join(' ') : ''),
            conversationHistory,
            scrapedUrlContent: truncatedUrlContent || undefined,
            attachmentContext: attachmentContext || undefined,
          }, user.id)

          // Show status based on what the planner decided
          if (queryPlan.webSearch?.needed) {
            sendStatus('Searching the web and reading pages...')
          } else if (queryPlan.webResearch.needed && hasUrls) {
            sendStatus('Reading URL and searching knowledge base + web...')
          } else if (queryPlan.webResearch.needed) {
            sendStatus('Searching knowledge base and the web...')
          } else if (hasUrls) {
            sendStatus('Reading URL and searching knowledge base...')
          } else if (activeProject) {
            sendStatus('Searching project and knowledge base...')
          } else {
            sendStatus('Searching knowledge base...')
          }

          const startRetrieval = Date.now()
          currentPhase = 'rag'

          // Run RAG, project retrieval, Perplexity, and Brave Search in parallel
          const ragPromise = multiQueryRetrieve(queryPlan.ragQueries, 10, user.id, queryPlan.intent)
          // Projects P2: project context loads CONCURRENTLY with global RAG.
          // Both legs are failure-isolated — a project hiccup degrades to a
          // plain Sherpa answer instead of killing the request.
          const projectQuery =
            message || (attachments ? attachments.map(a => a.fileName).join(' ') : '')
          const projectPromptPromise = activeProject
            ? getProjectPromptContext(activeProject.id).catch(err => {
                console.error('[Projects] prompt context error:', err)
                return null
              })
            : Promise.resolve(null)
          const projectRagPromise = activeProject && projectQuery
            ? retrieveProjectContext(projectQuery, activeProject.id, 12, user.id).catch(err => {
                console.error('[Projects] retrieval error:', err)
                return { chunks: [], totalTokens: 0 }
              })
            : Promise.resolve({ chunks: [], totalTokens: 0 })
          const perplexityPromise = queryPlan.webResearch.needed && queryPlan.webResearch.query
            ? conductResearch(
                queryPlan.webResearch.query,
                undefined,
                { model: 'sonar-pro', recencyFilter: 'month' },
                user.id
              ).catch(err => {
                console.error('Perplexity research error:', err)
                return null
              })
            : Promise.resolve(null)
          const braveSearchPromise = queryPlan.webSearch?.needed && queryPlan.webSearch.query
            ? searchAndFetch(queryPlan.webSearch.query, 3, user.id).catch(err => {
                console.error('Brave Search error:', err)
                return null
              })
            : Promise.resolve(null)

          const [ragResult, perplexityResult, braveSearchResult, projectPromptCtx, projectRagResult] = await Promise.all([
            ragPromise,
            perplexityPromise,
            braveSearchPromise,
            projectPromptPromise,
            projectRagPromise,
          ])

          const retrievalTime = Date.now() - startRetrieval
          const { chunks } = ragResult
          if (braveSearchResult?.fetchedContent) {
            console.log(`[BraveSearch] Fetched ${braveSearchResult.results.length} results, ${braveSearchResult.fetchedContent.length} chars of content`)
          }
          console.log(`Retrieval took ${retrievalTime}ms, found ${chunks.length} chunks`)
          if (perplexityResult) {
            console.log(`Perplexity research completed: ${perplexityResult.searchResults.length} web citations`)
          }

          // ========================================
          // PHASE 3: Assemble context + Generate
          // ========================================
          const retrievedContext = formatContextForPrompt(chunks)

          // Projects P2: assemble the project block + project citations.
          // In auto-stuff mode the per-query chunks are dropped (their docs
          // are already in the prompt verbatim).
          let projectContextBlock = ''
          let projectCitations: Citation[] = []
          if (activeProject && projectPromptCtx) {
            const projectChunks = projectPromptCtx.useStuffing ? [] : projectRagResult.chunks
            projectContextBlock = formatProjectContextForPrompt(projectPromptCtx, projectChunks)
            projectCitations = extractProjectCitations(projectChunks, projectPromptCtx)
            console.log(
              `[Projects] context for ${activeProject.id}: stuffing=${projectPromptCtx.useStuffing}, ` +
              `pinned=${projectPromptCtx.pinnedDocs.length}, index=${projectPromptCtx.knowledgeIndex.length}, ` +
              `ragChunks=${projectChunks.length}, totalTokens=${projectPromptCtx.totalTokenCount}`
            )
          }

          const citations = [...projectCitations, ...extractCitations(chunks)]

          // Format Perplexity research for inclusion in context
          let webResearchContext = ''
          let webCitations: WebCitation[] = []
          let relatedQuestions: string[] = []

          if (perplexityResult) {
            webCitations = perplexityResult.searchResults as WebCitation[]
            relatedQuestions = perplexityResult.relatedQuestions || []
            const truncatedWebContent = truncateToTokenBudget(
              perplexityResult.content,
              TOKEN_BUDGETS.perplexityContent
            )
            webResearchContext = `

### Current Web Research (via Perplexity)
${truncatedWebContent}

Web Sources:
${webCitations.map((c, i) => `[${i + 1}] ${c.title}: ${c.url}`).join('\n')}`
          }

          // Merge Brave Search results into web citations
          if (braveSearchResult?.results?.length) {
            const braveCitations = braveSearchResult.results.map((r: { title: string; url: string; description: string }) => ({
              title: r.title,
              url: r.url,
              snippet: r.description,
            }))
            webCitations = [...webCitations, ...braveCitations]
          }

          // Add user-pasted URLs as web citations
          if (scrapedUrlContent && detectedUrls?.length) {
            for (const url of detectedUrls) {
              // Avoid duplicating if already in webCitations
              if (!webCitations.some(c => c.url === url)) {
                webCitations.push({
                  title: new URL(url).hostname.replace('www.', ''),
                  url,
                  snippet: 'User-provided URL analyzed in this response',
                })
              }
            }
          }

          // Build web search context if available
          let webSearchContext = ''
          if (braveSearchResult?.fetchedContent) {
            webSearchContext = `\n\n### Web Search Results (fetched live)\nThe following pages were found and read based on the user's request:\n\n${braveSearchResult.fetchedContent}`
          }

          // Status: Found sources
          const braveResultCount = braveSearchResult?.results?.length || 0
          if (chunks.length > 0 || webCitations.length > 0 || scrapedUrlContent || braveResultCount > 0) {
            const sourceCount = chunks.length + webCitations.length + (scrapedUrlContent ? detectedUrls.length : 0) + braveResultCount
            sendStatus(`Found ${sourceCount} relevant sources`)
          } else {
            sendStatus('No specific sources found, using general knowledge')
          }

          // Build structured context
          let fullContext = retrievedContext
          if (webResearchContext) {
            fullContext += '\n\n' + webResearchContext
          }
          if (webSearchContext) {
            fullContext += '\n\n' + webSearchContext
          }
          if (attachmentContext) {
            fullContext += '\n\n--- User Attached Files ---' + attachmentContext
          }

          // When URLs were scraped, annotate the user message so the LLM knows content is available
          let processedMessage = message || '[User sent attachments without a message]'
          if (hasUrls && truncatedUrlContent) {
            for (const url of detectedUrls) {
              processedMessage = processedMessage.replace(url, `${url} [page content loaded above]`)
            }
          }

          // Extract image URLs from attachments for vision
          const imageUrls: string[] = []
          if (hasAttachments && attachments) {
            for (const attachment of attachments) {
              if (attachment.fileType.startsWith('image/') && attachment.storagePath) {
                imageUrls.push(attachment.storagePath)
              }
            }
          }
          if (imageUrls.length > 0) {
            console.log(`[Vision] Sending ${imageUrls.length} image(s) to LLM`)
          }

          console.log(`Building messages with ${conversationHistory.length} history messages for model: ${model}`)
          const { systemParts, messages: allMessages } = buildMessages(
            processedMessage,
            fullContext,
            model,
            conversationHistory,
            truncatedUrlContent || undefined,
            imageUrls.length > 0 ? imageUrls : undefined
          )
          console.log(`Total messages being sent to LLM: ${allMessages.length} (${conversationHistory.length} history + 1 new)`)

          // Get the appropriate model
          const llmModel = getModel(model)

          // Status: Generating response
          currentPhase = 'llm_stream'
          sendStatus(`Generating response...`)

          // Start streaming
          const startLLM = Date.now()

          // Get the database model value for storage
          const dbModel = getDbModelValue(model)

          // Build the message list with system prompt.
          // For Anthropic: use two system messages so the static persona prompt
          // gets prompt-cached (ephemeral, 5 min TTL). The dynamic RAG context
          // changes every request and is not cached.
          // For other providers: use a single system message (no caching API).
          const isAnthropic = MODEL_CONFIG[model].provider === 'anthropic'
          // Projects P2: the project block joins the DYNAMIC part only —
          // never the cached static part (it changes per conversation and
          // must not poison the shared prompt cache).
          const dynamicSystemPart = projectContextBlock
            ? `${systemParts.dynamicPart}\n\n${projectContextBlock}`
            : systemParts.dynamicPart
          const systemMessages = isAnthropic
            ? [
                {
                  role: 'system' as const,
                  content: systemParts.staticPart,
                  providerOptions: {
                    anthropic: { cacheControl: { type: 'ephemeral' as const } },
                  },
                },
                {
                  role: 'system' as const,
                  content: dynamicSystemPart,
                },
              ]
            : [
                {
                  role: 'system' as const,
                  content: systemParts.staticPart + dynamicSystemPart,
                },
              ]

          if (isAnthropic) {
            console.log(`[PromptCaching] Anthropic prompt caching enabled — static system prompt (${systemParts.staticPart.length} chars) marked as ephemeral`)
          }

          const result = streamText({
            model: llmModel,
            messages: [...systemMessages, ...allMessages],
            maxOutputTokens: 8192,
            temperature: 0.7,
            providerOptions: {
              anthropic: {
                output_config: { effort: 'medium' },
              },
            },
            experimental_telemetry: {
              isEnabled: true,
              functionId: 'chat.streamText',
              metadata: {
                model: dbModel,
                userId: user.id,
              },
            },
          })

          // Send citations (both RAG and web citations)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
          )

          // Send web research data if available (includes Perplexity + Brave + user URLs)
          if (webCitations.length > 0) {
            const expandedResearch = {
              content: perplexityResult?.content || '',
              webCitations,
              relatedQuestions,
              researchType: 'quick'
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'expandedResearch',
                expandedResearch
              })}\n\n`)
            )
          }

          // Collect full response text while streaming
          let fullResponseText = ''

          // Build expanded research object for database storage
          const expandedResearchForDb = webCitations.length > 0
            ? {
                content: perplexityResult?.content || '',
                webCitations,
                relatedQuestions,
                researchType: 'quick'
              }
            : null

          // Stream text chunks with output leak detection
          let leakDetected = false
          for await (const chunk of result.textStream) {
            fullResponseText += chunk
            // Check accumulated text for leaked prompt content every ~500 chars
            if (!leakDetected && fullResponseText.length % 500 < chunk.length) {
              if (scanOutput(fullResponseText)) {
                leakDetected = true
                console.error('[PromptGuard] Output leak detected, truncating response')
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text', content: '\n\n' + SAFE_RESPONSE })}\n\n`)
                )
                break
              }
            }
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
            )
          }

          // Finalize usage stats — wrapped so a SDK hiccup doesn't block the done event
          let usage: { inputTokens?: number; outputTokens?: number } | undefined
          const latencyMs = Date.now() - startLLM
          try {
            const finalResult = await result
            usage = await finalResult.usage
          } catch (finalizeError) {
            console.error('Error finalizing LLM result (usage stats unavailable):', finalizeError)
          }

          // Save assistant message — user message was already persisted up-front.
          // Wrapped so a DB failure doesn't prevent the done event.
          if (conversationId) {
            try {
              console.log(`Saving assistant message to conversation ${conversationId}`)

              // Save assistant message with citations and expanded research
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { data: assistantMsgData, error: assistantMsgError } = await (supabase.from('messages') as any).insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: fullResponseText,
                model: dbModel,
                token_count: (usage?.inputTokens || 0) + (usage?.outputTokens || 0) || null,
                latency_ms: latencyMs,
                citations,
                expanded_research: expandedResearchForDb,
              }).select('id').single()

              if (assistantMsgError) {
                console.error('Error saving assistant message:', assistantMsgError)
              } else {
                console.log('Assistant message saved:', assistantMsgData?.id)
              }

              // Update conversation's updated_at timestamp
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase.from('conversations') as any)
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId)
            } catch (saveError) {
              console.error('Error saving messages to DB (history will be incomplete on next turn):', saveError)
            }
          } else {
            console.log('No conversationId provided, skipping message save')
          }

          // Signal completion — sent before non-critical logging so the frontend
          // always navigates to /chat/[id] even if analytics calls below fail.
          // trace_id lets support correlate user reports → Langfuse trace.
          const traceId = getActiveTraceId()
          span.update({ output: fullResponseText })
          setActiveTraceIO({ input: traceInput, output: fullResponseText })
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', trace_id: traceId })}\n\n`)
          )
          controller.close()

          // ── Non-critical post-stream operations ──────────────────────────────
          // These run after the stream is closed. Any failure is logged but does
          // not affect the user. Each is individually wrapped.

          // Log usage
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: usageError } = await (supabase.from('usage_logs') as any).insert({
              user_id: user.id,
              model: dbModel,
              input_tokens: usage?.inputTokens || 0,
              output_tokens: usage?.outputTokens || 0,
              latency_ms: latencyMs,
              endpoint: '/api/chat',
            })
            if (usageError) console.error('Error logging usage:', usageError)
          } catch (usageLogError) {
            console.error('Usage log threw:', usageLogError)
          }

          // Monthly usage counter increment (Phase 1 — GATE-01)
          // Atomic RPC — race-safe. A missed increment at worst gives one free
          // extra message; the pre-LLM gate remains the authoritative blocker.
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: counterError } = await (supabase.rpc as any)(
              'increment_messages_used',
              { p_user_id: user.id }
            )
            if (counterError) console.error('[UsageGate] increment_messages_used RPC failed:', counterError)
          } catch (counterThrow) {
            console.error('[UsageGate] increment_messages_used threw:', counterThrow)
          }

          // Track LLM cost
          const llmService = dbModel === 'gemini' ? 'gemini' as const : 'claude' as const
          try {
            trackCost({
              userId: user.id,
              service: llmService,
              operation: 'chat',
              inputTokens: usage?.inputTokens || 0,
              outputTokens: usage?.outputTokens || 0,
              conversationId: conversationId || null,
              metadata: { model: dbModel },
            })
          } catch (costError) {
            console.error('trackCost threw:', costError)
          }

          // Log to Braintrust for eval & observability
          try {
            btLogger.log({
              input: {
                message: message || '[Attachments only]',
                model,
                conversationId: conversationId || null,
                hasAttachments: hasAttachments || false,
                hasUrls,
              },
              output: fullResponseText,
              metadata: {
                userId: user.id,
                ragChunksRetrieved: chunks.length,
                ragQueries: queryPlan.ragQueries,
                webResearchUsed: !!perplexityResult,
                webSearchUsed: !!braveSearchResult?.fetchedContent,
                webSearchResultCount: braveResultCount,
                webCitationsCount: webCitations.length,
                citationsCount: citations.length,
                retrievalTimeMs: retrievalTime,
                llmLatencyMs: latencyMs,
                inputTokens: usage?.inputTokens || 0,
                outputTokens: usage?.outputTokens || 0,
                modelUsed: dbModel,
              },
            })
          } catch (btError) {
            console.error('Braintrust logging error:', btError)
          }

          // Track completion in PostHog
          try {
            const llmCostUsd = calculateCost(llmService, {
              inputTokens: usage?.inputTokens || 0,
              outputTokens: usage?.outputTokens || 0,
            })
            getPostHogClient().capture({
              distinctId: user.id,
              event: 'chat_message_completed',
              properties: {
                model,
                input_tokens: usage?.inputTokens || 0,
                output_tokens: usage?.outputTokens || 0,
                total_tokens: (usage?.inputTokens || 0) + (usage?.outputTokens || 0),
                latency_ms: latencyMs,
                cost_usd: llmCostUsd,
                rag_chunks_retrieved: chunks.length,
                web_research_used: !!perplexityResult,
                has_attachments: !!(hasAttachments),
              },
            })
          } catch (phError) {
            console.error('PostHog capture threw:', phError)
          }
        } catch (error) {
          console.error(`Chat API streaming error (phase=${currentPhase}):`, error)

          // Write a phase-aware fallback assistant message so the conversation
          // becomes a recoverable thread instead of a ghost row. Stream the
          // fallback text to the client so they see it without reload, then
          // emit `done` with the assistant message id so retry can target it.
          const fallbackText = fallbackForPhase(currentPhase)
          let fallbackMessageId: string | null = null

          if (conversationId) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { data: insertedFallback } = await (supabase.from('messages') as any).insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: fallbackText,
                model: null,
                citations: [],
                error: true,
              }).select('id').single()
              fallbackMessageId = insertedFallback?.id ?? null

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase.from('conversations') as any)
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId)
            } catch (saveFallbackErr) {
              console.error('[Chat] Failed to persist fallback assistant message:', saveFallbackErr)
            }
          }

          // Diagnostic row for ops
          waitUntil(logChatError({
            userId: user.id,
            conversationId: conversationId ?? null,
            messageId: fallbackMessageId,
            phase: currentPhase,
            errorClass: error instanceof Error ? error.name : 'unknown',
            errorMessage: error instanceof Error ? error.message?.slice(0, 1000) : String(error).slice(0, 1000),
            userMessageExcerpt: message?.slice(0, 200) ?? null,
          }))

          // Stream the fallback text + a done event with the new message id
          // so the client can render the retry button.
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: fallbackText, error: true })}\n\n`)
            )
            const traceId = getActiveTraceId()
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done', trace_id: traceId, error: true, message_id: fallbackMessageId })}\n\n`)
            )
          } catch (sendErr) {
            console.error('[Chat] Failed to send fallback to client:', sendErr)
          }
          controller.close()
        }
        })
        // Vercel: keep the lambda alive until the Langfuse OTLP export
        // request actually completes. Without this, the lambda freezes
        // before the HTTP request to Langfuse finishes and traces are lost.
        waitUntil(langfuseSpanProcessor.forceFlush())
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

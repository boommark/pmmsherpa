import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants'
import { getModel, buildMessages, getModelDisplayName, getDbModelValue, type ModelProvider } from '@/lib/llm/provider-factory'
import { multiQueryRetrieve, formatContextForPrompt, extractCitations } from '@/lib/rag/retrieval'
import { planQueries } from '@/lib/rag/query-planner'
import { conductResearch } from '@/lib/llm/perplexity-client'
import { extractUrls, scrapeUrls } from '@/lib/url-scraper'
import { searchAndFetch } from '@/lib/web/brave-search'
import type { ChatAttachment, WebCitation } from '@/types/chat'
import { trackCost } from '@/lib/cost-tracker'
import { pollUntilDone as pollLlamaParse } from '@/lib/llamaparse'
import { scanInput, scanOutput, SAFE_RESPONSE, CANARY_TOKEN } from '@/lib/prompt-guard'
import { initLogger } from 'braintrust'

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
    const { message, conversationId, model, attachments } = body as {
      message: string
      conversationId?: string
      model: ModelProvider
      attachments?: ChatAttachment[]
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

    // Scan for prompt extraction attempts
    if (hasMessage) {
      const guardResult = scanInput(message)
      if (guardResult.blocked) {
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
      .select('tier, messages_used_this_period, period_start')
      .maybeSingle()

    if (gateError) {
      console.error('[UsageGate] Lazy reset error:', gateError)
    }

    // Read current state. If the lazy reset matched, gateRow is the new
    // row; otherwise SELECT it directly.
    let tier: string
    let messagesUsed: number

    if (gateRow) {
      tier = gateRow.tier
      messagesUsed = gateRow.messages_used_this_period // 0 after reset
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileRow, error: profileError } = await (supabase.from('profiles') as any)
        .select('tier, messages_used_this_period')
        .eq('id', user.id)
        .single()

      if (profileError || !profileRow) {
        console.error('[UsageGate] Failed to read profile:', profileError)
        return new Response(
          JSON.stringify({ error: 'profile_read_failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }

      tier = profileRow.tier
      messagesUsed = profileRow.messages_used_this_period
    }

    // Gate: founders always pass; free tier passes if under the limit.
    if (tier !== 'founder' && messagesUsed >= FREE_TIER_MONTHLY_LIMIT) {
      // Build reset_at = first day of NEXT calendar month at UTC midnight.
      const now = new Date()
      const resetAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
      const resetAtIso = resetAt.toISOString().replace(/\.\d{3}Z$/, 'Z') // "2026-05-01T00:00:00Z"

      console.log(`[UsageGate] User ${user.email} hit monthly limit: ${messagesUsed}/${FREE_TIER_MONTHLY_LIMIT}, resets ${resetAtIso}`)

      return new Response(
        JSON.stringify({
          error: 'message_limit_exceeded',
          limit: FREE_TIER_MONTHLY_LIMIT,
          reset_at: resetAtIso,
          message: 'Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.',
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

        try {
          // ========================================
          // PHASE 1: Gather all inputs (parallel)
          // ========================================
          sendStatus('Loading conversation context...')

          // Detect URLs in the message
          const detectedUrls = message ? extractUrls(message) : []
          const hasUrls = detectedUrls.length > 0

          // Gather inputs in parallel: conversation history, URL scraping, attachment processing
          const historyPromise = conversationId
            ? supabase
                .from('messages')
                .select('role, content, created_at')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(10)
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
            const chronologicalMessages = historyResult.data.reverse()
            const fullHistory = chronologicalMessages.map((m: { role: string; content: string }) => ({
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
          } else {
            sendStatus('Searching knowledge base...')
          }

          const startRetrieval = Date.now()

          // Run RAG, Perplexity, and Brave Search in parallel
          const ragPromise = multiQueryRetrieve(queryPlan.ragQueries, 10, user.id)
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

          const [ragResult, perplexityResult, braveSearchResult] = await Promise.all([
            ragPromise,
            perplexityPromise,
            braveSearchPromise,
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
          const citations = extractCitations(chunks)

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
          const { system, messages: allMessages } = buildMessages(
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
          const modelName = getModelDisplayName(model)
          sendStatus(`Generating response with ${modelName}...`)

          // Start streaming
          const startLLM = Date.now()

          // Get the database model value for storage
          const dbModel = getDbModelValue(model)

          const result = streamText({
            model: llmModel,
            system,
            messages: allMessages,
            maxOutputTokens: 8192,
            temperature: 0.7,
            providerOptions: {
              anthropic: {
                output_config: { effort: 'medium' },
              },
            },
          })

          // Send citations (both RAG and web citations)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
          )

          // Send web research data if available
          if (perplexityResult && webCitations.length > 0) {
            const expandedResearch = {
              content: perplexityResult.content,
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
          const expandedResearchForDb = perplexityResult && webCitations.length > 0
            ? {
                content: perplexityResult.content,
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

          // Wait for the result to finalize to get usage stats
          const finalResult = await result
          const usage = await finalResult.usage

          // Now save messages to database BEFORE closing the stream
          const latencyMs = Date.now() - startLLM

          if (conversationId) {
            console.log(`Saving messages to conversation ${conversationId}`)

            // Save user message
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: userMessageData, error: userMsgError } = await (supabase.from('messages') as any).insert({
              conversation_id: conversationId,
              role: 'user',
              content: message || '[Attachments only]',
              model: null,
              citations: [],
            }).select('id').single()

            if (userMsgError) {
              console.error('Error saving user message:', userMsgError)
            } else {
              console.log('User message saved:', userMessageData?.id)
            }

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
          } else {
            console.log('No conversationId provided, skipping message save')
          }

          // Log usage
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: usageError } = await (supabase.from('usage_logs') as any).insert({
            user_id: user.id,
            model: dbModel,
            input_tokens: usage?.inputTokens || 0,
            output_tokens: usage?.outputTokens || 0,
            latency_ms: latencyMs,
            endpoint: '/api/chat',
          })

          if (usageError) {
            console.error('Error logging usage:', usageError)
          }

          // Track LLM cost
          const llmService = dbModel === 'gemini' ? 'gemini' as const : 'claude' as const
          trackCost({
            userId: user.id,
            service: llmService,
            operation: 'chat',
            inputTokens: usage?.inputTokens || 0,
            outputTokens: usage?.outputTokens || 0,
            conversationId: conversationId || null,
            metadata: { model: dbModel },
          })

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

          // Signal completion
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          )
          controller.close()
        } catch (error) {
          console.error('Chat API streaming error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'An error occurred while generating the response' })}\n\n`)
          )
          controller.close()
        }
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

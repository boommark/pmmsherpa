import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getModel, getUrlReadingTools, buildMessages, getModelDisplayName, getDbModelValue, MODEL_CONFIG, type ModelProvider } from '@/lib/llm/provider-factory'
import { conductResearch } from '@/lib/llm/perplexity-client'
import { retrieveContext, formatContextForPrompt, extractCitations } from '@/lib/rag/retrieval'
import { ChatTracer, generateTraceId } from '@/lib/tracing'
import type { ChatAttachment, WebCitation } from '@/types/chat'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  const traceId = generateTraceId()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { message, conversationId, model, attachments, webSearchEnabled, hasUrls, searchReason } = body as {
      message: string
      conversationId?: string
      model: ModelProvider
      attachments?: ChatAttachment[]
      webSearchEnabled?: boolean
      hasUrls?: boolean
      searchReason?: 'url' | 'research_trigger' | 'question' | null
    }

    if (!model) {
      return new Response('Missing required fields', { status: 400 })
    }

    const hasMessage = message && message.trim()
    const hasAttachments = attachments && attachments.length > 0
    if (!hasMessage && !hasAttachments) {
      return new Response('Message or attachments required', { status: 400 })
    }

    // Initialize tracer
    const tracer = new ChatTracer(supabase, traceId, user.id, model)
    tracer.set({
      conversation_id: conversationId || null,
      user_message: (message || '').substring(0, 500),
      has_attachments: !!hasAttachments,
      web_search_enabled: !!webSearchEnabled,
      search_reason: searchReason || null,
      has_urls: !!hasUrls,
    })

    // Insert trace row immediately so partial data is visible even if request crashes
    await tracer.insert()

    const stream = new ReadableStream({
      async start(controller) {
        const sendStatus = (status: string) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'status', message: status })}\n\n`)
          )
        }

        try {
          // ── Step 1: Fetch conversation history ──
          sendStatus('Loading conversation context...')
          tracer.startStep('history_fetch')

          let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
          if (conversationId) {
            const { data: messages, error: historyError } = await supabase
              .from('messages')
              .select('role, content, created_at')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: false })
              .limit(10)

            if (historyError) {
              console.error(`[${traceId}] History fetch error:`, historyError)
            }

            if (messages && Array.isArray(messages)) {
              const chronologicalMessages = messages.reverse()
              conversationHistory = chronologicalMessages.map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
              }))
            }
          }
          tracer.endStep('history_fetch')

          // ── Step 2: Process attachments ──
          let attachmentContext = ''
          if (hasAttachments && attachments) {
            sendStatus('Processing attached files...')
            for (const attachment of attachments) {
              if (attachment.extractedText) {
                attachmentContext += `\n\n--- Attached File: ${attachment.fileName} ---\n${attachment.extractedText}\n--- End of ${attachment.fileName} ---`
              } else {
                attachmentContext += `\n\n[Attached file: ${attachment.fileName} (${attachment.fileType})]`
              }
            }
          }

          // ── Step 3: RAG + Perplexity (parallel) ──
          const searchQuery = message || (attachments ? attachments.map(a => a.fileName).join(' ') : '')
          const needsPerplexity = webSearchEnabled && searchReason && searchReason !== 'url'

          tracer.set({
            rag_query: searchQuery.substring(0, 500),
            perplexity_triggered: !!needsPerplexity,
          })

          if (needsPerplexity) {
            sendStatus('Searching PMM knowledge base & web...')
          } else {
            sendStatus('Searching PMM knowledge base...')
          }

          tracer.startStep('rag')
          tracer.startStep('perplexity')

          const ragPromise = retrieveContext({ query: searchQuery })
          const perplexityPromise = needsPerplexity
            ? conductResearch(searchQuery).catch(err => {
                const errMsg = err instanceof Error ? err.message : String(err)
                console.error(`[${traceId}] Perplexity error:`, errMsg)
                tracer.endStep('perplexity', {
                  perplexity_success: false,
                  perplexity_error: errMsg.substring(0, 1000),
                })
                return null
              })
            : Promise.resolve(null)

          const [ragResult, perplexityResult] = await Promise.all([ragPromise, perplexityPromise])

          const { chunks } = ragResult
          tracer.endStep('rag', { rag_chunks_found: chunks.length })

          // Format Perplexity results
          let webResearchContext = ''
          let webCitations: WebCitation[] = []
          let relatedQuestions: string[] = []

          if (perplexityResult) {
            webCitations = perplexityResult.searchResults as WebCitation[]
            relatedQuestions = perplexityResult.relatedQuestions || []
            tracer.endStep('perplexity', {
              perplexity_success: true,
              perplexity_citations_count: webCitations.length,
            })
            webResearchContext = `

--- Current Web Research (from Perplexity) ---
${perplexityResult.content}

Web Sources:
${webCitations.map((c, i) => `[${i + 1}] ${c.title}: ${c.url}`).join('\n')}
--- End Web Research ---`
          } else if (needsPerplexity) {
            // Perplexity was triggered but returned null (error already logged above)
            // Only set these if endStep wasn't already called in the catch block
            if (!perplexityResult) {
              tracer.endStep('perplexity', {
                perplexity_success: false,
                perplexity_error: perplexityResult === null && !needsPerplexity ? undefined : 'returned null',
              })
            }
          }

          const retrievedContext = formatContextForPrompt(chunks)
          const citations = extractCitations(chunks)

          if (chunks.length > 0 || webCitations.length > 0) {
            const sourceCount = chunks.length + webCitations.length
            sendStatus(`Found ${sourceCount} relevant sources`)
          } else {
            sendStatus('No specific sources found, using general knowledge')
          }

          // ── Step 4: Build prompt ──
          let fullContext = retrievedContext
          if (webResearchContext) {
            fullContext += webResearchContext
          }
          if (attachmentContext) {
            fullContext += '\n\n--- User Attached Files ---' + attachmentContext
          }

          const { system, messages: allMessages } = buildMessages(
            message || '[User sent attachments without a message]',
            fullContext,
            model,
            conversationHistory
          )

          // ── Step 5: Save user message early ──
          if (conversationId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: userMsgError } = await (supabase.from('messages') as any).insert({
              conversation_id: conversationId,
              role: 'user',
              content: message || '[Attachments only]',
              model: null,
              citations: [],
            })
            if (userMsgError) {
              console.error(`[${traceId}] Error saving user message:`, userMsgError)
            }
          }

          // ── Step 6: LLM streaming ──
          const modelName = getModelDisplayName(model)
          if (hasUrls) {
            sendStatus(`Reading URLs and generating response with ${modelName}...`)
          } else if (webCitations.length > 0) {
            sendStatus(`Generating response with ${modelName} (with web research)...`)
          } else {
            sendStatus(`Generating response with ${modelName}...`)
          }

          tracer.startStep('llm')
          const dbModel = getDbModelValue(model)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const streamOptions: any = {
            model: getModel(model),
            system,
            messages: allMessages,
            maxOutputTokens: 8192,
            temperature: 0.7,
          }

          // URL reading tools (only when URLs detected)
          if (hasUrls) {
            const urlTools = getUrlReadingTools(model)
            if (urlTools) {
              streamOptions.tools = urlTools
              tracer.set({
                url_tools_attached: true,
                url_tool_provider: MODEL_CONFIG[model].provider,
              })
            }
          }

          const result = streamText({ ...streamOptions })

          // Send citations
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
          )

          // Send web research if available
          const expandedResearchForDb = perplexityResult && webCitations.length > 0
            ? {
                content: perplexityResult.content,
                webCitations,
                relatedQuestions,
                researchType: 'quick'
              }
            : null

          if (expandedResearchForDb) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'expandedResearch',
                expandedResearch: expandedResearchForDb
              })}\n\n`)
            )
          }

          // Stream LLM response
          let fullResponseText = ''
          await tracer.streaming()

          for await (const chunk of result.textStream) {
            fullResponseText += chunk
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
            )
          }

          // Finalize LLM
          const finalResult = await result
          const usage = await finalResult.usage
          tracer.endStep('llm', {
            llm_input_tokens: usage?.inputTokens || 0,
            llm_output_tokens: usage?.outputTokens || 0,
            llm_response_length: fullResponseText.length,
          })

          // ── Step 7: Save to DB ──
          tracer.startStep('db_save')

          if (conversationId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: assistantMsgError } = await (supabase.from('messages') as any).insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullResponseText,
              model: dbModel,
              token_count: (usage?.inputTokens || 0) + (usage?.outputTokens || 0) || null,
              citations,
              expanded_research: expandedResearchForDb,
            }).select('id').single()

            if (assistantMsgError) {
              console.error(`[${traceId}] Error saving assistant message:`, assistantMsgError)
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('conversations') as any)
              .update({ updated_at: new Date().toISOString() })
              .eq('id', conversationId)
          }

          // Log usage
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('usage_logs') as any).insert({
            user_id: user.id,
            model: dbModel,
            input_tokens: usage?.inputTokens || 0,
            output_tokens: usage?.outputTokens || 0,
            endpoint: '/api/chat',
          })

          tracer.endStep('db_save')

          // ── Done ──
          await tracer.complete()

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          )
          controller.close()
        } catch (error) {
          // Determine which step failed based on what we've collected
          const errorMsg = error instanceof Error ? error.message : 'An error occurred while generating the response'
          console.error(`[${traceId}] Chat API streaming error:`, errorMsg)

          // Try to identify the failed step
          let failedStep = 'unknown'
          if (!tracer) {
            failedStep = 'init'
          } else {
            // The last started but un-ended step is likely where it failed
            const traceData = (tracer as any).data || {}
            if (!traceData.rag_duration_ms && traceData.rag_query) failedStep = 'rag'
            else if (traceData.perplexity_triggered && traceData.perplexity_success === undefined) failedStep = 'perplexity'
            else if (!traceData.llm_response_length && traceData.rag_duration_ms) failedStep = 'llm'
            else if (traceData.llm_response_length && !traceData.db_save_ms) failedStep = 'db_save'
            else failedStep = 'streaming'
          }

          await tracer.fail(failedStep, error)

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: errorMsg })}\n\n`)
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
    console.error(`[${traceId}] Chat API error:`, error)
    // Try to save a trace for top-level errors too
    try {
      const supabase = await createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('chat_traces') as any).insert({
        trace_id: traceId,
        model: 'unknown',
        status: 'error',
        error_step: 'request_parse',
        error_message: error instanceof Error ? error.message.substring(0, 2000) : 'Unknown error',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
    } catch {
      // Can't even trace — just log
      console.error(`[${traceId}] Failed to save error trace`)
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

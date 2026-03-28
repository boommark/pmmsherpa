import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getModel, buildMessages, getModelDisplayName, getDbModelValue, type ModelProvider } from '@/lib/llm/provider-factory'
import { multiQueryRetrieve, formatContextForPrompt, extractCitations } from '@/lib/rag/retrieval'
import { planQueries } from '@/lib/rag/query-planner'
import { conductResearch } from '@/lib/llm/perplexity-client'
import { extractUrls, scrapeUrls } from '@/lib/url-scraper'
import type { ChatAttachment, WebCitation } from '@/types/chat'

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
            ? scrapeUrls(detectedUrls).catch(err => {
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

          // Process attachments (truncate to budget)
          let attachmentContext = ''
          if (hasAttachments && attachments) {
            for (const attachment of attachments) {
              if (attachment.extractedText) {
                attachmentContext += `\n\n--- Attached File: ${attachment.fileName} ---\n${attachment.extractedText}\n--- End of ${attachment.fileName} ---`
              } else {
                attachmentContext += `\n\n[Attached file: ${attachment.fileName} (${attachment.fileType})]`
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
          })

          // Show status based on what the planner decided
          if (queryPlan.webResearch.needed && hasUrls) {
            sendStatus('Reading URL and searching knowledge base + web...')
          } else if (queryPlan.webResearch.needed) {
            sendStatus('Searching knowledge base and the web...')
          } else if (hasUrls) {
            sendStatus('Reading URL and searching knowledge base...')
          } else {
            sendStatus('Searching knowledge base...')
          }

          const startRetrieval = Date.now()

          // Run RAG and Perplexity in parallel
          const ragPromise = multiQueryRetrieve(queryPlan.ragQueries)
          const perplexityPromise = queryPlan.webResearch.needed && queryPlan.webResearch.query
            ? conductResearch(
                queryPlan.webResearch.query,
                undefined,
                { model: 'sonar-pro', recencyFilter: 'month' }
              ).catch(err => {
                console.error('Perplexity research error:', err)
                return null
              })
            : Promise.resolve(null)

          const [ragResult, perplexityResult] = await Promise.all([
            ragPromise,
            perplexityPromise,
          ])

          const retrievalTime = Date.now() - startRetrieval
          const { chunks } = ragResult
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

          // Status: Found sources
          if (chunks.length > 0 || webCitations.length > 0 || scrapedUrlContent) {
            const sourceCount = chunks.length + webCitations.length + (scrapedUrlContent ? detectedUrls.length : 0)
            sendStatus(`Found ${sourceCount} relevant sources`)
          } else {
            sendStatus('No specific sources found, using general knowledge')
          }

          // Build structured context
          let fullContext = retrievedContext
          if (webResearchContext) {
            fullContext += '\n\n' + webResearchContext
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

          console.log(`Building messages with ${conversationHistory.length} history messages for model: ${model}`)
          const { system, messages: allMessages } = buildMessages(
            processedMessage,
            fullContext,
            model,
            conversationHistory,
            truncatedUrlContent || undefined
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

          // Stream text chunks
          for await (const chunk of result.textStream) {
            fullResponseText += chunk
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
            conversation_id: conversationId || null,
            model: dbModel,
            input_tokens: usage?.inputTokens || 0,
            output_tokens: usage?.outputTokens || 0,
            total_tokens: (usage?.inputTokens || 0) + (usage?.outputTokens || 0),
            latency_ms: latencyMs,
          })

          if (usageError) {
            console.error('Error logging usage:', usageError)
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

import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'
import { getModel, buildMessages, getModelDisplayName, getDbModelValue, MODEL_CONFIG, type ModelProvider } from '@/lib/llm/provider-factory'
import { retrieveContext, formatContextForPrompt, extractCitations } from '@/lib/rag/retrieval'
import type { ChatAttachment } from '@/types/chat'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { message, conversationId, model, attachments, webSearchEnabled } = body as {
      message: string
      conversationId?: string
      model: ModelProvider
      attachments?: ChatAttachment[]
      webSearchEnabled?: boolean
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
          // Status: Loading context
          sendStatus('Loading conversation context...')

          // Get conversation history if exists
          let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
          if (conversationId) {
            // First get the total count and fetch last 10 messages
            // Order by created_at DESC to get most recent, then reverse for chronological order
            const { data: messages, error: historyError } = await supabase
              .from('messages')
              .select('role, content, created_at')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: false })
              .limit(10) // Last 10 messages for context

            if (historyError) {
              console.error('Error fetching conversation history:', historyError)
            }

            if (messages && Array.isArray(messages)) {
              // Reverse to get chronological order (oldest to newest)
              const chronologicalMessages = messages.reverse()
              conversationHistory = chronologicalMessages.map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
              }))
              console.log(`Loaded ${conversationHistory.length} messages from conversation history for ${conversationId}`)
            }
          } else {
            console.log('No conversationId provided - starting fresh conversation')
          }

          // Status: Processing attachments if any
          let attachmentContext = ''
          const attachmentIds: string[] = []
          if (hasAttachments && attachments) {
            sendStatus('Processing attached files...')
            for (const attachment of attachments) {
              attachmentIds.push(attachment.id)
              // Include extracted text from documents
              if (attachment.extractedText) {
                attachmentContext += `\n\n--- Attached File: ${attachment.fileName} ---\n${attachment.extractedText}\n--- End of ${attachment.fileName} ---`
              } else {
                // For files without extracted text (images, etc.), just note they're attached
                attachmentContext += `\n\n[Attached file: ${attachment.fileName} (${attachment.fileType})]`
              }
            }
          }

          // Status: Searching knowledge base
          sendStatus('Searching PMM knowledge base...')

          // Retrieve relevant context from knowledge base
          const searchQuery = message || (attachments ? attachments.map(a => a.fileName).join(' ') : '')
          const startRetrieval = Date.now()
          const { chunks } = await retrieveContext({ query: searchQuery })
          const retrievalTime = Date.now() - startRetrieval
          console.log(`RAG retrieval took ${retrievalTime}ms, found ${chunks.length} chunks`)

          const retrievedContext = formatContextForPrompt(chunks)
          const citations = extractCitations(chunks)

          // Status: Found sources
          if (chunks.length > 0) {
            sendStatus(`Found ${chunks.length} relevant sources`)
          } else {
            sendStatus('No specific sources found, using general knowledge')
          }

          // Build messages with system prompt and context (including attachments)
          const fullContext = attachmentContext
            ? retrievedContext + '\n\n--- User Attached Files ---' + attachmentContext
            : retrievedContext

          console.log(`Building messages with ${conversationHistory.length} history messages for model: ${model}`)
          const { system, messages: allMessages } = buildMessages(
            message || '[User sent attachments without a message]',
            fullContext,
            model,
            conversationHistory
          )
          console.log(`Total messages being sent to LLM: ${allMessages.length} (${conversationHistory.length} history + 1 new)`)

          // Get the appropriate model
          const llmModel = getModel(model)
          const config = MODEL_CONFIG[model]

          // Status: Generating response
          const modelName = getModelDisplayName(model)
          if (webSearchEnabled) {
            sendStatus(`Searching the web and generating response with ${modelName}...`)
          } else {
            sendStatus(`Generating response with ${modelName}...`)
          }

          // Start streaming
          const startLLM = Date.now()

          // Get the database model value for storage
          const dbModel = getDbModelValue(model)

          // Build streamText options with provider-specific web search tools
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const streamOptions: any = {
            model: llmModel,
            system,
            messages: allMessages,
            maxOutputTokens: 8192,
            temperature: 0.7,
          }

          // Add web search tools based on provider when enabled
          if (webSearchEnabled) {
            if (config.provider === 'anthropic') {
              // Anthropic Claude uses web_search tool
              streamOptions.tools = {
                web_search: anthropic.tools.webSearch_20250305({
                  maxUses: 5,
                }),
              }
            } else if (config.provider === 'google') {
              // Google Gemini uses googleSearch tool for grounding
              streamOptions.tools = {
                googleSearch: google.tools.googleSearch({}),
              }
            }
          }

          const result = streamText({
            ...streamOptions,
          })

          // Send citations
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
          )

          // Collect full response text while streaming
          let fullResponseText = ''

          // Stream text chunks
          for await (const chunk of result.textStream) {
            fullResponseText += chunk
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
            )
          }

          // Wait for the result to finalize to get usage stats
          const finalResult = await result

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
              is_saved: false,
              attachment_ids: attachmentIds.length > 0 ? attachmentIds : null,
            }).select('id').single()

            if (userMsgError) {
              console.error('Error saving user message:', userMsgError)
            } else {
              console.log('User message saved:', userMessageData?.id)
            }

            // Link attachments to the user message
            if (userMessageData && attachmentIds.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: attachError } = await (supabase.from('conversation_attachments') as any)
                .update({ message_id: userMessageData.id, conversation_id: conversationId })
                .in('id', attachmentIds)

              if (attachError) {
                console.error('Error linking attachments:', attachError)
              }
            }

            // Save assistant message
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: assistantMsgData, error: assistantMsgError } = await (supabase.from('messages') as any).insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullResponseText,
              model: dbModel,
              tokens_used: (finalResult.usage?.inputTokens || 0) + (finalResult.usage?.outputTokens || 0) || null,
              latency_ms: latencyMs,
              citations,
              is_saved: false,
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
            input_tokens: finalResult.usage?.inputTokens || 0,
            output_tokens: finalResult.usage?.outputTokens || 0,
            latency_ms: latencyMs,
            endpoint: '/api/chat',
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

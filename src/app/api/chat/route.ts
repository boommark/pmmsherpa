import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getModel, buildMessages, type ModelProvider } from '@/lib/llm/provider-factory'
import { retrieveContext, formatContextForPrompt, extractCitations } from '@/lib/rag/retrieval'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { message, conversationId, model } = body as {
      message: string
      conversationId?: string
      model: ModelProvider
    }

    if (!message || !model) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Get conversation history if exists
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
    if (conversationId) {
      const { data: messages } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10) // Last 10 messages for context

      if (messages && Array.isArray(messages)) {
        conversationHistory = messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      }
    }

    // Retrieve relevant context from knowledge base
    const startRetrieval = Date.now()
    const { chunks } = await retrieveContext({ query: message })
    const retrievalTime = Date.now() - startRetrieval
    console.log(`RAG retrieval took ${retrievalTime}ms, found ${chunks.length} chunks`)

    const retrievedContext = formatContextForPrompt(chunks)
    const citations = extractCitations(chunks)

    // Build messages with system prompt and context
    const { system, messages: allMessages } = buildMessages(
      message,
      retrievedContext,
      model,
      conversationHistory
    )

    // Get the appropriate model
    const llmModel = getModel(model)

    // Start streaming
    const startLLM = Date.now()

    const result = streamText({
      model: llmModel,
      system,
      messages: allMessages,
      maxOutputTokens: 8192,
      temperature: 0.7,
      onFinish: async ({ text, usage }) => {
        const latencyMs = Date.now() - startLLM

        // Save user message
        if (conversationId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('messages') as any).insert({
            conversation_id: conversationId,
            role: 'user',
            content: message,
            model: null,
            citations: [],
            is_saved: false,
          })

          // Save assistant message
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('messages') as any).insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: text,
            model,
            tokens_used: (usage?.inputTokens || 0) + (usage?.outputTokens || 0) || null,
            latency_ms: latencyMs,
            citations,
            is_saved: false,
          })
        }

        // Log usage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('usage_logs') as any).insert({
          user_id: user.id,
          model,
          input_tokens: usage?.inputTokens || 0,
          output_tokens: usage?.outputTokens || 0,
          latency_ms: latencyMs,
          endpoint: '/api/chat',
        })
      },
    })

    // Create streaming response with citations
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send citations first
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`)
        )

        // Stream text chunks
        for await (const chunk of result.textStream) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
          )
        }

        // Signal completion
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        )
        controller.close()
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

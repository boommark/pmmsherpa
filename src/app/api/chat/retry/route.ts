import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ModelProvider } from '@/lib/llm/provider-factory'

interface MessageRow {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  conversation_id: string
  error: boolean | null
}

interface ConversationRow {
  id: string
  user_id: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { conversationId, retry_message_id, model } = (await request.json()) as {
      conversationId?: string
      retry_message_id?: string
      model?: ModelProvider
    }

    if (!conversationId || !retry_message_id || !model) {
      return new Response('Missing conversationId, retry_message_id, or model', { status: 400 })
    }

    // Verify the conversation belongs to the user
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .single() as { data: ConversationRow | null; error: unknown }

    if (convErr || !conv || conv.user_id !== user.id) {
      return new Response('Conversation not found', { status: 404 })
    }

    // Verify the failed assistant message exists, belongs to this conversation, and has error=true
    const { data: failedMsg, error: failedMsgErr } = await supabase
      .from('messages')
      .select('id, role, content, created_at, conversation_id, error')
      .eq('id', retry_message_id)
      .single() as { data: MessageRow | null; error: unknown }

    if (failedMsgErr || !failedMsg) {
      return new Response('Message not found', { status: 404 })
    }
    if (failedMsg.conversation_id !== conversationId) {
      return new Response('Message does not belong to conversation', { status: 400 })
    }
    if (failedMsg.role !== 'assistant' || failedMsg.error !== true) {
      return new Response('Message is not a retryable error message', { status: 400 })
    }

    // Find the preceding user message (by created_at, latest before the failed message)
    const { data: precedingUser, error: precedingErr } = await supabase
      .from('messages')
      .select('id, role, content, created_at, conversation_id, error')
      .eq('conversation_id', conversationId)
      .eq('role', 'user')
      .lt('created_at', failedMsg.created_at)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: MessageRow | null; error: unknown }

    if (precedingErr || !precedingUser) {
      return new Response('No preceding user message to retry', { status: 400 })
    }

    // Delete the failed assistant message. RLS DELETE policy on messages
    // allows the conversation owner to delete.
    const { error: deleteErr } = await supabase
      .from('messages')
      .delete()
      .eq('id', retry_message_id)

    if (deleteErr) {
      console.error('[ChatRetry] Failed to delete error message:', deleteErr)
      return new Response('Failed to delete error message', { status: 500 })
    }

    // Forward to /api/chat with skipUserSave=true so the existing user
    // message is reused rather than duplicated. Cookies are forwarded so
    // Supabase auth picks up the same session inside the inner request.
    const cookieHeader = request.headers.get('cookie') ?? ''
    const chatUrl = new URL('/api/chat', request.url)

    const innerResponse = await fetch(chatUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        message: precedingUser.content,
        conversationId,
        model,
        skipUserSave: true,
      }),
    })

    // Pipe the SSE stream straight back to the client.
    return new Response(innerResponse.body, {
      status: innerResponse.status,
      headers: {
        'Content-Type': innerResponse.headers.get('content-type') ?? 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[ChatRetry] Unexpected error:', error)
    return new Response('Internal error', { status: 500 })
  }
}

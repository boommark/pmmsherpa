'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message } from '@/types/database'
import { getDbModelValue, type ModelProvider } from '@/lib/llm/provider-factory'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase.from('conversations') as any)
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching conversations:', fetchError)
        setError('Failed to load conversations')
        return
      }

      setConversations(data || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Initial fetch
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchConversations()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchConversations])

  const createConversation = async (
    title: string,
    model: ModelProvider
  ): Promise<Conversation | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Convert ModelProvider to DB value
    const dbModel = getDbModelValue(model)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('conversations') as any)
      .insert({
        user_id: user.id,
        title,
        model_used: dbModel,
      })
      .select()
      .single()

    if (!error && data) {
      setConversations((prev) => [data, ...prev])
    }

    return data
  }

  const updateConversation = async (
    id: string,
    updates: Partial<Conversation>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('conversations') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? data : c))
      )
    }

    return { data, error }
  }

  const archiveConversation = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('conversations') as any)
      .update({ is_archived: true })
      .eq('id', id)

    if (!error) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
    }

    return { error }
  }

  const deleteConversation = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('conversations') as any)
      .delete()
      .eq('id', id)

    if (!error) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
    }

    return { error }
  }

  return {
    conversations,
    loading,
    error,
    refresh: fetchConversations,
    createConversation,
    updateConversation,
    archiveConversation,
    deleteConversation,
  }
}

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase.from('messages') as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (fetchError) {
        console.error('Error fetching messages:', fetchError)
        setError('Failed to load messages')
        return
      }

      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const addMessage = async (
    message: Omit<Message, 'id' | 'created_at'>
  ): Promise<Message | null> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('messages') as any)
      .insert(message)
      .select()
      .single()

    if (!error && data) {
      setMessages((prev) => [...prev, data])
    }

    return data
  }

  const updateMessage = async (
    id: string,
    updates: Partial<Message>
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('messages') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? data : m))
      )
    }

    return { data, error }
  }

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    addMessage,
    updateMessage,
  }
}

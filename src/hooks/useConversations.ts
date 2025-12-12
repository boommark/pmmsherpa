'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message } from '@/types/database'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('conversations') as any)
      .select('*')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })

    setConversations(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const createConversation = async (
    title: string,
    model: 'claude' | 'gemini'
  ): Promise<Conversation | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('conversations') as any)
      .insert({
        user_id: user.id,
        title,
        model_used: model,
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
  const supabase = createClient()

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      setLoading(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('messages') as any)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      setMessages(data || [])
      setLoading(false)
    }

    fetchMessages()
  }, [conversationId, supabase])

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
    addMessage,
    updateMessage,
  }
}

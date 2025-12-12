import { create } from 'zustand'
import type { ChatMessage, ChatState } from '@/types/chat'
import type { ModelProvider } from '@/lib/llm/provider-factory'

interface ChatStore extends ChatState {
  // Actions
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setCurrentModel: (model: ModelProvider) => void
  setConversationId: (id: string | null) => void
  // Streaming helpers
  startStreaming: (messageId: string) => void
  appendToStream: (messageId: string, content: string) => void
  finishStreaming: (messageId: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  error: null,
  currentModel: 'claude',
  conversationId: null,

  // Actions
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  clearMessages: () => set({ messages: [], conversationId: null }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setCurrentModel: (currentModel) => set({ currentModel }),

  setConversationId: (conversationId) => set({ conversationId }),

  // Streaming helpers
  startStreaming: (messageId) => {
    const { messages } = get()
    const exists = messages.find((m) => m.id === messageId)

    if (!exists) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: messageId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            model: state.currentModel,
            createdAt: new Date(),
          },
        ],
      }))
    } else {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, isStreaming: true } : msg
        ),
      }))
    }
  },

  appendToStream: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: msg.content + content }
          : msg
      ),
    })),

  finishStreaming: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      ),
    })),
}))

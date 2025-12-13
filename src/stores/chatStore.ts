import { create } from 'zustand'
import type { ChatMessage, ChatState, ExpandedResearch } from '@/types/chat'
import type { Citation } from '@/types/database'
import type { ModelProvider } from '@/lib/llm/provider-factory'

interface ChatStore extends ChatState {
  // Status message for inline updates
  statusMessage: string | null
  // Web search toggle
  webSearchEnabled: boolean
  // Perplexity research toggles
  perplexityEnabled: boolean
  deepResearchEnabled: boolean
  // Actions
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  clearMessages: () => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setCurrentModel: (model: ModelProvider) => void
  setConversationId: (id: string | null) => void
  setStatusMessage: (message: string | null) => void
  setWebSearchEnabled: (enabled: boolean) => void
  setPerplexityEnabled: (enabled: boolean) => void
  setDeepResearchEnabled: (enabled: boolean) => void
  // Streaming helpers
  startStreaming: (messageId: string) => void
  appendToStream: (messageId: string, content: string) => void
  setCitations: (messageId: string, citations: Citation[]) => void
  finishStreaming: (messageId: string) => void
  // Research helpers
  setMessageResearching: (messageId: string, isResearching: boolean) => void
  setExpandedResearch: (messageId: string, research: ExpandedResearch) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: [],
  isLoading: false,
  error: null,
  currentModel: 'claude-opus',
  conversationId: null,
  statusMessage: null,
  webSearchEnabled: false,
  perplexityEnabled: false,
  deepResearchEnabled: false,

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

  setStatusMessage: (statusMessage) => set({ statusMessage }),

  setWebSearchEnabled: (webSearchEnabled) => set({ webSearchEnabled }),

  setPerplexityEnabled: (perplexityEnabled) => set({ perplexityEnabled }),

  setDeepResearchEnabled: (deepResearchEnabled) => set({ deepResearchEnabled }),

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

  setCitations: (messageId, citations) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, citations }
          : msg
      ),
    })),

  finishStreaming: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      ),
    })),

  // Research helpers
  setMessageResearching: (messageId, isResearching) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isResearching } : msg
      ),
    })),

  setExpandedResearch: (messageId, research) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, expandedResearch: research, isResearching: false }
          : msg
      ),
    })),
}))

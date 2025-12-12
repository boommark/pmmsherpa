import type { Citation, Message } from './database'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  citations?: Citation[]
  model?: 'claude' | 'gemini'
  isStreaming?: boolean
  createdAt: Date
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  currentModel: 'claude' | 'gemini'
  conversationId: string | null
}

export interface SendMessageRequest {
  message: string
  conversationId?: string
  model: 'claude' | 'gemini'
}

export interface SendMessageResponse {
  messageId: string
  conversationId: string
  content: string
  citations: Citation[]
  tokensUsed: number
  latencyMs: number
}

export interface RetrievalResult {
  chunks: RetrievedChunk[]
  totalTokens: number
}

export interface RetrievedChunk {
  id: string
  content: string
  similarity: number
  documentId: string
  documentTitle: string
  sourceType: 'book' | 'blog' | 'ama'
  author: string | null
  pageNumber: number | null
  sectionTitle: string | null
  question: string | null
  url: string | null
}

export interface ConversationSummary {
  id: string
  title: string
  modelUsed: 'claude' | 'gemini'
  messageCount: number
  lastMessage: string
  createdAt: Date
  updatedAt: Date
}

export interface StreamingState {
  isStreaming: boolean
  currentContent: string
  citations: Citation[]
}

export type ExportFormat = 'pdf' | 'markdown' | 'json' | 'txt'

export interface ExportOptions {
  format: ExportFormat
  includeTimestamps: boolean
  includeCitations: boolean
  includeModelInfo: boolean
}

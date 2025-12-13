import type { Citation, Message } from './database'
import type { ModelProvider, DbModelValue } from '@/lib/llm/provider-factory'

// Model can be either the new provider key, legacy DB value, or 'openai' for backward compatibility with existing data
export type ChatModelValue = ModelProvider | DbModelValue | 'openai'

export interface ChatAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  extractedText?: string | null
  thumbnailPath?: string | null
}

// Web citations from Perplexity research
export interface WebCitation {
  title: string
  url: string
  date?: string
  snippet?: string
}

// Expanded research content from Perplexity
export interface ExpandedResearch {
  content: string
  webCitations: WebCitation[]
  relatedQuestions?: string[]
  researchType: 'quick' | 'deep'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  citations?: Citation[]
  model?: ChatModelValue
  isStreaming?: boolean
  attachments?: ChatAttachment[]
  expandedResearch?: ExpandedResearch
  isResearching?: boolean
  createdAt: Date
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  currentModel: ModelProvider
  conversationId: string | null
}

export interface SendMessageRequest {
  message: string
  conversationId?: string
  model: ModelProvider
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
  speakerRole: string | null
  pageNumber: number | null
  sectionTitle: string | null
  question: string | null
  url: string | null
}

export interface ConversationSummary {
  id: string
  title: string
  modelUsed: string
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

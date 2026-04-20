import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getSystemPromptParts } from './system-prompt'

// All available model providers (Anthropic and Google only)
export type ModelProvider =
  | 'claude-sonnet'
  | 'gemini-3-pro'

export const MODEL_CONFIG = {
  'claude-sonnet': {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-orange-400',
    webSearchSupported: true,
  },
  'gemini-3-pro': {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    maxTokens: 65536,
    isThinking: false,
    color: 'bg-blue-500',
    webSearchSupported: true,
  },
} as const

// Internal-only model for lightweight tasks (query planning, intent classification)
// Not exposed to users — used by the RAG query planner
export const FLASH_LITE_MODEL_ID = 'gemini-2.5-flash-lite'

export function getFlashLiteModel() {
  const google = getGoogleClient()
  return google(FLASH_LITE_MODEL_ID)
}

export function getAnthropicClient() {
  return createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })
}

export function getGoogleClient() {
  return createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
  })
}

export function getModel(provider: ModelProvider) {
  const config = MODEL_CONFIG[provider]

  if (config.provider === 'anthropic') {
    const anthropic = getAnthropicClient()
    return anthropic(config.id)
  } else {
    const google = getGoogleClient()
    return google(config.id)
  }
}

// Check if a model supports web search
export function supportsWebSearch(provider: ModelProvider): boolean {
  return MODEL_CONFIG[provider].webSearchSupported ?? false
}

export function buildMessages(
  userMessage: string,
  retrievedContext: string,
  provider: ModelProvider,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  scrapedUrlContent?: string,
  imageUrls?: string[]
) {
  const systemParts = getSystemPromptParts(retrievedContext, provider, scrapedUrlContent)

  // Log conversation history for debugging
  if (conversationHistory.length > 0) {
    console.log('[buildMessages] Conversation history:')
    conversationHistory.forEach((msg, i) => {
      const preview = msg.content.substring(0, 100).replace(/\n/g, ' ')
      console.log(`  [${i}] ${msg.role}: "${preview}${msg.content.length > 100 ? '...' : ''}"`)
    })
  } else {
    console.log('[buildMessages] No conversation history provided')
  }

  // Build the user message — multimodal if images are present
  let userContent: string | Array<{ type: 'text'; text: string } | { type: 'image'; image: URL }>;
  if (imageUrls && imageUrls.length > 0) {
    userContent = [
      ...imageUrls.map((url) => ({ type: 'image' as const, image: new URL(url) })),
      { type: 'text' as const, text: userMessage },
    ]
    console.log(`[buildMessages] Multimodal message with ${imageUrls.length} image(s)`)
  } else {
    userContent = userMessage
  }

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: userContent },
  ]

  console.log(`[buildMessages] Final message array: ${messages.length} messages`)

  return {
    systemParts,
    messages,
  }
}

export function getModelDisplayName(provider: ModelProvider): string {
  return MODEL_CONFIG[provider].name
}

export function getMaxTokens(provider: ModelProvider): number {
  return MODEL_CONFIG[provider].maxTokens
}

export function isThinkingModel(provider: ModelProvider): boolean {
  return MODEL_CONFIG[provider].isThinking
}

// Database model type for storage
export type DbModelValue = 'claude' | 'gemini'

// For database storage - maps new provider keys to simplified db values
export function getDbModelValue(provider: ModelProvider): DbModelValue {
  const config = MODEL_CONFIG[provider]
  if (config.provider === 'anthropic') return 'claude'
  return 'gemini'
}

import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getSystemPromptWithContext } from './system-prompt'

// All available model providers (Anthropic and Google only)
export type ModelProvider =
  | 'claude-opus'
  | 'claude-sonnet'
  | 'gemini-3-pro'
  | 'gemini-2.5-thinking'

export const MODEL_CONFIG = {
  'claude-opus': {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-orange-500',
    // Claude uses web_search tool type
    webSearchSupported: true,
  },
  'claude-sonnet': {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-orange-400',
    webSearchSupported: true,
  },
  'gemini-3-pro': {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    provider: 'google',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-blue-500',
    // Gemini uses google_search grounding
    webSearchSupported: true,
  },
  'gemini-2.5-thinking': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Thinking)',
    provider: 'google',
    maxTokens: 64000,
    isThinking: true,
    color: 'bg-blue-600',
    webSearchSupported: true,
  },
} as const

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
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
) {
  const systemPrompt = getSystemPromptWithContext(retrievedContext, provider)

  return {
    system: systemPrompt,
    messages: [
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: userMessage },
    ],
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

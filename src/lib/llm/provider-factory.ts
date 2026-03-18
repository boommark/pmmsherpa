import { createAnthropic } from '@ai-sdk/anthropic'
import { anthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { google } from '@ai-sdk/google'
import { createXai, xai } from '@ai-sdk/xai'
import { getSystemPromptWithContext } from './system-prompt'

// All available model providers
export type ModelProvider =
  | 'claude-sonnet'
  | 'gemini-2.5-pro'
  | 'grok-4.1-fast'

export const MODEL_CONFIG = {
  'claude-sonnet': {
    id: 'claude-sonnet-4-6-20250929',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-orange-400',
    webSearchSupported: true,
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-blue-500',
    webSearchSupported: true,
  },
  'grok-4.1-fast': {
    id: 'grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'xai',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-gray-700',
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

export function getXaiClient() {
  return createXai({
    apiKey: process.env.XAI_API_KEY!,
  })
}

export function getModel(provider: ModelProvider) {
  const config = MODEL_CONFIG[provider]

  if (config.provider === 'anthropic') {
    const client = getAnthropicClient()
    return client(config.id)
  } else if (config.provider === 'google') {
    const client = getGoogleClient()
    return client(config.id)
  } else {
    const client = getXaiClient()
    return client(config.id)
  }
}

// Returns provider-native web search + URL reading tools
export function getProviderTools(provider: ModelProvider) {
  const config = MODEL_CONFIG[provider]

  if (config.provider === 'anthropic') {
    return {
      web_search: anthropic.tools.webSearch_20250305({ maxUses: 3 }),
      web_fetch: anthropic.tools.webFetch_20250910({ maxUses: 5 }),
    }
  } else if (config.provider === 'google') {
    return {
      googleSearch: google.tools.googleSearch({}),
      urlContext: google.tools.urlContext({}),
    }
  } else {
    // xAI provider - uses webSearch tool for web grounding
    return {
      webSearch: xai.tools.webSearch(),
    }
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

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ]

  console.log(`[buildMessages] Final message array: ${messages.length} messages`)

  return {
    system: systemPrompt,
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
export type DbModelValue = 'claude' | 'gemini' | 'grok'

// For database storage - maps new provider keys to simplified db values
export function getDbModelValue(provider: ModelProvider): DbModelValue {
  const config = MODEL_CONFIG[provider]
  if (config.provider === 'anthropic') return 'claude'
  if (config.provider === 'xai') return 'grok'
  return 'gemini'
}

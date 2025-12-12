import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { getSystemPromptWithContext } from './system-prompt'

// All available model providers
export type ModelProvider =
  | 'claude-opus'
  | 'claude-sonnet'
  | 'gemini-3-pro'
  | 'gemini-2.5-thinking'
  | 'gpt-5.2'
  | 'gpt-5.2-thinking'

export const MODEL_CONFIG = {
  'claude-opus': {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-orange-500',
  },
  'claude-sonnet': {
    id: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-orange-400',
  },
  'gemini-3-pro': {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    provider: 'google',
    maxTokens: 64000,
    isThinking: false,
    color: 'bg-blue-500',
  },
  'gemini-2.5-thinking': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Thinking)',
    provider: 'google',
    maxTokens: 64000,
    isThinking: true,
    color: 'bg-blue-600',
  },
  'gpt-5.2': {
    id: 'gpt-5.2',
    name: 'GPT-5.2',
    provider: 'openai',
    maxTokens: 128000,
    isThinking: false,
    color: 'bg-green-500',
  },
  'gpt-5.2-thinking': {
    id: 'gpt-5.2-pro',
    name: 'GPT-5.2 Pro (Thinking)',
    provider: 'openai',
    maxTokens: 128000,
    isThinking: true,
    color: 'bg-green-600',
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

export function getOpenAIClient() {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

export function getModel(provider: ModelProvider) {
  const config = MODEL_CONFIG[provider]

  if (config.provider === 'anthropic') {
    const anthropic = getAnthropicClient()
    return anthropic(config.id)
  } else if (config.provider === 'google') {
    const google = getGoogleClient()
    return google(config.id)
  } else {
    const openai = getOpenAIClient()
    return openai(config.id)
  }
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
export type DbModelValue = 'claude' | 'gemini' | 'openai'

// For database storage - maps new provider keys to simplified db values
export function getDbModelValue(provider: ModelProvider): DbModelValue {
  const config = MODEL_CONFIG[provider]
  if (config.provider === 'anthropic') return 'claude'
  if (config.provider === 'google') return 'gemini'
  return 'openai'
}

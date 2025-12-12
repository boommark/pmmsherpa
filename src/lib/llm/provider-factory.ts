import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { getSystemPromptWithContext } from './system-prompt'

export type ModelProvider = 'claude' | 'gemini'

export const MODEL_CONFIG = {
  claude: {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    maxTokens: 8192,
  },
  gemini: {
    id: 'gemini-2.5-pro-preview-06-05',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    maxTokens: 8192,
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
  if (provider === 'claude') {
    const anthropic = getAnthropicClient()
    return anthropic(MODEL_CONFIG.claude.id)
  } else {
    const google = getGoogleClient()
    return google(MODEL_CONFIG.gemini.id)
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

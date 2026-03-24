/**
 * Perplexity API Client for web research enrichment
 * Uses OpenAI SDK with Perplexity's API endpoint
 */

import OpenAI from 'openai'

// Initialize Perplexity client using OpenAI SDK
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai'
})

export type PerplexityModel = 'sonar-pro' | 'sonar-deep-research'

export interface WebCitation {
  title: string
  url: string
  date?: string
  snippet?: string
}

export interface ResearchOptions {
  model?: PerplexityModel
  recencyFilter?: 'day' | 'week' | 'month' | 'year'
  domainFilter?: string[]
  returnImages?: boolean
}

export interface ResearchResult {
  content: string
  searchResults: WebCitation[]
  relatedQuestions: string[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Conduct web research using Perplexity API
 * @param query - The research query/question
 * @param context - Optional context from previous response to enrich
 * @param options - Research options (model, filters, etc.)
 */
export async function conductResearch(
  query: string,
  context?: string,
  options: ResearchOptions = {}
): Promise<ResearchResult> {
  const model = options.model || 'sonar-pro'

  // Build system message for enrichment context
  const systemMessage = context
    ? `You are a research assistant enriching a product marketing response with current web data.

Original response based on expert PMM knowledge:
${context}

Your task: Add fresh statistics, recent examples, current trends, and web citations that complement and enrich this response. Focus on:
- Recent industry data and statistics (within the last year)
- Current market trends and developments
- Real-world examples and case studies
- Relevant news or announcements

Format your response as additional insights that enhance the original. Do NOT repeat the original content. Only add NEW information with clear source attribution.`
    : `You are a research assistant providing comprehensive, well-sourced information on product marketing topics. Provide current data, statistics, and examples with clear citations.`

  const response = await perplexity.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: query }
    ],
    // Perplexity-specific parameters (not in OpenAI types)
    // @ts-expect-error - Perplexity-specific params
    search_recency_filter: options.recencyFilter || 'month',
    search_domain_filter: options.domainFilter,
    return_images: options.returnImages || false,
    return_related_questions: true,
  })

  // Extract search results from response
  // @ts-expect-error - Perplexity adds search_results to response
  const searchResults: WebCitation[] = (response.search_results || []).map((result: {
    title?: string
    url?: string
    date?: string
    snippet?: string
  }) => ({
    title: result.title || 'Untitled',
    url: result.url || '',
    date: result.date,
    snippet: result.snippet
  }))

  // Extract related questions
  // @ts-expect-error - Perplexity adds related_questions to response
  const relatedQuestions: string[] = response.related_questions || []

  return {
    content: response.choices[0]?.message?.content || '',
    searchResults,
    relatedQuestions,
    usage: response.usage ? {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens
    } : undefined
  }
}

/**
 * Quick research - fast, focused results
 */
export async function quickResearch(query: string, context?: string): Promise<ResearchResult> {
  return conductResearch(query, context, {
    model: 'sonar-pro',
    recencyFilter: 'month'
  })
}

/**
 * Deep research - comprehensive, thorough analysis
 */
export async function deepResearch(query: string, context?: string): Promise<ResearchResult> {
  return conductResearch(query, context, {
    model: 'sonar-deep-research',
    recencyFilter: 'year'
  })
}

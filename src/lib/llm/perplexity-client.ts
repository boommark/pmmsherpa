import OpenAI from 'openai'

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY!,
  baseURL: 'https://api.perplexity.ai',
})

export interface PerplexityResult {
  content: string
  citations: string[]
}

/**
 * Quick web search via Perplexity sonar-pro.
 * Returns synthesized research content + source URLs.
 */
export async function perplexitySearch(
  query: string,
  options?: { recencyFilter?: 'month' | 'week' | 'day' | 'year' }
): Promise<PerplexityResult | null> {
  try {
    const response = await perplexity.chat.completions.create({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant. Provide factual, well-sourced information. Focus on the most relevant and recent data. Be concise but thorough.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(options?.recencyFilter ? { search_recency_filter: options.recencyFilter } as any : {}),
    })

    const content = response.choices[0]?.message?.content || ''
    // Perplexity returns citations in the response object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const citations: string[] = (response as any).citations || []

    return { content, citations }
  } catch (error) {
    console.error('Perplexity search error:', error)
    return null
  }
}

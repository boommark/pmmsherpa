/**
 * Brave Search API integration for PMM Sherpa.
 * Finds URLs matching a query, then fetches top results via Jina Reader.
 */

import { trackCost } from '@/lib/cost-tracker'

const BRAVE_API_BASE = 'https://api.search.brave.com/res/v1/web/search'
const JINA_READER_BASE = 'https://r.jina.ai'

interface BraveSearchResult {
  title: string
  url: string
  description: string
}

interface WebSearchResult {
  query: string
  results: BraveSearchResult[]
  fetchedContent: string // Combined content from top results
}

/**
 * Search the web via Brave Search API
 */
async function braveSearch(query: string, count = 5): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) {
    console.warn('[BraveSearch] BRAVE_SEARCH_API_KEY not set')
    return []
  }

  const params = new URLSearchParams({
    q: query,
    count: String(count),
    text_decorations: 'false',
    search_lang: 'en',
  })

  const response = await fetch(`${BRAVE_API_BASE}?${params}`, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
  })

  if (!response.ok) {
    console.error(`[BraveSearch] API error: ${response.status}`)
    return []
  }

  const data = await response.json()
  const results = data.web?.results || []

  return results.slice(0, count).map((r: { title: string; url: string; description: string }) => ({
    title: r.title,
    url: r.url,
    description: r.description,
  }))
}

/**
 * Fetch a URL's content via Jina Reader
 */
async function fetchViaJina(url: string): Promise<string | null> {
  try {
    const jinaUrl = `${JINA_READER_BASE}/${url}`
    const headers: Record<string, string> = {
      'Accept': 'text/markdown',
    }
    const jinaKey = process.env.JINA_API_KEY
    if (jinaKey) {
      headers['Authorization'] = `Bearer ${jinaKey}`
    }

    const response = await fetch(jinaUrl, {
      headers,
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) return null

    const text = await response.text()
    // Cap at ~8K chars per page to avoid blowing context
    return text.length > 8000 ? text.slice(0, 8000) + '\n\n[Content truncated]' : text
  } catch (err) {
    console.error(`[BraveSearch] Jina fetch failed for ${url}:`, err)
    return null
  }
}

/**
 * Search the web and fetch top results.
 * Returns search results metadata + fetched page content.
 */
export async function searchAndFetch(
  query: string,
  maxFetch = 3,
  userId?: string
): Promise<WebSearchResult> {
  console.log(`[BraveSearch] Searching: "${query}"`)

  const results = await braveSearch(query, 5)
  console.log(`[BraveSearch] Found ${results.length} results`)

  if (results.length === 0) {
    return { query, results: [], fetchedContent: '' }
  }

  if (userId) {
    trackCost({ userId, service: 'brave_search', operation: 'web_search', units: 1, unitType: 'requests' })
  }

  // Fetch top N results in parallel
  const toFetch = results.slice(0, maxFetch)
  const fetched = await Promise.allSettled(
    toFetch.map(r => fetchViaJina(r.url))
  )

  const contentParts: string[] = []
  let jinaFetchCount = 0
  fetched.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      contentParts.push(
        `--- Source: ${toFetch[i].title} (${toFetch[i].url}) ---\n${result.value}\n--- End ---`
      )
      console.log(`[BraveSearch] Fetched: ${toFetch[i].url} (${result.value.length} chars)`)
      jinaFetchCount++
    }
  })
  if (userId && jinaFetchCount > 0) {
    trackCost({ userId, service: 'jina', operation: 'url_fetch', units: jinaFetchCount, unitType: 'requests' })
  }

  return {
    query,
    results,
    fetchedContent: contentParts.join('\n\n'),
  }
}

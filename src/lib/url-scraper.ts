const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
const MAX_TOTAL_CHARS = 40000 // Total budget across all URLs
const MAX_URLS = 3

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) || []
  // Deduplicate and strip trailing punctuation
  return [...new Set(matches.map(url => url.replace(/[.,;:!?)]+$/, '')))]
}

async function scrapeWithFirecrawl(url: string): Promise<string | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    console.warn('FIRECRAWL_API_KEY not set')
    return null
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 30000,
      }),
      signal: AbortSignal.timeout(35000),
    })

    if (!response.ok) {
      console.error(`FireCrawl returned ${response.status} for ${url}`)
      return null
    }

    const json = await response.json()
    if (!json.success || !json.data?.markdown) {
      console.error(`FireCrawl scrape failed for ${url}:`, json)
      return null
    }

    return json.data.markdown as string
  } catch (err) {
    console.error(`FireCrawl scrape failed for ${url}:`, err)
    return null
  }
}

export async function scrapeUrls(urls: string[]): Promise<string> {
  const limited = urls.slice(0, MAX_URLS)
  const perUrlBudget = Math.floor(MAX_TOTAL_CHARS / limited.length)

  const results = await Promise.all(
    limited.map(async (url) => {
      const content = await scrapeWithFirecrawl(url)
      if (!content) {
        return `--- Scraped content from ${url} ---\n[Failed to fetch content from this URL. The page may be behind a login, blocking scrapers, or temporarily unavailable.]\n--- End of ${url} ---`
      }
      const trimmed = content.length > perUrlBudget
        ? content.slice(0, perUrlBudget) + '\n...[content truncated]'
        : content
      return `--- Scraped content from ${url} ---\n${trimmed}\n--- End of ${url} ---`
    })
  )

  return results.filter(Boolean).join('\n\n')
}

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
const MAX_CONTENT_CHARS = 8000
const MAX_URLS = 3

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) || []
  // Deduplicate and strip trailing punctuation
  return [...new Set(matches.map(url => url.replace(/[.,;:!?)]+$/, '')))]
}

async function scrapeWithJina(url: string): Promise<string | null> {
  const apiKey = process.env.JINA_API_KEY
  if (!apiKey) {
    console.warn('JINA_API_KEY not set')
    return null
  }

  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/plain',
        'X-Return-Format': 'markdown',
        'X-Timeout': '10',
      },
      signal: AbortSignal.timeout(12000),
    })

    if (!response.ok) {
      console.error(`Jina returned ${response.status} for ${url}`)
      return null
    }

    const text = await response.text()
    return text.length > MAX_CONTENT_CHARS
      ? text.slice(0, MAX_CONTENT_CHARS) + '\n...[content truncated]'
      : text
  } catch (err) {
    console.error(`Jina scrape failed for ${url}:`, err)
    return null
  }
}

export async function scrapeUrls(urls: string[]): Promise<string> {
  const limited = urls.slice(0, MAX_URLS)

  const results = await Promise.all(
    limited.map(async (url) => {
      const content = await scrapeWithJina(url)
      if (!content) return null
      return `--- Scraped content from ${url} ---\n${content}\n--- End of ${url} ---`
    })
  )

  return results.filter(Boolean).join('\n\n')
}

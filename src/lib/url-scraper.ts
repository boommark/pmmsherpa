import { trackCost } from '@/lib/cost-tracker'

// Matches full URLs with protocol
const FULL_URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g

// Matches bare domains like "writer.ai", "zoominfo.com", "app.writer.com/pricing"
// Requires a recognized TLD to avoid false positives on normal words
const BARE_DOMAIN_REGEX = /(?<![/@\w])(?:[\w-]+\.)+(?:com|org|net|io|ai|co|dev|app|xyz|me|info|biz|us|uk|ca|de|fr|tech|cloud|design|marketing|agency|so|gg|sh|fm|tv|ly|to|cc|studio|pro|page|site|online|store|shop|blog|news|world|team|tools|run|space|software|systems|solutions|health|finance|education|consulting|ventures|capital|media|digital|global|group|inc|ltd|enterprise)(?:\/[^\s<>"{}|\\^`[\]]*)?/gi

const MAX_TOTAL_CHARS = 40000 // Total budget across all URLs
const MAX_URLS = 3

export function extractUrls(text: string): string[] {
  // First find full URLs (with protocol)
  const fullMatches = text.match(FULL_URL_REGEX) || []

  // Then find bare domains, but exclude any that are already part of a full URL
  const bareMatches = text.match(BARE_DOMAIN_REGEX) || []
  const bareUrls = bareMatches
    .filter(bare => !fullMatches.some(full => full.includes(bare)))
    .map(bare => `https://${bare}`)

  const all = [...fullMatches, ...bareUrls]

  // Deduplicate and strip trailing punctuation
  return [...new Set(all.map(url => url.replace(/[.,;:!?)]+$/, '')))]
}

async function scrapeWithJina(url: string): Promise<string | null> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`
    const headers: Record<string, string> = { 'Accept': 'text/plain' }
    const apiKey = process.env.JINA_API_KEY
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`
    const response = await fetch(jinaUrl, {
      headers,
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    const text = await response.text()
    return text || null
  } catch (err) {
    console.error(`Jina scrape failed for ${url}:`, err)
    return null
  }
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

export async function scrapeUrls(urls: string[], userId?: string): Promise<string> {
  const limited = urls.slice(0, MAX_URLS)
  const perUrlBudget = Math.floor(MAX_TOTAL_CHARS / limited.length)

  const results = await Promise.all(
    limited.map(async (url) => {
      let content = await scrapeWithFirecrawl(url)
      if (content && userId) {
        trackCost({ userId, service: 'firecrawl', operation: 'url_scrape', units: 1, unitType: 'pages' })
      }
      if (!content) {
        content = await scrapeWithJina(url)
      }
      if (!content) {
        return `--- Scraped content from ${url} ---\n[SCRAPING BLOCKED: Both Firecrawl and Jina Reader failed to access this URL. The site almost certainly has bot protection or a login gate. INSTRUCTION FOR SHERPA: Explicitly tell the user that ${url} has bot blocking enabled and you could not read its content. Ask them to copy-paste the text from that page directly into the chat so you can analyze it.]\n--- End of ${url} ---`
      }
      const trimmed = content.length > perUrlBudget
        ? content.slice(0, perUrlBudget) + '\n...[content truncated]'
        : content
      return `--- Scraped content from ${url} ---\n${trimmed}\n--- End of ${url} ---`
    })
  )

  return results.filter(Boolean).join('\n\n')
}

import { listPosts } from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.com'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const posts = listPosts()
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}${post.href}`
      const pubDate = new Date(`${post.frontmatter.publishedAt}T00:00:00Z`).toUTCString()
      return `    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${escapeXml(url)}</link>
      <description>${escapeXml(post.frontmatter.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PMM Sherpa Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Essays and field notes on product marketing, positioning, and go-to-market strategy.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

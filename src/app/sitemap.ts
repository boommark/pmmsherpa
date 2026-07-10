import type { MetadataRoute } from 'next'
import { listDocPages } from '@/lib/docs'
import { listPosts } from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = listDocPages().map((page) => ({
    url: `${SITE_URL}${page.href}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const posts = listPosts().map((post) => ({
    url: `${SITE_URL}${post.href}`,
    lastModified: post.frontmatter.updatedAt ?? post.frontmatter.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: SITE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...docs,
    ...posts,
  ]
}

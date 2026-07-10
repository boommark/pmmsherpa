import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Linkedin } from 'lucide-react'
import { getPost, listPosts, listSlugs, formatPostDate } from '@/lib/blog'
import { AuthorAvatar } from '@/components/blog/AuthorAvatar'
import { BlogContent } from '@/components/blog/BlogContent'
import { HeroPlaceholder } from '@/components/blog/HeroPlaceholder'
import { NewsletterCapture } from '@/components/blog/NewsletterCapture'
import { PostCard } from '@/components/blog/PostCard'
import { ShareRow } from '@/components/blog/ShareRow'

interface PageProps {
  params: Promise<{ slug: string }>
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.com'

export async function generateStaticParams() {
  return listSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Not found' }
  const { frontmatter } = post
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    alternates: { canonical: post.href },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      url: post.href,
      publishedTime: frontmatter.publishedAt,
      ...(frontmatter.updatedAt ? { modifiedTime: frontmatter.updatedAt } : {}),
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
    },
    ...(frontmatter.draft ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const { frontmatter, author } = post
  const postUrl = `${SITE_URL}${post.href}`
  const keepReading = listPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.description,
    ...(frontmatter.heroImage ? { image: [`${SITE_URL}${frontmatter.heroImage}`] } : {}),
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.linkedin ? { url: author.linkedin } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'PMM Sherpa',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/pmmsherpa-logo-round.png`,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-8 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {/* Hero */}
        <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 border border-[#e8ecf4]/70 dark:border-white/[0.08]">
          {frontmatter.heroImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={frontmatter.heroImage}
              alt={frontmatter.heroImageAlt ?? frontmatter.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <HeroPlaceholder title={frontmatter.title} />
          )}
        </div>

        {frontmatter.draft ? (
          <span className="inline-flex items-center rounded-full border border-amber-400/50 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 mb-4 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
            Draft — not yet published
          </span>
        ) : null}

        <h1 className="text-3xl md:text-[2.5rem] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#191c1e] dark:text-white">
          {frontmatter.title}
        </h1>

        {/* Byline */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 pb-8 border-b border-[#e8ecf4]/70 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <AuthorAvatar author={author} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#191c1e] dark:text-white">
                  {author.name}
                </span>
                {author.linkedin ? (
                  <a
                    href={author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${author.name} on LinkedIn`}
                    className="text-[#5f6368] hover:text-[#0058be] dark:text-[#8e9199] dark:hover:text-[#5a9cf5] transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
              {author.title ? (
                <p className="text-xs text-[#5f6368] dark:text-[#8e9199]">{author.title}</p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5f6368] dark:text-[#8e9199] sm:ml-auto">
            <time dateTime={frontmatter.publishedAt}>
              {formatPostDate(frontmatter.publishedAt)}
            </time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="prose-blog mt-8">
          <BlogContent markdown={post.content} />
        </div>

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-[#e8ecf4]/70 dark:border-white/[0.08]">
          <ShareRow url={postUrl} title={frontmatter.title} />
        </div>
      </article>

      {/* Keep reading */}
      {keepReading.length > 0 ? (
        <section aria-label="Keep reading" className="mt-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-[#191c1e] dark:text-white">
              Keep reading
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-[#0058be] hover:text-[#004a9e] dark:text-[#5a9cf5] dark:hover:text-[#8ab8f8] transition-colors"
            >
              All posts
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {keepReading.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-14">
        <NewsletterCapture source={post.slug} />
      </div>
    </div>
  )
}

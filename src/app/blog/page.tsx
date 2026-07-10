import type { Metadata } from 'next'
import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { listPosts, type BlogPost } from '@/lib/blog'
import { PostByline, PostCard, PostThumb } from '@/components/blog/PostCard'
import { NewsletterCapture } from '@/components/blog/NewsletterCapture'
import { SubscribedBanner } from '@/components/blog/SubscribedBanner'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Essays and field notes on product marketing, positioning, and go-to-market strategy from the team behind PMM Sherpa.',
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/blog/feed.xml' },
  },
  openGraph: {
    title: 'PMM Sherpa Blog',
    description:
      'Essays and field notes on product marketing, positioning, and go-to-market strategy.',
    type: 'website',
    url: '/blog',
  },
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={post.href}
      className="group grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-[#e8ecf4]/70 bg-white transition-shadow hover:shadow-[0_8px_30px_rgba(0,88,190,0.10)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
    >
      <div className="aspect-[16/9] md:aspect-auto md:min-h-[280px] overflow-hidden">
        <PostThumb post={post} />
      </div>
      <div className="p-6 md:p-8 flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] dark:text-[#5a9cf5] mb-3">
          Latest post
        </p>
        <h2 className="text-2xl md:text-[1.75rem] font-extrabold tracking-[-0.02em] leading-tight text-[#191c1e] dark:text-white group-hover:text-[#0058be] dark:group-hover:text-[#5a9cf5] transition-colors">
          {post.frontmatter.title}
        </h2>
        <p className="mt-3 text-sm md:text-base text-[#4a4f57] dark:text-[#8e9199] leading-relaxed line-clamp-3">
          {post.frontmatter.description}
        </p>
        <div className="mt-5">
          <PostByline post={post} />
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#e2e5ea] dark:border-white/[0.12] py-16 px-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-[#0058be]/[0.08] dark:bg-[#5a9cf5]/[0.12] flex items-center justify-center mb-4">
        <PenLine className="h-6 w-6 text-[#0058be] dark:text-[#5a9cf5]" strokeWidth={1.75} />
      </div>
      <h2 className="text-lg font-bold text-[#191c1e] dark:text-white">
        The first post is being sharpened
      </h2>
      <p className="mt-2 text-sm text-[#4a4f57] dark:text-[#8e9199] max-w-sm mx-auto leading-relaxed">
        Essays on positioning, messaging, and go-to-market are on the way. Subscribe below and
        we&apos;ll let you know when they land.
      </p>
    </div>
  )
}

export default function BlogIndexPage() {
  const posts = listPosts()
  const [featured, ...rest] = posts

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <SubscribedBanner />

      <header className="mb-10 md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0058be] dark:text-[#5a9cf5] mb-3">
          The PMM Sherpa Blog
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#191c1e] dark:text-white">
          Field notes for people who own go-to-market
        </h1>
        <p className="mt-3 text-base md:text-lg text-[#4a4f57] dark:text-[#8e9199] max-w-2xl leading-relaxed">
          Essays on positioning, messaging, and GTM strategy — grounded in what actually works.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          <FeaturedCard post={featured} />
          {rest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-12 md:mt-16">
        <NewsletterCapture source="blog-index" />
      </div>
    </div>
  )
}

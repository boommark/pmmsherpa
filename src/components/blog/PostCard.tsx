import Link from 'next/link'
import { Clock } from 'lucide-react'
import { formatPostDate, type BlogPost } from '@/lib/blog'
import { AuthorAvatar } from '@/components/blog/AuthorAvatar'
import { HeroPlaceholder } from '@/components/blog/HeroPlaceholder'

export function PostThumb({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  if (post.frontmatter.heroImage) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={post.frontmatter.heroImage}
        alt={post.frontmatter.heroImageAlt ?? post.frontmatter.title}
        className="w-full h-full object-cover"
        loading={compact ? 'lazy' : 'eager'}
      />
    )
  }
  return <HeroPlaceholder title={post.frontmatter.title} compact={compact} />
}

export function PostByline({ post }: { post: BlogPost }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-[#5f6368] dark:text-[#8e9199]">
      <AuthorAvatar author={post.author} size="sm" />
      <span className="font-medium text-[#191c1e] dark:text-[#e6ebf4]">{post.author.name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.frontmatter.publishedAt}>
        {formatPostDate(post.frontmatter.publishedAt)}
      </time>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {post.readingTimeMinutes} min read
      </span>
    </div>
  )
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={post.href}
      className="group flex flex-col rounded-2xl overflow-hidden border border-[#e8ecf4]/70 bg-white transition-shadow hover:shadow-[0_8px_30px_rgba(0,88,190,0.08)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
    >
      <div className="aspect-[16/9] overflow-hidden">
        <PostThumb post={post} compact />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold tracking-[-0.01em] leading-snug text-[#191c1e] dark:text-white group-hover:text-[#0058be] dark:group-hover:text-[#5a9cf5] transition-colors">
          {post.frontmatter.title}
        </h3>
        <p className="mt-2 text-sm text-[#4a4f57] dark:text-[#8e9199] leading-relaxed line-clamp-2 flex-1">
          {post.frontmatter.description}
        </p>
        <div className="mt-4">
          <PostByline post={post} />
        </div>
      </div>
    </Link>
  )
}

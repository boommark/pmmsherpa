import type { BlogAuthor } from '@/lib/blog'

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-10 h-10 text-sm',
} as const

/**
 * Author avatar with a branded-initials fallback when no image is registered
 * (e.g. a guest author id not yet in authors.json).
 */
export function AuthorAvatar({
  author,
  size = 'md',
}: {
  author: BlogAuthor
  size?: keyof typeof SIZE_CLASSES
}) {
  const classes = SIZE_CLASSES[size]
  if (author.avatar) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={author.avatar}
        alt={author.name}
        className={`${classes} rounded-full object-cover flex-shrink-0`}
      />
    )
  }
  const initials = author.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return (
    <span
      aria-hidden="true"
      className={`${classes} rounded-full bg-gradient-to-br from-[#0058be] to-[#2170e4] text-white font-semibold flex items-center justify-center flex-shrink-0`}
    >
      {initials || 'PS'}
    </span>
  )
}

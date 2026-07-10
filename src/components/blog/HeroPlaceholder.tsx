function MountainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 20L7 10l5 6 4-10 6 14" />
    </svg>
  )
}

/**
 * Branded gradient stand-in for posts without a heroImage. Shows the post
 * title so cards and post tops stay informative when shipping text-first.
 */
export function HeroPlaceholder({
  title,
  compact = false,
}: {
  title: string
  compact?: boolean
}) {
  return (
    <div
      aria-hidden="true"
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0058be 0%, #1a6dd6 55%, #2170e4 100%)',
      }}
    >
      <MountainIcon className="absolute -right-6 -bottom-8 h-40 w-40 text-white/[0.12]" />
      <p
        className={`relative px-6 text-center font-extrabold tracking-[-0.02em] text-white/95 leading-snug ${
          compact ? 'text-base line-clamp-3' : 'text-xl md:text-2xl line-clamp-4'
        }`}
      >
        {title}
      </p>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Rss } from 'lucide-react'

export const metadata: Metadata = {
  title: {
    default: 'Blog',
    template: '%s | PMM Sherpa Blog',
  },
  description:
    'Essays and field notes on product marketing, positioning, and go-to-market strategy from the team behind PMM Sherpa.',
}

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

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#191c1e] dark:bg-[#0a1628] dark:text-[#e6ebf4]">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#e8ecf4]/70 dark:bg-[#0a1628]/85 dark:border-white/[0.08]">
        <nav className="max-w-6xl mx-auto flex h-14 items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center">
              <MountainIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold">PMMSherpa</span>
            <span className="text-xs uppercase tracking-widest text-[#5f6368] dark:text-[#8e9199] ml-2 hidden sm:inline">
              Blog
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5 text-sm font-medium text-[#5f6368] dark:text-[#8e9199]">
            <Link
              href="/docs"
              className="hover:text-[#191c1e] dark:hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/blog"
              className="hover:text-[#191c1e] dark:hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white px-4 py-1.5 transition-colors"
            >
              Open app
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#e8ecf4]/70 dark:border-white/[0.08] py-8">
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center">
              <MountainIcon className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium">PMMSherpa</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#5f6368] dark:text-[#8e9199]">
            <Link href="/" className="hover:text-[#191c1e] dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link
              href="/docs"
              className="hover:text-[#191c1e] dark:hover:text-white transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/blog"
              className="hover:text-[#191c1e] dark:hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#191c1e] dark:hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#191c1e] dark:hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <a
              href="/blog/feed.xml"
              className="flex items-center gap-1 hover:text-[#191c1e] dark:hover:text-white transition-colors"
              aria-label="RSS feed"
            >
              <Rss className="h-3 w-3" />
              RSS
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

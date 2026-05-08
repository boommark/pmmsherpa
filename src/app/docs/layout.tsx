import type { Metadata } from 'next'
import Link from 'next/link'
import { listDocPages } from '@/lib/docs'
import { DocsSidebar } from '@/components/docs/DocsSidebar'

export const metadata: Metadata = {
  title: 'Docs',
  description:
    'Documentation for the PMM Sherpa MCP server: connect any modern AI client, understand credits, and see worked examples.',
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

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pages = listDocPages()
  return (
    <div
      className="docs-light min-h-screen bg-white text-[#191c1e]"
      style={{ colorScheme: 'light' }}
    >
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#e8ecf4]/70">
        <nav className="max-w-7xl mx-auto flex h-14 items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center">
              <MountainIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold">PMMSherpa</span>
            <span className="text-xs uppercase tracking-widest text-[#5f6368] ml-2 hidden sm:inline">
              Docs
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium text-[#5f6368]">
            <Link href="/" className="hover:text-[#191c1e] transition-colors">
              Home
            </Link>
            <a
              href="https://github.com/boommark/pmmsherpa-mcp"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#191c1e] transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/login"
              className="rounded-full bg-[#0058be] hover:bg-[#004a9e] text-white px-4 py-1.5 transition-colors"
            >
              Open app
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        <DocsSidebar pages={pages} />
        <main className="min-w-0">{children}</main>
      </div>

      <footer className="border-t border-[#e8ecf4]/70 py-8 text-center text-xs text-[#5f6368]">
        <p>
          PMM Sherpa MCP. Need help? Email{' '}
          <a href="mailto:hi@pmmsherpa.com" className="text-[#0058be] hover:underline">
            hi@pmmsherpa.com
          </a>
          .
        </p>
      </footer>
    </div>
  )
}

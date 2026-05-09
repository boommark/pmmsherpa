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

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
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
        <nav className="max-w-[1400px] mx-auto flex h-14 items-center justify-between px-5 md:px-8">
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
              className="flex items-center gap-1.5 hover:text-[#191c1e] transition-colors"
              aria-label="GitHub"
            >
              <GitHubIcon className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
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

      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-8 md:py-12 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
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

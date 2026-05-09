'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plug, BookOpen, Sparkles } from 'lucide-react'
import type { DocPage } from '@/lib/docs'

type Section = {
  heading: string
  icon: React.ComponentType<{ className?: string }>
  match: (page: DocPage) => boolean
}

const SECTIONS: Section[] = [
  {
    heading: 'Get started',
    icon: Sparkles,
    match: (p) => p.slug === '' || p.slug === 'index',
  },
  {
    heading: 'Connect a client',
    icon: Plug,
    match: (p) => p.slug.startsWith('connect-'),
  },
  {
    heading: 'Reference',
    icon: BookOpen,
    match: (p) =>
      !p.slug.startsWith('connect-') && p.slug !== '' && p.slug !== 'index',
  },
]

export function DocsSidebar({ pages }: { pages: DocPage[] }) {
  const pathname = usePathname() || '/docs'
  return (
    <aside className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:pr-2">
      <nav className="text-sm">
        {SECTIONS.map((section) => {
          const sectionPages = pages.filter(section.match)
          if (sectionPages.length === 0) return null
          const Icon = section.icon
          return (
            <div key={section.heading} className="mb-7">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#5f6368] mb-2 px-2">
                <Icon className="h-3 w-3" />
                {section.heading}
              </p>
              <ul className="space-y-px">
                {sectionPages.map((page) => {
                  const active =
                    pathname === page.href ||
                    (page.href === '/docs' && pathname === '/docs/')
                  return (
                    <li key={page.href}>
                      <Link
                        href={page.href}
                        className={
                          'block rounded-md px-2 py-1.5 leading-snug transition-colors ' +
                          (active
                            ? 'bg-[#0058be]/8 text-[#0058be] font-medium'
                            : 'text-[#3a3f47] hover:bg-[#f2f4f7] hover:text-[#0d1117]')
                        }
                      >
                        {page.frontmatter.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

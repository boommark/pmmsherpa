'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/docs'

export function DocsToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          )
          setActiveId(top.target.id)
        }
      },
      { rootMargin: '-90px 0px -65% 0px', threshold: 0 },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <aside className="hidden xl:block xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto pl-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5f6368] mb-3">
        On this page
      </p>
      <nav className="docs-toc space-y-0.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={
              (activeId === item.id ? 'active ' : '') +
              (item.level === 3 ? 'toc-h3' : '')
            }
          >
            {item.title}
          </a>
        ))}
      </nav>
    </aside>
  )
}

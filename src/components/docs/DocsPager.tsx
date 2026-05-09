import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DocPage } from '@/lib/docs'

export function DocsPager({
  prev,
  next,
}: {
  prev: DocPage | null
  next: DocPage | null
}) {
  if (!prev && !next) return null
  return (
    <div className="mt-16 pt-8 border-t border-[#e8ecf4]/70 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {prev ? (
        <Link
          href={prev.href}
          className="group rounded-xl border border-[#e8ecf4]/70 bg-white hover:border-[#0058be]/40 hover:bg-[#f7f9fc] transition-colors p-4 text-left"
        >
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-widest text-[#5f6368]">
            <ChevronLeft className="h-3 w-3" /> Previous
          </span>
          <span className="block mt-1 text-sm font-semibold text-[#0d1117] group-hover:text-[#0058be]">
            {prev.frontmatter.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group rounded-xl border border-[#e8ecf4]/70 bg-white hover:border-[#0058be]/40 hover:bg-[#f7f9fc] transition-colors p-4 text-right"
        >
          <span className="flex items-center justify-end gap-1 text-[11px] uppercase tracking-widest text-[#5f6368]">
            Next <ChevronRight className="h-3 w-3" />
          </span>
          <span className="block mt-1 text-sm font-semibold text-[#0d1117] group-hover:text-[#0058be]">
            {next.frontmatter.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}

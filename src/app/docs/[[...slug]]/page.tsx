import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getDocPage,
  listDocPages,
  extractToc,
  getAdjacentPages,
} from '@/lib/docs'
import { DocContent } from '@/components/docs/DocContent'
import { DocsToc } from '@/components/docs/DocsToc'
import { DocsPager } from '@/components/docs/DocsPager'

interface PageProps {
  params: Promise<{ slug?: string[] }>
}

export async function generateStaticParams() {
  const pages = listDocPages()
  return pages.map((p) => ({ slug: p.slug ? p.slug.split('/') : [] }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getDocPage(slug)
  if (!page) return { title: 'Not found' }
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  }
}

function stripFirstHeading(markdown: string, title: string): string {
  const lines = markdown.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const m = line.match(/^#\s+(.+?)\s*$/)
    if (m && m[1].trim() === title.trim()) {
      lines.splice(i, 1)
      while (i < lines.length && !lines[i].trim()) lines.splice(i, 1)
      break
    }
    break
  }
  return lines.join('\n')
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const page = getDocPage(slug)
  if (!page) notFound()
  const allPages = listDocPages()
  const { prev, next } = getAdjacentPages(allPages, page.slug)
  const toc = extractToc(page.content)
  const body = stripFirstHeading(page.content, page.frontmatter.title)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-10">
      <article className="min-w-0">
        <header className="mb-8">
          <h1 className="text-[2rem] md:text-[2.25rem] font-bold tracking-[-0.02em] text-[#0d1117] leading-[1.15]">
            {page.frontmatter.title}
          </h1>
          {page.frontmatter.description ? (
            <p className="mt-3 text-lg text-[#57606a] leading-relaxed">
              {page.frontmatter.description}
            </p>
          ) : null}
        </header>
        <div className="prose-docs">
          <DocContent markdown={body} />
        </div>
        <DocsPager prev={prev} next={next} />
      </article>
      <DocsToc items={toc} />
    </div>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getDocPage, listDocPages } from '@/lib/docs'
import { DocContent } from '@/components/docs/DocContent'

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

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const page = getDocPage(slug)
  if (!page) notFound()
  return (
    <article className="prose-docs">
      <DocContent markdown={page.content} />
    </article>
  )
}

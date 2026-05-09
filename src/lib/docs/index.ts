/**
 * Docs site loader. Reads markdown/MDX files from the docs/ directory at the
 * repo root and returns them with parsed frontmatter. We do NOT use @next/mdx
 * because the docs do not need JSX-in-markdown, and react-markdown + remark-gfm
 * (already in the dep tree) covers everything we need.
 *
 * Frontmatter format (YAML-lite, supports string + number scalars only):
 *   ---
 *   title: Page title
 *   description: Page description
 *   order: 0
 *   ---
 */

import fs from 'node:fs'
import path from 'node:path'

export interface DocFrontmatter {
  title: string
  description?: string
  order?: number
}

export interface DocPage {
  slug: string // empty string for index, otherwise dash-separated
  href: string // /docs or /docs/<slug>
  frontmatter: DocFrontmatter
  content: string // markdown body, frontmatter stripped
}

const DOCS_DIR = path.join(process.cwd(), 'docs')

function parseFrontmatter(raw: string): { frontmatter: DocFrontmatter; body: string } {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!fmMatch) {
    return { frontmatter: { title: 'Untitled' }, body: raw }
  }
  const block = fmMatch[1]
  const body = raw.slice(fmMatch[0].length)
  const fm: Record<string, string | number> = {}
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.+?)\s*$/)
    if (!m) continue
    const key = m[1]
    let value: string = m[2]
    // strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key === 'order') {
      fm[key] = Number(value)
    } else {
      fm[key] = value
    }
  }
  return {
    frontmatter: {
      title: (fm.title as string) || 'Untitled',
      description: fm.description as string | undefined,
      order: fm.order as number | undefined,
    },
    body,
  }
}

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.(mdx|md)$/, '')
  return base === 'index' ? '' : base
}

export function listDocPages(): DocPage[] {
  if (!fs.existsSync(DOCS_DIR)) return []
  const entries = fs.readdirSync(DOCS_DIR, { withFileTypes: true })
  const pages: DocPage[] = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!/\.(mdx|md)$/.test(entry.name)) continue
    // skip internal-only docs (no frontmatter, capitalized filenames). The
    // public mirror only ships .mdx; .md files in docs/ are treated as
    // internal unless they have frontmatter starting with `---`.
    const full = path.join(DOCS_DIR, entry.name)
    const raw = fs.readFileSync(full, 'utf8')
    if (!entry.name.endsWith('.mdx')) continue
    const { frontmatter, body } = parseFrontmatter(raw)
    const slug = slugFromFilename(entry.name)
    pages.push({
      slug,
      href: slug ? `/docs/${slug}` : '/docs',
      frontmatter,
      content: body,
    })
  }
  pages.sort((a, b) => {
    const ao = a.frontmatter.order ?? 999
    const bo = b.frontmatter.order ?? 999
    if (ao !== bo) return ao - bo
    return a.frontmatter.title.localeCompare(b.frontmatter.title)
  })
  return pages
}

export function getDocPage(slugSegments: string[] | undefined): DocPage | null {
  const slug = slugSegments && slugSegments.length > 0 ? slugSegments.join('/') : ''
  const filename = slug === '' ? 'index.mdx' : `${slug}.mdx`
  const full = path.join(DOCS_DIR, filename)
  // path traversal guard
  if (!full.startsWith(DOCS_DIR)) return null
  if (!fs.existsSync(full)) return null
  const raw = fs.readFileSync(full, 'utf8')
  const { frontmatter, body } = parseFrontmatter(raw)
  return {
    slug,
    href: slug ? `/docs/${slug}` : '/docs',
    frontmatter,
    content: body,
  }
}

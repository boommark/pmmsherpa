/**
 * Blog loader. Reads markdown files from content/blog/ at the repo root and
 * returns them with parsed frontmatter. Modeled on src/lib/docs (YAML-lite
 * hand-rolled frontmatter — no gray-matter dependency) but extended with
 * string arrays (`tags`) and booleans (`draft`).
 *
 * Frontmatter contract is documented in content/blog/README.md:
 *   ---
 *   title: "Post title"
 *   description: "Excerpt for cards + meta description"
 *   heroImage: /blog/<slug>/hero.jpg      # optional
 *   heroImageAlt: "..."                   # optional
 *   author: abhishek                      # id from content/blog/authors.json
 *   publishedAt: 2026-07-15
 *   updatedAt: 2026-07-20                 # optional
 *   tags: [ai, gtm, positioning]          # optional
 *   draft: true                           # optional; hidden from index/sitemap/RSS
 *   ---
 */

import fs from 'node:fs'
import path from 'node:path'

export interface BlogFrontmatter {
  title: string
  description: string
  heroImage?: string
  heroImageAlt?: string
  author: string // author id, resolved via getAuthor()
  publishedAt: string // YYYY-MM-DD
  updatedAt?: string
  tags: string[]
  draft: boolean
}

export interface BlogAuthor {
  id: string
  name: string
  title: string
  avatar: string
  linkedin?: string
}

export interface BlogPost {
  slug: string
  href: string // /blog/<slug>
  frontmatter: BlogFrontmatter
  content: string // markdown body, frontmatter stripped
  readingTimeMinutes: number
  author: BlogAuthor
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const AUTHORS_FILE = path.join(BLOG_DIR, 'authors.json')

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

/** Parse an inline YAML array: [a, b, "c d"] → ['a', 'b', 'c d'] */
function parseInlineArray(value: string): string[] {
  const inner = value.slice(1, -1).trim()
  if (!inner) return []
  return inner
    .split(',')
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean)
}

export function parseFrontmatter(raw: string): {
  frontmatter: BlogFrontmatter
  body: string
} {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!fmMatch) {
    return {
      frontmatter: {
        title: 'Untitled',
        description: '',
        author: '',
        publishedAt: '',
        tags: [],
        draft: false,
      },
      body: raw,
    }
  }
  const block = fmMatch[1]
  const body = raw.slice(fmMatch[0].length)
  const fm: Record<string, string | string[] | boolean> = {}
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.+?)\s*$/)
    if (!m) continue
    const key = m[1]
    const rawValue = m[2]
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      fm[key] = parseInlineArray(rawValue)
    } else if (rawValue === 'true' || rawValue === 'false') {
      fm[key] = rawValue === 'true'
    } else {
      fm[key] = stripQuotes(rawValue)
    }
  }
  const tags = Array.isArray(fm.tags)
    ? fm.tags
    : typeof fm.tags === 'string' && fm.tags
      ? [fm.tags]
      : []
  return {
    frontmatter: {
      title: typeof fm.title === 'string' && fm.title ? fm.title : 'Untitled',
      description: typeof fm.description === 'string' ? fm.description : '',
      heroImage: typeof fm.heroImage === 'string' ? fm.heroImage : undefined,
      heroImageAlt: typeof fm.heroImageAlt === 'string' ? fm.heroImageAlt : undefined,
      author: typeof fm.author === 'string' ? fm.author : '',
      publishedAt: typeof fm.publishedAt === 'string' ? fm.publishedAt : '',
      updatedAt: typeof fm.updatedAt === 'string' ? fm.updatedAt : undefined,
      tags,
      draft: fm.draft === true,
    },
    body,
  }
}

/** ~225 words per minute, minimum 1 minute. */
export function readingTimeMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 225))
}

/** Render a YYYY-MM-DD date as "July 9, 2026" (UTC — no off-by-one). */
export function formatPostDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}

const FALLBACK_AUTHOR_TITLE = 'Guest Contributor'

/** Humanize an author id ("jane-doe" → "Jane Doe") for the fallback byline. */
function humanizeId(id: string): string {
  if (!id) return 'PMM Sherpa Team'
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function loadAuthors(): Record<string, BlogAuthor> {
  try {
    const raw = fs.readFileSync(AUTHORS_FILE, 'utf8')
    return JSON.parse(raw) as Record<string, BlogAuthor>
  } catch {
    return {}
  }
}

export function getAuthor(id: string): BlogAuthor {
  const authors = loadAuthors()
  const author = authors[id]
  if (author) return author
  return {
    id,
    name: humanizeId(id),
    title: FALLBACK_AUTHOR_TITLE,
    avatar: '',
  }
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.(mdx|md)$/, '')
}

function loadPost(slug: string, raw: string): BlogPost {
  const { frontmatter, body } = parseFrontmatter(raw)
  return {
    slug,
    href: `/blog/${slug}`,
    frontmatter,
    content: body,
    readingTimeMinutes: readingTimeMinutes(body),
    author: getAuthor(frontmatter.author),
  }
}

function listAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
  const posts: BlogPost[] = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!/\.(mdx|md)$/.test(entry.name)) continue
    if (entry.name.toLowerCase() === 'readme.md') continue
    const raw = fs.readFileSync(path.join(BLOG_DIR, entry.name), 'utf8')
    posts.push(loadPost(slugFromFilename(entry.name), raw))
  }
  posts.sort((a, b) => b.frontmatter.publishedAt.localeCompare(a.frontmatter.publishedAt))
  return posts
}

/** Published posts, newest first. */
export function listPosts(): BlogPost[] {
  return listAllPosts().filter((p) => !p.frontmatter.draft)
}

/** Published slugs only (SSG params, sitemap, RSS). */
export function listSlugs(): string[] {
  return listPosts().map((p) => p.slug)
}

/**
 * Fetch a single post by slug. Returns drafts too — direct-URL preview is
 * how drafts get reviewed; the page renders them with a Draft badge + noindex.
 */
export function getPost(slug: string): BlogPost | null {
  if (!/^[\w-]+$/.test(slug)) return null // path traversal guard
  for (const ext of ['md', 'mdx'] as const) {
    const full = path.join(BLOG_DIR, `${slug}.${ext}`)
    if (!full.startsWith(BLOG_DIR)) return null
    if (!fs.existsSync(full)) continue
    return loadPost(slug, fs.readFileSync(full, 'utf8'))
  }
  return null
}

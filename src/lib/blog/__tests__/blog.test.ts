import { describe, it, expect } from 'vitest'
import {
  parseFrontmatter,
  readingTimeMinutes,
  formatPostDate,
  getAuthor,
} from '@/lib/blog'

describe('parseFrontmatter', () => {
  it('parses the full frontmatter contract', () => {
    const raw = [
      '---',
      'title: "How AI Is Rebuilding the Enterprise"',
      'description: A sweeping look at AI in 2026.',
      'heroImage: /blog/ai-post/hero.jpg',
      'heroImageAlt: "Server racks at dusk"',
      'author: abhishek',
      'publishedAt: 2026-07-15',
      'updatedAt: 2026-07-20',
      'tags: [ai, gtm, "category design"]',
      'draft: true',
      '---',
      '',
      '# Body starts here',
    ].join('\n')
    const { frontmatter, body } = parseFrontmatter(raw)
    expect(frontmatter.title).toBe('How AI Is Rebuilding the Enterprise')
    expect(frontmatter.description).toBe('A sweeping look at AI in 2026.')
    expect(frontmatter.heroImage).toBe('/blog/ai-post/hero.jpg')
    expect(frontmatter.heroImageAlt).toBe('Server racks at dusk')
    expect(frontmatter.author).toBe('abhishek')
    expect(frontmatter.publishedAt).toBe('2026-07-15')
    expect(frontmatter.updatedAt).toBe('2026-07-20')
    expect(frontmatter.tags).toEqual(['ai', 'gtm', 'category design'])
    expect(frontmatter.draft).toBe(true)
    expect(body.trim()).toBe('# Body starts here')
  })

  it('applies defaults for optional fields', () => {
    const raw = [
      '---',
      'title: Minimal post',
      'description: Just the required bits.',
      'author: abhishek',
      'publishedAt: 2026-07-09',
      '---',
      'Body.',
    ].join('\n')
    const { frontmatter } = parseFrontmatter(raw)
    expect(frontmatter.heroImage).toBeUndefined()
    expect(frontmatter.updatedAt).toBeUndefined()
    expect(frontmatter.tags).toEqual([])
    expect(frontmatter.draft).toBe(false)
  })

  it('handles single quotes and empty tag arrays', () => {
    const raw = "---\ntitle: 'Quoted'\ntags: []\n---\nBody"
    const { frontmatter } = parseFrontmatter(raw)
    expect(frontmatter.title).toBe('Quoted')
    expect(frontmatter.tags).toEqual([])
  })

  it('treats draft: false as published', () => {
    const raw = '---\ntitle: T\ndraft: false\n---\nBody'
    expect(parseFrontmatter(raw).frontmatter.draft).toBe(false)
  })

  it('returns the raw content when no frontmatter block exists', () => {
    const { frontmatter, body } = parseFrontmatter('Just markdown, no fences.')
    expect(frontmatter.title).toBe('Untitled')
    expect(frontmatter.draft).toBe(false)
    expect(body).toBe('Just markdown, no fences.')
  })

  it('handles CRLF line endings', () => {
    const raw = '---\r\ntitle: Windows\r\n---\r\nBody'
    const { frontmatter, body } = parseFrontmatter(raw)
    expect(frontmatter.title).toBe('Windows')
    expect(body).toBe('Body')
  })
})

describe('readingTimeMinutes', () => {
  it('never returns less than 1 minute', () => {
    expect(readingTimeMinutes('')).toBe(1)
    expect(readingTimeMinutes('a few words only')).toBe(1)
  })

  it('rounds up at ~225 words per minute', () => {
    const words225 = Array.from({ length: 225 }, (_, i) => `word${i}`).join(' ')
    expect(readingTimeMinutes(words225)).toBe(1)
    const words226 = `${words225} extra`
    expect(readingTimeMinutes(words226)).toBe(2)
    const words900 = Array.from({ length: 900 }, (_, i) => `w${i}`).join(' ')
    expect(readingTimeMinutes(words900)).toBe(4)
  })

  it('ignores extra whitespace', () => {
    expect(readingTimeMinutes('one   two\n\nthree\t four')).toBe(1)
  })
})

describe('formatPostDate', () => {
  it('renders YYYY-MM-DD as "Month D, YYYY" without timezone drift', () => {
    expect(formatPostDate('2026-07-09')).toBe('July 9, 2026')
    expect(formatPostDate('2026-01-01')).toBe('January 1, 2026')
    expect(formatPostDate('2025-12-31')).toBe('December 31, 2025')
  })

  it('returns the raw string for unparseable dates', () => {
    expect(formatPostDate('soon')).toBe('soon')
  })
})

describe('getAuthor', () => {
  it('resolves a registered author from authors.json', () => {
    const author = getAuthor('abhishek')
    expect(author.name).toBe('Abhishek Ratna')
    expect(author.title).toBe('Founder, PMM Sherpa')
    expect(author.avatar).toBe('/blog/authors/abhishek.jpg')
    expect(author.linkedin).toBe('https://www.linkedin.com/in/abhishekratna')
  })

  it('falls back to a humanized byline for unknown ids', () => {
    const author = getAuthor('jane-doe')
    expect(author.name).toBe('Jane Doe')
    expect(author.title).toBe('Guest Contributor')
    expect(author.avatar).toBe('')
  })
})

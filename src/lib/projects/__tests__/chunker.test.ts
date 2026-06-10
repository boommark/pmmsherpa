/**
 * Heading-aware chunker tests.
 *
 * Covers the structural guarantees the ingestion pipeline depends on:
 * heading-aligned splits, the hard token cap, intra-section overlap, and
 * tiny-section merging.
 */

import { describe, it, expect } from 'vitest'
import { chunkMarkdown, estimateTokens } from '../chunker'

/** Deterministic filler prose of roughly `tokens` tokens (sentence-aligned).
 * Sentences are numbered so the text is non-periodic — overlap assertions
 * would be meaningless on repeated identical sentences. */
function prose(tokens: number, seed = 'alpha'): string {
  const sample = `The ${seed} positioning narrative number 000 speaks directly to the buyer pain.`
  const sentenceTokens = estimateTokens(sample + ' ')
  const count = Math.max(1, Math.ceil(tokens / sentenceTokens))
  return Array.from(
    { length: count },
    (_, i) =>
      `The ${seed} positioning narrative number ${String(i).padStart(3, '0')} speaks directly to the buyer pain.`,
  ).join(' ')
}

describe('estimateTokens', () => {
  it('uses the chars/4 heuristic, rounding up', () => {
    expect(estimateTokens('')).toBe(0)
    expect(estimateTokens('abcd')).toBe(1)
    expect(estimateTokens('abcde')).toBe(2)
    expect(estimateTokens('a'.repeat(400))).toBe(100)
  })
})

describe('chunkMarkdown — basics', () => {
  it('returns [] for empty or whitespace-only input', () => {
    expect(chunkMarkdown('')).toEqual([])
    expect(chunkMarkdown('   \n\n  \t')).toEqual([])
  })

  it('returns a single chunk for a short document', () => {
    const chunks = chunkMarkdown('# Title\n\nA short paragraph about positioning.')
    expect(chunks).toHaveLength(1)
    expect(chunks[0].sectionTitle).toBe('Title')
    expect(chunks[0].content).toContain('A short paragraph about positioning.')
    expect(chunks[0].tokenCount).toBe(estimateTokens(chunks[0].content))
  })

  it('handles documents with no headings at all', () => {
    const chunks = chunkMarkdown(prose(1500))
    expect(chunks.length).toBeGreaterThan(1)
    for (const c of chunks) {
      expect(c.sectionTitle).toBeNull()
    }
  })
})

describe('chunkMarkdown — heading-aware splits', () => {
  it('splits at heading boundaries and tags chunks with their section title', () => {
    const doc = [
      '# Messaging Framework',
      '',
      prose(400, 'framework'),
      '',
      '# Competitive Battlecard',
      '',
      prose(400, 'battlecard'),
    ].join('\n')

    const chunks = chunkMarkdown(doc)
    expect(chunks.length).toBe(2)
    expect(chunks[0].sectionTitle).toBe('Messaging Framework')
    expect(chunks[1].sectionTitle).toBe('Competitive Battlecard')
    // No cross-heading bleed: battlecard content stays out of chunk 0.
    expect(chunks[0].content).not.toContain('battlecard')
    expect(chunks[1].content).not.toContain('framework positioning')
  })

  it('keeps the heading line inside the chunk content for keyword search', () => {
    const doc = `## Pricing Tiers\n\n${prose(100, 'pricing')}`
    const chunks = chunkMarkdown(doc)
    expect(chunks[0].content).toContain('## Pricing Tiers')
  })

  it('merges tiny sections forward instead of emitting micro-chunks', () => {
    // 12 slide-like sections of ~25 tokens each — far below minTokens (200).
    const doc = Array.from({ length: 12 }, (_, i) =>
      `# Slide ${i + 1}\n\nOne short bullet about feature number ${i + 1}.`,
    ).join('\n\n')

    const chunks = chunkMarkdown(doc)
    expect(chunks.length).toBeLessThan(12)
    expect(chunks.length).toBeGreaterThan(0)
  })
})

describe('chunkMarkdown — token caps', () => {
  it('never exceeds maxTokens, including for long unbroken sections', () => {
    const maxTokens = 800
    const doc = `# Long Section\n\n${prose(5000, 'verbose')}`
    const chunks = chunkMarkdown(doc, { maxTokens })
    expect(chunks.length).toBeGreaterThan(5)
    for (const c of chunks) {
      expect(c.tokenCount).toBeLessThanOrEqual(maxTokens)
    }
  })

  it('respects a custom smaller cap', () => {
    const chunks = chunkMarkdown(prose(2000), { targetTokens: 200, maxTokens: 250, minTokens: 50 })
    for (const c of chunks) {
      expect(c.tokenCount).toBeLessThanOrEqual(250)
    }
  })

  it('splits a single oversized paragraph at sentence boundaries', () => {
    // One paragraph (no blank lines) of ~2400 tokens.
    const para = prose(2400, 'mono')
    const chunks = chunkMarkdown(para, { maxTokens: 800 })
    expect(chunks.length).toBeGreaterThanOrEqual(3)
    for (const c of chunks) {
      expect(c.tokenCount).toBeLessThanOrEqual(800)
      // Sentence-aligned: pieces end at sentence punctuation.
      expect(c.content.trim()).toMatch(/[.!?]$/)
    }
  })

  it('hard-splits pathological content with no sentence boundaries', () => {
    const blob = 'x'.repeat(20_000) // ~5000 tokens, zero punctuation
    const chunks = chunkMarkdown(blob, { maxTokens: 800 })
    expect(chunks.length).toBeGreaterThanOrEqual(6)
    for (const c of chunks) {
      expect(c.tokenCount).toBeLessThanOrEqual(800)
    }
  })
})

describe('chunkMarkdown — overlap', () => {
  it('seeds each intra-section continuation chunk with the previous tail', () => {
    const doc = prose(3000, 'overlap')
    const chunks = chunkMarkdown(doc)
    expect(chunks.length).toBeGreaterThan(2)

    for (let i = 1; i < chunks.length; i++) {
      // The start of chunk i must repeat content from the end of chunk i-1.
      const head = chunks[i].content.slice(0, 60)
      expect(chunks[i - 1].content).toContain(head)
    }
  })

  it('overlap is roughly 10-15% of the target size', () => {
    const targetTokens = 650
    const doc = prose(3000, 'ratio')
    const chunks = chunkMarkdown(doc, { targetTokens, overlapRatio: 0.12 })

    // Find how much of chunk[1]'s head is shared with chunk[0]'s tail.
    const second = chunks[1].content
    let sharedChars = 0
    for (let len = second.length; len > 0; len--) {
      if (chunks[0].content.endsWith(second.slice(0, len))) {
        sharedChars = len
        break
      }
    }
    const sharedTokens = estimateTokens(second.slice(0, sharedChars))
    expect(sharedTokens).toBeGreaterThan(targetTokens * 0.05)
    expect(sharedTokens).toBeLessThan(targetTokens * 0.3)
  })

  it('does not bleed overlap across heading boundaries', () => {
    const doc = [
      '# Section One',
      '',
      prose(700, 'one'),
      '',
      '# Section Two',
      '',
      prose(300, 'two'),
    ].join('\n')

    const chunks = chunkMarkdown(doc)
    const sectionTwoChunk = chunks.find((c) => c.sectionTitle === 'Section Two')
    expect(sectionTwoChunk).toBeDefined()
    expect(sectionTwoChunk!.content).not.toContain('one positioning')
  })
})

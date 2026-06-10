/**
 * Heading-aware markdown chunker for project documents.
 *
 * LlamaParse emits markdown, so heading lines (#, ##, …) are reliable
 * structural boundaries. Strategy:
 *
 *   1. Split the document into sections at heading lines; each section keeps
 *      its heading text as `sectionTitle` (and the heading line stays in the
 *      chunk content so keyword search can hit it).
 *   2. Within a section, accumulate paragraphs into chunks of ~500-800 tokens
 *      (flush when the next paragraph would exceed `maxTokens`).
 *   3. Tiny sections (< `minTokens`) merge forward across heading boundaries
 *      so a deck with 40 one-line slides doesn't produce 40 micro-chunks.
 *   4. Intra-section flushes seed the next chunk with the trailing ~10-15%
 *      of the previous chunk (sentence-aligned overlap). Overlap never
 *      crosses a heading boundary.
 *
 * Token counts use the same rough chars/4 estimate the rest of the codebase
 * relies on (close enough for budget enforcement; we never bill on it).
 */

export interface ProjectChunkOutput {
  content: string
  sectionTitle: string | null
  tokenCount: number
}

export interface ChunkOptions {
  /** Soft target per chunk. Default 650. */
  targetTokens?: number
  /** Hard cap per chunk. Default 800. */
  maxTokens?: number
  /** Sections smaller than this merge into the next chunk. Default 200. */
  minTokens?: number
  /** Overlap as a fraction of targetTokens. Default 0.12 (~10-15%). */
  overlapRatio?: number
}

/** Rough token estimate: ~4 chars/token for English prose. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/

interface Piece {
  text: string
  tokens: number
  sectionTitle: string | null
}

export function chunkMarkdown(text: string, options: ChunkOptions = {}): ProjectChunkOutput[] {
  const targetTokens = options.targetTokens ?? 650
  const maxTokens = options.maxTokens ?? 800
  const minTokens = options.minTokens ?? 200
  const overlapTokens = Math.round((options.overlapRatio ?? 0.12) * targetTokens)

  if (!text || !text.trim()) return []

  // Oversized paragraphs split at the TARGET size (not the max) so every
  // piece leaves headroom for the overlap seed under the hard cap.
  const pieceCap = Math.min(targetTokens, maxTokens)
  const pieces = toPieces(text, pieceCap)
  if (pieces.length === 0) return []

  const chunks: ProjectChunkOutput[] = []

  let cur: string[] = []
  let curTokens = 0
  let curSectionTitle: string | null = pieces[0].sectionTitle
  let lastPieceSection: string | null = pieces[0].sectionTitle

  const flush = () => {
    if (cur.length === 0) return
    const content = cur.join('\n\n').trim()
    if (content) {
      chunks.push({ content, sectionTitle: curSectionTitle, tokenCount: estimateTokens(content) })
    }
    cur = []
    curTokens = 0
  }

  for (const piece of pieces) {
    const newSection = piece.sectionTitle !== lastPieceSection
    lastPieceSection = piece.sectionTitle

    // +1 token accounts for the '\n\n' joiner, keeping the chars/4 bound exact.
    const wouldOverflow = cur.length > 0 && curTokens + 1 + piece.tokens > maxTokens
    const headingBreak = newSection && curTokens >= minTokens

    if (wouldOverflow || headingBreak) {
      const prevContent = cur.join('\n\n')
      flush()
      // Sentence-aligned overlap — only when continuing within the same
      // section; never bleed content across a heading boundary. Skipped when
      // the incoming piece is so large that overlap would bust maxTokens.
      if (!newSection && overlapTokens > 0) {
        const overlap = tailByTokens(prevContent, overlapTokens)
        const overlapSize = estimateTokens(overlap)
        if (overlap && overlapSize + 1 + piece.tokens <= maxTokens) {
          cur.push(overlap)
          curTokens = overlapSize
        }
      }
    }

    if (cur.length === 0) curSectionTitle = piece.sectionTitle
    cur.push(piece.text)
    curTokens += (cur.length > 1 ? 1 : 0) + piece.tokens
  }
  flush()

  return chunks
}

/**
 * Decompose the document into paragraph-level pieces, each tagged with the
 * heading it falls under and guaranteed to fit within maxTokens.
 */
function toPieces(text: string, maxTokens: number): Piece[] {
  const pieces: Piece[] = []
  let sectionTitle: string | null = null

  // Split into blocks on blank lines, but treat heading lines as their own blocks.
  const lines = text.split('\n')
  let buf: string[] = []

  const pushBuf = () => {
    const para = buf.join('\n').trim()
    buf = []
    if (!para) return
    for (const part of splitOversized(para, maxTokens)) {
      pieces.push({ text: part, tokens: estimateTokens(part), sectionTitle })
    }
  }

  for (const line of lines) {
    const m = HEADING_RE.exec(line)
    if (m) {
      pushBuf()
      sectionTitle = m[2].trim()
      // Keep the heading line itself in the content stream.
      pieces.push({ text: line.trim(), tokens: estimateTokens(line.trim()), sectionTitle })
      continue
    }
    if (line.trim() === '') {
      pushBuf()
    } else {
      buf.push(line)
    }
  }
  pushBuf()

  return pieces
}

/** Split a paragraph that exceeds maxTokens at sentence boundaries
 * (hard character split as a last resort for e.g. giant table rows). */
function splitOversized(para: string, maxTokens: number): string[] {
  if (estimateTokens(para) <= maxTokens) return [para]

  const sentences = para.split(/(?<=[.!?])\s+/)
  const out: string[] = []
  let cur = ''

  const pushCur = () => {
    if (cur.trim()) out.push(cur.trim())
    cur = ''
  }

  for (const sentence of sentences) {
    if (estimateTokens(sentence) > maxTokens) {
      pushCur()
      // Hard split — no sentence boundary available.
      const maxChars = maxTokens * 4
      for (let i = 0; i < sentence.length; i += maxChars) {
        out.push(sentence.slice(i, i + maxChars))
      }
      continue
    }
    const candidate = cur ? `${cur} ${sentence}` : sentence
    if (estimateTokens(candidate) > maxTokens) {
      pushCur()
      cur = sentence
    } else {
      cur = candidate
    }
  }
  pushCur()

  return out
}

/** Return the trailing whole sentences of `text` totaling >= wantTokens
 * (capped at the full text). */
function tailByTokens(text: string, wantTokens: number): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  if (estimateTokens(trimmed) <= wantTokens) return trimmed

  const sentences = trimmed.split(/(?<=[.!?])\s+/)
  const tail: string[] = []
  let tokens = 0
  for (let i = sentences.length - 1; i >= 0; i--) {
    const s = sentences[i]
    tail.unshift(s)
    tokens += estimateTokens(s)
    if (tokens >= wantTokens) break
  }
  const joined = tail.join(' ').trim()
  // If the "sentence" tail is a single huge run-on, cut to the char budget.
  if (estimateTokens(joined) > wantTokens * 2) {
    return joined.slice(-wantTokens * 4)
  }
  return joined
}

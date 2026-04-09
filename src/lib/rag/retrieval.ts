import { createServiceClient } from '@/lib/supabase/server'
import { generateEmbedding, expandQuery } from './embeddings'
import type { RetrievedChunk, RetrievalResult } from '@/types/chat'
import type { Citation } from '@/types/database'

interface HybridSearchParams {
  query: string
  topK?: number
  semanticWeight?: number
  matchThreshold?: number
}

export async function retrieveContext({
  query,
  topK = 8,
  semanticWeight = 0.7,
  matchThreshold = 0.4,
}: HybridSearchParams, userId?: string): Promise<RetrievalResult> {
  const supabase = await createServiceClient()

  // Expand query for better semantic matching
  const expandedQuery = expandQuery(query)

  // Generate embedding for the query
  const embedding = await generateEmbedding(expandedQuery, userId)

  // Call hybrid search function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('hybrid_search', {
    query_embedding: embedding,
    search_query: query,
    semantic_weight: semanticWeight,
    match_threshold: matchThreshold,
    match_count: topK,
  })

  if (error) {
    console.error('Hybrid search error:', error)
    return { chunks: [], totalTokens: 0 }
  }

  // Transform results
  const chunks: RetrievedChunk[] = (data || []).map((row: {
    id: string
    document_id: string
    content: string
    combined_score: number
    token_count: number
    context_header: string | null
    page_number: number | null
    section_title: string | null
    question: string | null
    document_title: string
    source_type: 'book' | 'blog' | 'ama' | 'blog_external' | 'book_pm' | 'podcast_pm' | 'podcast_pmm' | 'podcast_ai'
    author: string | null
    speaker_role: string | null
    url: string | null
  }) => ({
    id: row.id,
    content: row.content,
    similarity: row.combined_score,
    documentId: row.document_id,
    documentTitle: row.document_title,
    sourceType: row.source_type,
    author: row.author,
    speakerRole: row.speaker_role,
    pageNumber: row.page_number,
    sectionTitle: row.section_title,
    question: row.question,
    url: row.url,
  }))

  const totalTokens = chunks.reduce((sum, c) => sum + (c.content.split(' ').length * 1.3), 0)

  return { chunks, totalTokens: Math.round(totalTokens) }
}

/**
 * Multi-query retrieval: runs N parallel hybrid searches, deduplicates by chunk ID,
 * and returns the top chunks sorted by highest score.
 */
export async function multiQueryRetrieve(
  queries: string[],
  topK: number = 10,
  userId?: string
): Promise<RetrievalResult> {
  const startTime = Date.now()

  // Run all queries in parallel
  const results = await Promise.all(
    queries.map((query) =>
      retrieveContext({ query, topK: 6 }, userId).catch((err) => {
        console.error(`[MultiQuery] Error for query "${query}":`, err)
        return { chunks: [], totalTokens: 0 } as RetrievalResult
      })
    )
  )

  // Deduplicate by chunk ID, keeping highest score
  const chunkMap = new Map<string, RetrievedChunk>()
  for (const result of results) {
    for (const chunk of result.chunks) {
      const existing = chunkMap.get(chunk.id)
      if (!existing || chunk.similarity > existing.similarity) {
        chunkMap.set(chunk.id, chunk)
      }
    }
  }

  // Sort by score descending and take top K
  const chunks = Array.from(chunkMap.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)

  const totalTokens = chunks.reduce((sum, c) => sum + (c.content.split(' ').length * 1.3), 0)
  const elapsed = Date.now() - startTime

  console.log(`[MultiQuery] ${queries.length} queries → ${chunkMap.size} unique chunks → top ${chunks.length} returned (${elapsed}ms)`)

  return { chunks, totalTokens: Math.round(totalTokens) }
}

/**
 * Format chunks grouped by knowledge layer for structured context.
 */
export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'No relevant knowledge base content found for this query.'
  }

  // Group by source type
  const books = chunks.filter((c) => c.sourceType === 'book')
  const booksPm = chunks.filter((c) => c.sourceType === 'book_pm')
  const podcastsPm = chunks.filter((c) => c.sourceType === 'podcast_pm')
  const podcastsPmm = chunks.filter((c) => c.sourceType === 'podcast_pmm')
  const podcastsAi = chunks.filter((c) => c.sourceType === 'podcast_ai')
  const amas = chunks.filter((c) => c.sourceType === 'ama')
  const blogs = chunks.filter((c) => c.sourceType === 'blog')
  const blogExternal = chunks.filter((c) => c.sourceType === 'blog_external')

  const sections: string[] = []
  let sourceIdx = 1

  if (books.length > 0) {
    const formatted = books
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### Frameworks & Theory\n${formatted}`)
  }

  if (booksPm.length > 0) {
    const formatted = booksPm
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### Product Strategy\n${formatted}`)
  }

  if (podcastsPm.length > 0) {
    const formatted = podcastsPm
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### Product Strategy Conversations\n${formatted}`)
  }

  if (podcastsPmm.length > 0) {
    const formatted = podcastsPmm
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### GTM & Marketing Conversations\n${formatted}`)
  }

  if (podcastsAi.length > 0) {
    const formatted = podcastsAi
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### AI Product & GTM Insights\n${formatted}`)
  }

  if (amas.length > 0) {
    const formatted = amas
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### Practitioner Experience\n${formatted}`)
  }

  if (blogs.length > 0) {
    const formatted = blogs
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### Tactical Guides & Case Studies\n${formatted}`)
  }

  if (blogExternal.length > 0) {
    const formatted = blogExternal
      .map((chunk) => {
        const info = formatSourceInfo(chunk)
        return `[Source ${sourceIdx++}] ${info}\n${chunk.content}`
      })
      .join('\n\n---\n\n')
    sections.push(`### Marketing Thought Leaders\n${formatted}`)
  }

  return sections.join('\n\n')
}

function formatSourceInfo(chunk: RetrievedChunk): string {
  const parts: string[] = []

  parts.push(`"${chunk.documentTitle}"`)

  if (chunk.author) {
    parts.push(`by ${chunk.author}`)
  }

  if (chunk.speakerRole) {
    parts.push(`(${chunk.speakerRole})`)
  }

  if (chunk.sourceType === 'book' && chunk.pageNumber) {
    parts.push(`(Page ${chunk.pageNumber})`)
  } else if (chunk.sourceType === 'blog') {
    parts.push('(PMA Blog)')
  } else if (chunk.sourceType === 'ama') {
    parts.push('(Sharebird AMA)')
    if (chunk.question) {
      parts.push(`Q: "${chunk.question}"`)
    }
  }

  return parts.join(' ')
}

export function extractCitations(chunks: RetrievedChunk[]): Citation[] {
  return chunks.map((chunk) => ({
    source: chunk.documentTitle,
    source_type: chunk.sourceType,
    author: chunk.author,
    url: chunk.url,
    page_number: chunk.pageNumber,
    section_title: chunk.sectionTitle,
    question: chunk.question,
    speaker_role: chunk.speakerRole,
  }))
}

// Fallback to semantic-only search if hybrid fails
export async function semanticSearch(
  query: string,
  topK: number = 8,
  threshold: number = 0.5
): Promise<RetrievalResult> {
  const supabase = await createServiceClient()
  const embedding = await generateEmbedding(expandQuery(query))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('match_chunks', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: topK,
  })

  if (error) {
    console.error('Semantic search error:', error)
    return { chunks: [], totalTokens: 0 }
  }

  const chunks: RetrievedChunk[] = (data || []).map((row: {
    id: string
    document_id: string
    content: string
    similarity: number
    token_count: number
    context_header: string | null
    page_number: number | null
    section_title: string | null
    question: string | null
    document_title: string
    source_type: 'book' | 'blog' | 'ama' | 'blog_external' | 'book_pm' | 'podcast_pm' | 'podcast_pmm' | 'podcast_ai'
    author: string | null
    speaker_role: string | null
    url: string | null
  }) => ({
    id: row.id,
    content: row.content,
    similarity: row.similarity,
    documentId: row.document_id,
    documentTitle: row.document_title,
    sourceType: row.source_type,
    author: row.author,
    speakerRole: row.speaker_role,
    pageNumber: row.page_number,
    sectionTitle: row.section_title,
    question: row.question,
    url: row.url,
  }))

  const totalTokens = chunks.reduce((sum, c) => sum + (c.content.split(' ').length * 1.3), 0)

  return { chunks, totalTokens: Math.round(totalTokens) }
}

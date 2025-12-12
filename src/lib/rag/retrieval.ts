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
}: HybridSearchParams): Promise<RetrievalResult> {
  const supabase = await createServiceClient()

  // Expand query for better semantic matching
  const expandedQuery = expandQuery(query)

  // Generate embedding for the query
  const embedding = await generateEmbedding(expandedQuery)

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
    source_type: 'book' | 'blog' | 'ama'
    author: string | null
    url: string | null
  }) => ({
    id: row.id,
    content: row.content,
    similarity: row.combined_score,
    documentId: row.document_id,
    documentTitle: row.document_title,
    sourceType: row.source_type,
    author: row.author,
    pageNumber: row.page_number,
    sectionTitle: row.section_title,
    question: row.question,
    url: row.url,
  }))

  const totalTokens = chunks.reduce((sum, c) => sum + (c.content.split(' ').length * 1.3), 0)

  return { chunks, totalTokens: Math.round(totalTokens) }
}

export function formatContextForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'No relevant knowledge base content found for this query.'
  }

  return chunks
    .map((chunk, idx) => {
      const sourceInfo = formatSourceInfo(chunk)
      return `[Source ${idx + 1}] ${sourceInfo}\n${chunk.content}`
    })
    .join('\n\n---\n\n')
}

function formatSourceInfo(chunk: RetrievedChunk): string {
  const parts: string[] = []

  parts.push(`"${chunk.documentTitle}"`)

  if (chunk.author) {
    parts.push(`by ${chunk.author}`)
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
    source_type: 'book' | 'blog' | 'ama'
    author: string | null
    url: string | null
  }) => ({
    id: row.id,
    content: row.content,
    similarity: row.similarity,
    documentId: row.document_id,
    documentTitle: row.document_title,
    sourceType: row.source_type,
    author: row.author,
    pageNumber: row.page_number,
    sectionTitle: row.section_title,
    question: row.question,
    url: row.url,
  }))

  const totalTokens = chunks.reduce((sum, c) => sum + (c.content.split(' ').length * 1.3), 0)

  return { chunks, totalTokens: Math.round(totalTokens) }
}

/**
 * Shared mock builders for MCP tests.
 *
 * Every test file imports these so we get one canonical shape for the
 * mocked auth context, MCP session, retrieved chunk, and runSherpaChat
 * return value. Drift here means drift in what we believe the contract
 * is — keep this file boring.
 */

import type { McpAuthContext } from '../../auth-context'
import type { McpSession } from '../../sessions'
import type { RetrievedChunk } from '@/types/chat'
import type { Citation } from '@/types/database'

export const TEST_USER_ID = '00000000-0000-4000-8000-000000000001'
export const TEST_SESSION_ID = '11111111-1111-4111-8111-111111111111'

export function makeAuth(overrides: Partial<McpAuthContext> = {}): McpAuthContext {
  return {
    userId: TEST_USER_ID,
    email: 'test@example.com',
    scopes: ['mcp:read', 'mcp:query'],
    ...overrides,
  }
}

export function makeSession(overrides: Partial<McpSession> = {}): McpSession {
  return {
    id: TEST_SESSION_ID,
    user_id: TEST_USER_ID,
    created_at: '2026-01-01T00:00:00Z',
    last_seen_at: '2026-01-01T00:00:00Z',
    initialized: true,
    ...overrides,
  }
}

export function makeChunk(overrides: Partial<RetrievedChunk> = {}): RetrievedChunk {
  return {
    id: 'chunk-1',
    content: 'A grounded PMM principle from a trusted book.',
    similarity: 0.82,
    sourceType: 'book',
    documentTitle: 'Obviously Awesome',
    author: 'April Dunford',
    url: 'https://example.com/book',
    pageNumber: 42,
    sectionTitle: 'Positioning',
    speakerRole: null,
    question: null,
    ...overrides,
  } as RetrievedChunk
}

export function makeCitation(overrides: Partial<Citation> = {}): Citation {
  return {
    id: 'cite-1',
    source: 'Obviously Awesome',
    author: 'April Dunford',
    url: 'https://example.com/book',
    excerpt: 'A grounded PMM principle.',
    ...overrides,
  } as Citation
}

export interface SherpaChatMockResult {
  text: string
  citations: Citation[]
  chunks: RetrievedChunk[]
  usage: { inputTokens: number; outputTokens: number }
  intent: 'review' | 'generate' | 'explain' | 'compare' | 'plan' | string
}

export function makeSherpaChatResult(
  overrides: Partial<SherpaChatMockResult> = {},
): SherpaChatMockResult {
  return {
    text:
      'Here is a synthesized answer that is at least one hundred characters long so the golden snapshot has something to assert against. PMM principles include: positioning is for the buyer, not for you; differentiation is meaningless without alternatives.',
    citations: [makeCitation()],
    chunks: [makeChunk()],
    usage: { inputTokens: 1000, outputTokens: 400 },
    intent: 'explain',
    ...overrides,
  }
}

export function makeEmptyCorpusResult(): SherpaChatMockResult {
  return {
    text: '',
    citations: [],
    chunks: [],
    usage: { inputTokens: 0, outputTokens: 0 },
    intent: 'explain',
  }
}

export const ALLOWED_USAGE_GATE = {
  allowed: true as const,
  tier: 'starter' as const,
  used: 5,
  limit: 100,
}

export const DENIED_USAGE_GATE = {
  allowed: false as const,
  tier: 'free' as const,
  used: 10,
  limit: 10,
  resetAt: '2026-06-01T00:00:00Z',
  errorMessage:
    'Thanks for using PMM Sherpa. Upgrade to keep going — your free quota resets next month.',
}

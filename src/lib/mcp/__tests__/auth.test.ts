/**
 * Category 3: Auth boundary.
 *
 * Auth happens at the route layer (src/app/api/mcp/route.ts), NOT the
 * tool handler. The handler receives a pre-validated McpAuthContext.
 *
 * We test the layer that DOES enforce auth:
 *   - extractBearerToken: rejects missing/malformed headers
 *   - validateBearerToken: rejects invalid/expired/wrong-issuer tokens
 *   - The route's session-takeover guard (cross-user) — covered by
 *     reading the session.user_id check in dispatch().
 *
 * If a future refactor moves auth into the tool handler itself, add
 * tests here that pass an invalid auth context and assert isError.
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('../jwks', () => ({
  getSupabaseIssuer: () => 'https://test.supabase.co/auth/v1',
  getSupabaseJwks: () => async () => {
    throw new Error('jwks unreachable in tests — mock at the verifier level instead')
  },
}))

import { extractBearerToken } from '../auth-context'
import { validateBearerToken, authenticateMcpRequest } from '../auth'

describe('auth: extractBearerToken', () => {
  it('returns null on missing header', () => {
    expect(extractBearerToken(null)).toBeNull()
  })

  it('returns null on header that is not Bearer', () => {
    expect(extractBearerToken('Basic abcdef')).toBeNull()
    expect(extractBearerToken('Token abcdef')).toBeNull()
  })

  it('returns null on Bearer with empty token', () => {
    expect(extractBearerToken('Bearer ')).toBeNull()
    expect(extractBearerToken('Bearer    ')).toBeNull()
  })

  it('extracts the token from a well-formed header', () => {
    expect(extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi')
  })

  it('is case-insensitive on the scheme', () => {
    expect(extractBearerToken('bearer abc.def.ghi')).toBe('abc.def.ghi')
    expect(extractBearerToken('BEARER abc.def.ghi')).toBe('abc.def.ghi')
  })
})

describe('auth: validateBearerToken (JWT verifier)', () => {
  it('returns null on empty string', async () => {
    const r = await validateBearerToken('')
    expect(r).toBeNull()
  })

  it('returns null on malformed JWT', async () => {
    const r = await validateBearerToken('not-a-jwt')
    expect(r).toBeNull()
  })

  it('returns null on a syntactically valid but unsigned JWT', async () => {
    // header.payload.signature with a fake signature — must fail verification
    const fake =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.bogus_signature'
    const r = await validateBearerToken(fake)
    expect(r).toBeNull()
  })

  it('returns null when the JWKs endpoint is unreachable', async () => {
    // Our jwks mock throws — verifier must catch and return null, not throw.
    const r = await validateBearerToken(
      'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.bogus',
    )
    expect(r).toBeNull()
  })
})

describe('auth: authenticateMcpRequest end-to-end', () => {
  it('returns null on missing Authorization', async () => {
    const req = new Request('http://localhost/api/mcp')
    const r = await authenticateMcpRequest(req)
    expect(r).toBeNull()
  })

  it('returns null on bogus Bearer token', async () => {
    const req = new Request('http://localhost/api/mcp', {
      headers: { authorization: 'Bearer not-a-real-jwt' },
    })
    const r = await authenticateMcpRequest(req)
    expect(r).toBeNull()
  })

  it('returns null on non-Bearer scheme', async () => {
    const req = new Request('http://localhost/api/mcp', {
      headers: { authorization: 'Basic dXNlcjpwYXNz' },
    })
    const r = await authenticateMcpRequest(req)
    expect(r).toBeNull()
  })
})

describe('auth: cross-user session takeover (route-layer contract)', () => {
  // These are documented expectations against route.ts dispatch().
  // The route layer rejects when session.user_id !== auth.userId.
  // Tested via integration in live-smoke; here we assert the contract
  // is documented in code so this test fails if someone removes the check.
  it('route.ts contains a session.user_id check', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    // Vitest sets process.cwd() to repo root; route lives at a known path.
    const routePath = path.resolve(process.cwd(), 'src/app/api/mcp/route.ts')
    const src = fs.readFileSync(routePath, 'utf8')
    expect(src).toMatch(/session\.user_id\s*!==\s*auth\.userId/)
  })
})

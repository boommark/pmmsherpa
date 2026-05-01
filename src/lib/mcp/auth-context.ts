/**
 * Auth context shape shared between Build Agent A (transport) and
 * Build Agent B (OAuth).
 *
 * The transport extracts a Bearer token from the Authorization header
 * and hands it to validateBearerToken(). This module re-exports the
 * real JWKS-backed verifier from ./auth.ts (Build Agent B). The
 * `McpAuthContext` shape is identical to `ValidatedToken` — kept as a
 * separate name so call sites stay readable.
 */

import {
  validateBearerToken as verifyJwt,
  type ValidatedToken,
} from './auth'

export interface McpAuthContext {
  /** Supabase user_id (sub claim on the access token). */
  userId: string
  /** User email (from the email claim) — empty string if absent. */
  email: string
  /** OAuth scopes granted to this token. */
  scopes: string[]
}

/**
 * Verify a bearer token against Supabase's published JWKs and return
 * the validated identity. Returns null on any failure (expired,
 * malformed, signature mismatch, wrong issuer/audience, JWKs unreachable).
 *
 * Delegates to `validateBearerToken` in ./auth.ts. ValidatedToken and
 * McpAuthContext are structurally identical, so this is a 1:1 pass-through.
 */
export async function validateBearerToken(
  token: string,
): Promise<McpAuthContext | null> {
  const validated: ValidatedToken | null = await verifyJwt(token)
  if (!validated) return null
  return {
    userId: validated.userId,
    email: validated.email,
    scopes: validated.scopes,
  }
}

/**
 * Extract the bearer token from an Authorization header. Returns null
 * if the header is missing or not in the form `Bearer <token>`.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  if (!authHeader.toLowerCase().startsWith('bearer ')) return null
  const token = authHeader.slice(7).trim()
  return token.length > 0 ? token : null
}

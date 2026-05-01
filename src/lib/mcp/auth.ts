/**
 * Bearer-token validation for MCP requests.
 *
 * Verifies a Supabase-issued JWT against Supabase's published JWKs. We do
 * NOT reissue tokens — `validateBearerToken` returns the user identity
 * encoded in the existing token, and the route handler uses that to
 * authorize tool calls.
 *
 * Replaces the temporary stub Build Agent A wired into /api/mcp/route.ts.
 */

import { jwtVerify, errors as joseErrors } from 'jose'
import { getSupabaseIssuer, getSupabaseJwks } from './jwks'

export interface ValidatedToken {
  userId: string
  email: string
  scopes: string[]
}

/**
 * Verify a bearer token. Returns the validated identity on success, `null`
 * on any failure (expired, malformed, signature mismatch, wrong issuer or
 * audience). Callers should respond 401 with a `WWW-Authenticate: Bearer`
 * header pointing at the protected-resource metadata document.
 */
export async function validateBearerToken(
  token: string,
): Promise<ValidatedToken | null> {
  if (!token || typeof token !== 'string') return null

  try {
    const { payload } = await jwtVerify(token, getSupabaseJwks(), {
      issuer: getSupabaseIssuer(),
      audience: 'authenticated',
    })

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      return null
    }

    const scopeClaim = typeof payload.scope === 'string' ? payload.scope : ''
    const scopes = scopeClaim
      ? scopeClaim.split(' ').filter(Boolean)
      : ['mcp:read', 'mcp:query']

    return {
      userId: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : '',
      scopes,
    }
  } catch (err) {
    // Don't leak which check failed externally — log for diagnostics only.
    if (
      err instanceof joseErrors.JWTExpired ||
      err instanceof joseErrors.JWTClaimValidationFailed ||
      err instanceof joseErrors.JWSSignatureVerificationFailed ||
      err instanceof joseErrors.JWSInvalid ||
      err instanceof joseErrors.JWTInvalid
    ) {
      return null
    }
    // JWKs unreachable, etc — surface as null; route handler converts to 401.
    console.error('[mcp/auth] token verification failed', err)
    return null
  }
}

/**
 * Convenience: extract + validate a bearer token from a Request's
 * Authorization header.
 */
export async function authenticateMcpRequest(
  req: Request,
): Promise<ValidatedToken | null> {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) return null
  const token = auth.slice(7).trim()
  return validateBearerToken(token)
}

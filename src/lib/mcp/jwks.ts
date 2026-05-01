/**
 * JWKs fetcher with 1-hour in-memory cache.
 *
 * We point at Supabase's own JWKs endpoint so we can verify Supabase-issued
 * access tokens directly — we are wrapping Supabase Auth, not minting our
 * own JWTs.
 *
 * `jose`'s createRemoteJWKSet already implements the cache + cooldown
 * behaviour we want; this module is the single import point so callers
 * don't accidentally instantiate multiple key sets.
 */

import { createRemoteJWKSet } from 'jose'

let cached: ReturnType<typeof createRemoteJWKSet> | null = null

export function getSupabaseJwks() {
  if (cached) return cached

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set — cannot build JWKs URL')
  }

  cached = createRemoteJWKSet(
    new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    {
      // jose caches by default. Make the intent explicit:
      cacheMaxAge: 60 * 60 * 1000, // 1 hour
      cooldownDuration: 30 * 1000, // 30s between forced re-fetches
    },
  )
  return cached
}

export function getSupabaseIssuer(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  return `${supabaseUrl}/auth/v1`
}

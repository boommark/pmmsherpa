/**
 * PKCE (RFC 7636) helpers and signed-cookie utilities for the MCP OAuth flow.
 *
 * - `verifyPkce` checks SHA256(verifier) base64url == challenge for S256.
 * - `signPayload` / `verifySignedPayload` are HMAC-SHA256 wrappers used to
 *   stash short-lived OAuth state in an HTTP-only cookie during the
 *   /authorize → Supabase → /callback round trip.
 */

const encoder = new TextEncoder()

function base64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const bin = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let str = ''
  for (let i = 0; i < bin.length; i++) str += String.fromCharCode(bin[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export async function sha256(input: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', encoder.encode(input))
}

export async function s256Challenge(verifier: string): Promise<string> {
  return base64urlEncode(await sha256(verifier))
}

export async function verifyPkce(
  verifier: string,
  expectedChallenge: string,
  method: string = 'S256',
): Promise<boolean> {
  if (method !== 'S256') return false
  if (!verifier || verifier.length < 43 || verifier.length > 128) return false
  const computed = await s256Challenge(verifier)
  return timingSafeEqual(computed, expectedChallenge)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/* ------------------------------------------------------------------ */
/*  HMAC-signed cookie payloads                                        */
/* ------------------------------------------------------------------ */

function getSigningSecret(): string {
  const secret =
    process.env.SUPABASE_JWT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    throw new Error(
      'Cannot sign MCP OAuth cookie — neither SUPABASE_JWT_SECRET nor SUPABASE_SERVICE_ROLE_KEY is set',
    )
  }
  return secret
}

async function getSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSigningSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signPayload<T>(payload: T): Promise<string> {
  const json = JSON.stringify(payload)
  const body = base64urlEncode(encoder.encode(json))
  const sig = await crypto.subtle.sign(
    'HMAC',
    await getSigningKey(),
    encoder.encode(body),
  )
  return `${body}.${base64urlEncode(sig)}`
}

export async function verifySignedPayload<T>(token: string): Promise<T | null> {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  try {
    const sigBytes = base64urlDecode(sig)
    // Allocate a fresh ArrayBuffer (not SharedArrayBuffer) so the WebCrypto
    // BufferSource type-check is satisfied under strict TS.
    const sigBuf = new ArrayBuffer(sigBytes.byteLength)
    new Uint8Array(sigBuf).set(sigBytes)
    const ok = await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(),
      sigBuf,
      encoder.encode(body),
    )
    if (!ok) return null
    const json = new TextDecoder().decode(base64urlDecode(body))
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  Opaque code generator                                              */
/* ------------------------------------------------------------------ */

/** Generate a 32-byte URL-safe random opaque code (auth code, client_id, etc). */
export function generateOpaqueCode(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64urlEncode(bytes)
}

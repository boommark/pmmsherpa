/**
 * RFC 8252 §7.3 loopback redirect_uri matching.
 *
 * Regression coverage for the Codex CLI MCP install bug: a native client
 * registers `http://127.0.0.1:<portA>/callback` but authorizes/exchanges on
 * `http://127.0.0.1:<portB>/callback`. The authorization server must match
 * those as equivalent (port ignored for loopback) while keeping exact
 * matching for stable web/desktop redirects.
 */

import { describe, it, expect } from 'vitest'
import { redirectUriEquals, redirectUriMatches } from '../redirect-uri'

describe('redirectUriEquals — loopback (RFC 8252 §7.3)', () => {
  it('matches loopback URIs that differ only by port', () => {
    expect(
      redirectUriEquals(
        'http://127.0.0.1:51111/callback',
        'http://127.0.0.1:62222/callback',
      ),
    ).toBe(true)
  })

  it('matches loopback URIs with a stable path segment but different port', () => {
    expect(
      redirectUriEquals(
        'http://127.0.0.1:51111/callback/abc123',
        'http://127.0.0.1:62222/callback/abc123',
      ),
    ).toBe(true)
  })

  it('treats localhost and ::1 as loopback hosts', () => {
    expect(
      redirectUriEquals('http://localhost:5000/cb', 'http://localhost:6000/cb'),
    ).toBe(true)
    expect(
      redirectUriEquals('http://[::1]:5000/cb', 'http://[::1]:6000/cb'),
    ).toBe(true)
  })

  it('still requires the path to match for loopback', () => {
    expect(
      redirectUriEquals(
        'http://127.0.0.1:51111/callback/abc',
        'http://127.0.0.1:62222/callback/xyz',
      ),
    ).toBe(false)
  })

  it('still requires the scheme to match for loopback', () => {
    expect(
      redirectUriEquals('http://127.0.0.1:5000/cb', 'https://127.0.0.1:6000/cb'),
    ).toBe(false)
  })

  it('still requires the query string to match for loopback', () => {
    expect(
      redirectUriEquals(
        'http://127.0.0.1:5000/cb?x=1',
        'http://127.0.0.1:6000/cb?x=2',
      ),
    ).toBe(false)
  })

  it('does not pair a loopback registration with a non-loopback candidate', () => {
    expect(
      redirectUriEquals('http://127.0.0.1:5000/cb', 'http://evil.example/cb'),
    ).toBe(false)
    expect(
      redirectUriEquals('http://evil.example:5000/cb', 'http://127.0.0.1:6000/cb'),
    ).toBe(false)
  })
})

describe('redirectUriEquals — non-loopback (exact match)', () => {
  it('matches identical stable redirects (e.g. Claude)', () => {
    expect(
      redirectUriEquals(
        'https://claude.ai/api/mcp/auth_callback',
        'https://claude.ai/api/mcp/auth_callback',
      ),
    ).toBe(true)
  })

  it('rejects a different port on a non-loopback host', () => {
    expect(
      redirectUriEquals('https://app.example/cb', 'https://app.example:8443/cb'),
    ).toBe(false)
  })

  it('matches custom-scheme redirects exactly', () => {
    expect(redirectUriEquals('cursor://callback', 'cursor://callback')).toBe(true)
    expect(redirectUriEquals('cursor://callback', 'cursor://other')).toBe(false)
  })

  it('returns false for unparseable URIs that are not byte-identical', () => {
    expect(redirectUriEquals('not a uri', 'also not a uri')).toBe(false)
    // identical garbage still matches via the fast exact-string path
    expect(redirectUriEquals('not a uri', 'not a uri')).toBe(true)
  })
})

describe('redirectUriMatches', () => {
  it('matches against any entry in the registered list (loopback port-flexible)', () => {
    const registered = [
      'https://claude.ai/api/mcp/auth_callback',
      'http://127.0.0.1:51111/callback',
    ]
    expect(redirectUriMatches(registered, 'http://127.0.0.1:62222/callback')).toBe(
      true,
    )
    expect(
      redirectUriMatches(registered, 'https://claude.ai/api/mcp/auth_callback'),
    ).toBe(true)
  })

  it('returns false when nothing in the list matches', () => {
    expect(
      redirectUriMatches(
        ['http://127.0.0.1:51111/callback'],
        'http://127.0.0.1:62222/different',
      ),
    ).toBe(false)
  })

  it('returns false for an empty registration list', () => {
    expect(redirectUriMatches([], 'http://127.0.0.1:5000/cb')).toBe(false)
  })
})
